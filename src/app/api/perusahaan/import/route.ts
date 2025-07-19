// src/app/api/perusahaan/import/route.ts
// VERSI LENGKAP YANG SUDAH DIPERBAIKI - FINAL VERSION (FIXED)
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
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

// Interfaces
interface ExcelRowData {
  [key: string]: string | number | null | undefined;
}

interface ProcessedData {
  kip: string;
  nama_perusahaan: string;
  badan_usaha: number;
  alamat: string;
  kec: number;
  des: number;
  kode_pos: string | null;
  skala: string;
  lok_perusahaan: number;
  nama_kawasan: string | null;
  lat: number;
  lon: number;
  jarak: number | null;
  produk: string;
  KBLI: number;
  telp_perusahaan: string | null;
  email_perusahaan: string | null;
  web_perusahaan: string | null;
  tkerja: number;
  investasi: number;
  omset: number;
  nama_narasumber: string | null;
  jbtn_narasumber: string | null;
  email_narasumber: string | null;
  telp_narasumber: string | null;
  pcl_utama: string | null;
  catatan: string | null;
  tahun_direktori: number[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: unknown;
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

// ✅ Fungsi debug untuk melihat struktur database
async function debugDatabaseStructure(connection: mysql.Connection) {
  try {
    console.log('🔍 DEBUG: Checking database structure...');
    
    // Check kecamatan table structure
    const [kecStructure] = await connection.execute('DESCRIBE kecamatan') as mysql.RowDataPacket[][];
    console.log('📋 Kecamatan table structure:', kecStructure);
    
    // Check desa table structure  
    const [desaStructure] = await connection.execute('DESCRIBE desa') as mysql.RowDataPacket[][];
    console.log('📋 Desa table structure:', desaStructure);
    
    // Check sample data from kecamatan
    const [kecSample] = await connection.execute('SELECT id_kec, kode_kec, nama_kec FROM kecamatan LIMIT 3') as mysql.RowDataPacket[][];
    console.log('📊 Kecamatan sample data:', kecSample);
    
    // Check sample data from desa
    const [desaSample] = await connection.execute('SELECT id_des, kode_des, nama_des, kode_kec FROM desa LIMIT 3') as mysql.RowDataPacket[][];
    console.log('📊 Desa sample data:', desaSample);
    
    // Check if "Gedangan" exists in kecamatan
    const [gedanganKec] = await connection.execute('SELECT id_kec, kode_kec, nama_kec FROM kecamatan WHERE nama_kec LIKE "%Gedangan%"') as mysql.RowDataPacket[][];
    console.log('🔍 Gedangan in kecamatan:', gedanganKec);
    
    // Check if "Gedangan" exists in desa  
    const [gedanganDesa] = await connection.execute('SELECT id_des, kode_des, nama_des, kode_kec FROM desa WHERE nama_des LIKE "%Gedangan%"') as mysql.RowDataPacket[][];
    console.log('🔍 Gedangan in desa:', gedanganDesa);
    
  } catch (error) {
    console.error('❌ Error in debug function:', error);
  }
}

// ✅ Fungsi sanitasi data - handle semua 28 field dengan benar
function sanitizeDirectoryData(rawData: ExcelRowData): ProcessedData {
  // Parse tahun direktori dari string "2024,2025" atau "2024"
  let tahunDirektori: number[] = [];
  if (rawData['Tahun Direktori']) {
    const tahunStr = String(rawData['Tahun Direktori']).trim();
    if (tahunStr) {
      tahunDirektori = tahunStr.split(',').map(t => parseInt(t.trim())).filter(t => !isNaN(t));
    }
  }

  return {
    kip: String(rawData['KIP'] || '').trim(),
    nama_perusahaan: String(rawData['Nama Perusahaan'] || '').trim(),
    badan_usaha: parseInt(String(rawData['Badan Usaha'] || '1')),
    alamat: String(rawData['Alamat'] || '').trim(),
    kec: 0, // Will be mapped later based on kecamatan name
    des: 0, // Will be mapped later based on desa name
    kode_pos: rawData['Kode Pos'] ? String(rawData['Kode Pos']).trim() : null, // ✅ PERBAIKAN: undefined → null
    skala: String(rawData['Skala'] || '').trim(),
    lok_perusahaan: parseInt(String(rawData['Lokasi Perusahaan'] || '1')),
    nama_kawasan: rawData['Nama Kawasan'] ? String(rawData['Nama Kawasan']).trim() : null, // ✅ PERBAIKAN: undefined → null
    lat: Number(rawData['Latitude']),
    lon: Number(rawData['Longitude']),
    jarak: rawData['Jarak (KM)'] ? Number(rawData['Jarak (KM)']) : null, // ✅ PERBAIKAN: undefined → null
    produk: String(rawData['Produk'] || '').trim(),
    KBLI: Number(rawData['KBLI']),
    telp_perusahaan: rawData['Telepon Perusahaan'] ? String(rawData['Telepon Perusahaan']).trim() : null, // ✅ PERBAIKAN: undefined → null
    email_perusahaan: rawData['Email Perusahaan'] ? String(rawData['Email Perusahaan']).trim() : null, // ✅ PERBAIKAN: undefined → null
    web_perusahaan: rawData['Website Perusahaan'] ? String(rawData['Website Perusahaan']).trim() : null, // ✅ PERBAIKAN: undefined → null
    tkerja: parseInt(String(rawData['Tenaga Kerja'] || '1')),
    investasi: parseInt(String(rawData['Investasi'] || '1')),
    omset: parseInt(String(rawData['Omset'] || '1')),
    nama_narasumber: rawData['Nama Narasumber'] ? String(rawData['Nama Narasumber']).trim() : null, // ✅ PERBAIKAN: undefined → null
    jbtn_narasumber: rawData['Jabatan Narasumber'] ? String(rawData['Jabatan Narasumber']).trim() : null, // ✅ PERBAIKAN: undefined → null
    email_narasumber: rawData['Email Narasumber'] ? String(rawData['Email Narasumber']).trim() : null, // ✅ PERBAIKAN: undefined → null
    telp_narasumber: rawData['Telepon Narasumber'] ? String(rawData['Telepon Narasumber']).trim() : null, // ✅ PERBAIKAN: undefined → null
    pcl_utama: rawData['PCL Utama'] ? String(rawData['PCL Utama']).trim() : null, // ✅ PERBAIKAN: undefined → null
    catatan: rawData['Catatan'] ? String(rawData['Catatan']).trim() : null, // ✅ PERBAIKAN: undefined → null
    tahun_direktori: tahunDirektori
  };
}

// ✅ Fungsi untuk mapping lookup values (kecamatan dan desa) - PERBAIKAN FINAL
async function mapLookupValues(connection: mysql.Connection, data: ProcessedData, kecamatanName: string, desaName: string) {
  try {
    console.log(`🔍 Mapping kecamatan: "${kecamatanName}" dan desa: "${desaName}"`);
    
    // STEP 1: Cari kecamatan berdasarkan nama
    const [kecRows] = await connection.execute(
      'SELECT id_kec, kode_kec FROM kecamatan WHERE nama_kec = ?',
      [kecamatanName.trim()]
    ) as mysql.RowDataPacket[][];
    
    if (kecRows.length === 0) {
      // Jika tidak ditemukan, coba cari dengan case insensitive
      const [kecRowsInsensitive] = await connection.execute(
        'SELECT id_kec, kode_kec, nama_kec FROM kecamatan WHERE LOWER(nama_kec) = LOWER(?)',
        [kecamatanName.trim()]
      ) as mysql.RowDataPacket[][];
      
      if (kecRowsInsensitive.length === 0) {
        throw new Error(`Kecamatan '${kecamatanName}' tidak ditemukan dalam database`);
      }
      
      data.kec = kecRowsInsensitive[0].kode_kec; // PERBAIKAN: gunakan kode_kec untuk foreign key
      console.log(`✅ Kecamatan "${kecamatanName}" found with case-insensitive search: ${kecRowsInsensitive[0].nama_kec} (kode_kec: ${data.kec})`);
    } else {
      data.kec = kecRows[0].kode_kec; // PERBAIKAN: gunakan kode_kec untuk foreign key
      console.log(`✅ Kecamatan "${kecamatanName}" mapped to kode_kec: ${data.kec}`);
    }

    // STEP 2: Cari desa berdasarkan nama dan kode_kec (sesuai dengan query di src/app/api/desa/route.ts)
    const [desRows] = await connection.execute(
      'SELECT id_des, kode_des FROM desa WHERE nama_des = ? AND kode_kec = ?',
      [desaName.trim(), data.kec]
    ) as mysql.RowDataPacket[][];
    
    if (desRows.length === 0) {
      // Jika tidak ditemukan, coba dengan case insensitive
      const [desRowsInsensitive] = await connection.execute(
        'SELECT id_des, kode_des, nama_des FROM desa WHERE LOWER(nama_des) = LOWER(?) AND kode_kec = ?',
        [desaName.trim(), data.kec]
      ) as mysql.RowDataPacket[][];
      
      if (desRowsInsensitive.length === 0) {
        throw new Error(`Desa '${desaName}' tidak ditemukan dalam kecamatan '${kecamatanName}' (kode_kec: ${data.kec})`);
      }
      
      data.des = desRowsInsensitive[0].kode_des; // PERBAIKAN: gunakan kode_des untuk foreign key
      console.log(`✅ Desa "${desaName}" found with case-insensitive search: ${desRowsInsensitive[0].nama_des} (kode_des: ${data.des})`);
    } else {
      data.des = desRows[0].kode_des; // PERBAIKAN: gunakan kode_des untuk foreign key
      console.log(`✅ Desa "${desaName}" mapped to kode_des: ${data.des}`);
    }

    return data;
  } catch (error) {
    console.error(`❌ Error mapping kecamatan/desa:`, error);
    throw error;
  }
}

// ✅ Fungsi validasi data yang lebih komprehensif
function validateDirectoryData(data: ProcessedData): string[] {
  const errors: string[] = [];

  // ========== VALIDASI 16 FIELD WAJIB ==========
  
  // 1. Validasi KIP (WAJIB)
  if (!data.kip || data.kip.trim() === '') {
    errors.push("KIP wajib diisi");
  }

  // 2. Validasi Nama Perusahaan (WAJIB)
  if (!data.nama_perusahaan || data.nama_perusahaan.trim() === '') {
    errors.push("Nama Perusahaan wajib diisi");
  }

  // 3. Validasi Alamat (WAJIB)
  if (!data.alamat || data.alamat.trim() === '') {
    errors.push("Alamat wajib diisi");
  }

  // 4. Validasi Badan Usaha (WAJIB)
  if (!data.badan_usaha || isNaN(data.badan_usaha) || data.badan_usaha < 1 || data.badan_usaha > 10) {
    errors.push("Badan Usaha harus berupa angka 1-10");
  }

  // 5. Validasi Lokasi Perusahaan (WAJIB)
  if (!data.lok_perusahaan || isNaN(data.lok_perusahaan) || data.lok_perusahaan < 1 || data.lok_perusahaan > 5) {
    errors.push("Lokasi Perusahaan harus berupa angka 1-5");
  }

  // 6. Validasi KBLI (WAJIB)
  if (!data.KBLI || isNaN(data.KBLI) || data.KBLI < 10000 || data.KBLI > 99999) {
    errors.push("KBLI harus berupa angka 5 digit (10000-99999)");
  }

  // 7. Validasi Produk (WAJIB)
  if (!data.produk || data.produk.trim() === '') {
    errors.push("Produk wajib diisi");
  }

  // 8. Validasi Latitude (WAJIB)
  if (isNaN(data.lat) || data.lat < -90 || data.lat > 90) {
    errors.push("Latitude harus berupa angka antara -90 sampai 90");
  }

  // 9. Validasi Longitude (WAJIB)
  if (isNaN(data.lon) || data.lon < -180 || data.lon > 180) {
    errors.push("Longitude harus berupa angka antara -180 sampai 180");
  }

  // 10. Validasi Tenaga Kerja (WAJIB)
  if (!data.tkerja || isNaN(data.tkerja) || data.tkerja < 1 || data.tkerja > 4) {
    errors.push("Tenaga Kerja harus berupa angka 1-4");
  }

  // 11. Validasi Investasi (WAJIB)
  if (!data.investasi || isNaN(data.investasi) || data.investasi < 1 || data.investasi > 4) {
    errors.push("Investasi harus berupa angka 1-4");
  }

  // 12. Validasi Omset (WAJIB)
  if (!data.omset || isNaN(data.omset) || data.omset < 1 || data.omset > 4) {
    errors.push("Omset harus berupa angka 1-4");
  }

  // 13. Validasi Skala (WAJIB)
  if (!data.skala || data.skala.trim() === '') {
    errors.push("Skala wajib diisi");
  } else if (!['Besar', 'Sedang'].includes(data.skala)) {
    errors.push("Skala harus 'Besar' atau 'Sedang'");
  }

  // 14. Validasi Kecamatan (WAJIB - handled in lookup)
  if (!data.kec || data.kec === 0) {
    errors.push("Kecamatan tidak ditemukan dalam database");
  }

  // 15. Validasi Desa (WAJIB - handled in lookup) 
  if (!data.des || data.des === 0) {
    errors.push("Desa tidak ditemukan dalam database");
  }

  // 16. Validasi Tahun Direktori (WAJIB)
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
  if (data.jarak !== null && data.jarak !== undefined && (isNaN(data.jarak) || data.jarak < 0)) {
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

// Function to check duplicate KIP and year combinations - PERBAIKAN
async function checkDuplicateKipAndYear(connection: mysql.Connection, kip: string, years: number[]): Promise<DuplicateData[]> {
  const duplicates: DuplicateData[] = [];
  
  try {
    for (const year of years) {
      const [existingRows] = await connection.execute(`
        SELECT p.id_perusahaan, p.nama_perusahaan, p.kip 
        FROM perusahaan p
        JOIN direktori d ON p.id_perusahaan = d.id_perusahaan
        WHERE p.kip = ? AND d.thn_direktori = ?
      `, [kip, year]) as mysql.RowDataPacket[][];

      if (existingRows.length > 0) {
        duplicates.push({
          row: 0, // Will be set later
          kip: kip,
          tahun_direktori: [year],
          existing_company: {
            id_perusahaan: existingRows[0].id_perusahaan,
            nama_perusahaan: existingRows[0].nama_perusahaan
          }
        });
      }
    }
    
    return duplicates;
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return [];
  }
}

// Function to save or update company data
async function saveCompanyData(connection: mysql.Connection, data: ProcessedData, mode: string) {
  try {
    let companyId: number;

    if (mode === 'replace') {
      // Insert new company - PERBAIKAN: hapus created_at dan updated_at
      const [result] = await connection.execute(`
        INSERT INTO perusahaan (
          kip, nama_perusahaan, badan_usaha, alamat, kec, des, kode_pos, skala, 
          lok_perusahaan, nama_kawasan, lat, lon, jarak, produk, KBLI,
          telp_perusahaan, email_perusahaan, web_perusahaan, tkerja, investasi,
          omset, nama_narasumber, jbtn_narasumber, email_narasumber,
          telp_narasumber, pcl_utama, catatan
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    } else {
      // Check if company exists
      const [existingCompany] = await connection.execute(
        'SELECT id_perusahaan FROM perusahaan WHERE kip = ?',
        [data.kip]
      ) as mysql.RowDataPacket[][];

      if (existingCompany.length > 0) {
        // Update existing company - PERBAIKAN: hapus updated_at
        companyId = existingCompany[0].id_perusahaan;
        await connection.execute(`
          UPDATE perusahaan SET 
            nama_perusahaan = ?, badan_usaha = ?, alamat = ?, kec = ?, des = ?, 
            kode_pos = ?, skala = ?, lok_perusahaan = ?, nama_kawasan = ?, 
            lat = ?, lon = ?, jarak = ?, produk = ?, KBLI = ?,
            telp_perusahaan = ?, email_perusahaan = ?, web_perusahaan = ?, 
            tkerja = ?, investasi = ?, omset = ?, nama_narasumber = ?, 
            jbtn_narasumber = ?, email_narasumber = ?, telp_narasumber = ?, 
            pcl_utama = ?, catatan = ?
          WHERE id_perusahaan = ?
        `, [
          data.nama_perusahaan, data.badan_usaha, data.alamat, data.kec, data.des,
          data.kode_pos, data.skala, data.lok_perusahaan, data.nama_kawasan,
          data.lat, data.lon, data.jarak || 0, data.produk, data.KBLI,
          data.telp_perusahaan, data.email_perusahaan, data.web_perusahaan,
          data.tkerja, data.investasi, data.omset, data.nama_narasumber,
          data.jbtn_narasumber, data.email_narasumber, data.telp_narasumber,
          data.pcl_utama, data.catatan, companyId
        ]);
      } else {
        // Insert new company - PERBAIKAN: hapus created_at dan updated_at
        const [result] = await connection.execute(`
          INSERT INTO perusahaan (
            kip, nama_perusahaan, badan_usaha, alamat, kec, des, kode_pos, skala, 
            lok_perusahaan, nama_kawasan, lat, lon, jarak, produk, KBLI,
            telp_perusahaan, email_perusahaan, web_perusahaan, tkerja, investasi,
            omset, nama_narasumber, jbtn_narasumber, email_narasumber,
            telp_narasumber, pcl_utama, catatan
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          data.kip, data.nama_perusahaan, data.badan_usaha, data.alamat, data.kec,
          data.des, data.kode_pos, data.skala, data.lok_perusahaan, data.nama_kawasan,
          data.lat, data.lon, data.jarak || 0, data.produk, data.KBLI,
          data.telp_perusahaan, data.email_perusahaan, data.web_perusahaan,
          data.tkerja, data.investasi, data.omset, data.nama_narasumber,
          data.jbtn_narasumber, data.email_narasumber, data.telp_narasumber,
          data.pcl_utama, data.catatan
        ]) as mysql.ResultSetHeader[];
        
        companyId = result.insertId;
      }
    }

    // Handle tahun direktori - PERBAIKAN: gunakan tabel dan kolom yang benar
    if (mode === 'append') {
      // Remove existing years for this company
      await connection.execute(
        'DELETE FROM direktori WHERE id_perusahaan = ?',
        [companyId]
      );
    }

    // Insert tahun direktori - PERBAIKAN: gunakan tabel direktori dengan kolom thn_direktori
    for (const year of data.tahun_direktori) {
      await connection.execute(
        'INSERT INTO direktori (id_perusahaan, thn_direktori) VALUES (?, ?)',
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
  const startTime = Date.now();
  
  try {
    console.log('🔄 Starting direktori import process with COMPLETE FIX...');
    
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

    // Connect to database
    connection = await createDbConnection();
    await connection.beginTransaction();

    // ✅ DEBUG: Check database structure first
    await debugDatabaseStructure(connection);

    // Process file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Processing ${jsonData.length} rows from Excel file...`);

    if (jsonData.length === 0) {
      await connection.rollback();
      return NextResponse.json({
        success: false,
        message: 'File Excel kosong atau tidak memiliki data'
      }, { status: 400 });
    }

    // Clear all data if replace mode - PERBAIKAN: gunakan tabel yang benar
    if (mode === 'replace') {
      console.log('🗑️ Clearing all existing data (replace mode)...');
      await connection.execute('DELETE FROM direktori');
      await connection.execute('DELETE FROM perusahaan');
      await connection.execute('ALTER TABLE perusahaan AUTO_INCREMENT = 1');
      await connection.execute('ALTER TABLE direktori AUTO_INCREMENT = 1');
    }

    // Process each row
    const validationErrors: ValidationError[] = [];
    const duplicateErrors: DuplicateData[] = [];
    const processedData: ProcessedData[] = [];
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let totalYears = 0;

    console.log('📋 Starting row-by-row processing...');

    for (let i = 0; i < jsonData.length; i++) {
      const rowIndex = i + 2; // Excel row number (starting from 2, after header)
      console.log(`🔄 Processing row ${rowIndex}/${jsonData.length + 1}`);
      
      try {
        const rawData = jsonData[i] as ExcelRowData;
        
        // Extract names for mapping
        const kecamatanName = String(rawData['Kecamatan'] || '').trim();
        const desaName = String(rawData['Desa'] || '').trim();
        
        console.log(`📍 Row ${rowIndex}: Kecamatan="${kecamatanName}", Desa="${desaName}"`);
        
        if (!kecamatanName || !desaName) {
          validationErrors.push({
            row: rowIndex,
            field: 'Kecamatan/Desa',
            message: 'Kecamatan dan Desa wajib diisi',
            value: { kecamatan: kecamatanName, desa: desaName }
          });
          continue;
        }

        // Sanitize and process data
        const data = sanitizeDirectoryData(rawData);
        
        // Map kecamatan and desa names to IDs
        try {
          await mapLookupValues(connection, data, kecamatanName, desaName);
        } catch (mappingError) {
          const mappingErrorMessage = mappingError instanceof Error ? mappingError.message : "Unknown mapping error";
          validationErrors.push({
            row: rowIndex,
            field: 'Mapping Error',
            message: mappingErrorMessage,
            value: { kecamatan: kecamatanName, desa: desaName }
          });
          continue;
        }

        // Validate processed data
        const errors = validateDirectoryData(data);
        if (errors.length > 0) {
          errors.forEach(error => {
            validationErrors.push({
              row: rowIndex,
              field: 'Validation',
              message: error,
              value: data.kip
            });
          });
          continue;
        }

        // Check for duplicates (only in append mode)
        if (mode === 'append') {
          const duplicates = await checkDuplicateKipAndYear(connection, data.kip, data.tahun_direktori);
          if (duplicates.length > 0) {
            duplicates.forEach(dup => {
              duplicateErrors.push({
                ...dup,
                row: rowIndex
              });
            });
            skipped++;
            console.log(`⏭️ Row ${rowIndex} skipped due to duplicates`);
            continue;
          }
        }

        // PERBAIKAN: Cek apakah perusahaan sudah ada SEBELUM menyimpan
        const [existingCompanyCheck] = await connection.execute(
          'SELECT id_perusahaan FROM perusahaan WHERE kip = ?',
          [data.kip]
        ) as mysql.RowDataPacket[][];

        const isExistingCompany = existingCompanyCheck.length > 0;

        // Save data (HANYA SEKALI!)
        console.log(`💾 Saving data for row ${rowIndex}: ${data.nama_perusahaan}`);
        await saveCompanyData(connection, data, mode);
        totalYears += data.tahun_direktori.length;

        // PERBAIKAN: Hitung berdasarkan kondisi yang tepat
        if (mode === 'replace') {
          // Dalam mode replace, semua adalah inserted (karena data sudah dihapus di awal)
          inserted++;
          console.log(`✅ Row ${rowIndex}: INSERTED (replace mode) - total inserted: ${inserted}`);
        } else {
          // Dalam mode append, cek apakah ini perusahaan baru atau update
          if (isExistingCompany) {
            updated++;
            console.log(`✅ Row ${rowIndex}: UPDATED existing company - total updated: ${updated}`);
          } else {
            inserted++;
            console.log(`✅ Row ${rowIndex}: INSERTED new company - total inserted: ${inserted}`);
          }
        }

        processedData.push(data);
        
      } catch (rowError) {
        const rowErrorMessage = rowError instanceof Error ? rowError.message : "Unknown row processing error";
        console.error(`❌ Error processing row ${rowIndex}:`, rowError);
        validationErrors.push({
          row: rowIndex,
          field: 'Processing Error',
          message: rowErrorMessage,
          value: null
        });
      }
    }

    // PERBAIKAN: Tambahkan logging untuk debug
    const totalProcessed = inserted + updated;
    console.log(`📊 FINAL COUNTS:`);
    console.log(`   - Inserted: ${inserted}`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log(`   - Total Processed: ${totalProcessed}`);
    console.log(`   - Total Years: ${totalYears}`);
    console.log(`   - Validation Errors: ${validationErrors.length}`);
    console.log(`   - Duplicate Errors: ${duplicateErrors.length}`);

    // Final validation check
    const hasErrors = validationErrors.length > 0;
    const hasDuplicates = duplicateErrors.length > 0;

    if (hasErrors || (mode === 'append' && hasDuplicates && totalProcessed === 0)) {
      await connection.rollback();
      
      let errorMessage = '';
      if (hasErrors) {
        errorMessage += `❌ ${validationErrors.length} error validasi ditemukan:\n`;
        validationErrors.slice(0, 5).forEach(error => {
          errorMessage += `• Baris ${error.row}: ${error.message}\n`;
        });
        if (validationErrors.length > 5) {
          errorMessage += `• ... dan ${validationErrors.length - 5} error lainnya\n`;
        }
      }
      
      if (hasDuplicates) {
        errorMessage += `\n⚠️ ${duplicateErrors.length} duplikasi KIP & tahun ditemukan:\n`;
        duplicateErrors.slice(0, 3).forEach(dup => {
          errorMessage += `• Baris ${dup.row}: KIP ${dup.kip} tahun ${dup.tahun_direktori.join(',')}\n`;
        });
        if (duplicateErrors.length > 3) {
          errorMessage += `• ... dan ${duplicateErrors.length - 3} duplikasi lainnya\n`;
        }
      }

      return NextResponse.json({
        success: false,
        message: errorMessage,
        details: {
          validationErrors,
          duplicateErrors,
          totalRows: jsonData.length,
          processedRows: totalProcessed
        }
      }, { status: 400 });
    }

    // Commit transaction
    await connection.commit();
    const processingTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;

    console.log('✅ Import completed successfully!');
    console.log(`📊 Summary: ${inserted} inserted, ${updated} updated, ${skipped} skipped, ${totalYears} total years`);

    // PERBAIKAN: Response structure yang konsisten
    return NextResponse.json({
      success: true,
      message: mode === 'replace' 
        ? `Berhasil mengganti semua data dengan ${totalProcessed} perusahaan baru`
        : `Berhasil memproses ${totalProcessed} perusahaan (${inserted} baru, ${updated} diperbarui)`,
      data: {
        // Properti utama yang digunakan frontend
        inserted: inserted,
        updated: updated,
        totalProcessed: totalProcessed,
        
        // Properti tambahan untuk informasi detail  
        skipped: skipped,
        totalYears: totalYears,
        duplicateErrors: duplicateErrors.length,
        validationErrors: validationErrors.length,
        
        // Metadata
        totalRows: jsonData.length,
        validRows: processedData.length,
        processingTime: processingTime,
        mode: mode
      }
    });

  } catch (error) {
    console.error('❌ Fatal error in import process:', error);
    
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('❌ Error rolling back transaction:', rollbackError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json({
      success: false,
      message: `Error dalam proses import: ${errorMessage}`,
      error: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });

  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('🔌 Database connection closed');
      } catch (closeError) {
        console.error('❌ Error closing connection:', closeError);
      }
    }
  }
}