"use client";

import React, { useState, useEffect } from "react";

interface SurveyFormProps {
  id?: string | number;
  mode: "add" | "edit";
  onSuccess: () => void;
  onCancel: () => void;
}

interface SurveyData {
  id_survei?: number;
  nama_survei: string;
  fungsi: string;
  periode: string;
  tahun: number;
}

interface ValidationErrors {
  nama_survei?: string;
  fungsi?: string;
  periode?: string;
  tahun?: string;
}

interface FieldState {
  [key: string]: {
    touched: boolean;
    error: string;
  };
}

// Opsi dropdown untuk Fungsi
const fungsiOptions = [
  { value: "", label: "-- Pilih Fungsi --" },
  { value: "Produksi", label: "Produksi" },
  { value: "Neraca", label: "Neraca" },
  { value: "Distribusi", label: "Distribusi" },
  { value: "Lainnya", label: "Lainnya" },
];

// Opsi dropdown untuk Periode
const periodeOptions = [
  { value: "", label: "-- Pilih Periode --" },
  { value: "Bulanan", label: "Bulanan" },
  { value: "Triwulan", label: "Triwulan" },
  { value: "Semester", label: "Semester" },
  { value: "Tahunan", label: "Tahunan" },
  { value: "Lainnya", label: "Lainnya" },
];

// Komponen Tooltip
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

