"use client";

import React, { useState, useEffect } from "react";
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

// Interface untuk perusahaan option dari API yang sudah diperbaiki
interface PerusahaanOption {
  id: number | string;
  name: string;
  kip: string;
  isDuplicate?: boolean;
  duplicateCount?: number;
  duplicateIds?: (number | string)[];
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
    selesai: "Tidak",
    ket_survei: "",
  });

  // State untuk melacak perubahan form
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<RiwayatSurveiData>({
    id_survei: "",
    id_perusahaan: "",
    id_pcl: "",
    selesai: "Tidak",
    ket_survei: "",
  });

  // State untuk dropdown options
  const [surveiOptions, setSurveiOptions] = useState<
    { id: number | string; name: string; tahun: number }[]
  >([]);
  const [perusahaanOptions, setPerusahaanOptions] = useState<
    PerusahaanOption[]
  >([]);
  const [pclOptions, setPclOptions] = useState<
    { id: number | string; name: string }[]
  >([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // State untuk field validation
  const [fieldStates, setFieldStates] = useState<FieldState>({
    id_survei: { touched: false, error: "" },
    id_perusahaan: { touched: false, error: "" },
    id_pcl: { touched: false, error: "" },
    selesai: { touched: false, error: "" },
    ket_survei: { touched: false, error: "" },
  });

  // State untuk dropdown perusahaan
  const [selectedPerusahaan, setSelectedPerusahaan] =
    useState<PerusahaanOption | null>(null);

  // Fungsi validasi untuk setiap field
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case "id_survei":
        if (!value || value === "") {
          return "Survei wajib dipilih";
        }
        return "";

      case "id_perusahaan":
        if (!value || value === "") {
          return "Perusahaan wajib dipilih";
        }
        return "";

      case "id_pcl":
        if (!value || value === "") {
          return "PCL wajib dipilih";
        }
        return "";

      case "selesai":
        if (!value || value === "") {
          return "Status selesai wajib dipilih";
        }
        return "";

      case "ket_survei":
        // Keterangan survei tidak wajib diisi
        return "";

      default:
        return "";
    }
  };

  // Update field state dengan validasi
  const updateFieldState = (
    name: string,
    value: any,
    touched: boolean = true
  ) => {
    const error = validateField(name, value);
    setFieldStates((prev) => ({
      ...prev,
      [name]: { touched, error },
    }));
    return error;
  };

  // Validasi semua field
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
        formData[fieldName as keyof RiwayatSurveiData]
      );
      newFieldStates[fieldName] = { touched: true, error };
      if (error) hasErrors = true;
    });

    setFieldStates((prev) => ({ ...prev, ...newFieldStates }));
    return !hasErrors;
  };

  // Handle blur event untuk validasi real-time
  const handleBlur = (fieldName: string, value: any) => {
    const error = validateField(fieldName, value);
    setFieldStates((prev) => ({
      ...prev,
      [fieldName]: { touched: true, error },
    }));
  };

  // Track changes untuk confirm cancel
  useEffect(() => {
    if (originalData) {
      const currentDataString = JSON.stringify(formData);
      const originalDataString = JSON.stringify(originalData);
      setHasChanges(currentDataString !== originalDataString);
    }
  }, [formData, originalData]);

  // Fetch options data
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoadingOptions(true);

        // Fetch survei options
        const surveiResponse = await fetch("/api/survei");
        if (surveiResponse.ok) {
          const surveiData = await surveiResponse.json();
          if (surveiData.success) {
            setSurveiOptions(surveiData.data);
          }
        }

        // Fetch perusahaan options dengan deduplication menggunakan API yang sudah diperbaiki
        const perusahaanResponse = await fetch(
          "/api/perusahaan?for_dropdown=true&deduplicate=true&limit=1000"
        );
        if (perusahaanResponse.ok) {
          const perusahaanData = await perusahaanResponse.json();
          if (perusahaanData.success) {
            setPerusahaanOptions(perusahaanData.data);
          }
        }

        // Fetch PCL options
        const pclResponse = await fetch("/api/pcl");
        if (pclResponse.ok) {
          const pclData = await pclResponse.json();
          if (pclData.success) {
            setPclOptions(
              pclData.data.map((pcl: any) => ({
                id: pcl.id_pcl,
                name: pcl.nama_pcl,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching options:", error);
        setError("Gagal memuat data opsi");
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Fetch riwayat data if in edit mode
  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchRiwayat = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/riwayat-survei/${id}`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          if (result.success) {
            const data = result.data;
            setFormData(data);
            setOriginalData(data);

            // Set selected perusahaan
            if (data.id_perusahaan) {
              const selectedComp = perusahaanOptions.find(
                (p) => p.id == data.id_perusahaan
              );
              setSelectedPerusahaan(selectedComp || null);
            }
          } else {
            throw new Error(result.message || "Gagal memuat data");
          }
        } catch (error) {
          console.error("Error fetching riwayat:", error);
          setError((error as Error).message);
          SweetAlertUtils.error(
            "Error",
            `Gagal memuat data riwayat survei: ${(error as Error).message}`
          );
        } finally {
          setIsLoading(false);
        }
      };

      if (perusahaanOptions.length > 0) {
        fetchRiwayat();
      }
    } else {
      setOriginalData({ ...formData });
    }
  }, [mode, id, perusahaanOptions]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error saat user mengetik
    if (fieldStates[name]?.error) {
      setFieldStates((prev) => ({
        ...prev,
        [name]: { ...prev[name], error: "" },
      }));
    }

    // Update selected perusahaan dan tampilkan info duplikasi jika ada
    if (name === "id_perusahaan") {
      const selectedComp = perusahaanOptions.find((p) => p.id == value);
      setSelectedPerusahaan(selectedComp || null);

      // Jika perusahaan yang dipilih memiliki duplikasi, tampilkan info
      if (
        selectedComp?.isDuplicate &&
        selectedComp.duplicateCount &&
        selectedComp.duplicateCount > 1
      ) {
        SweetAlertUtils.info(
          "Informasi Duplikasi KIP",
          `Perusahaan dengan KIP "${selectedComp.kip}" dan nama "${selectedComp.name}" memiliki ${selectedComp.duplicateCount} entry di database. Sistem telah memilih entry terbaru untuk ditampilkan.`
        );
      }
    }
  };

  // Check for duplicate data
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

      return result.isDuplicate;
    } catch (error) {
      console.error("Error checking duplicate:", error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi semua field terlebih dahulu
    if (!validateAllFields()) {
      SweetAlertUtils.warning(
        "Form Belum Lengkap",
        "Silakan periksa dan lengkapi form dengan benar. Semua field kecuali keterangan wajib diisi."
      );
      return;
    }

    // Check duplicate data
    const isDuplicate = await checkDuplicateData(formData);
    if (isDuplicate) {
      SweetAlertUtils.warning(
        "Data Sudah Ada",
        "Kombinasi survei dan perusahaan ini sudah terdaftar dalam sistem."
      );
      return;
    }

    // Konfirmasi sebelum menyimpan
    const confirmSave = await SweetAlertUtils.confirmSave(
      mode === "edit" ? "Simpan Perubahan" : "Simpan Data Riwayat Survei",
      mode === "edit"
        ? "Apakah Anda yakin ingin menyimpan perubahan data riwayat survei ini?"
        : "Apakah Anda yakin ingin menyimpan data riwayat survei baru ini?"
    );

    if (!confirmSave) return;

    try {
      setIsLoading(true);
      SweetAlertUtils.loading("Menyimpan Data", "Mohon tunggu sebentar...");

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
          `Data riwayat survei berhasil ${mode === "edit" ? "diperbarui" : "ditambahkan"}!`
        );
        onSuccess();
      } else {
        throw new Error(
          result.message ||
            `Gagal ${mode === "edit" ? "memperbarui" : "menambahkan"} data`
        );
      }
    } catch (error) {
      SweetAlertUtils.closeLoading();
      console.error("Error saving data:", error);
      SweetAlertUtils.error(
        "Gagal Menyimpan",
        `Terjadi kesalahan: ${(error as Error).message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel dengan konfirmasi jika ada perubahan
  const handleCancel = async () => {
    if (hasChanges) {
      const confirmCancel = await SweetAlertUtils.confirmCancel(
        "Batalkan Perubahan",
        "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin membatalkan?"
      );

      if (!confirmCancel) return;
    }

    onCancel();
  };

  // Render loading state
  if (isLoading || isLoadingOptions) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Memuat data...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={onCancel}
          className="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Tutup
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
    >
      {/* Survei Selection */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Survei <span className="text-red-500">*</span>
        </label>
        <select
          name="id_survei"
          value={formData.id_survei}
          onChange={handleInputChange}
          onBlur={(e) => handleBlur("id_survei", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldStates.id_survei?.error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          disabled={isLoading}
        >
          <option value="">-- Pilih Survei --</option>
          {surveiOptions.map((survei) => (
            <option key={survei.id} value={survei.id}>
              {survei.name} ({survei.tahun})
            </option>
          ))}
        </select>
        <Tooltip
          message={fieldStates.id_survei?.error || ""}
          isVisible={
            fieldStates.id_survei?.touched && !!fieldStates.id_survei?.error
          }
        />
      </div>

      {/* Perusahaan Selection dengan handling duplikasi */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Perusahaan <span className="text-red-500">*</span>
        </label>
        <select
          name="id_perusahaan"
          value={formData.id_perusahaan}
          onChange={handleInputChange}
          onBlur={(e) => handleBlur("id_perusahaan", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldStates.id_perusahaan?.error
              ? "border-red-500 focus:ring-red-500"
              : selectedPerusahaan?.isDuplicate
                ? "border-yellow-500 focus:ring-yellow-500 bg-yellow-50"
                : "border-gray-300"
          }`}
          disabled={isLoading}
        >
          <option value="">-- Pilih Perusahaan --</option>
          {perusahaanOptions.map((perusahaan) => (
            <option key={perusahaan.id} value={perusahaan.id}>
              {perusahaan.name} (KIP: {perusahaan.kip})
              {perusahaan.isDuplicate ? "" : ""}
            </option>
          ))}
        </select>

        {/* Warning untuk duplikasi */}
        {selectedPerusahaan?.isDuplicate && (
          <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            <span className="font-medium">⚠️ Informasi:</span> Perusahaan ini
            memiliki {selectedPerusahaan.duplicateCount} entry dengan KIP dan
            nama yang sama. Entry terbaru telah dipilih secara otomatis.
          </div>
        )}

        <Tooltip
          message={fieldStates.id_perusahaan?.error || ""}
          isVisible={
            fieldStates.id_perusahaan?.touched &&
            !!fieldStates.id_perusahaan?.error
          }
        />
      </div>

      {/* PCL Selection */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PCL <span className="text-red-500">*</span>
        </label>
        <select
          name="id_pcl"
          value={formData.id_pcl}
          onChange={handleInputChange}
          onBlur={(e) => handleBlur("id_pcl", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldStates.id_pcl?.error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          disabled={isLoading}
        >
          <option value="">-- Pilih PCL --</option>
          {pclOptions.map((pcl) => (
            <option key={pcl.id} value={pcl.id}>
              {pcl.name}
            </option>
          ))}
        </select>
        <Tooltip
          message={fieldStates.id_pcl?.error || ""}
          isVisible={fieldStates.id_pcl?.touched && !!fieldStates.id_pcl?.error}
        />
      </div>

      {/* Status Selesai */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status Selesai <span className="text-red-500">*</span>
        </label>
        <select
          name="selesai"
          value={formData.selesai}
          onChange={handleInputChange}
          onBlur={(e) => handleBlur("selesai", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldStates.selesai?.error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          disabled={isLoading}
        >
          <option value="">-- Pilih Status --</option>
          <option value="Iya">Iya</option>
          <option value="Tidak">Tidak</option>
        </select>
        <Tooltip
          message={fieldStates.selesai?.error || ""}
          isVisible={
            fieldStates.selesai?.touched && !!fieldStates.selesai?.error
          }
        />
      </div>

      {/* Keterangan Survei (Optional) */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Keterangan Survei
        </label>
        <textarea
          name="ket_survei"
          value={formData.ket_survei}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Keterangan tambahan (opsional)"
          disabled={isLoading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading
            ? "Menyimpan..."
            : mode === "edit"
              ? "Simpan Perubahan"
              : "Simpan Data"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
};

export default RiwayatSurveiForm;
