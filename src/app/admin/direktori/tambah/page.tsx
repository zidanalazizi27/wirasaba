"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import { SweetAlertUtils } from "@/app/utils/sweetAlert";
import dynamic from 'next/dynamic';

const DetailDirektori = dynamic(() => import('@/app/components/admin/detail_direktori'), {
  ssr: false,
});


// Import interface PerusahaanData
interface PerusahaanData {
  id_perusahaan: number;
  kip: string | number;
  nama_perusahaan: string;
  badan_usaha: number;
  badan_usaha_nama: string;
  alamat: string;
  kec: number;
  kec_nama: string;
  des: number;
  des_nama: string;
  kode_pos: string;
  skala: string;
  lok_perusahaan: number;
  lok_perusahaan_nama: string;
  nama_kawasan: string | null;
  lat: number | null;
  lon: number | null;
  jarak: number | null;
  produk: string;
  KBLI: number;
  telp_perusahaan: string | null;
  email_perusahaan: string | null;
  web_perusahaan: string | null;
  tkerja: number;
  tkerja_nama: string;
  investasi: number;
  investasi_nama: string;
  omset: number;
  omset_nama: string;
  nama_narasumber: string;
  jbtn_narasumber: string;
  email_narasumber: string | null;
  telp_narasumber: string | null;
  catatan: string | null;
  tahun_direktori: number[];
  pcl_utama: string;
}

export default function TambahDirektori() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: PerusahaanData) => {
    if (isSaving) return; // Prevent double submission

    try {
      setIsSaving(true);

      // Prepare data for new company
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id_perusahaan, ...dataToSend } = data; // Remove ID for new entries

      // Ensure tahun_direktori is properly set
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

      // Handle response properly
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || `Error: ${response.status}`;
        } catch {
          errorMessage = `Server error: ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      SweetAlertUtils.error("Error", `Gagal menyimpan data: ${errorMessage}`);
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
            isSaving={isSaving}
          />
        </div>
      </div>
    </SidebarLayout>
  );
}
