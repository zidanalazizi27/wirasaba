// src/app/api/perusahaan/import/route.ts - FULL FIX VERSION (Part 1)
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import * as XLSX from 'xlsx';

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

// ✅ PERBAIKAN: Interface untuk data Excel dengan optional fields dan multiple types
interface ExcelRowData {
  'KIP'?: string | number;
  'Nama Perusahaan'?: string;
  'Badan Usaha'?: string | number;
  'Alamat'?: string;
  'Kecamatan'?: string;
  'Desa'?: string;
  'Kode Pos'?: string | number;
  'Skala'?: string;
  'Lokasi Perusahaan'?: string | number;
  'Nama Kawasan'?: string;
  'Latitude'?: string | number;
  'Longitude'?: string | number;
  'Jarak (KM)'?: string | number;
  'Produk'?: string;
  'KBLI'?: string | number;
  'Telepon Perusahaan'?: string;
  'Email Perusahaan'?: string;
  'Website Perusahaan'?: string;
  'Tenaga Kerja'?: string | number;
  'Investasi'?: string | number;
  'Omset'?: string | number;
  'Nama Narasumber'?: string;
  'Jabatan Narasumber'?: string;
  'Email Narasumber'?: string;
  'Telepon Narasumber'?: string;
  'PCL Utama'?: string;
  'Catatan'?: string;
  'Tahun Direktori'?: string | number;
}

