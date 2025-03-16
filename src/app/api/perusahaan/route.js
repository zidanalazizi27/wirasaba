import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    // Konfigurasi koneksi database
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });

    // Query untuk mengambil data perusahaan dengan seleksi kolom lengkap
    const [rows] = await dbConnection.execute(
      `SELECT id_perusahaan, kip, nama_perusahaan, alamat, kec, des, 
      badan_usaha, skala, lok_perusahaan, nama_kawasan, lat, lon, 
      produk, KBLI, telp_perusahaan, email_perusahaan, web_perusahaan 
      FROM perusahaan WHERE lat IS NOT NULL AND lon IS NOT NULL`
    );

    // Log untuk debugging
    console.log("Data perusahaan pertama:", rows.length > 0 ? rows[0] : "Tidak ada data");

    // Tutup koneksi database
    await dbConnection.end();

    // Kembalikan data dalam format JSON
    return NextResponse.json({ 
      success: true, 
      count: rows.length,
      data: rows 
    });
  } catch (error) {
    console.error('Database error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}