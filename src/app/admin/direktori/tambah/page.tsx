"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import DetailDirektori from "@/app/components/admin/detail_direktori";

export default function TambahDirektori() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data) => {
    try {
      setIsSaving(true);

      // Pastikan data tidak memiliki id_perusahaan
      const dataToSend = { ...data };
      delete dataToSend.id_perusahaan; // Hapus id_perusahaan jika ada

      // Generate KIP baru jika tidak ada
      if (!dataToSend.kip) {
        const currentYear = new Date().getFullYear();
        dataToSend.kip = parseInt(
          `351${currentYear.toString().substr(2)}${Date.now().toString().substr(-5)}`
        );
      }

      // Pastikan tahun_direktori adalah array
      if (
        !Array.isArray(dataToSend.tahun_direktori) ||
        dataToSend.tahun_direktori.length === 0
      ) {
        dataToSend.tahun_direktori = [new Date().getFullYear()];
      }

      // Panggil API untuk menyimpan data baru
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
        alert("Data berhasil disimpan!");
        // Redirect ke halaman detail perusahaan baru
        router.push(`/admin/direktori/${result.id}`);
      } else {
        throw new Error(result.message || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Gagal menyimpan data: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/direktori");
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
            onCancel={handleCancel}
          />
        </div>
      </div>
    </SidebarLayout>
  );
}
