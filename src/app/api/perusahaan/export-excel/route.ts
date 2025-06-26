// src/app/api/perusahaan/export-excel/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Ambil parameter filter yang sama dengan tabel direktori
  const year = searchParams.get("year") || "";
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const pcl = searchParams.get("pcl") || "all";
  
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

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Query sederhana tanpa join untuk tabel referensi, hanya data yang diperlukan
    let query = `
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
        p.catatan,
        GROUP_CONCAT(DISTINCT d2.thn_direktori ORDER BY d2.thn_direktori) AS tahun_direktori,
        
        -- Hitung total survei dan completed survei
        COUNT(DISTINCT r.id_riwayat_survei) as total_survei,
        COUNT(DISTINCT CASE WHEN r.selesai = 1 THEN r.id_riwayat_survei END) as completed_survei
        
      FROM perusahaan p
      LEFT JOIN direktori d2 ON p.id_perusahaan = d2.id_perusahaan
      LEFT JOIN riwayat_survei r ON p.id_perusahaan = r.id_perusahaan
    `;

    const queryParams: any[] = [];
    const whereConditions: string[] = [];

    // Filter berdasarkan tahun direktori
    if (year && year !== "all") {
      whereConditions.push("d2.thn_direktori = ?");
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
      query += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // Group BY untuk agregasi
    query += ` GROUP BY p.id_perusahaan`;

    // Fungsi untuk menentukan status berdasarkan range yang benar
    const getStatus = (totalCount: number, completedCount: number): string => {
      if (totalCount === 0) return "kosong";
      
      const percentage = (completedCount / totalCount) * 100;
      
      if (percentage >= 80) return "tinggi";
      if (percentage >= 50) return "sedang";
      return "rendah";
    };

    // Tambahkan HAVING untuk filter status setelah kalkulasi dengan range yang benar
    if (status && status !== "all") {
      const statusConditions: { [key: string]: string } = {
        tinggi: "((COUNT(DISTINCT CASE WHEN r.selesai = 1 THEN r.id_riwayat_survei END) / COUNT(DISTINCT r.id_riwayat_survei)) * 100) >= 80",
        sedang: "((COUNT(DISTINCT CASE WHEN r.selesai = 1 THEN r.id_riwayat_survei END) / COUNT(DISTINCT r.id_riwayat_survei)) * 100) >= 50 AND ((COUNT(DISTINCT CASE WHEN r.selesai = 1 THEN r.id_riwayat_survei END) / COUNT(DISTINCT r.id_riwayat_survei)) * 100) < 80", 
        rendah: "COUNT(DISTINCT r.id_riwayat_survei) > 0 AND ((COUNT(DISTINCT CASE WHEN r.selesai = 1 THEN r.id_riwayat_survei END) / COUNT(DISTINCT r.id_riwayat_survei)) * 100) < 50",
        kosong: "COUNT(DISTINCT r.id_riwayat_survei) = 0"
      };
      
      if (statusConditions[status]) {
        query += ` HAVING ${statusConditions[status]}`;
      }
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
          jarak: "CAST(REPLACE(p.jarak, ' km', '') AS DECIMAL(10,2))",
          pcl_utama: "p.pcl_utama"
        };
        const dbColumn = columnMap[sort.column] || sort.column;
        return `${dbColumn} ${direction}`;
      });
      query += ` ORDER BY ${orderClauses.join(", ")}`;
    } else {
      query += ` ORDER BY p.nama_perusahaan ASC`;
    }

    console.log("Export query:", query);
    console.log("Export params:", queryParams);

    const [rows] = await connection.execute(query, queryParams);
    await connection.end();

    // Format data untuk export dengan auto increment yang benar
    const exportData = (rows as any[]).map((row, index) => {
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
        "Total Survei": totalSurvei,
        "Survei Selesai": completedSurvei,
        "Persentase Penyelesaian (%)": completionPercentage,
        "Status": statusValue
      };
    });

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
      { wch: 12 },  // Total Survei
      { wch: 12 },  // Survei Selesai
      { wch: 20 },  // Persentase Penyelesaian
      { wch: 12 }   // Status
    ];
    worksheet['!cols'] = columnWidths;

    // Tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Direktori Perusahaan");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    });

    // Generate filename dengan timestamp dan filter info
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
    
    let filename = `direktori-perusahaan-${timestamp}`;
    if (year && year !== "all") filename += `-tahun-${year}`;
    if (search) filename += `-search-${search.substring(0, 10)}`;
    if (status && status !== "all") filename += `-status-${status}`;
    if (pcl && pcl !== "all") filename += `-pcl-${pcl.substring(0, 10)}`;
    filename += '.xlsx';

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
    console.error("Error generating Excel:", error);
    return NextResponse.json(
      { success: false, message: "Error generating Excel file: " + error.message },
      { status: 500 }
    );
  }
}