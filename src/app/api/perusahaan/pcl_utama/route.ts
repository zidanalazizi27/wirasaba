import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    // Buat koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Query untuk mendapatkan nilai pcl_utama unik dari seluruh database
    const [rows] = await connection.execute(
      `SELECT DISTINCT pcl_utama 
       FROM perusahaan 
       WHERE pcl_utama IS NOT NULL AND pcl_utama != '' 
       ORDER BY pcl_utama ASC`
    );

    // Close connection
    await connection.end();

    // Format the response
    const pclOptions = (rows as any[]).map(row => ({
      name: String(row.pcl_utama),
      uid: String(row.pcl_utama)
    }));

    return NextResponse.json(pclOptions);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}