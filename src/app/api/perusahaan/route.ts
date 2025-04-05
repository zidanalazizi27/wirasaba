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