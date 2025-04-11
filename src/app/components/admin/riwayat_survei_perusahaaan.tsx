"use client";

import React, { useState, useEffect } from "react";

interface RiwayatSurvei {
  id_riwayat: number;
  nama_survei: string;
  fungsi: string;
  periode: string;
  tahun: number;
  nama_pcl: string;
  selesai: string;
  ket_survei: string;
}

interface RiwayatSurveiPerusahaanProps {
  id_perusahaan: string | string[];
}

const RiwayatSurveiPerusahaan: React.FC<RiwayatSurveiPerusahaanProps> = ({
  id_perusahaan,
}) => {
  const [riwayatList, setRiwayatList] = useState<RiwayatSurvei[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRiwayatSurvei = async () => {
      if (!id_perusahaan) return;

      try {
        setIsLoading(true);
        // Endpoint khusus untuk mendapatkan riwayat survei berdasarkan ID perusahaan
        const response = await fetch(
          `/api/perusahaan/${id_perusahaan}/riwayat-survei`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setRiwayatList(data.data);
        } else {
          throw new Error(data.message || "Gagal memuat data riwayat survei");
        }
      } catch (err) {
        console.error("Error fetching riwayat survei:", err);
        setError("Gagal memuat data riwayat survei");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiwayatSurvei();
  }, [id_perusahaan]);

  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Riwayat Survei</h3>
        <div className="flex justify-center items-center h-32">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-75"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Riwayat Survei</h3>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Riwayat Survei</h3>

      {riwayatList.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-6 rounded text-center">
          Tidak ada data riwayat survei untuk perusahaan ini
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  No
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Nama Survei
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Fungsi
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Periode
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Tahun
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  PCL
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Selesai
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {riwayatList.map((riwayat, index) => (
                <tr key={riwayat.id_riwayat} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {riwayat.nama_survei}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {riwayat.fungsi}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {riwayat.periode}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {riwayat.tahun}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {riwayat.nama_pcl}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        riwayat.selesai === "Iya"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {riwayat.selesai}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {riwayat.ket_survei || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RiwayatSurveiPerusahaan;
