// src/app/api/perusahaan/template/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Generating perusahaan template with FULL FIX (28 columns)...');

    // ✅ PERBAIKAN: Template data dengan SEMUA 28 kolom dalam urutan yang benar
    const templateData = [
      {
        'KIP': '3515000001',
        'Nama Perusahaan': 'PT Contoh Industri Utama',
        'Badan Usaha': '1',
        'Alamat': 'Jl. Industri No. 123, Gedangan',
        'Kecamatan': 'Gedangan',
        'Desa': 'Gedangan',
        'Kode Pos': '61254',
        'Skala': 'Besar',
        'Lokasi Perusahaan': '2',
        'Nama Kawasan': 'SIER',
        'Latitude': -7.3953,
        'Longitude': 112.7312,
        'Jarak (KM)': 15.2,
        'Produk': 'Komponen Elektronik',
        'KBLI': 26122,
        'Telepon Perusahaan': '031-8531234',
        'Email Perusahaan': 'info@contoh.com',
        'Website Perusahaan': 'www.contoh.com',
        'Tenaga Kerja': '4',
        'Investasi': '4',
        'Omset': '4',
        'Nama Narasumber': 'Budi Santoso',
        'Jabatan Narasumber': 'Direktur Operasional',
        'Email Narasumber': 'budi@contoh.com',
        'Telepon Narasumber': '081234567890',
        'PCL Utama': 'Ahmad Rizki',
        'Catatan': 'Perusahaan aktif dan kooperatif',
        'Tahun Direktori': '2024,2025'
      },
      {
        'KIP': '3515000002',
        'Nama Perusahaan': 'CV Maju Bersama',
        'Badan Usaha': '2',
        'Alamat': 'Jl. Raya Sidoarjo No. 456',
        'Kecamatan': 'Sidoarjo',
        'Desa': 'Lemahputro',
        'Kode Pos': '61213',
        'Skala': 'Sedang',
        'Lokasi Perusahaan': '4',
        'Nama Kawasan': '',
        'Latitude': -7.4478,
        'Longitude': 112.7183,
        'Jarak (KM)': 2.5,
        'Produk': 'Furniture Kayu',
        'KBLI': 31001,
        'Telepon Perusahaan': '031-8945678',
        'Email Perusahaan': '',
        'Website Perusahaan': '',
        'Tenaga Kerja': '3',
        'Investasi': '2',
        'Omset': '2',
        'Nama Narasumber': 'Siti Aminah',
        'Jabatan Narasumber': 'Pemilik',
        'Email Narasumber': '',
        'Telepon Narasumber': '087654321098',
        'PCL Utama': 'Dewi Sartika',
        'Catatan': '',
        'Tahun Direktori': '2024'
      },
      {
        'KIP': '3515000003',
        'Nama Perusahaan': 'PT Teknologi Maju',
        'Badan Usaha': '1',
        'Alamat': 'Jl. Teknologi No. 789, Taman',
        'Kecamatan': 'Taman',
        'Desa': 'Wonoayu',
        'Kode Pos': '61261',
        'Skala': 'Besar',
        'Lokasi Perusahaan': '2',
        'Nama Kawasan': 'Kawasan Industri Taman',
        'Latitude': -7.3612,
        'Longitude': 112.7512,
        'Jarak (KM)': 8.5,
        'Produk': 'Software Development',
        'KBLI': 62013,
        'Telepon Perusahaan': '',
        'Email Perusahaan': 'contact@tekno.co.id',
        'Website Perusahaan': 'www.tekno.co.id',
        'Tenaga Kerja': '4',
        'Investasi': '3',
        'Omset': '3',
        'Nama Narasumber': 'Dr. Ahmad Wijaya',
        'Jabatan Narasumber': 'CEO',
        'Email Narasumber': 'ahmad@tekno.co.id',
        'Telepon Narasumber': '',
        'PCL Utama': '',
        'Catatan': 'Perusahaan teknologi dengan potensi besar',
        'Tahun Direktori': '2024,2025,2026'
      }
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // ✅ PERBAIKAN: Set column widths untuk 28 kolom
    const columnWidths = [
      { wch: 12 },  // KIP
      { wch: 30 },  // Nama Perusahaan
      { wch: 12 },  // Badan Usaha
      { wch: 40 },  // Alamat
      { wch: 15 },  // Kecamatan
      { wch: 15 },  // Desa
      { wch: 10 },  // Kode Pos
      { wch: 8 },   // Skala
      { wch: 15 },  // Lokasi Perusahaan
      { wch: 20 },  // Nama Kawasan
      { wch: 12 },  // Latitude
      { wch: 12 },  // Longitude
      { wch: 10 },  // Jarak (KM)
      { wch: 25 },  // Produk
      { wch: 8 },   // KBLI
      { wch: 15 },  // Telepon Perusahaan
      { wch: 25 },  // Email Perusahaan
      { wch: 25 },  // Website Perusahaan
      { wch: 12 },  // Tenaga Kerja
      { wch: 10 },  // Investasi
      { wch: 8 },   // Omset
      { wch: 20 },  // Nama Narasumber
      { wch: 20 },  // Jabatan Narasumber
      { wch: 25 },  // Email Narasumber
      { wch: 15 },  // Telepon Narasumber
      { wch: 15 },  // PCL Utama
      { wch: 30 },  // Catatan
      { wch: 15 }   // Tahun Direktori
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Direktori Perusahaan');

    // ✅ PERBAIKAN: Sheet petunjuk kolom dengan semua 28 field
    const instructionsData = [
      { 
        'Kolom': 'KIP', 
        'Keterangan': '🔴 WAJIB DIISI - Kode Identitas Perusahaan (format TEXT)', 
        'Contoh': '3515000001',
        'Validasi': 'String maksimal 10 digit'
      },
      { 
        'Kolom': 'Nama Perusahaan', 
        'Keterangan': '🔴 WAJIB DIISI - Nama lengkap perusahaan', 
        'Contoh': 'PT Contoh Industri Utama',
        'Validasi': 'String minimal 3 karakter'
      },
      { 
        'Kolom': 'Badan Usaha', 
        'Keterangan': '🔴 WAJIB DIISI - Kode badan usaha (lihat sheet Kode Referensi)', 
        'Contoh': '1',
        'Validasi': 'Angka 1-8'
      },
      { 
        'Kolom': 'Alamat', 
        'Keterangan': '🔴 WAJIB DIISI - Alamat lengkap perusahaan', 
        'Contoh': 'Jl. Industri No. 123, Gedangan',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Kecamatan', 
        'Keterangan': '🔴 WAJIB DIISI - Nama kecamatan (harus sesuai data master)', 
        'Contoh': 'Gedangan',
        'Validasi': 'String, harus ada di database'
      },
      { 
        'Kolom': 'Desa', 
        'Keterangan': '🔴 WAJIB DIISI - Nama desa/kelurahan (harus sesuai data master)', 
        'Contoh': 'Gedangan',
        'Validasi': 'String, harus ada di database'
      },
      { 
        'Kolom': 'Kode Pos', 
        'Keterangan': '⚪ OPSIONAL - Kode pos alamat', 
        'Contoh': '61254',
        'Validasi': '5 digit angka atau kosong'
      },
      { 
        'Kolom': 'Skala', 
        'Keterangan': '🔴 WAJIB DIISI - Skala usaha', 
        'Contoh': 'Besar atau Sedang',
        'Validasi': 'Enum: Besar|Sedang'
      },
      { 
        'Kolom': 'Lokasi Perusahaan', 
        'Keterangan': '🔴 WAJIB DIISI - Kode lokasi (lihat sheet Kode Referensi)', 
        'Contoh': '2',
        'Validasi': 'Angka 1-4'
      },
      { 
        'Kolom': 'Nama Kawasan', 
        'Keterangan': '⚪ OPSIONAL - Nama kawasan industri', 
        'Contoh': 'SIER',
        'Validasi': 'String atau kosong'
      },
      { 
        'Kolom': 'Latitude', 
        'Keterangan': '🔴 WAJIB DIISI - Koordinat lintang (format NUMBER)', 
        'Contoh': '-7.3953',
        'Validasi': 'Number desimal, range -90 sampai 90'
      },
      { 
        'Kolom': 'Longitude', 
        'Keterangan': '🔴 WAJIB DIISI - Koordinat bujur (format NUMBER)', 
        'Contoh': '112.7312',
        'Validasi': 'Number desimal, range -180 sampai 180'
      },
      { 
        'Kolom': 'Jarak (KM)', 
        'Keterangan': '⚪ OPSIONAL - Jarak ke kantor BPS dalam KM', 
        'Contoh': '15.2',
        'Validasi': 'Number desimal positif atau kosong'
      },
      { 
        'Kolom': 'Produk', 
        'Keterangan': '🔴 WAJIB DIISI - Produk utama perusahaan', 
        'Contoh': 'Komponen Elektronik',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'KBLI', 
        'Keterangan': '🔴 WAJIB DIISI - Kode KBLI 5 digit (format NUMBER)', 
        'Contoh': '26122',
        'Validasi': '5 digit number'
      },
      { 
        'Kolom': 'Telepon Perusahaan', 
        'Keterangan': '⚪ OPSIONAL - Nomor telepon perusahaan', 
        'Contoh': '031-8531234',
        'Validasi': 'String atau kosong'
      },
      { 
        'Kolom': 'Email Perusahaan', 
        'Keterangan': '⚪ OPSIONAL - Email perusahaan', 
        'Contoh': 'info@contoh.com',
        'Validasi': 'Format email valid atau kosong'
      },
      { 
        'Kolom': 'Website Perusahaan', 
        'Keterangan': '⚪ OPSIONAL - Website perusahaan', 
        'Contoh': 'www.contoh.com',
        'Validasi': 'String atau kosong'
      },
      { 
        'Kolom': 'Tenaga Kerja', 
        'Keterangan': '🔴 WAJIB DIISI - Kode tenaga kerja (lihat sheet Kode Referensi)', 
        'Contoh': '4',
        'Validasi': 'Angka 1-4'
      },
      { 
        'Kolom': 'Investasi', 
        'Keterangan': '🔴 WAJIB DIISI - Kode investasi (lihat sheet Kode Referensi)', 
        'Contoh': '4',
        'Validasi': 'Angka 1-4'
      },
      { 
        'Kolom': 'Omset', 
        'Keterangan': '🔴 WAJIB DIISI - Kode omset (lihat sheet Kode Referensi)', 
        'Contoh': '4',
        'Validasi': 'Angka 1-4'
      },
      { 
        'Kolom': 'Nama Narasumber', 
        'Keterangan': '⚪ OPSIONAL - Nama contact person', 
        'Contoh': 'Budi Santoso',
        'Validasi': 'String atau kosong'
      },
      { 
        'Kolom': 'Jabatan Narasumber', 
        'Keterangan': '⚪ OPSIONAL - Jabatan contact person', 
        'Contoh': 'Direktur Operasional',
        'Validasi': 'String atau kosong'
      },
      { 
        'Kolom': 'Email Narasumber', 
        'Keterangan': '⚪ OPSIONAL - Email narasumber', 
        'Contoh': 'budi@contoh.com',
        'Validasi': 'Format email valid atau kosong'
      },
      { 
        'Kolom': 'Telepon Narasumber', 
        'Keterangan': '⚪ OPSIONAL - Telepon narasumber', 
        'Contoh': '081234567890',
        'Validasi': 'String atau kosong'
      },
      { 
        'Kolom': 'PCL Utama', 
        'Keterangan': '⚪ OPSIONAL - Nama PCL yang menangani', 
        'Contoh': 'Ahmad Rizki',
        'Validasi': 'String atau kosong'
      },
      { 
        'Kolom': 'Catatan', 
        'Keterangan': '⚪ OPSIONAL - Catatan tambahan', 
        'Contoh': 'Perusahaan aktif dan kooperatif',
        'Validasi': 'String atau kosong'
      },
      { 
        'Kolom': 'Tahun Direktori', 
        'Keterangan': '🔴 WAJIB DIISI - Tahun direktori dipisahkan koma (format TEXT)', 
        'Contoh': '2024,2025 atau 2024',
        'Validasi': 'String format: YYYY,YYYY atau YYYY'
      }
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [
      { wch: 18 }, // Kolom
      { wch: 80 }, // Keterangan (diperbesar untuk penanda)
      { wch: 25 }, // Contoh
      { wch: 30 }  // Validasi
    ];

    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Petunjuk Kolom');

    // ✅ PERBAIKAN: Sheet kode referensi
    const referenceData = [
      { 'Jenis': 'Badan Usaha', 'Kode': '1', 'Keterangan': 'PT/PT Persero/Perum' },
      { 'Jenis': 'Badan Usaha', 'Kode': '2', 'Keterangan': 'CV' },
      { 'Jenis': 'Badan Usaha', 'Kode': '3', 'Keterangan': 'Firma' },
      { 'Jenis': 'Badan Usaha', 'Kode': '4', 'Keterangan': 'Koperasi/Dana Pensiun' },
      { 'Jenis': 'Badan Usaha', 'Kode': '5', 'Keterangan': 'Yayasan' },
      { 'Jenis': 'Badan Usaha', 'Kode': '6', 'Keterangan': 'Izin Khusus' },
      { 'Jenis': 'Badan Usaha', 'Kode': '7', 'Keterangan': 'Perwakilan Asing' },
      { 'Jenis': 'Badan Usaha', 'Kode': '8', 'Keterangan': 'Tidak Berbadan Usaha' },
      { 'Jenis': '', 'Kode': '', 'Keterangan': '' },
      { 'Jenis': 'Lokasi Perusahaan', 'Kode': '1', 'Keterangan': 'Kawasan Berikat' },
      { 'Jenis': 'Lokasi Perusahaan', 'Kode': '2', 'Keterangan': 'Kawasan Industri' },
      { 'Jenis': 'Lokasi Perusahaan', 'Kode': '3', 'Keterangan': 'Kawasan Peruntukan Industri' },
      { 'Jenis': 'Lokasi Perusahaan', 'Kode': '4', 'Keterangan': 'Luar Kawasan' },
      { 'Jenis': '', 'Kode': '', 'Keterangan': '' },
      { 'Jenis': 'Tenaga Kerja', 'Kode': '1', 'Keterangan': '1-4 orang' },
      { 'Jenis': 'Tenaga Kerja', 'Kode': '2', 'Keterangan': '5-19 orang' },
      { 'Jenis': 'Tenaga Kerja', 'Kode': '3', 'Keterangan': '20-99 orang' },
      { 'Jenis': 'Tenaga Kerja', 'Kode': '4', 'Keterangan': 'Lebih dari 99 orang' },
      { 'Jenis': '', 'Kode': '', 'Keterangan': '' },
      { 'Jenis': 'Investasi', 'Kode': '1', 'Keterangan': 'Kurang dari 1 Miliar' },
      { 'Jenis': 'Investasi', 'Kode': '2', 'Keterangan': '1 sampai 5 Miliar' },
      { 'Jenis': 'Investasi', 'Kode': '3', 'Keterangan': '5 sampai 10 Miliar' },
      { 'Jenis': 'Investasi', 'Kode': '4', 'Keterangan': 'Lebih dari 10 Miliar' },
      { 'Jenis': '', 'Kode': '', 'Keterangan': '' },
      { 'Jenis': 'Omset', 'Kode': '1', 'Keterangan': 'Kurang dari 2 Miliar' },
      { 'Jenis': 'Omset', 'Kode': '2', 'Keterangan': '2 sampai 15 Miliar' },
      { 'Jenis': 'Omset', 'Kode': '3', 'Keterangan': '15 sampai 50 Miliar' },
      { 'Jenis': 'Omset', 'Kode': '4', 'Keterangan': 'Lebih dari 50 Miliar' }
    ];

    const referenceSheet = XLSX.utils.json_to_sheet(referenceData);
    referenceSheet['!cols'] = [
      { wch: 20 }, // Jenis
      { wch: 8 },  // Kode
      { wch: 40 }  // Keterangan
    ];

    XLSX.utils.book_append_sheet(workbook, referenceSheet, 'Kode Referensi');

    // ✅ PERBAIKAN: Sheet informasi upload dengan penekanan field wajib
    const infoData = [
      { 'Informasi': 'Field Wajib (🔴)', 'Detail': 'KIP, Nama Perusahaan, Alamat, Kecamatan, Desa, Badan Usaha, Lokasi Perusahaan, KBLI, Produk, Latitude, Longitude, Tenaga Kerja, Investasi, Omset, Skala, Tahun Direktori (16 field HARUS DIISI)' },
      { 'Informasi': 'Field Opsional (⚪)', 'Detail': 'Kode Pos, Nama Kawasan, Jarak, Telepon Perusahaan, Email Perusahaan, Website Perusahaan, Nama Narasumber, Jabatan Narasumber, Email Narasumber, Telepon Narasumber, PCL Utama, Catatan (12 field BOLEH KOSONG)' },
      { 'Informasi': 'Format File', 'Detail': 'File harus dalam format .xlsx, .xls, atau .csv' },
      { 'Informasi': 'Ukuran File', 'Detail': 'Maksimal 10MB per file' },
      { 'Informasi': 'Header Kolom', 'Detail': 'Jangan ubah nama kolom pada baris pertama' },
      { 'Informasi': 'Format KIP', 'Detail': 'PENTING: KIP harus berformat TEXT, bukan number' },
      { 'Informasi': 'Format Tahun Direktori', 'Detail': 'PENTING: Format TEXT dengan koma (contoh: "2024,2025")' },
      { 'Informasi': 'Format Koordinat', 'Detail': 'Latitude dan Longitude harus berformat NUMBER (desimal)' },
      { 'Informasi': 'Validasi Kecamatan/Desa', 'Detail': 'Nama kecamatan dan desa harus sesuai dengan data master di database' },
      { 'Informasi': 'Mode Upload', 'Detail': 'Tambah Data: menambah/update data existing | Ganti Semua: hapus semua data existing' },
      { 'Informasi': 'Validasi Duplikasi', 'Detail': 'Sistem akan mengecek duplikasi berdasarkan KIP dan tahun direktori' },
      { 'Informasi': 'Error Handling', 'Detail': 'Jika ada data yang tidak valid, sistem akan memberikan pesan error detail' }
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

    console.log('✅ Template generated successfully with 28 columns and 4 sheets');

    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const filename = `template-direktori-perusahaan-${timestamp}.xlsx`;

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('❌ Template generation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error saat membuat template: ' + (error instanceof Error ? error.message : 'Unknown error'),
      details: 'Gagal membuat template Excel dengan 28 kolom'
    }, { status: 500 });
  }
}