"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import DetailDirektori from "@/app/components/admin/detail_direktori";
import RiwayatSurveiPerusahaan from "@/app/components/admin/riwayat_survei_perusahaaan";

interface CompanyData {
  id_perusahaan: number;
  nama_perusahaan: string;
  kip: string;
}

export default function DirektoriDetail() {
  const params = useParams<{ id_perusahaan: string }>();
  const id_perusahaan = params.id_perusahaan;
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanyData = useCallback(async () => {
    try {
      const response = await fetch(`/api/perusahaan/${id_perusahaan}`);

      if (!response.ok) {
        throw new Error("Failed to fetch company data");
      }

      const data: CompanyData = await response.json();
      setCompanyData({
        id_perusahaan: data.id_perusahaan,
        nama_perusahaan: data.nama_perusahaan || "Detail Perusahaan",
        kip: data.kip || "",
      });
    } catch (error) {
      console.error("Error fetching company data:", error);
      setCompanyData({
        id_perusahaan: 0,
        nama_perusahaan: "Detail Perusahaan",
        kip: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id_perusahaan]);

  // Fetch company data including KIP
  useEffect(() => {
    if (id_perusahaan) {
      fetchCompanyData();
    }
  }, [id_perusahaan, fetchCompanyData]);

  return (
    <SidebarLayout>
      <div className="bg-base min-h-screen p-4 md:p-10">
        <Breadcrumb
          items={[
            { label: "Direktori IBS", link: "/admin/direktori" },
            {
              label: isLoading
                ? "Memuat..."
                : companyData?.nama_perusahaan || "Detail Perusahaan",
            },
          ]}
        />

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Informasi Detail Perusahaan
          </h2>
          <DetailDirektori id_perusahaan={id_perusahaan} />

          {/* Tabel Riwayat Survei - Sekarang menggunakan KIP */}
          <div className="mt-8 border-t pt-6">
            {companyData?.kip ? (
              <RiwayatSurveiPerusahaan kip={companyData.kip} />
            ) : (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Riwayat Survei</h3>
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    {isLoading
                      ? "Memuat data..."
                      : "KIP perusahaan tidak tersedia"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
