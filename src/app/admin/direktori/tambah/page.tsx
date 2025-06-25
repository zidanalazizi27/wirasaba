"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import DetailDirektori from "@/app/components/admin/detail_direktori";
import { SweetAlertUtils } from "@/app/utils/sweetAlert";

export default function TambahDirektori() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data) => {
    try {
      setIsSaving(true);

      const dataToSend = { ...data };
      delete dataToSend.id_perusahaan;

      if (!dataToSend.kip) {
        const currentYear = new Date().getFullYear();
        dataToSend.kip = parseInt(
          `351${currentYear.toString().substr(2)}${Date.now().toString().substr(-5)}`
        );
      }

      if (
        !Array.isArray(dataToSend.tahun_direktori) ||
        dataToSend.tahun_direktori.length === 0
      ) {
        dataToSend.tahun_direktori = [new Date().getFullYear()];
      }

      const response = await fetch("/api/perusahaan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error: ${response.status}`);
      }

      if (result.success) {
        await SweetAlertUtils.success(
          "Berhasil!",
          "Data perusahaan baru berhasil ditambahkan!"
        );
        router.push(`/admin/direktori/${result.id}`);
      } else {
        throw new Error(result.message || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      SweetAlertUtils.error("Error", `Gagal menyimpan data: ${error.message}`);
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
            { label: "Tambah Data" },
          ]}
        />

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Tambah Data Perusahaan Baru
          </h2>
          <DetailDirektori
            id_perusahaan={null}
            mode="add"
            onSave={handleSave}
            onCancel={() => router.push("/admin/direktori")} // 🎯 SEDERHANA
          />
        </div>
      </div>
    </SidebarLayout>
  );
}
