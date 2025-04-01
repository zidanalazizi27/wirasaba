"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import type { SVGProps } from "react";

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
  { name: "Nama Usaha", uid: "namaUsaha", sortable: true },
  { name: "Alamat", uid: "alamat", sortable: true },
  { name: "Jarak (Km)", uid: "jarak", sortable: true },
  { name: "PCL", uid: "pcl", sortable: true },
  { name: "Status", uid: "status", sortable: false },
  { name: "Aksi", uid: "actions", sortable: false },
];

// Status options
export const statusOptions = [
  { name: "Aktif", uid: "aktif" },
  { name: "Tidak Aktif", uid: "tidakAktif" },
  { name: "Tutup", uid: "tutup" },
];

// PCL options
export const pclOptions = [
  { name: "Andri Wijaya", uid: "andri" },
  { name: "Budi Santoso", uid: "budi" },
  { name: "Citra Dewi", uid: "citra" },
  { name: "Dimas Pratama", uid: "dimas" },
];

// Dummy data for the table
export const businesses = [
  {
    id: 1,
    no: 1,
    kip: 3511111111,
    namaUsaha: "Toko Sejahtera",
    alamat: "Jl. Merdeka No. 123, Jakarta Pusat",
    jarak: "2.5 km",
    pcl: "Andri Wijaya",
    aktivitas: "Perdagangan",
    status: "aktif",
  },
  {
    id: 2,
    no: 2,
    kip: 3511111112,
    namaUsaha: "Warung Barokah",
    alamat: "Jl. Pahlawan No. 45, Jakarta Selatan",
    jarak: "1.2 km",
    pcl: "Budi Santoso",
    aktivitas: "Kuliner",
    status: "aktif",
  },
  {
    id: 3,
    no: 3,
    kip: 3511111113,
    namaUsaha: "CV Makmur Jaya",
    alamat: "Jl. Gatot Subroto Km. 3, Jakarta Timur",
    jarak: "5.7 km",
    pcl: "Citra Dewi",
    aktivitas: "Jasa",
    status: "tidakAktif",
  },
  {
    id: 4,
    no: 4,
    kip: 3511111114,
    namaUsaha: "PT Sentosa Abadi",
    alamat: "Jl. Sudirman No. 78, Jakarta Pusat",
    jarak: "3.8 km",
    pcl: "Dimas Pratama",
    aktivitas: "Manufaktur",
    status: "aktif",
  },
  {
    id: 5,
    no: 5,
    kip: "3511111115",
    namaUsaha: "Rumah Makan Padang",
    alamat: "Jl. Kemang Raya No. 15, Jakarta Selatan",
    jarak: "0.9 km",
    pcl: "Andri Wijaya",
    aktivitas: "Kuliner",
    status: "aktif",
  },
  {
    id: 6,
    no: 6,
    kip: 3511111116,
    namaUsaha: "Bengkel Motor Cepat",
    alamat: "Jl. Raya Bogor Km. 25, Jakarta Timur",
    jarak: "8.3 km",
    pcl: "Budi Santoso",
    aktivitas: "Jasa",
    status: "aktif",
  },
  {
    id: 7,
    no: 7,
    kip: 3511111117,
    namaUsaha: "Salon Cantik",
    alamat: "Jl. Kebon Jeruk No. 12, Jakarta Barat",
    jarak: "4.1 km",
    pcl: "Citra Dewi",
    aktivitas: "Jasa",
    status: "tutup",
  },
  {
    id: 8,
    no: 8,
    kip: 3511111118,
    namaUsaha: "Toko Bangunan Jaya",
    alamat: "Jl. Raya Cilandak No. 45, Jakarta Selatan",
    jarak: "6.7 km",
    pcl: "Dimas Pratama",
    aktivitas: "Perdagangan",
    status: "aktif",
  },
  {
    id: 9,
    no: 9,
    kip: 3511111119,
    namaUsaha: "Apotek Sehat",
    alamat: "Jl. Tebet Barat No. 30, Jakarta Selatan",
    jarak: "2.3 km",
    pcl: "Andri Wijaya",
    aktivitas: "Kesehatan",
    status: "aktif",
  },
  {
    id: 10,
    no: 10,
    kip: 3511111120,
    namaUsaha: "Kedai Kopi Aroma",
    alamat: "Jl. Cikini Raya No. 5, Jakarta Pusat",
    jarak: "1.5 km",
    pcl: "Budi Santoso",
    aktivitas: "Kuliner",
    status: "aktif",
  },
  {
    id: 11,
    no: 11,
    kip: 3511111121,
    namaUsaha: "Percetakan Cepat",
    alamat: "Jl. Panglima Polim No. 22, Jakarta Selatan",
    jarak: "3.2 km",
    pcl: "Citra Dewi",
    aktivitas: "Jasa",
    status: "tidakAktif",
  },
  {
    id: 12,
    no: 12,
    kip: 3511111122,
    namaUsaha: "Toko Elektronik Mega",
    alamat: "Jl. Gajah Mada No. 100, Jakarta Barat",
    jarak: "5.9 km",
    pcl: "Dimas Pratama",
    aktivitas: "Perdagangan",
    status: "aktif",
  },
  {
    id: 13,
    no: 13,
    kip: 3511111123,
    namaUsaha: "Butik Fashion",
    alamat: "Jl. Senopati No. 60, Jakarta Selatan",
    jarak: "2.8 km",
    pcl: "Andri Wijaya",
    aktivitas: "Perdagangan",
    status: "aktif",
  },
  {
    id: 14,
    no: 14,
    kip: 3511111124,
    namaUsaha: "Restoran Selera",
    alamat: "Jl. Hayam Wuruk No. 35, Jakarta Pusat",
    jarak: "4.5 km",
    pcl: "Budi Santoso",
    aktivitas: "Kuliner",
    status: "tutup",
  },
  {
    id: 15,
    no: 15,
    kip: 3511111125,
    namaUsaha: "Laundry Bersih",
    alamat: "Jl. Kelapa Gading No. 8, Jakarta Utara",
    jarak: "7.1 km",
    pcl: "Citra Dewi",
    aktivitas: "Jasa",
    status: "aktif",
  },
];

const statusColorMap: Record<string, string> = {
  aktif: "bg-green-100 text-green-800",
  tidakAktif: "bg-pink-100 text-pink-800",
  tutup: "bg-amber-100 text-amber-800",
};

type Business = (typeof businesses)[0];
type SortDirection = "ascending" | "descending" | null;

interface SortDescriptor {
  column: string;
  direction: SortDirection;
}

const TabelDirektori = () => {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set([]));
  const [statusFilter, setStatusFilter] = useState("all");
  const [pclFilter, setPclFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDescriptors, setSortDescriptors] = useState<SortDescriptor[]>([]);

  // State for dropdown visibility
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [pclDropdownOpen, setPclDropdownOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Refs for detecting outside clicks
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const pclDropdownRef = useRef<HTMLDivElement>(null);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2024");
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredBusinesses = [...businesses];

    // Text search filter
    if (hasSearchFilter) {
      const lowerFilter = filterValue.toLowerCase();
      filteredBusinesses = filteredBusinesses.filter(
        (business) =>
          String(business.kip).toLowerCase().includes(lowerFilter) ||
          business.namaUsaha.toLowerCase().includes(lowerFilter) ||
          business.alamat.toLowerCase().includes(lowerFilter) ||
          business.pcl.toLowerCase().includes(lowerFilter)
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
      const selectedPcl =
        pclOptions.find((pcl) => pcl.uid === pclFilter)?.name || "";
      filteredBusinesses = filteredBusinesses.filter(
        (business) => business.pcl === selectedPcl
      );
    }

    return filteredBusinesses;
  }, [filterValue, statusFilter, pclFilter]);

  // Apply sorting to the filtered items
  const sortedItems = useMemo(() => {
    if (sortDescriptors.length === 0) return [...filteredItems];

    return [...filteredItems].sort((a, b) => {
      for (const sort of sortDescriptors) {
        const { column, direction } = sort;

        if (direction === null) continue;

        const columnKey = column as keyof Business;
        const valueA = a[columnKey] as string;
        const valueB = b[columnKey] as string;

        // Numeric comparison for jarak (remove 'km' and parse as number)
        if (column === "jarak") {
          const numA = parseFloat(valueA.replace(" km", ""));
          const numB = parseFloat(valueB.replace(" km", ""));

          if (numA !== numB) {
            return direction === "ascending" ? numA - numB : numB - numA;
          }
        }
        // String comparison for other columns
        else {
          const compareResult = valueA.localeCompare(valueB);

          if (compareResult !== 0) {
            return direction === "ascending" ? compareResult : -compareResult;
          }
        }
      }

      return 0; // If all sort comparisons are equal
    });
  }, [filteredItems, sortDescriptors]);

  const pages = Math.ceil(sortedItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return sortedItems.slice(start, end);
  }, [currentPage, sortedItems, rowsPerPage]);

  // Function to handle multiple column sorting
  const handleSort = (columnKey: string) => {
    setSortDescriptors((prevSorts) => {
      // Find if this column is already being sorted
      const existingIndex = prevSorts.findIndex((s) => s.column === columnKey);

      if (existingIndex >= 0) {
        // Column is already being sorted - update its direction or remove it
        const existingSort = prevSorts[existingIndex];
        const newSorts = [...prevSorts];

        // Toggle direction: null -> ascending -> descending -> null
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
          // Remove this sort entirely (third click)
          newSorts.splice(existingIndex, 1);
        }

        return newSorts;
      } else {
        // Add new sort for this column
        return [...prevSorts, { column: columnKey, direction: "ascending" }];
      }
    });
  };

  // Function to get the current sort state for a column
  const getSortDirection = (columnKey: string): SortDirection => {
    const sort = sortDescriptors.find((s) => s.column === columnKey);
    return sort ? sort.direction : null;
  };

  // Function to get the sort order index for a column (used to display the sort order)
  const getSortIndex = (columnKey: string): number => {
    return sortDescriptors.findIndex((s) => s.column === columnKey) + 1;
  };

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

  const onNextPage = useCallback(() => {
    if (currentPage < pages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, pages]);

  const onPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const onSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFilterValue(value);
      setCurrentPage(1); // Reset to first page when searching
    },
    []
  );

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setCurrentPage(1);
    },
    []
  );

  const onStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  const onPclFilterChange = useCallback((pcl: string) => {
    setPclFilter(pcl);
    setCurrentPage(1);
  }, []);

  // Action handlers
  const handleViewBusiness = (business: Business) => {
    alert(`Melihat detail usaha: ${business.namaUsaha}`);
  };

  const handleEditBusiness = (business: Business) => {
    alert(`Mengedit usaha: ${business.namaUsaha}`);
  };

  const handleDeleteBusiness = (business: Business) => {
    if (confirm(`Yakin ingin menghapus ${business.namaUsaha}?`)) {
      alert(`${business.namaUsaha} telah dihapus`);
      // In a real application, you would remove the business from your database
    }
  };

  const handleImportClick = () => {
    setShowUploadModal(true);
  };

  const handleExportClick = () => {
    alert("Mengunduh data direktori usaha");
    // In a real application, you would create and download a file
  };

  // Render cell dengan perubahan warna pada tombol aksi hanya saat hover
  const renderCell = useCallback(
    (business: Business, columnKey: keyof Business | "actions") => {
      const cellValue = business[columnKey as keyof Business];

      switch (columnKey) {
        case "no":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "kip":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "namaUsaha":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "alamat":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "jarak":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "pcl":
          return <span className="text-sm font-normal">{cellValue}</span>;
        case "status":
          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                statusColorMap[business.status]
              }`}
            >
              {business.status === "aktif"
                ? "Aktif"
                : business.status === "tidakAktif"
                  ? "Tidak Aktif"
                  : "Tutup"}
            </span>
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

  // Modifikasi komponen UploadModal
  const UploadModal = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadMode, setUploadMode] = useState("append"); // append atau replace

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

      // In a real app, you would process the file here
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
          <h2 className="text-xl font-medium mb-4">Upload Data</h2>

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
                {uploadMode === "append" && (
                  <li>
                    Data yang sudah ada akan diperbarui jika terdapat ID yang
                    sama
                  </li>
                )}
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
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
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
      {/* Upload Modal */}
      {showUploadModal && <UploadModal />}

      {/* Top section with search and filters */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full md:w-72 bg-gray-100 rounded-lg text-sm focus:outline-none"
              placeholder="Cari KIP, nama usaha, alamat, PCL..."
              value={filterValue}
              onChange={onSearchChange}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Status Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm flex items-center gap-2"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              >
                Status
                <ChevronDownIcon size={16} />
              </button>

              {statusDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-36">
                  <div className="py-1">
                    <button
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
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
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          statusFilter === status.uid ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          onStatusFilterChange(status.uid);
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {status.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PCL Dropdown */}
            <div className="relative" ref={pclDropdownRef}>
              <button
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm flex items-center gap-2"
                onClick={() => setPclDropdownOpen(!pclDropdownOpen)}
              >
                PCL
                <ChevronDownIcon size={16} />
              </button>

              {pclDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-44">
                  <div className="py-1">
                    <button
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
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
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          pclFilter === pcl.uid ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          onPclFilterChange(pcl.uid);
                          setPclDropdownOpen(false);
                        }}
                      >
                        {pcl.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tahun Dropdown */}
            <div className="relative" ref={yearDropdownRef}>
              <button
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm flex items-center gap-2"
                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
              >
                Tahun: {selectedYear}
                <ChevronDownIcon size={16} />
              </button>

              {yearDropdownOpen && (
                <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-36">
                  <div className="py-1">
                    {["2023", "2024"].map((year) => (
                      <button
                        key={year}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          selectedYear === year ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          setSelectedYear(year);
                          setYearDropdownOpen(false);
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
                onClick={() => alert("Tambah data baru")}
              >
                <PlusIcon size={20} />
              </button>
            </Tooltip>

            {/* Import/Export Icons with Tooltips - Ubah posisi tooltip menjadi bottom */}
            <Tooltip content="Upload Data" position="bottom">
              <button
                className="p-2 bg-gray-100 text-green-600 rounded-lg flex items-center justify-center"
                onClick={handleImportClick}
              >
                <UploadIcon size={20} />
              </button>
            </Tooltip>

            <Tooltip content="Download Data" position="bottom">
              <button
                className="p-2 bg-gray-100 text-blue-600 rounded-lg flex items-center justify-center"
                onClick={handleExportClick}
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
                        {(() => {
                          const direction = getSortDirection(column.uid);
                          const index = getSortIndex(column.uid);
                          const showIndex =
                            index > 0 && sortDescriptors.length > 1;

                          return (
                            <div className="relative">
                              {direction === "ascending" && (
                                <SortAscIcon className="text-blue-500" />
                              )}
                              {direction === "descending" && (
                                <SortDescIcon className="text-blue-500" />
                              )}
                              {direction === null && (
                                <SortIcon className="text-gray-400" />
                              )}

                              {showIndex && (
                                <span className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                                  {index}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td key={`${item.id}-${column.uid}`} className="p-2">
                      {renderCell(
                        item,
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
          Total {sortedItems.length} data
        </span>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          <div className="flex">
            {Array.from({ length: Math.min(4, pages) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            {pages > 4 && (
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-sm text-gray-600 hover:bg-gray-100">
                <ChevronRightIcon size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            <button
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={onNextPage}
              disabled={currentPage === pages}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabelDirektori;
