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

    // Get unique values for fungsi
    const [fungsiRows] = await dbConnection.execute<mysql.RowDataPacket[]>(`
      SELECT DISTINCT fungsi FROM survei ORDER BY fungsi
    `);

    // Get unique values for periode
    const [periodeRows] = await dbConnection.execute<mysql.RowDataPacket[]>(`
      SELECT DISTINCT periode FROM survei ORDER BY periode
    `);

    // Get unique values for tahun
    const [tahunRows] = await dbConnection.execute<mysql.RowDataPacket[]>(`
      SELECT DISTINCT tahun FROM survei ORDER BY tahun DESC
    `);

    await dbConnection.end();

    // Format for dropdowns
    const fungsiOptions = fungsiRows.map(row => ({
      name: row.fungsi,
      uid: row.fungsi
    }));

    const periodeOptions = periodeRows.map(row => ({
      name: row.periode,
      uid: row.periode
    }));

    const tahunOptions = tahunRows.map(row => ({
      name: row.tahun.toString(),
      uid: row.tahun.toString()
    }));

    return NextResponse.json({ 
      success: true, 
      data: {
        fungsi: fungsiOptions,
        periode: periodeOptions,
        tahun: tahunOptions
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}