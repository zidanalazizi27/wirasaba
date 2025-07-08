"use client";

import React, { useState, useEffect } from "react";
import SidebarLayout from "@/app/components/admin/sidebar_layout";
import Breadcrumb from "@/app/components/admin/breadcrumb";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "@/app/context/AuthContext";

export default function Profil() {
  const { user } = useAuth();

  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState("profile");

  // State untuk form profil
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    institution: "",
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

  // State untuk loading dan error
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Load data profil saat komponen mount
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Fetch data profil dari API
  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("wirasaba_auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfileForm({
            name: data.username || "",
            email: data.email || "",
            institution: data.institution || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

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

  // Submit handler untuk update profil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("wirasaba_auth_token")}`,
        },
        body: JSON.stringify({
          action: "update-profile",
          username: profileForm.name,
          email: profileForm.email,
          institution: profileForm.institution,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Profil berhasil diperbarui" });
        // Update form dengan data terbaru
        setProfileForm({
          name: data.username || profileForm.name,
          email: data.email || profileForm.email,
          institution: data.institution || profileForm.institution,
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Gagal memperbarui profil",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat memperbarui profil",
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit handler untuk update password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validasi password
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({
        type: "error",
        text: "Password baru dan konfirmasi tidak sama",
      });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password baru minimal 6 karakter" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("wirasaba_auth_token")}`,
        },
        body: JSON.stringify({
          action: "change-password",
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Password berhasil diperbarui" });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Gagal memperbarui password",
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat memperbarui password",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate inisial dari nama
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <SidebarLayout>
      <div className="bg-base min-h-screen p-4 md:p-6 font-roboto font-medium">
        <Breadcrumb items={[{ label: "Profil" }]} />

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mt-4 p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

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
                  <span className="text-sm font-medium text-cdark truncate">
                    {profileForm.name || "Nama belum diisi"}
                  </span>
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
                  <span className="text-sm font-medium text-cdark truncate">
                    {profileForm.email || "Email belum diisi"}
                  </span>
                </div>

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
                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-cdark truncate">
                    {profileForm.institution || "Instansi belum diisi"}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-gray-100 rounded-lg p-1 mt-6 w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "profile"
                      ? "bg-clightbrown text-white"
                      : "bg-gray-100 text-cdark"
                  }`}
                >
                  Ubah Profil
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("password")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "password"
                      ? "bg-clightbrown text-white"
                      : "bg-gray-100 text-cdark"
                  }`}
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
                      Nama <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className="text-sm font-medium w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-base text-cdark mb-1"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="text-sm font-medium w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="institution"
                      className="block text-base font-medium text-cdark mb-1"
                    >
                      Asal Instansi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="institution"
                      name="institution"
                      value={profileForm.institution}
                      onChange={handleProfileChange}
                      className="text-sm font-medium w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-clightbrown text-white py-2 px-6 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Menyimpan..." : "Simpan Profil"}
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
                      Password Lama <span className="text-red-500">*</span>
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
                        disabled={loading}
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
                      Password Baru <span className="text-red-500">*</span>
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
                        minLength={6}
                        disabled={loading}
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
                    <p className="text-xs text-gray-500 mt-1">
                      Password minimal 6 karakter
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-base text-cdark mb-1"
                    >
                      Konfirmasi Password Baru{" "}
                      <span className="text-red-500">*</span>
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
                        disabled={loading}
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
                      disabled={loading}
                      className="bg-clightbrown text-white py-2 px-6 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Mengubah..." : "Ubah Password"}
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
