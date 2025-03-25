"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
import SaveAltRoundedIcon from "@mui/icons-material/SaveAltRounded";
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
import * as XLSX from "xlsx";

const { Search } = Input;

// Custom SVG Markers
const defaultMarkerIcon = new L.Icon({
  iconUrl: "/image/iconMarker.svg",
  iconSize: [30, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -30],
});

const activeMarkerIcon = new L.Icon({
  iconUrl: "/image/iconMarkerActive.svg",
  iconSize: [30, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -30],
});

// Warna poligon berdasarkan kepadatan perusahaan
const getColor = (density) => {
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

// Default style untuk GeoJSON
const defaultStyle = {
  fillColor: "#cccccc",
  weight: 2,
  opacity: 1,
  color: "black",
  dashArray: "3",
  fillOpacity: 0,
};

// Komponen untuk menginisialisasi Leaflet.heat
const HeatLayerInitializer = () => {
  const map = useMap();
  const [heatPluginLoaded, setHeatPluginLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !heatPluginLoaded) {
      const loadHeatPlugin = async () => {
        try {
          // Dinamis import plugin leaflet.heat
          const leafletHeat = await import("leaflet.heat");
          // Pastikan plugin terintegrasi dengan Leaflet
          if (!L.heatLayer) {
            // Jika perlu, daftarkan plugin secara manual
            if (
              leafletHeat.default &&
              typeof leafletHeat.default === "function"
            ) {
              leafletHeat.default(L);
            }
          }
          setHeatPluginLoaded(true);
          console.log("Leaflet.heat initialized successfully");
        } catch (error) {
          console.error("Failed to load Leaflet.heat:", error);
        }
      };

      loadHeatPlugin();
    }
  }, [map, heatPluginLoaded]);

  return null;
};