interface ProcessedData {
  kip: string;
  nama_perusahaan: string;
  badan_usaha: number;
  alamat: string;
  kec: number;
  des: number;
  kode_pos?: string;
  skala: string;
  lok_perusahaan: number;
  nama_kawasan?: string;
  lat: number;
  lon: number;
  jarak?: number;
  produk: string;
  KBLI: number;
  telp_perusahaan?: string;
  email_perusahaan?: string;
  web_perusahaan?: string;
  tkerja: number;
  investasi: number;
  omset: number;
  nama_narasumber?: string;
  jbtn_narasumber?: string;
  email_narasumber?: string;
  telp_narasumber?: string;
  pcl_utama?: string;
  catatan?: string;
  tahun_direktori: number[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

interface DuplicateData {
  row: number;
  kip: string;
  tahun_direktori: number[];
  existing_company?: {
    id_perusahaan: number;
    nama_perusahaan: string;
  };
}

// Fungsi validasi email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ✅ PERBAIKAN: Fungsi sanitasi data - handle semua 28 field dengan benar
function sanitizeDirectoryData(rawData: ExcelRowData): ProcessedData {
  return {
    kip: String(rawData['KIP'] || '').trim(),
    nama_perusahaan: String(rawData['Nama Perusahaan'] || '').trim(),
    badan_usaha: parseInt(String(rawData['Badan Usaha'] || '1')),
    alamat: String(rawData['Alamat'] || '').trim(),
    kec: 1, // Will be mapped later based on kecamatan name
    des: 1, // Will be mapped later based on desa name
    kode_pos: rawData['Kode Pos'] ? String(rawData['Kode Pos']).trim() : undefined,
    skala: String(rawData['Skala'] || '').trim(),
    lok_perusahaan: parseInt(String(rawData['Lokasi Perusahaan'] || '1')),
    nama_kawasan: rawData['Nama Kawasan'] ? String(rawData['Nama Kawasan']).trim() : undefined,
    lat: Number(rawData['Latitude']),
    lon: Number(rawData['Longitude']),
    jarak: rawData['Jarak (KM)'] ? Number(rawData['Jarak (KM)']) : undefined,
    produk: String(rawData['Produk'] || '').trim(),
    KBLI: Number(rawData['KBLI']),
    telp_perusahaan: rawData['Telepon Perusahaan'] ? String(rawData['Telepon Perusahaan']).trim() : undefined,
    email_perusahaan: rawData['Email Perusahaan'] ? String(rawData['Email Perusahaan']).trim() : undefined,
    web_perusahaan: rawData['Website Perusahaan'] ? String(rawData['Website Perusahaan']).trim() : undefined,
    tkerja: parseInt(String(rawData['Tenaga Kerja'] || '1')),
    investasi: parseInt(String(rawData['Investasi'] || '1')),
    omset: parseInt(String(rawData['Omset'] || '1')),
    nama_narasumber: rawData['Nama Narasumber'] ? String(rawData['Nama Narasumber']).trim() : undefined,
    jbtn_narasumber: rawData['Jabatan Narasumber'] ? String(rawData['Jabatan Narasumber']).trim() : undefined,
    email_narasumber: rawData['Email Narasumber'] ? String(rawData['Email Narasumber']).trim() : undefined,
    telp_narasumber: rawData['Telepon Narasumber'] ? String(rawData['Telepon Narasumber']).trim() : undefined,
    pcl_utama: rawData['PCL Utama'] ? String(rawData['PCL Utama']).trim() : undefined,
    catatan: rawData['Catatan'] ? String(rawData['Catatan']).trim() : undefined,
    tahun_direktori: rawData['Tahun Direktori'] ? 
      String(rawData['Tahun Direktori']).split(',').map(year => parseInt(year.trim())).filter(year => !isNaN(year)) : []
  };
}

// ✅ PERBAIKAN: Fungsi validasi data - HANYA validasi 16 field wajib dengan ketat
function validateDirectoryData(data: ProcessedData): string[] {
  const errors: string[] = [];

  // ========== VALIDASI 16 FIELD WAJIB ==========

  // 1. Validasi KIP (WAJIB)
  if (!data.kip || data.kip.toString().trim() === '') {
    errors.push("KIP wajib diisi");
  } else {
    if (!/^\d+$/.test(data.kip)) {
      errors.push("KIP harus berupa angka");
    }
    if (data.kip.length > 10) {
      errors.push("KIP maksimal 10 digit");
    }
  }

  // 2. Validasi Nama Perusahaan (WAJIB)
  if (!data.nama_perusahaan || data.nama_perusahaan.trim() === '') {
    errors.push("Nama perusahaan wajib diisi");
  } else if (data.nama_perusahaan.length < 3) {
    errors.push("Nama perusahaan minimal 3 karakter");
  }

  // 3. Validasi Alamat (WAJIB)
  if (!data.alamat || data.alamat.trim() === '') {
    errors.push("Alamat wajib diisi");
  }

  // 4. Validasi Badan Usaha (WAJIB, 1-8)
  if (isNaN(data.badan_usaha) || data.badan_usaha < 1 || data.badan_usaha > 8) {
    errors.push("Badan Usaha wajib diisi dengan kode 1-8");
  }

  // 5. Validasi Lokasi Perusahaan (WAJIB, 1-4)
  if (isNaN(data.lok_perusahaan) || data.lok_perusahaan < 1 || data.lok_perusahaan > 4) {
    errors.push("Lokasi Perusahaan wajib diisi dengan kode 1-4");
  }

  // 6. Validasi KBLI (WAJIB)
  if (isNaN(data.KBLI)) {
    errors.push("KBLI wajib diisi dengan angka 5 digit");
  } else {
    const kbliStr = String(data.KBLI);
    if (kbliStr.length !== 5) {
      errors.push("KBLI harus 5 digit");
    }
  }

  // 7. Validasi Produk (WAJIB)
  if (!data.produk || data.produk.trim() === '') {
    errors.push("Produk wajib diisi");
  }

  // 8. Validasi Latitude (WAJIB)
  if (data.lat === null || data.lat === undefined || isNaN(data.lat)) {
    errors.push("Latitude wajib diisi");
  } else if (data.lat < -90 || data.lat > 90) {
    errors.push("Latitude harus dalam range -90 sampai 90");
  }

  // 9. Validasi Longitude (WAJIB)
  if (data.lon === null || data.lon === undefined || isNaN(data.lon)) {
    errors.push("Longitude wajib diisi");
  } else if (data.lon < -180 || data.lon > 180) {
    errors.push("Longitude harus dalam range -180 sampai 180");
  }

  // 10. Validasi Tenaga Kerja (WAJIB, 1-4)
  if (isNaN(data.tkerja) || data.tkerja < 1 || data.tkerja > 4) {
    errors.push("Tenaga Kerja wajib diisi dengan kode 1-4");
  }

  // 11. Validasi Investasi (WAJIB, 1-4)
  if (isNaN(data.investasi) || data.investasi < 1 || data.investasi > 4) {
    errors.push("Investasi wajib diisi dengan kode 1-4");
  }

  // 12. Validasi Omset (WAJIB, 1-4)
  if (isNaN(data.omset) || data.omset < 1 || data.omset > 4) {
    errors.push("Omset wajib diisi dengan kode 1-4");
  }

  // 13. Validasi Skala (WAJIB)
  if (!data.skala || data.skala.trim() === '') {
    errors.push("Skala wajib diisi");
  } else if (!['Besar', 'Sedang'].includes(data.skala)) {
    errors.push("Skala harus 'Besar' atau 'Sedang'");
  }

  // 14. Validasi Tahun Direktori (WAJIB)
  if (!data.tahun_direktori || data.tahun_direktori.length === 0) {
    errors.push("Tahun direktori wajib diisi");
  } else {
    for (const year of data.tahun_direktori) {
      if (year < 2000 || year > 2100) {
        errors.push(`Tahun direktori ${year} harus dalam range 2000-2100`);
      }
    }
  }

  // ========== VALIDASI FIELD OPSIONAL (hanya jika diisi) ==========
  
  // Validasi kode pos jika ada
  if (data.kode_pos && !/^\d{5}$/.test(data.kode_pos)) {
    errors.push("Kode pos harus 5 digit angka");
  }

  // Validasi jarak jika ada
  if (data.jarak !== undefined && (isNaN(data.jarak) || data.jarak < 0)) {
    errors.push("Jarak harus berupa angka positif");
  }

  // Validasi email jika ada
  if (data.email_perusahaan && !isValidEmail(data.email_perusahaan)) {
    errors.push("Format email perusahaan tidak valid");
  }
  if (data.email_narasumber && !isValidEmail(data.email_narasumber)) {
    errors.push("Format email narasumber tidak valid");
  }

  // Validasi website jika ada
  if (data.web_perusahaan && data.web_perusahaan.length > 0) {
    if (!/^[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$/.test(data.web_perusahaan.replace(/^https?:\/\//, ''))) {
      errors.push("Format website tidak valid");
    }
  }

  return errors;
}

// Fungsi untuk mapping lookup values (kecamatan dan desa)
async function mapLookupValues(connection: mysql.Connection, data: ProcessedData, kecamatanName: string, desaName: string) {
  try {
    // Map kecamatan berdasarkan nama
    const [kecRows] = await connection.execute(
      'SELECT id_kecamatan FROM kecamatan WHERE nama_kecamatan = ?',
      [kecamatanName]
    ) as mysql.RowDataPacket[][];
    
    if (kecRows.length === 0) {
      throw new Error(`Kecamatan "${kecamatanName}" tidak ditemukan`);
    }
    data.kec = kecRows[0].id_kecamatan;

    // Map desa berdasarkan nama dan kecamatan
    const [desRows] = await connection.execute(
      'SELECT id_desa FROM desa WHERE nama_desa = ? AND id_kecamatan = ?',
      [desaName, data.kec]
    ) as mysql.RowDataPacket[][];
    
    if (desRows.length === 0) {
      throw new Error(`Desa "${desaName}" tidak ditemukan di kecamatan "${kecamatanName}"`);
    }
    data.des = desRows[0].id_desa;

    return data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk cek duplikasi KIP dan tahun direktori
async function checkDuplicateKipAndYear(
  connection: mysql.Connection, 
  kip: string, 
  tahunDirektori: number[], 
  excludeId?: number
): Promise<DuplicateData[]> {
  const duplicates: DuplicateData[] = [];
  
  for (const year of tahunDirektori) {
    let query = `
      SELECT p.id_perusahaan, p.nama_perusahaan, p.kip,
             GROUP_CONCAT(pd.tahun_direktori) as tahun_list
      FROM perusahaan p
      JOIN perusahaan_direktori pd ON p.id_perusahaan = pd.id_perusahaan
      WHERE p.kip = ? AND pd.tahun_direktori = ?
    `;
    const params = [kip, year];
    
    if (excludeId) {
      query += ' AND p.id_perusahaan != ?';
      params.push(excludeId);
    }
    
    query += ' GROUP BY p.id_perusahaan';
    
    const [rows] = await connection.execute(query, params) as mysql.RowDataPacket[][];
    
    if (rows.length > 0) {
      duplicates.push({
        row: 0, // Will be set by caller
        kip,
        tahun_direktori: [year],
        existing_company: {
          id_perusahaan: rows[0].id_perusahaan,
          nama_perusahaan: rows[0].nama_perusahaan
        }
      });
    }
  }
  
  return duplicates;
}

// Fungsi untuk menyimpan data perusahaan
async function saveCompanyData(connection: mysql.Connection, data: ProcessedData, mode: 'append' | 'replace'): Promise<number> {
  try {
    // Check if company exists (untuk mode append)
    let companyId: number;
    
    if (mode === 'append') {
      const [existingCompany] = await connection.execute(
        'SELECT id_perusahaan FROM perusahaan WHERE kip = ?',
        [data.kip]
      ) as mysql.RowDataPacket[][];
      
      if (existingCompany.length > 0) {
        // Update existing company
        companyId = existingCompany[0].id_perusahaan;
        
        await connection.execute(`
          UPDATE perusahaan SET
            nama_perusahaan = ?, badan_usaha = ?, alamat = ?, kec = ?, des = ?,
            kode_pos = ?, skala = ?, lok_perusahaan = ?, nama_kawasan = ?,
            lat = ?, lon = ?, jarak = ?, produk = ?, KBLI = ?,
            telp_perusahaan = ?, email_perusahaan = ?, web_perusahaan = ?,
            tkerja = ?, investasi = ?, omset = ?, nama_narasumber = ?,
            jbtn_narasumber = ?, email_narasumber = ?, telp_narasumber = ?,
            pcl_utama = ?, catatan = ?, updated_at = NOW()
          WHERE id_perusahaan = ?
        `, [
          data.nama_perusahaan, data.badan_usaha, data.alamat, data.kec, data.des,
          data.kode_pos, data.skala, data.lok_perusahaan, data.nama_kawasan,
          data.lat, data.lon, data.jarak, data.produk, data.KBLI,
          data.telp_perusahaan, data.email_perusahaan, data.web_perusahaan,
          data.tkerja, data.investasi, data.omset, data.nama_narasumber,
          data.jbtn_narasumber, data.email_narasumber, data.telp_narasumber,
          data.pcl_utama, data.catatan, companyId
        ]);
      } else {
        // Insert new company
        const [result] = await connection.execute(`
          INSERT INTO perusahaan (
            kip, nama_perusahaan, badan_usaha, alamat, kec, des, kode_pos,
            skala, lok_perusahaan, nama_kawasan, lat, lon, jarak, produk, KBLI,
            telp_perusahaan, email_perusahaan, web_perusahaan, tkerja, investasi,
            omset, nama_narasumber, jbtn_narasumber, email_narasumber,
            telp_narasumber, pcl_utama, catatan, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          data.kip, data.nama_perusahaan, data.badan_usaha, data.alamat, data.kec,
          data.des, data.kode_pos, data.skala, data.lok_perusahaan, data.nama_kawasan,
          data.lat, data.lon, data.jarak, data.produk, data.KBLI,
          data.telp_perusahaan, data.email_perusahaan, data.web_perusahaan,
          data.tkerja, data.investasi, data.omset, data.nama_narasumber,
          data.jbtn_narasumber, data.email_narasumber, data.telp_narasumber,
          data.pcl_utama, data.catatan
        ]) as mysql.ResultSetHeader[];
        
        companyId = result.insertId;
      }
    } else {
      // Insert new company (mode replace)
      const [result] = await connection.execute(`
        INSERT INTO perusahaan (
          kip, nama_perusahaan, badan_usaha, alamat, kec, des, kode_pos,
          skala, lok_perusahaan, nama_kawasan, lat, lon, jarak, produk, KBLI,
          telp_perusahaan, email_perusahaan, web_perusahaan, tkerja, investasi,
          omset, nama_narasumber, jbtn_narasumber, email_narasumber,
          telp_narasumber, pcl_utama, catatan, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        data.kip, data.nama_perusahaan, data.badan_usaha, data.alamat, data.kec,
        data.des, data.kode_pos, data.skala, data.lok_perusahaan, data.nama_kawasan,
        data.lat, data.lon, data.jarak, data.produk, data.KBLI,
        data.telp_perusahaan, data.email_perusahaan, data.web_perusahaan,
        data.tkerja, data.investasi, data.omset, data.nama_narasumber,
        data.jbtn_narasumber, data.email_narasumber, data.telp_narasumber,
        data.pcl_utama, data.catatan
      ]) as mysql.ResultSetHeader[];
      
      companyId = result.insertId;
    }

    // Handle tahun direktori
    if (mode === 'append') {
      // Remove existing years for this company
      await connection.execute(
        'DELETE FROM perusahaan_direktori WHERE id_perusahaan = ?',
        [companyId]
      );
    }

    // Insert tahun direktori
    for (const year of data.tahun_direktori) {
      await connection.execute(
        'INSERT INTO perusahaan_direktori (id_perusahaan, tahun_direktori) VALUES (?, ?)',
        [companyId, year]
      );
    }

    return companyId;
  } catch (error) {
    throw error;
  }
}

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    console.log('🔄 Starting direktori import process with FULL FIX...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as string || 'append';
    
    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'File tidak ditemukan'
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        message: 'Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv'
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: 'Ukuran file terlalu besar. Maksimal 10MB'
      }, { status: 400 });
    }

    console.log(`📁 Processing file: ${file.name}, size: ${file.size}, mode: ${mode}`);

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRowData[];

    if (jsonData.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'File Excel kosong atau tidak memiliki data'
      }, { status: 400 });
    }

    // ✅ PERBAIKAN: Validate headers dengan semua 28 kolom
    const requiredHeaders = [
      'KIP', 'Nama Perusahaan', 'Badan Usaha', 'Alamat', 'Kecamatan', 'Desa',
      'Kode Pos', 'Skala', 'Lokasi Perusahaan', 'Nama Kawasan', 'Latitude', 
      'Longitude', 'Jarak (KM)', 'Produk', 'KBLI', 'Telepon Perusahaan',
      'Email Perusahaan', 'Website Perusahaan', 'Tenaga Kerja', 'Investasi', 
      'Omset', 'Nama Narasumber', 'Jabatan Narasumber', 'Email Narasumber',
      'Telepon Narasumber', 'PCL Utama', 'Catatan', 'Tahun Direktori'
    ];

    const firstRow = jsonData[0];
    const actualHeaders = Object.keys(firstRow);
    const missingHeaders = requiredHeaders.filter(header => !actualHeaders.includes(header));

    // ✅ PERBAIKAN: Enhanced logging untuk debugging
    console.log('🔍 Header validation with FULL FIX:');
    console.log('Expected headers count:', requiredHeaders.length);
    console.log('Actual headers count:', actualHeaders.length);
    console.log('Expected headers:', requiredHeaders);
    console.log('Actual headers:', actualHeaders);
    console.log('Missing headers:', missingHeaders);

    if (missingHeaders.length > 0) {
      console.error('❌ Missing headers detected:', missingHeaders);
      
      return NextResponse.json({
        success: false,
        message: `Header yang diperlukan tidak ditemukan: ${missingHeaders.join(', ')}`,
        details: {
          expected_count: requiredHeaders.length,
          actual_count: actualHeaders.length,
          missing_headers: missingHeaders,
          expected_headers: requiredHeaders,
          actual_headers: actualHeaders
        }
      }, { status: 400 });
    }

    console.log(`📊 Processing ${jsonData.length} rows with enhanced validation`);

    // Create database connection
    connection = await createDbConnection();
    await connection.beginTransaction();

    // Process and validate data
    const validData: ProcessedData[] = [];
    const validationErrors: ValidationError[] = [];
    const duplicateData: DuplicateData[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const rowNumber = i + 2; // Excel row number (header = 1, data starts from 2)
      const rowData = jsonData[i];

      try {
        // Skip empty rows
        if (!rowData['KIP'] && !rowData['Nama Perusahaan']) {
          continue;
        }

        // Sanitize data
        const sanitizedData = sanitizeDirectoryData(rowData);

        // Map lookup values (kecamatan dan desa) - Kedua field ini WAJIB
        const kecamatanName = String(rowData['Kecamatan'] || '').trim();
        const desaName = String(rowData['Desa'] || '').trim();
        
        if (!kecamatanName) {
          validationErrors.push({
            row: rowNumber,
            field: 'Kecamatan',
            message: 'Kecamatan wajib diisi',
            value: rowData
          });
          continue;
        }
        
        if (!desaName) {
          validationErrors.push({
            row: rowNumber,
            field: 'Desa',
            message: 'Desa wajib diisi',
            value: rowData
          });
          continue;
        }

        const mappedData = await mapLookupValues(connection, sanitizedData, kecamatanName, desaName);

        // ✅ PERBAIKAN: Validate data dengan fokus pada 16 field wajib
        const errors = validateDirectoryData(mappedData);
        if (errors.length > 0) {
          errors.forEach(error => {
            validationErrors.push({
              row: rowNumber,
              field: 'validation',
              message: error,
              value: mappedData
            });
          });
          continue;
        }

        // Check for duplicates (only in append mode)
        if (mode === 'append') {
          const duplicates = await checkDuplicateKipAndYear(
            connection,
            mappedData.kip,
            mappedData.tahun_direktori
          );

          if (duplicates.length > 0) {
            duplicates.forEach(duplicate => {
              duplicate.row = rowNumber;
              duplicateData.push(duplicate);
            });
            continue;
          }
        }

        validData.push(mappedData);

      } catch (error) {
        validationErrors.push({
          row: rowNumber,
          field: 'processing',
          message: error instanceof Error ? error.message : 'Error tidak dikenal',
          value: rowData
        });
      }
    }

    // ✅ PERBAIKAN: Enhanced error reporting
    if (validationErrors.length > 0) {
      await connection.rollback();
      
      const errorMessage = validationErrors
        .slice(0, 10)
        .map(err => `Baris ${err.row}: ${err.message}`)
        .join('\n');

      const additionalInfo = validationErrors.length > 10 
        ? `\n\n... dan ${validationErrors.length - 10} error lainnya`
        : '';

      return NextResponse.json({
        success: false,
        message: 'Ditemukan error validasi data',
        details: errorMessage + additionalInfo,
        total_errors: validationErrors.length,
        errors: validationErrors.slice(0, 20), // Kirim maksimal 20 error untuk debugging
        error_summary: {
          total_rows_processed: jsonData.length,
          validation_errors: validationErrors.length,
          field_wajib_yang_harus_diisi: [
            'KIP', 'Nama Perusahaan', 'Alamat', 'Kecamatan', 'Desa', 
            'Badan Usaha', 'Lokasi Perusahaan', 'KBLI', 'Produk', 
            'Latitude', 'Longitude', 'Tenaga Kerja', 'Investasi', 
            'Omset', 'Skala', 'Tahun Direktori'
          ]
        }
      }, { status: 400 });
    }

    // Check for duplicate data (only show in append mode)
    if (mode === 'append' && duplicateData.length > 0) {
      await connection.rollback();
      
      const duplicateMessage = duplicateData
        .slice(0, 10)
        .map(dup => `Baris ${dup.row}: KIP ${dup.kip} dengan tahun ${dup.tahun_direktori.join(',')} sudah ada`)
        .join('\n');

      const additionalInfo = duplicateData.length > 10 
        ? `\n\n... dan ${duplicateData.length - 10} duplikasi lainnya`
        : '';

      return NextResponse.json({
        success: false,
        message: 'Ditemukan data duplikat',
        details: duplicateMessage + additionalInfo,
        total_duplicates: duplicateData.length,
        duplicates: duplicateData.slice(0, 20) // Kirim maksimal 20 duplikat untuk debugging
      }, { status: 400 });
    }

    if (validData.length === 0) {
      await connection.rollback();
      return NextResponse.json({
        success: false,
        message: 'Tidak ada data valid untuk diproses',
        details: 'Semua baris data memiliki error validasi atau duplikasi'
      }, { status: 400 });
    }

    // Clear existing data if replace mode
    if (mode === 'replace') {
      console.log('🗑️ Clearing existing data (replace mode)');
      await connection.execute('DELETE FROM perusahaan_direktori');
      await connection.execute('DELETE FROM perusahaan');
    }

    // Save data
    console.log(`💾 Saving ${validData.length} valid records with FULL FIX`);
    let insertedCount = 0;
    let updatedCount = 0;

    for (const data of validData) {
      try {
        const companyId = await saveCompanyData(connection, data, mode);
        
        if (mode === 'append') {
          // Check if it was an update or insert
          const [existing] = await connection.execute(
            'SELECT COUNT(*) as count FROM perusahaan WHERE id_perusahaan = ? AND created_at != updated_at',
            [companyId]
          ) as mysql.RowDataPacket[][];
          
          if (existing[0].count > 0) {
            updatedCount++;
          } else {
            insertedCount++;
          }
        } else {
          insertedCount++;
        }
      } catch (error) {
        console.error(`❌ Error saving data:`, error);
        throw error;
      }
    }

    await connection.commit();
    console.log('✅ Import completed successfully with FULL FIX');

    const result = {
      success: true,
      message: mode === 'replace' 
        ? `Berhasil mengganti semua data dengan ${insertedCount} data baru`
        : `Berhasil memproses ${insertedCount + updatedCount} data (${insertedCount} baru, ${updatedCount} diperbarui)`,
      inserted: insertedCount,
      updated: updatedCount,
      total_processed: validData.length,
      summary: {
        total_rows_in_file: jsonData.length,
        valid_data_processed: validData.length,
        validation_errors: validationErrors.length,
        duplicates_found: duplicateData.length,
        mode: mode,
        field_wajib_count: 16,
        field_opsional_count: 12
      }
    };

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('❌ Rollback error:', rollbackError);
      }
    }
    
    console.error('❌ Import error with FULL FIX:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan saat mengimpor data',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      } : undefined
    }, { status: 500 });
    
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('❌ Connection close error:', closeError);
      }
    }
  }
}