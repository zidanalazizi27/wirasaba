// src/app/api/perusahaan/import/route.ts
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

// Interface untuk data Excel yang akan diimport
interface ExcelRowData {
  kip?: string;
  nama_perusahaan: string;
  badan_usaha?: string;
  alamat?: string;
  kec?: string;
  des?: string;
  kode_pos?: string;
  skala?: string;
  lok_perusahaan?: string;
  nama_kawasan?: string;
  lat?: number;
  lon?: number;
  jarak?: string;
  produk?: string;
  KBLI?: string;
  telp_perusahaan?: string;
  email_perusahaan?: string;
  web_perusahaan?: string;
  tkerja?: string;
  investasi?: string;
  omset?: string;
  nama_narasumber?: string;
  jbtn_narasumber?: string;
  email_narasumber?: string;
  telp_narasumber?: string;
  pcl_utama?: string;
  catatan?: string;
  thn_direktori?: string; // Format: "2023,2024,2025"
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

interface ImportStats {
  total: number;
  inserted: number;
  updated: number;
  errors: number;
  errorDetails: ValidationError[];
}

// Fungsi untuk membersihkan dan memvalidasi data
function cleanAndValidateData(rawData: any[], headers: string[]): { 
  validData: ExcelRowData[], 
  errors: ValidationError[] 
} {
  const validData: ExcelRowData[] = [];
  const errors: ValidationError[] = [];

  rawData.forEach((row: any[], index: number) => {
    const rowNumber = index + 2; // +2 karena index mulai dari 0 dan kita skip header
    const rowData: any = {};

    // Map headers ke data
    headers.forEach((header, headerIndex) => {
      const cleanHeader = header.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w_]/g, ''); // Remove special characters
      rowData[cleanHeader] = row[headerIndex];
    });

    // Validasi field wajib
    if (!rowData.nama_perusahaan || rowData.nama_perusahaan.toString().trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'nama_perusahaan',
        message: 'Nama perusahaan tidak boleh kosong',
        value: rowData.nama_perusahaan
      });
      return; // Skip row ini jika nama perusahaan kosong
    }

    if (!rowData.skala || rowData.skala.toString().trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'skala',
        message: 'Skala tidak boleh kosong',
        value: rowData.skala
      });
      return; // Skip row ini jika skala kosong
    }

    // Validasi format email jika ada
    if (rowData.email_perusahaan && rowData.email_perusahaan.toString().trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rowData.email_perusahaan.toString())) {
        errors.push({
          row: rowNumber,
          field: 'email_perusahaan',
          message: 'Format email tidak valid',
          value: rowData.email_perusahaan
        });
      }
    }

    // Validasi koordinat jika ada
    if (rowData.lat && rowData.lat !== '') {
      const lat = parseFloat(rowData.lat);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push({
          row: rowNumber,
          field: 'lat',
          message: 'Latitude harus berupa angka antara -90 sampai 90',
          value: rowData.lat
        });
      } else {
        rowData.lat = lat;
      }
    }

    if (rowData.lon && rowData.lon !== '') {
      const lon = parseFloat(rowData.lon);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        errors.push({
          row: rowNumber,
          field: 'lon',
          message: 'Longitude harus berupa angka antara -180 sampai 180',
          value: rowData.lon
        });
      } else {
        rowData.lon = lon;
      }
    }

    // Validasi format tahun direktori
    if (rowData.thn_direktori && rowData.thn_direktori.toString().trim() !== '') {
      const yearString = rowData.thn_direktori.toString();
      const years = yearString.split(',').map(y => y.trim());
      const invalidYears = years.filter(year => {
        const yearNum = parseInt(year);
        return isNaN(yearNum) || yearNum < 1900 || yearNum > 2100;
      });
      
      if (invalidYears.length > 0) {
        errors.push({
          row: rowNumber,
          field: 'thn_direktori',
          message: `Format tahun tidak valid: ${invalidYears.join(', ')}. Gunakan format: 2023,2024,2025`,
          value: rowData.thn_direktori
        });
      }
    }

    // Bersihkan data dan set nilai default
    const cleanedData: ExcelRowData = {
      kip: rowData.kip?.toString().trim() || null,
      nama_perusahaan: rowData.nama_perusahaan.toString().trim(),
      badan_usaha: rowData.badan_usaha?.toString().trim() || null,
      alamat: rowData.alamat?.toString().trim() || null,
      kec: rowData.kec?.toString().trim() || null,
      des: rowData.des?.toString().trim() || null,
      kode_pos: rowData.kode_pos?.toString().trim() || null,
      skala: rowData.skala.toString().trim(),
      lok_perusahaan: rowData.lok_perusahaan?.toString().trim() || null,
      nama_kawasan: rowData.nama_kawasan?.toString().trim() || null,
      lat: rowData.lat || null,
      lon: rowData.lon || null,
      jarak: rowData.jarak?.toString().trim() || null,
      produk: rowData.produk?.toString().trim() || null,
      KBLI: rowData.KBLI?.toString().trim() || rowData.kbli?.toString().trim() || null,
      telp_perusahaan: rowData.telp_perusahaan?.toString().trim() || null,
      email_perusahaan: rowData.email_perusahaan?.toString().trim() || null,
      web_perusahaan: rowData.web_perusahaan?.toString().trim() || null,
      tkerja: rowData.tkerja?.toString().trim() || null,
      investasi: rowData.investasi?.toString().trim() || null,
      omset: rowData.omset?.toString().trim() || null,
      nama_narasumber: rowData.nama_narasumber?.toString().trim() || null,
      jbtn_narasumber: rowData.jbtn_narasumber?.toString().trim() || null,
      email_narasumber: rowData.email_narasumber?.toString().trim() || null,
      telp_narasumber: rowData.telp_narasumber?.toString().trim() || null,
      pcl_utama: rowData.pcl_utama?.toString().trim() || null,
      catatan: rowData.catatan?.toString().trim() || null,
      thn_direktori: rowData.thn_direktori?.toString().trim() || null
    };

    validData.push(cleanedData);
  });

  return { validData, errors };
}

