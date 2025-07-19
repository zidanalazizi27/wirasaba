// src\app\api\perusahaan\dropdown\route.ts

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

    // Query untuk mendapatkan data perusahaan dengan penanganan duplikat
    // Menggunakan GROUP BY untuk menggabungkan perusahaan dengan KIP dan nama yang sama
    const [rows] = await dbConnection.execute<mysql.RowDataPacket[]>(
      `
      SELECT 
        GROUP_CONCAT(id_perusahaan ORDER BY id_perusahaan ASC) as id_perusahaan_list,
        MIN(id_perusahaan) as id_perusahaan,
        kip, 
        nama_perusahaan,
        COUNT(*) as duplicate_count
      FROM perusahaan 
      GROUP BY kip, nama_perusahaan
      ORDER BY nama_perusahaan ASC
    `);

    await dbConnection.end();

    // Format response dengan informasi duplikat
    const formattedData = rows.map(row => ({
      id: row.id_perusahaan, // Menggunakan ID terkecil sebagai representatif
      id_list: row.id_perusahaan_list, // Daftar semua ID dengan KIP & nama sama
      name: row.nama_perusahaan,
      kip: row.kip || "-",
      isDuplicate: row.duplicate_count > 1,
      duplicateCount: row.duplicate_count,
      // Label yang informatif untuk dropdown
      displayLabel: row.duplicate_count > 1 
        ? `${row.kip} - ${row.nama_perusahaan} `
        : `${row.kip} - ${row.nama_perusahaan}`
    }));

    return NextResponse.json({ 
      success: true, 
      data: formattedData
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Database error:', errorMessage);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}