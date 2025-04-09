"use client";

import React from "react";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import TabelDirektori from "@/app/components/admin/tabel_direktori";

export default function Direktori() {
  return (
    <SidebarLayout>
      <div className="bg-base min-h-screen p-4 md:p-10">
        <Breadcrumb items={[{ label: "Direktori IBS" }]} />

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="text-center text-xl font-semibold mb-4">
            Direktori Perusahaan Industri Besar dan Sedang
          </h4>
          <TabelDirektori />
        </div>
      </div>
    </SidebarLayout>
  );
}
