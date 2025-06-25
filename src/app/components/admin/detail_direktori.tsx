"use client";

import React, { useEffect, useRef, useState } from "react";
import AddLocationRoundedIcon from "@mui/icons-material/AddLocationRounded";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { renderToString } from "react-dom/server";
import { useRouter } from "next/navigation";
import { SweetAlertUtils } from "@/app/utils/sweetAlert";

interface DetailDirektoriProps {
  id_perusahaan: string | string[] | null;
  mode?: "view" | "edit" | "add"; // Tambahkan prop mode
  onSave?: (data: PerusahaanData) => Promise<void>; // Handler untuk tombol simpan
  onCancel?: () => void; // Handler untuk tombol batalkan
}

//intrface untuk validasi input
interface ValidationErrors {
  [key: string]: string;
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
  const [isSaving, setIsSaving] = useState(false);
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

  // State untuk validasi
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [showTooltip, setShowTooltip] = useState<{ [key: string]: boolean }>(
    {}
  );

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

  // Fungsi validasi field
  const validateField = (field: string, value: any): string => {
    const errors: string[] = [];

    switch (field) {
      case "kip":
        if (value && value !== "") {
          const kipStr = value.toString();
          if (!/^\d+$/.test(kipStr)) {
            errors.push("KIP harus berupa angka saja");
          }
          if (kipStr.length > 10) {
            errors.push("KIP maksimal 10 digit");
          }
        }
        break;

      case "kode_pos":
        if (value && value !== "") {
          const kodeposStr = value.toString();
          if (!/^\d{5}$/.test(kodeposStr)) {
            errors.push("Kode pos harus berupa 5 digit angka");
          }
        }
        break;

      case "KBLI":
        if (!value || value === "") {
          errors.push("KBLI wajib diisi");
        } else {
          const kbliStr = value.toString();
          if (!/^\d{5}$/.test(kbliStr)) {
            errors.push("KBLI harus berupa 5 digit angka");
          }
        }
        break;

      case "lat":
        if (value && value !== "") {
          const lat = parseFloat(value);
          if (isNaN(lat)) {
            errors.push("Latitude harus berupa angka desimal");
          } else if (lat < -90 || lat > 90) {
            errors.push("Latitude harus dalam rentang -90 sampai 90");
          }
        }
        break;

      case "lon":
        if (value && value !== "") {
          const lon = parseFloat(value);
          if (isNaN(lon)) {
            errors.push("Longitude harus berupa angka desimal");
          } else if (lon < -180 || lon > 180) {
            errors.push("Longitude harus dalam rentang -180 sampai 180");
          }
        }
        break;

      case "nama_perusahaan":
      case "alamat":
      case "produk":
        if (!value || value.toString().trim() === "") {
          const fieldNames = {
            nama_perusahaan: "Nama perusahaan",
            alamat: "Alamat",
            produk: "Produk",
          };
          errors.push(`${fieldNames[field]} tidak boleh kosong`);
        }
        break;

      case "kec":
        if (!value || value === "") {
          errors.push("Kecamatan tidak boleh kosong");
        }
        break;

      case "des":
        if (!value || value === "") {
          errors.push("Desa tidak boleh kosong");
        }
        break;

      case "badan_usaha":
      case "lok_perusahaan":
      case "tkerja":
      case "investasi":
      case "omset":
      case "skala":
        if (!value || value === "") {
          const fieldNames = {
            badan_usaha: "Badan Usaha",
            lok_perusahaan: "Lokasi Perusahaan",
            tkerja: "Tenaga Kerja",
            investasi: "Investasi",
            omset: "Omset",
            skala: "Skala",
          };
          errors.push(`${fieldNames[field]} tidak boleh kosong`);
        }
        break;
    }

    return errors.join("; ");
  };

