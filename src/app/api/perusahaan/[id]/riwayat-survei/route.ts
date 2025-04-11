import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id_perusahaan = params.id;
  
  try {
    // Buat koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });
    
    // Query untuk mendapatkan data riwayat survei berdasarkan id_perusahaan
    const [rows] = await connection.execute(
      `SELECT 
        r.id_riwayat,
        s.nama_survei,
        s.fungsi,
        s.periode,
        s.tahun,
        pcl.nama_pcl,
        r.selesai,
        r.ket_survei
      FROM riwayat_survei r
      JOIN survei s ON r.id_survei = s.id_survei
      JOIN pcl ON r.id_pcl = pcl.id_pcl
      WHERE r.id_perusahaan = ?
      ORDER BY s.tahun DESC, s.nama_survei ASC`,
      [id_perusahaan]
    );
    
    // Tutup koneksi
    await connection.end();
    
    // Kembalikan data dalam format JSON
    return NextResponse.json({ 
      success: true, 
      count: (rows as any[]).length,
      data: rows 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat mengambil data riwayat survei: " + (error as Error).message 
    }, { status: 500 });
  }
}