"use client";

import React, { useState, useEffect } from "react";

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

            // No need to fetch perusahaan details separately
            // We'll use the selected option from the dropdown
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    // Validate required fields
    if (
      !formData.id_survei ||
      !formData.id_perusahaan ||
      !formData.id_pcl ||
      !formData.selesai
    ) {
      setError("Silakan isi semua field yang wajib diisi");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

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

      if (result.success) {
        onSuccess();
      } else {
        throw new Error(
          result.message ||
            `Gagal ${mode === "edit" ? "memperbarui" : "menambahkan"} riwayat survei`
        );
      }
    } catch (err) {
      console.error("Error saving riwayat data:", err);
      setError(
        `Gagal ${mode === "edit" ? "memperbarui" : "menambahkan"} data riwayat survei`
      );
    } finally {
      setIsLoading(false);
    }
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

      <div>
        <label
          htmlFor="id_survei"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Survei <span className="text-red-500">*</span>
        </label>
        <select
          id="id_survei"
          name="id_survei"
          value={formData.id_survei}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
          disabled={isLoadingOptions}
        >
          <option value="">Pilih Survei</option>
          {surveiOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="id_perusahaan"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Perusahaan <span className="text-red-500">*</span>
        </label>

        {isLoadingOptions ? (
          <div className="flex items-center text-sm text-gray-500 my-2">
            <div className="animate-spin h-4 w-4 mr-2 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            Memuat data perusahaan...
          </div>
        ) : perusahaanOptions.length > 0 ? (
          <select
            id="id_perusahaan"
            name="id_perusahaan"
            value={formData.id_perusahaan || ""}
            onChange={handleSelectPerusahaan}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Pilih Perusahaan</option>
            {perusahaanOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.kip} - {option.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-red-500 text-sm my-2">
            {error ? `Error: ${error}` : "Tidak ada data perusahaan tersedia"}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="id_pcl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            PCL <span className="text-red-500">*</span>
          </label>
          <select
            id="id_pcl"
            name="id_pcl"
            value={formData.id_pcl}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoadingOptions}
          >
            <option value="">Pilih PCL</option>
            {pclOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="selesai"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status Selesai <span className="text-red-500">*</span>
          </label>
          <select
            id="selesai"
            name="selesai"
            value={formData.selesai}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="Iya">Iya</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="ket_survei"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Keterangan
        </label>
        <textarea
          id="ket_survei"
          name="ket_survei"
          value={formData.ket_survei || ""}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan keterangan survei (opsional)"
        ></textarea>
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

export default RiwayatSurveiForm;
