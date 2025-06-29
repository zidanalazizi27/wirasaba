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
import PCLForm from "./pcl_form";
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

// Tooltip component
const Tooltip = ({
  children,
  content,
  color = "default",
  position = "top",
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

// Upload Modal interfaces
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
  nama_pcl: string;
  status_pcl: string;
  existing_id?: number;
}

// Upload Modal Component
const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"append" | "replace">("append");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "text/csv", // .csv
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        SweetAlertUtils.warning(
          "Format File Tidak Valid",
          "Silakan pilih file dengan format .xlsx, .xls, atau .csv"
        );
        e.target.value = "";
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        SweetAlertUtils.warning(
          "File Terlalu Besar",
          "Ukuran file maksimal 10MB"
        );
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      SweetAlertUtils.loading("Mengunduh Template", "Mohon tunggu sebentar...");

      const response = await fetch("/api/pcl/template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Get filename from response header
        const contentDisposition = response.headers.get("content-disposition");
        let filename = "template-pcl.xlsx";
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        SweetAlertUtils.closeLoading();
        SweetAlertUtils.success(
          "Template Berhasil Diunduh",
          "Silakan isi template sesuai format yang disediakan"
        );
      } else {
        throw new Error("Gagal mengunduh template");
      }
    } catch (error) {
      SweetAlertUtils.closeLoading();
      SweetAlertUtils.error(
        "Gagal Mengunduh Template",
        "Terjadi kesalahan saat mengunduh template"
      );
    }
  };

  const handleUpload = async () => {
    if (!file) {
      SweetAlertUtils.warning(
        "File Belum Dipilih",
        "Silakan pilih file terlebih dahulu"
      );
      return;
    }

    // Confirm upload action
    const confirmMessage =
      uploadMode === "replace"
        ? 'Mode "Ganti Semua Data" akan menghapus semua data PCL yang ada dan menggantinya dengan data dari file Excel. Tindakan ini tidak dapat dibatalkan.'
        : 'Mode "Tambah Data" akan menambahkan data baru dan memperbarui data yang sudah ada jika ditemukan duplikasi.';

    const confirmed = await SweetAlertUtils.confirm(
      "Konfirmasi Upload",
      confirmMessage,
      "Ya, Lanjutkan",
      "Batal"
    );

    if (!confirmed) return;

    try {
      setIsUploading(true);
      SweetAlertUtils.loading(
        "Memproses File",
        "Menganalisis dan memvalidasi data..."
      );

      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", uploadMode);

      const response = await fetch("/api/pcl/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      SweetAlertUtils.closeLoading();

      if (result.success) {
        // Handle different success scenarios
        if (result.duplicates && result.duplicates.length > 0) {
          // Show duplicate confirmation dialog
          await handleDuplicateConfirmation(
            result.duplicates,
            result.processedData,
            result.summary
          );
        } else {
          // No duplicates, show success
          await SweetAlertUtils.success(
            "Upload Berhasil!",
            `${result.summary?.processed || 0} data PCL berhasil diproses.`
          );
          onSuccess();
          onClose();
        }
      } else {
        // Handle validation errors
        if (result.errors && result.errors.length > 0) {
          await showValidationErrors(result.errors);
        } else {
          await SweetAlertUtils.error(
            "Upload Gagal",
            result.message || "Terjadi kesalahan saat memproses file"
          );
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      SweetAlertUtils.closeLoading();
      SweetAlertUtils.error("Error", "Terjadi kesalahan saat mengupload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDuplicateConfirmation = async (
    duplicates: DuplicateData[],
    processedData: any,
    summary: any
  ) => {
    const duplicateList = duplicates
      .map((dup) => `• Baris ${dup.row}: ${dup.nama_pcl} (${dup.status_pcl})`)
      .join("\n");

    const confirmed = await SweetAlertUtils.confirm(
      "Data Duplikat Ditemukan",
      `Ditemukan ${duplicates.length} data yang sudah ada:\n\n${duplicateList}\n\nApakah Anda ingin mengganti data yang sudah ada dengan data baru?`,
      "Ya, Ganti Data",
      "Lewati Data Duplikat"
    );

    try {
      SweetAlertUtils.loading("Memproses Data", "Menyimpan perubahan...");

      const formData = new FormData();
      formData.append("duplicateAction", confirmed ? "replace" : "skip");
      formData.append(
        "duplicateData",
        JSON.stringify({
          processedData,
          duplicates,
        })
      );

      const response = await fetch("/api/pcl/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      SweetAlertUtils.closeLoading();

      if (result.success) {
        await SweetAlertUtils.success(
          "Proses Selesai!",
          `${result.summary?.processed || 0} data berhasil diproses.`
        );
        onSuccess();
        onClose();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      SweetAlertUtils.closeLoading();
      SweetAlertUtils.error("Error", "Gagal memproses data duplikat");
    }
  };

  const showValidationErrors = async (errors: ValidationError[]) => {
    const errorGroups: { [key: string]: ValidationError[] } = {};

    errors.forEach((error) => {
      if (!errorGroups[error.field]) {
        errorGroups[error.field] = [];
      }
      errorGroups[error.field].push(error);
    });

    let errorMessage = "Ditemukan kesalahan pada file:\n\n";

    Object.entries(errorGroups).forEach(([field, fieldErrors]) => {
      errorMessage += `${field.toUpperCase()}:\n`;
      fieldErrors.slice(0, 5).forEach((error) => {
        errorMessage += `• Baris ${error.row}: ${error.message}\n`;
      });
      if (fieldErrors.length > 5) {
        errorMessage += `• ... dan ${fieldErrors.length - 5} kesalahan lainnya\n`;
      }
      errorMessage += "\n";
    });

    await SweetAlertUtils.warning("Validasi Gagal", errorMessage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-medium mb-4 text-center">
          Upload Data PCL
        </h2>

        <div className="space-y-4">
          {/* Download Template Button */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Unduh Template
          </button>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih File Excel (.xlsx, .xls, .csv)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              disabled={isUploading}
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                File terpilih: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Upload Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode Upload
            </label>
            <div className="space-y-2">
              <div className="flex items-start">
                <input
                  type="radio"
                  id="append"
                  name="uploadMode"
                  value="append"
                  checked={uploadMode === "append"}
                  onChange={() => setUploadMode("append")}
                  className="h-4 w-4 text-blue-600 mt-0.5"
                  disabled={isUploading}
                />
                <label htmlFor="append" className="ml-2 text-sm text-gray-700">
                  <span className="font-medium">Tambah Data</span> — Menambahkan
                  data baru, memperbarui data yang sudah ada
                </label>
              </div>
              <div className="flex items-start">
                <input
                  type="radio"
                  id="replace"
                  name="uploadMode"
                  value="replace"
                  checked={uploadMode === "replace"}
                  onChange={() => setUploadMode("replace")}
                  className="h-4 w-4 text-red-600 mt-0.5"
                  disabled={isUploading}
                />
                <label htmlFor="replace" className="ml-2 text-sm text-gray-700">
                  <span className="font-medium text-red-600">
                    Ganti Semua Data
                  </span>{" "}
                  — Menghapus semua data lama dan mengganti dengan data baru
                </label>
              </div>
            </div>
          </div>

          {/* Format Requirements */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Informasi Penting :
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>
                • <strong>Nama PCL:</strong> Wajib diisi, tidak boleh kosong
              </li>
              <li>
                • <strong>Status:</strong> Harus "Mitra" atau "Staff"
              </li>
              <li>
                • <strong>Telepon:</strong> Opsional, hanya angka jika diisi
              </li>
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || !file}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? "Memproses..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Table column definitions untuk PCL
export const columns = [
  { name: "No", uid: "no", sortable: false },
  { name: "Nama PCL", uid: "nama_pcl", sortable: true },
  { name: "Status", uid: "status_pcl", sortable: true },
  { name: "Telepon", uid: "telp_pcl", sortable: false },
  { name: "Aksi", uid: "actions", sortable: false },
];

// Status options untuk PCL
export const statusOptions = [
  { name: "Mitra", uid: "Mitra" },
  { name: "Staff", uid: "Staff" },
];

type PCL = {
  id_pcl: number;
  no: number;
  nama_pcl: string;
  status_pcl: string;
  telp_pcl: string;
};

type SortDirection = "ascending" | "descending" | null;

interface SortDescriptor {
  column: string;
  direction: "ascending" | "descending" | null;
}

const TabelPCL = () => {
  const router = useRouter();

  // State declarations
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDescriptors, setSortDescriptors] = useState<SortDescriptor[]>([]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Additional state for API data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pclList, setPclList] = useState<PCL[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPCL, setSelectedPCL] = useState<PCL | null>(null);

  // State for storing all PCL data for client-side sorting
  const [allPclData, setAllPclData] = useState<PCL[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [hasLoadedAll, setHasLoadedAll] = useState(false);

  const hasSearchFilter = Boolean(filterValue);

  // State untuk modal upload
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Handler untuk tombol upload
  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  // Handler untuk tombol download
  const handleDownloadClick = async () => {
    try {
      // Cek apakah ada filter, sorting, atau pencarian aktif
      const hasActiveFilters =
        filterValue || statusFilter !== "all" || sortDescriptors.length > 0;

      // Tampilkan konfirmasi dengan SweetAlert
      const result = await SweetAlertUtils.confirm(
        "Download Data Excel",
        `Apakah Anda yakin ingin mengunduh data PCL? ${
          hasActiveFilters
            ? "Data akan diunduh sesuai dengan filter, sorting, dan pencarian yang sedang aktif."
            : "Semua data akan diunduh."
        }`,
        "Ya, Download",
        "Batal"
      );

      if (!result) return;

      // Tampilkan loading
      SweetAlertUtils.loading(
        "Memproses Download",
        "Mohon tunggu, data sedang diproses..."
      );

      // Buat parameter URL yang sama dengan parameter tabel saat ini
      const params = new URLSearchParams();

      if (filterValue) params.append("search", filterValue);
      if (statusFilter !== "all") params.append("status", statusFilter);

      // Tambahkan parameter sorting jika ada
      sortDescriptors.forEach((sort, index) => {
        params.append(`sort[${index}][column]`, sort.column);
        params.append(
          `sort[${index}][direction]`,
          sort.direction || "ascending"
        );
      });

      // Buat URL untuk download
      const downloadUrl = `/api/pcl/export?${params.toString()}`;

      // Fetch file
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        SweetAlertUtils.closeLoading();

        // Handle different error responses
        if (response.status === 404) {
          const errorData = await response.json();
          SweetAlertUtils.warning(
            "Tidak Ada Data",
            errorData.message ||
              "Tidak ada data PCL yang ditemukan untuk diekspor"
          );
          return;
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Ambil data blob
      const blob = await response.blob();

      // Buat link untuk download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Ambil filename dari response header
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "data-pcl.xlsx";

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
      let downloadInfo = "Data PCL berhasil diunduh!";
      if (hasActiveFilters) {
        downloadInfo +=
          " Data yang diunduh telah difilter sesuai pengaturan Anda.";
      }

      SweetAlertUtils.success("Download Berhasil!", downloadInfo, {
        timer: 4000,
      });
    } catch (error) {
      SweetAlertUtils.closeLoading();
      console.error("Error downloading Excel:", error);

      SweetAlertUtils.error(
        "Download Gagal",
        `Terjadi kesalahan saat mengunduh data: ${error instanceof Error ? error.message : "Unknown error"}. Silakan coba lagi.`
      );
    }
  };

  // Fetch PCL data from API
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Buat parameter untuk API request
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        search: filterValue,
        status: statusFilter,
      });

      // Tambahkan parameter sorting jika ada
      sortDescriptors.forEach((sort, index) => {
        if (sort.direction) {
          params.append(`sort[${index}][column]`, sort.column);
          params.append(`sort[${index}][direction]`, sort.direction);
        }
      });

      const response = await fetch(`/api/pcl?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setPclList(
          result.data.map((pcl: any, index: number) => ({
            ...pcl,
            no: (currentPage - 1) * rowsPerPage + index + 1,
          }))
        );
        setTotalItems(result.count);
        setTotalPages(Math.ceil(result.count / rowsPerPage));
        setError(null);
      } else {
        throw new Error(result.message || "Failed to fetch PCL data");
      }
    } catch (err) {
      console.error("Error fetching PCL data:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      SweetAlertUtils.error("Error", "Gagal memuat data PCL");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, rowsPerPage, filterValue, statusFilter, sortDescriptors]);

  // Fungsi untuk mengambil semua data (tanpa paginasi) untuk sorting client-side
  const fetchAllData = useCallback(async () => {
    if (hasLoadedAll) return;

    try {
      setIsLoadingAll(true);

      // Gunakan limit besar untuk mendapatkan semua data sekaligus
      const params = new URLSearchParams({
        limit: "10000", // Jumlah besar untuk mendapatkan semua data
        search: filterValue,
        status: statusFilter,
      });

      const response = await fetch(`/api/pcl?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setAllPclData(result.data);
        setHasLoadedAll(true);
      } else {
        throw new Error(result.message || "Failed to fetch all PCL data");
      }
    } catch (err) {
      console.error("Error fetching all data:", err);
    } finally {
      setIsLoadingAll(false);
    }
  }, [filterValue, statusFilter, hasLoadedAll]);

  // Call API when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch all data when needed for client-side sorting
  useEffect(() => {
    if (sortDescriptors.length > 0 && !hasLoadedAll) {
      fetchAllData();
    }
  }, [sortDescriptors, fetchAllData]);

  // Reset hasLoadedAll when filters change
  useEffect(() => {
    setHasLoadedAll(false);
  }, [filterValue, statusFilter]);

  // Filter the data based on search and status
  const filteredItems = useMemo(() => {
    let filteredPcl = [...pclList];

    // Text search filter
    if (hasSearchFilter) {
      const lowerFilter = filterValue.toLowerCase();
      filteredPcl = filteredPcl.filter((pcl) =>
        pcl.nama_pcl.toLowerCase().includes(lowerFilter)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filteredPcl = filteredPcl.filter(
        (pcl) => pcl.status_pcl === statusFilter
      );
    }

    return filteredPcl;
  }, [pclList, filterValue, statusFilter, hasSearchFilter]);

  // Client-side sorting implementation
  const sortedItems = useMemo(() => {
    // Use all data if loaded and sorting is active, otherwise use paginated data
    const dataToSort =
      hasLoadedAll && sortDescriptors.length > 0
        ? [...allPclData]
        : [...pclList];

    if (sortDescriptors.length === 0) return dataToSort;

    return dataToSort.sort((a, b) => {
      for (const sort of sortDescriptors) {
        if (!sort.direction) continue;

        const column = sort.column as keyof PCL;

        // Handle null/undefined values
        const valueA = a[column] ?? "";
        const valueB = b[column] ?? "";

        // Handle different column types
        if (column === "nama_pcl" || column === "status_pcl") {
          const strA = String(valueA).toLowerCase();
          const strB = String(valueB).toLowerCase();

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
  }, [pclList, allPclData, sortDescriptors, hasLoadedAll]);

  // Paginate the sorted data
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    // If sorting is active and all data is loaded, paginate from sorted data
    if (hasLoadedAll && sortDescriptors.length > 0) {
      const newTotalPages = Math.ceil(sortedItems.length / rowsPerPage);

      // Update total pages and items
      if (totalPages !== newTotalPages) {
        setTotalPages(newTotalPages);
        setTotalItems(sortedItems.length);
      }

      return sortedItems.slice(start, end).map((item, index) => ({
        ...item,
        no: start + index + 1,
      }));
    }

    // Otherwise use the server-paginated data
    return pclList;
  }, [
    sortedItems,
    currentPage,
    rowsPerPage,
    pclList,
    hasLoadedAll,
    sortDescriptors,
    totalPages,
  ]);

  // Sorting handlers
  const handleSort = useCallback((columnKey: string) => {
    setSortDescriptors((prevSorts) => {
      const existingIndex = prevSorts.findIndex((s) => s.column === columnKey);

      if (existingIndex >= 0) {
        const existingSort = prevSorts[existingIndex];
        const newSorts = [...prevSorts];

        // Toggle sort direction: null -> ascending -> descending -> remove
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
          // If already descending, remove from sort list
          newSorts.splice(existingIndex, 1);
        }

        return newSorts;
      } else {
        // If column not in sort list, add with ascending direction
        return [...prevSorts, { column: columnKey, direction: "ascending" }];
      }
    });
  }, []);

  // Get current sort direction for a column
  const getSortDirection = useCallback(
    (columnKey: string): "ascending" | "descending" | null => {
      const sort = sortDescriptors.find((s) => s.column === columnKey);
      return sort ? sort.direction : null;
    },
    [sortDescriptors]
  );

  // Get sort index (priority) for a column
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
      setCurrentPage(1); // Reset to first page when changing rows per page
    },
    []
  );

  // Status filter handler
  const onStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when changing status filter
  }, []);

  // Action handlers
  const handleEditPCL = (pcl: PCL) => {
    setSelectedPCL(pcl);
    setShowEditModal(true);
  };

  const handleDeletePCL = async (pcl: PCL) => {
    // Gunakan SweetAlert untuk konfirmasi hapus
    const confirmDelete = await SweetAlertUtils.confirmDelete(
      "Hapus Data PCL",
      `Apakah Anda yakin ingin menghapus data PCL "${pcl.nama_pcl}"? Tindakan ini tidak dapat dibatalkan.`,
      "Ya, Hapus",
      "Batal"
    );

    if (!confirmDelete) return;

    try {
      // Show loading
      SweetAlertUtils.loading("Menghapus Data", "Mohon tunggu sebentar...");

      // Call DELETE API endpoint
      const response = await fetch(`/api/pcl/${pcl.id_pcl}`, {
        method: "DELETE",
      });

      const result = await response.json();
      SweetAlertUtils.closeLoading();

      if (result.success) {
        await SweetAlertUtils.success(
          "Berhasil Dihapus!",
          `Data PCL "${pcl.nama_pcl}" berhasil dihapus!`
        );
        // Refresh data after successful deletion
        fetchData();
      } else {
        throw new Error(result.message || "Gagal menghapus data");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      SweetAlertUtils.closeLoading();
      SweetAlertUtils.error(
        "Gagal Menghapus",
        `Terjadi kesalahan saat menghapus data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchData(); // Refresh data
    // SweetAlert success sudah ditangani di PCLForm
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedPCL(null);
    fetchData(); // Refresh data
    // SweetAlert success sudah ditangani di PCLForm
  };

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

  // Reset to page 1 when sorting changes
  useEffect(() => {
    if (sortDescriptors.length > 0) {
      setCurrentPage(1);
    }
  }, [sortDescriptors]);

  // Render cell content
  const renderCell = useCallback(
    (pcl: PCL, columnKey: keyof PCL | "actions") => {
      const cellValue = pcl[columnKey as keyof PCL];

      switch (columnKey) {
        case "no":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "nama_pcl":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "status_pcl":
          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                cellValue === "Staff"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {cellValue}
            </span>
          );
        case "telp_pcl":
          return (
            <span className="text-sm font-normal">{cellValue || "-"}</span>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Edit" color="warning">
                <span
                  onClick={() => handleEditPCL(pcl)}
                  className="text-lg text-gray-400 cursor-pointer active:opacity-50 hover:text-amber-500"
                >
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Hapus">
                <span
                  onClick={() => handleDeletePCL(pcl)}
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
      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-medium mb-4">Tambah PCL Baru</h2>
            <PCLForm
              mode="add"
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {showEditModal && selectedPCL && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-medium mb-4">Edit PCL</h2>
            <PCLForm
              id={selectedPCL.id_pcl.toString()}
              mode="edit"
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedPCL(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchData(); // Refresh data after successful upload
          }}
        />
      )}

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
              placeholder="Cari nama PCL..."
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
                      className={`w-full text-left 2 py-2 text-sm hover:bg-gray-100 ${
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
                              status.uid === "Staff"
                                ? "bg-green-500"
                                : "bg-blue-500"
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

            {/* Tombol Tambah */}
            <Tooltip content="Tambah PCL" position="bottom">
              <button
                className="p-2 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600"
                onClick={() => setShowAddModal(true)}
              >
                <PlusIcon size={20} />
              </button>
            </Tooltip>

            {/* Import/Export Icons with Tooltips */}
            <Tooltip content="Upload Data" position="bottom">
              <button
                className="p-2 bg-gray-100 text-green-600 rounded-lg flex items-center justify-center hover:bg-gray-200"
                onClick={handleUploadClick}
              >
                <UploadIcon size={20} />
              </button>
            </Tooltip>

            <Tooltip content="Download Data" position="bottom">
              <button
                className="p-2 bg-gray-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-gray-200"
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
              paginatedItems.map((item) => (
                <tr
                  key={item.id_pcl}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td key={`${item.id_pcl}-${column.uid}`} className="p-2">
                      {renderCell(item, column.uid as keyof PCL | "actions")}
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
              {totalPages <= 7 ? (
                // Show all pages if total pages <= 7
                [...Array(totalPages)].map((_, i) => (
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
                  ) : currentPage >= totalPages - 2 ? (
                    // Near end
                    <>
                      <button
                        onClick={() => setCurrentPage(totalPages - 3)}
                        className={`flex items-center justify-center w-8 h-8 rounded-md ${
                          currentPage === totalPages - 3
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {totalPages - 3}
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages - 2)}
                        className={`flex items-center justify-center w-8 h-8 rounded-md ${
                          currentPage === totalPages - 2
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {totalPages - 2}
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
                  {currentPage < totalPages - 2 ? (
                    <button className="flex items-center justify-center w-8 h-8 text-gray-500">
                      ...
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentPage(totalPages - 1)}
                      className={`flex items-center justify-center w-8 h-8 rounded-md ${
                        currentPage === totalPages - 1
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {totalPages - 1}
                    </button>
                  )}

                  {/* Last page */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`flex items-center justify-center w-8 h-8 rounded-md ${
                      currentPage === totalPages
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
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
    </div>
  );
};

export default TabelPCL;
