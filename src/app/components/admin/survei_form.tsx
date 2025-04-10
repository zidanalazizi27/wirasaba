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

// Opsi dropdown untuk Fungsi
const fungsiOptions = [
  { value: "Produksi", label: "Produksi" },
  { value: "Neraca", label: "Neraca" },
  { value: "Distribusi", label: "Distribusi" },
  { value: "Lainnya", label: "Lainnya" },
];

// Opsi dropdown untuk Periode
const periodeOptions = [
  { value: "Bulanan", label: "Bulanan" },
  { value: "Triwulan", label: "Triwulan" },
  { value: "Semester", label: "Semester" },
  { value: "Tahunan", label: "Tahunan" },
  { value: "Lainnya", label: "Lainnya" },
];

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
    fungsi: fungsiOptions[0].value,
    periode: periodeOptions[4].value, // Default to Tahunan
    tahun: new Date().getFullYear(),
  });

  // State untuk dropdown custom
  const [customFungsi, setCustomFungsi] = useState("");
  const [customPeriode, setCustomPeriode] = useState("");
  const [showCustomFungsi, setShowCustomFungsi] = useState(false);
  const [showCustomPeriode, setShowCustomPeriode] = useState(false);

  // Fetch survey data if in edit mode
  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchSurvey = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/survei/${id}`);

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result = await response.json();

          if (result.success) {
            setFormData(result.data);

            // Cek apakah fungsi dan periode adalah nilai custom
            const isFungsiCustom = !fungsiOptions.some(
              (option) => option.value === result.data.fungsi
            );
            const isPeriodeCustom = !periodeOptions.some(
              (option) => option.value === result.data.periode
            );

            if (isFungsiCustom) {
              setShowCustomFungsi(true);
              setCustomFungsi(result.data.fungsi);
              setFormData((prev) => ({ ...prev, fungsi: "Lainnya" }));
            }

            if (isPeriodeCustom) {
              setShowCustomPeriode(true);
              setCustomPeriode(result.data.periode);
              setFormData((prev) => ({ ...prev, periode: "Lainnya" }));
            }
          } else {
            throw new Error(result.message || "Failed to fetch survey data");
          }
        } catch (err) {
          console.error("Error fetching survey data:", err);
          setError("Gagal memuat data survei");
        } finally {
          setIsLoading(false);
        }
      };

      fetchSurvey();
    }
  }, [id, mode]);

  // Handle form dropdown changes
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "fungsi") {
      setFormData((prev) => ({ ...prev, fungsi: value }));
      setShowCustomFungsi(value === "Lainnya");
    } else if (name === "periode") {
      setFormData((prev) => ({ ...prev, periode: value }));
      setShowCustomPeriode(value === "Lainnya");
    }
  };

  // Handle custom input changes
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "customFungsi") {
      setCustomFungsi(value);
    } else if (name === "customPeriode") {
      setCustomPeriode(value);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "tahun" ? parseInt(value) || "" : value,
    }));
  };

  // Validasi tahun
  const validateYear = (year: string | number): boolean => {
    const yearNum = typeof year === "string" ? parseInt(year) : year;
    return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= 2100;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi tahun
    if (!validateYear(formData.tahun)) {
      setError("Tahun harus berupa angka antara 1900 dan 2100");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Persiapkan data untuk dikirim
      const dataToSubmit = { ...formData };

      // Gunakan nilai custom jika pilihan "Lainnya" dipilih
      if (showCustomFungsi && customFungsi) {
        dataToSubmit.fungsi = customFungsi;
      }

      if (showCustomPeriode && customPeriode) {
        dataToSubmit.periode = customPeriode;
      }

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

      <div>
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
          required
          value={formData.nama_survei}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan nama survei"
        />
      </div>

      <div>
        <label
          htmlFor="fungsi"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Fungsi <span className="text-red-500">*</span>
        </label>
        <select
          id="fungsi"
          name="fungsi"
          required
          value={formData.fungsi}
          onChange={handleDropdownChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {fungsiOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {showCustomFungsi && (
          <div className="mt-2">
            <input
              type="text"
              name="customFungsi"
              value={customFungsi}
              onChange={handleCustomInputChange}
              placeholder="Masukkan fungsi lainnya"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="periode"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Periode <span className="text-red-500">*</span>
        </label>
        <select
          id="periode"
          name="periode"
          required
          value={formData.periode}
          onChange={handleDropdownChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {periodeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {showCustomPeriode && (
          <div className="mt-2">
            <input
              type="text"
              name="customPeriode"
              value={customPeriode}
              onChange={handleCustomInputChange}
              placeholder="Masukkan periode lainnya"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      <div>
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
          required
          min="1900"
          max="2100"
          value={formData.tahun}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan tahun (1900-2100)"
        />
        <p className="mt-1 text-xs text-gray-500">Format: YYYY (1900-2100)</p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Menyimpan..." : mode === "edit" ? "Perbarui" : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default SurveyForm;
