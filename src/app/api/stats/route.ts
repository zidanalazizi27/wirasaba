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

    // Query untuk mendapatkan jumlah perusahaan
    const [perusahaanRows] = await dbConnection.execute(
      'SELECT COUNT(*) as count FROM perusahaan'
    );

    // Query untuk mendapatkan jumlah PCL
    const [pclRows] = await dbConnection.execute(
      'SELECT COUNT(*) as count FROM pcl'
    );

    // Query untuk mendapatkan jumlah survei
    const [surveiRows] = await dbConnection.execute(
      'SELECT COUNT(*) as count FROM survei'
    );

    await dbConnection.end();

    return NextResponse.json({
      success: true,
      data: {
        perusahaan: (perusahaanRows as any[])[0].count,
        pcl: (pclRows as any[])[0].count,
        survei: (surveiRows as any[])[0].count
      }
    });
  } catch (error) {
    console.error('Database error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}