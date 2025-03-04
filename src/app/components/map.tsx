"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import dynamic from "next/dynamic";
import { useEffect } from "react";

// 🔹 Custom SVG Marker (Leaflet Icon)
const customIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
      <path fill="#1A120B" d="M4 22q-.825 0-1.412-.587T2 20v-8.7q0-.6.325-1.1t.9-.75L7.6 7.6q.5-.2.95.075T9 8.5V9l3.625-1.45q.5-.2.937.1t.438.825V10h8v10q0 .825-.587 1.413T20 22zm7-4h2v-4h-2zm-4 0h2v-4H7zm8 0h2v-4h-2zm6.8-9.5h-4.625l.725-5.625q.05-.375.338-.625T18.9 2h1.225q.375 0 .65.25t.325.625z"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20],
});

// 🔹 Komponen untuk Menambahkan Marker
const MapMarkers = () => {
  const map = useMap(); // Gunakan useMap untuk mendapatkan instance peta

  useEffect(() => {
    if (!map) return;

    L.marker([-7.4559741, 112.6608877], { icon: customIcon })
      .addTo(map)
      .bindPopup("Ini adalah marker custom");
  }, [map]);

  return null; // Tidak merender elemen apa pun secara langsung
};

// 🔹 Gunakan dynamic import untuk menghindari SSR error
const Map = dynamic(
  () =>
    Promise.resolve(() => (
      <div className="relative z-0">
        <MapContainer
          className="w-full h-[calc(100vh-4rem)]"
          center={[-7.4559741, 112.6608877]}
          zoom={11}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapMarkers /> {/* Tambahkan komponen untuk marker */}
        </MapContainer>
      </div>
    )),
  { ssr: false }
);

export default Map;
