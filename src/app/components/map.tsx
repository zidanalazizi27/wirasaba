"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  GeoJSON,
  useMap,
} from "react-leaflet";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import DateRangeIcon from "@mui/icons-material/DateRange";
import MapIcon from "@mui/icons-material/Map";
import RoomIcon from "@mui/icons-material/Room";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Input } from "antd";
import { Transition } from "@headlessui/react";
import CountUp from "react-countup";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
// Import diletakkan di sini untuk memastikan dimuat hanya di sisi klien
// Leaflet.heat akan diimpor secara dinamis dalam komponen

const { Search } = Input;

const HeaderButtons = () => {
  const onSearch = (value) => {
    console.log("Search:", value);
  };
};

// Custom SVG Marker
const markerIcon = new L.Icon({
  iconUrl: "/image/iconMarker.svg",
  iconSize: [30, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -30],
});

// Warna poligon berdasarkan kepadatan perusahaan
const getColor = (density: number) => {
  return density > 200
    ? "#993404"
    : density > 160
      ? "#d95f0e"
      : density > 120
        ? "#fe9929"
        : density > 80
          ? "#fec44f"
          : density > 40
            ? "#fee391"
            : density > 0
              ? "#ffffd4"
              : "#cccccc"; // Default color for zero
};

// Fungsi untuk normalisasi kode kecamatan (untuk number/integer)
const normalizeKecamatanCode = (code) => {
  if (code === null || code === undefined) return null;

  // Pastikan code adalah number
  return parseInt(code, 10);
};

// Komponen untuk menginisialisasi Leaflet.heat
const HeatLayerInitializer = () => {
  const map = useMap();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadHeatPlugin = async () => {
        try {
          await import("leaflet.heat");
          console.log("Leaflet.heat initialized successfully");
        } catch (error) {
          console.error("Failed to load Leaflet.heat:", error);
        }
      };

      loadHeatPlugin();
    }
  }, [map]);

  return null;
};

// Komponen HeatmapLayer untuk menampilkan heatmap
const HeatmapLayer = ({ points, options, visible }) => {
  const map = useMap();
  const heatRef = useRef(null);

  useEffect(() => {
    if (!map || points.length === 0) return;

    // Pastikan L.heatLayer tersedia
    if (!L.heatLayer) {
      console.error(
        "L.heatLayer is not available. Make sure leaflet.heat is properly loaded."
      );
      return;
    }

    // Buat atau update heatmap layer
    if (visible) {
      if (!heatRef.current) {
        // Buat layer baru jika belum ada
        heatRef.current = L.heatLayer(points, options).addTo(map);
      } else {
        // Jika sudah ada, update data points
        heatRef.current.setLatLngs(points);
      }
    } else if (heatRef.current) {
      // Hapus layer jika tidak visible
      map.removeLayer(heatRef.current);
      heatRef.current = null;
    }

    // Cleanup ketika komponen unmount
    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
        heatRef.current = null;
      }
    };
  }, [map, points, options, visible]);

  return null;
};

