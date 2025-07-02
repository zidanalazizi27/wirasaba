// src/app/api/riwayat-survei/template/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Import XLSX dengan cara yang kompatibel
const XLSX = require('xlsx');

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Generating riwayat survei template...');

    // Define the template structure for riwayat survei
    const templateData = [
      {
        'id_survei': 1,
        'id_perusahaan': 1,
        'id_pcl': 1,
        'selesai': 'Iya',
        'ket_survei': 'Survei telah selesai dilaksanakan'
      },
      {
        'id_survei': 2,
        'id_perusahaan': 2,
        'id_pcl': 2,
        'selesai': 'Tidak',
        'ket_survei': 'Perusahaan tutup sementara'
      },
      {
        'id_survei': 1,
        'id_perusahaan': 3,
        'id_pcl': 1,
        'selesai': 'Iya',
        'ket_survei': ''
      },
      {
        'id_survei': 3,
        'id_perusahaan': 1,
        'id_pcl': 3,
        'selesai': 'Tidak',
        'ket_survei': 'Narasumber tidak bersedia'
      },
      {
        'id_survei': 2,
        'id_perusahaan': 4,
        'id_pcl': 2,
        'selesai': 'Iya',
        'ket_survei': 'Survei berhasil diselesaikan'
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 12 }, // id_survei
      { wch: 15 }, // id_perusahaan
      { wch: 10 }, // id_pcl
      { wch: 12 }, // selesai
      { wch: 40 }  // ket_survei
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Riwayat Survei');

    // Create instructions sheet
    const instructionsData = [
      { 'Field': 'id_survei', 'Tipe Data': 'Number', 'Wajib': 'Ya', 'Keterangan': 'ID survei yang ada dalam database survei' },
      { 'Field': 'id_perusahaan', 'Tipe Data': 'Number', 'Wajib': 'Ya', 'Keterangan': 'ID perusahaan yang ada dalam database perusahaan' },
      { 'Field': 'id_pcl', 'Tipe Data': 'Number', 'Wajib': 'Ya', 'Keterangan': 'ID PCL yang ada dalam database pcl' },
      { 'Field': 'selesai', 'Tipe Data': 'Text', 'Wajib': 'Ya', 'Keterangan': 'Status penyelesaian survei: "Iya" atau "Tidak"' },
      { 'Field': 'ket_survei', 'Tipe Data': 'Text', 'Wajib': 'Tidak', 'Keterangan': 'Keterangan tambahan mengenai survei (maksimal 500 karakter)' }
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [
      { wch: 15 }, // Field
      { wch: 12 }, // Tipe Data
      { wch: 8 },  // Wajib
      { wch: 60 }  // Keterangan
    ];

    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Petunjuk Kolom');

    // Create validation rules sheet
    const validationData = [
      { 'Validasi': 'ID Survei', 'Aturan': 'Harus berupa angka dan terdapat dalam database survei' },
      { 'Validasi': 'ID Perusahaan', 'Aturan': 'Harus berupa angka dan terdapat dalam database perusahaan' },
      { 'Validasi': 'ID PCL', 'Aturan': 'Harus berupa angka dan terdapat dalam database PCL' },
      { 'Validasi': 'Status Selesai', 'Aturan': 'Hanya boleh diisi dengan "Iya" atau "Tidak" (case sensitive)' },
      { 'Validasi': 'Keterangan', 'Aturan': 'Boleh kosong, maksimal 500 karakter' },
      { 'Validasi': 'Duplikasi', 'Aturan': 'Kombinasi id_survei + id_perusahaan harus unik' },
      { 'Validasi': 'Format File', 'Aturan': 'File harus dalam format .xlsx, .xls, atau .csv' }
    ];

    const validationSheet = XLSX.utils.json_to_sheet(validationData);
    validationSheet['!cols'] = [
      { wch: 20 }, // Validasi
      { wch: 70 }  // Aturan
    ];

    XLSX.utils.book_append_sheet(workbook, validationSheet, 'Aturan Validasi');

    // Create reference data sheet dengan contoh ID yang valid
    const referenceData = [
      { 'Tabel': 'Survei', 'Contoh ID': '1, 2, 3, ...', 'Keterangan': 'Lihat tabel survei untuk ID yang tersedia' },
      { 'Tabel': 'Perusahaan', 'Contoh ID': '1, 2, 3, ...', 'Keterangan': 'Lihat tabel perusahaan untuk ID yang tersedia' },
      { 'Tabel': 'PCL', 'Contoh ID': '1, 2, 3, ...', 'Keterangan': 'Lihat tabel PCL untuk ID yang tersedia' },
      { 'Tabel': '', 'Contoh ID': '', 'Keterangan': '' },
      { 'Tabel': 'Status Selesai', 'Contoh ID': 'Iya / Tidak', 'Keterangan': 'Nilai yang diperbolehkan (case sensitive)' }
    ];

    const referenceSheet = XLSX.utils.json_to_sheet(referenceData);
    referenceSheet['!cols'] = [
      { wch: 15 }, // Tabel
      { wch: 20 }, // Contoh ID
      { wch: 50 }  // Keterangan
    ];

    XLSX.utils.book_append_sheet(workbook, referenceSheet, 'Data Referensi');

    // Create information sheet
    const infoData = [
      { 'Informasi': 'Format File', 'Detail': 'File harus dalam format .xlsx, .xls, atau .csv' },
      { 'Informasi': 'Ukuran File', 'Detail': 'Maksimal 10MB per file' },
      { 'Informasi': 'Header Kolom', 'Detail': 'Jangan ubah nama kolom pada baris pertama' },
      { 'Informasi': 'Field Wajib', 'Detail': 'id_survei, id_perusahaan, id_pcl, selesai (4 field HARUS DIISI)' },
      { 'Informasi': 'Field Opsional', 'Detail': 'ket_survei (boleh dikosongkan)' },
      { 'Informasi': 'Validasi Duplikasi', 'Detail': 'Sistem akan mengecek duplikasi berdasarkan kombinasi id_survei + id_perusahaan' },
      { 'Informasi': 'Mode Upload', 'Detail': 'Tambah Data: menambah/update data existing | Ganti Semua: hapus semua data existing' },
      { 'Informasi': 'Relasi Data', 'Detail': 'ID yang digunakan harus sudah tersedia di tabel survei, perusahaan, dan pcl' }
    ];

    const infoSheet = XLSX.utils.json_to_sheet(infoData);
    infoSheet['!cols'] = [
      { wch: 25 }, // Informasi
      { wch: 80 }  // Detail
    ];

    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informasi Upload');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      bookSST: false,
      compression: true
    });

    console.log('✅ Riwayat survei template generated successfully');

    // Get current date for filename
    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `template_riwayat_survei_${dateString}.xlsx`;

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
    console.error('❌ Error generating riwayat survei template:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal membuat template riwayat survei',
        error: process.env.NODE_ENV === 'development' ? 
          (error as Error).message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}