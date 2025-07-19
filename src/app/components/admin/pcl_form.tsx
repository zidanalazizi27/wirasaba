"use client";

import React, { useState, useEffect } from "react";
import { SweetAlertUtils } from "@/app/utils/sweetAlert";

interface PCLFormProps {
  id?: string;
  mode: "add" | "edit";
  onSuccess: () => void;
  onCancel: () => void;
}

interface PCLData {
  id_pcl?: number;
  nama_pcl: string;
  status_pcl: string;
  telp_pcl: string;
}

// State untuk field validation seperti di survei_form.tsx
interface FieldState {
  [key: string]: {
    touched: boolean;
    error: string;
  };
}

// Komponen Tooltip dengan style yang sama seperti survei_form.tsx
const Tooltip: React.FC<{ message: string; isVisible: boolean }> = ({
  message,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute left-0 top-full mt-1 z-10 bg-red-600 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
      <div className="absolute -top-1 left-2 w-2 h-2 bg-red-600 rotate-45"></div>
      {message}
    </div>
  );
};

const PCLForm: React.FC<PCLFormProps> = ({ id, mode, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PCLData>({
    nama_pcl: "",
    status_pcl: "Mitra", // Default value
    telp_pcl: "",
  });

  // State untuk melacak perubahan form
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<PCLData>({
    nama_pcl: "",
    status_pcl: "Mitra",
    telp_pcl: "",
  });

  // State untuk field validation menggunakan pattern dari survei_form.tsx
  const [fieldStates, setFieldStates] = useState<FieldState>({
    nama_pcl: { touched: false, error: "" },
    status_pcl: { touched: false, error: "" },
    telp_pcl: { touched: false, error: "" },
  });

  // Fetch PCL data if in edit mode
  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchPCL = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/pcl/${id}`);

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result = await response.json();

          if (result.success) {
            setFormData(result.data as PCLData);
            setOriginalData(result.data as PCLData);
          } else {
            throw new Error(result.message || "Failed to fetch PCL data");
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
          console.error("Error fetching PCL data:", err);
          setError("Gagal memuat data PCL");
          SweetAlertUtils.error("Error", errorMessage);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPCL();
    }
  }, [id, mode]);

  // Check for changes
  useEffect(() => {
    const hasDataChanged =
      JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(hasDataChanged);
  }, [formData, originalData]);

  // Validasi individual field seperti pattern di survei_form.tsx
  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case "nama_pcl":
        if (!value || !value.trim()) {
          return "Nama PCL wajib diisi";
        }
        // Check karakter khusus berbahaya
        const dangerousChars = /[<>"'&;(){}[\]]/;
        if (dangerousChars.test(value.trim())) {
          return "Nama PCL tidak boleh mengandung karakter khusus berbahaya";
        }
        return "";

      case "status_pcl":
        if (!value || !value.trim()) {
          return "Status PCL wajib dipilih";
        }
        return "";

      case "telp_pcl":
        if (value && value.trim()) {
          const numbersOnly = /^[0-9]+$/;
          if (!numbersOnly.test(value.trim())) {
            return "Nomor telepon harus berupa angka";
          }
        }
        return "";

      default:
        return "";
    }
  };

  // Validasi semua field
  const validateAllFields = (): boolean => {
    const newFieldStates: FieldState = {};
    let hasErrors = false;

    const fieldsToValidate = ["nama_pcl", "status_pcl", "telp_pcl"];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, String(formData[field as keyof PCLData] ?? ""));
      newFieldStates[field] = { touched: true, error };
      if (error) hasErrors = true;
    });

    setFieldStates((prev) => ({ ...prev, ...newFieldStates }));
    return !hasErrors;
  };

  // Handle blur event untuk validasi real-time
  const handleBlur = (fieldName: string, value: string) => {
    const error = validateField(fieldName, value);

    setFieldStates((prev) => ({
      ...prev,
      [fieldName]: { touched: true, error },
    }));
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
  };

  // Handle form submission - duplicate check di server seperti survei_form.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi semua field terlebih dahulu
    if (!validateAllFields()) {
      SweetAlertUtils.warning(
        "Form Belum Lengkap",
        "Silakan periksa dan lengkapi form dengan benar."
      );
      return;
    }

    // Konfirmasi sebelum menyimpan
    const confirmSave = await SweetAlertUtils.confirmSave(
      mode === "edit" ? "Simpan Perubahan" : "Simpan Data PCL",
      mode === "edit"
        ? "Apakah Anda yakin ingin menyimpan perubahan data PCL ini?"
        : "Apakah Anda yakin ingin menyimpan data PCL baru ini?"
    );

    if (!confirmSave) return;

    try {
      setIsLoading(true);
      SweetAlertUtils.loading("Menyimpan Data", "Mohon tunggu sebentar...");

      const url = mode === "edit" ? `/api/pcl/${id}` : "/api/pcl";
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
          `Data PCL berhasil ${mode === "edit" ? "diperbarui" : "ditambahkan"}!`
        );
        onSuccess();
      } else {
        // Handle error dari server - termasuk duplicate check
        if (
          response.status === 409 ||
          (result.message &&
            (result.message as string).toLowerCase().includes("sudah ada"))
        ) {
          // Error 409 = Conflict (duplicate data)
          await SweetAlertUtils.warning(
            "Data Sudah Ada",
            result.message ||
              `Kombinasi Nama PCL "${formData.nama_pcl}" dengan Status "${formData.status_pcl}" sudah terdaftar dalam sistem.`
          );
        } else {
          throw new Error(
            result.message ||
              `Gagal ${mode === "edit" ? "memperbarui" : "menambahkan"} PCL`
          );
        }
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

  // Handle cancel - konfirmasi jika ada perubahan
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
  const getInputClass = (fieldName: keyof PCLData): string => {
    const baseClass =
      "w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2";
    const errorClass = "border-red-500 focus:ring-red-500";
    const defaultClass = "border-gray-300 focus:ring-blue-500";
    return `${baseClass} ${
      fieldStates[fieldName]?.error ? errorClass : defaultClass
    }`;
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg font-roboto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
        {mode === "add" ? "Tambah Data PCL Baru" : "Edit Data PCL"}
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          {/* Nama PCL */}
          <div className="relative">
            <label
              htmlFor="nama_pcl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama PCL
            </label>
            <input
              type="text"
              id="nama_pcl"
              name="nama_pcl"
              value={formData.nama_pcl}
              onChange={handleInputChange}
              onBlur={(e) => handleBlur(e.target.name, e.target.value)}
              className={getInputClass("nama_pcl")}
              required
              aria-describedby="nama_pcl-error"
            />
            <Tooltip
              message={fieldStates.nama_pcl.error}
              isVisible={!!fieldStates.nama_pcl.error}
            />
          </div>

          {/* Status PCL */}
          <div className="relative">
            <label
              htmlFor="status_pcl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status PCL
            </label>
            <select
              id="status_pcl"
              name="status_pcl"
              value={formData.status_pcl}
              onChange={handleInputChange}
              onBlur={(e) => handleBlur(e.target.name, e.target.value)}
              className={getInputClass("status_pcl")}
              required
            >
              <option value="Mitra">Mitra</option>
              <option value="Organik">Organik</option>
            </select>
            <Tooltip
              message={fieldStates.status_pcl.error}
              isVisible={!!fieldStates.status_pcl.error}
            />
          </div>

          {/* Telepon PCL */}
          <div className="relative">
            <label
              htmlFor="telp_pcl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nomor Telepon
            </label>
            <input
              type="tel"
              id="telp_pcl"
              name="telp_pcl"
              value={formData.telp_pcl}
              onChange={handleInputChange}
              onBlur={(e) => handleBlur(e.target.name, e.target.value)}
              className={getInputClass("telp_pcl")}
              placeholder="Contoh: 081234567890"
            />
            <Tooltip
              message={fieldStates.telp_pcl.error}
              isVisible={!!fieldStates.telp_pcl.error}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-4 mt-8 pt-4 border-t">
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

export default PCLForm;
