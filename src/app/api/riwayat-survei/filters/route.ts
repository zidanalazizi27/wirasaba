// src/app/api/riwayat-survei/filters/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "all"; // type bisa berupa: "survei", "pcl", "tahun", atau "all"
  
  try {
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });

    // Objek untuk menyimpan hasil filter
    const filters: { [key: string]: any[] } = {};

    // Query untuk survei
    if (type === "survei" || type === "all") {
      const [surveiRows] = await dbConnection.execute(`
        SELECT DISTINCT s.id_survei, s.nama_survei
        FROM survei s
        JOIN riwayat_survei r ON s.id_survei = r.id_survei
        ORDER BY s.nama_survei
      `);
      
      filters.survei = (surveiRows as any[]).map(row => ({
        name: row.nama_survei,
        uid: row.id_survei.toString()
      }));
    }

    // Query untuk pcl
    if (type === "pcl" || type === "all") {
      const [pclRows] = await dbConnection.execute(`
        SELECT DISTINCT p.id_pcl, p.nama_pcl
        FROM pcl p
        JOIN riwayat_survei r ON p.id_pcl = r.id_pcl
        ORDER BY p.nama_pcl
      `);
      
      filters.pcl = (pclRows as any[]).map(row => ({
        name: row.nama_pcl,
        uid: row.id_pcl.toString()
      }));
    }

    // Query untuk tahun
    if (type === "tahun" || type === "all") {
      const [tahunRows] = await dbConnection.execute(`
        SELECT DISTINCT s.tahun
        FROM survei s
        JOIN riwayat_survei r ON s.id_survei = r.id_survei
        ORDER BY s.tahun DESC
      `);
      
      filters.tahun = (tahunRows as any[]).map(row => ({
        name: row.tahun.toString(),
        uid: row.tahun.toString()
      }));
    }

    await dbConnection.end();

    return NextResponse.json({ 
      success: true, 
      data: type === "all" ? filters : filters[type] || []
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}