  // Fungsi validasi lengkap
  const validateAllFields = (): boolean => {
    const errors: ValidationErrors = {};
    const requiredFields = [
      "kip",
      "nama_perusahaan",
      "alamat",
      "kec",
      "des",
      "badan_usaha",
      "lok_perusahaan",
      "KBLI",
      "produk",
      "lat",
      "lon",
      "tkerja",
      "investasi",
      "omset",
      "skala",
    ];

    requiredFields.forEach((field) => {
      const value = editedData?.[field];
      const error = validateField(field, value);

      if (error) {
        errors[field] = error;
      }
    });

    // Validasi tahun direktori
    if (
      !editedData?.tahun_direktori ||
      editedData.tahun_direktori.length === 0
    ) {
      errors["tahun_direktori"] = "Minimal satu tahun direktori diperlukan";
    } else {
      editedData.tahun_direktori.forEach((year: number) => {
        if (year < 2000 || year > 2100) {
          errors["tahun_direktori"] =
            "Tahun direktori harus dalam rentang 2000-2100";
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fungsi tooltip
  const showFieldTooltip = (field: string, message: string) => {
    setValidationErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
    setShowTooltip((prev) => ({
      ...prev,
      [field]: true,
    }));

    setTimeout(() => {
      setShowTooltip((prev) => ({
        ...prev,
        [field]: false,
      }));
    }, 3000);
  };

  // Handler input dengan validasi
  const handleInputChangeWithValidation = (
    field: keyof PerusahaanData,
    value: any
  ) => {
    let processedValue = value;

    // Filter input berdasarkan field
    if (field === "kip") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) {
        showFieldTooltip("kip", "KIP maksimal 10 digit");
        return;
      }
      if (value && !/^\d*$/.test(value)) {
        showFieldTooltip("kip", "KIP harus berupa angka saja");
        return;
      }
      processedValue = numericValue;
    } else if (field === "kode_pos") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 5) {
        showFieldTooltip("kode_pos", "Kode pos maksimal 5 digit");
        return;
      }
      processedValue = numericValue;
    } else if (field === "KBLI") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 5) {
        showFieldTooltip("KBLI", "KBLI maksimal 5 digit");
        return;
      }
      processedValue = numericValue;
    } else if (field === "lat") {
      const latPattern = /^-?\d*\.?\d*$/;
      if (value && !latPattern.test(value)) {
        showFieldTooltip(
          "lat",
          "Latitude harus berupa angka desimal (bisa negatif)"
        );
        return;
      }
      if (value) {
        const lat = parseFloat(value);
        if (!isNaN(lat) && (lat < -90 || lat > 90)) {
          showFieldTooltip("lat", "Latitude harus dalam rentang -90 sampai 90");
          return;
        }
      }
      processedValue = value;
    } else if (field === "lon") {
      const lonPattern = /^-?\d*\.?\d*$/;
      if (value && !lonPattern.test(value)) {
        showFieldTooltip("lon", "Longitude harus berupa angka desimal");
        return;
      }
      if (value) {
        const lon = parseFloat(value);
        if (!isNaN(lon) && (lon < -180 || lon > 180)) {
          showFieldTooltip(
            "lon",
            "Longitude harus dalam rentang -180 sampai 180"
          );
          return;
        }
      }
      processedValue = value;
    }

    // Validasi khusus untuk desa vs kecamatan
    if (
      field === "des" &&
      processedValue &&
      (!editedData?.kec || editedData.kec === "")
    ) {
      showFieldTooltip(
        "des",
        "Pilih kecamatan terlebih dahulu sebelum memilih desa"
      );
      return;
    }

