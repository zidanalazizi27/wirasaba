"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import type { SVGProps } from "react";
import RiwayatSurveiForm from "./riwayat_survei_form";
import { SweetAlertUtils } from "@/app/utils/sweetAlert";
const XLSX = require("xlsx");

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

// Table column definitions
export const columns = [
  { name: "No", uid: "no", sortable: false },
  { name: "Nama Survei", uid: "nama_survei", sortable: true },
  { name: "KIP", uid: "kip", sortable: true },
  { name: "Nama Perusahaan", uid: "nama_perusahaan", sortable: true },
  { name: "PCL", uid: "nama_pcl", sortable: true },
  { name: "Tahun", uid: "tahun", sortable: true },
  { name: "Selesai", uid: "selesai", sortable: true },
  { name: "Aksi", uid: "actions", sortable: false },
];

// Status "selesai" options
export const selesaiOptions = [
  { name: "Iya", uid: "Iya" },
  { name: "Tidak", uid: "Tidak" },
];

type RiwayatSurvei = {
  id_riwayat: number;
  no: number;
  id_survei: number;
  nama_survei: string;
  id_perusahaan: number;
  kip: string | number;
  nama_perusahaan: string;
  id_pcl: number;
  nama_pcl: string;
  tahun: number;
  selesai: string;
  ket_survei: string;
};

interface SortDescriptor {
  column: string;
  direction: "ascending" | "descending" | null;
}

