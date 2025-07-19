import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  let connection;
  try {
    // Validasi environment variables
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'wirasaba';

    console.log('Connecting to database for perusahaan/pcl_utama:', { host: dbHost, user: dbUser, database: dbName });

    // Buat koneksi ke database
    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    console.log('Database connected successfully for perusahaan/pcl_utama');

    // Query untuk mendapatkan nilai pcl_utama unik dari seluruh database
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT DISTINCT pcl_utama 
       FROM perusahaan 
       WHERE pcl_utama IS NOT NULL AND pcl_utama != '' 
       ORDER BY pcl_utama ASC`
    );

    // Format the response
    const pclOptions = rows.map(row => ({
      name: String(row.pcl_utama),
      uid: String(row.pcl_utama)
    }));

    console.log('PCL utama data fetched:', pclOptions.length, 'records');

    return NextResponse.json({
      success: true,
      count: pclOptions.length,
      data: pclOptions
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Database error in perusahaan/pcl_utama API:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal mengambil data PCL utama",
        error: errorMessage 
      },
      { status: 500 }
    );
  } finally {
    // Pastikan koneksi selalu ditutup
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed for perusahaan/pcl_utama');
      } catch (closeError) {
        console.error('Error closing database connection for perusahaan/pcl_utama:', closeError);
      }
    }
  }
}