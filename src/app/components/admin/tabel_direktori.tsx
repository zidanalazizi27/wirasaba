// src\app\components\admin\tabel_direktori.tsx
"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import type { SVGProps } from "react";
import { useRouter } from "next/navigation";
import { SweetAlertUtils } from "@/app/utils/sweetAlert";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Icon components
export const SearchIcon = ({ size = 24, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export const ChevronDownIcon = ({ size = 24, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
    />
  </svg>
);

export const ChevronRightIcon = ({ size = 24, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M8.91 19.92L15.43 13.4c.77-.77.77-2.03 0-2.8L8.91 4.08"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
    />
  </svg>
);

export const SortIcon = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M8 10.5V20M8 10.5L4 14.5M8 10.5L12 14.5M16 13.5V4M16 13.5L12 9.5M16 13.5L20 9.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export const SortAscIcon = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M16 18V6M16 6L12 10M16 6L20 10"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export const SortDescIcon = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M16 6V18M16 18L12 14M16 18L20 14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export const EyeIcon = ({ size = 20, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
      fill="currentColor"
    />
  </svg>
);

export const EditIcon = ({ size = 20, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      fill="currentColor"
    />
  </svg>
);

export const DeleteIcon = ({ size = 20, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
      fill="currentColor"
    />
  </svg>
);

export const UploadIcon = ({ size = 20, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M19.125 14.1923V16.9231C19.125 18.1288 18.1288 19.125 16.9231 19.125H7.07692C5.87121 19.125 4.875 18.1288 4.875 16.9231V14.1923M12 15.8654V4.875M12 4.875L8.30769 8.56731M12 4.875L15.6923 8.56731"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export const DownloadIcon = ({ size = 20, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M19.125 14.1923V16.9231C19.125 18.1288 18.1288 19.125 16.9231 19.125H7.07692C5.87121 19.125 4.875 18.1288 4.875 16.9231V14.1923M12 15.8654V4.875M12 15.8654L15.6923 12.1731M12 15.8654L8.30769 12.1731"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export const PlusIcon = ({ size = 20, ...props }: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M12 4C12.5523 4 13 4.44772 13 5V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V5C11 4.44772 11.4477 4 12 4Z"
      fill="currentColor"
    />
    <path
      d="M4 12C4 11.4477 4.44772 11 5 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44772 13 4 12.5523 4 12Z"
      fill="currentColor"
    />
  </svg>
);

// Tooltip component - diubah untuk mendukung posisi tooltip
const Tooltip = ({
  children,
  content,
  color = "default",
  position = "top", // Menambahkan prop position dengan default "top"
}: {
  children: React.ReactNode;
  content: string;
  color?: "default" | "danger" | "primary" | "warning";
  position?: "top" | "bottom";
}) => {
  const [show, setShow] = useState(false);

  // Menentukan style tooltip berdasarkan color
  const getColorClass = () => {
    switch (color) {
      case "danger":
        return "bg-red-600 text-white";
      case "primary":
        return "bg-blue-600 text-white";
      case "warning":
        return "bg-amber-500 text-white";
      default:
        return "bg-gray-800 text-white";
    }
  };

  // Menentukan posisi tooltip dan arrow
  const getPositionClass = () => {
    if (position === "bottom") {
      return "top-full mt-2";
    }
    return "bottom-full mb-2";
  };

  // Style untuk arrow berdasarkan posisi dan warna
  const getArrowClass = () => {
    const baseArrowClass =
      "absolute border-4 border-transparent left-1/2 -translate-x-1/2 ";

    if (position === "bottom") {
      // Arrow mengarah ke atas
      if (color === "danger")
        return baseArrowClass + "bottom-full border-b-red-600";
      if (color === "primary")
        return baseArrowClass + "bottom-full border-b-blue-600";
      if (color === "warning")
        return baseArrowClass + "bottom-full border-b-amber-500";
      return baseArrowClass + "bottom-full border-b-gray-800";
    } else {
      // Arrow mengarah ke bawah
      if (color === "danger")
        return baseArrowClass + "top-full border-t-red-600";
      if (color === "primary")
        return baseArrowClass + "top-full border-t-blue-600";
      if (color === "warning")
        return baseArrowClass + "top-full border-t-amber-500";
      return baseArrowClass + "top-full border-t-gray-800";
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      {show && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded-md whitespace-nowrap z-20 ${getPositionClass()} ${getColorClass()}`}
        >
          {content}
          <div className={getArrowClass()}></div>
        </div>
      )}
    </div>
  );
};

// Table column definitions
export const columns = [
  { name: "No", uid: "no", sortable: false },
  { name: "KIP", uid: "kip", sortable: true },
  { name: "Nama Usaha", uid: "nama_perusahaan", sortable: true },
  { name: "Alamat", uid: "alamat", sortable: true },
  { name: "Jarak", uid: "jarak", sortable: true },
  { name: "PCL", uid: "pcl_utama", sortable: true },
  { name: "Status", uid: "status", sortable: false },
  { name: "Aksi", uid: "actions", sortable: false },
];

// Status options
export const statusOptions = [
  { name: "Tinggi", uid: "tinggi" },
  { name: "Sedang", uid: "sedang" },
  { name: "Rendah", uid: "rendah" },
  { name: "Kosong", uid: "kosong" },
];

const statusColorMap: Record<string, string> = {
  tinggi: "bg-green-100 text-green-800",
  sedang: "bg-amber-100 text-amber-800",
  rendah: "bg-red-100 text-red-800",
  kosong: "bg-gray-100 text-gray-800",
};

type Business = {
  id_perusahaan: number;
  no: number;
  kip: string | number;
  nama_perusahaan: string;
  alamat: string;
  jarak: string;
  pcl_utama: string;
  status: string;
  completion_percentage: number;
  total_survei: number;
  completed_survei: number;
};
type SortDirection = "ascending" | "descending" | null;

interface SortDescriptor {
  column: string;
  direction: "ascending" | "descending" | null;
}

// Tambahkan interface untuk upload modal
interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

interface DuplicateData {
  row: number;
  kip: string;
  tahun_direktori: number[];
  existing_company?: {
    id_perusahaan: number;
    nama_perusahaan: string;
  };
}

// Upload Modal Component yang sudah lengkap
const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"append" | "replace">("append");
  const [isUploading, setIsUploading] = useState(false);

  // ✅ Enhanced file validation
  const validateFile = (selectedFile: File): boolean => {
    // Check file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      SweetAlertUtils.error(
        "Format File Tidak Didukung",
        "Silakan gunakan file dengan format .xlsx, .xls, atau .csv"
      );
      return false;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      SweetAlertUtils.error(
        "Ukuran File Terlalu Besar",
        "Ukuran file maksimal 10MB. Silakan kompres file atau kurangi jumlah data."
      );
      return false;
    }

    // Check file name
    if (!selectedFile.name) {
      SweetAlertUtils.error(
        "File Tidak Valid",
        "Nama file tidak dapat dibaca. Silakan periksa file Anda."
      );
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        console.log("✅ File valid dipilih:", {
          name: selectedFile.name,
          size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
          type: selectedFile.type,
          lastModified: new Date(selectedFile.lastModified).toISOString(),
        });
      } else {
        e.target.value = ""; // Reset input
        setFile(null);
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      SweetAlertUtils.loading(
        "Mengunduh Template",
        "Mempersiapkan template Excel dengan 16 field wajib dan 12 field opsional..."
      );

      console.log("🔄 Requesting template download...");

      const response = await fetch("/api/perusahaan/template", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Generate filename with timestamp
        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[T:]/g, "-");
        link.download = `template-direktori-perusahaan-${timestamp}.xlsx`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        SweetAlertUtils.closeLoading();
        SweetAlertUtils.success(
          "Template Berhasil Diunduh",
          "Template Excel telah diunduh dengan 28 kolom lengkap.\n\n📋 Petunjuk:\n• 🔴 16 field WAJIB harus diisi\n• ⚪ 12 field OPSIONAL boleh kosong\n• Pastikan format KIP dan Tahun Direktori sesuai petunjuk\n• Periksa sheet 'Petunjuk Kolom' dan 'Kode Referensi'"
        );
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      SweetAlertUtils.closeLoading();
      console.error("❌ Template download error:", error);
      SweetAlertUtils.error(
        "Gagal Mengunduh Template",
        `Terjadi kesalahan saat mengunduh template: ${(error as Error).message}\n\n🔧 Solusi:\n1. Periksa koneksi internet\n2. Refresh halaman dan coba lagi\n3. Hubungi admin jika masalah berlanjut`
      );
    }
  };

  // Perbaikan untuk handling SweetAlert confirmation
  const handleUpload = async () => {
    console.log("🚀 [DEBUG] Starting upload process...");

    if (!file) {
      console.log("❌ [DEBUG] No file selected");
      SweetAlertUtils.warning(
        "File Belum Dipilih",
        "Silakan pilih file terlebih dahulu sebelum melakukan upload."
      );
      return;
    }

    console.log("📄 [DEBUG] File info:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString(),
    });

    // Re-validate file before upload
    if (!validateFile(file)) {
      console.log("❌ [DEBUG] File validation failed");
      setFile(null);
      return;
    }

    console.log("✅ [DEBUG] File validation passed");

    // Confirmation dialog
    const confirmMessage =
      uploadMode === "replace"
        ? "⚠️ MODE GANTI SEMUA DATA\n\nAksi ini akan:\n• Menghapus SEMUA data direktori yang ada\n• Mengganti dengan data dari file Excel\n• Tidak dapat dibatalkan\n\nApakah Anda yakin ingin melanjutkan?"
        : "📥 MODE TAMBAH DATA\n\nAksi ini akan:\n• Menambahkan data baru ke database\n• Memperbarui data yang sudah ada\n• Menolak duplikasi KIP & tahun direktori\n\nApakah Anda yakin ingin melanjutkan?";

    console.log("🔔 [DEBUG] Showing confirmation dialog");

    let confirmResult;
    try {
      confirmResult = await SweetAlertUtils.confirm(
        "Konfirmasi Upload Data",
        confirmMessage,
        uploadMode === "replace" ? "Ya, Ganti Semua" : "Ya, Upload",
        "Tidak, Batal",
        {
          icon: uploadMode === "replace" ? "warning" : "question",
          confirmButtonColor: uploadMode === "replace" ? "#ef4444" : "#22c55e",
          cancelButtonColor: "#6b7280",
        }
      );
      console.log("✅ [DEBUG] Confirmation result:", confirmResult);
      console.log("🔍 [DEBUG] Confirmation result type:", typeof confirmResult);
      console.log(
        "🔍 [DEBUG] Confirmation result keys:",
        Object.keys(confirmResult || {})
      );

      // Debug: check different possible properties
      console.log(
        "🔍 [DEBUG] confirmResult.isConfirmed:",
        confirmResult?.isConfirmed
      );
      console.log("🔍 [DEBUG] confirmResult.value:", confirmResult?.value);
      console.log("🔍 [DEBUG] confirmResult.confirm:", confirmResult?.confirm);
      console.log("🔍 [DEBUG] confirmResult === true:", confirmResult === true);
    } catch (error) {
      console.error("❌ [DEBUG] Confirmation dialog error:", error);
      return;
    }

    // ✅ PERBAIKAN: Multiple ways to check confirmation
    const isConfirmed =
      confirmResult === true ||
      confirmResult?.isConfirmed === true ||
      confirmResult?.value === true ||
      confirmResult?.confirm === true;

    console.log("🔍 [DEBUG] Final isConfirmed decision:", isConfirmed);

    if (!isConfirmed) {
      console.log("🚫 [DEBUG] User cancelled upload");
      return;
    }

    console.log("🎯 [DEBUG] User confirmed upload, proceeding...");
    setIsUploading(true);
    console.log("⏳ [DEBUG] Upload started, isUploading set to true");

    try {
      console.log("🔄 [DEBUG] Showing loading dialog");
      SweetAlertUtils.loading(
        "Memproses Upload",
        uploadMode === "replace"
          ? "Mengganti semua data direktori..."
          : "Memvalidasi dan memproses data baru..."
      );

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", uploadMode);

      console.log("📦 [DEBUG] FormData prepared:", {
        fileSize: file.size,
        fileName: file.name,
        mode: uploadMode,
      });

      // Enhanced logging
      console.log(
        "🚀 [DEBUG] Starting fetch request to /api/perusahaan/import"
      );

      // Upload request with timeout and enhanced debugging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("⏰ [DEBUG] Request timeout after 5 minutes");
        controller.abort();
      }, 300000); // 5 minutes timeout

      console.log("🌐 [DEBUG] Making fetch request...");

      let response;
      try {
        response = await fetch("/api/perusahaan/import", {
          method: "POST",
          body: formData,
          signal: controller.signal,
          headers: {
            "X-Upload-Timestamp": new Date().toISOString(),
            "X-Upload-Mode": uploadMode,
          },
        });

        console.log("📡 [DEBUG] Fetch response received:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        });
      } catch (fetchError) {
        console.error("❌ [DEBUG] Fetch error:", fetchError);
        throw fetchError;
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(
          "❌ [DEBUG] Response not OK:",
          response.status,
          response.statusText
        );

        // Try to get error response body
        let errorText = "";
        try {
          errorText = await response.text();
          console.log("📄 [DEBUG] Error response body:", errorText);
        } catch (e) {
          console.log("❌ [DEBUG] Could not read error response body");
        }

        throw new Error(
          `Server Error ${response.status}: ${response.statusText}\nResponse: ${errorText}`
        );
      }

      console.log("📥 [DEBUG] Parsing JSON response...");
      let result;
      try {
        result = await response.json();
        console.log("📊 [DEBUG] Upload result parsed:", result);
      } catch (jsonError) {
        console.error("❌ [DEBUG] JSON parsing error:", jsonError);
        // Try to get raw response
        const rawText = await response.text();
        console.log("📄 [DEBUG] Raw response:", rawText);
        throw new Error("Invalid JSON response from server");
      }

      if (result.success) {
        console.log("✅ [DEBUG] Upload successful!");
        SweetAlertUtils.closeLoading();

        // Success message with detailed info
        const successMessage =
          uploadMode === "replace"
            ? `✅ Berhasil mengganti semua data!\n\n📊 Ringkasan:\n• Data baru: ${result.inserted || 0} perusahaan\n• Total tahun direktori: ${result.totalYears || 0}\n• Waktu proses: ${result.processingTime || "N/A"}`
            : `✅ Berhasil memproses data!\n\n📊 Ringkasan:\n• Data ditambahkan: ${result.inserted || 0} perusahaan\n• Data diperbarui: ${result.updated || 0} perusahaan\n• Total diproses: ${(result.inserted || 0) + (result.updated || 0)} perusahaan\n• Data diabaikan: ${result.skipped || 0} (duplikasi)\n• Waktu proses: ${result.processingTime || "N/A"}`;

        SweetAlertUtils.success("Upload Berhasil!", successMessage);

        // Reset form
        setFile(null);
        setUploadMode("append");

        // Trigger refresh
        onSuccess();

        // Auto close dialog after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        console.log("❌ [DEBUG] Upload failed with message:", result.message);
        console.log("📋 [DEBUG] Full error result:", result);
        throw new Error(result.message || "Upload gagal tanpa pesan error");
      }
    } catch (error) {
      console.error("❌ [DEBUG] Upload error caught:", error);
      SweetAlertUtils.closeLoading();

      const errorMessage =
        error instanceof Error ? error.message : "Error tidak dikenal";
      console.error("💥 [DEBUG] Final error details:", {
        error: errorMessage,
        fileName: file?.name,
        uploadMode: uploadMode,
        timestamp: new Date().toISOString(),
      });

      // Enhanced error handling
      let userFriendlyMessage = "Terjadi kesalahan saat mengupload file.";

      if (errorMessage.includes("abort")) {
        userFriendlyMessage =
          "Upload dibatalkan karena timeout (lebih dari 5 menit).";
      } else if (errorMessage.includes("Network")) {
        userFriendlyMessage =
          "Masalah koneksi jaringan. Periksa koneksi internet Anda.";
      } else if (errorMessage.includes("Server Error 5")) {
        userFriendlyMessage =
          "Kesalahan server internal. Silakan coba lagi atau hubungi admin.";
      } else if (errorMessage.includes("413")) {
        userFriendlyMessage = "File terlalu besar untuk diproses server.";
      } else if (errorMessage.includes("404")) {
        userFriendlyMessage =
          "Endpoint upload tidak ditemukan. Hubungi administrator.";
      }

      SweetAlertUtils.error(
        "Upload Gagal",
        `${userFriendlyMessage}\n\n🔍 Detail Error:\n${errorMessage}\n\n💡 Solusi:\n1. Periksa format file (harus .xlsx, .xls, atau .csv)\n2. Pastikan semua 16 field wajib terisi\n3. Periksa koneksi internet\n4. Coba dengan file yang lebih kecil\n5. Buka Developer Console (F12) untuk detail error`
      );
    } finally {
      console.log(
        "🏁 [DEBUG] Upload process finished, setting isUploading to false"
      );
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (isUploading) {
      SweetAlertUtils.warning(
        "Upload Sedang Berlangsung",
        "Tidak dapat menutup dialog saat upload sedang berlangsung. Silakan tunggu proses selesai."
      );
      return;
    }

    setFile(null);
    setUploadMode("append");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <h2 className="text-xl font-semibold text-center">
            📊 Upload Data Direktori Perusahaan
          </h2>
          <p className="text-blue-100 text-sm text-center mt-1">
            Sistem Terintegrasi - Validasi 16 Field Wajib + 12 Field Opsional
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              📋 Petunjuk Upload:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • 🔴 <strong>16 field WAJIB</strong> harus diisi lengkap
              </li>
              <li>
                • ⚪ <strong>12 field OPSIONAL</strong> boleh dikosongkan
              </li>
              <li>• 📄 Format file: .xlsx, .xls, atau .csv (max 10MB)</li>
              <li>• 🔢 KIP harus format TEXT, bukan angka</li>
              <li>• 📅 Tahun Direktori format: "2024,2025" atau "2024"</li>
            </ul>
          </div>

          {/* Download Template */}
          <div>
            <button
              onClick={handleDownloadTemplate}
              disabled={isUploading}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md"
            >
              📥 Unduh Template Excel (28 Kolom Lengkap)
            </button>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Template sudah termasuk petunjuk lengkap dan kode referensi
            </p>
          </div>

          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📂 Pilih File Excel/CSV
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              disabled={isUploading}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {file && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700">
                      File dipilih: {file.name}
                    </p>
                    <div className="flex space-x-4 text-xs text-green-600 mt-1">
                      <span>📏 {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>📄 {file.type || "Unknown type"}</span>
                      <span>
                        🕒 {new Date(file.lastModified).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ⚙️ Mode Upload
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="uploadMode"
                  value="append"
                  checked={uploadMode === "append"}
                  onChange={() => setUploadMode("append")}
                  disabled={isUploading}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    📥 Tambah Data (Direkomendasikan)
                  </div>
                  <div className="text-sm text-gray-600">
                    Menambahkan data baru dan memperbarui data yang sudah ada.
                    Duplikasi KIP & tahun direktori akan ditolak.
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="uploadMode"
                  value="replace"
                  checked={uploadMode === "replace"}
                  onChange={() => setUploadMode("replace")}
                  disabled={isUploading}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium text-red-900">
                    🔄 Ganti Semua Data (Hati-hati!)
                  </div>
                  <div className="text-sm text-red-600">
                    ⚠️ Menghapus SEMUA data direktori yang ada dan menggantinya
                    dengan data dari file Excel. Tidak dapat dibatalkan!
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isUploading ? "Upload Berlangsung..." : "❌ Batal"}
            </button>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                uploadMode === "replace"
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Memproses...</span>
                </span>
              ) : uploadMode === "replace" ? (
                "🔄 Ganti Semua Data"
              ) : (
                "📤 Upload Data"
              )}
            </button>
          </div>

          {/* Upload Progress Info */}
          {isUploading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-yellow-600"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Upload sedang berlangsung...
                  </p>
                  <p className="text-xs text-yellow-700">
                    Sedang memvalidasi {file?.name} • Mode:{" "}
                    {uploadMode === "replace" ? "Ganti Semua" : "Tambah Data"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabelDirektori = () => {
  const router = useRouter();

  // State declarations
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set([]));
  const [statusFilter, setStatusFilter] = useState("all");
  const [pclFilter, setPclFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDescriptors, setSortDescriptors] = useState<SortDescriptor[]>([]);
  const [pclOptions, setPclOptions] = useState<{ name: string; uid: string }[]>(
    []
  );

  // Additional state for API data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [hasLoadedAll, setHasLoadedAll] = useState(false);

  // State for dropdown visibility
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [pclDropdownOpen, setPclDropdownOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Refs for detecting outside clicks
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const pclDropdownRef = useRef<HTMLDivElement>(null);
  const [uniqueYears, setUniqueYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  // Handler untuk tombol upload yang sudah ada
  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  // Handler success untuk refresh data setelah upload
  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setHasLoadedAll(false); // Reset untuk refresh data
    fetchData(); // Refresh data tabel
    fetchDirectoryYears(); // Refresh tahun options
    fetchPclOptions();
    // Reset filters jika diperlukan
    setCurrentPage(1);
    setFilterValue(""); // Reset search jika diperlukan
  };

  const handleDownloadClick = async () => {
    try {
      // Cek apakah ada filter, sorting, atau pencarian aktif
      const hasActiveFilters =
        filterValue ||
        statusFilter !== "all" ||
        pclFilter !== "all" ||
        selectedYear ||
        sortDescriptors.length > 0;

      // Buat detail filter untuk ditampilkan
      const filterDetails = [];
      if (filterValue) filterDetails.push(`Pencarian: "${filterValue}"`);
      if (statusFilter !== "all") filterDetails.push(`Status: ${statusFilter}`);
      if (pclFilter !== "all") filterDetails.push(`PCL: ${pclFilter}`);
      if (selectedYear) filterDetails.push(`Tahun: ${selectedYear}`);
      if (sortDescriptors.length > 0)
        filterDetails.push(`Sorting: ${sortDescriptors.length} kolom`);

      const confirmMessage = hasActiveFilters
        ? "Apakah Anda yakin ingin mengunduh data direktori perusahaan? Data akan diunduh sesuai dengan filter, sorting, dan pencarian yang sedang aktif."
        : "Apakah Anda yakin ingin mengunduh semua data direktori perusahaan?";

      const result = await SweetAlertUtils.confirm(
        "Download Data Excel",
        confirmMessage,
        "Ya, Download",
        "Batal"
      );

      if (!result) return;

      // Tampilkan loading
      SweetAlertUtils.loading(
        "Memproses Download",
        `Mohon tunggu, sedang memproses ${totalItems.toLocaleString("id-ID")} record...`
      );

      // Buat parameter URL yang sama dengan parameter tabel saat ini
      const params = new URLSearchParams();

      if (filterValue) params.append("search", filterValue);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (pclFilter !== "all") params.append("pcl", pclFilter);
      if (selectedYear) params.append("year", selectedYear);

      // Tambahkan parameter sorting jika ada
      sortDescriptors.forEach((sort, index) => {
        if (sort.direction) {
          params.append(`sort[${index}][column]`, sort.column);
          params.append(`sort[${index}][direction]`, sort.direction);
        }
      });

      // Buat URL untuk download
      const downloadUrl = `/api/perusahaan/export?${params.toString()}`;

      console.log("🔗 Download URL:", downloadUrl);

      // Fetch file
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        SweetAlertUtils.closeLoading();
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Ambil data blob
      const blob = await response.blob();

      console.log("📊 Downloaded blob size:", blob.size);

      // Buat link untuk download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Ambil filename dari response header
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "direktori-perusahaan.xlsx";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Tutup loading dan tampilkan success
      SweetAlertUtils.closeLoading();

      // Hitung informasi download
      let downloadInfo = `Data direktori perusahaan berhasil diunduh!\n\nFile: ${filename}\nTotal record: ${totalItems.toLocaleString("id-ID")}`;
      if (hasActiveFilters) {
        downloadInfo += "\n\nData diunduh sesuai filter yang aktif.";
      }

      await SweetAlertUtils.success("Download Berhasil!", downloadInfo, {
        timer: 5000,
      });
    } catch (error) {
      SweetAlertUtils.closeLoading();
      console.error("Error downloading Excel:", error);

      // Tentukan pesan error dan saran
      let errorMessage =
        (error as Error).message || "Terjadi kesalahan yang tidak diketahui";
      let suggestions =
        "Silakan coba lagi atau hubungi administrator jika masalah berlanjut.";

      if (error instanceof TypeError && error.message.includes("fetch")) {
        suggestions =
          "Periksa koneksi internet Anda dan pastikan server dapat diakses.";
      } else if (error instanceof Error && error.message.includes("500")) {
        suggestions =
          "Terjadi kesalahan server. Coba lagi dengan filter yang lebih spesifik atau hubungi administrator.";
      }

      await SweetAlertUtils.error(
        "Download Gagal",
        `${errorMessage}\n\n${suggestions}`
      );
    }
  };

  // Fungsi untuk mengambil data direktori dan ekstrak tahun unik
  const fetchDirectoryYears = useCallback(async () => {
    try {
      const response = await fetch("/api/direktori");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Ekstrak tahun-tahun unik dari data direktori
        const years = result.data
          .map((dir) => dir.thn_direktori.toString())
          .filter((year, index, self) => self.indexOf(year) === index)
          .sort((a, b) => b - a); // Sortir tahun secara descending

        setUniqueYears(years);

        // Set tahun default ke tahun terbaru
        if (years.length > 0 && !selectedYear) {
          setSelectedYear(years[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching directory data:", err);
      // Gunakan tahun saat ini jika gagal
      const currentYear = new Date().getFullYear().toString();
      setUniqueYears([currentYear]);
      if (!selectedYear) {
        setSelectedYear(currentYear);
      }
    }
  }, [selectedYear]);

  // Panggil fetchDirectoryYears saat komponen dimuat
  useEffect(() => {
    fetchDirectoryYears();
  }, [fetchDirectoryYears]);

  // Fungsi untuk mengambil opsi PCL dari API
  const fetchPclOptions = useCallback(async () => {
    try {
      const response = await fetch("/api/perusahaan/pcl_utama");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setPclOptions(data);
    } catch (err) {
      console.error("Error fetching PCL options:", err);
      // Gunakan array kosong jika gagal
      setPclOptions([]);
    }
  }, []);

  // Panggil fetchPclOptions saat komponen dimuat
  useEffect(() => {
    fetchPclOptions();
  }, [fetchPclOptions]);

  const hasSearchFilter = Boolean(filterValue);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!selectedYear) return;

    try {
      setIsLoading(true);

      // Buat parameter untuk API request
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        year: selectedYear,
        search: filterValue,
        status: statusFilter,
        pcl: pclFilter,
      });

      // Tambahkan parameter sorting jika ada
      sortDescriptors.forEach((sort, index) => {
        if (sort.direction) {
          params.append(`sort[${index}][column]`, sort.column);
          params.append(`sort[${index}][direction]`, sort.direction);
        }
      });

      const response = await fetch(`/api/perusahaan?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setBusinesses(data.data);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal memuat data perusahaan");
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    rowsPerPage,
    selectedYear,
    filterValue,
    statusFilter,
    pclFilter,
    sortDescriptors,
  ]);

  //Fungsi untuk mengambil semua data (tanpa paginasi)
  const fetchAllData = useCallback(async () => {
    if (!selectedYear || hasLoadedAll) return;

    try {
      setIsLoadingAll(true);

      // Gunakan limit besar untuk mendapatkan semua data sekaligus
      const params = new URLSearchParams({
        year: selectedYear,
        search: filterValue,
        status: statusFilter,
        pcl: pclFilter,
        page: "1",
        limit: "10000", // Jumlah besar untuk mendapatkan semua data
      });

      const response = await fetch(`/api/perusahaan?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setAllBusinesses(data.data);
      setHasLoadedAll(true);
    } catch (err) {
      console.error("Error fetching all data:", err);
    } finally {
      setIsLoadingAll(false);
    }
  }, [selectedYear, filterValue, statusFilter, pclFilter, hasLoadedAll]);

  // Call API when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //Panggil fetchAllData saat diperlukan
  useEffect(() => {
    // Hanya fetch all data saat ada perubahan filter atau sorting pertama kali digunakan
    if (sortDescriptors.length > 0 && !hasLoadedAll) {
      fetchAllData();
    }
  }, [sortDescriptors, fetchAllData]);

  //Reset hasLoadedAll ketika filter berubah
  useEffect(() => {
    setHasLoadedAll(false);
  }, [selectedYear, filterValue, statusFilter, pclFilter]);

  const filteredItems = useMemo(() => {
    let filteredBusinesses = [...businesses];

    // Text search filter
    if (hasSearchFilter) {
      const lowerFilter = filterValue.toLowerCase();
      filteredBusinesses = filteredBusinesses.filter(
        (business) =>
          // Gunakan optional chaining dan pastikan tipe data sesuai
          (business.kip &&
            String(business.kip).toLowerCase().includes(lowerFilter)) ||
          (business.nama_perusahaan &&
            business.nama_perusahaan.toLowerCase().includes(lowerFilter)) ||
          (business.alamat &&
            business.alamat.toLowerCase().includes(lowerFilter))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filteredBusinesses = filteredBusinesses.filter(
        (business) => business.status === statusFilter
      );
    }

    // PCL filter
    if (pclFilter !== "all") {
      filteredBusinesses = filteredBusinesses.filter(
        (business) =>
          business.pcl_utama && String(business.pcl_utama) === pclFilter
      );
    }

    return filteredBusinesses;
  }, [businesses, filterValue, statusFilter, pclFilter, hasSearchFilter]);

  // Implementasi client-side sorting yang bekerja dengan semua data
  const sortedItems = useMemo(() => {
    // Gunakan allBusinesses jika sudah diload dan sortDescriptors tidak kosong
    // Jika tidak, gunakan data pagination biasa (businesses)
    const dataToSort =
      hasLoadedAll && sortDescriptors.length > 0
        ? [...allBusinesses]
        : [...businesses];

    if (sortDescriptors.length === 0) return dataToSort;

    return dataToSort.sort((a, b) => {
      for (const sort of sortDescriptors) {
        if (!sort.direction) continue;

        const column = sort.column as keyof Business;

        // Penanganan untuk nilai null/undefined
        const valueA = a[column] ?? "";
        const valueB = b[column] ?? "";

        // Penanganan khusus untuk setiap kolom
        if (column === "kip") {
          // Untuk KIP, konversi ke number
          const numA =
            typeof valueA === "number" ? valueA : parseInt(String(valueA)) || 0;
          const numB =
            typeof valueB === "number" ? valueB : parseInt(String(valueB)) || 0;

          if (numA !== numB) {
            return sort.direction === "ascending" ? numA - numB : numB - numA;
          }
        } else if (column === "jarak") {
          // Untuk jarak, ekstrak nilai numerik
          const numA = parseFloat(String(valueA).replace(/[^\d.-]/g, "")) || 0;
          const numB = parseFloat(String(valueB).replace(/[^\d.-]/g, "")) || 0;

          if (numA !== numB) {
            return sort.direction === "ascending" ? numA - numB : numB - numA;
          }
        } else if (column === "pcl_utama" || column === "pcl") {
          // Untuk PCL, yang bisa berisi string atau angka
          const strA = String(valueA || "").toLowerCase();
          const strB = String(valueB || "").toLowerCase();

          const compareResult = strA.localeCompare(strB);

          if (compareResult !== 0) {
            return sort.direction === "ascending"
              ? compareResult
              : -compareResult;
          }
        } else {
          // Untuk kolom teks lainnya (nama_perusahaan, alamat)
          const strA = String(valueA || "").toLowerCase();
          const strB = String(valueB || "").toLowerCase();

          const compareResult = strA.localeCompare(strB);

          if (compareResult !== 0) {
            return sort.direction === "ascending"
              ? compareResult
              : -compareResult;
          }
        }
      }

      return 0;
    });
  }, [businesses, allBusinesses, sortDescriptors, hasLoadedAll]);

  // Implementasi pagination client-side untuk data yang sudah disort
  const paginatedItems = useMemo(() => {
    // Gunakan data yang sudah di-sort
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    // Jika ada sorting dan all data sudah di-load, paginate dari sorted data
    if (hasLoadedAll && sortDescriptors.length > 0) {
      // Update juga total pages berdasarkan data yang tersedia
      const newTotalPages = Math.ceil(sortedItems.length / rowsPerPage);

      // Perbarui total items dan total pages
      if (totalPages !== newTotalPages) {
        setTotalPages(newTotalPages);
        setTotalItems(sortedItems.length);
      }

      return sortedItems.slice(start, end);
    }

    // Jika tidak ada sorting atau belum load all data, gunakan pagination dari server
    return businesses;
  }, [
    sortedItems,
    currentPage,
    rowsPerPage,
    businesses,
    hasLoadedAll,
    sortDescriptors,
    totalPages,
  ]);

  // Fungsi utama untuk sorting
  const handleSort = useCallback((columnKey: string) => {
    setSortDescriptors((prevSorts) => {
      // Cari apakah kolom ini sudah ada dalam daftar sorting
      const existingIndex = prevSorts.findIndex((s) => s.column === columnKey);

      if (existingIndex >= 0) {
        // Jika kolom sudah ada dalam daftar sort
        const existingSort = prevSorts[existingIndex];
        const newSorts = [...prevSorts];

        // Toggle arah sorting: null -> ascending -> descending -> hapus
        if (existingSort.direction === null) {
          newSorts[existingIndex] = {
            column: columnKey,
            direction: "ascending",
          };
        } else if (existingSort.direction === "ascending") {
          newSorts[existingIndex] = {
            column: columnKey,
            direction: "descending",
          };
        } else {
          // Jika sudah descending, hapus dari daftar sort
          newSorts.splice(existingIndex, 1);
        }

        return newSorts;
      } else {
        // Jika kolom belum ada dalam daftar sort, tambahkan dengan arah ascending
        return [...prevSorts, { column: columnKey, direction: "ascending" }];
      }
    });

    // Reset ke page 1 ketika sorting berubah
    setCurrentPage(1);
    setHasLoadedAll(false); // Reset status loaded data
  }, []);

  // Ubah implementasi untuk filter status
  const onStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset ke halaman pertama
    setHasLoadedAll(false); // Reset status loaded data
  }, []);

  // Fungsi untuk mendapatkan arah sorting saat ini
  const getSortDirection = useCallback(
    (columnKey: string): "ascending" | "descending" | null => {
      const sort = sortDescriptors.find((s) => s.column === columnKey);
      return sort ? sort.direction : null;
    },
    [sortDescriptors]
  );

  // Fungsi untuk mendapatkan urutan prioritas sorting
  const getSortIndex = useCallback(
    (columnKey: string): number => {
      return sortDescriptors.findIndex((s) => s.column === columnKey) + 1;
    },
    [sortDescriptors]
  );

  // Handle clicking outside dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(target)
      ) {
        setStatusDropdownOpen(false);
      }

      if (pclDropdownRef.current && !pclDropdownRef.current.contains(target)) {
        setPclDropdownOpen(false);
      }

      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(target)
      ) {
        setYearDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search handler
  const onSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFilterValue(value);
      setCurrentPage(1); // Reset to first page when searching
    },
    []
  );

  // Rows per page handler
  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setCurrentPage(1);
    },
    []
  );

  const onPclFilterChange = useCallback((pcl: string) => {
    console.log("Mengubah filter PCL:", pcl);
    setPclFilter(pcl);
    setCurrentPage(1);
  }, []);

  // Action handlers
  const handleViewBusiness = (business: Business) => {
    router.push(`/admin/direktori/${business.id_perusahaan}`);
  };

  const handleEditBusiness = (business: Business) => {
    router.push(`/admin/direktori/${business.id_perusahaan}/edit`);
  };

  // Handle delete business with SweetAlert
  const handleDeleteBusiness = async (business: Business) => {
    try {
      // Konfirmasi penghapusan dengan SweetAlert
      const confirmResult = await SweetAlertUtils.confirm(
        "Hapus Data Perusahaan",
        `Apakah Anda yakin ingin menghapus "${business.nama_perusahaan}"? Tindakan ini akan menghapus semua data terkait termasuk tahun direktori dan tidak dapat dibatalkan.`,
        "danger"
      );

      if (!confirmResult.isConfirmed) return;

      // Tampilkan loading
      SweetAlertUtils.loading("Menghapus data...", "Mohon tunggu sebentar");

      // Call the DELETE API endpoint
      const response = await fetch(
        `/api/perusahaan/${business.id_perusahaan}`,
        {
          method: "DELETE",
        }
      );

      const deleteResult = await response.json();

      // Close loading
      SweetAlertUtils.closeLoading();

      if (deleteResult.success) {
        // Tampilkan pesan sukses
        await SweetAlertUtils.success(
          "Berhasil Dihapus!",
          `"${business.nama_perusahaan}" berhasil dihapus dari database.`
        );

        // Refresh data after successful deletion
        fetchData();
        setCurrentPage(1);
        setHasLoadedAll(false);
      } else {
        // Tampilkan error dari server
        SweetAlertUtils.error(
          "Gagal Menghapus",
          deleteResult.message || "Terjadi kesalahan saat menghapus data"
        );
      }
    } catch (error) {
      console.error("Error deleting data:", error);

      // Close loading jika masih terbuka
      SweetAlertUtils.closeLoading();

      // Tampilkan error umum
      SweetAlertUtils.error(
        "Error",
        "Terjadi kesalahan saat menghapus data. Silakan coba lagi."
      );
    }
  };

  // Calculate pages
  const pages = totalPages;

  // Pagination handlers
  const onNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const onPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Dan jika perlu, reset ke halaman 1 saat sorting berubah
  useEffect(() => {
    if (sortDescriptors.length > 0) {
      setCurrentPage(1);
    }
  }, [sortDescriptors]);

  // Render cell
  const renderCell = useCallback(
    (business: Business, columnKey: keyof Business | "actions") => {
      const cellValue = business[columnKey as keyof Business];

      switch (columnKey) {
        case "no":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "kip":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "nama_perusahaan":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "alamat":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "jarak":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "pcl_utama":
          return (
            <span className="text-sm font-normal">{cellValue || "-"}</span>
          );
        // Perbarui kode untuk status di renderCell
        case "status":
          const statusText =
            cellValue === "tinggi"
              ? "Tinggi"
              : cellValue === "sedang"
                ? "Sedang"
                : cellValue === "rendah"
                  ? "Rendah"
                  : "Kosong";

          const tooltipText =
            cellValue === "kosong"
              ? "Tidak ada riwayat survei"
              : `${business.completion_percentage}% survei selesai (${business.completed_survei}/${business.total_survei})`;

          return (
            <Tooltip
              content={tooltipText}
              color={
                cellValue === "tinggi"
                  ? "primary"
                  : cellValue === "sedang"
                    ? "warning"
                    : cellValue === "rendah"
                      ? "danger"
                      : "default"
              }
            >
              <div className="flex flex-col">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                    cellValue === "tinggi"
                      ? "bg-green-100 text-green-800"
                      : cellValue === "sedang"
                        ? "bg-amber-100 text-amber-800"
                        : cellValue === "rendah"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {statusText}
                </span>
              </div>
            </Tooltip>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Lihat Detail" color="primary">
                <span
                  onClick={() => handleViewBusiness(business)}
                  className="text-lg text-gray-400 cursor-pointer active:opacity-50 hover:text-blue-500"
                >
                  <EyeIcon />
                </span>
              </Tooltip>
              <Tooltip content="Edit" color="warning">
                <span
                  onClick={() => handleEditBusiness(business)}
                  className="text-lg text-gray-400 cursor-pointer active:opacity-50 hover:text-amber-500"
                >
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Hapus">
                <span
                  onClick={() => handleDeleteBusiness(business)}
                  className="text-lg text-gray-400 cursor-pointer active:opacity-50 hover:text-red-500"
                >
                  <DeleteIcon />
                </span>
              </Tooltip>
            </div>
          );
        default:
          return <span className="text-sm font-normal">{cellValue}</span>;
      }
    },
    []
  );

  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Top section with search and filters */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-auto font-medium">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full md:w-72 bg-gray-100 rounded-lg text-sm focus:outline-none"
              placeholder="Cari KIP, nama usaha, alamat ..."
              value={filterValue}
              onChange={onSearchChange}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Status Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                className={`px-2 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  statusFilter !== "all" ? "bg-gray-100" : "bg-gray-100"
                }`}
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              >
                Status
                {statusFilter !== "all" && (
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                )}
                <ChevronDownIcon size={16} />
              </button>

              {statusDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-40">
                  <div className="py-1">
                    <button
                      className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-100 ${
                        statusFilter === "all" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        onStatusFilterChange("all");
                        setStatusDropdownOpen(false);
                      }}
                    >
                      Semua
                    </button>
                    {statusOptions.map((status) => (
                      <button
                        key={status.uid}
                        className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                          statusFilter === status.uid ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          onStatusFilterChange(status.uid);
                          setStatusDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${
                              status.uid === "tinggi"
                                ? "bg-green-500"
                                : status.uid === "sedang"
                                  ? "bg-amber-500"
                                  : status.uid === "rendah"
                                    ? "bg-red-500"
                                    : "bg-gray-500"
                            }`}
                          ></span>
                          {status.name}
                        </div>
                        {statusFilter === status.uid && (
                          <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PCL Dropdown */}
            <div className="relative" ref={pclDropdownRef}>
              <button
                className={`px-2 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  pclFilter !== "all" ? "bg-gray-100" : "bg-gray-100"
                }`}
                onClick={() => setPclDropdownOpen(!pclDropdownOpen)}
              >
                PCL
                {pclFilter !== "all" && (
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                )}
                <ChevronDownIcon size={16} />
              </button>

              {pclDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-44">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    <button
                      className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-100 ${
                        pclFilter === "all" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        onPclFilterChange("all");
                        setPclDropdownOpen(false);
                      }}
                    >
                      Semua PCL
                    </button>
                    {pclOptions.map((pcl) => (
                      <button
                        key={pcl.uid}
                        className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                          pclFilter === pcl.uid ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          onPclFilterChange(pcl.uid);
                          setPclDropdownOpen(false);
                        }}
                      >
                        <span>{pcl.name}</span>
                        {pclFilter === pcl.uid && (
                          <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tahun Dropdown */}
            <div className="relative" ref={yearDropdownRef}>
              <button
                className="px-2 py-2 bg-gray-100 rounded-lg text-sm flex items-center gap-2"
                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
              >
                {selectedYear || "Pilih Tahun"}
                <ChevronDownIcon size={16} />
              </button>

              {yearDropdownOpen && (
                <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-36">
                  <div className="py-1">
                    {uniqueYears.map((year) => (
                      <button
                        key={year}
                        className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-100 ${
                          selectedYear === year ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          setSelectedYear(year);
                          setYearDropdownOpen(false);
                          setCurrentPage(1); // Reset halaman ke awal saat ganti tahun
                        }}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Tambah */}
            <Tooltip content="Tambah Data" position="bottom">
              <button
                className="p-2 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600"
                onClick={() => router.push("/admin/direktori/tambah")}
              >
                <PlusIcon size={20} />
              </button>
            </Tooltip>

            {/* Import/Export Icons with Tooltips - Ubah posisi tooltip menjadi bottom */}
            <Tooltip content="Upload Data" position="bottom">
              <button
                className="p-2 bg-gray-100 text-green-600 rounded-lg flex items-center justify-center"
                onClick={handleUploadClick}
              >
                <UploadIcon size={20} />
              </button>
            </Tooltip>

            <Tooltip content="Download Data" position="bottom">
              <button
                className="p-2 bg-gray-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
                onClick={handleDownloadClick}
              >
                <DownloadIcon size={20} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500"></span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <select
              className="bg-gray-100 rounded-lg text-sm p-1 focus:outline-none"
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDownIcon
              size={16}
              className="text-gray-400 -ml-6 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.uid}
                  className="text-left p-4 text-sm font-bold text-gray-700"
                >
                  <div className="flex items-center gap-1">
                    {column.name}
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.uid)}
                        className="ml-1 focus:outline-none"
                      >
                        <div className="relative">
                          {getSortDirection(column.uid) === "ascending" && (
                            <SortAscIcon className="text-blue-500" />
                          )}
                          {getSortDirection(column.uid) === "descending" && (
                            <SortDescIcon className="text-blue-500" />
                          )}
                          {getSortDirection(column.uid) === null && (
                            <SortIcon className="text-gray-400" />
                          )}

                          {/* Tampilkan indikator urutan prioritas jika ada multiple sort */}
                          {getSortIndex(column.uid) > 0 &&
                            sortDescriptors.length > 1 && (
                              <span className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                                {getSortIndex(column.uid)}
                              </span>
                            )}
                        </div>
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading || (isLoadingAll && !hasLoadedAll) ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-600"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 text-center text-red-500"
                >
                  {error}
                </td>
              </tr>
            ) : paginatedItems.length > 0 ? (
              paginatedItems.map((item, index) => (
                <tr
                  key={item.id_perusahaan}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td
                      key={`${item.id_perusahaan}-${column.uid}`}
                      className="p-2"
                    >
                      {renderCell(
                        // Perbarui nomor urut jika pagination client-side
                        column.uid === "no" &&
                          hasLoadedAll &&
                          sortDescriptors.length > 0
                          ? {
                              ...item,
                              no: (currentPage - 1) * rowsPerPage + index + 1,
                            }
                          : item,
                        column.uid as keyof Business | "actions"
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 text-center text-gray-500"
                >
                  Tidak ada data yang ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 gap-4">
        <span className="text-sm text-gray-500 order-2 sm:order-1">
          Total {totalItems} data
        </span>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          <nav className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-8 h-8 rounded-md text-gray-500 disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-100"
              aria-label="Previous page"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {pages <= 7 ? (
                // Show all pages if total pages <= 7
                [...Array(pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`flex items-center justify-center w-8 h-8 rounded-md ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))
              ) : (
                // Show compact pagination for more than 7 pages
                <>
                  {/* First page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`flex items-center justify-center w-8 h-8 rounded-md ${
                      currentPage === 1
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    1
                  </button>

                  {/* Ellipsis or second page */}
                  {currentPage > 3 ? (
                    <button className="flex items-center justify-center w-8 h-8 text-gray-500">
                      ...
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentPage(2)}
                      className={`flex items-center justify-center w-8 h-8 rounded-md ${
                        currentPage === 2
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      2
                    </button>
                  )}

                  {/* Middle pages */}
                  {currentPage <= 3 ? (
                    // Near start
                    <>
                      <button
                        onClick={() => setCurrentPage(3)}
                        className={`flex items-center justify-center w-8 h-8 rounded-md ${
                          currentPage === 3
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        3
                      </button>
                      <button
                        onClick={() => setCurrentPage(4)}
                        className={`flex items-center justify-center w-8 h-8 rounded-md ${
                          currentPage === 4
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        4
                      </button>
                    </>
                  ) : currentPage >= pages - 2 ? (
                    // Near end
                    <>
                      <button
                        onClick={() => setCurrentPage(pages - 3)}
                        className={`flex items-center justify-center w-8 h-8 rounded-md ${
                          currentPage === pages - 3
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pages - 3}
                      </button>
                      <button
                        onClick={() => setCurrentPage(pages - 2)}
                        className={`flex items-center justify-center w-8 h-8 rounded-md ${
                          currentPage === pages - 2
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pages - 2}
                      </button>
                    </>
                  ) : (
                    // Middle
                    <>
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="flex items-center justify-center w-8 h-8 rounded-md text-gray-700 hover:bg-gray-100"
                      >
                        {currentPage - 1}
                      </button>
                      <button className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white">
                        {currentPage}
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="flex items-center justify-center w-8 h-8 rounded-md text-gray-700 hover:bg-gray-100"
                      >
                        {currentPage + 1}
                      </button>
                    </>
                  )}

                  {/* Ellipsis or second-to-last page */}
                  {currentPage < pages - 2 ? (
                    <button className="flex items-center justify-center w-8 h-8 text-gray-500">
                      ...
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentPage(pages - 1)}
                      className={`flex items-center justify-center w-8 h-8 rounded-md ${
                        currentPage === pages - 1
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pages - 1}
                    </button>
                  )}

                  {/* Last page */}
                  <button
                    onClick={() => setCurrentPage(pages)}
                    className={`flex items-center justify-center w-8 h-8 rounded-md ${
                      currentPage === pages
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pages}
                  </button>
                </>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={onNextPage}
              disabled={currentPage === pages}
              className="flex items-center justify-center w-8 h-8 rounded-md text-gray-500 disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-100"
              aria-label="Next page"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default TabelDirektori;
