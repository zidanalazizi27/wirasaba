// src/app/admin/riwayat_survei/page.tsx
"use client";

import React from "react";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import TabelRiwayatSurvei from "@/app/components/admin/tabel_riwayat_survei";

export default function RiwayatSurveiPage() {
  return (
    <SidebarLayout>
      <div className="bg-base min-h-screen p-4 md:p-10">
        <Breadcrumb items={[{ label: "Riwayat Survei" }]} />

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="text-center text-xl font-semibold mb-4">
            Riwayat Survei Perusahaan Industri Besar dan Sedang
          </h4>
          <TabelRiwayatSurvei />
        </div>
      </div>
    </SidebarLayout>
  );
}
