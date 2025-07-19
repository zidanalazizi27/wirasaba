import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const kecId = searchParams.get('kec') || searchParams.get('kec_id'); // Support both parameter names
  
  let connection;
  try {
    // Validasi environment variables
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'wirasaba';

    console.log('Connecting to database for desa:', { host: dbHost, user: dbUser, database: dbName });

    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    console.log('Database connected successfully for desa');

    let query = `
      SELECT id_des, kode_des, nama_des 
      FROM desa
    `;
    
    // Tambahkan filter berdasarkan kecamatan jika parameter tersedia
    const queryParams = [];
    if (kecId) {
      query += ` WHERE kode_kec = ?`;
      queryParams.push(kecId);
    }
    
    query += ` ORDER BY nama_des`;

    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      query,
      queryParams
    );

    const desaData = rows as mysql.RowDataPacket[];
    console.log('Desa data fetched:', desaData.length, 'records for kecamatan:', kecId);

    return NextResponse.json({
      success: true, 
      count: desaData.length,
      data: desaData,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Database error in desa API:', errorMessage);
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal mengambil data desa",
        error: errorMessage 
      },
      { status: 500 }
    );
  } finally {
    // Pastikan koneksi selalu ditutup
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed for desa');
      } catch (closeError) {
        console.error('Error closing database connection for desa:', closeError);
      }
    }
  }
}