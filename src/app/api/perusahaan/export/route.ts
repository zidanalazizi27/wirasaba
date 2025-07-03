import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  console.log("Starting Excel export...");
  
  const searchParams = request.nextUrl.searchParams;
  
  // Ambil parameter filter yang sama dengan tabel direktori
  const year = searchParams.get("year") || "";
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const pcl = searchParams.get("pcl") || "all";
  
  console.log("Export parameters:", { year, search, status, pcl });
  
  // Ambil parameter sorting
  const sortParams: { column: string; direction: string }[] = [];
  let i = 0;
  while (searchParams.has(`sort[${i}][column]`)) {
    const column = searchParams.get(`sort[${i}][column]`);
    const direction = searchParams.get(`sort[${i}][direction]`);
    if (column && direction) {
      sortParams.push({ column, direction });
    }
    i++;
  }
  
  console.log("Sort parameters:", sortParams);

  try {
    // Validasi environment variables
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      console.error("Missing database environment variables");
      return NextResponse.json(
        { success: false, message: "Database configuration error" },
        { status: 500 }
      );
    }

    console.log("Connecting to database...");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
    });

    console.log("Database connected successfully");

    // Fungsi untuk menentukan status berdasarkan range yang benar
    const getStatus = (totalCount: number, completedCount: number): string => {
      if (totalCount === 0) return "kosong";
      
      const percentage = (completedCount / totalCount) * 100;
      
      if (percentage >= 80) return "tinggi";
      if (percentage >= 50) return "sedang";
      return "rendah";
    };

    // Query untuk mendapatkan data perusahaan
    let baseQuery = `
      SELECT 
        p.id_perusahaan,
        p.kip,
        p.nama_perusahaan,
        p.badan_usaha,
        p.alamat,
        p.kec,
        p.des,
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
        p.catatan
      FROM perusahaan p
    `;

    const queryParams: any[] = [];
    const whereConditions: string[] = [];

    // Filter berdasarkan tahun direktori (jika ada)
    if (year && year !== "all") {
      baseQuery += ` INNER JOIN direktori d ON p.id_perusahaan = d.id_perusahaan`;
      whereConditions.push("d.thn_direktori = ?");
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
    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // Tambahkan sorting jika ada
    if (sortParams.length > 0) {
      const orderClauses = sortParams.map(sort => {
        const direction = sort.direction === "ascending" ? "ASC" : "DESC";
        // Map kolom UI ke kolom database
        const columnMap: { [key: string]: string } = {
          kip: "p.kip",
          nama_perusahaan: "p.nama_perusahaan", 
          alamat: "p.alamat",
          jarak: "CAST(REPLACE(REPLACE(p.jarak, ' km', ''), ',', '.') AS DECIMAL(10,2))",
          pcl_utama: "p.pcl_utama"
        };
        const dbColumn = columnMap[sort.column] || `p.${sort.column}`;
        return `${dbColumn} ${direction}`;
      });
      baseQuery += ` ORDER BY ${orderClauses.join(", ")}`;
    } else {
      baseQuery += ` ORDER BY p.nama_perusahaan ASC`;
    }

    console.log("Executing query:", baseQuery);
    console.log("Query params:", queryParams);

    const [rows] = await connection.execute(baseQuery, queryParams);
    console.log("Query executed, rows found:", (rows as any[]).length);

    // Ambil data survei berdasarkan KIP untuk setiap perusahaan
    const perusahaanData = rows as any[];
    
    // Query untuk mendapatkan data direktori dan survei berdasarkan KIP
    const enrichedData = await Promise.all(
      perusahaanData.map(async (row) => {
        try {
          // Get tahun direktori
          const [direktoriRows] = await connection.execute(
            `SELECT GROUP_CONCAT(DISTINCT thn_direktori ORDER BY thn_direktori) AS tahun_direktori 
             FROM direktori WHERE id_perusahaan = ?`,
            [row.id_perusahaan]
          );
          
          // PERUBAHAN UTAMA: Get survei data berdasarkan KIP (bukan id_perusahaan)
          const [surveiRows] = await connection.execute(
            `SELECT 
               COUNT(*) as total_survei,
               COUNT(CASE WHEN rs.selesai = 'Iya' THEN 1 END) as completed_survei
             FROM riwayat_survei rs
             JOIN perusahaan p2 ON rs.id_perusahaan = p2.id_perusahaan
             WHERE p2.kip = ?`,
            [row.kip]
          );

          const direktoriData = (direktoriRows as any[])[0];
          const surveiData = (surveiRows as any[])[0];

          console.log(`Company ${row.id_perusahaan} (KIP: ${row.kip}) - Total: ${surveiData?.total_survei}, Completed: ${surveiData?.completed_survei}`);

          return {
            ...row,
            tahun_direktori: direktoriData?.tahun_direktori || "",
            total_survei: surveiData?.total_survei || 0,
            completed_survei: surveiData?.completed_survei || 0
          };
        } catch (err) {
          console.error("Error enriching data for company:", row.id_perusahaan, err);
          return {
            ...row,
            tahun_direktori: "",
            total_survei: 0,
            completed_survei: 0
          };
        }
      })
    );

    console.log("Data enriched successfully");

    // Filter berdasarkan status jika diperlukan
    let filteredData = enrichedData;
    if (status && status !== "all") {
      filteredData = enrichedData.filter(row => {
        const calculatedStatus = getStatus(row.total_survei, row.completed_survei);
        return calculatedStatus === status;
      });
    }

    console.log("Filtered data count:", filteredData.length);

    // Debug: Log beberapa sample data untuk memastikan kalkulasi benar
    if (filteredData.length > 0) {
      console.log("Sample data for verification:");
      filteredData.slice(0, 3).forEach((row, index) => {
        const percentage = row.total_survei > 0 ? Math.round((row.completed_survei / row.total_survei) * 100) : 0;
        const status = getStatus(row.total_survei, row.completed_survei);
        console.log(`Sample ${index + 1}: ${row.nama_perusahaan} (KIP: ${row.kip}) - Total: ${row.total_survei}, Completed: ${row.completed_survei}, Percentage: ${percentage}%, Status: ${status}`);
      });
    }

    // Format data untuk export dengan auto increment yang benar
    const exportData = filteredData.map((row, index) => {
      const totalSurvei = row.total_survei || 0;
      const completedSurvei = row.completed_survei || 0;
      const completionPercentage = totalSurvei > 0 ? Math.round((completedSurvei / totalSurvei) * 100) : 0;
      
      // Gunakan fungsi getStatus dengan range yang benar
      const statusValue = getStatus(totalSurvei, completedSurvei);

      return {
        "No": index + 1, // Auto increment berdasarkan urutan data yang berhasil diunduh
        "KIP": row.kip || "",
        "Nama Perusahaan": row.nama_perusahaan || "",
        "Badan Usaha": row.badan_usaha || "", // Kode referensi saja
        "Alamat": row.alamat || "",
        "Kecamatan": row.kec || "", // Kode referensi saja
        "Desa": row.des || "", // Kode referensi saja
        "Kode Pos": row.kode_pos || "",
        "Skala": row.skala || "",
        "Lokasi Perusahaan": row.lok_perusahaan || "", // Kode referensi saja
        "Nama Kawasan": row.nama_kawasan || "",
        "Latitude": row.lat || "",
        "Longitude": row.lon || "",
        "Jarak (km)": row.jarak || "",
        "Produk": row.produk || "",
        "KBLI": row.KBLI || "",
        "Telepon Perusahaan": row.telp_perusahaan || "",
        "Email Perusahaan": row.email_perusahaan || "",
        "Website Perusahaan": row.web_perusahaan || "",
        "Tenaga Kerja": row.tkerja || "", // Kode referensi saja
        "Investasi": row.investasi || "", // Kode referensi saja
        "Omset": row.omset || "", // Kode referensi saja
        "Nama Narasumber": row.nama_narasumber || "",
        "Jabatan Narasumber": row.jbtn_narasumber || "",
        "Email Narasumber": row.email_narasumber || "",
        "Telepon Narasumber": row.telp_narasumber || "",
        "PCL Utama": row.pcl_utama || "",
        "Catatan": row.catatan || "",
        "Tahun Direktori": row.tahun_direktori || "",
        "Total Survei (Berdasarkan KIP)": totalSurvei, // PERUBAHAN: Menambahkan label "Berdasarkan KIP"
        "Survei Selesai (Berdasarkan KIP)": completedSurvei, // PERUBAHAN: Menambahkan label "Berdasarkan KIP"
        "Persentase Penyelesaian (%)": completionPercentage,
        "Status Survei": statusValue
      };
    });

    console.log("Export data formatted, creating Excel...");

    // Tutup koneksi database
    await connection.end();

    // Buat workbook Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths yang disesuaikan
    const columnWidths = [
      { wch: 5 },   // No
      { wch: 15 },  // KIP
      { wch: 30 },  // Nama Perusahaan
      { wch: 10 },  // Badan Usaha (kode)
      { wch: 40 },  // Alamat
      { wch: 10 },  // Kecamatan (kode)
      { wch: 10 },  // Desa (kode)
      { wch: 10 },  // Kode Pos
      { wch: 10 },  // Skala
      { wch: 10 },  // Lokasi Perusahaan (kode)
      { wch: 20 },  // Nama Kawasan
      { wch: 15 },  // Latitude
      { wch: 15 },  // Longitude
      { wch: 12 },  // Jarak
      { wch: 30 },  // Produk
      { wch: 10 },  // KBLI
      { wch: 15 },  // Telepon Perusahaan
      { wch: 25 },  // Email Perusahaan
      { wch: 25 },  // Website Perusahaan
      { wch: 10 },  // Tenaga Kerja (kode)
      { wch: 10 },  // Investasi (kode)
      { wch: 10 },  // Omset (kode)
      { wch: 20 },  // Nama Narasumber
      { wch: 20 },  // Jabatan Narasumber
      { wch: 25 },  // Email Narasumber
      { wch: 15 },  // Telepon Narasumber
      { wch: 15 },  // PCL Utama
      { wch: 30 },  // Catatan
      { wch: 15 },  // Tahun Direktori
      { wch: 20 },  // Total Survei (Berdasarkan KIP)
      { wch: 20 },  // Survei Selesai (Berdasarkan KIP)
      { wch: 20 },  // Persentase Penyelesaian
      { wch: 15 }   // Status Survei
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

    // Generate filename dengan timestamp dan filter info
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
    
    let filename = `direktori-perusahaan-kip-based-${timestamp}`;
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
    console.error("Error stack:", error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Error generating Excel file: " + error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}