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

    // Get unique values for tahun
    const [rows] = await dbConnection.execute(`
      SELECT DISTINCT s.tahun
      FROM survei s
      JOIN riwayat_survei r ON s.id_survei = r.id_survei
      ORDER BY s.tahun DESC
    `);

    await dbConnection.end();

    // Format for dropdowns
    const tahunOptions = (rows as any[]).map(row => ({
      name: row.tahun.toString(),
      uid: row.tahun.toString()
    }));

    return NextResponse.json({ 
      success: true, 
      data: tahunOptions
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}