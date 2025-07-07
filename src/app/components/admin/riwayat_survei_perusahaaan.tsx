// src/app/components/admin/riwayat_survei_perusahaaan.tsx
import React, { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

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
  id_perusahaan: number;
}

interface SurveySummary {
  kip: string;
  total_survei: number;
  selesai: number;
  belum_selesai: number;
  companies_count: number;
  companies: string[];
}

interface Props {
  kip: string;
  onSummaryChange?: (summary: SurveySummary | null) => void; // New prop for summary callback
}

const RiwayatSurveiPerusahaan: React.FC<Props> = ({ kip, onSummaryChange }) => {
  const [riwayatList, setRiwayatList] = useState<RiwayatSurvei[]>([]);
  const [loading, setLoading] = useState(false);
  // Removed isExpanded state - content is always visible
  const [summary, setSummary] = useState<SurveySummary | null>(null);

  // Fetch riwayat survei data based on KIP
  const fetchRiwayatSurvei = async () => {
    if (!kip) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/riwayat-survei/by-kip?kip=${encodeURIComponent(kip)}`
      );
      const data = await response.json();

      if (data.success) {
        setRiwayatList(data.data || []);

        // Set summary data
        const summaryData: SurveySummary = {
          kip: data.summary?.kip || kip,
          total_survei: data.summary?.total_survei || 0,
          selesai: data.summary?.selesai || 0,
          belum_selesai: data.summary?.belum_selesai || 0,
          companies_count: data.summary?.companies_count || 0,
          companies: data.summary?.companies || [],
        };

        setSummary(summaryData);

        // Call callback if provided
        if (onSummaryChange) {
          onSummaryChange(summaryData);
        }
      } else {
        console.error("Failed to fetch riwayat survei:", data.message);
        setRiwayatList([]);
        setSummary(null);

        if (onSummaryChange) {
          onSummaryChange(null);
        }
      }
    } catch (error) {
      console.error("Error fetching riwayat survei:", error);
      setRiwayatList([]);
      setSummary(null);

      if (onSummaryChange) {
        onSummaryChange(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when KIP changes
  useEffect(() => {
    fetchRiwayatSurvei();
  }, [kip]);

  // Calculate summary statistics
  const totalSurvei = riwayatList.length;
  const selesaiCount = riwayatList.filter((r) => r.selesai === "Iya").length;
  const belumSelesaiCount = riwayatList.filter(
    (r) => r.selesai === "Tidak"
  ).length;
  const completionPercentage =
    totalSurvei > 0 ? Math.round((selesaiCount / totalSurvei) * 100) : 0;

  // Helper function to get status based on completion percentage
  const getStatus = () => {
    if (totalSurvei === 0) return "kosong";
    if (completionPercentage >= 80) return "tinggi";
    if (completionPercentage >= 50) return "sedang";
    if (completionPercentage > 0) return "rendah";
    return "kosong";
  };

  // Get unique companies
  const uniqueCompanies = [
    ...new Set(
      riwayatList.map(
        (item) => `${item.nama_perusahaan} (ID: ${item.id_perusahaan})`
      )
    ),
  ];

  return (
    <div className="mt-4 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b flex justify-center">
        <h3 className="text-lg font-semibold text-cdark">Riwayat Survei</h3>
      </div>

      {/* Content - Always visible */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : riwayatList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Tidak ada riwayat survei untuk perusahaan ini.
            </p>
          </div>
        ) : (
          <>
            {/* Data table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-cdark tracking-wider">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font--semibold text-cdark tracking-wider">
                      Nama Survei
                    </th>
                    <th className="px-4 py-3 text-left text-sm font--semibold text-cdark tracking-wider">
                      Tahun
                    </th>
                    <th className="px-4 py-3 text-left text-sm font--semibold text-cdark tracking-wider">
                      PCL
                    </th>
                    <th className="px-4 py-3 text-left text-sm font--semibold text-cdark tracking-wider">
                      Selesai
                    </th>
                    <th className="px-4 py-3 text-left text-sm font--semibold text-cdark tracking-wider">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {riwayatList.map((riwayat, index) => (
                    <tr key={riwayat.id_riwayat} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-sm text-cdark">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-sm text-cdark">
                        {riwayat.nama_survei}
                      </td>
                      <td className="px-4 py-3 font-medium text-sm text-cdark">
                        {riwayat.tahun}
                      </td>
                      <td className="px-4 py-3 font-medium text-sm text-cdark">
                        {riwayat.nama_pcl}
                      </td>
                      <td className="px-4 py-3 text-sm">
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
                      <td className="px-4 py-3 font-medium text-sm text-cdark">
                        {riwayat.ket_survei || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Information */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm text-cdark mb-3">
                Statistik:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">
                    Total Survei:
                  </span>
                  <span className="font-bold text-gray-900">{totalSurvei}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Selesai:</span>
                  <span className="font-bold text-green-600">
                    {selesaiCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">
                    Belum Selesai:
                  </span>
                  <span className="font-bold text-red-600">
                    {belumSelesaiCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Persentase:</span>
                  <span className="font-bold text-amber-600">
                    {completionPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RiwayatSurveiPerusahaan;
