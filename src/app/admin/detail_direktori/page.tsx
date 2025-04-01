"use client";

import React from "react";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import DetailDirektori from "@/app/components/admin/detail_direktori";

export default function Direktori() {
  return (
    <SidebarLayout>
      <div className="bg-base min-h-screen p-4 md:p-10">
        <Breadcrumb items={[{ label: "Direktori IBS" }]} />

        <div className="bg-white p-4 rounded-lg shadow-md">
          <DetailDirektori />
        </div>
      </div>
    </SidebarLayout>
  );
}
