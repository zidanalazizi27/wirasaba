import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

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

    // Filter berdasarkan status di backend (api/perusahaan/route.ts)
    if (status !== "all" && status !== "kosong") {
      // Jika status bukan "kosong" atau "all", tidak akan ada data yang cocok
      whereConditions.push("1=0");
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

    // Query untuk menghitung total data
    const [totalRows] = await connection.execute(
      `SELECT COUNT(DISTINCT p.id_perusahaan) as total
       FROM perusahaan p
       JOIN direktori d ON p.id_perusahaan = d.id_perusahaan
       LEFT JOIN pcl ON p.pcl_utama = pcl.id_pcl
       ${whereClause}`,
      queryParams
    );

    // Query data perusahaan dengan pagination
    const [rows] = await connection.execute(
      `SELECT 
        p.id_perusahaan, 
        p.kip, 
        p.nama_perusahaan, 
        p.alamat, 
        p.jarak,
        p.pcl_utama,
        'kosong' as status
      FROM perusahaan p
      JOIN direktori d ON p.id_perusahaan = d.id_perusahaan
      ${whereClause}
      GROUP BY p.id_perusahaan
      ORDER BY p.id_perusahaan ASC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Close connection
    await connection.end();

    // Format the response
    const total = (totalRows as any[])[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // Add row numbers for display
    const formattedRows = (rows as any[]).map((row, index) => ({
      ...row,
      no: offset + index + 1,
      jarak: row.jarak ? `${row.jarak} km` : "",
      pcl: row.pcl || "-", // Pastikan nilai PCL tidak null
    }));

    return NextResponse.json({
      data: formattedRows,
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
    
    // Buat koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    // 1. Insert ke tabel perusahaan
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
    
    // Ambil ID perusahaan yang baru saja dimasukkan
    const newPerusahaanId = (resultPerusahaan as any).insertId;
    
    // 2. Insert ke tabel direktori untuk tahun-tahun yang dipilih
    if (data.tahun_direktori && data.tahun_direktori.length > 0) {
      const direktoriValues = data.tahun_direktori.map(year => [newPerusahaanId, year]);
      
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