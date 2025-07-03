// src/app/api/riwayat-survei/by-kip/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "wirasaba",
};

// Utility function to create database connection
async function createDbConnection() {
  return await mysql.createConnection(dbConfig);
}

// GET endpoint to fetch riwayat survei by KIP
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const kip = searchParams.get("kip");

  if (!kip) {
    return NextResponse.json(
      {
        success: false,
        message: "Parameter KIP diperlukan",
      },
      { status: 400 }
    );
  }

  try {
    // Create database connection
    const connection = await createDbConnection();

    // Query untuk mendapatkan semua riwayat survei berdasarkan KIP
    // Ini akan mengambil data dari semua perusahaan yang memiliki KIP yang sama
    const query = `
      SELECT 
        r.id_riwayat,
        s.nama_survei,
        s.fungsi,
        s.periode,
        s.tahun,
        pcl.nama_pcl,
        r.selesai,
        r.ket_survei,
        p.nama_perusahaan,
        p.kip,
        p.id_perusahaan
      FROM riwayat_survei r
      JOIN survei s ON r.id_survei = s.id_survei
      JOIN perusahaan p ON r.id_perusahaan = p.id_perusahaan
      JOIN pcl ON r.id_pcl = pcl.id_pcl
      WHERE p.kip = ?
      ORDER BY s.tahun DESC, s.nama_survei ASC, p.nama_perusahaan ASC
    `;

    const [rows] = await connection.execute(query, [kip]);
    await connection.end();

    const riwayatData = rows as any[];

    // Format response data
    const formattedData = riwayatData.map((row) => ({
      id_riwayat: row.id_riwayat,
      nama_survei: row.nama_survei,
      fungsi: row.fungsi || "",
      periode: row.periode || "",
      tahun: row.tahun,
      nama_pcl: row.nama_pcl,
      selesai: row.selesai,
      ket_survei: row.ket_survei || "",
      nama_perusahaan: row.nama_perusahaan,
      kip: row.kip,
      id_perusahaan: row.id_perusahaan,
    }));

    // Get summary statistics
    const totalSurvei = formattedData.length;
    const selesaiCount = formattedData.filter(item => item.selesai === "Iya").length;
    const belumSelesaiCount = formattedData.filter(item => item.selesai === "Tidak").length;
    
    // Get unique companies with this KIP
    const uniqueCompanies = [...new Set(formattedData.map(item => 
      `${item.nama_perusahaan} (ID: ${item.id_perusahaan})`
    ))];

    return NextResponse.json({
      success: true,
      message: `Berhasil mengambil ${totalSurvei} riwayat survei untuk KIP ${kip}`,
      data: formattedData,
      summary: {
        kip: kip,
        total_survei: totalSurvei,
        selesai: selesaiCount,
        belum_selesai: belumSelesaiCount,
        companies_count: uniqueCompanies.length,
        companies: uniqueCompanies
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error saat mengambil data riwayat survei: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}