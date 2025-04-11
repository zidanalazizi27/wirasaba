import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Fungsi untuk menentukan status berdasarkan persentase penyelesaian
function determineStatus(completedCount: number, totalCount: number): string {
  if (totalCount === 0) return "kosong";
  
  const percentage = (completedCount / totalCount) * 100;
  
  if (percentage >= 80) return "tinggi";
  if (percentage >= 50) return "sedang";
  return "rendah";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get("year") || new Date().getFullYear().toString();
  const searchTerm = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const pcl = searchParams.get("pcl") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    // Buat koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Buat kondisi WHERE untuk query
    let whereConditions = [];
    let queryParams = [];
    
    // Filter berdasarkan tahun direktori
    whereConditions.push("d.thn_direktori = ?");
    queryParams.push(year);

    // Filter berdasarkan pencarian
    if (searchTerm) {
      whereConditions.push("(p.kip LIKE ? OR p.nama_perusahaan LIKE ? OR p.alamat LIKE ?)");
      queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Filter berdasarkan PCL
    if (pcl !== "all") {
      whereConditions.push("p.pcl_utama = ?");
      queryParams.push(pcl);
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 
      ? "WHERE " + whereConditions.join(" AND ") 
      : "";

    // Query untuk menghitung total data dan data survei
    const [rows] = await connection.execute(
      `SELECT 
        p.id_perusahaan, 
        p.kip, 
        p.nama_perusahaan, 
        p.alamat, 
        p.jarak,
        p.pcl_utama,
        (SELECT COUNT(*) FROM riwayat_survei rs WHERE rs.id_perusahaan = p.id_perusahaan) AS total_survei,
        (SELECT COUNT(*) FROM riwayat_survei rs WHERE rs.id_perusahaan = p.id_perusahaan AND rs.selesai = 'Iya') AS completed_survei
      FROM perusahaan p
      JOIN direktori d ON p.id_perusahaan = d.id_perusahaan
      ${whereClause}
      GROUP BY p.id_perusahaan
      ORDER BY p.id_perusahaan ASC`,
      [...queryParams]
    );

    // Format and calculate status for each company
    const formattedRows = (rows as any[]).map((row, index) => {
      const totalSurvei = row.total_survei || 0;
      const completedSurvei = row.completed_survei || 0;
      const calcStatus = determineStatus(completedSurvei, totalSurvei);
      
      return {
        ...row,
        jarak: row.jarak ? `${row.jarak} km` : "",
        pcl: row.pcl_utama || "-",
        status: calcStatus,
        completion_percentage: totalSurvei > 0 ? Math.round((completedSurvei / totalSurvei) * 100) : 0
      };
    });

    // Filter berdasarkan status
    let filteredRows = formattedRows;
    if (status !== "all") {
      filteredRows = formattedRows.filter(row => row.status === status);
    }
    
    // Apply pagination after filtering
    const total = filteredRows.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedRows = filteredRows.slice(offset, offset + limit).map((row, idx) => ({
      ...row,
      no: offset + idx + 1
    }));

    // Close connection
    await connection.end();

    return NextResponse.json({
      data: paginatedRows,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        perPage: limit,
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log("Data yang diterima:", data);
    
    // Buat koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    // 1. Insert ke tabel perusahaan - HAPUS id_perusahaan dari daftar kolom
    const [resultPerusahaan] = await connection.execute(
      `INSERT INTO perusahaan (
        kip, nama_perusahaan, badan_usaha, alamat, kec, des, 
        kode_pos, skala, lok_perusahaan, nama_kawasan, lat, lon, 
        jarak, produk, KBLI, telp_perusahaan, email_perusahaan, 
        web_perusahaan, tkerja, investasi, omset, nama_narasumber, 
        jbtn_narasumber, email_narasumber, telp_narasumber, pcl_utama, catatan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.kip || null,
        data.nama_perusahaan,
        data.badan_usaha,
        data.alamat,
        data.kec || null,
        data.des || null,
        data.kode_pos || null,
        data.skala,
        data.lok_perusahaan || null,
        data.nama_kawasan || null,
        data.lat || null,
        data.lon || null,
        data.jarak || null,
        data.produk || null,
        data.KBLI || null,
        data.telp_perusahaan || null,
        data.email_perusahaan || null,
        data.web_perusahaan || null,
        data.tkerja || null,
        data.investasi || null,
        data.omset || null,
        data.nama_narasumber || null,
        data.jbtn_narasumber || null,
        data.email_narasumber || null,
        data.telp_narasumber || null,
        data.pcl_utama || null,
        data.catatan || null
      ]
    );
    
    console.log("Hasil INSERT perusahaan:", resultPerusahaan);
    
    // Ambil ID perusahaan yang baru saja dimasukkan
    const newPerusahaanId = (resultPerusahaan as any).insertId;
    
    if (!newPerusahaanId) {
      // Tambahkan logging untuk debugging
      console.error("Insert berhasil tetapi tidak mendapatkan ID perusahaan baru", resultPerusahaan);
      throw new Error("Insert berhasil tetapi tidak mendapatkan ID perusahaan baru");
    }
    
    // 2. Insert ke tabel direktori untuk tahun-tahun yang dipilih
    if (data.tahun_direktori && Array.isArray(data.tahun_direktori) && data.tahun_direktori.length > 0) {
      // Prepare values for bulk insert
      const direktoriValues = data.tahun_direktori.map(year => [newPerusahaanId, year]);
      
      // Gunakan prepared statement untuk menyisipkan data direktori
      await connection.query(
        `INSERT INTO direktori (id_perusahaan, thn_direktori) VALUES ?`,
        [direktoriValues]
      );
    }
    
    await connection.end();
    
    return NextResponse.json({ 
      success: true, 
      message: "Data berhasil disimpan",
      id: newPerusahaanId
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat menyimpan data: " + error.message 
    }, { status: 500 });
  }
}