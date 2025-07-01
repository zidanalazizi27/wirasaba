// src/app/api/perusahaan/template/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Generating perusahaan template ...');

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
        'Telepon Perusahaan': '031-8531234',    // ✅ KOLOM YANG HILANG - DIPERBAIKI
        'Email Perusahaan': 'info@contoh.com',
        'Website Perusahaan': 'www.contoh.com',
        'Tenaga Kerja': '4',
        'Investasi': '4',
        'Omset': '4',
        'Nama Narasumber': 'Budi Santoso',
        'Jabatan Narasumber': 'Direktur Operasional',
        'Email Narasumber': 'budi@contoh.com',
        'Telepon Narasumber': '081234567890',
        'PCL Utama': 'Ahmad Rizki',              // ✅ KOLOM YANG HILANG - DIPERBAIKI
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
        'Nama Kawasan': '',                      // ✅ OPSIONAL - BOLEH KOSONG
        'Latitude': -7.4478,
        'Longitude': 112.7183,
        'Jarak (KM)': 2.5,
        'Produk': 'Furniture Kayu',
        'KBLI': 31001,
        'Telepon Perusahaan': '031-8945678',    // ✅ OPSIONAL - TAPI DIISI CONTOH
        'Email Perusahaan': '',                 // ✅ OPSIONAL - BOLEH KOSONG
        'Website Perusahaan': '',               // ✅ OPSIONAL - BOLEH KOSONG
        'Tenaga Kerja': '3',
        'Investasi': '2',
        'Omset': '2',
        'Nama Narasumber': 'Siti Aminah',
        'Jabatan Narasumber': 'Pemilik',
        'Email Narasumber': '',                 // ✅ OPSIONAL - BOLEH KOSONG
        'Telepon Narasumber': '087654321098',
        'PCL Utama': 'Dewi Sartika',           // ✅ OPSIONAL - TAPI DIISI CONTOH
        'Catatan': '',                          // ✅ OPSIONAL - BOLEH KOSONG
        'Tahun Direktori': '2024'
      }
    ];

    // ✅ PERBAIKAN: Buat workbook dengan cara yang aman
    const workbook = XLSX.utils.book_new();
    
    // ✅ PERBAIKAN: Create main worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // ✅ PERBAIKAN: Set column widths untuk semua 28 kolom
    const columnWidths = [
      { wch: 12 },  // KIP
      { wch: 30 },  // Nama Perusahaan
      { wch: 12 },  // Badan Usaha
      { wch: 40 },  // Alamat
      { wch: 15 },  // Kecamatan
      { wch: 15 },  // Desa
      { wch: 10 },  // Kode Pos
      { wch: 10 },  // Skala
      { wch: 18 },  // Lokasi Perusahaan
      { wch: 20 },  // Nama Kawasan
      { wch: 12 },  // Latitude
      { wch: 12 },  // Longitude
      { wch: 12 },  // Jarak
      { wch: 25 },  // Produk
      { wch: 10 },  // KBLI
      { wch: 15 },  // Telepon Perusahaan ✅ DIPERBAIKI
      { wch: 20 },  // Email Perusahaan
      { wch: 20 },  // Website Perusahaan
      { wch: 15 },  // Tenaga Kerja
      { wch: 15 },  // Investasi
      { wch: 15 },  // Omset
      { wch: 20 },  // Nama Narasumber
      { wch: 20 },  // Jabatan Narasumber
      { wch: 20 },  // Email Narasumber
      { wch: 15 },  // Telepon Narasumber
      { wch: 15 },  // PCL Utama ✅ DIPERBAIKI
      { wch: 30 },  // Catatan
      { wch: 18 }   // Tahun Direktori
    ];
    worksheet['!cols'] = columnWidths;

    // ✅ PERBAIKAN: Sheet petunjuk dengan penanda field wajib/opsional
    const instructionsData = [
      { 
        'Kolom': 'KIP', 
        'Keterangan': '🔴 WAJIB DIISI - Kode Identifikasi Perusahaan (format TEXT)', 
        'Contoh': '3515000001',
        'Validasi': 'String angka, maksimal 10 digit'
      },
      { 
        'Kolom': 'Nama Perusahaan', 
        'Keterangan': '🔴 WAJIB DIISI - Nama lengkap perusahaan', 
        'Contoh': 'PT Contoh Industri Utama',
        'Validasi': 'String, minimal 3 karakter'
      },
      { 
        'Kolom': 'Badan Usaha', 
        'Keterangan': '🔴 WAJIB DIISI - Kode badan usaha: 1=PT, 2=CV, 3=Firma, 4=Koperasi, 5=Yayasan, 6=Izin Khusus, 7=Perwakilan Asing, 8=Tidak Berbadan Usaha', 
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
        'Keterangan': '🔴 WAJIB DIISI - Kode lokasi: 1=Kawasan Berikat, 2=Kawasan Industri, 3=Kawasan Peruntukan Industri, 4=Luar Kawasan', 
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
        'Keterangan': '🔴 WAJIB DIISI - Kode tenaga kerja: 1=1-4 orang, 2=5-19 orang, 3=20-99 orang, 4=Lebih dari 99 orang', 
        'Contoh': '4',
        'Validasi': 'Angka 1-4'
      },
      { 
        'Kolom': 'Investasi', 
        'Keterangan': '🔴 WAJIB DIISI - Kode investasi: 1=Kurang dari 1M, 2=1-5M, 3=5-10M, 4=Lebih dari 10M', 
        'Contoh': '4',
        'Validasi': 'Angka 1-4'
      },
      { 
        'Kolom': 'Omset', 
        'Keterangan': '🔴 WAJIB DIISI - Kode omset: 1=Kurang dari 2M, 2=2-15M, 3=15-50M, 4=Lebih dari 50M', 
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

    // ✅ PERBAIKAN: Sheet informasi upload dengan penekanan field wajib
    const infoData = [
      { 'Informasi': 'Field Wajib (🔴)', 'Detail': 'KIP, Nama Perusahaan, Alamat, Kecamatan, Desa, Badan Usaha, Lokasi Perusahaan, KBLI, Produk, Latitude, Longitude, Tenaga Kerja, Investasi, Omset, Skala, Tahun Direktori (16 field HARUS DIISI)' },
      { 'Informasi': 'Field Opsional (⚪)', 'Detail': 'Kode Pos, Nama Kawasan, Jarak, Telepon Perusahaan, Email Perusahaan, Website Perusahaan, Nama Narasumber, Jabatan Narasumber, Email Narasumber, Telepon Narasumber, PCL Utama, Catatan (12 field BOLEH KOSONG)' },
      { 'Informasi': 'Format File', 'Detail': 'File harus dalam format .xlsx, .xls, atau .csv' },
      { 'Informasi': 'Ukuran File', 'Detail': 'Maksimal 10MB per file' },
      { 'Informasi': 'Header Kolom', 'Detail': 'Jangan ubah nama kolom pada baris pertama' },
      { 'Informasi': 'Format KIP', 'Detail': 'PENTING: KIP harus berformat TEXT, bukan number' },
      { 'Informasi': 'Format Tahun Direktori', 'Detail': 'PENTING: Format TEXT dengan koma (contoh: "2024,2025")' },
      { 'Informasi': 'Format Koordinat', 'Detail': 'PENTING: Latitude dan Longitude harus berformat NUMBER' },
      { 'Informasi': 'Format KBLI', 'Detail': 'PENTING: KBLI harus berformat NUMBER 5 digit' },
      { 'Informasi': 'Duplikasi', 'Detail': 'Duplikasi diperiksa berdasarkan kombinasi: KIP + tahun_direktori' },
      { 'Informasi': 'Mode Upload', 'Detail': 'Tambah Data: menambah/update data | Ganti Semua: hapus semua data lama' }
    ];

    const infoSheet = XLSX.utils.json_to_sheet(infoData);
    infoSheet['!cols'] = [
      { wch: 25 }, // Informasi
      { wch: 80 }  // Detail
    ];

    // ✅ PERBAIKAN: Tambahkan semua sheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Direktori');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Petunjuk Kolom');
    XLSX.utils.book_append_sheet(workbook, referenceSheet, 'Kode Referensi');
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informasi Upload');

    // ✅ PERBAIKAN: Generate Excel buffer dengan opsi yang AMAN
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: false  // CRITICAL: Matikan kompresi untuk menghindari corruption
    });

    console.log('Template generated successfully, size:', excelBuffer.length);

    // ✅ PERBAIKAN: Response headers yang benar
    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `template_direktori_${dateString}.xlsx`;

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ Error generating template:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Gagal membuat template direktori',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    }, { status: 500 });
  }
}