// Komponen HeatmapLayer untuk menampilkan heatmap
const HeatmapLayer = ({ points, options, visible }) => {
  const map = useMap();
  const heatRef = useRef(null);

  useEffect(() => {
    if (!map || points.length === 0 || !visible) return;

    // Lebih defensif dengan cek L.heatLayer
    if (typeof L.heatLayer !== "function") {
      console.error(
        "L.heatLayer is not available. Make sure leaflet.heat is properly loaded."
      );
      // Keluar dari effect tanpa crash
      return;
    }

    // Cek dan buat heatmap layer
    try {
      if (!heatRef.current) {
        heatRef.current = L.heatLayer(points, options).addTo(map);
      } else {
        heatRef.current.setLatLngs(points);
      }
    } catch (e) {
      console.error("Error creating heatmap layer:", e);
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
  const [geoJsonData, setGeoJsonData] = useState(null);
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

  // Tambahkan kode berikut di MapComponent untuk memastikan Leaflet.heat dimuat
  useEffect(() => {
    // Preload leaflet.heat plugin di awal
    if (typeof window !== "undefined") {
      import("leaflet.heat")
        .then((module) => {
          if (module.default && typeof module.default === "function") {
            module.default(L);
          }
          console.log("Leaflet.heat preloaded");
        })
        .catch((err) => {
          console.error("Failed to preload leaflet.heat:", err);
        });
    }
  }, []);

  // State untuk melacak marker yang aktif
  const [activeMarkerId, setActiveMarkerId] = useState(null);

  const markersRef = useRef({});

  // Tambahkan fungsi handler untuk popup close event
  const handlePopupOpen = (company) => {
    setActiveMarkerId(company.id_perusahaan);
  };

  const handlePopupClose = (company) => {
    if (activeMarkerId === company.id_perusahaan) {
      setActiveMarkerId(null);
    }
  };

  // State untuk data perusahaan yang telah difilter
  const [filteredCompanies, setFilteredCompanies] = useState([]);

  // State untuk menyimpan jumlah perusahaan per kecamatan
  const [kecamatanCompanyCounts, setKecamatanCompanyCounts] = useState({});

  // Reference untuk layer GeoJSON
  const geoJsonLayerRef = useRef(null);

  // State untuk mengontrol tooltip
  const [pieActiveIndex, setPieActiveIndex] = useState(null);
  const [barActiveIndex, setBarActiveIndex] = useState(null);

  // State untuk filter
  const [filters, setFilters] = useState({
    year: "2024", // Default tahun
    district: "0", // 0 berarti semua kecamatan
    kbliCategory: "kbli_all", // Default semua kategori KBLI
    businessType: "0", // 0 berarti semua badan usaha
    location: "0", // 0 berarti semua lokasi
  });

  // State untuk menyimpan tahun unik
  const [uniqueYears, setUniqueYears] = useState([]);

  // State untuk data direktori dan kecamatan
  const [directories, setDirectories] = useState([]);
  const [districts, setDistricts] = useState([]);

  // State untuk pencarian
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk menyimpan data points heatmap
  const [heatmapPoints, setHeatmapPoints] = useState([]);

  // Create a key for GeoJSON to force re-render when selectedLayers changes
  const [geoJsonKey, setGeoJsonKey] = useState(0);

  // Fungsi normalisasi kode kecamatan yang konsisten - dengan debugging yang ditingkatkan
  const normalizeKecamatanCode = (code) => {
    if (code === null || code === undefined) {
      console.log("normalizeKecamatanCode: received null/undefined value");
      return null;
    }

    // Convert to string first, then parse to integer
    const stringCode = String(code).trim();
    const parsedCode = parseInt(stringCode, 10);

    // Log untuk debugging
    console.log(
      `Normalizing code: ${code} (${typeof code}) -> ${parsedCode} (${typeof parsedCode})`
    );

    return isNaN(parsedCode) ? null : parsedCode;
  };

  // Fungsi khusus untuk memperbaiki kode_kec di GeoJSON berdasarkan data districts dari API
  const fixGeoJsonKecamatanCodes = useCallback(() => {
    if (!districts.length || !geoJsonData || !geoJsonData.features) {
      console.log("Missing required data for fixing GeoJSON codes");
      return;
    }

    // Cek apakah kode kecamatan sudah diperbaiki sebelumnya
    // Ini penting untuk menghindari loop tak terbatas
    let needsFixing = false;

    // Periksa apakah ada kode_kec yang perlu diperbaiki
    for (const feature of geoJsonData.features) {
      if (
        feature.properties &&
        (feature.properties.kode_kec === undefined ||
          feature.properties.kode_kec === null ||
          typeof feature.properties.kode_kec !== "number")
      ) {
        needsFixing = true;
        break;
      }
    }

    // Jika tidak perlu perbaikan, keluar dari fungsi
    if (!needsFixing) {
      console.log("GeoJSON kecamatan codes already fixed, skipping");
      return;
    }

    console.log("Fixing GeoJSON kecamatan codes...");

    // Buat daftar pemetaan nama kecamatan ke kode
    const kecamatanNameToCode = {};
    districts.forEach((district) => {
      // Membuat normalisasi nama kecamatan untuk menangani perbedaan format
      const normalizedName = district.nama_kec.toLowerCase().trim();
      kecamatanNameToCode[normalizedName] = parseInt(district.kode_kec, 10);
      console.log(`Mapped ${normalizedName} -> ${district.kode_kec}`);
    });

    // Duplicate GeoJSON to avoid mutating state directly
    const updatedFeatures = [...geoJsonData.features].map((feature) => {
      // Deep clone untuk menghindari mutasi referensi objek
      const updatedFeature = JSON.parse(JSON.stringify(feature));

      if (updatedFeature.properties) {
        // Coba dapatkan kode dari nama kecamatan, jika ada
        if (updatedFeature.properties.kec) {
          const kecName = updatedFeature.properties.kec.toLowerCase().trim();
          if (kecamatanNameToCode[kecName]) {
            updatedFeature.properties.kode_kec = kecamatanNameToCode[kecName];
          }
        }

        // Coba ekstrak dari label jika masih null
        if (
          !updatedFeature.properties.kode_kec &&
          updatedFeature.properties.label
        ) {
          const labelMatch =
            updatedFeature.properties.label.match(/Kecamatan\s+(.+)/i);
          if (labelMatch && labelMatch[1]) {
            const kecName = labelMatch[1].toLowerCase().trim();
            if (kecamatanNameToCode[kecName]) {
              updatedFeature.properties.kode_kec = kecamatanNameToCode[kecName];
            }
          }
        }

        // Direct mapping sebagai fallback
        if (!updatedFeature.properties.kode_kec) {
          // Tabel pemetaan langsung nama ke kode berdasarkan database Anda
          const directMapping = {
            tarik: 10,
            prambon: 20,
            krembung: 30,
            porong: 40,
            jabon: 50,
            tanggulangin: 60,
            candi: 70,
            tulangan: 80,
            wonoayu: 90,
            sukodono: 100,
            sidoarjo: 110,
            buduran: 120,
            sedati: 130,
            waru: 140,
            gedangan: 150,
            taman: 160,
            krian: 170,
            "balong bendo": 180,
            balongbendo: 180,
          };

          // Coba ambil dari label atau properti lain
          if (updatedFeature.properties.label) {
            const labelText = updatedFeature.properties.label.toLowerCase();

            // Cek apakah label mengandung nama kecamatan
            for (const [name, code] of Object.entries(directMapping)) {
              if (labelText.includes(name)) {
                updatedFeature.properties.kode_kec = code;
                break;
              }
            }
          }
        }

        // Log hasil perbaikan
        console.log(
          `Fixed ${updatedFeature.properties.label}: kode_kec = ${updatedFeature.properties.kode_kec}`
        );
      }

      return updatedFeature;
    });

    // Update state dengan data yang telah diperbaiki
    const fixedGeoJSON = {
      ...geoJsonData,
      features: updatedFeatures,
    };

    setGeoJsonData(fixedGeoJSON);

    // Force rerender GeoJSON
    setGeoJsonKey((prev) => prev + 1);

    console.log("GeoJSON kecamatan codes fixed successfully");
  }, [districts]); // PENTING: Hapus geoJsonData dari dependensi untuk menghindari loop

  // Fungsi untuk menghitung jumlah perusahaan per kecamatan (dioptimalkan)
  const countCompaniesByKecamatan = useCallback(
    (filteredComps) => {
      console.log(
        "Counting companies by kecamatan for",
        filteredComps.length,
        "companies"
      );

      // Inisialisasi objek untuk menyimpan jumlah per kecamatan
      const counts = {};

      // Pastikan semua kecamatan memiliki entri, meskipun kosong
      if (geoJsonData && geoJsonData.features) {
        geoJsonData.features.forEach((feature) => {
          if (feature.properties && feature.properties.kode_kec !== undefined) {
            const kecCode = normalizeKecamatanCode(feature.properties.kode_kec);
            if (kecCode !== null) {
              counts[kecCode] = 0;
            }
          }
        });
      }

      // Hitung jumlah perusahaan per kecamatan
      filteredComps.forEach((company) => {
        if (company.kec !== null && company.kec !== undefined) {
          const kecCode = normalizeKecamatanCode(company.kec);

          if (kecCode !== null) {
            counts[kecCode] = (counts[kecCode] || 0) + 1;
            // Log untuk debugging
            if (counts[kecCode] === 1) {
              console.log(
                `First company in ${kecCode}:`,
                company.nama_perusahaan
              );
            }
          }
        }
      });

      // Log hasil akhir untuk debugging
      console.log("Final kecamatan counts:", counts);
      return counts;
    },
    [geoJsonData]
  );

  // Styling GeoJSON Polygons dengan warna dinamis (versi yang diperbaiki)
  const getStyle = useCallback(
    (feature) => {
      // Defensive check
      if (!feature || !feature.properties) {
        console.error("Invalid feature or missing properties", feature);
        return {
          ...defaultStyle,
          fillOpacity: selectedLayers.choropleth ? 0.7 : 0,
        };
      }

      // Pastikan kode_kec konsisten (integer)
      const kecamatanCode = normalizeKecamatanCode(feature.properties.kode_kec);

      // Safer lookup, dengan fallback ke 0
      const count =
        kecamatanCode !== null ? kecamatanCompanyCounts[kecamatanCode] || 0 : 0;

      // Log styling untuk debugging yang lebih detail
      console.log(
        `Styling ${feature.properties.label}, raw code=${feature.properties.kode_kec}, normalized=${kecamatanCode}, count=${count}`
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

  // Function to update the GeoJSON popups with dynamic data (improved)
  const updateGeoJsonPopups = useCallback(() => {
    if (!geoJsonLayerRef.current) {
      console.log("No GeoJSON layer ref available for updating popups");
      return;
    }

    // Log untuk debugging
    console.log(
      "Updating popups with kecamatanCompanyCounts:",
      kecamatanCompanyCounts
    );

    // Update setiap popup pada layer GeoJSON
    geoJsonLayerRef.current.eachLayer((layer) => {
      const properties = layer.feature.properties;
      // Pastikan format kode kecamatan konsisten
      const kecamatanCode = normalizeKecamatanCode(properties.kode_kec);

      // Log untuk debugging
      console.log(
        `Updating popup - Kecamatan: ${properties.label}, kode: ${kecamatanCode}, count: ${kecamatanCompanyCounts[kecamatanCode] || 0}`
      );

      const filteredCount =
        kecamatanCode !== null ? kecamatanCompanyCounts[kecamatanCode] || 0 : 0;

      // Update popup content dengan jumlah perusahaan terbaru
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

  // Function to handle when GeoJSON is added to the map (improved)
  const onGeoJsonLoad = useCallback(
    (layer) => {
      console.log("GeoJSON layer loaded and added to map");
      geoJsonLayerRef.current = layer;

      // Setelah layer di-load, update popups
      if (Object.keys(kecamatanCompanyCounts).length > 0) {
        updateGeoJsonPopups();
      }
    },
    [updateGeoJsonPopups, kecamatanCompanyCounts]
  );

  // Handle perubahan checkbox layer
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
          }
        }
      } else {
        // Untuk layer lain (titik), lakukan toggle biasa
        newState[layer] = !prev[layer];
      }

      return newState;
    });
  };

  // Fungsi untuk menerapkan filter pencarian
  const applySearchFilter = useCallback((companies, searchTerm) => {
    if (!searchTerm.trim()) return companies;

    return companies.filter((company) => {
      const nameMatch = company.nama_perusahaan
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const productMatch = company.produk
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      return nameMatch || productMatch;
    });
  }, []);

  // Fungsi untuk menerapkan semua filter
  const applyAllFilters = useCallback(
    (companiesData, currentFilters, search) => {
      if (!companiesData.length) return [];

      let filtered = [...companiesData];

      // 1. Filter berdasarkan tahun direktori
      if (currentFilters.year !== "all") {
        const companiesInYear = directories
          .filter((dir) => dir.thn_direktori.toString() === currentFilters.year)
          .map((dir) => dir.id_perusahaan);

        filtered = filtered.filter((company) =>
          companiesInYear.includes(company.id_perusahaan)
        );
      }

      // 2. Filter berdasarkan kecamatan
      if (currentFilters.district !== "0") {
        filtered = filtered.filter(
          (company) =>
            company.kec && company.kec.toString() === currentFilters.district
        );
      }

      // 3. Filter berdasarkan kategori KBLI
      if (currentFilters.kbliCategory !== "kbli_all") {
        const kbliPrefix = currentFilters.kbliCategory.replace("kbli_", "");
        filtered = filtered.filter((company) => {
          const kbli = company.KBLI ? company.KBLI.toString() : "";
          const kbliCategory = kbli.substring(0, 2);
          return kbliCategory === kbliPrefix;
        });
      }

      // 4. Filter berdasarkan badan usaha
      if (currentFilters.businessType !== "0") {
        filtered = filtered.filter(
          (company) =>
            company.badan_usaha &&
            company.badan_usaha.toString() === currentFilters.businessType
        );
      }

      // 5. Filter berdasarkan lokasi perusahaan
      if (currentFilters.location !== "0") {
        filtered = filtered.filter(
          (company) =>
            company.lok_perusahaan &&
            company.lok_perusahaan.toString() === currentFilters.location
        );
      }

      // 6. Terapkan filter pencarian
      if (search.trim()) {
        filtered = applySearchFilter(filtered, search);
      }

      return filtered;
    },
    [directories, applySearchFilter]
  );

  // Update GeoJsonKey when selectedLayers changes to force re-render
  useEffect(() => {
    setGeoJsonKey((prevKey) => prevKey + 1);
  }, [selectedLayers]);

  // Fetch GeoJSON data
  useEffect(() => {
    fetch("/data/polygon_wilayah.geojson")
      .then((response) => response.json())
      .then((result) => {
        console.log("Raw GeoJSON response:", result);
        // Deteksi format data GeoJSON
        if (result.data && Array.isArray(result.data)) {
          // Flatten features dari berbagai FeatureCollection
          const allFeatures = [];
          result.data.forEach((featureCollection) => {
            if (
              featureCollection.features &&
              Array.isArray(featureCollection.features)
            ) {
              featureCollection.features.forEach((feature) => {
                // Verifikasi properties dan kode_kec
                if (
                  feature.properties &&
                  feature.properties.kode_kec !== undefined
                ) {
                  allFeatures.push(feature);
                }
              });
            }
          });

          // Buat satu FeatureCollection dengan semua features
          const combinedGeoJSON = {
            type: "FeatureCollection",
            features: allFeatures,
          };

          console.log(
            "Combined GeoJSON with feature count:",
            allFeatures.length
          );
          setGeoJsonData(combinedGeoJSON);
        } else {
          console.log("Using GeoJSON in standard format");
          setGeoJsonData(result);
        }
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
        setError("Failed to load map data");
      });
  }, []);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Paralel fetching untuk meningkatkan performa
        const [companiesResponse, directoriesResponse, districtsResponse] =
          await Promise.all([
            fetch("/api/perusahaan"),
            fetch("/api/direktori"),
            fetch("/api/kecamatan"),
          ]);

        // Validasi semua responses
        if (
          !companiesResponse.ok ||
          !directoriesResponse.ok ||
          !districtsResponse.ok
        ) {
          throw new Error(`HTTP error! Check status codes.`);
        }

        // Parse data
        const companiesResult = await companiesResponse.json();
        const directoriesResult = await directoriesResponse.json();
        const districtsResult = await districtsResponse.json();

        if (
          companiesResult.success &&
          directoriesResult.success &&
          districtsResult.success
        ) {
          // Set data ke state
          setCompanies(companiesResult.data);
          setDirectories(directoriesResult.data);
          setDistricts(districtsResult.data);
          setFilteredCompanies(companiesResult.data);

          console.log("Loaded companies:", companiesResult.data.length);
          console.log("Sample company:", companiesResult.data[0]);

          // Ekstrak tahun-tahun unik dari data direktori
          const years = directoriesResult.data
            .map((dir) => dir.thn_direktori.toString())
            .filter((year, index, self) => self.indexOf(year) === index)
            .sort((a, b) => b - a);

          setUniqueYears(years);

          // Hitung statistik
          const total = companiesResult.data.length;
          const besar = companiesResult.data.filter(
            (company) => company.skala?.toLowerCase() === "besar"
          ).length;
          const sedang = companiesResult.data.filter(
            (company) => company.skala?.toLowerCase() === "sedang"
          ).length;

          setStatistics({
            total,
            besar,
            sedang,
          });

          // Persiapkan data untuk heatmap
          const points = companiesResult.data
            .filter((company) => company.lat && company.lon)
            .map((company) => {
              const intensity =
                company.skala?.toLowerCase() === "besar" ? 1.0 : 0.7;
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

  // Panggil fungsi fixGeoJsonKecamatanCodes setelah districts dan geoJsonData tersedia
  useEffect(() => {
    if (districts.length > 0 && geoJsonData && geoJsonData.features) {
      console.log("Running fixGeoJsonKecamatanCodes effect");

      // Gunakan setTimeout untuk menghindari pembaruan berulang dalam rendering yang sama
      const timer = setTimeout(() => {
        fixGeoJsonKecamatanCodes();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [districts, fixGeoJsonKecamatanCodes]);

  // Effect untuk menerapkan filter saat filter atau searchTerm berubah
  useEffect(() => {
    if (companies.length > 0) {
      // Terapkan semua filter
      const filtered = applyAllFilters(companies, filters, searchTerm);
      console.log(
        "Applied filters, resulting in",
        filtered.length,
        "companies"
      );
      setFilteredCompanies(filtered);

      // Hitung jumlah perusahaan per kecamatan berdasarkan filter yang diterapkan
      const counts = countCompaniesByKecamatan(filtered);
      setKecamatanCompanyCounts(counts);

      // Update heatmap points
      const points = filtered
        .filter((company) => company.lat && company.lon)
        .map((company) => {
          const intensity =
            company.skala?.toLowerCase() === "besar" ? 1.0 : 0.7;
          return [company.lat, company.lon, intensity];
        });

      setHeatmapPoints(points);
    }
  }, [
    companies,
    filters,
    searchTerm,
    applyAllFilters,
    countCompaniesByKecamatan,
  ]);

  // Hitung kecamatanCompanyCounts saat data perusahaan dan GeoJSON tersedia
  useEffect(() => {
    if (companies.length > 0 && geoJsonData) {
      console.log("Both companies and GeoJSON available, initializing counts");
      const initialCounts = countCompaniesByKecamatan(companies);
      setKecamatanCompanyCounts(initialCounts);

      // Force refresh GeoJSON layer to ensure correct styling
      setGeoJsonKey((prev) => prev + 1);
    }
  }, [companies, geoJsonData, countCompaniesByKecamatan]);

  // Update popups when kecamatanCompanyCounts changes
  useEffect(() => {
    if (
      Object.keys(kecamatanCompanyCounts).length > 0 &&
      geoJsonLayerRef.current
    ) {
      console.log("kecamatanCompanyCounts updated, updating popups");
      updateGeoJsonPopups();
    }
  }, [kecamatanCompanyCounts, updateGeoJsonPopups]);

  // Handler untuk search
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Tambahkan fungsi untuk mengunduh data ke Excel
  const downloadExcelData = () => {
    // 1. Persiapkan data berdasarkan filter yang aktif
    const dataToDownload = filteredCompanies.map((company) => ({
      "Nama Perusahaan": company.nama_perusahaan || "-",
      Alamat: company.alamat || "-",
      Kecamatan: company.nama_kec || "-",
      Desa: company.nama_des || "-",
      "Badan Usaha": company.badan_usaha_nama || "-",
      Skala: company.skala || "-",
      "Kode KBLI": company.KBLI || "-",
      Produk: company.produk || "-",
      Telepon: company.telp_perusahaan || "-",
      Email: company.email_perusahaan || "-",
      Website: company.web_perusahaan || "-",
    }));

    // 2. Buat workbook dan worksheet
    const ws = XLSX.utils.json_to_sheet(dataToDownload);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Perusahaan IBS");

    // 3. Atur lebar kolom agar lebih readable
    const colWidths = [
      { wch: 30 }, // Nama Perusahaan
      { wch: 40 }, // Alamat
      { wch: 15 }, // Kecamatan
      { wch: 15 }, // Desa
      { wch: 20 }, // Badan Usaha
      { wch: 10 }, // Skala
      { wch: 10 }, // Kode KBLI
      { wch: 30 }, // Produk
      { wch: 15 }, // Telepon
      { wch: 25 }, // Email
      { wch: 25 }, // Website
    ];
    ws["!cols"] = colWidths;

    // 4. Buat nama file dengan informasi filter yang aktif
    let fileName = "Daftar_Perusahaan_IBS";

    // Tambahkan tahun jika filter tahun aktif
    if (filters.year !== "all") {
      fileName += `_${filters.year}`;
    }

    // Tambahkan kecamatan jika filter kecamatan aktif
    if (filters.district !== "0") {
      const districtName = districts.find(
        (d) => d.kode_kec.toString() === filters.district
      )?.nama_kec;
      if (districtName) {
        fileName += `_${districtName}`;
      }
    }

    // Tambahkan timestamp untuk keunikan
    fileName += `_${new Date().toISOString().slice(0, 10)}`;

    // 5. Unduh file
    XLSX.writeFile(wb, `${fileName}.xlsx`);

    console.log(`Berhasil mengunduh ${dataToDownload.length} data perusahaan`);
  };

  // Mempersiapkan data untuk pie chart
  const pieChartData = useMemo(() => {
    const filteredBesar = filteredCompanies.filter(
      (company) => company.skala?.toLowerCase() === "besar"
    ).length;

    const filteredSedang = filteredCompanies.filter(
      (company) => company.skala?.toLowerCase() === "sedang"
    ).length;

    return [
      { name: "Besar", value: filteredBesar },
      { name: "Sedang", value: filteredSedang },
    ];
  }, [filteredCompanies]);

  const COLORS = ["#74512D", "#AF8F6F"];

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

          {/* Heatmap Layer */}
          {heatmapPoints.length > 0 && (
            <HeatmapLayer
              points={heatmapPoints}
              options={{
                radius: 25,
                blur: 10,
                maxZoom: 15,
                max: 0.8,
                minOpacity: 0.4,
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

          {/* GeoJSON Layer dengan pendekatan yang dioptimalkan */}
          {geoJsonData && (
            <GeoJSON
              key={`geojson-${geoJsonKey}`}
              data={geoJsonData}
              style={getStyle}
              ref={geoJsonLayerRef}
              onEachFeature={(feature, layer) => {
                if (feature.properties) {
                  const { label, luas, desa, kelurahan, kode_kec } =
                    feature.properties;
                  const kecCode = normalizeKecamatanCode(kode_kec);
                  const count =
                    kecCode !== null ? kecamatanCompanyCounts[kecCode] || 0 : 0;

                  // Initial popup binding
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
              onAdd={onGeoJsonLoad}
            />
          )}

          {/* Markers untuk lokasi perusahaan */}
          {selectedLayers.titik &&
            !loading &&
            filteredCompanies.length > 0 &&
            filteredCompanies.map((company) => {
              // Format URL website
              const formatUrl = (url) => {
                if (!url || url.trim() === "") return null;
                return url.startsWith("http") ? url : `http://${url}`;
              };

              const websiteUrl = formatUrl(company.web_perusahaan);

              // Tentukan ikon yang akan digunakan
              const isActive = activeMarkerId === company.id_perusahaan;
              const currentIcon = isActive
                ? activeMarkerIcon
                : defaultMarkerIcon;

              return (
                <Marker
                  key={company.id_perusahaan}
                  position={[company.lat, company.lon]}
                  icon={currentIcon}
                  eventHandlers={{
                    click: () => handlePopupOpen(company),
                    popupclose: () => handlePopupClose(company),
                  }}
                  ref={(ref) => {
                    if (ref) {
                      // Simpan referensi marker untuk akses di luar
                      markersRef.current[company.id_perusahaan] = ref;

                      // Tambahkan event listener untuk popup close
                      ref.on("popupclose", () => {
                        handlePopupClose(company);
                      });
                    }
                  }}
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
          className="absolute top-full left-0 z-30 w-68 max-h-[77vh] p-3 bg-[#ffffff] rounded-md shadow-md text-cdark mt-2 overflow-y-auto"
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

              <div className="flex flex-col items-center font-roboto font-medium text-xs">
                {filteredCompanies.length > 0 ? (
                  <>
                    <div className="relative mb-2">
                      <PieChart width={200} height={120}>
                        <Pie
                          data={pieChartData}
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
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                      </PieChart>

                      {/* Custom tooltip for pie chart */}
                      {pieActiveIndex !== null && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                          {pieChartData[pieActiveIndex].value} perusahaan
                        </div>
                      )}
                    </div>

                    {/* Labels di bawah pie chart */}
                    <div className="flex justify-center gap-4">
                      {pieChartData.map((entry, index) => (
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
                22. Industri karet, barang dari karet dan plastik
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

              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                Terapkan
              </button>
            </div>
          </div>
        </Transition>
      </div>

      {/* Container untuk Elemen di Bawah */}
      <div className="mx-[5%] fixed bottom-4 left-0 right-0 flex justify-between items-center">
        {/* Tombol Unduh dan Tanggal dalam satu container */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 z-20 flex items-center gap-3 pointer-events-none">
          {/* Tombol Unduh */}
          <div className="pointer-events-auto">
            <button
              className="flex items-center justify-center bg-[#ffffff] text-cdark rounded-xl shadow-md font-semibold 
        px-2 py-2 flex-shrink-0 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
              onClick={downloadExcelData}
              type="button"
            >
              <SaveAltRoundedIcon className="text-xl" />
            </button>
          </div>

          {/* Tombol Tanggal */}
          <div className="pointer-events-auto">
            <button
              className="flex items-center justify-center bg-[#ffffff] text-cdark rounded-xl shadow-md font-semibold 
        px-2 py-2 flex-shrink-0"
              type="button"
            >
              <DateRangeIcon className="hidden md:inline text-xl" />
              <span className="text-2xs md:ml-1">
                {filters.year === "all" ? "Semua Tahun" : filters.year}
              </span>
            </button>
          </div>
        </div>

        {/* Card Jumlah Perusahaan & Tombol Map */}
        <div className="flex flex-row items-center gap-2 flex-nowrap w-full justify-end z-10 relative">
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

{
}

/* Gunakan dynamic import untuk menghindari SSR error */
export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