// Fungsi untuk cek duplikasi
async function checkExistingData(connection: mysql.Connection, data: ExcelRowData[]): Promise<{
  duplicates: Array<{ kip?: string; nama_perusahaan: string; id_perusahaan: number }>,
  existing: Map<string, number>
}> {
  const duplicates: Array<{ kip?: string; nama_perusahaan: string; id_perusahaan: number }> = [];
  const existing = new Map<string, number>();

  // Cek berdasarkan KIP dan nama perusahaan
  const kips = data.filter(d => d.kip).map(d => d.kip);
  const names = data.map(d => d.nama_perusahaan);

  if (kips.length > 0) {
    const [kipResults] = await connection.execute(
      `SELECT id_perusahaan, kip, nama_perusahaan FROM perusahaan WHERE kip IN (${kips.map(() => '?').join(',')})`,
      kips
    );
    
    (kipResults as any[]).forEach(row => {
      duplicates.push(row);
      existing.set(`kip:${row.kip}`, row.id_perusahaan);
    });
  }

  const [nameResults] = await connection.execute(
    `SELECT id_perusahaan, kip, nama_perusahaan FROM perusahaan WHERE nama_perusahaan IN (${names.map(() => '?').join(',')})`,
    names
  );

  (nameResults as any[]).forEach(row => {
    if (!existing.has(`kip:${row.kip}`)) { // Jangan duplikasi jika sudah ada dari KIP check
      duplicates.push(row);
      existing.set(`nama:${row.nama_perusahaan}`, row.id_perusahaan);
    }
  });

  return { duplicates, existing };
}

