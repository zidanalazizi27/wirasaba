import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });

    // Query untuk mendapatkan data ringkas perusahaan untuk dropdown
    const [rows] = await dbConnection.execute(`
      SELECT 
        id_perusahaan, 
        kip, 
        nama_perusahaan 
      FROM perusahaan 
      ORDER BY nama_perusahaan ASC
    `);

    await dbConnection.end();

    // Format response khusus untuk dropdown
    return NextResponse.json({ 
      success: true, 
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