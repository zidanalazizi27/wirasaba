"use client";

import React, { useState } from "react";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Image from "next/image";

export default function Profil() {
  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' atau 'password'

  // State untuk form profil
  const [profileForm, setProfileForm] = useState({
    name: "Fungsi Produksi",
    email: "produksi_3515@bps.go.id",
    institution: "BPS Kabupaten Sidoarjo",
  });

  // State untuk form password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State untuk visibility password
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Handler untuk form profil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value,
    });
  };

  // Handler untuk form password
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
  };

  // Toggle visibility password
  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  // Submit handlers
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // Implementasi API call untuk update profil
    alert("Profil berhasil diperbarui");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Password baru dan konfirmasi tidak sama");
      return;
    }
    // Implementasi API call untuk update password
    alert("Password berhasil diperbarui");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Generate inisial dari nama
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <SidebarLayout>
      <div className="bg-base min-h-screen p-4 md:p-6  font-roboto font-medium">
        <Breadcrumb items={[{ label: "Profil" }]} />

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          {/* Kartu Profil Kiri */}
          <div className="bg-white rounded-lg shadow-md p-6 md:w-1/3">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-clightbrown flex items-center justify-center text-6xl font-normal text-white mb-4">
                {getInitials(profileForm.name)}
              </div>

              <div className="space-y-4 w-full">
                <div className="flex items-center bg-base p-2 rounded">
                  <div className="bg-clightbrown p-2 rounded mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-cdark">{profileForm.name}</span>
                </div>

                <div className="flex items-center bg-base p-2 rounded">
                  <div className="bg-clightbrown p-2 rounded mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span className="text-cdark">{profileForm.email}</span>
                </div>

                <div className="flex items-center bg-base p-2 rounded">
                  <div className="bg-clightbrown p-2 rounded mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <span className="text-cdark">{profileForm.institution}</span>
                </div>
              </div>

              <div className="mt-6 w-full flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full py-2 px-4 rounded-md ${activeTab === "profile" ? "bg-clightbrown text-white" : "bg-gray-100 text-cdark"}`}
                >
                  Ubah Profil
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`w-full py-2 px-4 rounded-md ${activeTab === "password" ? "bg-clightbrown text-white" : "bg-gray-100 text-cdark"}`}
                >
                  Ubah Password
                </button>
              </div>
            </div>
          </div>

          {/* Konten Form Kanan */}
          <div className="bg-white rounded-lg shadow-md p-6 md:w-2/3">
            {activeTab === "profile" ? (
              <div>
                <h2 className="text-xl text-cdark mb-6">Ubah Profil</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-base text-cdark mb-1"
                    >
                      Nama
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className="text-sm font-medium w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-base text-cdark mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="text-sm font-medium w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="institution"
                      className="block text-base font-medium text-cdark mb-1"
                    >
                      Asal Instansi
                    </label>
                    <input
                      type="text"
                      id="institution"
                      name="institution"
                      value={profileForm.institution}
                      onChange={handleProfileChange}
                      className="text-sm font-medium w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h2 className="text-xl text-cdark mb-6">Ubah Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-base text-cdark mb-1"
                    >
                      Password Lama
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="text-sm font-medium w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2.5 text-gray-400 focus:outline-none"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {showPassword.current ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-base text-cdark mb-1"
                    >
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="text-sm font-medium w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2.5 text-gray-400 focus:outline-none"
                        onClick={() => togglePasswordVisibility("new")}
                      >
                        {showPassword.new ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-base text-cdark mb-1"
                    >
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="text-sm font-medium w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2.5 text-gray-400 focus:outline-none"
                        onClick={() => togglePasswordVisibility("confirm")}
                      >
                        {showPassword.confirm ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
