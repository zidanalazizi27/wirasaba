"use client";

import React, { useState, useEffect } from "react";

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

const PCLForm: React.FC<PCLFormProps> = ({ id, mode, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PCLData>({
    nama_pcl: "",
    status_pcl: "Mitra", // Default value
    telp_pcl: "",
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
            setFormData(result.data);
          } else {
            throw new Error(result.message || "Failed to fetch PCL data");
          }
        } catch (err) {
          console.error("Error fetching PCL data:", err);
          setError("Gagal memuat data PCL");
        } finally {
          setIsLoading(false);
        }
      };

      fetchPCL();
    }
  }, [id, mode]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    try {
      setIsLoading(true);

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

      if (result.success) {
        onSuccess(); // Notify parent component that operation was successful
      } else {
        throw new Error(
          result.message ||
            `Gagal ${mode === "edit" ? "memperbarui" : "menambahkan"} PCL`
        );
      }
    } catch (err) {
      console.error("Error saving PCL data:", err);
      setError(
        `Gagal ${mode === "edit" ? "memperbarui" : "menambahkan"} data PCL`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && mode === "edit") {
    return <div className="p-4 text-center">Memuat data...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="nama_pcl"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nama PCL <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nama_pcl"
          name="nama_pcl"
          required
          value={formData.nama_pcl}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan nama PCL"
        />
      </div>

      <div>
        <label
          htmlFor="status_pcl"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status <span className="text-red-500">*</span>
        </label>
        <select
          id="status_pcl"
          name="status_pcl"
          required
          value={formData.status_pcl}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Mitra">Mitra</option>
          <option value="Staff">Staff</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="telp_pcl"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Telepon
        </label>
        <input
          type="text"
          id="telp_pcl"
          name="telp_pcl"
          value={formData.telp_pcl || ""}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Masukkan nomor telepon"
        />
      </div>

      <div className="flex justify-end space-x-3">
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

export default PCLForm;
