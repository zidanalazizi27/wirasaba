"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import type { SVGProps } from "react";
import SurveyForm from "./survei_form";

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

// Table column definitions
export const columns = [
  { name: "No", uid: "no", sortable: false },
  { name: "Nama Survei", uid: "nama_survei", sortable: true },
  { name: "Fungsi", uid: "fungsi", sortable: true },
  { name: "Periode", uid: "periode", sortable: true },
  { name: "Tahun", uid: "tahun", sortable: true },
  { name: "Aksi", uid: "actions", sortable: false },
];

type Survey = {
  id_survei: number;
  no: number;
  nama_survei: string;
  fungsi: string;
  periode: string;
  tahun: number;
};

interface SortDescriptor {
  column: string;
  direction: "ascending" | "descending" | null;
}

const TabelSurvei = () => {
  // State declarations
  const [filterValue, setFilterValue] = useState("");
  const [fungsiFilter, setFungsiFilter] = useState("all");
  const [periodeFilter, setPeriodeFilter] = useState("all");
  const [tahunFilter, setTahunFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDescriptors, setSortDescriptors] = useState<SortDescriptor[]>([]);

  // Dropdown state
  const [fungsiDropdownOpen, setFungsiDropdownOpen] = useState(false);
  const [periodeDropdownOpen, setPeriodeDropdownOpen] = useState(false);
  const [tahunDropdownOpen, setTahunDropdownOpen] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter options
  const [fungsiOptions, setFungsiOptions] = useState<
    { name: string; uid: string }[]
  >([]);
  const [periodeOptions, setPeriodeOptions] = useState<
    { name: string; uid: string }[]
  >([]);
  const [tahunOptions, setTahunOptions] = useState<
    { name: string; uid: string }[]
  >([]);

  // Refs for dropdown outside clicks
  const fungsiDropdownRef = useRef<HTMLDivElement>(null);
  const periodeDropdownRef = useRef<HTMLDivElement>(null);
  const tahunDropdownRef = useRef<HTMLDivElement>(null);

  const hasSearchFilter = Boolean(filterValue);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch("/api/survei/filters");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setFungsiOptions(result.data.fungsi);
        setPeriodeOptions(result.data.periode);
        setTahunOptions(result.data.tahun);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);

  // Fetch survey data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        search: filterValue,
        fungsi: fungsiFilter,
        periode: periodeFilter,
        tahun: tahunFilter,
      });

      // Add sort parameters
      sortDescriptors.forEach((sort, index) => {
        if (sort.direction) {
          params.append(`sort[${index}][column]`, sort.column);
          params.append(`sort[${index}][direction]`, sort.direction);
        }
      });

      const response = await fetch(`/api/survei?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Add row numbers to data
        const surveyWithNumbers = result.data.map(
          (item: any, index: number) => ({
            ...item,
            no: (currentPage - 1) * rowsPerPage + index + 1,
          })
        );

        setSurveys(surveyWithNumbers);
        setTotalItems(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
        setError(null);
      } else {
        throw new Error(result.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
      setError("Gagal memuat data survei");
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    rowsPerPage,
    filterValue,
    fungsiFilter,
    periodeFilter,
    tahunFilter,
    sortDescriptors,
  ]);

  // Initial data load
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Fetch data when filters or pagination change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        fungsiDropdownRef.current &&
        !fungsiDropdownRef.current.contains(target)
      ) {
        setFungsiDropdownOpen(false);
      }

      if (
        periodeDropdownRef.current &&
        !periodeDropdownRef.current.contains(target)
      ) {
        setPeriodeDropdownOpen(false);
      }

      if (
        tahunDropdownRef.current &&
        !tahunDropdownRef.current.contains(target)
      ) {
        setTahunDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search handler
  const onSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterValue(e.target.value);
      setCurrentPage(1);
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

  // Filter handlers
  const onFungsiFilterChange = useCallback((fungsi: string) => {
    setFungsiFilter(fungsi);
    setCurrentPage(1);
  }, []);

  const onPeriodeFilterChange = useCallback((periode: string) => {
    setPeriodeFilter(periode);
    setCurrentPage(1);
  }, []);

  const onTahunFilterChange = useCallback((tahun: string) => {
    setTahunFilter(tahun);
    setCurrentPage(1);
  }, []);

  // Sorting handlers
  const handleSort = useCallback((columnKey: string) => {
    setSortDescriptors((prevSorts) => {
      const existingIndex = prevSorts.findIndex((s) => s.column === columnKey);

      if (existingIndex >= 0) {
        const existingSort = prevSorts[existingIndex];
        const newSorts = [...prevSorts];

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
          newSorts.splice(existingIndex, 1);
        }

        return newSorts;
      } else {
        return [...prevSorts, { column: columnKey, direction: "ascending" }];
      }
    });

    // Reset to page 1 when sorting changes
    setCurrentPage(1);
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

  // Pagination handlers
  const onNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const onPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  // Action handlers
  const handleViewSurvey = (survey: Survey) => {
    // Implementasi untuk detail survey
    alert(`Detail survei: ${survey.nama_survei} (ID: ${survey.id_survei})`);
  };

  const handleEditSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowEditModal(true);
  };

  const handleDeleteSurvey = async (survey: Survey) => {
    if (confirm(`Yakin ingin menghapus survei "${survey.nama_survei}"?`)) {
      try {
        const response = await fetch(`/api/survei/${survey.id_survei}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          alert("Survei berhasil dihapus");
          fetchData(); // Refresh the data
        } else {
          alert(`Gagal menghapus: ${result.message}`);
        }
      } catch (error) {
        console.error("Error deleting survey:", error);
        alert("Terjadi kesalahan saat menghapus data");
      }
    }
  };

  // Handle upload and download
  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleDownloadClick = () => {
    alert("Fitur download data sedang dalam pengembangan");
  };

  // Modal success handlers
  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchData(); // Refresh data
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedSurvey(null);
    fetchData(); // Refresh data
  };

  // Render cell content
  const renderCell = useCallback(
    (survey: Survey, columnKey: keyof Survey | "actions") => {
      const cellValue = survey[columnKey as keyof Survey];

      switch (columnKey) {
        case "no":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "nama_survei":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "fungsi":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "periode":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "tahun":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Edit" color="warning">
                <span
                  onClick={() => handleEditSurvey(survey)}
                  className="text-lg text-gray-400 cursor-pointer active:opacity-50 hover:text-amber-500"
                >
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Hapus">
                <span
                  onClick={() => handleDeleteSurvey(survey)}
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

  // Upload Modal component
  const UploadModal = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadMode, setUploadMode] = useState("append");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setFile(e.target.files[0]);
      }
    };

    const handleSubmit = () => {
      if (!file) {
        alert("Silakan pilih file terlebih dahulu");
        return;
      }

      alert(
        `File ${file.name} berhasil diupload dengan mode: ${
          uploadMode === "append" ? "Tambah Data" : "Ganti Semua Data"
        }`
      );
      setShowUploadModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-medium mb-4">Upload Data Survei</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih File Excel (.xlsx, .xls, .csv)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".xlsx, .xls, .csv"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  File terpilih: {file.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode Upload
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="append"
                    name="uploadMode"
                    value="append"
                    checked={uploadMode === "append"}
                    onChange={() => setUploadMode("append")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label
                    htmlFor="append"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Tambah Data — Menambahkan data baru, memperbarui data yang
                    sudah ada
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="replace"
                    name="uploadMode"
                    value="replace"
                    checked={uploadMode === "replace"}
                    onChange={() => setUploadMode("replace")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label
                    htmlFor="replace"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Ganti Semua Data — Menghapus semua data yang ada dan
                    menggantinya dengan data baru
                  </label>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>Catatan:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Format file harus sesuai dengan template</li>
                <li>Ukuran file maksimal 5MB</li>
                {uploadMode === "replace" && (
                  <li className="text-red-600 font-medium">
                    Semua data akan dihapus dan diganti dengan data baru!
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className={`px-2 py-2 text-white rounded-md transition-colors ${
                uploadMode === "replace"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {uploadMode === "replace" ? "Ganti Semua" : "Upload"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-medium mb-4">Tambah Survei Baru</h2>
            <SurveyForm
              mode="add"
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {showEditModal && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-medium mb-4">Edit Survei</h2>
            <SurveyForm
              id={selectedSurvey.id_survei}
              mode="edit"
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedSurvey(null);
              }}
            />
          </div>
        </div>
      )}

      {showUploadModal && <UploadModal />}

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
              placeholder="Cari nama survei, fungsi, periode..."
              value={filterValue}
              onChange={onSearchChange}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Fungsi Dropdown */}
            <div className="relative" ref={fungsiDropdownRef}>
              <button
                className={`px-2 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  fungsiFilter !== "all" ? "bg-gray-100" : "bg-gray-100"
                }`}
                onClick={() => setFungsiDropdownOpen(!fungsiDropdownOpen)}
              >
                Fungsi
                {fungsiFilter !== "all" && (
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                )}
                <ChevronDownIcon size={16} />
              </button>

              {fungsiDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-40">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    <button
                      className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-100 ${
                        fungsiFilter === "all" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        onFungsiFilterChange("all");
                        setFungsiDropdownOpen(false);
                      }}
                    >
                      Semua
                    </button>
                    {fungsiOptions.map((option) => (
                      <button
                        key={option.uid}
                        className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-100 ${
                          fungsiFilter === option.uid ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          onFungsiFilterChange(option.uid);
                          setFungsiDropdownOpen(false);
                        }}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Periode Dropdown */}
            <div className="relative" ref={periodeDropdownRef}>
              <button
                className={`px-2 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  periodeFilter !== "all" ? "bg-gray-100" : "bg-gray-100"
                }`}
                onClick={() => setPeriodeDropdownOpen(!periodeDropdownOpen)}
              >
                Periode
                {periodeFilter !== "all" && (
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                )}
                <ChevronDownIcon size={16} />
              </button>

              {periodeDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-40">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    <button
                      className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-100 ${
                        periodeFilter === "all" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        onPeriodeFilterChange("all");
                        setPeriodeDropdownOpen(false);
                      }}
                    >
                      Semua
                    </button>
                    {periodeOptions.map((option) => (
                      <button
                        key={option.uid}
                        className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-100 ${
                          periodeFilter === option.uid ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          onPeriodeFilterChange(option.uid);
                          setPeriodeDropdownOpen(false);
                        }}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tahun Dropdown */}
            <div className="relative" ref={tahunDropdownRef}>
              <button
                className={`px-2 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  tahunFilter !== "all" ? "bg-gray-100" : "bg-gray-100"
                }`}
                onClick={() => setTahunDropdownOpen(!tahunDropdownOpen)}
              >
                Tahun
                {tahunFilter !== "all" && (
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                )}
                <ChevronDownIcon size={16} />
              </button>

              {tahunDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-40">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    <button
                      className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-100 ${
                        tahunFilter === "all" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        onTahunFilterChange("all");
                        setTahunDropdownOpen(false);
                      }}
                    >
                      Semua
                    </button>
                    {tahunOptions.map((option) => (
                      <button
                        key={option.uid}
                        className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-100 ${
                          tahunFilter === option.uid ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          onTahunFilterChange(option.uid);
                          setTahunDropdownOpen(false);
                        }}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Tambah */}
            <Tooltip content="Tambah Survei" position="bottom">
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
            {isLoading ? (
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
            ) : surveys.length > 0 ? (
              surveys.map((item) => (
                <tr
                  key={item.id_survei}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td key={`${item.id_survei}-${column.uid}`} className="p-4">
                      {renderCell(item, column.uid as keyof Survey | "actions")}
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

export default TabelSurvei;
