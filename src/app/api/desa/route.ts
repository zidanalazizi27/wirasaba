import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const kecId = searchParams.get('kec_id');
  
  try {
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });

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

    const [rows] = await dbConnection.execute(query, queryParams);

    await dbConnection.end();

    return NextResponse.json({ 
      success: true, 
      count: (rows as any[]).length,
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