const MapComponent = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState({
    choropleth: false,
    titik: true, // Set menjadi true untuk menampilkan titik saat halaman dimuat
    heatmap: false, // Tambahkan state untuk heatmap
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    besar: 0,
    sedang: 0,
  });

  // Tambahkan state untuk menyimpan jumlah perusahaan per kecamatan berdasarkan filter
  const [kecamatanCompanyCounts, setKecamatanCompanyCounts] = useState({});

  // Reference untuk layer GeoJSON
  const geoJsonLayerRef = useRef(null);

  // Tambahkan state untuk mengontrol tooltip
  const [pieActiveIndex, setPieActiveIndex] = useState(null);
  const [barActiveIndex, setBarActiveIndex] = useState(null);

  // Tambahkan state untuk filter
  const [filters, setFilters] = useState({
    year: "2024", // Default tahun
    district: "0", // 0 berarti semua kecamatan
    kbliCategory: "kbli_all", // Default semua kategori KBLI
    businessType: "0", // 0 berarti semua badan usaha
    location: "0", // 0 berarti semua lokasi
  });

  // Tambahkan state untuk menyimpan tahun unik
  const [uniqueYears, setUniqueYears] = useState([]);

  // State untuk data direktori dan kecamatan
  const [directories, setDirectories] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Tambahkan state untuk pencarian
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);

  // State untuk menyimpan data points heatmap
  const [heatmapPoints, setHeatmapPoints] = useState([]);

  // Create a key for GeoJSON to force re-render when selectedLayers changes
  const [geoJsonKey, setGeoJsonKey] = useState(0);

  // Fungsi untuk menghitung jumlah perusahaan per kecamatan berdasarkan filter
  const countCompaniesByKecamatan = useCallback(
    (filteredComps) => {
      console.log(
        "Starting countCompaniesByKecamatan with",
        filteredComps.length,
        "companies"
      );

      // Inisialisasi objek untuk menyimpan jumlah per kecamatan
      const counts = {};

      // Log untuk debugging
      if (filteredComps.length > 0) {
        console.log("Sample companies:");
        filteredComps.slice(0, 3).forEach((company) => {
          console.log(
            `Company ${company.nama_perusahaan || company.id_perusahaan}, kec=${company.kec}, type=${typeof company.kec}`
          );
        });
      }

      // Hitung jumlah perusahaan per kecamatan
      filteredComps.forEach((company) => {
        if (company.kec !== null && company.kec !== undefined) {
          // Pastikan kec adalah number
          const kecCode =
            typeof company.kec === "number"
              ? company.kec
              : parseInt(company.kec, 10);

          if (!isNaN(kecCode)) {
            // Tambahkan ke objek counts - pastikan nilai sebelumnya ada
            counts[kecCode] = (counts[kecCode] || 0) + 1;
          }
        }
      });

      // Pastikan semua kecamatan memiliki entri, meskipun kosong
      // Ambil data kecamatan dari database jika tersedia
      if (geoJsonData && geoJsonData.features) {
        geoJsonData.features.forEach((feature) => {
          if (feature.properties && feature.properties.kode_kec !== undefined) {
            const kecCode = parseInt(feature.properties.kode_kec, 10);
            if (!isNaN(kecCode) && counts[kecCode] === undefined) {
              counts[kecCode] = 0;
            }
          }
        });
      }

      console.log("Final kecamatan counts:", counts);
      return counts;
    },
    [geoJsonData]
  );

  // Styling GeoJSON Polygons with dynamic colors based on filtered data
  const getStyle = useCallback(
    (feature) => {
      // Defensive check
      if (!feature || !feature.properties) {
        console.error("Invalid feature or missing properties", feature);
        return {
          fillColor: "#cccccc",
          weight: 2,
          opacity: 1,
          color: "black",
          dashArray: "3",
          fillOpacity: selectedLayers.choropleth ? 0.7 : 0,
        };
      }

      // Pastikan kode_kec konsisten (integer)
      const kecamatanCode = parseInt(feature.properties.kode_kec, 10);

      // Safer lookup, dengan fallback ke 0
      const count = !isNaN(kecamatanCode)
        ? kecamatanCompanyCounts[kecamatanCode] || 0
        : 0;

      // Log untuk debugging
      console.log(
        `Styling ${feature.properties.label}, kode_kec=${kecamatanCode} (${typeof kecamatanCode}), count=${count}`
      );

      return {
        fillColor: getColor(count),
        weight: 2,
        opacity: 1,
        color: "black",
        dashArray: "3",
        fillOpacity: selectedLayers.choropleth ? 0.7 : 0,
      };
    },
    [kecamatanCompanyCounts, selectedLayers.choropleth]
  );

  // Handle perubahan checkbox
  const handleLayerChange = (layer) => {
    setSelectedLayers((prev) => {
      const newState = { ...prev };

      // Jika layer yang diaktifkan adalah heatmap atau choropleth
      if (layer === "heatmap" || layer === "choropleth") {
        // Toggle layer yang diklik
        newState[layer] = !prev[layer];

        // Jika layer yang diklik diaktifkan, matikan layer lainnya
        if (!prev[layer]) {
          if (layer === "heatmap") {
            newState.choropleth = false; // Matikan choropleth jika heatmap diaktifkan
          } else if (layer === "choropleth") {
            newState.heatmap = false; // Matikan heatmap jika choropleth diaktifkan

            // Jika choropleth diaktifkan, rekalkulasi data kecamatan
            if (companies.length > 0) {
              const counts = countCompaniesByKecamatan(filteredCompanies);
              setKecamatanCompanyCounts(counts);
            }
          }
        }
      } else {
        // Untuk layer lain (titik), lakukan toggle biasa
        newState[layer] = !prev[layer];
      }

      return newState;
    });
  };

  // Update GeoJsonKey when selectedLayers changes to force re-render
  useEffect(() => {
    setGeoJsonKey((prevKey) => prevKey + 1);
  }, [selectedLayers]);

  // Modifikasi useEffect untuk mengambil GeoJSON
  useEffect(() => {
    fetch("/data/polygon_wilayah.geojson")
      .then((response) => response.json())
      .then((result) => {
        console.log("Raw GeoJSON response:", result);

        // Deteksi apakah data dalam format yang benar
        if (result.data && Array.isArray(result.data)) {
          console.log(
            "Processing GeoJSON data array with length:",
            result.data.length
          );

          // Flatten semua features dari berbagai FeatureCollection
          const allFeatures = [];
          result.data.forEach((featureCollection, index) => {
            console.log(
              `Processing FeatureCollection ${index} (${featureCollection.name || "unnamed"}):`
            );

            if (
              featureCollection.features &&
              Array.isArray(featureCollection.features)
            ) {
              featureCollection.features.forEach((feature) => {
                // Log untuk debugging
                if (feature.properties) {
                  console.log(
                    `Found feature: ${feature.properties.label}, kode_kec=${feature.properties.kode_kec}`
                  );
                  // Pastikan kode_kec ada dan dalam format yang konsisten
                  if (feature.properties.kode_kec !== undefined) {
                    // Simpan feature dengan properti yang sudah diverifikasi
                    allFeatures.push(feature);
                  } else {
                    console.error("Feature missing kode_kec:", feature);
                  }
                } else {
                  console.error("Feature missing properties:", feature);
                }
              });
            } else {
              console.warn(
                `FeatureCollection ${index} has no valid features array`
              );
            }
          });

          // Buat satu FeatureCollection dengan semua features
          const combinedGeoJSON = {
            type: "FeatureCollection",
            features: allFeatures,
          };

          console.log("Combined GeoJSON features count:", allFeatures.length);
          setGeoJsonData(combinedGeoJSON);
        } else {
          console.log("GeoJSON already in correct format");
          setGeoJsonData(result);
        }
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
        setError("Failed to load map data");
      });
  }, []);

  // Fetch data perusahaan dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch perusahaan data
        const companiesResponse = await fetch("/api/perusahaan");
        if (!companiesResponse.ok) {
          throw new Error(`HTTP error! Status: ${companiesResponse.status}`);
        }
        const companiesResult = await companiesResponse.json();

        // Fetch data direktori
        const directoriesResponse = await fetch("/api/direktori");
        if (!directoriesResponse.ok) {
          throw new Error(`HTTP error! Status: ${directoriesResponse.status}`);
        }
        const directoriesResult = await directoriesResponse.json();

        // Fetch data kecamatan
        const districtsResponse = await fetch("/api/kecamatan");
        if (!districtsResponse.ok) {
          throw new Error(`HTTP error! Status: ${districtsResponse.status}`);
        }
        const districtsResult = await districtsResponse.json();

        if (
          companiesResult.success &&
          directoriesResult.success &&
          districtsResult.success
        ) {
          setCompanies(companiesResult.data);
          setDirectories(directoriesResult.data);
          setDistricts(districtsResult.data);
          setFilteredCompanies(companiesResult.data); // Set initially all companies

          // Ekstrak tahun-tahun unik dari data direktori
          const years = directoriesResult.data
            .map((dir) => dir.thn_direktori.toString())
            .filter((year, index, self) => self.indexOf(year) === index) // Filter untuk mendapatkan nilai unik
            .sort((a, b) => b - a); // Urutkan secara descending (terbaru dulu)

          setUniqueYears(years);

          // Hitung statistik
          const total = companiesResult.count;
          const besar = companiesResult.data.filter(
            (company) => company.skala === "Besar" || company.skala === "besar"
          ).length;
          const sedang = companiesResult.data.filter(
            (company) =>
              company.skala === "Sedang" || company.skala === "sedang"
          ).length;

          setStatistics({
            total,
            besar,
            sedang,
          });

          // Persiapkan data untuk heatmap dengan intensitas yang lebih tinggi
          const points = companiesResult.data
            .filter((company) => company.lat && company.lon) // Filter data yang memiliki koordinat
            .map((company) => {
              // Tingkatkan intensitas untuk membuat heatmap lebih terlihat
              const intensity =
                company.skala === "Besar" || company.skala === "besar"
                  ? 1.0
                  : 0.7;
              return [company.lat, company.lon, intensity];
            });

          setHeatmapPoints(points);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tambahkan useEffect untuk melakukan filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Jika tidak ada pencarian, gunakan semua perusahaan
      setFilteredCompanies(companies);
      return;
    }

    // Lakukan pencarian (tidak case-sensitive dan partial match)
    const filtered = companies.filter((company) => {
      const nameMatch =
        company.nama_perusahaan &&
        company.nama_perusahaan
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const productMatch =
        company.produk &&
        company.produk.toLowerCase().includes(searchTerm.toLowerCase());

      return nameMatch || productMatch;
    });

    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  // Pastikan jumlah perusahaan dihitung ketika data perusahaan dan GeoJSON tersedia
  useEffect(() => {
    if (companies.length > 0 && geoJsonData) {
      console.log(
        "Initializing kecamatanCompanyCounts with all companies and GeoJSON"
      );
      const initialCounts = countCompaniesByKecamatan(companies);
      setKecamatanCompanyCounts(initialCounts);
    }
  }, [companies, geoJsonData, countCompaniesByKecamatan]);

  // Pastikan peta direfresh ketika kecamatanCompanyCounts berubah
  useEffect(() => {
    if (Object.keys(kecamatanCompanyCounts).length > 0) {
      console.log("kecamatanCompanyCounts updated, incrementing geoJsonKey");
      setGeoJsonKey((prevKey) => prevKey + 1);
    }
  }, [kecamatanCompanyCounts]);

  // Gunakan useEffect untuk memonitor nilai kecamatanCompanyCounts
  useEffect(() => {
    console.log("kecamatanCompanyCounts updated:", kecamatanCompanyCounts);
  }, [kecamatanCompanyCounts]);

  // Fungsi pencarian
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Function to update the GeoJSON popups with dynamic data
  const updateGeoJsonPopups = useCallback(() => {
    if (!geoJsonLayerRef.current) return;

    // Get the GeoJSON layer
    const geoJsonLayer = geoJsonLayerRef.current;

    // For each layer in the GeoJSON (each kecamatan polygon)
    geoJsonLayer.eachLayer((layer) => {
      const properties = layer.feature.properties;

      // Pastikan kode_kec dikonversi ke integer
      const kecamatanCode = parseInt(properties.kode_kec, 10);

      // Gunakan integer sebagai kunci
      const filteredCount = isNaN(kecamatanCode)
        ? 0
        : kecamatanCompanyCounts[kecamatanCode] || 0;

      // Update the popup content
      layer.bindPopup(`
        <div style="font-size: 14px; line-height: 1.5;">
          <b>${properties.label}</b><br/>
          <strong>Luas Wilayah:</strong> ${properties.luas} KM²<br/>
          <strong>Jumlah Desa:</strong> ${properties.desa}<br/>
          <strong>Jumlah Kelurahan:</strong> ${properties.kelurahan}<br/>
          <strong>Jumlah Perusahaan:</strong> ${filteredCount}
        </div>
      `);
    });
  }, [kecamatanCompanyCounts]);

  // Update GeoJSON popups when kecamatanCompanyCounts changes
  useEffect(() => {
    updateGeoJsonPopups();
  }, [kecamatanCompanyCounts, updateGeoJsonPopups]);

  // Fungsi untuk menerapkan semua filter
  const applyFilters = useCallback(() => {
    if (!companies.length) return;

    // Filter perusahaan berdasarkan kriteria
    let filtered = [...companies];

    // 1. Filter berdasarkan tahun direktori
    if (filters.year !== "all") {
      const companiesInYear = directories
        .filter((dir) => dir.thn_direktori.toString() === filters.year)
        .map((dir) => dir.id_perusahaan);

      filtered = filtered.filter((company) =>
        companiesInYear.includes(company.id_perusahaan)
      );
    }

    // 2. Filter berdasarkan kecamatan
    if (filters.district !== "0") {
      filtered = filtered.filter(
        (company) => company.kec.toString() === filters.district
      );
    }

    // 3. Filter berdasarkan kategori KBLI (2 digit awal)
    if (filters.kbliCategory !== "kbli_all") {
      const kbliPrefix = filters.kbliCategory.replace("kbli_", "");
      filtered = filtered.filter((company) => {
        // Pastikan KBLI ada dan konversi ke string
        const kbli = company.KBLI ? company.KBLI.toString() : "";
        // Ambil 2 digit awal
        const kbliCategory = kbli.substring(0, 2);
        return kbliCategory === kbliPrefix;
      });
    }

    // 4. Filter berdasarkan badan usaha
    if (filters.businessType !== "0") {
      filtered = filtered.filter(
        (company) => company.badan_usaha.toString() === filters.businessType
      );
    }

    // 5. Filter berdasarkan lokasi perusahaan
    if (filters.location !== "0") {
      filtered = filtered.filter(
        (company) => company.lok_perusahaan.toString() === filters.location
      );
    }

    // 6. Terapkan juga filter pencarian jika ada
    if (searchTerm.trim()) {
      filtered = filtered.filter((company) => {
        const nameMatch =
          company.nama_perusahaan &&
          company.nama_perusahaan
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const productMatch =
          company.produk &&
          company.produk.toLowerCase().includes(searchTerm.toLowerCase());

        return nameMatch || productMatch;
      });
    }

    // Update filteredCompanies state
    setFilteredCompanies(filtered);

    // Hitung jumlah perusahaan per kecamatan berdasarkan filter yang diterapkan
    const counts = countCompaniesByKecamatan(filtered);
    setKecamatanCompanyCounts(counts);

    // Update heatmap points
    const points = filtered
      .filter((company) => company.lat && company.lon)
      .map((company) => {
        const intensity =
          company.skala === "Besar" || company.skala === "besar" ? 1.0 : 0.7;
        return [company.lat, company.lon, intensity];
      });

    setHeatmapPoints(points);
  }, [companies, directories, filters, searchTerm, countCompaniesByKecamatan]);

  // Panggil applyFilters setiap kali filter berubah
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Data untuk pie chart
  const data_pie = [
    { name: "Besar", value: statistics.besar },
    { name: "Sedang", value: statistics.sedang },
  ];

  const COLORS = ["#74512D", "#AF8F6F"];

  // Function to get KBLI category name
  const getKBLICategory = (kbliCode) => {
    const category = kbliCode.substring(0, 2);
    const categories = {
      "10": "Industri makanan",
      "11": "Industri minuman",
      "12": "Industri pengolahan tembakau",
      "13": "Industri tekstil",
      "14": "Industri pakaian jadi",
      "15": "Industri kulit, barang dari kulit dan alas kaki",
      "16": "Industri kayu, barang dari kayu, gabus dan barang anyaman",
      "17": "Industri kertas dan barang dari kertas",
      "18": "Industri percetakan dan reproduksi media rekaman",
      "19": "Industri produk dari batubara dan pengilangan minyak bumi",
      "20": "Industri bahan kimia dan barang dari bahan kimia",
      "21": "Industri farmasi, produk obat kimia dan obat tradisional",
      "22": "Industri karet, barang dari karet dan plastik",
      "23": "Industri barang galian bukan logam",
      "24": "Industri logam dasar",
      "25": "Industri barang logam, bukan mesin dan peralatannya",
      "26": "Industri computer, barang elektronik dan optik",
      "27": "Industri peralatan listrik",
      "28": "Industri mesin dan perlengkapan ytdl",
      "29": "Industri kendaraan bermotor, trailer dan semi trailer",
      "30": "Industri alat angkut lainnya",
      "31": "Industri furniture",
      "32": "Industri pengolahan lainnya",
      "33": "Jasa reparasi dan pemasangan mesin dan peralatan",
    };

    return categories[category] || "Kategori Lainnya";
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] font-roboto">
      <div className="absolute top-0 left-0 z-0 w-full h-full">
        <MapContainer
          className="w-full h-full"
          center={[-7.4559741, 112.6608877]}
          zoom={11}
          scrollWheelZoom={true}
        >
          {/* 🔹 Layer Control untuk Opsi Peta */}
          <LayersControl position="bottomleft">
            <LayersControl.BaseLayer name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="ESRI Imagery">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">ESRI</a>'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Google Street">
              <TileLayer
                url="https://mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked name="Google Satellite">
              <TileLayer
                url="https://mt.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Inisialisasi plugin Leaflet.heat */}
          <HeatLayerInitializer />

          {/* Tambahkan HeatmapLayer dengan konfigurasi yang dioptimalkan */}
          {heatmapPoints.length > 0 && (
            <HeatmapLayer
              points={heatmapPoints}
              options={{
                radius: 25, // Meningkatkan radius untuk cakupan area lebih luas
                blur: 10, // Meningkatkan blur untuk transisi lebih halus
                maxZoom: 15, // Menurunkan maxZoom agar heatmap tetap terlihat saat zoom in
                max: 0.8, // Menurunkan nilai maksimum untuk mempertegas visualisasi
                minOpacity: 0.4, // Tambahkan nilai minimum opacity agar tetap terlihat
                gradient: {
                  0.4: "blue",
                  0.6: "cyan",
                  0.7: "lime",
                  0.8: "yellow",
                  1.0: "red",
                },
              }}
              visible={selectedLayers.heatmap}
            />
          )}

          {/* 🔹 Tambahkan Layer GeoJSON dengan reference */}
          {geoJsonData && (
            <GeoJSON
              key={`geojson-${geoJsonKey}-${Object.keys(kecamatanCompanyCounts).length}`}
              data={geoJsonData}
              style={getStyle}
              ref={geoJsonLayerRef}
              onEachFeature={(feature, layer) => {
                if (feature.properties) {
                  const { label, luas, desa, kelurahan, kode_kec } =
                    feature.properties;
                  const kecCode = parseInt(kode_kec, 10);
                  const count = !isNaN(kecCode)
                    ? kecamatanCompanyCounts[kecCode] || 0
                    : 0;

                  layer.bindPopup(`
                    <div style="font-size: 14px; line-height: 1.5;">
                      <b>${label}</b><br/>
                      <strong>Luas Wilayah:</strong> ${luas} KM²<br/>
                      <strong>Jumlah Desa:</strong> ${desa}<br/>
                      <strong>Jumlah Kelurahan:</strong> ${kelurahan}<br/>
                      <strong>Jumlah Perusahaan:</strong> ${count}
                    </div>
                  `);
                }
              }}
            />
          )}

          {/* 🔹 Marker Lokasi Pabrik dari Database */}
          {selectedLayers.titik &&
            !loading &&
            filteredCompanies.length > 0 &&
            filteredCompanies.map((company) => {
              // Fungsi untuk memformat URL
              const formatUrl = (url) => {
                if (!url || url.trim() === "") return null;

                // Tambahkan http:// jika belum ada
                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                  return "http://" + url;
                }
                return url;
              };

              // Format URL website
              const websiteUrl = formatUrl(company.web_perusahaan);

              return (
                <Marker
                  key={company.id_perusahaan}
                  position={[company.lat, company.lon] as L.LatLngExpression}
                  icon={markerIcon}
                >
                  <Popup>
                    <div className="max-w-[260px] font-roboto p-0.5">
                      <h3 className="font-bold text-xs mb-2.5 text-center border-b border-gray-200 pb-0.5">
                        Informasi Perusahaan
                      </h3>

                      <table className="w-full text-xs">
                        <tbody>
                          <tr>
                            <td className="pr-1 pb-0.5">Nama Usaha</td>
                            <td className="pr-1 pb-0.5">
                              : {company.nama_perusahaan || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Alamat</td>
                            <td className="pr-1 pb-0.5">
                              : {company.alamat || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Kecamatan</td>
                            <td className="pr-1 pb-0.5">
                              : {company.nama_kec || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Desa</td>
                            <td className="pr-1 pb-0.5">
                              : {company.nama_des || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Badan Usaha</td>
                            <td className="pr-1 pb-0.5">
                              : {company.badan_usaha_nama || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Skala</td>
                            <td className="pr-1 pb-0.5">
                              : {company.skala || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Kode KBLI</td>
                            <td className="pr-1 pb-0.5">
                              : {company.KBLI || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Produk</td>
                            <td className="pr-1 pb-0.5">
                              : {company.produk || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Telepon</td>
                            <td className="pr-1 pb-0.5">
                              : {company.telp_perusahaan || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Email</td>
                            <td className="pr-1 pb-0.5">
                              : {company.email_perusahaan || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Website</td>
                            <td className="pr-1 pb-0.5">
                              :{" "}
                              {websiteUrl ? (
                                <a
                                  href={websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 underline"
                                  onClick={(e) => {
                                    // Mencegah popup tertutup saat link diklik
                                    e.stopPropagation();
                                  }}
                                >
                                  {company.web_perusahaan}
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="text-center mt-2.5">
                        <button
                          className="bg-gray-800 text-white px-5 py-1 border-none rounded cursor-pointer text-sm"
                          onClick={() =>
                            console.log(`Detail untuk ${company.id_perusahaan}`)
                          }
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      {/* Container untuk Elemen di Atas */}
      <div className="mx-[5%] relative flex justify-between items-center top-4">
        {/* Tombol Statistik */}
        <button
          className="flex items-center justify-center bg-[#ffffff] text-cdark rounded-xl shadow-md font-semibold 
        w-10 h-10 md:w-auto md:h-auto px-4 py-1"
          onClick={() => setIsStatisticsOpen(!isStatisticsOpen)}
        >
          <InsightsOutlinedIcon className="text-xl" />
          <span className="hidden md:inline ml-2 text-2xs">Statistik</span>
        </button>

        {/* popup statistik */}
        <Transition
          show={isStatisticsOpen}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 transform scale-95"
          enterTo="opacity-100 transform scale-100"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100 transform scale-100"
          leaveTo="opacity-0 transform scale-95"
          className="absolute top-full left-0 z-30 w-72 max-h-[77vh] p-3 bg-[#ffffff] rounded-md shadow-md text-cdark mt-2 overflow-y-auto"
        >
          <div>
            {/* 1. Bagian lokasi dengan nilai yang berubah sesuai kecamatan */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <RoomIcon className="text-xl" />
              <span className="text-sm font-semibold">
                {filters.district !== "0"
                  ? districts.find(
                      (d) => d.kode_kec.toString() === filters.district
                    )?.nama_kec
                  : "Kabupaten Sidoarjo"}
              </span>
            </div>

            {/* 2. Bagian Jumlah perusahaan */}
            <div className="mt-2 block w-full pl-3 pr-3 py-2 text-base border-gray-600 bg-[#EEF0F2] text-cdark rounded-md">
              <div className="flex items-center justify-center">
                <CountUp
                  start={0}
                  end={filteredCompanies.length}
                  duration={2}
                  className="text-3xl font-bold"
                />
                <p className="ml-2 text-xs font-medium">Perusahaan</p>
              </div>

              {/* Persentase dari total di tahun tersebut */}
              {(() => {
                // Filter perusahaan hanya berdasarkan tahun yang dipilih
                const companiesInSelectedYear =
                  filters.year !== "all"
                    ? companies.filter((company) => {
                        const companyInYear = directories
                          .filter(
                            (dir) =>
                              dir.thn_direktori.toString() === filters.year
                          )
                          .map((dir) => dir.id_perusahaan)
                          .includes(company.id_perusahaan);
                        return companyInYear;
                      })
                    : companies;

                const totalInYear = companiesInSelectedYear.length;

                if (filteredCompanies.length < totalInYear) {
                  const percentage = (
                    (filteredCompanies.length / totalInYear) *
                    100
                  ).toFixed(1);
                  return (
                    <div className="text-center text-xs mt-1 text-gray-600">
                      {percentage}% dari total {totalInYear} perusahaan
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* 3. Bagian kategori skala - Pie Chart */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-cdark text-center mb-1">
                Kategori Skala Industri
              </label>

              {(() => {
                const filteredBesar = filteredCompanies.filter(
                  (company) =>
                    company.skala === "Besar" || company.skala === "besar"
                ).length;

                const filteredSedang = filteredCompanies.filter(
                  (company) =>
                    company.skala === "Sedang" || company.skala === "sedang"
                ).length;

                const filteredData = [
                  { name: "Besar", value: filteredBesar },
                  { name: "Sedang", value: filteredSedang },
                ];

                return (
                  <div className="flex flex-col items-center font-roboto font-medium text-xs">
                    {filteredCompanies.length > 0 ? (
                      <>
                        <div className="relative mb-2">
                          <PieChart width={200} height={120}>
                            <Pie
                              data={filteredData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={50}
                              dataKey="value"
                              labelLine={false}
                              label={false} // Hilangkan label di chart
                              activeIndex={pieActiveIndex}
                              onMouseEnter={(data, index) =>
                                setPieActiveIndex(index)
                              }
                              onMouseLeave={() => setPieActiveIndex(null)}
                            >
                              {filteredData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index]}
                                />
                              ))}
                            </Pie>
                          </PieChart>

                          {/* Custom tooltip for pie chart */}
                          {pieActiveIndex !== null && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                              {filteredData[pieActiveIndex].value} perusahaan
                            </div>
                          )}
                        </div>

                        {/* Labels di bawah pie chart */}
                        <div className="flex justify-center gap-4">
                          {filteredData.map((entry, index) => (
                            <div
                              key={`label-${index}`}
                              className="flex items-center"
                            >
                              <div
                                className="w-3 h-3 mr-1 rounded-sm"
                                style={{ backgroundColor: COLORS[index] }}
                              />
                              <span>
                                {entry.name}{" "}
                                {(
                                  (entry.value / filteredCompanies.length) *
                                  100
                                ).toFixed(2)}
                                %
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Tidak ada data untuk ditampilkan
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* 4. Bagian kategori KBLI dengan logika khusus */}
            {filteredCompanies.length > 0 && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-cdark text-center mb-2">
                  Kategori KBLI
                </label>

                {(() => {
                  // Tentukan jenis tampilan berdasarkan filter
                  const isDistrictFiltered = filters.district !== "0";
                  const isKbliFiltered = filters.kbliCategory !== "kbli_all";

                  // Tentukan berapa digit KBLI yang akan digunakan
                  let kbliDigits = 2; // Default 2 digit

                  if (isKbliFiltered && !isDistrictFiltered) {
                    kbliDigits = 3; // KBLI difilter, kecamatan tidak
                  } else if (isKbliFiltered && isDistrictFiltered) {
                    kbliDigits = 4; // Keduanya difilter
                  }

                  // Hitung distribusi KBLI berdasarkan digit yang ditentukan
                  const kbliDistribution = filteredCompanies.reduce(
                    (acc, company) => {
                      if (!company.KBLI) return acc;

                      const kbliCode = company.KBLI.toString();
                      // Potong sesuai digit yang diinginkan, pastikan tidak lebih dari panjang kode
                      const kbliCategory = kbliCode.substring(
                        0,
                        Math.min(kbliDigits, kbliCode.length)
                      );

                      acc[kbliCategory] = (acc[kbliCategory] || 0) + 1;
                      return acc;
                    },
                    {}
                  );

                  // Ambil top categories (maksimal 5)
                  const topCategories = Object.entries(kbliDistribution).sort(
                    (a, b) => b[1] - a[1]
                  );

                  // Jika lebih dari 5 kategori, gabungkan sisanya sebagai "Lainnya"
                  let displayCategories = [];
                  let othersCount = 0;

                  if (topCategories.length > 5) {
                    displayCategories = topCategories.slice(0, 5);
                    othersCount = topCategories
                      .slice(5)
                      .reduce((sum, curr) => sum + curr[1], 0);
                  } else {
                    displayCategories = topCategories;
                  }

                  // Jika ada "Lainnya", tambahkan ke displayCategories
                  if (othersCount > 0) {
                    displayCategories.push(["Lainnya", othersCount]);
                  }

                  // WARNA untuk charts
                  const CHART_COLORS = [
                    "#1f77b4",
                    "#ff7f0e",
                    "#2ca02c",
                    "#d62728",
                    "#9467bd",
                    "#8c564b",
                  ];

                  // Tampilkan sebagai histogram jika tidak ada filter KBLI tapi ada filter kecamatan
                  if (!isKbliFiltered && (isDistrictFiltered || true)) {
                    // Histogram untuk skenario A
                    const chartData = displayCategories.map(
                      ([category, count], index) => ({
                        category,
                        count,
                        fill: CHART_COLORS[index % CHART_COLORS.length],
                      })
                    );

                    return (
                      <div className="h-28 relative">
                        <BarChart
                          width={230}
                          height={110}
                          data={chartData}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          onMouseMove={(data) => {
                            if (data && data.activeTooltipIndex !== undefined) {
                              setBarActiveIndex(data.activeTooltipIndex);
                            }
                          }}
                          onMouseLeave={() => setBarActiveIndex(null)}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Bar
                            dataKey="count"
                            fill="#8884d8"
                            radius={[4, 4, 0, 0]}
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>

                        {/* Custom tooltip for bar chart */}
                        {barActiveIndex !== null &&
                          barActiveIndex < chartData.length && (
                            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                              {chartData[barActiveIndex].count} perusahaan
                            </div>
                          )}
                      </div>
                    );
                  } else {
                    // Progress Bar untuk skenario B dan C (ketika KBLI difilter)
                    return (
                      <div className="space-y-2">
                        {displayCategories.map(([category, count], index) => {
                          const percentage =
                            (count / filteredCompanies.length) * 100;
                          return (
                            <div
                              key={category}
                              className="flex items-center text-xs"
                            >
                              <div className="w-10 font-medium">{category}</div>
                              <div className="flex-1 mx-1 relative group">
                                <div className="bg-gray-200 h-3 w-full rounded-full overflow-hidden cursor-pointer">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor:
                                        CHART_COLORS[
                                          index % CHART_COLORS.length
                                        ],
                                    }}
                                  ></div>
                                </div>

                                {/* Tooltip yang muncul saat hover */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                                  {count} perusahaan
                                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                </div>
                              </div>
                              <div className="w-12 text-right">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        </Transition>

        {/* Input Pencarian */}
        <div className="flex justify-center">
          <Search
            placeholder="Cari nama/produk..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            className="w-[150px] h-10 md:w-auto"
          />
        </div>

        {/* Tombol Filter */}
        <button
          className="flex items-center justify-center bg-[#ffffff] text-cdark rounded-xl shadow-md font-semibold 
        w-10 h-10 md:w-auto md:h-auto px-4 py-1"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <FilterAltOutlinedIcon className="text-xl" />
          <span className="hidden md:inline ml-2 text-2xs">Filter</span>
        </button>

        {/* popup filter */}
        <Transition
          show={isFilterOpen}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 transform scale-95"
          enterTo="opacity-100 transform scale-100"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100 transform scale-100"
          leaveTo="opacity-0 transform scale-95"
          className="absolute top-full right-0 z-20 w-64 p-4 bg-[#ffffff] rounded-md shadow-md text-cdark mt-2"
        >
          <div>
            <div className="grid grid-cols-8 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-cdark">
                  Tahun
                </label>
                <select
                  value={filters.year}
                  onChange={(e) =>
                    setFilters({ ...filters, year: e.target.value })
                  }
                  className="mt-1 block w-full pl-2 pr-2 py-2 text-base border-gray-600 bg-[#EEF0F2] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">Semua Tahun</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-5">
                <label className="block text-sm font-medium text-cdark">
                  Kecamatan
                </label>
                <select
                  value={filters.district}
                  onChange={(e) =>
                    setFilters({ ...filters, district: e.target.value })
                  }
                  className="mt-1 block w-full pl-2 pr-2 py-2 text-base border-gray-600 bg-[#EEF0F2] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="0">Semua Kec</option>
                  {districts.map((district) => (
                    <option key={district.kode_kec} value={district.kode_kec}>
                      {district.id_kec}. {district.nama_kec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="block mt-4 text-sm font-medium text-cdark">
              Kategori KBLI
            </label>
            <select
              value={filters.kbliCategory}
              onChange={(e) =>
                setFilters({ ...filters, kbliCategory: e.target.value })
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#EEF0F2] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="kbli_all">Semua Kategori</option>
              <option value="kbli_10">10. Industri makanan</option>
              <option value="kbli_11">11. Industri minuman</option>
              <option value="kbli_12">12. Industri pengolahan tembakau</option>
              <option value="kbli_13">13. Industri tekstil</option>
              <option value="kbli_14">14. Industri pakaian jadi</option>
              <option value="kbli_15">
                15. Industri kulit, barang dari kulit dan alas kaki
              </option>
              <option value="kbli_16">
                16. Industri kayu, barang dari kayu, gabus dan barang anyaman
                dari bambu, rotan dan sejenisnya
              </option>
              <option value="kbli_17">
                17. Industri kertas dan barang dari kertas
              </option>
              <option value="kbli_18">
                18. Industri percetakan dan reproduksi media rekaman
              </option>
              <option value="kbli_19">
                19. Industri produk dari batubara dan pengilangan minyak bumi
              </option>
              <option value="kbli_20">
                20. Industri bahan kimia dan barang dari bahan kimia
              </option>
              <option value="kbli_21">
                21. Industri farmasi, produk obat kimia dan obat tradisional
              </option>
              <option value="kbli_22">
                22. Industri karet , barang dari karet dan plastik
              </option>
              <option value="kbli_23">
                23. Industri barang galian bukan logam
              </option>
              <option value="kbli_24">24. Industri logam dasar</option>
              <option value="kbli_25">
                25. Industri barang logam, bukan mesin dan peralatannya
              </option>
              <option value="kbli_26">
                26. Industri computer, barang elektronik dan optik
              </option>
              <option value="kbli_27">27. Industri peralatan listrik</option>
              <option value="kbli_28">
                28. Industri mesin dan perlengkapan ytdl
              </option>
              <option value="kbli_29">
                29. Industri kendaraan bermotor, trailer dan semi trailer
              </option>
              <option value="kbli_30">30. Industri alat angkut lainnya</option>
              <option value="kbli_31">31. Industri furniture</option>
              <option value="kbli_32">32. Industri pengolahan lainnya</option>
              <option value="kbli_33">
                33. Jasa reparasi dan pemasangan mesin dan peralatan
              </option>
            </select>

            <label className="block mt-4 text-sm font-medium text-cdark">
              Badan Usaha
            </label>
            <select
              value={filters.businessType}
              onChange={(e) =>
                setFilters({ ...filters, businessType: e.target.value })
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#EEF0F2] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="0">Semua Badan Usaha</option>
              <option value="1">1. PT/PT Persero/Perum</option>
              <option value="2">2. CV</option>
              <option value="3">3. Firma</option>
              <option value="4">4. Koperasi/ Dana Pensiun</option>
              <option value="5">5. Yayasan</option>
              <option value="6">6. Izin Khusus</option>
              <option value="7">7. Perwakilan Perusahaan/Lembaga Asing</option>
              <option value="8">8. Tidak Berbadan Usaha</option>
            </select>

            <label className="block mt-4 text-sm font-medium text-cdark">
              Lokasi Perusahaan
            </label>
            <select
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#EEF0F2] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="0">Semua Lokasi</option>
              <option value="1">1. Kawasan Berikat</option>
              <option value="2">2. Kawasan Industri</option>
              <option value="3">3. Kawasan Peruntukan Industri</option>
              <option value="4">4. Luar Kawasan</option>
            </select>
            {/* Tambahkan tombol Reset dan Apply */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() =>
                  setFilters({
                    year: "2024",
                    district: "0",
                    kbliCategory: "kbli_all",
                    businessType: "0",
                    location: "0",
                  })
                }
                className="px-3 py-1 bg-gray-200 rounded text-sm"
              >
                Reset
              </button>

              <button
                onClick={applyFilters}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Terapkan
              </button>
            </div>
          </div>
        </Transition>
      </div>

      {/* Container untuk Elemen di Bawah */}
      <div className="mx-[5%] fixed bottom-4 left-0 right-0 flex justify-between items-center">
        {/* Tombol Tanggal */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 z-10">
          <button
            className="flex items-center justify-center bg-[#ffffff] text-cdark rounded-xl shadow-md font-semibold 
     px-3 py-2 flex-shrink-0"
          >
            <DateRangeIcon className="hidden md:inline text-xl" />
            <span className="text-2xs md:ml-1">
              {filters.year === "all" ? "Semua Tahun" : filters.year}
            </span>
          </button>
        </div>

        {/* Card Jumlah Perusahaan & Tombol Map */}
        <div className="flex flex-row items-center gap-2 flex-nowrap w-full justify-end z-20 relative">
          {/* Card Jumlah Perusahaan/Intensitas - tampilkan hanya jika heatmap atau choropleth aktif */}
          {(selectedLayers.heatmap || selectedLayers.choropleth) && (
            <div
              className="flex flex-col items-center justify-center bg-[#ffffff] text-cdark rounded-xl shadow-md font-semibold 
     min-w-[150px] w-[160px] px-3 py-0.5 flex-shrink-0"
            >
              {/* Judul */}
              <div className="mb-1 text-xs font-semibold text-center">
                {selectedLayers.heatmap
                  ? "Intensitas Perusahaan"
                  : "Jumlah Perusahaan"}
              </div>

              {/* Label Skala dan Progress Bar */}
              <div className="flex items-center justify-between w-full">
                <span className="text-xs">
                  {selectedLayers.heatmap ? "Rendah" : "0"}
                </span>

                {/* Progress Bar */}
                <div className="relative h-2.5 flex-1 mx-1 rounded-full overflow-hidden bg-white">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: selectedLayers.heatmap
                        ? "linear-gradient(to right, blue, cyan, lime, yellow, red)"
                        : "linear-gradient(to right, #ffffd4, #fee391, #fec44f, #fe9929, #d95f0e, #993404)",
                    }}
                  ></div>
                </div>

                <span className="text-xs">
                  {selectedLayers.heatmap ? "Tinggi" : "200+"}
                </span>
              </div>
            </div>
          )}

          {/* Tombol Visibility */}
          <button
            className="flex items-center justify-center bg-[#ffffff] text-cdark rounded-xl shadow-md font-semibold 
     w-10 h-10 px-3 py-3 flex-shrink-0"
            onClick={() => setIsVisibilityOpen(!isVisibilityOpen)}
          >
            <MapIcon className="text-xl" />
          </button>

          {/* Popup Visibility (Muncul di Atas) */}
          <Transition
            show={isVisibilityOpen}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 transform scale-95"
            enterTo="opacity-100 transform scale-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 transform scale-100"
            leaveTo="opacity-0 transform scale-95"
            className="absolute bottom-full right-0 z-20 w-48 p-2 bg-white rounded-md shadow-md text-cdark mb-2"
          >
            <div>
              <label className="block text-sm font-medium text-cdark mb-2 text-center">
                Visibilitas Layer
              </label>

              {/* Checkbox dengan Icon Visibility */}
              <div className="space-y-2">
                <label
                  className="flex items-center justify-between cursor-pointer text-xs font-medium p-1 rounded-md hover:bg-gray-100"
                  onClick={() => handleLayerChange("heatmap")}
                >
                  <span>Peta Heatmap</span>
                  {selectedLayers.heatmap ? (
                    <VisibilityIcon className="text-cdark text-sm" />
                  ) : (
                    <VisibilityOffIcon className="text-gray-400 text-sm" />
                  )}
                </label>

                <label
                  className="flex items-center justify-between cursor-pointer text-xs font-medium p-1 rounded-md hover:bg-gray-100"
                  onClick={() => handleLayerChange("choropleth")}
                >
                  <span>Peta Choropleth</span>
                  {selectedLayers.choropleth ? (
                    <VisibilityIcon className="text-cdark text-sm" />
                  ) : (
                    <VisibilityOffIcon className="text-gray-400 text-sm" />
                  )}
                </label>

                <label
                  className="flex items-center justify-between cursor-pointer text-xs font-medium p-1 rounded-md hover:bg-gray-100"
                  onClick={() => handleLayerChange("titik")}
                >
                  <span>Titik Lokasi</span>
                  {selectedLayers.titik ? (
                    <VisibilityIcon className="text-cdark text-sm" />
                  ) : (
                    <VisibilityOffIcon className="text-gray-400 text-sm" />
                  )}
                </label>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          Error: {error}
        </div>
      )}
    </div>
  );
};

// Gunakan dynamic import untuk menghindari SSR error
export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
