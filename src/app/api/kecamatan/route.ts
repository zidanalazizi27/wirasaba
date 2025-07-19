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

    console.log('Connecting to database for kecamatan:', { host: dbHost, user: dbUser, database: dbName });

    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    console.log('Database connected successfully for kecamatan');

    const [rows] = await connection.execute<RowDataPacket[]>(`
      SELECT kode_kec, id_kec, nama_kec 
      FROM kecamatan
      ORDER BY kode_kec
    `);

    const kecamatanData = rows as RowDataPacket[];
    console.log('Kecamatan data fetched:', kecamatanData.length, 'records');

    return NextResponse.json({
      success: true,
      count: kecamatanData.length,
      data: kecamatanData
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Database error in kecamatan API:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal mengambil data kecamatan",
        error: errorMessage 
      },
      { status: 500 }
    );
  } finally {
    // Pastikan koneksi selalu ditutup
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed for kecamatan');
      } catch (closeError) {
        console.error('Error closing database connection for kecamatan:', closeError);
      }
    }
  }
}