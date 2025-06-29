// src/app/api/survei/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Import XLSX dengan cara yang lebih kompatibel
const XLSX = require('xlsx');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wirasaba',
};

export async function GET(request: NextRequest) {
  console.log('🚀 Starting survei export process...');
  
  let connection;
  
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Ambil parameter filter dari URL
    const search = searchParams.get('search') || '';
    const fungsi = searchParams.get('fungsi') || 'all';
    const periode = searchParams.get('periode') || 'all';
    const tahun = searchParams.get('tahun') || 'all';
    
    // Ambil parameter sorting
    const sorts = [];
    let sortIndex = 0;
    while (searchParams.get(`sort[${sortIndex}][column]`)) {
      sorts.push({
        column: searchParams.get(`sort[${sortIndex}][column]`),
        direction: searchParams.get(`sort[${sortIndex}][direction]`) || 'ascending'
      });
      sortIndex++;
    }

    console.log('📋 Export parameters:', { search, fungsi, periode, tahun, sorts });

    // Test koneksi database terlebih dahulu
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');

    // Prepare WHERE conditions dengan validasi yang lebih ketat
    let whereConditions = [];
    let queryParams = [];

    // Filter pencarian dengan escaping
    if (search && search.trim()) {
      whereConditions.push('(s.nama_survei LIKE ? OR s.fungsi LIKE ? OR s.periode LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Filter fungsi dengan validasi
    if (fungsi && fungsi !== 'all') {
      whereConditions.push('s.fungsi = ?');
      queryParams.push(fungsi);
    }

    // Filter periode dengan validasi
    if (periode && periode !== 'all') {
      whereConditions.push('s.periode = ?');
      queryParams.push(periode);
    }

    // Filter tahun dengan validasi angka
    if (tahun && tahun !== 'all') {
      const tahunNum = parseInt(tahun);
      if (!isNaN(tahunNum) && tahunNum > 1900 && tahunNum < 2100) {
        whereConditions.push('s.tahun = ?');
        queryParams.push(tahunNum);
      }
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Build ORDER BY clause dengan validasi kolom
    let orderByClause = '';
    const validColumns = ['nama_survei', 'fungsi', 'periode', 'tahun'];
    
    if (sorts.length > 0) {
      const orderClauses = sorts
        .filter(sort => validColumns.includes(sort.column)) // Validasi kolom
        .map(sort => {
          const direction = sort.direction === 'descending' ? 'DESC' : 'ASC';
          return `s.${sort.column} ${direction}`;
        });
      
      if (orderClauses.length > 0) {
        orderByClause = `ORDER BY ${orderClauses.join(', ')}`;
      } else {
        orderByClause = 'ORDER BY s.tahun DESC, s.nama_survei ASC';
      }
    } else {
      orderByClause = 'ORDER BY s.tahun DESC, s.nama_survei ASC';
    }

    // Query yang disederhanakan untuk menghindari masalah ROW_NUMBER
    const query = `
      SELECT
        s.nama_survei,
        s.fungsi,
        s.periode,
        s.tahun
      FROM survei s
      ${whereClause}
      ${orderByClause}
    `;

    console.log('📊 Executing query:', query);
    console.log('🔧 Query params:', queryParams);

    const [rows] = await connection.execute(query, queryParams);
    const surveiData = rows as any[];

    console.log(`📈 Found ${surveiData.length} survei records`);

    // Format data untuk Excel dengan penomoran manual
    const exportData = surveiData.map((survei, index) => {
      return {
        "No": index + 1,
        "Nama Survei": survei.nama_survei || '',
        "Fungsi": survei.fungsi || '',
        "Periode": survei.periode || '',
        "Tahun": survei.tahun || ''
      };
    });

    console.log('🔄 Export data formatted, creating Excel...');

    // Tutup koneksi database
    await connection.end();
    connection = null;

    // Test XLSX library
    console.log('📚 Testing XLSX library...');
    if (!XLSX || !XLSX.utils || !XLSX.write) {
      throw new Error('XLSX library not properly loaded');
    }

    // Buat workbook Excel
    console.log('📊 Creating Excel workbook...');
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 5 },   // No
      { wch: 40 },  // Nama Survei
      { wch: 20 },  // Fungsi
      { wch: 15 },  // Periode
      { wch: 10 }   // Tahun
    ];

    worksheet['!cols'] = columnWidths;

    // Tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Survei");

    console.log("📝 Excel workbook created, generating buffer...");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    });

    console.log("✅ Excel buffer generated, size:", excelBuffer.length);

    // Generate filename dengan timestamp dan filter info
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
    
    let filename = `data-survei-${timestamp}`;
    if (tahun && tahun !== "all") filename += `-tahun-${tahun}`;
    if (search) filename += `-search-${search.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`;
    if (fungsi && fungsi !== "all") filename += `-fungsi-${fungsi.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`;
    if (periode && periode !== "all") filename += `-periode-${periode.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`;
    filename += '.xlsx';

    console.log("📤 Sending Excel file:", filename);

    // Return Excel file sebagai response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("❌ Detailed error in Excel export:", error);
    console.error("📋 Error stack:", error?.stack);
    
    // Tutup koneksi jika masih terbuka
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error("❌ Error closing connection:", closeError);
      }
    }
    
    // Return error response dengan detail yang berguna
    return NextResponse.json(
      { 
        success: false, 
        message: "Error generating Excel file: " + (error?.message || 'Unknown error'),
        error: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          stack: error?.stack,
          name: error?.name
        } : undefined
      },
      { status: 500 }
    );
  }
}