// PERBAIKAN UNTUK src/app/components/admin/riwayat_survei_form.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SweetAlertUtils } from "@/app/utils/sweetAlert";

interface RiwayatSurveiFormProps {
  id?: string | number;
  mode: "add" | "edit";
  onSuccess: () => void;
  onCancel: () => void;
}

interface RiwayatSurveiData {
  id_riwayat?: number;
  id_survei: number | string;
  id_perusahaan: number | string;
  id_pcl: number | string;
  selesai: string;
  ket_survei: string;
}

// 🔧 PERBAIKAN: Update interface PerusahaanOption sesuai API response
interface PerusahaanOption {
  id: number; // dari API: id (MIN(id_perusahaan))
  id_list: string; // dari API: id_list (GROUP_CONCAT(id_perusahaan))
  name: string; // dari API: name (nama_perusahaan)
  kip: string; // dari API: kip
  isDuplicate: boolean; // dari API: isDuplicate (duplicate_count > 1)
  duplicateCount: number; // dari API: duplicateCount (COUNT(*))
  displayLabel: string; // dari API: displayLabel
}

// Tambahkan interface di atas:
interface SurveiOption {
  id_survei: number | string;
  nama_survei: string;
  tahun: string | number;
}
interface PCLOption {
  id_pcl: number | string;
  nama_pcl: string;
  status_pcl: string;
}

// State untuk field validation
interface FieldState {
  [key: string]: {
    touched: boolean;
    error: string;
  };
}

// Komponen Tooltip untuk error validation
const Tooltip: React.FC<{ message: string; isVisible: boolean }> = ({
  message,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute left-0 top-full mt-1 z-10 bg-red-600 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap max-w-xs">
      <div className="absolute -top-1 left-2 w-2 h-2 bg-red-600 rotate-45"></div>
      {message}
    </div>
  );
};

