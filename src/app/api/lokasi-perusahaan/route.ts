import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

export async function GET() {
  let connection;
  try {
    // Validasi environment variables
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'wirasaba';

    console.log('Connecting to database for lokasi-perusahaan:', { host: dbHost, user: dbUser, database: dbName });

    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    console.log('Database connected successfully for lokasi-perusahaan');

    const [rows] = await connection.execute<RowDataPacket[]>(`
      SELECT id_lok, ket_lok 
      FROM lokasi_perusahaan
      ORDER BY id_lok
    `);

    const lokasiData = rows as RowDataPacket[];
    console.log('Lokasi perusahaan data fetched:', lokasiData.length, 'records');

    return NextResponse.json({
      success: true,
      count: lokasiData.length,
      data: lokasiData
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Database error in lokasi-perusahaan API:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal mengambil data lokasi perusahaan",
        error: errorMessage 
      },
      { status: 500 }
    );
  } finally {
    // Pastikan koneksi selalu ditutup
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed for lokasi-perusahaan');
      } catch (closeError) {
        console.error('Error closing database connection for lokasi-perusahaan:', closeError);
      }
    }
  }
}