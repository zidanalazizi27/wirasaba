"use client";

import React from "react";
import { useParams } from "next/navigation";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import PCLForm from "@/app/components/admin/pcl_form";

export default function EditPCLPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <SidebarLayout>
      <div className="bg-base min-h-screen p-4 md:p-10">
        <Breadcrumb
          items={[
            { label: "Daftar PCL", link: "/admin/pcl" },
            { label: "Edit PCL" },
          ]}
        />

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Edit PCL</h2>
          <PCLForm id={id} mode="edit" />
        </div>
      </div>
    </SidebarLayout>
  );
}
