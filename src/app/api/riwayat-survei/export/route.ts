// src/app/api/riwayat-survei/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Import XLSX dengan cara yang kompatibel
const XLSX = require('xlsx');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wirasaba',
};

// Utility function to create database connection
async function createDbConnection() {
  return await mysql.createConnection(dbConfig);
}

export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    console.log('🔄 Starting riwayat survei export...');
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'excel';
    const search = searchParams.get('search');
    const surveiFilter = searchParams.get('survei');
    const pclFilter = searchParams.get('pcl');
    const selesaiFilter = searchParams.get('selesai');
    const tahunFilter = searchParams.get('tahun');

    // Parse sorting parameters
    const sortParams: Array<{column: string, direction: string}> = [];
    let sortIndex = 0;
    while (searchParams.get(`sort[${sortIndex}][column]`)) {
      const column = searchParams.get(`sort[${sortIndex}][column]`);
      const direction = searchParams.get(`sort[${sortIndex}][direction]`) || 'ascending';
      if (column) {
        sortParams.push({ column, direction });
      }
      sortIndex++;
    }

    // Create database connection
    connection = await createDbConnection();

    // Build the query with filters and joins
    let query = `
      SELECT 
        rs.id_riwayat,
        s.nama_survei,
        s.tahun,
        p.nama_perusahaan,
        p.kip,
        pcl.nama_pcl,
        rs.selesai,
        rs.ket_survei
      FROM riwayat_survei rs
      LEFT JOIN survei s ON rs.id_survei = s.id_survei
      LEFT JOIN perusahaan p ON rs.id_perusahaan = p.id_perusahaan
      LEFT JOIN pcl ON rs.id_pcl = pcl.id_pcl
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    // Apply filters
    if (search) {
      query += ` AND (
        s.nama_survei LIKE ? OR 
        p.nama_perusahaan LIKE ? OR 
        p.kip LIKE ? OR
        pcl.nama_pcl LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (surveiFilter && surveiFilter !== 'all') {
      query += ` AND rs.id_survei = ?`;
      queryParams.push(surveiFilter);
    }

    if (pclFilter && pclFilter !== 'all') {
      query += ` AND rs.id_pcl = ?`;
      queryParams.push(pclFilter);
    }

    if (selesaiFilter && selesaiFilter !== 'all') {
      query += ` AND rs.selesai = ?`;
      queryParams.push(selesaiFilter);
    }

    if (tahunFilter && tahunFilter !== 'all') {
      query += ` AND s.tahun = ?`;
      queryParams.push(tahunFilter);
    }

    // Apply sorting
    if (sortParams.length > 0) {
      const orderClauses = sortParams.map(sort => {
        const direction = sort.direction === 'descending' ? 'DESC' : 'ASC';
        
        // Map column names to actual database columns
        switch (sort.column) {
          case 'nama_survei':
            return `s.nama_survei ${direction}`;
          case 'nama_perusahaan':
            return `p.nama_perusahaan ${direction}`;
          case 'nama_pcl':
            return `pcl.nama_pcl ${direction}`;
          case 'selesai':
            return `rs.selesai ${direction}`;
          case 'tahun':
            return `s.tahun ${direction}`;
          case 'kip':
            return `p.kip ${direction}`;
          default:
            return `rs.id_riwayat ${direction}`;
        }
      });
      
      query += ` ORDER BY ${orderClauses.join(', ')}`;
    } else {
      // Default ordering
      query += ` ORDER BY s.tahun DESC, s.nama_survei ASC`;
    }

    console.log('🔍 Executing query:', query);
    console.log('📋 Query params:', queryParams);

    // Execute query
    const [rows] = await connection.execute(query, queryParams);
    const data = rows as any[];

    console.log(`📊 Found ${data.length} records`);

    if (data.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Tidak ada data riwayat survei yang ditemukan sesuai dengan filter yang dipilih'
      }, { status: 404 });
    }

    // Prepare data for Excel export
    const excelData = data.map((row, index) => ({
      'No': index + 1,
      'KIP': row.kip || '',
      'Nama Perusahaan': row.nama_perusahaan || '',
      'Nama Survei': row.nama_survei || '',
      'Tahun': row.tahun || '',
      'PCL': row.nama_pcl || '',
      'Selesai': row.selesai || '',
      'Keterangan': row.ket_survei || ''
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 5 },   // No
      { wch: 15 },  // KIP
      { wch: 40 },  // Nama Perusahaan
      { wch: 35 },  // Nama Survei
      { wch: 8 },   // Tahun
      { wch: 25 },  // PCL
      { wch: 10 },  // Selesai
      { wch: 30 }   // Keterangan
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Riwayat Survei');

    // Create info sheet with filter details
    const infoData = [
      { 'Informasi': 'Tanggal Export', 'Detail': new Date().toLocaleString('id-ID') },
      { 'Informasi': 'Total Data', 'Detail': data.length.toString() },
      { 'Informasi': 'Filter Pencarian', 'Detail': search || 'Tidak ada' },
      { 'Informasi': 'Filter Survei', 'Detail': surveiFilter && surveiFilter !== 'all' ? surveiFilter : 'Semua' },
      { 'Informasi': 'Filter PCL', 'Detail': pclFilter && pclFilter !== 'all' ? pclFilter : 'Semua' },
      { 'Informasi': 'Filter Status Selesai', 'Detail': selesaiFilter && selesaiFilter !== 'all' ? selesaiFilter : 'Semua' },
      { 'Informasi': 'Filter Tahun', 'Detail': tahunFilter && tahunFilter !== 'all' ? tahunFilter : 'Semua' },
      { 'Informasi': 'Pengurutan', 'Detail': sortParams.length > 0 ? 
        sortParams.map(s => `${s.column} (${s.direction})`).join(', ') : 'Default (Tahun DESC, Nama Survei ASC)' }
    ];

    const infoSheet = XLSX.utils.json_to_sheet(infoData);
    infoSheet['!cols'] = [
      { wch: 25 }, // Informasi
      { wch: 50 }  // Detail
    ];

    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informasi Export');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      bookSST: false,
      compression: true
    });

    console.log('✅ Excel file generated successfully');

    // Get filename

    // Create descriptive filename based on filters
    let filename = `riwayat_survei`;
    
    if (search || surveiFilter !== 'all' || pclFilter !== 'all' || selesaiFilter !== 'all' || tahunFilter !== 'all') {
      filename += '_filtered';
    }
    
    filename += '.xlsx';

    // Create response with proper headers
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Length': excelBuffer.length.toString()
      }
    });

    return response;

  } catch (error) {
    console.error('❌ Error in riwayat survei export:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal mengexport data riwayat survei',
        error: process.env.NODE_ENV === 'development' ? 
          (error as Error).message : 'Internal server error'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}