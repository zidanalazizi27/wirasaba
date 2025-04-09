"use client";

import React from "react";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import TabelPCL from "@/app/components/admin/tabel_pcl";

export default function PCLPage() {
  return (
    <SidebarLayout>
      <div className="bg-base min-h-screen p-4 md:p-10">
        <Breadcrumb items={[{ label: "Daftar PCL" }]} />

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="text-center text-xl font-semibold mb-4">
            Data Petugas Pencacah Lapangan
          </h4>
          <TabelPCL />
        </div>
      </div>
    </SidebarLayout>
  );
}
