// ==== BUAT FILE BARU: src/app/api/perusahaan/check-duplicate/route.ts ====

import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

interface DuplicateCheckRequest {
  kip: string;
  years: number[];
  excludeCompanyId?: number;
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingCompany?: {
    id_perusahaan: number;
    nama_perusahaan: string;
    kip: string;
    tahun_direktori: number[];
  };
  duplicateYears?: number[];
}

export async function POST(request: NextRequest) {
  try {
    const body: DuplicateCheckRequest = await request.json();
    const { kip, years, excludeCompanyId } = body;

    // Validasi input
    if (!kip || !Array.isArray(years) || years.length === 0) {
      return NextResponse.json({
        isDuplicate: false
      } as DuplicateCheckResult);
    }

    // Buat koneksi database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    try {
      // Query untuk mencari perusahaan dengan KIP yang sama
      let query = `
        SELECT DISTINCT 
          p.id_perusahaan, 
          p.nama_perusahaan, 
          p.kip,
          d.thn_direktori
        FROM perusahaan p
        INNER JOIN direktori d ON p.id_perusahaan = d.id_perusahaan
        WHERE p.kip = ?
      `;
      
      const queryParams: any[] = [kip];

      // Jika sedang edit perusahaan, exclude perusahaan yang sedang diedit
      if (excludeCompanyId) {
        query += ` AND p.id_perusahaan != ?`;
        queryParams.push(excludeCompanyId);
      }

      query += ` ORDER BY p.id_perusahaan, d.thn_direktori`;

      const [rows] = await connection.execute(query, queryParams);
      const results = rows as any[];

      if (results.length === 0) {
        return NextResponse.json({
          isDuplicate: false
        } as DuplicateCheckResult);
      }

      // Organisir data berdasarkan perusahaan
      const companiesMap = new Map<number, {
        id_perusahaan: number;
        nama_perusahaan: string;
        kip: string;
        tahun_direktori: number[];
      }>();

      results.forEach(row => {
        const companyId = row.id_perusahaan;
        
        if (!companiesMap.has(companyId)) {
          companiesMap.set(companyId, {
            id_perusahaan: row.id_perusahaan,
            nama_perusahaan: row.nama_perusahaan,
            kip: row.kip,
            tahun_direktori: []
          });
        }
        
        companiesMap.get(companyId)!.tahun_direktori.push(row.thn_direktori);
      });

      // Cek apakah ada tahun yang duplikasi
      const duplicateYears: number[] = [];
      let existingCompany: any = null;

      for (const [companyId, company] of companiesMap.entries()) {
        const conflictYears = years.filter(year => 
          company.tahun_direktori.includes(year)
        );
        
        if (conflictYears.length > 0) {
          duplicateYears.push(...conflictYears);
          if (!existingCompany) {
            existingCompany = company;
          }
        }
      }

      const isDuplicate = duplicateYears.length > 0;

      return NextResponse.json({
        isDuplicate,
        existingCompany: isDuplicate ? existingCompany : undefined,
        duplicateYears: isDuplicate ? [...new Set(duplicateYears)] : undefined
      } as DuplicateCheckResult);

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error("Error checking duplicate:", error);
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat mengecek duplikasi data",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}

// ==== TAMBAHAN: Endpoint untuk cek duplikasi spesifik saat tambah tahun direktori ====
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const kip = searchParams.get('kip');
  const year = searchParams.get('year');
  const excludeCompanyId = searchParams.get('excludeCompanyId');

  if (!kip || !year) {
    return NextResponse.json({
      isDuplicate: false
    });
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    try {
      let query = `
        SELECT 
          p.id_perusahaan, 
          p.nama_perusahaan, 
          p.kip
        FROM perusahaan p
        INNER JOIN direktori d ON p.id_perusahaan = d.id_perusahaan
        WHERE p.kip = ? AND d.thn_direktori = ?
      `;
      
      const queryParams: any[] = [kip, parseInt(year)];

      if (excludeCompanyId) {
        query += ` AND p.id_perusahaan != ?`;
        queryParams.push(parseInt(excludeCompanyId));
      }

      query += ` LIMIT 1`;

      const [rows] = await connection.execute(query, queryParams);
      const results = rows as any[];

      const isDuplicate = results.length > 0;

      return NextResponse.json({
        isDuplicate,
        existingCompany: isDuplicate ? {
          id_perusahaan: results[0].id_perusahaan,
          nama_perusahaan: results[0].nama_perusahaan,
          kip: results[0].kip,
          tahun_direktori: [parseInt(year)]
        } : undefined,
        duplicateYears: isDuplicate ? [parseInt(year)] : undefined
      } as DuplicateCheckResult);

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error("Error checking duplicate:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengecek duplikasi data" }, 
      { status: 500 }
    );
  }
}