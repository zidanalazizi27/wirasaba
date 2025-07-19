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

    console.log('Connecting to database for omset:', { host: dbHost, user: dbUser, database: dbName });

    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    console.log('Database connected successfully for omset');

    const [rows] = await connection.execute<RowDataPacket[]>(`
      SELECT id_omset, ket_omset 
      FROM omset
      ORDER BY id_omset
    `);

    const omsetData = rows as RowDataPacket[];
    console.log('Omset data fetched:', omsetData.length, 'records');

    return NextResponse.json({
      success: true,
      count: omsetData.length,
      data: omsetData
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Database error in omset API:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal mengambil data omset",
        error: errorMessage 
      },
      { status: 500 }
    );
  } finally {
    // Pastikan koneksi selalu ditutup
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed for omset');
      } catch (closeError) {
        console.error('Error closing database connection for omset:', closeError);
      }
    }
  }
}