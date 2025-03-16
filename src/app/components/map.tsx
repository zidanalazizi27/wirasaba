"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
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
              : "#000000";
};

// Styling GeoJSON Polygons
const getStyle = (selectedLayers) => {
  return (feature: any) => ({
    fillColor: getColor(feature.properties.n_perusahaan),
    weight: 2,
    opacity: 1,
    color: "black",
    dashArray: "3",
    fillOpacity: selectedLayers.choropleth ? 0.7 : 0,
  });
};

// Fungsi untuk mengubah teks menjadi format Title Case
const formatTitleCase = (text) => {
  if (!text) return "-";

  // Jika teks berupa huruf kapital semua
  if (text === text.toUpperCase()) {
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => {
        // Jangan kapitalisasi kata-kata kecil seperti "dan", "dari", "di", dll
        const smallWords = [
          "dan",
          "atau",
          "di",
          "ke",
          "dari",
          "pada",
          "yang",
          "untuk",
        ];
        if (smallWords.includes(word)) return word;

        // Khusus untuk singkatan seperti PT, CV, dll
        const abbreviations = ["pt", "cv", "tbk", "ud", "pma", "pmdn"];
        if (abbreviations.includes(word)) return word.toUpperCase();

        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  // Jika teks sudah dalam format yang benar, kembalikan apa adanya
  return text;
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
    titik: false,
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

  // State untuk menyimpan data points heatmap
  const [heatmapPoints, setHeatmapPoints] = useState([]);

  // Handle perubahan checkbox
  const handleLayerChange = (layer) => {
    setSelectedLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer], // Toggle pilihan
    }));
  };

  // Create a key for GeoJSON to force re-render when selectedLayers changes
  const [geoJsonKey, setGeoJsonKey] = useState(0);

  // Update GeoJsonKey when selectedLayers changes to force re-render
  useEffect(() => {
    setGeoJsonKey((prevKey) => prevKey + 1);
  }, [selectedLayers]);

  // Fetch GeoJSON data
  useEffect(() => {
    fetch("/data/polygon_wilayah.geojson")
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data))
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

  // Fetch data perusahaan dari API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/perusahaan");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setCompanies(result.data);

          // Hitung statistik
          const total = result.count;
          const besar = result.data.filter(
            (company) => company.skala === "Besar"
          ).length;
          const sedang = result.data.filter(
            (company) => company.skala === "Sedang"
          ).length;

          setStatistics({
            total,
            besar,
            sedang,
          });

          // Persiapkan data untuk heatmap dengan intensitas yang lebih tinggi
          const points = result.data
            .filter((company) => company.lat && company.lon) // Filter data yang memiliki koordinat
            .map((company) => {
              // Tingkatkan intensitas untuk membuat heatmap lebih terlihat
              const intensity = company.skala === "Besar" ? 1.0 : 0.7;
              return [company.lat, company.lon, intensity];
            });

          setHeatmapPoints(points);
        } else {
          throw new Error(result.message || "Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

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
                radius: 40, // Meningkatkan radius untuk cakupan area lebih luas
                blur: 25, // Meningkatkan blur untuk transisi lebih halus
                maxZoom: 15, // Menurunkan maxZoom agar heatmap tetap terlihat saat zoom in
                max: 0.8, // Menurunkan nilai maksimum untuk mempertegas visualisasi
                minOpacity: 0.4, // Tambahkan nilai minimum opacity agar tetap terlihat
                gradient: {
                  // Sesuaikan gradien untuk visibilitas lebih baik
                  0.2: "#ffffd4", // Mulai dari nilai lebih rendah (0.2)
                  0.4: "#fee391",
                  0.5: "#fec44f",
                  0.6: "#fe9929",
                  0.7: "#d95f0e",
                  1.0: "#993404",
                },
              }}
              visible={selectedLayers.heatmap}
            />
          )}

          {/* 🔹 Tambahkan Layer GeoJSON */}
          {geoJsonData && (
            <GeoJSON
              key={geoJsonKey}
              data={geoJsonData}
              style={getStyle(selectedLayers)}
              onEachFeature={(feature, layer) => {
                if (feature.properties) {
                  const { label, luas, desa, kelurahan, n_perusahaan } =
                    feature.properties;

                  layer.bindPopup(`
          <div style="font-size: 14px; line-height: 1.5;">
            <b>${label}</b><br/>
            <strong>Luas Wilayah:</strong> ${luas} KM²<br/>
            <strong>Jumlah Desa:</strong> ${desa}<br/>
            <strong>Jumlah Kelurahan:</strong> ${kelurahan}<br/>
            <strong>Jumlah Perusahaan:</strong> ${n_perusahaan}
          </div>
        `);
                }
              }}
            />
          )}

          {/* 🔹 Marker Lokasi Pabrik dari Database */}
          {selectedLayers.titik &&
            !loading &&
            companies.length > 0 &&
            companies.map((company) => {
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
                              :{" "}
                              {formatTitleCase(company.nama_perusahaan) || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Alamat</td>
                            <td className="pr-1 pb-0.5">
                              : {formatTitleCase(company.alamat) || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Kecamatan</td>
                            <td className="pr-1 pb-0.5">
                              : {formatTitleCase(company.kec) || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Desa</td>
                            <td className="pr-1 pb-0.5">
                              : {formatTitleCase(company.des) || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Badan Usaha</td>
                            <td className="pr-1 pb-0.5">
                              : {formatTitleCase(company.badan_usaha) || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-1 pb-0.5">Skala</td>
                            <td className="pr-1 pb-0.5">
                              : {formatTitleCase(company.skala) || "-"}
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
                              : {formatTitleCase(company.produk) || "-"}
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
          className="absolute top-full left-0 z-30 w-52 max-h-[77vh] p-2 bg-[#ffffff] rounded-md shadow-md text-cdark mt-2 overflow-y-auto"
        >
          <div>
            <div className="flex items-center justify-center gap-2">
              <RoomIcon className="text-xl" />
              <span className="text-sm font-semibold">Kabupaten Sidoarjo</span>
            </div>
            <div className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#EEF0F2] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-4xl rounded-md flex items-center text-4xl font-bold justify-center">
              <CountUp start={0} end={statistics.total} duration={3} />
              <p className="ml-2 text-xs font-medium">Perusahaan</p>
            </div>
            <label className="block mt-4 text-sm font-medium text-cdark text-center">
              Kategori Skala Industri
            </label>
            {/* Pie Chart */}
            <div className="flex justify-center">
              <PieChart width={200} height={200}>
                <Pie
                  data={data_pie}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={50}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data_pie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} perusahaan`, "Jumlah"]}
                />
                <Legend />
              </PieChart>
            </div>
          </div>
        </Transition>

        {/* Input Pencarian */}
        <div className="flex justify-center">
          <Search
            placeholder="Pencarian..."
            allowClear
            // onSearch={onSearch}
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
                <select className="mt-1 block w-full pl-2 pr-2 py-2 text-base border-gray-600 bg-[#EEF0F2] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <div className="col-span-5">
                <label className="block text-sm font-medium text-cdark">
                  Kecamatan
                </label>
                <select className="mt-1 block w-full pl-2 pr-2 py-2 text-base border-gray-600 bg-[#EEF0F2] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="0">Semua Kec</option>
                  <option value="1">1. Tarik</option>
                  <option value="2">2. Prambon</option>
                  <option value="3">3. Krembung</option>
                  <option value="4">4. Porong</option>
                  <option value="5">5. Jabon</option>
                  <option value="6">6. Tanggulangin</option>
                  <option value="7">7. Candi</option>
                  <option value="8">8. Tulangan</option>
                  <option value="9">9. Wonoayu</option>
                  <option value="10">10. Sukodono</option>
                  <option value="11">11. Sidoarjo</option>
                  <option value="12">12. Buduran</option>
                  <option value="13">13. Sedati</option>
                  <option value="14">14. Waru</option>
                  <option value="15">15. Gedangan</option>
                  <option value="16">16. Taman</option>
                  <option value="17">17. Krian</option>
                  <option value="18">18. Balong Bendo</option>
                </select>
              </div>
            </div>

            <label className="block mt-4 text-sm font-medium text-cdark">
              Kategori KBLI
            </label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#EEF0F2] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
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
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#EEF0F2] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
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
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#EEF0F2] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="0">Semua Lokasi</option>
              <option value="1">1. Kawasan Berikat</option>
              <option value="2">2. Kawasan Industri</option>
              <option value="3">3. Kawasan Peruntukan Industri</option>
              <option value="4">4. Luar Kawasan</option>
            </select>
          </div>
        </Transition>
      </div>

      {/* Container untuk Elemen di Bawah */}
      <div className="mx-[5%] fixed bottom-4 left-0 right-0 flex justify-between items-center">
        {/* Tombol Tanggal */}
        <button
          className="flex items-center justify-center bg-[#ffffff] text-cdark rounded-xl shadow-md font-semibold 
    px-3 py-2 flex-shrink-0"
        >
          <DateRangeIcon className="hidden md:inline text-xl" />
          <span className="text-2xs md:ml-1">2024</span>
        </button>

        {/* Card Jumlah Perusahaan & Tombol Map */}
        <div className="flex flex-row items-center gap-2 flex-nowrap">
          {/* Card Jumlah Perusahaan */}
          <div
            className="flex flex-col items-center justify-center bg-[#ffffff] text-cdark rounded-xl shadow-md font-semibold 
      min-w-[150px] w-[150px] px-3 py-0.5 flex-shrink-0"
          >
            {/* Judul */}
            <div className="mb-1 text-xs font-semibold text-center">
              Jumlah Perusahaan
            </div>

            {/* Label Skala dan Progress Bar */}
            <div className="flex items-center justify-between w-full">
              <span className="text-xs">0</span>

              {/* Progress Bar */}
              <div className="relative h-2.5 flex-1 mx-1 rounded-full overflow-hidden bg-white">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to right, #ffffd4, #fee391, #fec44f, #fe9929, #d95f0e, #993404)",
                  }}
                ></div>
              </div>

              <span className="text-xs">200+</span>
            </div>
          </div>

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
