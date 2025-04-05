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

    const [rows] = await dbConnection.execute(`
      SELECT id_direktori, id_perusahaan, thn_direktori 
      FROM direktori
    `);

    await dbConnection.end();

    return NextResponse.json({ 
      success: true, 
      count: rows.length,
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