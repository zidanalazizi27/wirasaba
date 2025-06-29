// src/app/api/survei/template/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Import XLSX dengan cara yang kompatibel
const XLSX = require('xlsx');

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Generating survei template...');

    // Define the template structure matching survei database
    const templateData = [
      {
        'nama_survei': 'Survei Industri Besar dan Sedang',
        'fungsi': 'Produksi',
        'periode': 'Bulanan',
        'tahun': 2024
      },
      {
        'nama_survei': 'Survei Tahunan Perusahaan Industri Manufaktur', 
        'fungsi': 'Neraca',
        'periode': 'Tahunan',
        'tahun': 2024
      },
      {
        'nama_survei': 'Survei Khusus Perusahaan Swasta Non Finansial',
        'fungsi': 'Distribusi', 
        'periode': 'Triwulan',
        'tahun': 2024
      },
      {
        'nama_survei': 'Survei Komoditas Industri Manufaktur',
        'fungsi': 'Produksi',
        'periode': 'Semester',
        'tahun': 2024
      },
      {
        'nama_survei': 'Survei E-Commerce',
        'fungsi': 'Lainnya',
        'periode': 'Tahunan',
        'tahun': 2024
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 45 }, // nama_survei
      { wch: 15 }, // fungsi
      { wch: 15 }, // periode
      { wch: 10 }  // tahun
    ];
    worksheet['!cols'] = columnWidths;

    // Add styling to header row (optional, basic styling)
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:D1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
      worksheet[cellAddress].s.font = { bold: true };
      worksheet[cellAddress].s.fill = { fgColor: { rgb: "E3F2FD" } };
    }

    // Add instructions sheet
    const instructionsData = [
      { 
        'Kolom': 'nama_survei', 
        'Keterangan': 'Nama survei lengkap (wajib diisi, minimal 3 karakter, maksimal 100 karakter)', 
        'Contoh': 'Survei Industri Besar dan Sedang',
        'Validasi': 'String, 3-100 karakter'
      },
      { 
        'Kolom': 'fungsi', 
        'Keterangan': 'Fungsi survei (wajib diisi, pilihan yang tersedia: Produksi, Neraca, Distribusi, Lainnya)', 
        'Contoh': 'Produksi',
        'Validasi': 'Enum: Produksi|Neraca|Distribusi|Lainnya'
      },
      { 
        'Kolom': 'periode', 
        'Keterangan': 'Periode pelaksanaan survei (wajib diisi, pilihan: Bulanan, Triwulan, Semester, Tahunan, Lainnya)', 
        'Contoh': 'Bulanan',
        'Validasi': 'Enum: Bulanan|Triwulan|Semester|Tahunan|Lainnya'
      },
      { 
        'Kolom': 'tahun', 
        'Keterangan': 'Tahun pelaksanaan survei (wajib diisi, angka antara 1900-2100)', 
        'Contoh': '2024',
        'Validasi': 'Integer, range: 1900-2100'
      }
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [
      { wch: 15 }, // Kolom
      { wch: 70 }, // Keterangan
      { wch: 35 }, // Contoh
      { wch: 30 }  // Validasi
    ];

    // Add additional information sheet
    const infoData = [
      { 'Informasi': 'Format File', 'Detail': 'File harus dalam format .xlsx, .xls, atau .csv' },
      { 'Informasi': 'Ukuran File', 'Detail': 'Maksimal 10MB per file' },
      { 'Informasi': 'Encoding', 'Detail': 'Gunakan UTF-8 untuk karakter khusus' },
      { 'Informasi': 'Header Kolom', 'Detail': 'Jangan ubah nama kolom pada baris pertama' },
      { 'Informasi': 'Data Kosong', 'Detail': 'Baris dengan semua kolom kosong akan diabaikan' },
      { 'Informasi': 'Duplikasi', 'Detail': 'Duplikasi diperiksa berdasarkan kombinasi: nama_survei + fungsi + periode + tahun' },
      { 'Informasi': 'Mode Upload', 'Detail': 'Tambah Data: menambah/update data existing | Ganti Semua: hapus semua data existing' },
      { 'Informasi': 'Validasi', 'Detail': 'Semua field wajib diisi sesuai dengan kriteria yang ditetapkan' }
    ];

    const infoSheet = XLSX.utils.json_to_sheet(infoData);
    infoSheet['!cols'] = [
      { wch: 20 }, // Informasi
      { wch: 80 }  // Detail
    ];

    // Add all sheets to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Survei');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Petunjuk Kolom');
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informasi Upload');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      bookSST: false,
      compression: true
    });

    console.log('✅ Survei template generated successfully');

    // Get current date for filename
    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `template_data_survei_${dateString}.xlsx`;

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
    console.error('❌ Error generating survei template:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal membuat template survei',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}