    // Clear validation error untuk field ini
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    // Panggil handler input yang asli
    handleInputChange(field, processedValue);
  };

  // Handler tahun dengan validasi
  const handleAddYearWithValidation = async () => {
    if (newYear && editedData) {
      const yearRegex = /^\d{4}$/;
      if (!yearRegex.test(newYear)) {
        showFieldTooltip("newYear", "Tahun harus berupa 4 digit angka");
        return;
      }

      const yearNumber = parseInt(newYear, 10);

      if (yearNumber < 2000 || yearNumber > 2100) {
        showFieldTooltip("newYear", "Tahun harus dalam rentang 2000-2100");
        return;
      }

      if (editedData.tahun_direktori.includes(yearNumber)) {
        SweetAlertUtils.error(
          "Duplikasi Data",
          "Tahun tersebut sudah ada dalam daftar"
        );
        return;
      }

      // Lanjutkan dengan handleAddYear yang asli
      handleAddYear();
    }
  };

  // Handler save dengan validasi
  const handleSaveWithValidation = () => {
    if (editedData && validateAllFields()) {
      if (mode === "add") {
        const dataToSave = { ...editedData };
        delete dataToSave.id_perusahaan;
        onSave && onSave(dataToSave);
      } else {
        onSave && onSave(editedData);
      }
    } else {
      const errorMessages = Object.entries(validationErrors)
        .map(([field, error]) => {
          const fieldNames = {
            kip: "KIP",
            nama_perusahaan: "Nama Perusahaan",
            alamat: "Alamat",
            kec: "Kecamatan",
            des: "Desa",
            badan_usaha: "Badan Usaha",
            lok_perusahaan: "Lokasi Perusahaan",
            KBLI: "KBLI",
            produk: "Produk",
            lat: "Latitude",
            lon: "Longitude",
            tkerja: "Tenaga Kerja",
            investasi: "Investasi",
            omset: "Omset",
            skala: "Skala",
            tahun_direktori: "Tahun Direktori",
          };
          return ` ${fieldNames[field] || field}: ${error}`;
        })
        .join("\n");

      SweetAlertUtils.warning(
        "Mohon Perbaiki Input",
        `Mohon perbaiki kesalahan input berikut:\n\n${errorMessages}`,
        {
          customClass: {
            content: "text-left whitespace-pre-line",
          },
        }
      );
    }
  };

  // Komponen tooltip error
  const ErrorTooltip: React.FC<{ field: string }> = ({ field }) => {
    const error = validationErrors[field];
    const show = showTooltip[field] || !!error;

    if (!show) return null;

    return (
      <div className="absolute z-10 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap max-w-xs">
        {error}
        <div className="absolute top-full left-2 border-4 border-transparent border-t-red-500"></div>
      </div>
    );
  };

  // Fungsi class name
  const getInputClassName = (field: string, baseClassName: string) => {
    const hasError = validationErrors[field];
    return `${baseClassName} ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"}`;
  };

  // Fungsi untuk menambahkan tahun baru
  const handleAddYear = async () => {
    if (newYear && editedData) {
      // Validasi input tahun (hanya angka 4 digit)
      const yearRegex = /^\d{4}$/;
      if (!yearRegex.test(newYear)) {
        SweetAlertUtils.error(
          "Input Error",
          "Tahun harus berupa 4 digit angka"
        );
        return;
      }

      const yearNumber = parseInt(newYear, 10);

      // Cek apakah tahun sudah ada dalam array
      if (editedData.tahun_direktori.includes(yearNumber)) {
        SweetAlertUtils.error(
          "Duplikasi Data",
          "Tahun tersebut sudah ada dalam daftar"
        );
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
        SweetAlertUtils.error("Error", `Error: ${error.message}`);
      }
    }
  };

  // Fungsi untuk menghapus tahun
  // Fungsi untuk menghapus tahun
  const handleRemoveYear = async (yearToRemove) => {
    if (editedData) {
      // For new company (mode === "add"), simply update the local state
      if (mode === "add") {
        // Don't allow removing the last year
        if (editedData.tahun_direktori.length <= 1) {
          SweetAlertUtils.error(
            "Validation Error",
            "Minimal satu tahun direktori diperlukan"
          );
          return;
        }

        // Konfirmasi sebelum hapus
        const confirmed = await SweetAlertUtils.confirmDelete(
          "Hapus Tahun Direktori",
          `Apakah Anda yakin ingin menghapus tahun ${yearToRemove}?`
        );

        if (!confirmed) return;

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
        // Konfirmasi sebelum hapus untuk mode edit
        const confirmed = await SweetAlertUtils.confirmDelete(
          "Hapus Tahun Direktori",
          `Apakah Anda yakin ingin menghapus tahun ${yearToRemove}?`
        );

        if (!confirmed) return;

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

        // Toast sukses
        SweetAlertUtils.toast(
          `Tahun ${yearToRemove} berhasil dihapus`,
          "success"
        );
      } catch (error) {
        console.error("Error removing year:", error);
        SweetAlertUtils.error("Error", `Error: ${error.message}`);
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
      const pclResponse = await fetch("/api/pcl?format=dropdown");
      if (pclResponse.ok) {
        const pclData = await pclResponse.json();
        // Periksa struktur pclData untuk menangani format lama dan baru
        if (Array.isArray(pclData)) {
          setPclOptions(pclData);
        } else if (pclData.data && Array.isArray(pclData.data)) {
          // Tangani format API baru
          setPclOptions(
            pclData.data.map((item) => ({
              name: `${item.nama_pcl} (${item.status_pcl})`,
              uid: item.nama_pcl,
            }))
          );
        }
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
      SweetAlertUtils.validationError(Object.values(errors));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!editedData || !validateData()) return;

    const confirmed = await SweetAlertUtils.confirmSave(
      "Konfirmasi Penyimpanan",
      mode === "add"
        ? "Apakah Anda yakin ingin menyimpan data perusahaan baru?"
        : "Apakah Anda yakin ingin menyimpan perubahan data?"
    );

    if (confirmed) {
      if (mode === "add") {
        const dataToSave = { ...editedData };
        delete dataToSave.id_perusahaan;
        onSave && onSave(dataToSave);
      } else {
        onSave && onSave(editedData);
      }
    }
  };

  const handleCancel = async () => {
    const hasChanges = JSON.stringify(data) !== JSON.stringify(editedData);

    if (hasChanges || mode === "add") {
      const confirmed = await SweetAlertUtils.confirmCancel();
      if (!confirmed) return;
    }

    onCancel && onCancel();
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
                <div className="relative">
                  <input
                    type="text"
                    className={getInputClassName(
                      "kip",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.kip || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation("kip", e.target.value)
                    }
                    placeholder="Maks 10 digit *"
                    maxLength={10}
                  />
                  <ErrorTooltip field="kip" />
                </div>
              )}
            </div>
            <div className="col-span-3">
              <p className="text-sm font-semibold">Nama perusahaan :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.nama_perusahaan}</p>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    className={getInputClassName(
                      "nama_perusahaan",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.nama_perusahaan || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation(
                        "nama_perusahaan",
                        e.target.value
                      )
                    }
                    placeholder="Masukkan nama perusahaan *"
                  />
                  <ErrorTooltip field="nama_perusahaan" />
                </div>
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
              <div className="relative">
                <input
                  className={getInputClassName(
                    "alamat",
                    "border font-medium text-sm p-2 rounded-lg w-full"
                  )}
                  value={editedData?.alamat || ""}
                  onChange={(e) =>
                    handleInputChangeWithValidation("alamat", e.target.value)
                  }
                  placeholder="Masukkan alamat lengkap *"
                />
                <ErrorTooltip field="alamat" />
              </div>
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
                <div className="relative">
                  <select
                    className={getInputClassName(
                      "kec",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.kec || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation(
                        "kec",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value="">Pilih Kecamatan *</option>
                    {kecamatanOptions.map((option, index) => (
                      <option
                        key={`kec-${option.kode_kec || index}`}
                        value={option.kode_kec}
                      >
                        {option.kode_kec}. {option.nama_kec}
                      </option>
                    ))}
                  </select>
                  <ErrorTooltip field="kec" />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Desa :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.des_nama || "-"}</p>
                </div>
              ) : (
                <div className="relative">
                  <select
                    className={getInputClassName(
                      "des",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.des || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation(
                        "des",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={!editedData?.kec || isLoadingOptions}
                  >
                    <option value="">Pilih Desa *</option>
                    {isLoadingOptions ? (
                      <option disabled>Memuat data...</option>
                    ) : (
                      // Urutkan desaOptions berdasarkan id_des sebelum mapping
                      [...desaOptions]
                        .sort((a, b) => a.id_des - b.id_des)
                        .map((option, index) => (
                          <option
                            key={`desa-${option.kode_des || option.id_des || index}`}
                            value={option.kode_des}
                          >
                            {option.kode_des}. {option.nama_des}
                          </option>
                        ))
                    )}
                  </select>
                  <ErrorTooltip field="des" />
                </div>
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
                <div className="relative">
                  <select
                    className={getInputClassName(
                      "badan_usaha",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.badan_usaha || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation(
                        "badan_usaha",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value="">Pilih Badan Usaha *</option>
                    {badanUsahaOptions.map((option, index) => (
                      <option
                        key={`badan-${option.id_bu || index}`}
                        value={option.id_bu}
                      >
                        {option.id_bu}. {option.ket_bu}
                      </option>
                    ))}
                  </select>
                  <ErrorTooltip field="badan_usaha" />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Lokasi Perusahaan :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.lok_perusahaan_nama}</p>
                </div>
              ) : (
                <div className="relative">
                  <select
                    className={getInputClassName(
                      "lok_perusahaan",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.lok_perusahaan || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation(
                        "lok_perusahaan",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value="">Pilih Lokasi Perusahaan *</option>
                    {lokasiOptions.map((option, index) => (
                      <option
                        key={`lokasi-${option.id_lok || index}`}
                        value={option.id_lok}
                      >
                        {option.id_lok}. {option.ket_lok}
                      </option>
                    ))}
                  </select>
                  <ErrorTooltip field="lok_perusahaan" />
                </div>
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
                <div className="relative">
                  <input
                    type="text"
                    className={getInputClassName(
                      "kode_pos",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.kode_pos || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation(
                        "kode_pos",
                        e.target.value
                      )
                    }
                    placeholder="5 digit"
                    maxLength={5}
                  />
                  <ErrorTooltip field="kode_pos" />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">KBLI :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.KBLI}</p>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    className={getInputClassName(
                      "KBLI",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.KBLI || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation("KBLI", e.target.value)
                    }
                    placeholder="5 digit angka (wajib) *"
                    maxLength={5}
                  />
                  <ErrorTooltip field="KBLI" />
                </div>
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
              <div className="relative">
                <input
                  type="text"
                  className={getInputClassName(
                    "produk",
                    "border font-medium text-sm p-2 rounded-lg w-full"
                  )}
                  value={editedData?.produk || ""}
                  onChange={(e) =>
                    handleInputChangeWithValidation("produk", e.target.value)
                  }
                  placeholder="Masukkan produk/jasa *"
                />
                <ErrorTooltip field="produk" />
              </div>
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
                {pclOptions.map((option, index) => (
                  <option key={`pcl-${option.uid || index}`} value={option.uid}>
                    {option.name}
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
              <p className="text-sm font-semibold">Lintang (Latitude) :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.lat || "-"}</p>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    className={getInputClassName(
                      "lat",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.lat || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation("lat", e.target.value)
                    }
                    placeholder="-90 s/d 90 *"
                  />
                  <ErrorTooltip field="lat" />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Bujur (Longitude) :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.lon || "-"}</p>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    className={getInputClassName(
                      "lon",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.lon || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation("lon", e.target.value)
                    }
                    placeholder="-180 s/d 180 *"
                  />
                  <ErrorTooltip field="lon" />
                </div>
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
                <div className="relative">
                  <select
                    className={getInputClassName(
                      "tkerja",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.tkerja || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation(
                        "tkerja",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value="">Pilih Tenaga Kerja *</option>
                    {tenagaKerjaOptions.map((option, index) => (
                      <option
                        key={`tkerja-${option.id_tkerja || index}`}
                        value={option.id_tkerja}
                      >
                        {option.id_tkerja}. {option.ket_tkerja}
                      </option>
                    ))}
                  </select>
                  <ErrorTooltip field="tkerja" />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Investasi :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.investasi_nama}</p>
                </div>
              ) : (
                <div className="relative">
                  <select
                    className={getInputClassName(
                      "investasi",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.investasi || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation(
                        "investasi",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value="">Pilih Investasi *</option>
                    {investasiOptions.map((option, index) => (
                      <option
                        key={`investasi-${option.id_investasi || index}`}
                        value={option.id_investasi}
                      >
                        {option.id_investasi}. {option.ket_investasi}
                      </option>
                    ))}
                  </select>
                  <ErrorTooltip field="investasi" />
                </div>
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
                <div className="relative">
                  <select
                    className={getInputClassName(
                      "omset",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.omset || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation(
                        "omset",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value="">Pilih Omset *</option>
                    {omsetOptions.map((option, index) => (
                      <option
                        key={`omset-${option.id_omset || index}`}
                        value={option.id_omset}
                      >
                        {option.id_omset}. {option.ket_omset}
                      </option>
                    ))}
                  </select>
                  <ErrorTooltip field="omset" />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Skala :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.skala}</p>
                </div>
              ) : (
                <div className="relative">
                  <select
                    className={getInputClassName(
                      "skala",
                      "border font-medium text-sm p-2 rounded-lg w-full"
                    )}
                    value={editedData?.skala || ""}
                    onChange={(e) =>
                      handleInputChangeWithValidation("skala", e.target.value)
                    }
                  >
                    <option value="">Pilih Skala *</option>
                    <option value="Besar">Besar</option>
                    <option value="Sedang">Sedang</option>
                  </select>
                  <ErrorTooltip field="skala" />
                </div>
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
                {data.tahun_direktori.map((tahun, index) => (
                  <div
                    key={`view-tahun-${tahun}-${index}`}
                    className="bg-gray-200 font-medium text-sm px-4 py-2 rounded-lg"
                  >
                    <p>{tahun}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editedData?.tahun_direktori.map((tahun, index) => (
                    <div
                      key={`tahun-${tahun}-${index}`}
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
                      <div className="relative">
                        <input
                          type="text"
                          className={getInputClassName(
                            "newYear",
                            "border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                          )}
                          placeholder="YYYY (2000-2100)"
                          value={newYear}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 4) {
                              setNewYear(value);
                              if (
                                value.length === 4 &&
                                parseInt(value) >= 2000 &&
                                parseInt(value) <= 2100
                              ) {
                                setValidationErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.newYear;
                                  return newErrors;
                                });
                              }
                            } else {
                              showFieldTooltip(
                                "newYear",
                                "Tahun maksimal 4 digit"
                              );
                            }
                          }}
                          maxLength={4}
                        />
                        <ErrorTooltip field="newYear" />
                      </div>
                      <button
                        onClick={handleAddYearWithValidation}
                        className="ml-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                        disabled={!newYear || newYear.length !== 4}
                      >
                        Tambah
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
            onClick={handleSaveWithValidation}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            disabled={isSaving}
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailDirektori;
