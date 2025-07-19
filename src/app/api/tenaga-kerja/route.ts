// src/app/api/tenaga-kerja/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  let connection;
  try {
    // Validasi environment variables
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'wirasaba';

    console.log('Connecting to database:', { host: dbHost, user: dbUser, database: dbName });

    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    console.log('Database connected successfully');

    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM tenaga_kerja ORDER BY id_tenaga_kerja ASC'
    );
    
    const tenagaKerja = rows as mysql.RowDataPacket[];
    console.log('Tenaga kerja data fetched:', tenagaKerja.length, 'records');

    return NextResponse.json({ 
      success: true, 
      count: tenagaKerja.length,
      data: tenagaKerja 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error('Database error in tenaga-kerja API:', errorMessage);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal mengambil data tenaga kerja",
        error: errorMessage 
      },
      { status: 500 }
    );
  } finally {
    // Pastikan koneksi selalu ditutup
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
}