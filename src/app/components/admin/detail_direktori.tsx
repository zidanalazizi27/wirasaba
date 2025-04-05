"use client";

import React, { useEffect, useRef, useState } from "react";
import AddLocationRoundedIcon from "@mui/icons-material/AddLocationRounded";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { renderToString } from "react-dom/server";
import { useRouter } from "next/navigation";

interface DetailDirektoriProps {
  id_perusahaan: string | string[];
}

interface PerusahaanData {
  id_perusahaan: number;
  kip: string | number;
  nama_perusahaan: string;
  badan_usaha: number;
  badan_usaha_nama: string;
  alamat: string;
  kec: number;
  kec_nama: string;
  des: number;
  des_nama: string;
  kode_pos: string;
  skala: string;
  lok_perusahaan: number;
  lok_perusahaan_nama: string;
  nama_kawasan: string | null;
  lat: number | null;
  lon: number | null;
  jarak: number | null;
  produk: string;
  KBLI: number;
  telp_perusahaan: string | null;
  email_perusahaan: string | null;
  web_perusahaan: string | null;
  tkerja: number;
  tkerja_nama: string;
  investasi: number;
  investasi_nama: string;
  omset: number;
  omset_nama: string;
  nama_narasumber: string;
  jbtn_narasumber: string;
  email_narasumber: string | null;
  telp_narasumber: string | null;
  catatan: string | null;
  tahun_direktori: number[];
  pcl_utama: string;
}

const DetailDirektori: React.FC<DetailDirektoriProps> = ({ id_perusahaan }) => {
  const mapRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PerusahaanData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch data perusahaan dari API berdasarkan id_perusahaan
        const response = await fetch(`/api/perusahaan/${id_perusahaan}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data perusahaan");
        setLoading(false);
      }
    };

    if (id_perusahaan) {
      fetchData();
    }
  }, [id_perusahaan]);

  useEffect(() => {
    // Memastikan Leaflet hanya dijalankan di client-side dan hanya jika data sudah ada
    if (typeof window !== "undefined" && data && data.lat && data.lon) {
      // Async import Leaflet untuk client-side rendering
      const loadMap = async () => {
        const L = (await import("leaflet")).default;
        // Pastikan CSS Leaflet dimuat
        await import("leaflet/dist/leaflet.css");

        // Koordinat dari data
        const latitude = data.lat;
        const longitude = data.lon;

        // Render Material-UI icon ke string SVG
        const iconSVG = renderToString(
          <AddLocationRoundedIcon
            style={{
              color: "#E52020",
              fontSize: 30,
              filter: "drop-shadow(0px 3px 3px rgba(0, 0, 0, 1))",
            }}
          />
        );

        if (mapRef.current && !mapRef.current._leaflet_id) {
          const map = L.map(mapRef.current, {
            dragging: true,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
          }).setView([latitude, longitude], 17);

          // Menambahkan layer Google Satellite
          L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
            maxZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
            attribution: "&copy; Google Maps",
          }).addTo(map);

          // Membuat custom icon dengan SVG
          const customIcon = L.divIcon({
            html: iconSVG,
            className: "",
            iconSize: [36, 36],
            iconAnchor: [18, 36],
          });

          // Menambahkan marker dengan custom icon
          L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
        }
      };

      loadMap();
    }

    // Cleanup function
    return () => {
      if (mapRef.current && mapRef.current._leaflet_id) {
        mapRef.current._leaflet_id = null;
      }
    };
  }, [data]);

  if (loading) {
    return <div className="p-4 text-center">Memuat data...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error || "Data tidak ditemukan"}</p>
        <button
          onClick={() => router.push("/admin/direktori")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kolom Kiri */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Nama perusahaan :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.nama_perusahaan}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Badan Usaha :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.badan_usaha_nama}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Alamat :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.alamat}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Kecamatan :</p>
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.kec_nama || "-"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Desa :</p>
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.des_nama || "-"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-sm font-semibold">Kode Pos :</p>
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.kode_pos}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Skala :</p>
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.skala}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">KBLI :</p>
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.KBLI}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Telepon :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.telp_perusahaan || "-"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Email :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.email_perusahaan || "-"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Website :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.web_perusahaan || "-"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Produk :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.produk}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Tahun Direktori:</p>
            <div className="flex gap-2">
              {data.tahun_direktori.map((tahun) => (
                <div
                  key={tahun}
                  className="bg-gray-200 font-medium text-sm px-4 py-2 rounded-lg"
                >
                  <p>{tahun}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">PCL Utama :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.pcl_utama || "-"}</p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Lokasi Perusahaan :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.lok_perusahaan_nama}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Nama Kawasan :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.nama_kawasan || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Latitude :</p>
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.lat || "-"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Longitude :</p>
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.lon || "-"}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            {data.lat && data.lon ? (
              <>
                <div ref={mapRef} className="w-full p-2 rounded-lg h-48"></div>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${data.lat},${data.lon}&z=17&t=k`,
                      "_blank"
                    )
                  }
                  className="absolute top-3 right-3 bg-white p-1 rounded-md shadow-md hover:bg-gray-100 z-[1000]"
                  title="Buka di Google Maps Satelit"
                >
                  <FullscreenIcon style={{ fontSize: 24, color: "#555" }} />
                </button>
              </>
            ) : (
              <div className="w-full p-4 rounded-lg h-48 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Koordinat tidak tersedia</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Jarak (KM) :</p>
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.jarak || "-"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Tenaga Kerja :</p>
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.tkerja_nama}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Investasi :</p>
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.investasi_nama}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Omset :</p>
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.omset_nama}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Narasumber :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.nama_narasumber}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Telepon Narasumber :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.telp_narasumber || "-"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Email Narasumber :</p>
            <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
              <p>{data.email_narasumber || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailDirektori;
