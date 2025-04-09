"use client";

import React from "react";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import PCLForm from "@/app/components/admin/pcl_form";

export default function TambahPCLPage() {
  return (
    <SidebarLayout>
      <div className="bg-base min-h-screen p-4 md:p-10">
        <Breadcrumb
          items={[
            { label: "Daftar PCL", link: "/admin/pcl" },
            { label: "Tambah PCL" },
          ]}
        />

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Tambah PCL Baru</h2>
          <PCLForm mode="add" />
        </div>
      </div>
    </SidebarLayout>
  );
}