import React from "react";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";

export default function Direktori() {
  return (
    <SidebarLayout>
      <div className="bg-gray-100 min-h-screen p-10">
        <Breadcrumb items={[{ label: "Profil" }]} />

        {/* Tambahkan konten direktori di sini */}
        <div className="bg-white p-4 rounded-lg shadow-md font-roboto">
          <h2 className="text-xl font-semibold mb-4">Profil</h2>
          {/*komponen lain */}
        </div>
      </div>
    </SidebarLayout>
  );
}
