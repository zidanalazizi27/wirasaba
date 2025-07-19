// src/app/api/badan-usaha/route.ts
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

    console.log('Connecting to database for badan-usaha:', { host: dbHost, user: dbUser, database: dbName });

    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    console.log('Database connected successfully for badan-usaha');

    const [rows] = await connection.execute<RowDataPacket[]>(`
      SELECT id_bu, ket_bu 
      FROM badan_usaha
      ORDER BY id_bu
    `);

    const badanUsahaData = rows as RowDataPacket[];
    console.log('Badan usaha data fetched:', badanUsahaData.length, 'records');

    return NextResponse.json({ 
      success: true, 
      count: badanUsahaData.length,
      data: badanUsahaData 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Database error in badan-usaha API:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal mengambil data badan usaha",
        error: errorMessage 
      },
      { status: 500 }
    );
  } finally {
    // Pastikan koneksi selalu ditutup
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed for badan-usaha');
      } catch (closeError) {
        console.error('Error closing database connection for badan-usaha:', closeError);
      }
    }
  }
}