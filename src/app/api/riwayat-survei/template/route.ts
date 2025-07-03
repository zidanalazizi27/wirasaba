// src/app/api/riwayat-survei/template/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Import XLSX dengan cara yang kompatibel
const XLSX = require('xlsx');

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Generating riwayat survei template...');

    // Template data dengan informasi lengkap untuk verifikasi relasi
    const templateData = [
      {
        'kip': '1234567890',
        'nama_perusahaan': 'PT. Industri Manufaktur Jaya',
        'nama_survei': 'Survei Industri Besar dan Sedang',
        'tahun': 2024,
        'nama_pcl': 'Ahmad Wijaya',
        'selesai': 'Iya',
        'ket_survei': 'Survei telah selesai dilaksanakan'
      },
      {
        'kip': '2345678901',
        'nama_perusahaan': 'CV. Teknologi Berkembang',
        'nama_survei': 'Survei Tahunan Perusahaan',
        'tahun': 2024,
        'nama_pcl': 'Siti Nurhaliza',
        'selesai': 'Tidak',
        'ket_survei': 'Perusahaan tutup sementara'
      },
      {
        'kip': '1422345678',
        'nama_perusahaan': 'PT. Global Industries',
        'nama_survei': 'Survei Industri Besar dan Sedang',
        'tahun': 2024,
        'nama_pcl': 'Ahmad Wijaya',
        'selesai': 'Iya',
        'ket_survei': 'Data lengkap dan valid'
      },
      {
        'kip': '123456789',
        'nama_perusahaan': 'PT. Maju Bersama',
        'nama_survei': 'Survei Khusus Industri',
        'tahun': 2023,
        'nama_pcl': 'Budi Santoso',
        'selesai': 'Tidak',
        'ket_survei': 'Narasumber tidak bersedia'
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths untuk template dengan data relasi
    const columnWidths = [
      { wch: 12 }, // kip
      { wch: 35 }, // nama_perusahaan
      { wch: 35 }, // nama_survei
      { wch: 8 },  // tahun
      { wch: 20 }, // nama_pcl
      { wch: 12 }, // selesai
      { wch: 40 }  // ket_survei
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Riwayat Survei');

    // Create instructions sheet
    const instructionsData = [
      { 'Field': 'kip', 'Tipe Data': 'Text', 'Wajib': 'Ya', 'Keterangan': 'KIP perusahaan yang terdaftar dalam database (maksimal 10 digit)' },
      { 'Field': 'nama_perusahaan', 'Tipe Data': 'Text', 'Wajib': 'Ya', 'Keterangan': 'Nama perusahaan yang sesuai dengan KIP di database' },
      { 'Field': 'nama_survei', 'Tipe Data': 'Text', 'Wajib': 'Ya', 'Keterangan': 'Nama survei yang terdaftar dalam database survei' },
      { 'Field': 'tahun', 'Tipe Data': 'Number', 'Wajib': 'Ya', 'Keterangan': 'Tahun survei yang sesuai dengan nama survei di database' },
      { 'Field': 'nama_pcl', 'Tipe Data': 'Text', 'Wajib': 'Ya', 'Keterangan': 'Nama PCL yang terdaftar dalam database PCL' },
      { 'Field': 'selesai', 'Tipe Data': 'Text', 'Wajib': 'Ya', 'Keterangan': 'Status penyelesaian survei: "Iya" atau "Tidak"' },
      { 'Field': 'ket_survei', 'Tipe Data': 'Text', 'Wajib': 'Tidak', 'Keterangan': 'Keterangan tambahan mengenai survei (maksimal 500 karakter)' }
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [
      { wch: 18 }, // Field
      { wch: 12 }, // Tipe Data
      { wch: 8 },  // Wajib
      { wch: 60 }  // Keterangan
    ];

    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Petunjuk Kolom');

    // Create validation rules sheet
    const validationData = [
      { 'Validasi': 'KIP', 'Aturan': 'Maksimal 10 digit dan terdapat dalam database perusahaan' },
      { 'Validasi': 'Nama Perusahaan', 'Aturan': 'Harus sesuai dengan KIP yang diinput dan terdaftar di database perusahaan' },
      { 'Validasi': 'Nama Survei', 'Aturan': 'Harus terdapat dalam database survei dan aktif' },
      { 'Validasi': 'Tahun', 'Aturan': 'Harus sesuai dengan tahun survei yang terdaftar di database' },
      { 'Validasi': 'Nama PCL', 'Aturan': 'Harus terdapat dalam database PCL dan status aktif' },
      { 'Validasi': 'Status Selesai', 'Aturan': 'Hanya boleh diisi dengan "Iya" atau "Tidak" (case sensitive)' },
      { 'Validasi': 'Keterangan', 'Aturan': 'Boleh kosong, maksimal 500 karakter' },
      { 'Validasi': 'Duplikasi', 'Aturan': 'Kombinasi KIP + Nama Survei + Tahun harus unik' },
      { 'Validasi': 'Relasi Data', 'Aturan': 'Semua data harus konsisten dengan data yang ada di database terkait' },
      { 'Validasi': 'Format File', 'Aturan': 'File harus dalam format .xlsx, .xls, atau .csv' }
    ];

    const validationSheet = XLSX.utils.json_to_sheet(validationData);
    validationSheet['!cols'] = [
      { wch: 20 }, // Validasi
      { wch: 70 }  // Aturan
    ];

    XLSX.utils.book_append_sheet(workbook, validationSheet, 'Aturan Validasi');

    // Create reference data sheet
    const referenceData = [
      { 'Verifikasi': 'KIP + Nama Perusahaan', 'Penjelasan': 'Sistem akan mengecek apakah KIP dan nama perusahaan cocok di database' },
      { 'Verifikasi': 'Nama Survei + Tahun', 'Penjelasan': 'Sistem akan mengecek apakah kombinasi nama survei dan tahun valid' },
      { 'Verifikasi': 'Nama PCL', 'Penjelasan': 'Sistem akan mengecek apakah PCL terdaftar dan aktif' },
      { 'Verifikasi': 'Konsistensi Data', 'Penjelasan': 'Semua field harus konsisten dengan data master di database' },
      { 'Verifikasi': '', 'Penjelasan': '' },
      { 'Verifikasi': 'Contoh Valid:', 'Penjelasan': '' },
      { 'Verifikasi': 'KIP', 'Penjelasan': '1234567890123456 (16 digit, terdaftar di database)' },
      { 'Verifikasi': 'Perusahaan', 'Penjelasan': 'PT. Industri Manufaktur Jaya (sesuai dengan KIP)' },
      { 'Verifikasi': 'Survei', 'Penjelasan': 'Survei Industri Besar dan Sedang (terdaftar di database)' },
      { 'Verifikasi': 'Tahun', 'Penjelasan': '2024 (sesuai dengan tahun survei)' },
      { 'Verifikasi': 'PCL', 'Penjelasan': 'Ahmad Wijaya (terdaftar dan aktif)' }
    ];

    const referenceSheet = XLSX.utils.json_to_sheet(referenceData);
    referenceSheet['!cols'] = [
      { wch: 25 }, // Verifikasi
      { wch: 60 }  // Penjelasan
    ];

    XLSX.utils.book_append_sheet(workbook, referenceSheet, 'Verifikasi Relasi');

    // Create information sheet
    const infoData = [
      { 'Informasi': 'Format File', 'Detail': 'File harus dalam format .xlsx, .xls, atau .csv' },
      { 'Informasi': 'Ukuran File', 'Detail': 'Maksimal 10MB per file' },
      { 'Informasi': 'Header Kolom', 'Detail': 'Jangan ubah nama kolom pada baris pertama' },
      { 'Informasi': 'Field Wajib', 'Detail': 'kip, nama_perusahaan, nama_survei, tahun, nama_pcl, selesai (6 field HARUS DIISI)' },
      { 'Informasi': 'Field Opsional', 'Detail': 'ket_survei (boleh dikosongkan)' },
      { 'Informasi': 'Validasi Duplikasi', 'Detail': 'Sistem akan mengecek duplikasi berdasarkan KIP + Nama Survei + Tahun' },
      { 'Informasi': 'Validasi Relasi', 'Detail': 'Sistem akan memverifikasi kecocokan data dengan tabel perusahaan, survei, dan PCL' },
      { 'Informasi': 'Mode Upload', 'Detail': 'Tambah Data: menambah/update data existing | Ganti Semua: hapus semua data existing' },
      { 'Informasi': 'Verifikasi Otomatis', 'Detail': 'Sistem akan mengonversi nama menjadi ID yang sesuai secara otomatis' },
      { 'Informasi': 'Error Handling', 'Detail': 'Jika ada data yang tidak cocok, sistem akan memberikan pesan error detail' }
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

    console.log('✅ Riwayat survei template with relation verification generated successfully');

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