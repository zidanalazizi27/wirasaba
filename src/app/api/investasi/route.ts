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

    console.log('Connecting to database for investasi:', { host: dbHost, user: dbUser, database: dbName });

    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    console.log('Database connected successfully for investasi');

    const [rows] = await connection.execute<RowDataPacket[]>(`
      SELECT id_investasi, ket_investasi 
      FROM investasi
      ORDER BY id_investasi
    `);

    const investasiData = rows as RowDataPacket[];
    console.log('Investasi data fetched:', investasiData.length, 'records');

    return NextResponse.json({
      success: true,
      count: investasiData.length,
      data: investasiData
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Database error in investasi API:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal mengambil data investasi",
        error: errorMessage 
      },
      { status: 500 }
    );
  } finally {
    // Pastikan koneksi selalu ditutup
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed for investasi');
      } catch (closeError) {
        console.error('Error closing database connection for investasi:', closeError);
      }
    }
  }
}