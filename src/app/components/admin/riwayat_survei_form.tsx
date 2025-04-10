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
    { id: number | string; name: string; kip: string }[]
  >([]);
  const [pclOptions, setPclOptions] = useState<
    { id: number | string; name: string }[]
  >([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Filter for perusahaan dropdown
  const [perusahaanFilter, setPerusahaanFilter] = useState("");

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

        // Fetch survei options
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

        // Fetch PCL options
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

        // Fetch some perusahaan options (will be filtered as user types)
        const perusahaanResponse = await fetch("/api/perusahaan?limit=100");
        if (perusahaanResponse.ok) {
          const perusahaanData = await perusahaanResponse.json();
          if (perusahaanData.data) {
            setPerusahaanOptions(
              perusahaanData.data.map((perusahaan: any) => ({
                id: perusahaan.id_perusahaan,
                name: perusahaan.nama_perusahaan,
                kip: perusahaan.kip,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Error fetching options:", err);
        setError("Gagal memuat pilihan dropdown");
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Fetch perusahaan by filter
  useEffect(() => {
    if (perusahaanFilter.length > 2) {
      const fetchFilteredPerusahaan = async () => {
        try {
          setIsLoadingOptions(true);
          const response = await fetch(
            `/api/perusahaan?search=${perusahaanFilter}&limit=20`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              setPerusahaanOptions(
                data.data.map((perusahaan: any) => ({
                  id: perusahaan.id_perusahaan,
                  name: perusahaan.nama_perusahaan,
                  kip: perusahaan.kip,
                }))
              );
            }
          }
        } catch (error) {
          console.error("Error fetching filtered perusahaan:", error);
        } finally {
          setIsLoadingOptions(false);
        }
      };

      fetchFilteredPerusahaan();
    }
  }, [perusahaanFilter]);

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
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Cari nama perusahaan atau KIP"
            value={perusahaanFilter}
            onChange={(e) => setPerusahaanFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            id="id_perusahaan"
            name="id_perusahaan"
            value={formData.id_perusahaan}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoadingOptions}
          >
            <option value="">Pilih Perusahaan</option>
            {perusahaanOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.kip} - {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

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