// Fungsi untuk insert atau update data perusahaan
async function insertOrUpdatePerusahaan(
  connection: mysql.Connection, 
  data: ExcelRowData, 
  existingId?: number
): Promise<number> {
  if (existingId) {
    // Update existing data
    await connection.execute(
      `UPDATE perusahaan SET 
        kip = ?, nama_perusahaan = ?, badan_usaha = ?, alamat = ?, kec = ?, des = ?, 
        kode_pos = ?, skala = ?, lok_perusahaan = ?, nama_kawasan = ?, lat = ?, lon = ?, 
        jarak = ?, produk = ?, KBLI = ?, telp_perusahaan = ?, email_perusahaan = ?, 
        web_perusahaan = ?, tkerja = ?, investasi = ?, omset = ?, nama_narasumber = ?, 
        jbtn_narasumber = ?, email_narasumber = ?, telp_narasumber = ?, pcl_utama = ?, catatan = ?
       WHERE id_perusahaan = ?`,
      [
        data.kip, data.nama_perusahaan, data.badan_usaha, data.alamat, data.kec, data.des,
        data.kode_pos, data.skala, data.lok_perusahaan, data.nama_kawasan, data.lat, data.lon,
        data.jarak, data.produk, data.KBLI, data.telp_perusahaan, data.email_perusahaan,
        data.web_perusahaan, data.tkerja, data.investasi, data.omset, data.nama_narasumber,
        data.jbtn_narasumber, data.email_narasumber, data.telp_narasumber, data.pcl_utama, data.catatan,
        existingId
      ]
    );
    return existingId;
  } else {
    // Insert new data
    const [result] = await connection.execute(
      `INSERT INTO perusahaan (
        kip, nama_perusahaan, badan_usaha, alamat, kec, des, 
        kode_pos, skala, lok_perusahaan, nama_kawasan, lat, lon, 
        jarak, produk, KBLI, telp_perusahaan, email_perusahaan, 
        web_perusahaan, tkerja, investasi, omset, nama_narasumber, 
        jbtn_narasumber, email_narasumber, telp_narasumber, pcl_utama, catatan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.kip, data.nama_perusahaan, data.badan_usaha, data.alamat, data.kec, data.des,
        data.kode_pos, data.skala, data.lok_perusahaan, data.nama_kawasan, data.lat, data.lon,
        data.jarak, data.produk, data.KBLI, data.telp_perusahaan, data.email_perusahaan,
        data.web_perusahaan, data.tkerja, data.investasi, data.omset, data.nama_narasumber,
        data.jbtn_narasumber, data.email_narasumber, data.telp_narasumber, data.pcl_utama, data.catatan
      ]
    );
    return (result as any).insertId;
  }
}

// Fungsi untuk handle direktori years
async function handleDirektoriYears(
  connection: mysql.Connection,
  perusahaanId: number,
  thnDirektori?: string,
  replaceMode: boolean = false
): Promise<void> {
  // Jika mode replace atau ada tahun baru, hapus data direktori yang lama
  if (replaceMode || thnDirektori) {
    await connection.execute(
      'DELETE FROM direktori WHERE id_perusahaan = ?',
      [perusahaanId]
    );
  }

  // Insert tahun direktori baru jika ada
  if (thnDirektori && thnDirektori.trim() !== '') {
    const years = thnDirektori.split(',').map(y => y.trim()).filter(y => y !== '');
    
    if (years.length > 0) {
      const direktoriValues = years.map(year => [perusahaanId, parseInt(year)]);
      await connection.query(
        'INSERT INTO direktori (id_perusahaan, thn_direktori) VALUES ?',
        [direktoriValues]
      );
    }
  }
}

// POST endpoint untuk import data Excel
export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as string || 'append';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validasi format file
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv' },
        { status: 400 }
      );
    }

    // Baca file Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert ke JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      return NextResponse.json(
        { success: false, message: 'File harus memiliki minimal 1 baris data selain header' },
        { status: 400 }
      );
    }

    // Ambil headers dan data
    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1);

    // Validasi headers wajib
    const requiredFields = ['nama_perusahaan', 'skala'];
    const missingFields = requiredFields.filter(field => 
      !headers.some(header => 
        header.toLowerCase().replace(/\s+/g, '_') === field
      )
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: `Kolom wajib tidak ditemukan: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Bersihkan dan validasi data
    const { validData, errors } = cleanAndValidateData(dataRows, headers);
    
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Ditemukan ${errors.length} error dalam data`,
        errors: errors
      }, { status: 400 });
    }

    // Buat koneksi database
    connection = await createDbConnection();
    await connection.beginTransaction();

    const stats: ImportStats = {
      total: validData.length,
      inserted: 0,
      updated: 0,
      errors: 0,
      errorDetails: []
    };

    // Jika mode replace, hapus semua data
    if (mode === 'replace') {
      await connection.execute('DELETE FROM direktori');
      await connection.execute('DELETE FROM riwayat_survei');
      await connection.execute('DELETE FROM perusahaan');
      console.log('Mode replace: Semua data dihapus');
    }

    // Cek data yang sudah ada (hanya untuk mode append)
    let existingDataMap = new Map<string, number>();
    if (mode === 'append') {
      const { existing } = await checkExistingData(connection, validData);
      existingDataMap = existing;
    }

    // Process setiap baris data
    for (let i = 0; i < validData.length; i++) {
      const rowData = validData[i];
      
      try {
        let perusahaanId: number;
        let isUpdate = false;

        // Cek apakah data sudah ada (untuk mode append)
        if (mode === 'append') {
          const existingId = rowData.kip 
            ? existingDataMap.get(`kip:${rowData.kip}`)
            : existingDataMap.get(`nama:${rowData.nama_perusahaan}`);

          if (existingId) {
            perusahaanId = existingId;
            isUpdate = true;
            stats.updated++;
          } else {
            perusahaanId = await insertOrUpdatePerusahaan(connection, rowData);
            stats.inserted++;
          }
        } else {
          // Mode replace: selalu insert
          perusahaanId = await insertOrUpdatePerusahaan(connection, rowData);
          stats.inserted++;
        }

        // Update data perusahaan jika mode append dan data sudah ada
        if (isUpdate) {
          await insertOrUpdatePerusahaan(connection, rowData, perusahaanId);
        }

        // Handle tahun direktori
        await handleDirektoriYears(
          connection, 
          perusahaanId, 
          rowData.thn_direktori,
          isUpdate || mode === 'replace'
        );

      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        stats.errors++;
        stats.errorDetails.push({
          row: i + 2,
          field: 'general',
          message: `Error processing data: ${error.message}`,
          value: rowData.nama_perusahaan
        });
      }
    }

    // Commit transaksi
    await connection.commit();

    return NextResponse.json({
      success: true,
      message: `Import berhasil! ${stats.inserted} data ditambahkan, ${stats.updated} data diperbarui`,
      stats: stats
    });

  } catch (error) {
    // Rollback jika ada error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }

    console.error('Import error:', error);
    return NextResponse.json({
      success: false,
      message: `Error import data: ${error.message}`,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });

  } finally {
    // Tutup koneksi
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Connection close error:', closeError);
      }
    }
  }
}

// GET endpoint untuk cek status import (opsional)
export async function GET(request: NextRequest) {
  try {
    const connection = await createDbConnection();
    
    // Get statistics
    const [perusahaanCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM perusahaan'
    );
    
    const [direktoriCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM direktori'
    );

    const [lastImport] = await connection.execute(
      'SELECT MAX(created_at) as last_import FROM perusahaan WHERE created_at IS NOT NULL'
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      stats: {
        total_perusahaan: (perusahaanCount as any[])[0].count,
        total_direktori: (direktoriCount as any[])[0].count,
        last_import: (lastImport as any[])[0].last_import
      }
    });

  } catch (error) {
    console.error('Get import stats error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error getting import statistics'
    }, { status: 500 });
  }
}