const SurveyForm: React.FC<SurveyFormProps> = ({
  id,
  mode,
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SurveyData>({
    nama_survei: "",
    fungsi: "",
    periode: "",
    tahun: new Date().getFullYear(),
  });

  // State untuk validasi
  const [fieldStates, setFieldStates] = useState<FieldState>({
    nama_survei: { touched: false, error: "" },
    fungsi: { touched: false, error: "" },
    periode: { touched: false, error: "" },
    tahun: { touched: false, error: "" },
  });

  // State untuk dropdown custom
  const [customFungsi, setCustomFungsi] = useState("");
  const [customPeriode, setCustomPeriode] = useState("");
  const [showCustomFungsi, setShowCustomFungsi] = useState(false);
  const [showCustomPeriode, setShowCustomPeriode] = useState(false);

  // Fungsi validasi untuk setiap field
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case "nama_survei":
        if (!value || value.toString().trim() === "") {
          return "Nama survei wajib diisi";
        }
        if (value.toString().trim().length < 3) {
          return "Nama survei minimal 3 karakter";
        }
        if (value.toString().trim().length > 100) {
          return "Nama survei maksimal 100 karakter";
        }
        return "";

      case "fungsi":
        if (!value || value === "") {
          return "Fungsi wajib dipilih";
        }
        return "";

      case "periode":
        if (!value || value === "") {
          return "Periode wajib dipilih";
        }
        return "";

      case "tahun":
        if (!value) {
          return "Tahun wajib diisi";
        }
        const tahunNum = Number(value);
        if (isNaN(tahunNum)) {
          return "Tahun harus berupa angka";
        }
        if (tahunNum < 1900 || tahunNum > 2100) {
          return "Tahun harus antara 1900-2100";
        }
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
  };

  // Validasi semua field
  const validateAllFields = (): boolean => {
    const newFieldStates: FieldState = {};
    let isValid = true;

    // Validasi semua field yang ada
    const fieldsToValidate = ["nama_survei", "fungsi", "periode", "tahun"];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field as keyof SurveyData]);
      newFieldStates[field] = { touched: true, error };
      if (error) isValid = false;
    });

    // Validasi custom fields jika diperlukan
    if (showCustomFungsi) {
      const customFungsiError = validateField("fungsi", customFungsi);
      newFieldStates.customFungsi = { touched: true, error: customFungsiError };
      if (customFungsiError) isValid = false;
    }

    if (showCustomPeriode) {
      const customPeriodeError = validateField("periode", customPeriode);
      newFieldStates.customPeriode = {
        touched: true,
        error: customPeriodeError,
      };
      if (customPeriodeError) isValid = false;
    }

    setFieldStates((prev) => ({ ...prev, ...newFieldStates }));
    return isValid;
  };

  // Fetch survey data if in edit mode
  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchSurvey = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/survei/${id}`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          if (result.success && result.data) {
            const surveyData = result.data;
            setFormData({
              nama_survei: surveyData.nama_survei || "",
              fungsi: surveyData.fungsi || "",
              periode: surveyData.periode || "",
              tahun: surveyData.tahun || new Date().getFullYear(),
            });

            // Check if custom options are needed
            const standardFungsi = fungsiOptions.some(
              (opt) => opt.value === surveyData.fungsi
            );
            const standardPeriode = periodeOptions.some(
              (opt) => opt.value === surveyData.periode
            );

            if (!standardFungsi && surveyData.fungsi) {
              setShowCustomFungsi(true);
              setCustomFungsi(surveyData.fungsi);
            }

            if (!standardPeriode && surveyData.periode) {
              setShowCustomPeriode(true);
              setCustomPeriode(surveyData.periode);
            }
          } else {
            throw new Error(result.message || "Gagal memuat data survei");
          }
        } catch (err) {
          console.error("Error fetching survey:", err);
          setError(`Gagal memuat data survei: ${(err as Error).message}`);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSurvey();
    }
  }, [mode, id]);

  // Handle input changes dengan validasi real-time
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    updateFieldState(name, value);
  };

  // Handle dropdown changes dengan validasi
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "fungsi") {
      if (value === "Lainnya") {
        setShowCustomFungsi(true);
        setFormData((prev) => ({ ...prev, fungsi: "" }));
      } else {
        setShowCustomFungsi(false);
        setFormData((prev) => ({ ...prev, fungsi: value }));
        updateFieldState("fungsi", value);
      }
    } else if (name === "periode") {
      if (value === "Lainnya") {
        setShowCustomPeriode(true);
        setFormData((prev) => ({ ...prev, periode: "" }));
      } else {
        setShowCustomPeriode(false);
        setFormData((prev) => ({ ...prev, periode: value }));
        updateFieldState("periode", value);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      updateFieldState(name, value);
    }
  };

  // Handle custom input changes
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "customFungsi") {
      setCustomFungsi(value);
      setFormData((prev) => ({ ...prev, fungsi: value }));
      updateFieldState("fungsi", value);
    } else if (name === "customPeriode") {
      setCustomPeriode(value);
      setFormData((prev) => ({ ...prev, periode: value }));
      updateFieldState("periode", value);
    }
  };

  // Handle blur events untuk menampilkan error
  const handleBlur = (name: string, value: any) => {
    updateFieldState(name, value, true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi semua field sebelum submit
    const isValid = validateAllFields();

    if (!isValid) {
      setError("Silakan perbaiki kesalahan pada form sebelum melanjutkan");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Prepare data untuk submit
      const dataToSubmit = {
        nama_survei: formData.nama_survei.trim(),
        fungsi: showCustomFungsi ? customFungsi.trim() : formData.fungsi,
        periode: showCustomPeriode ? customPeriode.trim() : formData.periode,
        tahun: Number(formData.tahun),
      };

      const url = mode === "edit" ? `/api/survei/${id}` : "/api/survei";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        throw new Error(
          result.message ||
            `Gagal ${mode === "edit" ? "memperbarui" : "menambahkan"} survei`
        );
      }
    } catch (err) {
      console.error("Error saving survey data:", err);
      setError(
        `Gagal ${mode === "edit" ? "memperbarui" : "menambahkan"} data survei: ${(err as Error).message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && mode === "edit") {
    return <div className="p-4 text-center">Memuat data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Nama Survei */}
      <div className="relative">
        <label
          htmlFor="nama_survei"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nama Survei <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nama_survei"
          name="nama_survei"
          value={formData.nama_survei}
          onChange={handleInputChange}
          onBlur={(e) => handleBlur("nama_survei", e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            fieldStates.nama_survei.touched && fieldStates.nama_survei.error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          }`}
          placeholder="Masukkan nama survei"
        />
        <Tooltip
          message={fieldStates.nama_survei.error}
          isVisible={
            fieldStates.nama_survei.touched && !!fieldStates.nama_survei.error
          }
        />
      </div>

      {/* Fungsi */}
      <div className="relative">
        <label
          htmlFor="fungsi"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Fungsi <span className="text-red-500">*</span>
        </label>
        <select
          id="fungsi"
          name="fungsi"
          value={showCustomFungsi ? "Lainnya" : formData.fungsi}
          onChange={handleDropdownChange}
          onBlur={(e) => handleBlur("fungsi", formData.fungsi)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            fieldStates.fungsi.touched && fieldStates.fungsi.error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          }`}
        >
          {fungsiOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Tooltip
          message={fieldStates.fungsi.error}
          isVisible={fieldStates.fungsi.touched && !!fieldStates.fungsi.error}
        />

        {showCustomFungsi && (
          <div className="mt-2 relative">
            <input
              type="text"
              name="customFungsi"
              value={customFungsi}
              onChange={handleCustomInputChange}
              onBlur={(e) => handleBlur("fungsi", e.target.value)}
              placeholder="Masukkan fungsi lainnya"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                fieldStates.fungsi.touched && fieldStates.fungsi.error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
              }`}
            />
          </div>
        )}
      </div>

      {/* Periode */}
      <div className="relative">
        <label
          htmlFor="periode"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Periode <span className="text-red-500">*</span>
        </label>
        <select
          id="periode"
          name="periode"
          value={showCustomPeriode ? "Lainnya" : formData.periode}
          onChange={handleDropdownChange}
          onBlur={(e) => handleBlur("periode", formData.periode)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            fieldStates.periode.touched && fieldStates.periode.error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          }`}
        >
          {periodeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Tooltip
          message={fieldStates.periode.error}
          isVisible={fieldStates.periode.touched && !!fieldStates.periode.error}
        />

        {showCustomPeriode && (
          <div className="mt-2 relative">
            <input
              type="text"
              name="customPeriode"
              value={customPeriode}
              onChange={handleCustomInputChange}
              onBlur={(e) => handleBlur("periode", e.target.value)}
              placeholder="Masukkan periode lainnya"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                fieldStates.periode.touched && fieldStates.periode.error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
              }`}
            />
          </div>
        )}
      </div>

      {/* Tahun */}
      <div className="relative">
        <label
          htmlFor="tahun"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tahun <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="tahun"
          name="tahun"
          min="1900"
          max="2100"
          value={formData.tahun}
          onChange={handleInputChange}
          onBlur={(e) => handleBlur("tahun", e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            fieldStates.tahun.touched && fieldStates.tahun.error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          }`}
          placeholder="Masukkan tahun (1900-2100)"
        />
        <p className="mt-1 text-xs text-gray-500">Format: YYYY (1900-2100)</p>
        <Tooltip
          message={fieldStates.tahun.error}
          isVisible={fieldStates.tahun.touched && !!fieldStates.tahun.error}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Menyimpan..." : mode === "edit" ? "Perbarui" : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default SurveyForm;
