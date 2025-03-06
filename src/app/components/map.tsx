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

  useEffect(() => {
    fetch("/data/polygon_wilayah.geojson")
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data)) // Perbaiki: ambil langsung `data`
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

  return (
    <div className="relative z-0">
      <MapContainer
        className="w-full h-[calc(100vh-4rem)]"
        center={[-7.4559741, 112.6608877]}
        zoom={11}
        scrollWheelZoom={true}
      >
        {/* 🔹 Layer Default */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

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

        {/* 🔹 Layer Control untuk Opsi Peta */}
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="ESRI Imagery">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">ESRI</a> contributors'
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
      </MapContainer>
    </div>
  );
};

// Gunakan dynamic import untuk menghindari SSR error
export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
