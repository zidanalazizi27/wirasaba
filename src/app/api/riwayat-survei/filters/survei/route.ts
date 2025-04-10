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

    // Get unique values for survei
    const [rows] = await dbConnection.execute(`
      SELECT DISTINCT s.id_survei, s.nama_survei
      FROM survei s
      JOIN riwayat_survei r ON s.id_survei = r.id_survei
      ORDER BY s.nama_survei
    `);

    await dbConnection.end();

    // Format for dropdowns
    const surveiOptions = (rows as any[]).map(row => ({
      name: row.nama_survei,
      uid: row.id_survei.toString()
    }));

    return NextResponse.json({ 
      success: true, 
      data: surveiOptions
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}