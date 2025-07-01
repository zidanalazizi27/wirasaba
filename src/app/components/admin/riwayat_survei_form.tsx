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

interface PerusahaanOption {
  id: number | string;
  name: string;
  kip: string;
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
  const [surveiOptions, setSurveiOptions] = useState<
    { id: number | string; name: string }[]
  >([]);
  const [perusahaanOptions, setPerusahaanOptions] = useState<
    PerusahaanOption[]
  >([]);
  const [pclOptions, setPclOptions] = useState<
    { id: number | string; name: string }[]
  >([]);
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
  const validateField = (name: string, value: any): string => {
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
    value: any,
    touched: boolean = false
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
        formData[fieldName as keyof RiwayatSurveiData]
      );
      newFieldStates[fieldName] = { touched: true, error };
      if (error) hasErrors = true;
    });

    // Update state dengan field yang baru divalidasi
    setFieldStates((prev) => ({ ...prev, ...newFieldStates }));

    return !hasErrors;
  };

  // function checkForChanges:
  const checkForChanges = (newFormData: RiwayatSurveiData) => {
    const hasChanged =
      JSON.stringify(newFormData) !== JSON.stringify(originalData);
    setHasChanges(hasChanged);
  };

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
      return result.isDuplicate;
    } catch (error) {
      console.error("Error checking duplicate:", error);
      return false;
    }
  };

  // Tambahkan ini di awal file riwayat_survei_form.tsx
  const DEBUG = true; // Set false di production

  function debug(...args: any[]) {
    if (DEBUG) {
      console.log(...args);
    }
  }

  // Gunakan di berbagai tempat
  useEffect(() => {
    debug("Component mounted, mode:", mode, "id:", id);
    // ...
  }, []);

  useEffect(() => {
    debug("Selected perusahaan changed:", selectedPerusahaan);
  }, [selectedPerusahaan]);

  // Gunakan untuk memantau perubahan state
  useEffect(() => {
    debug("perusahaanOptions updated:", perusahaanOptions);
  }, [perusahaanOptions]);

  // Fetch riwayat data if in edit mode
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
            setFormData(result.data);
            setOriginalData(result.data); // SET original data
          } else {
            throw new Error(result.message || "Failed to fetch riwayat data");
          }
        } catch (err) {
          console.error("Error fetching riwayat data:", err);
          setError("Gagal memuat data riwayat survei");
        } finally {
          setIsLoading(false);
        }
      };

      fetchRiwayat();
    }
  }, [id, mode]);

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoadingOptions(true);
        setError(null);

        // Fetch survei options
        try {
          const surveiResponse = await fetch("/api/survei?limit=1000");
          if (surveiResponse.ok) {
            const surveiData = await surveiResponse.json();
            if (surveiData.data) {
              setSurveiOptions(
                surveiData.data.map((survei: any) => ({
                  id: survei.id_survei,
                  name: `${survei.nama_survei} (${survei.tahun})`,
                }))
              );
            }
          }
        } catch (err) {
          console.error("Error fetching survei options:", err);
        }

        // Fetch PCL options
        try {
          const pclResponse = await fetch("/api/pcl?limit=1000");
          if (pclResponse.ok) {
            const pclData = await pclResponse.json();
            if (pclData.data) {
              setPclOptions(
                pclData.data.map((pcl: any) => ({
                  id: pcl.id_pcl,
                  name: `${pcl.nama_pcl} (${pcl.status_pcl})`,
                }))
              );
            }
          }
        } catch (err) {
          console.error("Error fetching PCL options:", err);
        }

        // Fetch perusahaan options using the new endpoint
        try {
          // Gunakan endpoint baru khusus dropdown
          const perusahaanResponse = await fetch("/api/perusahaan/dropdown");
          console.log("Perusahaan response status:", perusahaanResponse.status);

          if (perusahaanResponse.ok) {
            const result = await perusahaanResponse.json();
            console.log("Perusahaan dropdown data:", result);

            if (result.success && Array.isArray(result.data)) {
              const options = result.data.map((item: any) => ({
                id: item.id_perusahaan,
                name: item.nama_perusahaan,
                kip: item.kip || "-",
              }));

              setPerusahaanOptions(options);

              // Jika dalam edit mode, set selected perusahaan
              if (mode === "edit" && formData.id_perusahaan) {
                const selected = options.find(
                  (opt) => Number(opt.id) === Number(formData.id_perusahaan)
                );
                if (selected) {
                  setSelectedPerusahaan(selected);
                }
              }
            } else {
              console.error("Invalid perusahaan data format:", result);
              throw new Error("Format data perusahaan tidak valid");
            }
          } else {
            throw new Error(`HTTP error! status: ${perusahaanResponse.status}`);
          }
        } catch (err) {
          console.error("Error fetching perusahaan data:", err);
          setError("Gagal memuat data perusahaan");
        }
      } catch (err) {
        console.error("Error in fetchOptions:", err);
        setError("Gagal memuat opsi dropdown");
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [mode, formData.id_perusahaan]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    updateFieldState(name, value);
    checkForChanges(newFormData);
  };

  // Handle blur events untuk menampilkan error
  const handleBlur = (name: string, value: any) => {
    updateFieldState(name, value, true);
  };

  // Handle perusahaan selection from dropdown
  const handleSelectPerusahaan = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const perusahaanId = e.target.value;
    debug("Selected perusahaan ID:", perusahaanId);

    if (!perusahaanId) {
      setSelectedPerusahaan(null);
      setFormData((prev) => ({ ...prev, id_perusahaan: "" }));
      return;
    }

    const selected = perusahaanOptions.find(
      (p) => p.id.toString() === perusahaanId.toString()
    );

    debug("Found selected perusahaan:", selected);

    if (selected) {
      setSelectedPerusahaan(selected);
      setFormData((prev) => ({
        ...prev,
        id_perusahaan: selected.id,
      }));
    } else {
      debug("Selected perusahaan not found in options");
      setSelectedPerusahaan(null);
      setFormData((prev) => ({
        ...prev,
        id_perusahaan: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi semua field terlebih dahulu
    if (!validateAllFields()) {
      await SweetAlertUtils.warning(
        "Form Belum Lengkap",
        "Silakan periksa dan lengkapi form dengan benar. Semua field kecuali keterangan wajib diisi."
      );
      return;
    }

    // Check duplicate data
    const isDuplicate = await checkDuplicateData(formData);
    if (isDuplicate) {
      await SweetAlertUtils.warning(
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
        setHasChanges(false);
        onSuccess();
      } else {
        throw new Error(
          result.message ||
            `Gagal ${mode === "edit" ? "memperbarui" : "menambahkan"} data riwayat survei`
        );
      }
    } catch (err) {
      console.error("Error saving data:", err);
      SweetAlertUtils.closeLoading();
      await SweetAlertUtils.error(
        "Error",
        `Terjadi kesalahan saat ${mode === "edit" ? "memperbarui" : "menyimpan"} data`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (hasChanges) {
      const confirmed = await SweetAlertUtils.confirmCancel(
        "Batalkan Perubahan",
        "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin membatalkan?",
        "Ya, Batalkan",
        "Tetap Edit"
      );

      if (!confirmed) return;
    }

    onCancel();
  };

  // No need for search input change handler with dropdown
  if (isLoading && mode === "edit") {
    return <div className="p-4 text-center">Memuat data...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[500px] overflow-y-auto pr-2"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* ID_SURVEI */}
      <div className="space-y-1">
        <label
          htmlFor="id_survei"
          className="block text-sm font-medium text-gray-700"
        >
          Survei <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            id="id_survei"
            name="id_survei"
            value={formData.id_survei}
            onChange={handleInputChange}
            onBlur={(e) => handleBlur("id_survei", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldStates.id_survei.touched && fieldStates.id_survei.error
                ? "border-red-500"
                : "border-gray-300"
            }`}
            disabled={isLoading}
          >
            <option value="">Pilih Survei</option>
            {surveiOptions.map((survei) => (
              <option key={survei.id} value={survei.id}>
                {survei.name}
              </option>
            ))}
          </select>
          <Tooltip
            message={fieldStates.id_survei.error}
            isVisible={
              fieldStates.id_survei.touched && !!fieldStates.id_survei.error
            }
          />
        </div>
      </div>

      {/* ID_PERUSAHAAN */}
      <div className="space-y-1">
        <label
          htmlFor="id_perusahaan"
          className="block text-sm font-medium text-gray-700"
        >
          Perusahaan <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          {isLoadingOptions ? (
            <div className="flex items-center text-sm text-gray-500 my-2">
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              Memuat data perusahaan...
            </div>
          ) : perusahaanOptions.length > 0 ? (
            <>
              <select
                id="id_perusahaan"
                name="id_perusahaan"
                value={formData.id_perusahaan || ""}
                onChange={handleSelectPerusahaan}
                onBlur={(e) => handleBlur("id_perusahaan", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldStates.id_perusahaan.touched &&
                  fieldStates.id_perusahaan.error
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">Pilih Perusahaan</option>
                {perusahaanOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.kip} - {option.name}
                  </option>
                ))}
              </select>
              <Tooltip
                message={fieldStates.id_perusahaan.error}
                isVisible={
                  fieldStates.id_perusahaan.touched &&
                  !!fieldStates.id_perusahaan.error
                }
              />
            </>
          ) : (
            <div className="text-red-500 text-sm my-2">
              {error ? `Error: ${error}` : "Tidak ada data perusahaan tersedia"}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ID_PCL */}
        <div className="space-y-1">
          <label
            htmlFor="id_pcl"
            className="block text-sm font-medium text-gray-700"
          >
            PCL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="id_pcl"
              name="id_pcl"
              value={formData.id_pcl}
              onChange={handleInputChange}
              onBlur={(e) => handleBlur("id_pcl", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldStates.id_pcl.touched && fieldStates.id_pcl.error
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              disabled={isLoadingOptions}
            >
              <option value="">Pilih PCL</option>
              {pclOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <Tooltip
              message={fieldStates.id_pcl.error}
              isVisible={
                fieldStates.id_pcl.touched && !!fieldStates.id_pcl.error
              }
            />
          </div>
        </div>

        {/* STATUS SELESAI */}
        <div className="space-y-1">
          <label
            htmlFor="selesai"
            className="block text-sm font-medium text-gray-700"
          >
            Status Selesai <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="selesai"
              name="selesai"
              value={formData.selesai}
              onChange={handleInputChange}
              onBlur={(e) => handleBlur("selesai", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldStates.selesai.touched && fieldStates.selesai.error
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Pilih Status</option>{" "}
              {/* TAMBAHKAN placeholder option */}
              <option value="Iya">Iya</option>
              <option value="Tidak">Tidak</option>
            </select>
            <Tooltip
              message={fieldStates.selesai.error}
              isVisible={
                fieldStates.selesai.touched && !!fieldStates.selesai.error
              }
            />
          </div>
        </div>
      </div>

      {/* KET SURVEI */}
      <div className="space-y-1">
        <label
          htmlFor="ket_survei"
          className="block text-sm font-medium text-gray-700"
        >
          Keterangan
        </label>
        <textarea
          id="ket_survei"
          name="ket_survei"
          value={formData.ket_survei || ""}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan keterangan survei (opsional)"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={handleCancel}
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

export default RiwayatSurveiForm;
