"use client";

import React, { useEffect, useState } from "react";
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
// This will be a function that depends on selectedLayers
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

const data_pie = [
  { name: "Besar", value: 27 },
  { name: "Sedang", value: 18 },
];
const COLORS = ["#74512D", "#AF8F6F"];

const MapComponent = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState({
    choropleth: false,
    titik: false,
  });

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
    setGeoJsonKey(prevKey => prevKey + 1);
  }, [selectedLayers]);

  useEffect(() => {
    fetch("/data/polygon_wilayah.geojson")
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data)) // Perbaiki: ambil langsung `data`
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

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

          {/* 🔹 Marker Lokasi Pabrik */}
          {selectedLayers.titik && // Hanya render jika layer titik aktif
            [
              [-7.4613729, 112.7512429],
              [-7.46723, 112.7511728],
              [-7.4605657, 112.7490335],
              [-7.4634277, 112.751578],
            ].map((pos, idx) => (
              <Marker
                key={idx}
                position={pos as L.LatLngExpression}
                icon={markerIcon}
              >
                <Popup>Pabrik {String.fromCharCode(65 + idx)}</Popup>
              </Marker>
            ))}
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
              <CountUp start={0} end={45} duration={3} />
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
                  // fill="#ffffff"
                  // dataKey="value"
                  // label
                >
                  {data_pie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
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
    </div>
  );
};

// Gunakan dynamic import untuk menghindari SSR error
export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });