// src/app/api/perusahaan/export/route.ts - FIXED SURVEY CALCULATION
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Import XLSX dengan cara yang kompatibel
import * as XLSX from 'xlsx';

export const dynamic = "force-dynamic";

// Interface untuk data perusahaan dari database
interface PerusahaanRowData {
  id_perusahaan: number;
  kip: string;
  nama_perusahaan: string;
  badan_usaha: string;
  alamat: string;
  kec: string;
  nama_kec: string;
  des: string;
  nama_des: string;
  kode_pos: string;
  skala: string;
  lok_perusahaan: string;
  nama_kawasan: string;
  lat: number;
  lon: number;
  jarak: string;
  produk: string;
  KBLI: string;
  telp_perusahaan: string;
  email_perusahaan: string;
  web_perusahaan: string;
  tkerja: string;
  investasi: string;
  omset: string;
  nama_narasumber: string;
  jbtn_narasumber: string;
  email_narasumber: string;
  telp_narasumber: string;
  pcl_utama: string;
  catatan: string;
  tahun_direktori: string;
  total_survei: number;
  completed_survei: number;
}

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wirasaba',
};

// Utility function to create database connection
async function createDbConnection() {
  return await mysql.createConnection(dbConfig);
}

// ✅ FIXED: Fungsi untuk menghitung status survei (sama dengan tabel direktori)
function calculateSurveyStatus(completedSurvei: number, totalSurvei: number) {
  // ✅ PERBAIKAN: Jika tidak ada survei sama sekali = KOSONG
  if (totalSurvei === 0) {
    return {
      status: "kosong",
      status_text: "Kosong",
      completion_percentage: 0
    };
  }

  const percentage = Math.round((completedSurvei / totalSurvei) * 100);
  
  let status: string;
  let status_text: string;
  
  if (percentage >= 80) {
    status = "tinggi";
    status_text = "Tinggi";
  } else if (percentage >= 50) {
    status = "sedang";
    status_text = "Sedang";
  } else {
    // ✅ PERBAIKAN: Jika ada survei tapi belum selesai = RENDAH
    // Tidak peduli percentage 0% atau > 0%, selama totalSurvei > 0 = RENDAH
    status = "rendah";
    status_text = "Rendah";
  }

  return {
    status,
    status_text,
    completion_percentage: percentage
  };
}

export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    console.log('🔄 Starting export process...');
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const pcl = searchParams.get('pcl');

    // Parse sorting parameters
    const sortParams: Array<{column: string, direction: string}> = [];
    let sortIndex = 0;
    while (searchParams.get(`sort[${sortIndex}][column]`)) {
      const column = searchParams.get(`sort[${sortIndex}][column]`);
      const direction = searchParams.get(`sort[${sortIndex}][direction]`) || 'ascending';
      if (column) {
        sortParams.push({ column, direction });
      }
      sortIndex++;
    }

    console.log('Export parameters:', { year, search, status, pcl, sortParams });

    // Create database connection
    connection = await createDbConnection();

    // ✅ FIXED: Query dengan JOIN dan kalkulasi survei berdasarkan KIP (sama dengan tabel direktori)
    const baseQuery = `
      SELECT 
        p.id_perusahaan, 
        p.kip, 
        p.nama_perusahaan, 
        p.badan_usaha, 
        p.alamat, 
        p.kec, k.nama_kec,
        p.des, d.nama_des,
        p.kode_pos, 
        p.skala,
        p.lok_perusahaan, 
        p.nama_kawasan, 
        p.lat, 
        p.lon, 
        p.jarak,
        p.produk, 
        p.KBLI, 
        p.telp_perusahaan, 
        p.email_perusahaan, 
        p.web_perusahaan,
        p.tkerja, 
        p.investasi, 
        p.omset,
        p.nama_narasumber, 
        p.jbtn_narasumber, 
        p.email_narasumber, 
        p.telp_narasumber, 
        p.pcl_utama, 
        p.catatan,
        GROUP_CONCAT(DISTINCT dir.thn_direktori ORDER BY dir.thn_direktori ASC) as tahun_direktori,
        -- ✅ FIXED: Total survei berdasarkan KIP (sama dengan tabel direktori)
        (SELECT COUNT(*) 
         FROM riwayat_survei rs 
         JOIN perusahaan p2 ON rs.id_perusahaan = p2.id_perusahaan 
         WHERE p2.kip = p.kip) AS total_survei,
        -- ✅ FIXED: Survei selesai berdasarkan KIP (sama dengan tabel direktori)
        (SELECT COUNT(*) 
         FROM riwayat_survei rs 
         JOIN perusahaan p2 ON rs.id_perusahaan = p2.id_perusahaan 
         WHERE p2.kip = p.kip AND rs.selesai = 'Iya') AS completed_survei
      FROM perusahaan p
      LEFT JOIN kecamatan k ON p.kec = k.kode_kec
      LEFT JOIN desa d ON p.des = d.kode_des
      LEFT JOIN direktori dir ON p.id_perusahaan = dir.id_perusahaan
    `;

    const whereConditions: string[] = [];
    const queryParams: (string | number)[] = [];

    // Filter berdasarkan tahun
    if (year && year !== "all") {
      whereConditions.push("dir.thn_direktori = ?");
      queryParams.push(year);
    }

    // Filter berdasarkan pencarian
    if (search) {
      whereConditions.push(`(
        p.kip LIKE ? OR 
        p.nama_perusahaan LIKE ? OR 
        p.alamat LIKE ? OR 
        p.pcl_utama LIKE ?
      )`);
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Filter berdasarkan PCL
    if (pcl && pcl !== "all") {
      whereConditions.push("p.pcl_utama = ?");
      queryParams.push(pcl);
    }

    // Tambahkan WHERE clause jika ada kondisi
    let finalQuery = baseQuery;
    if (whereConditions.length > 0) {
      finalQuery += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // Tambahkan GROUP BY
    finalQuery += ` GROUP BY p.id_perusahaan`;

    // Tambahkan sorting jika ada
    if (sortParams.length > 0) {
      const orderClauses = sortParams
        .filter(sort => sort.column && sort.direction)
        .map(sort => {
          const direction = sort.direction === "ascending" ? "ASC" : "DESC";
          const columnMap: { [key: string]: string } = {
            kip: "p.kip",
            nama_perusahaan: "p.nama_perusahaan", 
            alamat: "p.alamat",
            jarak: "CAST(REPLACE(REPLACE(p.jarak, ' km', ''), ',', '.') AS DECIMAL(10,2))",
            pcl_utama: "p.pcl_utama",
            kecamatan: "k.nama_kec",
            desa: "d.nama_des"
          };
          
          const sqlColumn = columnMap[sort.column] || sort.column;
          return `${sqlColumn} ${direction}`;
        });

      if (orderClauses.length > 0) {
        finalQuery += ` ORDER BY ${orderClauses.join(", ")}`;
      }
    }

    console.log("Executing query:", finalQuery);
    console.log("Query params:", queryParams);

    // Execute query
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(finalQuery, queryParams);
    const businessData = rows as PerusahaanRowData[];

    console.log(`Found ${businessData.length} businesses for export`);

    // ✅ FIXED: Data survei sudah dihitung berdasarkan KIP di query, tidak perlu enrichment lagi
    const enrichedData = businessData.map(row => ({
      ...row,
      total_survei: row.total_survei || 0,
      completed_survei: row.completed_survei || 0
    }));

    console.log("Data processed successfully");

    // Filter berdasarkan status jika diperlukan
    let filteredData = enrichedData;
    if (status && status !== "all") {
      filteredData = enrichedData.filter(row => {
        const surveyStatusData = calculateSurveyStatus(row.completed_survei, row.total_survei);
        return surveyStatusData.status === status;
      });
    }

    console.log("Filtered data count:", filteredData.length);

    // Debug: Log beberapa sample data untuk verifikasi
    if (filteredData.length > 0) {
      console.log("Sample data for verification:");
      filteredData.slice(0, 3).forEach((row, index) => {
        const surveyStatusData = calculateSurveyStatus(row.completed_survei, row.total_survei);
        console.log(`Sample ${index + 1}: ${row.nama_perusahaan} (KIP: ${row.kip}) - Total: ${row.total_survei}, Completed: ${row.completed_survei}, Percentage: ${surveyStatusData.completion_percentage}%, Status: ${surveyStatusData.status_text}`);
      });
    }

    // ✅ FIXED: Format data export dengan kalkulasi survei yang benar
    const exportData = filteredData.map((row, index) => {
      const totalSurvei = row.total_survei || 0;
      const completedSurvei = row.completed_survei || 0;
      
      // Gunakan fungsi yang sama dengan tabel direktori
      const surveyStatusData = calculateSurveyStatus(completedSurvei, totalSurvei);

      return {
        "No": index + 1,
        "KIP": row.kip || "",
        "Nama Perusahaan": row.nama_perusahaan || "",
        "Badan Usaha": row.badan_usaha || "",
        "Alamat": row.alamat || "",
        "Kecamatan": row.nama_kec || "",          // ✅ Menggunakan nama kecamatan
        "Desa": row.nama_des || "",               // ✅ Menggunakan nama desa
        "Kode Pos": row.kode_pos || "",
        "Skala": row.skala || "",
        "Lokasi Perusahaan": row.lok_perusahaan || "",
        "Nama Kawasan": row.nama_kawasan || "",
        "Latitude": row.lat || "",
        "Longitude": row.lon || "",
        "Jarak (km)": row.jarak || "",
        "Produk": row.produk || "",
        "KBLI": row.KBLI || "",
        "Telepon Perusahaan": row.telp_perusahaan || "",
        "Email Perusahaan": row.email_perusahaan || "",
        "Website Perusahaan": row.web_perusahaan || "",
        "Tenaga Kerja": row.tkerja || "",
        "Investasi": row.investasi || "",
        "Omset": row.omset || "",
        "Nama Narasumber": row.nama_narasumber || "",
        "Jabatan Narasumber": row.jbtn_narasumber || "",
        "Email Narasumber": row.email_narasumber || "",
        "Telepon Narasumber": row.telp_narasumber || "",
        "PCL Utama": row.pcl_utama || "",
        "Catatan": row.catatan || "",
        "Tahun Direktori": row.tahun_direktori || "",
        "Total Survei": totalSurvei,                                          // ✅ FIXED: Berdasarkan KIP
        "Survei Selesai": completedSurvei,                                    // ✅ FIXED: Berdasarkan KIP  
        "Persentase Penyelesaian (%)": surveyStatusData.completion_percentage, // ✅ FIXED: Kalkulasi yang benar
        "Status": surveyStatusData.status_text                                // ✅ FIXED: Status yang benar
      };
    });

    console.log("Export data formatted, creating Excel...");

    // Tutup koneksi database
    try {
      await connection.end();
      console.log("Database connection closed successfully");
    } catch (closeError) {
      console.error("Error closing database connection:", closeError);
    }

    // Buat workbook Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Column widths
    const columnWidths = [
      { wch: 5 },   // No
      { wch: 15 },  // KIP
      { wch: 30 },  // Nama Perusahaan
      { wch: 10 },  // Badan Usaha
      { wch: 40 },  // Alamat
      { wch: 15 },  // Kecamatan (NAMA)
      { wch: 15 },  // Desa (NAMA)
      { wch: 10 },  // Kode Pos
      { wch: 10 },  // Skala
      { wch: 10 },  // Lokasi Perusahaan
      { wch: 20 },  // Nama Kawasan
      { wch: 15 },  // Latitude
      { wch: 15 },  // Longitude
      { wch: 12 },  // Jarak
      { wch: 30 },  // Produk
      { wch: 10 },  // KBLI
      { wch: 15 },  // Telepon Perusahaan
      { wch: 25 },  // Email Perusahaan
      { wch: 25 },  // Website Perusahaan
      { wch: 10 },  // Tenaga Kerja
      { wch: 10 },  // Investasi
      { wch: 10 },  // Omset
      { wch: 20 },  // Nama Narasumber
      { wch: 20 },  // Jabatan Narasumber
      { wch: 25 },  // Email Narasumber
      { wch: 15 },  // Telepon Narasumber
      { wch: 15 },  // PCL Utama
      { wch: 30 },  // Catatan
      { wch: 15 },  // Tahun Direktori
      { wch: 12 },  // Total Survei
      { wch: 12 },  // Survei Selesai
      { wch: 20 },  // Persentase Penyelesaian
      { wch: 12 }   // Status
    ];
    worksheet['!cols'] = columnWidths;

    // Tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Direktori Perusahaan");

    console.log("Excel workbook created, generating buffer...");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    });

    console.log("Excel buffer generated, size:", excelBuffer.length);

    // Generate filename dengan filter info
    
    let filename = `direktori-perusahaan`;
    if (year && year !== "all") filename += `-tahun-${year}`;
    if (search) filename += `-search-${search.substring(0, 10)}`;
    if (status && status !== "all") filename += `-status-${status}`;
    if (pcl && pcl !== "all") filename += `-pcl-${pcl.substring(0, 10)}`;
    filename += '.xlsx';

    console.log("Sending Excel file:", filename);

    // Return Excel file sebagai response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Detailed error in Excel export:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error stack:", errorStack);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Error generating Excel file: " + errorMessage,
        error: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}