// src/app/admin/direktori/[id_perusahaan]/edit/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import DetailDirektori from "@/app/components/admin/detail_direktori";

export default function EditDirektoriDetail() {
  const params = useParams();
  const router = useRouter();
  const id_perusahaan = params.id_perusahaan;
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async (data) => {
    try {
      setIsSaving(true);

      // Tambahkan logging untuk debugging
      console.log("Saving data:", data);

      // Panggil API untuk update data
      const response = await fetch(`/api/perusahaan/${id_perusahaan}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseText = await response.text();
      console.log("Response text:", responseText);

      // Parse response jika valid JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(result.message || `Error: ${response.status}`);
      }

      if (result.success) {
        alert("Data berhasil diperbarui!");
        router.push(`/admin/direktori/${id_perusahaan}`);
      } else {
        throw new Error(result.message || "Gagal memperbarui data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Gagal menyimpan data: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="bg-base min-h-screen p-4 md:p-10">
        <Breadcrumb
          items={[
            { label: "Direktori IBS", link: "/admin/direktori" },
            {
              label: isLoading ? "Memuat..." : companyName,
              link: `/admin/direktori/${id_perusahaan}`,
            },
            { label: "Edit" },
          ]}
        />

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Edit Informasi Perusahaan
          </h2>
          <DetailDirektori
            id_perusahaan={id_perusahaan}
            mode="edit"
            onSave={handleSave}
            onCancel={() => router.push(`/admin/direktori/${id_perusahaan}`)}
          />
        </div>
      </div>
    </SidebarLayout>
  );
}
