"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { useRouter } from "next/navigation";
import { SweetAlertUtils } from "@/app/utils/sweetAlert";
import L, { Map, Marker } from "leaflet";

interface DetailDirektoriProps {
  id_perusahaan: string | string[] | null;
  mode?: "view" | "edit" | "add"; // Tambahkan prop mode
  onSave?: (data: PerusahaanData) => Promise<void>; // Handler untuk tombol simpan
  onCancel?: () => void; // Handler untuk tombol batalkan
  isSaving?: boolean; // Prop untuk status saving
}

//intrface untuk validasi input
interface ValidationErrors {
  [key: string]: string;
}

// Interface untuk hasil validasi duplikasi
interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingCompany?: {
    id_perusahaan: number;
    nama_perusahaan: string;
    kip: string;
    tahun_direktori: number[];
  };
  duplicateYears?: number[];
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

// Helper function untuk mendapatkan nama dari ID
const getOptionName = (
  options: { value: number | string; label: string }[],
  id: number | string | null
): string => {
  if (id === null || id === undefined) return "Tidak Diketahui";
  const option = options.find((opt) => opt.value == id);
  return option ? option.label : "Tidak Diketahui";
};

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
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYear, setNewYear] = useState("");
  const leafletMap = useRef<Map | null>(null);
  const leafletMarker = useRef<Marker | null>(null);
  const mapInitialized = useRef<boolean>(false);

  interface DropdownOption {
    value: number | string;
    label: string;
    id_des?: number;
  }

  // State untuk opsi dropdown
  const [badanUsahaOptions, setBadanUsahaOptions] = useState<DropdownOption[]>(
    []
  );
  const [kecamatanOptions, setKecamatanOptions] = useState<DropdownOption[]>(
    []
  );
  const [desaOptions, setDesaOptions] = useState<DropdownOption[]>([]);
  const [lokasiOptions, setLokasiOptions] = useState<DropdownOption[]>([]);
  const [tenagaKerjaOptions, setTenagaKerjaOptions] = useState<
    DropdownOption[]
  >([]);
  const [investasiOptions, setInvestasiOptions] = useState<DropdownOption[]>(
    []
  );
  const [omsetOptions, setOmsetOptions] = useState<DropdownOption[]>([]);
  const [pclOptions, setPclOptions] = useState<DropdownOption[]>([]);
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
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      if (
        !lat1 ||
        !lon1 ||
        !lat2 ||
        !lon2 ||
        isNaN(lat1) ||
        isNaN(lon1) ||
        isNaN(lat2) ||
        isNaN(lon2)
      )
        return null;

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
    },
    []
  );

  //Fungsi untuk menentukan skala
  const determineScale = (tkerja: number, investasi: number, omset: number) => {
    // Jika tkerja = 4 (>99 orang) ATAU investasi = 4 (>10M) ATAU omset = 4 (>50M)
    if (tkerja === 4 || investasi === 4 || omset === 4) {
      return "Besar";
    } else {
      return "Sedang";
    }
  };

  // Fungsi validasi field
  const validateField = (
    field: string,
    value: string | number | null | undefined
  ): string => {
    const errors: string[] = [];

    switch (field) {
      case "kip":
        // KIP wajib diisi - perbaikan utama
        if (!value || value === "" || value.toString().trim() === "") {
          errors.push("KIP wajib diisi");
        } else {
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
        // Latitude wajib diisi - perbaikan utama
        if (!value || value === "" || value.toString().trim() === "") {
          errors.push("Latitude wajib diisi");
        } else {
          const lat = parseFloat(value.toString());
          if (isNaN(lat)) {
            errors.push("Latitude harus berupa angka desimal");
          } else if (lat < -90 || lat > 90) {
            errors.push("Latitude harus dalam rentang -90 sampai 90");
          }
        }
        break;

      case "lon":
        // Longitude wajib diisi - perbaikan utama
        if (!value || value === "" || value.toString().trim() === "") {
          errors.push("Longitude wajib diisi");
        } else {
          const lon = parseFloat(value.toString());
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
        if (!value || String(value).trim() === "") {
          const fieldNames: Record<string, string> = {
            nama_perusahaan: "Nama perusahaan",
            alamat: "Alamat",
            produk: "Produk",
          };
          if (typeof field === "string" && field in fieldNames) {
            errors.push(`${fieldNames[field]} tidak boleh kosong`);
          }
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
          const fieldNames: Record<string, string> = {
            badan_usaha: "Badan Usaha",
            lok_perusahaan: "Lokasi Perusahaan",
            tkerja: "Tenaga Kerja",
            investasi: "Investasi",
            omset: "Omset",
            skala: "Skala",
          };
          if (typeof field === "string" && field in fieldNames) {
            errors.push(`${fieldNames[field]} tidak boleh kosong`);
          }
        }
        break;
    }

    return errors.join("; ");
  };

  // Fungsi validasi lengkap
  const validateAllFields = (): boolean => {
    const errors: ValidationErrors = {};
    const requiredFields: (keyof PerusahaanData)[] = [
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
      // Handle different types of values
      if (Array.isArray(value)) {
        // Skip array fields for individual validation
        return;
      }
      const error = validateField(
        field,
        value as string | number | null | undefined
      );

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

  //Fungsi cek duplikasi KIP dan tahun direktori
  const checkKipAndYearDuplicate = async (
    kip: string | number,
    years: number[],
    currentCompanyId?: number
  ): Promise<DuplicateCheckResult> => {
    try {
      // Pastikan KIP dalam format yang benar
      const kipString = kip.toString().trim();

      if (!kipString || years.length === 0) {
        return { isDuplicate: false };
      }

      // Panggil API untuk cek duplikasi
      const response = await fetch("/api/perusahaan/check-duplicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kip: kipString,
          years: years,
          excludeCompanyId: currentCompanyId, // Untuk mode edit, exclude company yang sedang diedit
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal melakukan pengecekan duplikasi");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error checking duplicate:", error);
      throw new Error("Terjadi kesalahan saat mengecek duplikasi data");
    }
  };

  const showDuplicateError = (duplicateInfo: DuplicateCheckResult): void => {
    const duplicateYearsText = duplicateInfo.duplicateYears?.join(", ") || "";
    const existingCompany = duplicateInfo.existingCompany;

    const errorMessage = `
    
Kombinasi KIP ${existingCompany?.kip} dengan tahun ${duplicateYearsText} sudah digunakan perusahaan lain.
Detail data: ID Perusahaan: ${existingCompany?.id_perusahaan}
, KIP: ${existingCompany?.kip}
, Nama Perusahaan: ${existingCompany?.nama_perusahaan}
, Tahun: ${duplicateYearsText}.

Sistem tidak mengizinkan duplikasi data ini. Silakan:
1. Gunakan KIP yang berbeda, atau
2. Gunakan tahun direktori yang berbeda, atau
3. Periksa kembali data yang akan diinput`;

    // Tampilkan error dengan SweetAlert
    SweetAlertUtils.error("Terdapat Duplikasi Data", errorMessage);
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
    value: string | number
  ) => {
    let processedValue = value;

    // Filter input berdasarkan field
    if (field === "kip") {
      const valueStr = value.toString();
      if (!value || valueStr.trim() === "") {
        showFieldTooltip("kip", "KIP tidak boleh kosong");
        return;
      }
      const numericValue = valueStr.replace(/\D/g, "");
      if (numericValue.length > 10) {
        showFieldTooltip("kip", "KIP maksimal 10 digit");
        return;
      }
      if (value && !/^\d*$/.test(valueStr)) {
        showFieldTooltip("kip", "KIP harus berupa angka saja");
        return;
      }
      processedValue = numericValue;
    } else if (field === "kode_pos") {
      const valueStr = value.toString();
      const numericValue = valueStr.replace(/\D/g, "");
      if (numericValue.length > 5) {
        showFieldTooltip("kode_pos", "Kode pos maksimal 5 digit");
        return;
      }
      processedValue = numericValue;
    } else if (field === "KBLI") {
      const valueStr = value.toString();
      const numericValue = valueStr.replace(/\D/g, "");
      if (numericValue.length > 5) {
        showFieldTooltip("KBLI", "KBLI maksimal 5 digit");
        return;
      }
      processedValue = numericValue;
    } else if (field === "lat") {
      const latPattern = /^-?\d*\.?\d*$/;
      const valueStr = value.toString();
      if (!value || valueStr === "") {
        showFieldTooltip("lat", "Latitude tidak boleh kosong");
        return;
      }
      if (value && !latPattern.test(valueStr)) {
        showFieldTooltip(
          "lat",
          "Latitude harus berupa angka desimal (bisa negatif)"
        );
        return;
      }
      if (value) {
        const lat = parseFloat(value.toString());
        if (!isNaN(lat) && (lat < -90 || lat > 90)) {
          showFieldTooltip("lat", "Latitude harus dalam rentang -90 sampai 90");
          return;
        }
      }
      processedValue = value;
    } else if (field === "lon") {
      const lonPattern = /^-?\d*\.?\d*$/;
      const valueStr = value.toString();
      if (!value || valueStr === "") {
        showFieldTooltip("lon", "Longitude tidak boleh kosong");
        return;
      }
      if (value && !lonPattern.test(valueStr)) {
        showFieldTooltip("lon", "Longitude harus berupa angka desimal");
        return;
      }
      if (value) {
        const lon = parseFloat(value.toString());
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
      editedData &&
      (!editedData.kec || editedData.kec === 0)
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

      // === VALIDASI DUPLIKASI UNTUK TAHUN BARU ===
      if (editedData.kip) {
        try {
          const currentCompanyId =
            mode === "edit" ? editedData.id_perusahaan : undefined;

          const duplicateCheck = await checkKipAndYearDuplicate(
            editedData.kip,
            [yearNumber],
            currentCompanyId
          );

          if (duplicateCheck.isDuplicate) {
            // TOLAK DUPLIKASI - Tampilkan error dan hentikan proses
            showDuplicateError(duplicateCheck);
            return; // Stop proses penambahan tahun
          }
        } catch (error) {
          console.error("Error checking duplicate for new year:", error);
          SweetAlertUtils.error(
            "Gagal Validasi",
            "Terjadi kesalahan saat melakukan validasi tahun. Silakan coba lagi."
          );
          return;
        }
      }

      // Jika tidak ada duplikasi, lanjutkan dengan handleAddYear
      handleAddYear();
    }
  };

  // Handler save dengan validasi
  const handleSaveWithValidation = async () => {
    if (!editedData) {
      SweetAlertUtils.error("Error", "Data tidak tersedia untuk disimpan");
      return;
    }

    // Validasi semua field terlebih dahulu
    if (!validateAllFields()) {
      SweetAlertUtils.warning(
        "Mohon Perbaiki Input",
        "Terdapat kesalahan pada form input. Silakan periksa kembali data yang Anda masukkan."
      );
      return;
    }

    try {
      // === VALIDASI DUPLIKASI KIP DAN TAHUN DIREKTORI ===
      if (
        editedData.kip &&
        editedData.tahun_direktori &&
        editedData.tahun_direktori.length > 0
      ) {
        const currentCompanyId =
          mode === "edit" ? editedData.id_perusahaan : undefined;

        const duplicateCheck = await checkKipAndYearDuplicate(
          editedData.kip,
          editedData.tahun_direktori,
          currentCompanyId
        );

        if (duplicateCheck.isDuplicate) {
          // TOLAK DUPLIKASI - Tampilkan error dan hentikan proses
          showDuplicateError(duplicateCheck);
          return; // Stop proses penyimpanan
        }
      }

      // Jika tidak ada duplikasi, lanjutkan penyimpanan
      if (mode === "add" && onSave) {
        const dataToSave = { ...editedData };
        delete (dataToSave as Partial<PerusahaanData>).id_perusahaan;
        onSave(dataToSave as PerusahaanData);
      } else if (onSave) {
        onSave(editedData);
      }
    } catch (error) {
      console.error("Error during validation:", error);
      SweetAlertUtils.error(
        "Gagal Validasi",
        "Terjadi kesalahan saat melakukan validasi data. Silakan coba lagi."
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
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        SweetAlertUtils.error("Error", `Error: ${errorMessage}`);
      }
    }
  };

  // Fungsi untuk menghapus tahun
  // Fungsi untuk menghapus tahun
  const handleRemoveYear = async (yearToRemove: number) => {
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
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        SweetAlertUtils.error("Error", `Error: ${errorMessage}`);
      }
    }
  };

  const handleInputChange = useCallback(
    (
      field: keyof PerusahaanData,
      value: string | number | string[] | number[]
    ) => {
      setEditedData((prev) => {
        if (!prev) return null;

        const newData = { ...prev, [field]: value };

        // Jika field yang berubah adalah tkerja, investasi, atau omset
        if (["tkerja", "investasi", "omset"].includes(field)) {
          // Tentukan skala baru berdasarkan nilai-nilai
          newData.skala = determineScale(
            newData.tkerja,
            newData.investasi,
            newData.omset
          );
        }

        // Jika field yang berubah adalah lat atau lon
        if (field === "lat" || field === "lon") {
          // Hitung jarak baru
          if (newData.lat !== null && newData.lon !== null) {
            newData.jarak = calculateDistance(
              newData.lat,
              newData.lon,
              BPS_LAT,
              BPS_LON
            );
          } else {
            newData.jarak = null;
          }
        }

        // Jika field yang berubah adalah kecamatan
        if (field === "kec") {
          // Reset desa
          newData.des = 0;
        }
        return newData;
      });
    },
    [calculateDistance, BPS_LAT, BPS_LON]
  );

  // Fetch dropdown options - menggunakan pola yang sama seperti di repositori referensi
  const fetchOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    setError(null);

    try {
      const responses = await Promise.all([
        fetch("/api/badan-usaha"),
        fetch("/api/kecamatan"),
        fetch("/api/lokasi-perusahaan"),
        fetch("/api/tenaga-kerja"),
        fetch("/api/investasi"),
        fetch("/api/omset"),
        fetch("/api/perusahaan/pcl_utama"),
      ]);

      // Validasi semua responses
      const responsePromises = responses.map(async (response, index) => {
        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${response.status} for API ${index}`
          );
        }
        return response.json();
      });

      const [
        badanUsahaRes,
        kecamatanRes,
        lokasiRes,
        tenagaKerjaRes,
        investasiRes,
        omsetRes,
        pclRes,
      ] = await Promise.all(responsePromises);

      // Validasi response dan set data dengan error handling
      if (badanUsahaRes.success) {
        setBadanUsahaOptions(badanUsahaRes.data || []);
      } else {
        console.error("Error fetching badan usaha:", badanUsahaRes.message);
        setBadanUsahaOptions([]);
      }

      if (kecamatanRes.success) {
        setKecamatanOptions(kecamatanRes.data || []);
      } else {
        console.error("Error fetching kecamatan:", kecamatanRes.message);
        setKecamatanOptions([]);
      }

      if (lokasiRes.success) {
        setLokasiOptions(lokasiRes.data || []);
      } else {
        console.error("Error fetching lokasi:", lokasiRes.message);
        setLokasiOptions([]);
      }

      if (tenagaKerjaRes.success) {
        setTenagaKerjaOptions(tenagaKerjaRes.data || []);
      } else {
        console.error("Error fetching tenaga kerja:", tenagaKerjaRes.message);
        setTenagaKerjaOptions([]);
      }

      if (investasiRes.success) {
        setInvestasiOptions(investasiRes.data || []);
      } else {
        console.error("Error fetching investasi:", investasiRes.message);
        setInvestasiOptions([]);
      }

      if (omsetRes.success) {
        setOmsetOptions(omsetRes.data || []);
      } else {
        console.error("Error fetching omset:", omsetRes.message);
        setOmsetOptions([]);
      }

      if (pclRes.success) {
        setPclOptions(pclRes.data || []);
      } else {
        console.error("Error fetching PCL:", pclRes.message);
        setPclOptions([]);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error fetching options:", errorMessage);
      setError(`Gagal memuat opsi: ${errorMessage}`);
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  // Fetch dropdown options on mount
  useEffect(() => {
    void fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    if (editedData?.kec) {
      const fetchDesa = async () => {
        try {
          const response = await fetch(`/api/desa?kec=${editedData.kec}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const desaRes = await response.json();

          if (desaRes.success) {
            setDesaOptions(desaRes.data || []);
          } else {
            console.error("Error fetching desa options:", desaRes.message);
            setDesaOptions([]);
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error fetching desa options:", error.message);
          } else {
            console.error("Error fetching desa options:", error);
          }
          setDesaOptions([]);
        }
      };
      fetchDesa();
    } else {
      setDesaOptions([]);
    }
  }, [editedData?.kec]);

  const handleCancel = async () => {
    // Tampilkan konfirmasi SweetAlert jika ada perubahan
    if (JSON.stringify(data) !== JSON.stringify(editedData)) {
      const confirmed = await SweetAlertUtils.confirmCancel(
        "Anda yakin ingin membatalkan?",
        "Semua perubahan yang belum disimpan akan hilang."
      );
      if (confirmed) {
        // Jika mode add, panggil onCancel dari props
        if (mode === "add" && onCancel) {
          onCancel();
        }
        // Jika mode edit, kembali ke halaman detail
        if (mode === "edit") {
          router.push(`/admin/direktori/${id_perusahaan}`);
        }
      }
    } else {
      // Jika tidak ada perubahan, langsung kembali
      // Jika mode add, panggil onCancel dari props
      if (mode === "add" && onCancel) {
        onCancel();
      }
      // Jika mode edit, kembali ke halaman detail
      if (mode === "edit") {
        router.push(`/admin/direktori/${id_perusahaan}`);
      }
    }
  };

  const initializeMap = useCallback(() => {
    if (mapRef.current && !leafletMap.current && data) {
      const { lat, lon } = data;
      const initialView: L.LatLngExpression =
        lat && lon ? [lat, lon] : [BPS_LAT, BPS_LON];

      const map = L.map(mapRef.current).setView(initialView, 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Icon kustom untuk BPS
      const bpsIcon = L.icon({
        iconUrl: "/image/pcl.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      // Marker untuk BPS
      L.marker([BPS_LAT, BPS_LON], { icon: bpsIcon })
        .addTo(map)
        .bindPopup("<b>BPS Kabupaten Sidoarjo</b>");

      // Marker untuk perusahaan
      if (lat && lon) {
        leafletMarker.current = L.marker([lat, lon], {
          draggable: mode === "edit",
        })
          .addTo(map)
          .bindPopup(`<b>${data.nama_perusahaan}</b>`);

        leafletMarker.current.on("dragend", (e: L.DragEndEvent) => {
          const newLatLng = e.target.getLatLng();
          handleInputChange("lat", newLatLng.lat);
          handleInputChange("lon", newLatLng.lng);
        });
      }

      leafletMap.current = map;
      mapInitialized.current = true;
    }
  }, [data, mode, BPS_LAT, BPS_LON, handleInputChange]);

  const updateMapPosition = useCallback(() => {
    if (leafletMap.current && editedData?.lat && editedData?.lon) {
      const newPos: L.LatLngExpression = [editedData.lat, editedData.lon];
      leafletMap.current.setView(newPos, leafletMap.current.getZoom());
      if (leafletMarker.current) {
        leafletMarker.current.setLatLng(newPos);
      } else {
        // Jika marker belum ada, buat baru
        leafletMarker.current = L.marker(newPos, {
          draggable: mode === "edit",
        })
          .addTo(leafletMap.current)
          .bindPopup(`<b>${editedData.nama_perusahaan}</b>`);

        leafletMarker.current.on("dragend", (e: L.DragEndEvent) => {
          const newLatLng = e.target.getLatLng();
          handleInputChange("lat", newLatLng.lat);
          handleInputChange("lon", newLatLng.lng);
        });
      }
    }
  }, [editedData, mode, handleInputChange]);

  useEffect(() => {
    if (mode !== "add" && !mapInitialized.current) {
      initializeMap();
    }
  }, [initializeMap, mode]);

  useEffect(() => {
    if (mode === "edit" || mode === "add") {
      updateMapPosition();
    }
  }, [editedData?.lat, editedData?.lon, mode, updateMapPosition]);

  // Efek untuk memuat data perusahaan - menggunakan pola yang sama seperti di repositori referensi
  const fetchData = useCallback(async () => {
    if (!id_perusahaan) {
      setLoading(false);
      setError("ID Perusahaan tidak ditemukan.");
      return;
    }

    // Jika mode 'add', siapkan data kosong
    if (mode === "add") {
      const initialData: PerusahaanData = {
        id_perusahaan: 0,
        kip: "",
        nama_perusahaan: "",
        badan_usaha: 0,
        badan_usaha_nama: "",
        alamat: "",
        kec: 0,
        kec_nama: "",
        des: 0,
        des_nama: "",
        kode_pos: "",
        skala: "Sedang",
        lok_perusahaan: 0,
        lok_perusahaan_nama: "",
        nama_kawasan: null,
        lat: null,
        lon: null,
        jarak: null,
        produk: "",
        KBLI: 0,
        telp_perusahaan: null,
        email_perusahaan: null,
        web_perusahaan: null,
        tkerja: 0,
        tkerja_nama: "",
        investasi: 0,
        investasi_nama: "",
        omset: 0,
        omset_nama: "",
        nama_narasumber: "",
        jbtn_narasumber: "",
        email_narasumber: null,
        telp_narasumber: null,
        catatan: null,
        tahun_direktori: [new Date().getFullYear()], // Default tahun saat ini
        pcl_utama: "",
      };
      setData(initialData);
      setEditedData(initialData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/perusahaan/${id_perusahaan}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Hitung jarak saat data pertama kali dimuat
        const initialData = { ...result.data };
        if (initialData.lat && initialData.lon) {
          initialData.jarak = calculateDistance(
            initialData.lat,
            initialData.lon,
            BPS_LAT,
            BPS_LON
          );
        }

        setData(initialData);
        setEditedData(initialData);
      } else {
        throw new Error(result.message || "Data tidak ditemukan");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error fetching company data:", errorMessage);
      setError(`Gagal memuat data perusahaan: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [id_perusahaan, mode, calculateDistance, BPS_LAT, BPS_LON]);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  useEffect(() => {
    updateMapPosition();
  }, [updateMapPosition]);

  // Efek untuk mengupdate posisi marker saat lat/lon berubah di form
  useEffect(() => {
    if (leafletMarker.current && editedData?.lat && editedData?.lon) {
      const newLatLng = new L.LatLng(editedData.lat, editedData.lon);
      leafletMarker.current.setLatLng(newLatLng);
    }
  }, [editedData?.lat, editedData?.lon]);

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
                    value={String(editedData?.kip ?? "")}
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
                    value={String(editedData?.nama_perusahaan ?? "")}
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
                  value={String(editedData?.alamat ?? "")}
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
                    value={String(editedData?.kec ?? "")}
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
                        key={`kec-${option.value || index}`}
                        value={option.value}
                      >
                        {option.label}
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
                    value={String(editedData?.des ?? "")}
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
                        .sort((a, b) => Number(a.value) - Number(b.value))
                        .map((option, index) => (
                          <option
                            key={`desa-${option.value || option.id_des || index}`}
                            value={option.value}
                          >
                            {option.label}
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
                    value={String(editedData?.badan_usaha ?? "")}
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
                        key={`badan-${option.value || index}`}
                        value={option.value}
                      >
                        {option.label}
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
                    value={String(editedData?.lok_perusahaan ?? "")}
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
                        key={`lokasi-${option.value || index}`}
                        value={option.value}
                      >
                        {option.label}
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
                value={String(editedData?.nama_kawasan ?? "")}
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
                    value={String(editedData?.kode_pos ?? "")}
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
                    value={String(editedData?.KBLI ?? "")}
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
                  value={String(editedData?.produk ?? "")}
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
                  value={String(editedData?.telp_perusahaan ?? "")}
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
                  value={String(editedData?.email_perusahaan ?? "")}
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
                value={String(editedData?.web_perusahaan ?? "")}
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
                <p>{getOptionName(pclOptions, data.pcl_utama)}</p>
              </div>
            ) : (
              <select
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={String(editedData?.pcl_utama ?? "")}
                onChange={(e) => handleInputChange("pcl_utama", e.target.value)}
              >
                <option value="">-- Pilih PCL --</option>
                {pclOptions.map((option, index) => (
                  <option
                    key={`pcl-${option.value || index}`}
                    value={option.value}
                  >
                    {option.label}
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
                    value={String(editedData?.lat ?? "")}
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
                    value={String(editedData?.lon ?? "")}
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
                  value={String(editedData?.jarak ?? "")}
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
                        : `${editedData?.lat ?? 0},${editedData?.lon ?? 0}`;
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
                    value={String(editedData?.tkerja ?? "")}
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
                        key={`tkerja-${option.value || index}`}
                        value={option.value}
                      >
                        {option.label}
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
                    value={String(editedData?.investasi ?? "")}
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
                        key={`investasi-${option.value || index}`}
                        value={option.value}
                      >
                        {option.label}
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
                    value={String(editedData?.omset ?? "")}
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
                        key={`omset-${option.value || index}`}
                        value={option.value}
                      >
                        {option.label}
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
                    value={String(editedData?.skala ?? "")}
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
                  value={String(editedData?.nama_narasumber ?? "")}
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
                  value={String(editedData?.jbtn_narasumber ?? "")}
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
                  value={String(editedData?.telp_narasumber ?? "")}
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
                  value={String(editedData?.email_narasumber ?? "")}
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
                value={String(editedData?.catatan ?? "")}
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
      {(mode === "edit" || mode === "add") && editedData !== null && (
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
            disabled={!editedData}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailDirektori;