const RiwayatSurveiForm: React.FC<RiwayatSurveiFormProps> = ({
  id,
  mode,
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RiwayatSurveiData>({
    id_survei: "",
    id_perusahaan: "",
    id_pcl: "",
    selesai: "",
    ket_survei: "",
  });

  // State untuk dropdown options
  const [surveiOptions, setSurveiOptions] = useState<SurveiOption[]>([]);
  const [perusahaanOptions, setPerusahaanOptions] = useState<
    PerusahaanOption[]
  >([]);
  const [pclOptions, setPclOptions] = useState<PCLOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // State untuk dropdown perusahaan
  const [selectedPerusahaan, setSelectedPerusahaan] =
    useState<PerusahaanOption | null>(null);

  // State untuk field validation
  const [fieldStates, setFieldStates] = useState<FieldState>({
    id_survei: { touched: false, error: "" },
    id_perusahaan: { touched: false, error: "" },
    id_pcl: { touched: false, error: "" },
    selesai: { touched: false, error: "" },
    ket_survei: { touched: false, error: "" },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<RiwayatSurveiData>({
    id_survei: "",
    id_perusahaan: "",
    id_pcl: "",
    selesai: "",
    ket_survei: "",
  });

  // Validation rules
  const validateField = (name: string, value: string | number): string => {
    switch (name) {
      case "id_survei":
        if (!value || value === "") {
          return "Survei wajib dipilih";
        }
        break;
      case "id_perusahaan":
        if (!value || value === "") {
          return "Perusahaan wajib dipilih";
        }
        break;
      case "id_pcl":
        if (!value || value === "") {
          return "PCL wajib dipilih";
        }
        break;
      case "selesai":
        if (!value || value === "") {
          return "Status selesai wajib dipilih";
        }
        break;
      default:
        break;
    }
    return "";
  };

  // Update field state
  const updateFieldState = (
    name: string,
    value: string | number,
    touched = false
  ) => {
    const error = validateField(name, value);
    setFieldStates((prev) => ({
      ...prev,
      [name]: {
        touched: touched || prev[name].touched,
        error,
      },
    }));
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const newFieldStates: FieldState = {};
    let hasErrors = false;

    // Validasi semua field kecuali ket_survei
    const fieldsToValidate = [
      "id_survei",
      "id_perusahaan",
      "id_pcl",
      "selesai",
    ];

    fieldsToValidate.forEach((fieldName) => {
      const error = validateField(
        fieldName,
        formData[fieldName as keyof RiwayatSurveiData] ?? ""
      );
      newFieldStates[fieldName] = { touched: true, error };
      if (error) hasErrors = true;
    });

    // Update state dengan field yang baru divalidasi
    setFieldStates((prev) => ({ ...prev, ...newFieldStates }));

    return !hasErrors;
  };

  // function checkForChanges:
  const checkForChanges = useCallback(
    (newFormData: RiwayatSurveiData) => {
      const hasChanged =
        JSON.stringify(newFormData) !== JSON.stringify(originalData);
      setHasChanges(hasChanged);
    },
    [originalData]
  );
  // function checkDuplicateData:
  const checkDuplicateData = async (
    data: RiwayatSurveiData
  ): Promise<boolean> => {
    try {
      const params = new URLSearchParams({
        check_duplicate: "true",
        id_survei: data.id_survei.toString(),
        id_perusahaan: data.id_perusahaan.toString(),
        exclude_id: mode === "edit" && id ? id.toString() : "",
      });

      const response = await fetch(`/api/riwayat-survei?${params}`);
      const result = await response.json();
      return result.isDuplicate as boolean;
    } catch (error) {
      console.error("Error checking duplicate:", error);
      return false;
    }
  };

  // 🔧 PERBAIKAN: Update function dengan sesuai API structure
  const checkDuplicatePerusahaanEntry = async (
    selectedPerusahaan: PerusahaanOption,
    id_survei: string
  ): Promise<{
    isDuplicate: boolean;
    duplicateInfo?: Record<string, unknown>;
  }> => {
    try {
      // Safety check berdasarkan struktur API yang benar
      if (!selectedPerusahaan.isDuplicate || !selectedPerusahaan.id_list) {
        return { isDuplicate: false };
      }

      const params = new URLSearchParams({
        check_duplicate_kip: "true",
        id_list: selectedPerusahaan.id_list,
        id_survei,
      });

      const response = await fetch(`/api/riwayat-survei/by-kip?${params}`);

      if (!response.ok) {
        throw new Error("Gagal memeriksa duplikasi KIP");
      }
       
      return await response.json();
    } catch (error) {
      console.error("Error checking KIP duplicate:", error);
      // Return a default non-duplicate result on error to avoid blocking the user
      return { isDuplicate: false };
    }
  };

  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchRiwayat = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/riwayat-survei/${id}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const result = await response.json();
          if (result.success) {
            const data = result.data as RiwayatSurveiData;
            setFormData(data);
            setOriginalData(data);
            checkForChanges(data);
          } else {
            throw new Error(
              result.message || "Failed to fetch riwayat survei data"
            );
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
          console.error("Error fetching riwayat survei:", err);
          setError("Gagal memuat data");
          SweetAlertUtils.error("Error", errorMessage);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchRiwayat();
    }
  }, [id, mode, checkForChanges]);

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [surveiRes, perusahaanRes, pclRes] = await Promise.all([
          fetch("/api/survei/filters"),
          fetch("/api/perusahaan/dropdown"),
          fetch("/api/pcl"),
        ]);

        const surveiData = await surveiRes.json();
        const perusahaanData = await perusahaanRes.json();
        const pclData = await pclRes.json();

        if (surveiData.success) {
          setSurveiOptions(surveiData.data as SurveiOption[]);
        }
        if (perusahaanData.success) {
          setPerusahaanOptions(perusahaanData.data as PerusahaanOption[]);
        }
        if (pclData.success) {
          setPclOptions(pclData.data as PCLOption[]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? `Gagal memuat opsi: ${err.message}`
            : "Terjadi kesalahan tidak diketahui";
        setError(errorMessage);
        SweetAlertUtils.error("Error", errorMessage);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    void fetchOptions();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    checkForChanges(newFormData);
    updateFieldState(name, value);
  };

  const handleBlur = (name: string, value: string | number) => {
    updateFieldState(name, value, true);
  };

  const handleSelectPerusahaan = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected =
      perusahaanOptions.find((p) => p.id === parseInt(selectedId, 10)) || null;
    setSelectedPerusahaan(selected);

    // Update form data dengan ID yang dipilih
    const newFormData = { ...formData, id_perusahaan: selectedId };
    setFormData(newFormData);
    checkForChanges(newFormData);
    updateFieldState("id_perusahaan", selectedId);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi semua field
    if (!validateAllFields()) {
      SweetAlertUtils.warning(
        "Form Belum Lengkap",
        "Silakan periksa kembali semua isian yang wajib diisi."
      );
      return;
    }

    // 2. Cek duplikasi entri survei yang sama
    const isDuplicateEntry = await checkDuplicateData(formData);
    if (isDuplicateEntry) {
      SweetAlertUtils.warning(
        "Data Duplikat",
        "Perusahaan ini sudah terdaftar pada survei yang sama."
      );
      return;
    }

    // 3. Cek duplikasi KIP jika perusahaan yang dipilih adalah duplikat
    if (selectedPerusahaan?.isDuplicate) {
      const duplicateResult = await checkDuplicatePerusahaanEntry(
        selectedPerusahaan,
        String(formData.id_survei)
      );

      if (duplicateResult.isDuplicate) {
        const { duplicateInfo } = duplicateResult;
        const infoText = `Perusahaan dengan KIP yang sama (<strong>${
          selectedPerusahaan.kip
        }</strong>) sudah dientri pada survei ini dengan nama "<strong>${
          (duplicateInfo?.nama_perusahaan as string) || "N/A"
        }</strong>".`;

        const confirmContinue = await SweetAlertUtils.confirm(
          "Potensi Duplikasi KIP",
          `${infoText} Apakah Anda yakin ingin melanjutkan entri?`,
          "Ya, Lanjutkan",
          "Batal"
        );

        if (!confirmContinue) {
          return;
        }
      }
    }

    // Konfirmasi sebelum menyimpan
    const confirmSave = await SweetAlertUtils.confirmSave(
      mode === "edit" ? "Simpan Perubahan" : "Simpan Data Riwayat",
      mode === "edit"
        ? "Apakah Anda yakin ingin menyimpan perubahan data ini?"
        : "Apakah Anda yakin ingin menyimpan data riwayat survei baru ini?"
    );

    if (!confirmSave) {
      return;
    }

    try {
      setIsLoading(true);
      SweetAlertUtils.loading("Menyimpan Data", "Mohon tunggu...");

      const url =
        mode === "edit" ? `/api/riwayat-survei/${id}` : "/api/riwayat-survei";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      SweetAlertUtils.closeLoading();

      if (result.success) {
        await SweetAlertUtils.success(
          "Berhasil!",
          `Data riwayat survei berhasil ${
            mode === "edit" ? "diperbarui" : "ditambahkan"
          }!`
        );
        onSuccess();
      } else {
        throw new Error(
          result.message ||
            `Gagal ${mode === "edit" ? "memperbarui" : "menambahkan"} data`
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      SweetAlertUtils.closeLoading();
      await SweetAlertUtils.error("Operasi Gagal", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (hasChanges) {
      const confirmCancel = await SweetAlertUtils.confirm(
        "Batalkan Perubahan",
        "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin membatalkan?",
        "Ya, Batalkan",
        "Tidak, Lanjutkan Mengedit"
      );
      if (confirmCancel) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  // Dynamic class for inputs
  const getInputClass = (fieldName: keyof RiwayatSurveiData): string => {
    const baseClass =
      "w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2";
    const errorClass = "border-red-500 focus:ring-red-500";
    const defaultClass = "border-gray-300 focus:ring-blue-500";
    return `${baseClass} ${
      fieldStates[fieldName]?.error ? errorClass : defaultClass
    }`;
  };

  // Helper untuk menampilkan label perusahaan
  const getPerusahaanDisplayLabel = (option: PerusahaanOption) => {
    let label = option.name;
    if (option.isDuplicate) {
      label += ` (KIP: ${option.kip} - Duplikat ${option.duplicateCount}x)`;
    }
    return label;
  };

  if (isLoading && mode === "edit") {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error && mode === "edit") {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg font-roboto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
        {mode === "add"
          ? "Tambah Data Riwayat Survei"
          : "Edit Data Riwayat Survei"}
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {/* Survei */}
          <div className="relative md:col-span-2">
            <label
              htmlFor="id_survei"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Survei
            </label>
            <select
              id="id_survei"
              name="id_survei"
              value={formData.id_survei}
              onChange={handleInputChange}
              onBlur={(e) => handleBlur(e.target.name, e.target.value)}
              className={getInputClass("id_survei")}
              required
              disabled={isLoadingOptions}
            >
              <option value="" disabled>
                {isLoadingOptions ? "Memuat..." : "Pilih Survei"}
              </option>
              {surveiOptions.map((survei) => (
                <option key={survei.id_survei} value={survei.id_survei}>
                  {survei.nama_survei} ({survei.tahun})
                </option>
              ))}
            </select>
            <Tooltip
              message={fieldStates.id_survei.error}
              isVisible={!!fieldStates.id_survei.error}
            />
          </div>

          {/* Perusahaan */}
          <div className="relative md:col-span-2">
            <label
              htmlFor="id_perusahaan"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Perusahaan
            </label>
            <select
              id="id_perusahaan"
              name="id_perusahaan"
              value={formData.id_perusahaan}
              onChange={handleSelectPerusahaan}
              onBlur={(e) => handleBlur(e.target.name, e.target.value)}
              className={getInputClass("id_perusahaan")}
              required
              disabled={isLoadingOptions}
            >
              <option value="" disabled>
                {isLoadingOptions ? "Memuat..." : "Pilih Perusahaan"}
              </option>
              {perusahaanOptions.map((option) => (
                <option
                  key={option.id}
                  value={option.id}
                  className={option.isDuplicate ? "font-bold text-red-600" : ""}
                >
                  {getPerusahaanDisplayLabel(option)}
                </option>
              ))}
            </select>
            <Tooltip
              message={fieldStates.id_perusahaan.error}
              isVisible={!!fieldStates.id_perusahaan.error}
            />
          </div>

          {/* PCL */}
          <div className="relative">
            <label
              htmlFor="id_pcl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              PCL (Petugas Lapangan)
            </label>
            <select
              id="id_pcl"
              name="id_pcl"
              value={formData.id_pcl}
              onChange={handleInputChange}
              onBlur={(e) => handleBlur(e.target.name, e.target.value)}
              className={getInputClass("id_pcl")}
              required
              disabled={isLoadingOptions}
            >
              <option value="" disabled>
                {isLoadingOptions ? "Memuat..." : "Pilih PCL"}
              </option>
              {pclOptions.map((pcl) => (
                <option key={pcl.id_pcl} value={pcl.id_pcl}>
                  {pcl.nama_pcl} ({pcl.status_pcl})
                </option>
              ))}
            </select>
            <Tooltip
              message={fieldStates.id_pcl.error}
              isVisible={!!fieldStates.id_pcl.error}
            />
          </div>

          {/* Status Selesai */}
          <div className="relative">
            <label
              htmlFor="selesai"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status Penyelesaian
            </label>
            <select
              id="selesai"
              name="selesai"
              value={formData.selesai}
              onChange={handleInputChange}
              onBlur={(e) => handleBlur(e.target.name, e.target.value)}
              className={getInputClass("selesai")}
              required
            >
              <option value="" disabled>
                Pilih Status
              </option>
              <option value="Selesai">Selesai</option>
              <option value="Belum Selesai">Belum Selesai</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
              <option value="Responden Menolak">Responden Menolak</option>
            </select>
            <Tooltip
              message={fieldStates.selesai.error}
              isVisible={!!fieldStates.selesai.error}
            />
          </div>

          {/* Keterangan Survei */}
          <div className="relative md:col-span-2">
            <label
              htmlFor="ket_survei"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Keterangan Tambahan (Opsional)
            </label>
            <textarea
              id="ket_survei"
              name="ket_survei"
              value={formData.ket_survei}
              onChange={handleInputChange}
              onBlur={(e) => handleBlur(e.target.name, e.target.value)}
              rows={4}
              className={getInputClass("ket_survei")}
              placeholder="Contoh: Responden meminta untuk dihubungi kembali minggu depan."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-4 mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading || !hasChanges}
            className={`px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white ${
              isLoading || !hasChanges
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            } transition-colors`}
          >
            {isLoading
              ? "Menyimpan..."
              : mode === "add"
              ? "Simpan"
              : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RiwayatSurveiForm;