const TabelRiwayatSurvei = () => {
  // State declarations
  const [filterValue, setFilterValue] = useState("");
  const [surveiFilter, setSurveiFilter] = useState("all");
  const [pclFilter, setPclFilter] = useState("all");
  const [selesaiFilter, setSelesaiFilter] = useState("all");
  const [tahunFilter, setTahunFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDescriptors, setSortDescriptors] = useState<SortDescriptor[]>([]);

  // Dropdown state
  const [surveiDropdownOpen, setSurveiDropdownOpen] = useState(false);
  const [pclDropdownOpen, setPclDropdownOpen] = useState(false);
  const [selesaiDropdownOpen, setSelesaiDropdownOpen] = useState(false);
  const [tahunDropdownOpen, setTahunDropdownOpen] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRiwayat, setSelectedRiwayat] = useState<RiwayatSurvei | null>(
    null
  );

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riwayatList, setRiwayatList] = useState<RiwayatSurvei[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter options state
  const [surveiOptions, setSurveiOptions] = useState<
    Array<{ name: string; uid: string }>
  >([]);
  const [pclOptions, setPclOptions] = useState<
    Array<{ name: string; uid: string }>
  >([]);
  const [tahunOptions, setTahunOptions] = useState<
    Array<{ name: string; uid: string }>
  >([]);

  // State untuk client-side sorting
  const [allRiwayatData, setAllRiwayatData] = useState<RiwayatSurvei[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [hasLoadedAll, setHasLoadedAll] = useState(false);

  // Refs for dropdown outside clicks
  const surveiDropdownRef = useRef<HTMLDivElement>(null);
  const pclDropdownRef = useRef<HTMLDivElement>(null);
  const selesaiDropdownRef = useRef<HTMLDivElement>(null);
  const tahunDropdownRef = useRef<HTMLDivElement>(null);

  const hasSearchFilter = Boolean(filterValue);

  // Fetch data API function - EXACTLY like tabel_pcl.tsx
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      searchParams.append("page", currentPage.toString());
      searchParams.append("limit", rowsPerPage.toString());

      // Add search parameter
      if (filterValue) {
        searchParams.append("search", filterValue);
      }

      // Add filter parameters
      if (surveiFilter !== "all") {
        searchParams.append("survei", surveiFilter);
      }
      if (pclFilter !== "all") {
        searchParams.append("pcl", pclFilter);
      }
      if (selesaiFilter !== "all") {
        searchParams.append("selesai", selesaiFilter);
      }
      if (tahunFilter !== "all") {
        searchParams.append("tahun", tahunFilter);
      }

      // Add sort parameters
      sortDescriptors.forEach((sort, index) => {
        searchParams.append(`sort[${index}][column]`, sort.column);
        searchParams.append(
          `sort[${index}][direction]`,
          sort.direction || "ascending"
        );
      });

      const response = await fetch(
        `/api/riwayat-survei?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setRiwayatList(result.data || []);
        setTotalItems(result.count || 0); // ← Fix: gunakan result.count seperti di tabel_pcl.tsx
        setTotalPages(Math.ceil((result.count || 0) / rowsPerPage)); // ← Fix: hitung sendiri seperti di tabel_pcl.tsx
      } else {
        throw new Error(result.message || "Gagal memuat data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Gagal memuat data riwayat survei");
      await SweetAlertUtils.error(
        "Error",
        "Gagal memuat data riwayat survei. Silakan refresh halaman."
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    rowsPerPage,
    filterValue,
    surveiFilter,
    pclFilter,
    selesaiFilter,
    tahunFilter,
    sortDescriptors,
  ]);

  // Fetch all data for client-side sorting - like tabel_pcl.tsx
  const fetchAllData = useCallback(async () => {
    if (hasLoadedAll) return;

    try {
      setIsLoadingAll(true);

      // Gunakan limit besar untuk mendapatkan semua data sekaligus
      const params = new URLSearchParams({
        limit: "10000", // Jumlah besar untuk mendapatkan semua data
        search: filterValue,
        survei: surveiFilter,
        pcl: pclFilter,
        selesai: selesaiFilter,
        tahun: tahunFilter,
      });

      const response = await fetch(`/api/riwayat-survei?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setAllRiwayatData(result.data || []);
        setHasLoadedAll(true);
      } else {
        throw new Error(result.message || "Failed to fetch all data");
      }
    } catch (err) {
      console.error("Error fetching all data:", err);
    } finally {
      setIsLoadingAll(false);
    }
  }, [
    filterValue,
    surveiFilter,
    pclFilter,
    selesaiFilter,
    tahunFilter,
    hasLoadedAll,
  ]);

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
  }, [filterValue, surveiFilter, pclFilter, selesaiFilter, tahunFilter]);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      // Fetch survei options
      const surveiResponse = await fetch(
        "/api/riwayat-survei/filters?type=survei"
      );
      if (surveiResponse.ok) {
        const surveiData = await surveiResponse.json();
        if (surveiData.success) {
          setSurveiOptions(surveiData.data);
        }
      }

      // Fetch PCL options
      const pclResponse = await fetch("/api/riwayat-survei/filters?type=pcl");
      if (pclResponse.ok) {
        const pclData = await pclResponse.json();
        if (pclData.success) {
          setPclOptions(pclData.data);
        }
      }

      // Fetch tahun options
      const tahunResponse = await fetch(
        "/api/riwayat-survei/filters?type=tahun"
      );
      if (tahunResponse.ok) {
        const tahunData = await tahunResponse.json();
        if (tahunData.success) {
          setTahunOptions(tahunData.data);
        }
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);

  // Filter the data based on search and filters - EXACTLY like tabel_pcl.tsx
  const filteredItems = useMemo(() => {
    let filteredRiwayat = [...riwayatList];

    // Text search filter
    if (hasSearchFilter) {
      const lowerFilter = filterValue.toLowerCase();
      filteredRiwayat = filteredRiwayat.filter(
        (riwayat) =>
          riwayat.nama_survei.toLowerCase().includes(lowerFilter) ||
          riwayat.kip.toString().toLowerCase().includes(lowerFilter) ||
          riwayat.nama_perusahaan.toLowerCase().includes(lowerFilter) ||
          riwayat.nama_pcl.toLowerCase().includes(lowerFilter)
      );
    }

    // Filter berdasarkan survei
    if (surveiFilter !== "all") {
      filteredRiwayat = filteredRiwayat.filter(
        (riwayat) => riwayat.nama_survei === surveiFilter
      );
    }

    // Filter berdasarkan PCL
    if (pclFilter !== "all") {
      filteredRiwayat = filteredRiwayat.filter(
        (riwayat) => riwayat.nama_pcl === pclFilter
      );
    }

    // Filter berdasarkan status selesai
    if (selesaiFilter !== "all") {
      filteredRiwayat = filteredRiwayat.filter(
        (riwayat) => riwayat.selesai === selesaiFilter
      );
    }

    // Filter berdasarkan tahun
    if (tahunFilter !== "all") {
      filteredRiwayat = filteredRiwayat.filter(
        (riwayat) => riwayat.tahun.toString() === tahunFilter
      );
    }

    return filteredRiwayat;
  }, [
    riwayatList,
    filterValue,
    surveiFilter,
    pclFilter,
    selesaiFilter,
    tahunFilter,
    hasSearchFilter,
  ]);

  // Client-side sorting implementation - EXACTLY like tabel_pcl.tsx
  const sortedItems = useMemo(() => {
    // Use all data if loaded and sorting is active, otherwise use paginated data
    const dataToSort =
      hasLoadedAll && sortDescriptors.length > 0
        ? [...allRiwayatData]
        : [...riwayatList];

    if (sortDescriptors.length === 0) return dataToSort;

    return dataToSort.sort((a, b) => {
      for (const sort of sortDescriptors) {
        if (!sort.direction) continue;

        const column = sort.column as keyof RiwayatSurvei;

        // Handle null/undefined values
        const valueA = a[column] ?? "";
        const valueB = b[column] ?? "";

        // Handle different column types
        if (
          ["nama_survei", "nama_perusahaan", "nama_pcl", "selesai"].includes(
            column
          )
        ) {
          const strA = String(valueA).toLowerCase();
          const strB = String(valueB).toLowerCase();

          const compareResult = strA.localeCompare(strB);

          if (compareResult !== 0) {
            return sort.direction === "ascending"
              ? compareResult
              : -compareResult;
          }
        } else if (["kip", "tahun"].includes(column)) {
          const numA = Number(valueA) || 0;
          const numB = Number(valueB) || 0;
          const compareResult = numA - numB;

          if (compareResult !== 0) {
            return sort.direction === "ascending"
              ? compareResult
              : -compareResult;
          }
        }
      }

      return 0;
    });
  }, [riwayatList, allRiwayatData, sortDescriptors, hasLoadedAll]);

  // Paginate the sorted data - EXACTLY like tabel_pcl.tsx
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

    // Otherwise use the server-paginated data with correct numbering
    return riwayatList.map((item, index) => ({
      ...item,
      no: start + index + 1,
    }));
  }, [
    sortedItems,
    currentPage,
    rowsPerPage,
    riwayatList,
    hasLoadedAll,
    sortDescriptors,
    totalPages,
  ]);

  // Initial data load
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        surveiDropdownRef.current &&
        !surveiDropdownRef.current.contains(target)
      ) {
        setSurveiDropdownOpen(false);
      }
      if (pclDropdownRef.current && !pclDropdownRef.current.contains(target)) {
        setPclDropdownOpen(false);
      }
      if (
        selesaiDropdownRef.current &&
        !selesaiDropdownRef.current.contains(target)
      ) {
        setSelesaiDropdownOpen(false);
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
      const value = e.target.value;
      setFilterValue(value);
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
  const onSurveiFilterChange = useCallback((survei: string) => {
    setSurveiFilter(survei);
    setCurrentPage(1);
  }, []);

  const onPclFilterChange = useCallback((pcl: string) => {
    setPclFilter(pcl);
    setCurrentPage(1);
  }, []);

  const onSelesaiFilterChange = useCallback((selesai: string) => {
    setSelesaiFilter(selesai);
    setCurrentPage(1);
  }, []);

  const onTahunFilterChange = useCallback((tahun: string) => {
    setTahunFilter(tahun);
    setCurrentPage(1);
  }, []);

  // Sorting handlers - EXACTLY like tabel_pcl.tsx
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

  // Pagination handlers - EXACTLY like tabel_pcl.tsx
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

  // Action handlers
  const handleEditRiwayat = (riwayat: RiwayatSurvei) => {
    setSelectedRiwayat(riwayat);
    setShowEditModal(true);
  };

  // Handle delete with sweet alert confirmation
  const handleDelete = async (riwayat: RiwayatSurvei) => {
    const confirmed = await SweetAlertUtils.confirmDelete(
      "Hapus Data Riwayat Survei",
      `Apakah Anda yakin ingin menghapus riwayat survei "${riwayat.nama_survei}" untuk perusahaan "${riwayat.nama_perusahaan}"?`,
      "Ya, Hapus",
      "Batal"
    );

    if (!confirmed) return;

    try {
      SweetAlertUtils.loading("Menghapus Data", "Mohon tunggu sebentar...");

      const response = await fetch(
        `/api/riwayat-survei/${riwayat.id_riwayat}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      SweetAlertUtils.closeLoading();

      if (result.success) {
        await SweetAlertUtils.success(
          "Berhasil Dihapus!",
          `Data riwayat survei "${riwayat.nama_survei}" berhasil dihapus.`
        );
        // Refresh data after successful deletion
        fetchData();
      } else {
        throw new Error(result.message || "Gagal menghapus data");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      SweetAlertUtils.closeLoading();
      await SweetAlertUtils.error(
        "Gagal Menghapus",
        "Terjadi kesalahan saat menghapus data. Silakan coba lagi."
      );
    }
  };

  // Handle upload and download
  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleDownloadClick = async () => {
    try {
      // Check if there are active filters, sorting, or search
      const hasActiveFilters =
        filterValue ||
        surveiFilter !== "all" ||
        pclFilter !== "all" ||
        selesaiFilter !== "all" ||
        tahunFilter !== "all" ||
        sortDescriptors.length > 0;

      // Show confirmation with SweetAlert
      const result = await SweetAlertUtils.confirm(
        "Download Data Excel",
        `Apakah Anda yakin ingin mengunduh data riwayat survei? ${
          hasActiveFilters
            ? "Data akan diunduh sesuai dengan filter, sorting, dan pencarian yang sedang aktif."
            : "Semua data akan diunduh."
        }`,
        "Ya, Download",
        "Batal"
      );

      if (!result) return;

      // Show loading
      SweetAlertUtils.loading("Memproses Download", "Mohon tunggu sebentar...");

      // Build download URL with current filters and sorting
      const searchParams = new URLSearchParams();
      searchParams.append("format", "excel");

      if (filterValue) searchParams.append("search", filterValue);
      if (surveiFilter !== "all") searchParams.append("survei", surveiFilter);
      if (pclFilter !== "all") searchParams.append("pcl", pclFilter);
      if (selesaiFilter !== "all")
        searchParams.append("selesai", selesaiFilter);
      if (tahunFilter !== "all") searchParams.append("tahun", tahunFilter);

      sortDescriptors.forEach((sort, index) => {
        searchParams.append(`sort[${index}][column]`, sort.column);
        searchParams.append(
          `sort[${index}][direction]`,
          sort.direction || "ascending"
        );
      });

      const downloadUrl = `/api/riwayat-survei/export?${searchParams.toString()}`;

      // Fetch file
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        SweetAlertUtils.closeLoading();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get blob data
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get filename from response header
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "riwayat_survei.xlsx";

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

      SweetAlertUtils.closeLoading();

      // Calculate download info
      let downloadInfo = "Data riwayat survei berhasil diunduh!";
      if (hasActiveFilters) {
        downloadInfo +=
          " Data yang diunduh telah difilter sesuai pengaturan Anda.";
      }

      await SweetAlertUtils.success("Download Berhasil!", downloadInfo, {
        timer: 4000,
      });
    } catch (error) {
      console.error("Error downloading data:", error);
      SweetAlertUtils.closeLoading();
      await SweetAlertUtils.error(
        "Download Gagal",
        `Terjadi kesalahan saat mengunduh data: ${(error as Error).message}. Silakan coba lagi.`
      );
    }
  };

  // Modal success handlers
  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchData(); // Refresh data
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedRiwayat(null);
    fetchData(); // Refresh data
  };

  // Render cell content
  const renderCell = useCallback(
    (riwayat: RiwayatSurvei, columnKey: keyof RiwayatSurvei | "actions") => {
      const cellValue = riwayat[columnKey as keyof RiwayatSurvei];

      switch (columnKey) {
        case "no":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "nama_survei":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "kip":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "nama_perusahaan":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "nama_pcl":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "tahun":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "selesai":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Edit" color="warning">
                <span
                  onClick={() => handleEditRiwayat(riwayat)}
                  className="text-lg text-gray-400 cursor-pointer active:opacity-50 hover:text-amber-500"
                >
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Hapus">
                <span
                  onClick={() => handleDelete(riwayat)}
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
    const [uploadMode, setUploadMode] = useState<"append" | "replace">(
      "append"
    );
    const [isUploading, setIsUploading] = useState(false);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];

        // Validate file type
        const allowedTypes = [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
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

    // Handle template download
    const handleDownloadTemplate = async () => {
      try {
        SweetAlertUtils.loading(
          "Mengunduh Template",
          "Mohon tunggu sebentar..."
        );

        const response = await fetch("/api/riwayat-survei/template");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const currentDate = new Date().toISOString().split("T")[0];
        link.download = `template_riwayat_survei_${currentDate}.xlsx`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        SweetAlertUtils.closeLoading();
        SweetAlertUtils.success(
          "Template Berhasil Diunduh",
          "Silakan isi template sesuai format yang disediakan"
        );
      } catch (error) {
        SweetAlertUtils.closeLoading();
        console.error("Error downloading template:", error);
        SweetAlertUtils.error(
          "Gagal Mengunduh Template",
          "Terjadi kesalahan saat mengunduh template"
        );
      }
    };

    // Validation functions for riwayat survei data
    const validateRiwayatData = (data: any): string[] => {
      const errors: string[] = [];

      // Validate KIP
      if (!data.kip) {
        errors.push("KIP wajib diisi");
      } else {
        const kip = data.kip.toString().trim();
        if (kip.length > 16) {
          errors.push("KIP maksimal 16 digit");
        }
        if (!/^\d+$/.test(kip)) {
          errors.push("KIP harus berupa angka");
        }
      }

      // Validate nama_perusahaan
      if (!data.nama_perusahaan) {
        errors.push("Nama Perusahaan wajib diisi");
      }

      // Validate nama_survei
      if (!data.nama_survei) {
        errors.push("Nama Survei wajib diisi");
      }

      // Validate tahun
      if (!data.tahun) {
        errors.push("Tahun wajib diisi");
      } else {
        const tahun = parseInt(data.tahun);
        if (isNaN(tahun) || tahun < 1900 || tahun > 2100) {
          errors.push("Tahun harus antara 1900-2100");
        }
      }

      // Validate nama_pcl
      if (!data.nama_pcl) {
        errors.push("Nama PCL wajib diisi");
      }

      // Validate selesai
      if (!data.selesai) {
        errors.push("Status Selesai wajib diisi");
      } else if (data.selesai !== "Iya" && data.selesai !== "Tidak") {
        errors.push('Status Selesai harus "Iya" atau "Tidak"');
      }

      return errors;
    };

    const sanitizeRiwayatData = (data: any) => {
      return {
        kip: data.kip ? data.kip.toString().trim() : "",
        nama_perusahaan: data.nama_perusahaan
          ? data.nama_perusahaan.toString().trim()
          : "",
        nama_survei: data.nama_survei ? data.nama_survei.toString().trim() : "",
        tahun: parseInt(data.tahun) || 0,
        nama_pcl: data.nama_pcl ? data.nama_pcl.toString().trim() : "",
        selesai: data.selesai ? data.selesai.toString().trim() : "",
        ket_survei: data.ket_survei ? data.ket_survei.toString().trim() : "",
      };
    };

    // Handle form submission
    const handleSubmit = async () => {
      if (!file) {
        SweetAlertUtils.warning(
          "File Belum Dipilih",
          "Silakan pilih file terlebih dahulu"
        );
        return;
      }

      // Confirmation
      const confirmMessage =
        uploadMode === "replace"
          ? "Mengganti semua data yang ada dengan data dari file Excel"
          : "Menambahkan data baru dari file Excel";

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
          "Membaca dan memvalidasi data..."
        );

        // Read and validate Excel file
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          throw new Error(
            "File Excel harus memiliki minimal 1 baris data (selain header)"
          );
        }

        // Get headers and data
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];

        // Validate headers
        const requiredHeaders = [
          "kip",
          "nama_perusahaan",
          "nama_survei",
          "tahun",
          "nama_pcl",
          "selesai",
        ];
        const optionalHeaders = ["ket_survei"];
        const allowedHeaders = [...requiredHeaders, ...optionalHeaders];

        const missingHeaders = requiredHeaders.filter(
          (header) => !headers.includes(header)
        );

        if (missingHeaders.length > 0) {
          throw new Error(
            `Header yang diperlukan tidak ditemukan: ${missingHeaders.join(", ")}`
          );
        }

        // Process data
        const processedData: any[] = [];
        const validationErrors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];

          // Skip empty rows
          if (!row || row.every((cell) => !cell && cell !== 0)) {
            continue;
          }

          const rowData: any = {};
          headers.forEach((header, index) => {
            if (allowedHeaders.includes(header)) {
              rowData[header] = row[index];
            }
          });

          // Sanitize data
          const sanitizedData = sanitizeRiwayatData(rowData);

          // Validate data
          const errors = validateRiwayatData(sanitizedData);
          if (errors.length > 0) {
            validationErrors.push(`Baris ${i + 2}: ${errors.join(", ")}`);
          } else {
            processedData.push(sanitizedData);
          }
        }

        if (validationErrors.length > 0) {
          SweetAlertUtils.closeLoading();
          await SweetAlertUtils.error(
            "Validasi Gagal",
            `Ditemukan ${validationErrors.length} error:\n\n${validationErrors
              .slice(0, 5)
              .join("\n")}${
              validationErrors.length > 5 ? "\n\n...dan lainnya" : ""
            }`
          );
          return;
        }

        if (processedData.length === 0) {
          throw new Error("Tidak ada data valid yang ditemukan dalam file");
        }

        // Update loading message
        SweetAlertUtils.loading(
          "Mengunggah Data",
          `Memproses ${processedData.length} data riwayat survei...`
        );

        // Prepare FormData for upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mode", uploadMode);
        formData.append("data", JSON.stringify(processedData));

        // Send to API
        const response = await fetch("/api/riwayat-survei/import", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        SweetAlertUtils.closeLoading();

        if (result.success) {
          let message =
            uploadMode === "replace"
              ? `Berhasil mengganti semua data dengan ${result.total || processedData.length} data baru`
              : `Berhasil memproses ${result.total || processedData.length} data`;

          // Show warnings if any duplicates were found
          if (result.hasWarnings && result.warnings) {
            message += `\n\nPeringatan duplikasi:\n${result.warnings.slice(0, 5).join("\n")}`;
            if (result.warnings.length > 5) {
              message += `\n...dan ${result.warnings.length - 5} duplikasi lainnya`;
            }
          }

          await SweetAlertUtils.success("Upload Berhasil!", message);

          // Reset modal state and refresh data
          setFile(null);
          setUploadMode("append");
          setShowUploadModal(false);
          fetchData();
        } else {
          if (result.errors && result.errors.length > 0) {
            let errorMessage = `Ditemukan ${result.totalErrors || result.errors.length} error verifikasi data relasi:\n\n`;
            result.errors
              .slice(0, 10)
              .forEach((error: string, index: number) => {
                errorMessage += `${index + 1}. ${error}\n`;
              });

            if ((result.totalErrors || result.errors.length) > 10) {
              errorMessage += `\n...dan ${(result.totalErrors || result.errors.length) - 10} error lainnya`;
            }

            errorMessage += "\n\nSilakan perbaiki data dan coba lagi.";

            await SweetAlertUtils.error("Verifikasi Data Gagal", errorMessage);
            return;
          }

          throw new Error(result.message || "Gagal mengupload data");
        }
      } catch (error) {
        console.error("Error uploading data:", error);
        SweetAlertUtils.closeLoading();

        await SweetAlertUtils.error(
          "Upload Gagal",
          `Terjadi kesalahan: ${(error as Error).message}`
        );
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-medium mb-4 text-center">
            Upload Data Riwayat Survei
          </h2>

          <div className="space-y-4">
            {/* Template Download Button */}
            <button
              onClick={handleDownloadTemplate}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50 transition-colors"
              disabled={isUploading}
            >
              Unduh Template
            </button>

            {/* File Input */}
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
                  File terpilih: {file.name} ({(file.size / 1024).toFixed(1)}{" "}
                  KB)
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
                  <label
                    htmlFor="append"
                    className="ml-2 text-sm text-gray-700"
                  >
                    <span className="font-medium">Tambah Data</span> —
                    Menambahkan data baru, memperbarui data yang sudah ada
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
                    className="h-4 w-4 text-blue-600 mt-0.5"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="replace"
                    className="ml-2 text-sm text-gray-700"
                  >
                    <span className="font-medium text-red-600">
                      Ganti Semua Data
                    </span>{" "}
                    — Menghapus semua data lama dan mengganti dengan data baru
                  </label>
                </div>
              </div>
            </div>

            {/* Information Section */}
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-800 text-sm mb-2">
                Informasi Penting :
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>
                  • <strong>KIP:</strong> Wajib diisi, maksimal 16 digit
                </li>
                <li>
                  • <strong>Nama Perusahaan:</strong> Wajib diisi, tidak boleh
                  kosong
                </li>
                <li>
                  • <strong>Nama Survei:</strong> Wajib diisi, harus sesuai
                  database
                </li>
                <li>
                  • <strong>Tahun:</strong> Wajib diisi, format YYYY
                </li>
                <li>
                  • <strong>PCL:</strong> Wajib diisi, harus terdaftar
                </li>
                <li>
                  • <strong>Status Selesai:</strong> Harus "Iya" atau "Tidak"
                </li>
                <li>
                  • <strong>Keterangan:</strong> Opsional, maksimal 500 karakter
                </li>
              </ul>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setFile(null);
                setUploadMode("append");
              }}
              disabled={isUploading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={!file || isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              {isUploading ? "Memproses..." : "Upload"}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-hidden">
            <h2 className="text-xl font-medium mb-4">
              Tambah Riwayat Survei Baru
            </h2>
            <RiwayatSurveiForm
              mode="add"
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {showEditModal && selectedRiwayat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-hidden">
            <h2 className="text-xl font-medium mb-4">Edit Riwayat Survei</h2>
            <RiwayatSurveiForm
              id={selectedRiwayat.id_riwayat}
              mode="edit"
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedRiwayat(null);
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
              placeholder="Cari nama survei, KIP, nama perusahaan, PCL..."
              value={filterValue}
              onChange={onSearchChange}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Survei Dropdown */}
            <div className="relative" ref={surveiDropdownRef}>
              <button
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  surveiFilter !== "all"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100"
                }`}
                onClick={() => setSurveiDropdownOpen(!surveiDropdownOpen)}
              >
                Survei
                {surveiFilter !== "all" && (
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                )}
                <ChevronDownIcon size={16} />
              </button>

              {surveiDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-56">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    <button
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                        surveiFilter === "all" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        onSurveiFilterChange("all");
                        setSurveiDropdownOpen(false);
                      }}
                    >
                      Semua Survei
                    </button>
                    {surveiOptions.map((option) => (
                      <button
                        key={option.uid}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                          surveiFilter === option.uid ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          onSurveiFilterChange(option.uid);
                          setSurveiDropdownOpen(false);
                        }}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PCL Dropdown */}
            <div className="relative" ref={pclDropdownRef}>
              <button
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  pclFilter !== "all"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100"
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
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-56">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    <button
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                        pclFilter === "all" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        onPclFilterChange("all");
                        setPclDropdownOpen(false);
                      }}
                    >
                      Semua PCL
                    </button>
                    {pclOptions.map((option) => (
                      <button
                        key={option.uid}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                          pclFilter === option.uid ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          onPclFilterChange(option.uid);
                          setPclDropdownOpen(false);
                        }}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Selesai Dropdown */}
            <div className="relative" ref={selesaiDropdownRef}>
              <button
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  selesaiFilter !== "all"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100"
                }`}
                onClick={() => setSelesaiDropdownOpen(!selesaiDropdownOpen)}
              >
                Selesai
                {selesaiFilter !== "all" && (
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                )}
                <ChevronDownIcon size={16} />
              </button>

              {selesaiDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-40">
                  <div className="py-1">
                    <button
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                        selesaiFilter === "all" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        onSelesaiFilterChange("all");
                        setSelesaiDropdownOpen(false);
                      }}
                    >
                      Semua
                    </button>
                    {selesaiOptions.map((option) => (
                      <button
                        key={option.uid}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                          selesaiFilter === option.uid ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          onSelesaiFilterChange(option.uid);
                          setSelesaiDropdownOpen(false);
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
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  tahunFilter !== "all"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100"
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
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                        tahunFilter === "all" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        onTahunFilterChange("all");
                        setTahunDropdownOpen(false);
                      }}
                    >
                      Semua Tahun
                    </button>
                    {tahunOptions.map((option) => (
                      <button
                        key={option.uid}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
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
            <Tooltip content="Tambah Riwayat" position="bottom">
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
                  key={item.id_riwayat}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td
                      key={`${item.id_riwayat}-${column.uid}`}
                      className="p-4"
                    >
                      {renderCell(
                        item,
                        column.uid as keyof RiwayatSurvei | "actions"
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

      {/* Pagination - EXACTLY like tabel_pcl.tsx */}
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

export default TabelRiwayatSurvei;
