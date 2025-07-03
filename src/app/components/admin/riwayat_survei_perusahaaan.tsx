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
  nama_perusahaan: string;
  kip: string;
}

interface RiwayatSurveiPerusahaanProps {
  kip: string | string[];
}

const RiwayatSurveiPerusahaan: React.FC<RiwayatSurveiPerusahaanProps> = ({
  kip,
}) => {
  const [riwayatList, setRiwayatList] = useState<RiwayatSurvei[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRiwayatSurvei = async () => {
      if (!kip) return;

      try {
        setIsLoading(true);
        // Endpoint untuk mendapatkan riwayat survei berdasarkan KIP
        const response = await fetch(
          `/api/riwayat-survei/by-kip?kip=${encodeURIComponent(kip)}`
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
  }, [kip]);

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
      <h3 className="text-lg font-semibold mb-4 text-center">Riwayat Survei</h3>

      {riwayatList.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-cdark">
            Belum ada riwayat survei untuk Perusahaan ini
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-cdark tracking-wider border-b">
                  No
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-cdark tracking-wider border-b">
                  Nama Survei
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-cdark tracking-wider border-b">
                  Tahun
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-cdark tracking-wider border-b">
                  PCL
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-cdark tracking-wider border-b">
                  Selesai
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-cdark tracking-wider border-b">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {riwayatList.map((riwayat, index) => (
                <tr key={riwayat.id_riwayat} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-cdark border-b">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-xs text-cdark border-b">
                    {riwayat.nama_survei}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-cdark border-b">
                    {riwayat.tahun}
                  </td>
                  <td className="px-4 py-3 text-xs text-cdark border-b">
                    {riwayat.nama_pcl}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs border-b">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        riwayat.selesai === "Iya"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {riwayat.selesai === "Iya" ? "Iya" : "Tidak"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-cdark border-b">
                    {riwayat.ket_survei || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Information */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Total Survei:</span>
                <span className="ml-2">{riwayatList.length}</span>
              </div>
              <div>
                <span className="font-medium text-green-700">Selesai:</span>
                <span className="ml-2">
                  {riwayatList.filter((r) => r.selesai === "Iya").length}
                </span>
              </div>
              <div>
                <span className="font-medium text-red-700">Belum Selesai:</span>
                <span className="ml-2">
                  {riwayatList.filter((r) => r.selesai === "Tidak").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiwayatSurveiPerusahaan;
