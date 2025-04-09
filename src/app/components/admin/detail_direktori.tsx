"use client";

import React, { useEffect, useRef, useState } from "react";
import AddLocationRoundedIcon from "@mui/icons-material/AddLocationRounded";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { renderToString } from "react-dom/server";
import { useRouter } from "next/navigation";

interface DetailDirektoriProps {
  id_perusahaan: string | string[] | null;
  mode?: "view" | "edit" | "add"; // Tambahkan prop mode
  onSave?: (data: PerusahaanData) => Promise<void>; // Handler untuk tombol simpan
  onCancel?: () => void; // Handler untuk tombol batalkan
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

const DetailDirektori: React.FC<DetailDirektoriProps> = ({
  id_perusahaan,
  mode = "view", // Berikan nilai default 'view'
  onSave,
  onCancel,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PerusahaanData | null>(null);
  const [editedData, setEditedData] = useState<PerusahaanData | null>(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYear, setNewYear] = useState("");
  const leafletMap = useRef<any>(null);
  const leafletMarker = useRef<any>(null);
  const mapInitialized = useRef<boolean>(false);

  // State untuk opsi dropdown
  const [badanUsahaOptions, setBadanUsahaOptions] = useState<any[]>([]);
  const [kecamatanOptions, setKecamatanOptions] = useState<any[]>([]);
  const [desaOptions, setDesaOptions] = useState<any[]>([]);
  const [lokasiOptions, setLokasiOptions] = useState<any[]>([]);
  const [tenagaKerjaOptions, setTenagaKerjaOptions] = useState<any[]>([]);
  const [investasiOptions, setInvestasiOptions] = useState<any[]>([]);
  const [omsetOptions, setOmsetOptions] = useState<any[]>([]);
  const [pclOptions, setPclOptions] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Koordinat tetap BPS Kabupaten Sidoarjo
  const BPS_LAT = -7.4483396;
  const BPS_LON = 112.7039002;

  // Fungsi untuk menghitung jarak
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    // Konversi ke number jika input berupa string
    lat1 = Number(lat1);
    lon1 = Number(lon1);
    lat2 = Number(lat2);
    lon2 = Number(lon2);

    // Konversi ke radian
    const lat1Rad = (Math.PI * lat1) / 180;
    const lon1Rad = (Math.PI * lon1) / 180;
    const lat2Rad = (Math.PI * lat2) / 180;
    const lon2Rad = (Math.PI * lon2) / 180;

    // Rumus Haversine untuk menghitung jarak
    const distance =
      6371 *
      Math.acos(
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.cos(lon2Rad - lon1Rad) +
          Math.sin(lat1Rad) * Math.sin(lat2Rad)
      );

    // Pembulatan ke 2 angka di belakang koma
    return Math.round(distance * 100) / 100;
  };

  //Fungsi untuk menentukan skala
  const determineScale = (tkerja, investasi, omset) => {
    // Konversi ke number jika input berupa string
    tkerja = Number(tkerja);
    investasi = Number(investasi);
    omset = Number(omset);

    // Jika tkerja = 4 (>99 orang) ATAU investasi = 4 (>10M) ATAU omset = 4 (>50M)
    if (tkerja === 4 || investasi === 4 || omset === 4) {
      return "Besar";
    } else {
      return "Sedang";
    }
  };

  // Fungsi untuk menambahkan tahun baru
  const handleAddYear = async () => {
    if (newYear && editedData) {
      // Validasi input tahun (hanya angka 4 digit)
      const yearRegex = /^\d{4}$/;
      if (!yearRegex.test(newYear)) {
        alert("Tahun harus berupa 4 digit angka");
        return;
      }

      const yearNumber = parseInt(newYear, 10);

      // Cek apakah tahun sudah ada dalam array
      if (editedData.tahun_direktori.includes(yearNumber)) {
        alert("Tahun tersebut sudah ada dalam daftar");
        return;
      }

      // For new company (mode === "add"), simply update the local state
      if (mode === "add") {
        const updatedYears = [...editedData.tahun_direktori, yearNumber].sort(
          (a, b) => a - b
        );

        setEditedData({
          ...editedData,
          tahun_direktori: updatedYears,
        });

        setNewYear("");
        setIsAddingYear(false);
        return;
      }

      // For existing company, call the API
      try {
        // Panggil API untuk menambahkan tahun direktori
        const response = await fetch("/api/direktori", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_perusahaan: id_perusahaan,
            thn_direktori: yearNumber,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Error saat menambahkan tahun direktori"
          );
        }

        // Update state lokal
        const updatedYears = [...editedData.tahun_direktori, yearNumber].sort(
          (a, b) => a - b
        );

        setEditedData({
          ...editedData,
          tahun_direktori: updatedYears,
        });

        setNewYear("");
        setIsAddingYear(false);
      } catch (error) {
        console.error("Error adding year:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  // Fungsi untuk menghapus tahun
  const handleRemoveYear = async (yearToRemove) => {
    if (editedData) {
      // For new company (mode === "add"), simply update the local state
      if (mode === "add") {
        // Don't allow removing the last year
        if (editedData.tahun_direktori.length <= 1) {
          alert("Minimal satu tahun direktori diperlukan");
          return;
        }

        const updatedYears = editedData.tahun_direktori.filter(
          (year) => year !== yearToRemove
        );

        setEditedData({
          ...editedData,
          tahun_direktori: updatedYears,
        });
        return;
      }

      // For existing company, call the API
      try {
        // Panggil API untuk menghapus tahun direktori
        const response = await fetch(
          `/api/direktori?id_perusahaan=${id_perusahaan}&thn_direktori=${yearToRemove}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Error saat menghapus tahun direktori"
          );
        }

        // Update state lokal
        const updatedYears = editedData.tahun_direktori.filter(
          (year) => year !== yearToRemove
        );

        setEditedData({
          ...editedData,
          tahun_direktori: updatedYears,
        });
      } catch (error) {
        console.error("Error removing year:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const fetchDropdownOptions = async () => {
    try {
      // Set loading state ketika mulai fetch
      setIsLoadingOptions(true);

      // Fetch badan usaha options
      const buResponse = await fetch("/api/badan-usaha");
      if (buResponse.ok) {
        const buData = await buResponse.json();
        setBadanUsahaOptions(buData.data || []);
      }

      // Fetch kecamatan data
      const kecResponse = await fetch("/api/kecamatan");
      if (kecResponse.ok) {
        const kecData = await kecResponse.json();
        setKecamatanOptions(kecData.data || []);
      }

      // Fetch lokasi perusahaan
      const lokasiResponse = await fetch("/api/lokasi-perusahaan");
      if (lokasiResponse.ok) {
        const lokasiData = await lokasiResponse.json();
        setLokasiOptions(lokasiData.data || []);
      }

      // Fetch tenaga kerja
      const tkerjaResponse = await fetch("/api/tenaga-kerja");
      if (tkerjaResponse.ok) {
        const tkerjaData = await tkerjaResponse.json();
        setTenagaKerjaOptions(tkerjaData.data || []);
      }

      // Fetch investasi
      const investasiResponse = await fetch("/api/investasi");
      if (investasiResponse.ok) {
        const investasiData = await investasiResponse.json();
        setInvestasiOptions(investasiData.data || []);
      }

      // Fetch omset
      const omsetResponse = await fetch("/api/omset");
      if (omsetResponse.ok) {
        const omsetData = await omsetResponse.json();
        setOmsetOptions(omsetData.data || []);
      }

      // Fetch PCL options
      const pclResponse = await fetch("/api/pcl");
      if (pclResponse.ok) {
        const pclData = await pclResponse.json(); // perbaiki dari response menjadi pclResponse
        setPclOptions(pclData.data || []);
      }
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Panggil fungsi fetch dropdown saat komponen dimuat dalam mode edit
  // Jika dalam mode add, selalu fetch dropdown options
  useEffect(() => {
    if (mode === "edit" || mode === "add") {
      fetchDropdownOptions();
    }
  }, [mode]);

  useEffect(() => {
    if ((mode === "edit" || mode === "add") && editedData?.kec) {
      const fetchDesa = async () => {
        try {
          setIsLoadingOptions(true);
          const response = await fetch(`/api/desa?kec_id=${editedData.kec}`);
          if (response.ok) {
            const result = await response.json();
            setDesaOptions(result.data || []);
          }
        } catch (error) {
          console.error("Error fetching desa:", error);
        } finally {
          setIsLoadingOptions(false);
        }
      };

      fetchDesa();
    }
  }, [editedData?.kec, mode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Jika mode add, tidak perlu fetch data
        if (mode === "add") {
          const emptyData = {
            id_perusahaan: null,
            kip: "",
            nama_perusahaan: "",
            badan_usaha: 8, // Default: Tidak Berbadan Usaha
            badan_usaha_nama: "Tidak Berbadan Usaha",
            alamat: "",
            kec: "",
            kec_nama: "",
            des: "",
            des_nama: "",
            kode_pos: "",
            skala: "",
            lok_perusahaan: "",
            lok_perusahaan_nama: "",
            nama_kawasan: "",
            lat: null,
            lon: null,
            jarak: null,
            produk: "",
            KBLI: "",
            telp_perusahaan: "",
            email_perusahaan: "",
            web_perusahaan: "",
            tkerja: "",
            tkerja_nama: "",
            investasi: "",
            investasi_nama: "",
            omset: "",
            omset_nama: "",
            nama_narasumber: "",
            jbtn_narasumber: "",
            email_narasumber: "",
            telp_narasumber: "",
            catatan: "",
            tahun_direktori: [new Date().getFullYear()], // Default tahun saat ini
            pcl_utama: "", // PCL Utama kosong
          };
          setData(emptyData);
          setEditedData(emptyData);
          setLoading(false);
          return;
        }

        // Untuk mode view dan edit, fetch data seperti biasa
        if (id_perusahaan) {
          const response = await fetch(`/api/perusahaan/${id_perusahaan}`);
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          const result = await response.json();
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data perusahaan");
        setLoading(false);
      }
    };

    fetchData();
  }, [id_perusahaan, mode]);

  // Inisialisasi data edit saat data asli berubah
  useEffect(() => {
    if (data) {
      setEditedData({ ...data });
    }
  }, [data]);

  // Handler untuk perubahan input
  const handleInputChange = (field: keyof PerusahaanData, value: any) => {
    if (editedData) {
      // Proses nilai sesuai tipe data yang diharapkan
      let processedValue = value;

      // Proses tipe data agar sesuai dengan ekspektasi database
      if (field === "kip") {
        // Pastikan KIP adalah number atau null
        processedValue = value
          ? value.trim() === ""
            ? null
            : isNaN(Number(value))
              ? null
              : Number(value)
          : null;
      } else if (
        [
          "badan_usaha",
          "kec",
          "des",
          "lok_perusahaan",
          "tkerja",
          "investasi",
          "omset",
        ].includes(field)
      ) {
        // Pastikan field numerik adalah number atau null
        processedValue = value
          ? value === ""
            ? null
            : isNaN(Number(value))
              ? null
              : Number(value)
          : null;
      } else if (["lat", "lon", "jarak"].includes(field)) {
        // Pastikan field floating point adalah number atau null
        // Juga mengizinkan penggantian komma dengan titik untuk desimal
        const normalizedValue =
          typeof value === "string" ? value.replace(",", ".") : value;
        processedValue = normalizedValue
          ? normalizedValue === ""
            ? null
            : isNaN(parseFloat(normalizedValue))
              ? null
              : parseFloat(normalizedValue)
          : null;
      } else if (["telp_perusahaan", "telp_narasumber"].includes(field)) {
        // Pastikan nomor telepon hanya berisi angka, +, dan -
        processedValue = value ? value.replace(/[^\d+\-]/g, "") : null;
      }

      const newData = { ...editedData, [field]: processedValue };

      // Jika kecamatan berubah, kosongkan pilihan desa
      if (field === "kec") {
        newData.des = null;
        newData.des_nama = "";
      }

      // Logging untuk debugging
      console.log(`Field ${field} changed to:`, processedValue);

      // Hanya proses pengisian otomatis dalam mode edit atau add
      if (mode === "edit" || mode === "add") {
        // 1. Pengisian otomatis jarak saat lat atau lon berubah
        if (field === "lat" || field === "lon") {
          const lat = field === "lat" ? processedValue : editedData.lat;
          const lon = field === "lon" ? processedValue : editedData.lon;

          // Hitung jarak jika kedua koordinat tersedia
          if (lat && lon) {
            const distance = calculateDistance(lat, lon, BPS_LAT, BPS_LON);
            if (distance !== null) {
              newData.jarak = distance;
              console.log(`Jarak diperbarui otomatis: ${distance}`);
            }
          }
        }

        // 2. Pengisian otomatis skala saat tkerja, investasi, atau omset berubah
        if (field === "tkerja" || field === "investasi" || field === "omset") {
          const tkerja =
            field === "tkerja" ? processedValue : editedData.tkerja;
          const investasi =
            field === "investasi" ? processedValue : editedData.investasi;
          const omset = field === "omset" ? processedValue : editedData.omset;

          // Tentukan skala jika setidaknya salah satu kriteria tersedia
          if (tkerja || investasi || omset) {
            const newScale = determineScale(tkerja, investasi, omset);
            newData.skala = newScale;
            console.log(`Skala diperbarui otomatis: ${newScale}`);
          }
        }
      }

      setEditedData(newData);
    }
  };

  // Effect hooks untuk mengatur pengisian otomatis saat data pertama kali dimuat
  useEffect(() => {
    if (data && mode === "edit") {
      // Clone data untuk menghindari referensi langsung
      const newData = { ...data };

      // Hitung jarak jika koordinat tersedia
      if (newData.lat && newData.lon) {
        const distance = calculateDistance(
          newData.lat,
          newData.lon,
          BPS_LAT,
          BPS_LON
        );
        if (distance !== null && !newData.jarak) {
          newData.jarak = distance;
        }
      }

      // Tentukan skala berdasarkan kriteria
      if (newData.tkerja || newData.investasi || newData.omset) {
        const autoScale = determineScale(
          newData.tkerja,
          newData.investasi,
          newData.omset
        );
        if (!newData.skala) {
          newData.skala = autoScale;
        }
      }

      // Update editedData dengan kalkulasi otomatis
      setEditedData(newData);
    }
  }, [data, mode]);

  //fungsi validasi sebelum menyimpan perubahan
  const validateData = (): boolean => {
    // Reset pesan error
    const errors: Record<string, string> = {};

    // Validasi nama perusahaan
    if (!editedData?.nama_perusahaan?.trim()) {
      errors.nama_perusahaan = "Nama perusahaan tidak boleh kosong";
    }

    // Validasi alamat
    if (!editedData?.alamat?.trim()) {
      errors.alamat = "Alamat tidak boleh kosong";
    }

    // Validasi tahun direktori
    if (
      !editedData?.tahun_direktori ||
      editedData.tahun_direktori.length === 0
    ) {
      errors.tahun_direktori = "Minimal satu tahun direktori diperlukan";
    }

    // Tampilkan error jika ada
    if (Object.keys(errors).length > 0) {
      const errorMessage = Object.values(errors).join("\n");
      alert(errorMessage);
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (editedData && validateData()) {
      if (mode === "add") {
        // Untuk mode add, hapus id_perusahaan untuk menghindari konflik
        const dataToSave = { ...editedData };
        delete dataToSave.id_perusahaan;
        onSave && onSave(dataToSave);
      } else {
        // Untuk mode edit, kirim data lengkap termasuk id
        onSave && onSave(editedData);
      }
    }
  };

  const handleCancel = () => {
    // Jika ada perubahan, konfirmasi dulu
    if (JSON.stringify(data) !== JSON.stringify(editedData)) {
      if (
        confirm(
          "Perubahan yang Anda buat belum disimpan. Yakin ingin membatalkan?"
        )
      ) {
        onCancel && onCancel();
      }
    } else {
      // Jika tidak ada perubahan, langsung batalkan
      onCancel && onCancel();
    }
  };

  // Fungsi inisialisasi peta
  const initializeMap = async () => {
    // Skip if not on client side or no mapRef
    if (typeof window === "undefined" || !mapRef.current) return;

    try {
      // Dynamically import Leaflet
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Get coordinates based on mode and available data
      let latitude = -7.4483396; // Default to BPS Sidoarjo coordinates
      let longitude = 112.7039002;

      if (
        (mode === "edit" || mode === "add") &&
        editedData?.lat &&
        editedData?.lon
      ) {
        latitude = Number(editedData.lat);
        longitude = Number(editedData.lon);
      } else if (mode === "view" && data?.lat && data?.lon) {
        latitude = Number(data.lat);
        longitude = Number(data.lon);
      } else {
        // If no coordinates, don't initialize map
        return;
      }

      // Create icon
      const iconSVG = renderToString(
        <AddLocationRoundedIcon
          style={{
            color: "#E52020",
            fontSize: 30,
            filter: "drop-shadow(0px 3px 3px rgba(0, 0, 0, 1))",
          }}
        />
      );

      const customIcon = L.divIcon({
        html: iconSVG,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      // Remove existing map if any
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        leafletMarker.current = null;
      }

      // Create new map instance
      const map = L.map(mapRef.current).setView([latitude, longitude], 17);

      L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "&copy; Google Maps",
      }).addTo(map);

      const marker = L.marker([latitude, longitude], {
        icon: customIcon,
      }).addTo(map);

      // Store references
      leafletMap.current = map;
      leafletMarker.current = marker;
      mapInitialized.current = true;

      // Add click handler for edit mode
      if (mode === "edit" || mode === "add") {
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);

          if (editedData) {
            const newData = { ...editedData };
            newData.lat = parseFloat(lat.toFixed(5));
            newData.lon = parseFloat(lng.toFixed(5));

            // Calculate distance
            const distance = calculateDistance(lat, lng, BPS_LAT, BPS_LON);
            if (distance !== null) {
              newData.jarak = distance;
            }

            setEditedData(newData);
          }
        });
      }
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  // Fungsi untuk update posisi marker saat koordinat berubah
  const updateMarkerPosition = () => {
    if (!leafletMap.current || !leafletMarker.current) return;

    let lat, lon;

    if (mode === "edit" || mode === "add") {
      lat = editedData?.lat;
      lon = editedData?.lon;
    } else {
      lat = data?.lat;
      lon = data?.lon;
    }

    if (lat && lon) {
      try {
        const numLat = Number(lat);
        const numLon = Number(lon);

        if (!isNaN(numLat) && !isNaN(numLon)) {
          leafletMarker.current.setLatLng([numLat, numLon]);
          leafletMap.current.setView(
            [numLat, numLon],
            leafletMap.current.getZoom()
          );
        }
      } catch (error) {
        console.error("Error updating marker position:", error);
      }
    }
  };

  // Effect untuk inisialisasi peta
  useEffect(() => {
    if (mapRef.current && !mapInitialized.current) {
      const timer = setTimeout(() => {
        initializeMap();
      }, 100); // Delay pendek untuk memastikan DOM siap

      return () => clearTimeout(timer);
    }
  }, [mapRef.current, data, editedData, mode]);

  // Effect untuk update posisi marker
  useEffect(() => {
    if (mapInitialized.current) {
      updateMarkerPosition();
    }
  }, [editedData?.lat, editedData?.lon, data?.lat, data?.lon]);

  // Effect untuk cleanup saat unmount
  useEffect(() => {
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        leafletMarker.current = null;
        mapInitialized.current = false;
      }
    };
  }, []);

  // Effect untuk reinisialisasi peta saat mode berubah
  useEffect(() => {
    // Reset map initialization flag when mode changes
    mapInitialized.current = false;

    // Remove existing map
    if (leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
      leafletMarker.current = null;
    }

    // Delay untuk memastikan state bersih
    const timer = setTimeout(() => {
      initializeMap();
    }, 200);

    return () => clearTimeout(timer);
  }, [mode]);

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
          <div className="grid grid-cols-4 gap-2">
            <div>
              <p className="text-sm font-semibold">KIP :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.kip || "-"}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.kip || ""}
                  onChange={(e) => handleInputChange("kip", e.target.value)}
                />
              )}
            </div>
            <div className="col-span-3">
              <p className="text-sm font-semibold">Nama perusahaan :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.nama_perusahaan}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.nama_perusahaan || ""}
                  onChange={(e) =>
                    handleInputChange("nama_perusahaan", e.target.value)
                  }
                />
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Alamat :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.alamat || "-"}</p>
              </div>
            ) : (
              <input
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.alamat || ""}
                onChange={(e) => handleInputChange("alamat", e.target.value)}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Kecamatan :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.kec_nama || "-"}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.kec || ""}
                  onChange={(e) =>
                    handleInputChange("kec", parseInt(e.target.value))
                  }
                >
                  <option value="">Pilih Kecamatan</option>
                  {kecamatanOptions.map((option) => (
                    <option key={option.kode_kec} value={option.kode_kec}>
                      {option.kode_kec}. {option.nama_kec}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Desa :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.des_nama || "-"}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.des || ""}
                  onChange={(e) =>
                    handleInputChange("des", parseInt(e.target.value))
                  }
                  disabled={!editedData?.kec || isLoadingOptions}
                >
                  <option value="">Pilih Desa</option>
                  {isLoadingOptions ? (
                    <option disabled>Memuat data...</option>
                  ) : (
                    // Urutkan desaOptions berdasarkan id_des sebelum mapping
                    [...desaOptions]
                      .sort((a, b) => a.id_des - b.id_des)
                      .map((option) => (
                        <option key={option.kode_des} value={option.kode_des}>
                          {option.kode_des}. {option.nama_des}
                        </option>
                      ))
                  )}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Badan Usaha :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.badan_usaha_nama}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.badan_usaha || ""}
                  onChange={(e) =>
                    handleInputChange("badan_usaha", parseInt(e.target.value))
                  }
                >
                  {badanUsahaOptions.length > 0 ? (
                    badanUsahaOptions.map((option) => (
                      <option key={option.id_bu} value={option.id_bu}>
                        {option.id_bu}. {option.ket_bu}
                      </option>
                    ))
                  ) : (
                    <option value="">Loading...</option>
                  )}
                </select>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Lokasi Perusahaan :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.lok_perusahaan_nama}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.lok_perusahaan || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "lok_perusahaan",
                      parseInt(e.target.value)
                    )
                  }
                >
                  <option value="">Pilih Lokasi</option>
                  {lokasiOptions.map((option) => (
                    <option key={option.id_lok} value={option.id_lok}>
                      {option.id_lok}. {option.ket_lok}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Nama Kawasan :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.nama_kawasan || "-"}</p>
              </div>
            ) : (
              <input
                type="text"
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.nama_kawasan || ""}
                onChange={(e) =>
                  handleInputChange("nama_kawasan", e.target.value)
                }
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Kode Pos :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.kode_pos}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.kode_pos || ""}
                  onChange={(e) =>
                    handleInputChange("kode_pos", e.target.value)
                  }
                />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">KBLI :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.KBLI}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.KBLI || ""}
                  onChange={(e) => handleInputChange("KBLI", e.target.value)}
                />
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Produk :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.produk || "-"}</p>
              </div>
            ) : (
              <input
                type="text"
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.produk || ""}
                onChange={(e) => handleInputChange("produk", e.target.value)}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Telepon :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.telp_perusahaan || "-"}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.telp_perusahaan || ""}
                  onChange={(e) =>
                    handleInputChange("telp_perusahaan", e.target.value)
                  }
                />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Email :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.email_perusahaan || "-"}</p>
                </div>
              ) : (
                <input
                  type="email"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.email_perusahaan || ""}
                  onChange={(e) =>
                    handleInputChange("email_perusahaan", e.target.value)
                  }
                />
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Website :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.web_perusahaan || "-"}</p>
              </div>
            ) : (
              <input
                type="text"
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.web_perusahaan || ""}
                onChange={(e) =>
                  handleInputChange("web_perusahaan", e.target.value)
                }
              />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">PCL Utama :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.pcl_utama || "-"}</p>
              </div>
            ) : (
              <select
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.pcl_utama || ""}
                onChange={(e) => handleInputChange("pcl_utama", e.target.value)}
              >
                <option value="">-- Pilih PCL --</option>
                {pclOptions.map((option) => (
                  <option key={option.id_pcl} value={option.nama_pcl}>
                    {option.nama_pcl} ({option.status_pcl})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-sm font-semibold">Latitude :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.lat || "-"}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.lat || ""}
                  onChange={(e) => handleInputChange("lat", e.target.value)}
                />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Longitude :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.lon || "-"}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.lon || ""}
                  onChange={(e) => handleInputChange("lon", e.target.value)}
                />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Jarak (Km) :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.jarak || "-"}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.jarak || ""}
                  onChange={(e) => handleInputChange("jarak", e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="relative">
            {(mode === "view" && data?.lat && data?.lon) ||
            (mode !== "view" && editedData?.lat && editedData?.lon) ? (
              <>
                <div
                  ref={mapRef}
                  className="w-full rounded-lg h-48"
                  id="map-container"
                ></div>
                <button
                  onClick={() => {
                    const coordinates =
                      mode === "view"
                        ? `${data.lat},${data.lon}`
                        : `${editedData.lat},${editedData.lon}`;
                    window.open(
                      `https://www.google.com/maps?q=${coordinates}&z=17&t=k`,
                      "_blank"
                    );
                  }}
                  className="absolute top-3 right-3 bg-white p-1 rounded-md shadow-md hover:bg-gray-100 z-[999]"
                  title="Buka di Google Maps Satelit"
                >
                  <FullscreenIcon style={{ fontSize: 24, color: "#555" }} />
                </button>
              </>
            ) : (
              <div className="w-full p-4 rounded-lg h-48 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">
                  {mode === "add" || mode === "edit"
                    ? "Masukkan koordinat untuk menampilkan peta"
                    : "Koordinat tidak tersedia"}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Tenaga Kerja :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.tkerja_nama}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.tkerja || ""}
                  onChange={(e) =>
                    handleInputChange("tkerja", parseInt(e.target.value))
                  }
                >
                  <option value="">Pilih Tenaga Kerja</option>
                  {tenagaKerjaOptions.map((option) => (
                    <option key={option.id_tkerja} value={option.id_tkerja}>
                      {option.id_tkerja}. {option.ket_tkerja}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Investasi :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.investasi_nama}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.investasi || ""}
                  onChange={(e) =>
                    handleInputChange("investasi", parseInt(e.target.value))
                  }
                >
                  <option value="">Pilih Investasi</option>
                  {investasiOptions.map((option) => (
                    <option
                      key={option.id_investasi}
                      value={option.id_investasi}
                    >
                      {option.id_investasi}. {option.ket_investasi}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Omset :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.omset_nama}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.omset || ""}
                  onChange={(e) =>
                    handleInputChange("omset", parseInt(e.target.value))
                  }
                >
                  <option value="">Pilih Omset</option>
                  {omsetOptions.map((option) => (
                    <option key={option.id_omset} value={option.id_omset}>
                      {option.id_omset}. {option.ket_omset}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Skala :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.skala}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.skala || ""}
                  onChange={(e) => handleInputChange("skala", e.target.value)}
                >
                  <option value="">Pilih Skala</option>
                  <option value="Besar">Besar</option>
                  <option value="Sedang">Sedang</option>
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Narasumber :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.nama_narasumber || "-"}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.nama_narasumber || ""}
                  onChange={(e) =>
                    handleInputChange("nama_narasumber", e.target.value)
                  }
                />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Jabatan Narasumber :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.jbtn_narasumber || "-"}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.jbtn_narasumber || ""}
                  onChange={(e) =>
                    handleInputChange("jbtn_narasumber", e.target.value)
                  }
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Telepon Narasumber :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.telp_narasumber || "-"}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.telp_narasumber || ""}
                  onChange={(e) =>
                    handleInputChange("telp_narasumber", e.target.value)
                  }
                />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Email Narasumber :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.email_narasumber || "-"}</p>
                </div>
              ) : (
                <input
                  type="email"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.email_narasumber || ""}
                  onChange={(e) =>
                    handleInputChange("email_narasumber", e.target.value)
                  }
                />
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Catatan :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.catatan || "-"}</p>
              </div>
            ) : (
              <input
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.catatan || ""}
                onChange={(e) => handleInputChange("catatan", e.target.value)}
              />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Tahun Direktori:</p>
            {mode === "view" ? (
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
            ) : (
              <div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editedData?.tahun_direktori.map((tahun) => (
                    <div
                      key={tahun}
                      className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full flex items-center"
                    >
                      <span>{tahun}</span>
                      <button
                        type="button"
                        className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        onClick={() => handleRemoveYear(tahun)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {isAddingYear ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        className="border border-gray-300 rounded-l-lg px-3 py-1 text-sm w-20"
                        placeholder="YYYY"
                        maxLength={4}
                        value={newYear}
                        onChange={(e) =>
                          setNewYear(e.target.value.replace(/[^0-9]/g, ""))
                        }
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddYear();
                          if (e.key === "Escape") {
                            setIsAddingYear(false);
                            setNewYear("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="bg-blue-500 text-white rounded-r-lg px-2 py-1 text-sm"
                        onClick={handleAddYear}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="bg-gray-200 hover:bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center"
                      onClick={() => setIsAddingYear(true)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                {editedData?.tahun_direktori.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Tidak ada tahun yang dipilih
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tombol aksi (edit/add) */}
      {(mode === "edit" || mode === "add") && editedData && (
        <div className="mt-4 flex justify-end space-x-3 text-sm">
          <button
            onClick={handleCancel}
            className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Batalkan
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Simpan
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailDirektori;
