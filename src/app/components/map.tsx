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
import { Input } from "antd";
import { Transition } from "@headlessui/react";

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
const style = (feature: any) => ({
  fillColor: getColor(feature.properties.n_perusahaan),
  weight: 2,
  opacity: 1,
  color: "black",
  dashArray: "3",
  fillOpacity: 0.7,
});

const MapComponent = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
              data={geoJsonData}
              style={style}
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
          {[
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
        {/* Tombol Statistik - Responsif */}
        <button
          className="flex items-center justify-center bg-[#EEF0F2] text-cdark rounded-xl shadow-md font-semibold 
        w-10 h-10 md:w-auto md:h-auto px-4 py-1"
        >
          <InsightsOutlinedIcon className="text-xl" />
          <span className="hidden md:inline ml-2 text-2xs">Statistik</span>
        </button>

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
          className="flex items-center justify-center bg-[#EEF0F2] text-cdark rounded-xl shadow-md font-semibold 
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
          className="absolute top-full right-0 z-20 w-64 p-4 bg-[#EEF0F2] rounded-md shadow-md text-cdark mt-2"
        >
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cdark">
                  Tahun
                </label>
                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#ffffff] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="2024">2024</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-cdark">
                  Kecamatan
                </label>
                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#ffffff] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="desa">Semua</option>
                </select>
              </div>
            </div>

            <label className="block mt-4 text-sm font-medium text-cdark">
              Kategori KBLI
            </label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#ffffff] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"></select>

            <label className="block mt-4 text-sm font-medium text-cdark">
              Badan Usaha
            </label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#ffffff] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"></select>

            <label className="block mt-4 text-sm font-medium text-cdark">
              Lokasi Perusahaan
            </label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-[#ffffff] text-cdark focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="desa">1. Kawasan Industri</option>
            </select>
          </div>
        </Transition>
      </div>

      {/* Container untuk Elemen di Bawah */}
      <div className="mx-[5%] fixed bottom-4 left-0 right-0 flex justify-between items-center">
        {/* Tombol Tanggal */}
        <button
          className="flex items-center justify-center bg-[#EEF0F2] text-cdark rounded-xl shadow-md font-semibold 
    px-3 py-2 flex-shrink-0"
        >
          <DateRangeIcon className="hidden md:inline text-xl" />
          <span className="text-2xs md:ml-1">2024</span>
        </button>

        {/* Card Jumlah Perusahaan & Tombol Map */}
        <div className="flex flex-row items-center gap-2 flex-nowrap">
          {/* Card Jumlah Perusahaan */}
          <div
            className="flex flex-col items-center justify-center bg-[#EEF0F2] text-cdark rounded-xl shadow-md font-semibold 
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
              <div className="relative h-2.5 flex-1 mx-1 rounded-full overflow-hidden bg-gray-300">
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

          {/* Tombol Map */}
          <button
            className="flex items-center justify-center bg-[#EEF0F2] text-cdark rounded-xl shadow-md font-semibold 
      w-10 h-10 px-3 py-3 flex-shrink-0"
          >
            <MapIcon className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Gunakan dynamic import untuk menghindari SSR error
export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
