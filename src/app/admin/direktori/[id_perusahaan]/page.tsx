"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import DetailDirektori from "@/app/components/admin/detail_direktori";

export default function DirektoriDetail() {
  const params = useParams();
  const router = useRouter();
  const id_perusahaan = params.id_perusahaan;
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch company name for breadcrumb
  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const response = await fetch(`/api/perusahaan/${id_perusahaan}`);

        if (!response.ok) {
          throw new Error("Failed to fetch company data");
        }

        const data = await response.json();
        setCompanyName(data.nama_perusahaan || "Detail Perusahaan");
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching company name:", error);
        setCompanyName("Detail Perusahaan");
        setIsLoading(false);
      }
    };

    if (id_perusahaan) {
      fetchCompanyName();
    }
  }, [id_perusahaan]);

  return (
    <SidebarLayout>
      <div className="bg-base min-h-screen p-4 md:p-10">
        <Breadcrumb
          items={[
            { label: "Direktori IBS", link: "/admin/direktori" },
            { label: isLoading ? "Memuat..." : companyName },
          ]}
        />

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Informasi Detail Perusahaan
          </h2>
          <DetailDirektori id_perusahaan={id_perusahaan} />
        </div>
      </div>
    </SidebarLayout>
  );
}
