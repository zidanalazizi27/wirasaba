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

    // Get unique values for PCL
    const [rows] = await dbConnection.execute(`
      SELECT DISTINCT p.id_pcl, p.nama_pcl
      FROM pcl p
      JOIN riwayat_survei r ON p.id_pcl = r.id_pcl
      ORDER BY p.nama_pcl
    `);

    await dbConnection.end();

    // Format for dropdowns
    const pclOptions = (rows as any[]).map(row => ({
      name: row.nama_pcl,
      uid: row.id_pcl.toString()
    }));

    return NextResponse.json({ 
      success: true, 
      data: pclOptions
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}