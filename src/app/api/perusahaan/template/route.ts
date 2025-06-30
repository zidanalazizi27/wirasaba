// src/app/api/perusahaan/template/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Generating perusahaan template...');

    // Template data dengan struktur sesuai database direktori menggunakan kode referensi
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
        'Latitude': '-7.3953',
        'Longitude': '112.7312',
        'Jarak (KM)': '15.2',
        'Produk': 'Komponen Elektronik',
        'KBLI': '26122',
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
        'Latitude': '-7.4478',
        'Longitude': '112.7183',
        'Jarak (KM)': '2.5',
        'Produk': 'Furniture Kayu',
        'KBLI': '31001',
        'Telepon Perusahaan': '031-8945678',
        'Email Perusahaan': '',
        'Website Perusahaan': '',
        'Tenaga Kerja': '3',
        'Investasi': '2',
        'Omset': '3',
        'Nama Narasumber': 'Siti Aminah',
        'Jabatan Narasumber': 'Pemilik',
        'Email Narasumber': '',
        'Telepon Narasumber': '087654321098',
        'PCL Utama': 'Dewi Sartika',
        'Catatan': '',
        'Tahun Direktori': '2024'
      }
    ];

    // Buat workbook dan worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths untuk readability
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
      { wch: 15 },  // Telepon Perusahaan
      { wch: 20 },  // Email Perusahaan
      { wch: 20 },  // Website Perusahaan
      { wch: 15 },  // Tenaga Kerja
      { wch: 15 },  // Investasi
      { wch: 15 },  // Omset
      { wch: 20 },  // Nama Narasumber
      { wch: 20 },  // Jabatan Narasumber
      { wch: 20 },  // Email Narasumber
      { wch: 15 },  // Telepon Narasumber
      { wch: 15 },  // PCL Utama
      { wch: 30 },  // Catatan
      { wch: 15 }   // Tahun Direktori
    ];
    worksheet['!cols'] = columnWidths;

    // Style header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:AB1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E3F2FD" } },
        alignment: { horizontal: "center" }
      };
    }

    // Tambahkan sheet instruksi
    const instructionsData = [
      { 
        'Kolom': 'KIP', 
        'Keterangan': 'Kode Identifikasi Perusahaan (wajib diisi, maksimal 10 digit angka, unik)', 
        'Contoh': '3515000001',
        'Validasi': 'Angka, maksimal 10 digit'
      },
      { 
        'Kolom': 'Nama Perusahaan', 
        'Keterangan': 'Nama lengkap perusahaan (wajib diisi)', 
        'Contoh': 'PT Contoh Industri Utama',
        'Validasi': 'String, minimal 3 karakter'
      },
      { 
        'Kolom': 'Badan Usaha', 
        'Keterangan': 'Kode badan usaha (wajib diisi)', 
        'Contoh': '1',
        'Validasi': 'Angka 1-8: 1=PT/PT Persero/Perum, 2=CV, 3=Firma, 4=Koperasi/Dana Pensiun, 5=Yayasan, 6=Izin Khusus, 7=Perwakilan Perusahaan/Lembaga Asing, 8=Tidak Berbadan Usaha'
      },
      { 
        'Kolom': 'Alamat', 
        'Keterangan': 'Alamat lengkap perusahaan (wajib diisi)', 
        'Contoh': 'Jl. Industri No. 123, Gedangan',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Kecamatan', 
        'Keterangan': 'Nama kecamatan (wajib diisi)', 
        'Contoh': 'Gedangan',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Desa', 
        'Keterangan': 'Nama desa/kelurahan (wajib diisi)', 
        'Contoh': 'Gedangan',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Kode Pos', 
        'Keterangan': 'Kode pos alamat (opsional)', 
        'Contoh': '61254',
        'Validasi': '5 digit angka'
      },
      { 
        'Kolom': 'Skala', 
        'Keterangan': 'Skala usaha (wajib diisi)', 
        'Contoh': 'Besar, Sedang',
        'Validasi': 'Enum: Besar|Sedang'
      },
      { 
        'Kolom': 'Lokasi Perusahaan', 
        'Keterangan': 'Kode lokasi perusahaan (wajib diisi)', 
        'Contoh': '2',
        'Validasi': 'Angka 1-4: 1=Kawasan Berikat, 2=Kawasan Industri, 3=Kawasan Peruntukan Industri, 4=Luar Kawasan'
      },
      { 
        'Kolom': 'Nama Kawasan', 
        'Keterangan': 'Nama kawasan industri (opsional)', 
        'Contoh': 'SIER',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Latitude', 
        'Keterangan': 'Koordinat lintang (wajib diisi)', 
        'Contoh': '-7.3953',
        'Validasi': 'Desimal, range -90 sampai 90'
      },
      { 
        'Kolom': 'Longitude', 
        'Keterangan': 'Koordinat bujur (wajib diisi)', 
        'Contoh': '112.7312',
        'Validasi': 'Desimal, range -180 sampai 180'
      },
      { 
        'Kolom': 'Jarak (KM)', 
        'Keterangan': 'Jarak ke kantor BPS dalam KM (otomatis dihitung)', 
        'Contoh': '15.2',
        'Validasi': 'Desimal positif'
      },
      { 
        'Kolom': 'Produk', 
        'Keterangan': 'Produk utama perusahaan (wajib diisi)', 
        'Contoh': 'Komponen Elektronik',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'KBLI', 
        'Keterangan': 'Kode KBLI 5 digit (wajib diisi)', 
        'Contoh': '26122',
        'Validasi': '5 digit angka'
      },
      { 
        'Kolom': 'Telepon Perusahaan', 
        'Keterangan': 'Nomor telepon perusahaan (opsional)', 
        'Contoh': '031-8531234',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Email Perusahaan', 
        'Keterangan': 'Email perusahaan (opsional)', 
        'Contoh': 'info@contoh.com',
        'Validasi': 'Format email'
      },
      { 
        'Kolom': 'Website Perusahaan', 
        'Keterangan': 'Website perusahaan (opsional)', 
        'Contoh': 'www.contoh.com',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Tenaga Kerja', 
        'Keterangan': 'Kode range jumlah tenaga kerja (wajib diisi)', 
        'Contoh': '4',
        'Validasi': 'Angka 1-4: 1=1-4 orang, 2=5-19 orang, 3=20-99 orang, 4=Lebih dari 99 orang'
      },
      { 
        'Kolom': 'Investasi', 
        'Keterangan': 'Kode range nilai investasi (wajib diisi)', 
        'Contoh': '4',
        'Validasi': 'Angka 1-4: 1=Kurang dari 1 Miliar, 2=1 sampai 5 Miliar, 3=5 sampai 10 Miliar, 4=Lebih dari 10 Miliar'
      },
      { 
        'Kolom': 'Omset', 
        'Keterangan': 'Kode range nilai omset (wajib diisi)', 
        'Contoh': '4',
        'Validasi': 'Angka 1-4: 1=Kurang dari 2 Miliar, 2=2 sampai 15 Miliar, 3=15 sampai 50 Miliar, 4=Lebih dari 50 Miliar'
      },
      { 
        'Kolom': 'Nama Narasumber', 
        'Keterangan': 'Nama contact person (wajib diisi)', 
        'Contoh': 'Budi Santoso',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Jabatan Narasumber', 
        'Keterangan': 'Jabatan contact person (wajib diisi)', 
        'Contoh': 'Direktur Operasional',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Email Narasumber', 
        'Keterangan': 'Email narasumber (opsional)', 
        'Contoh': 'budi@contoh.com',
        'Validasi': 'Format email'
      },
      { 
        'Kolom': 'Telepon Narasumber', 
        'Keterangan': 'Telepon narasumber (opsional)', 
        'Contoh': '081234567890',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'PCL Utama', 
        'Keterangan': 'Nama PCL yang menangani (wajib diisi)', 
        'Contoh': 'Ahmad Rizki',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Catatan', 
        'Keterangan': 'Catatan tambahan (opsional)', 
        'Contoh': 'Perusahaan aktif dan kooperatif',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Tahun Direktori', 
        'Keterangan': 'Tahun direktori dipisahkan koma (wajib diisi)', 
        'Contoh': '2024,2025',
        'Validasi': 'Format: YYYY,YYYY (2000-2100)'
      }
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [
      { wch: 18 }, // Kolom
      { wch: 60 }, // Keterangan
      { wch: 25 }, // Contoh
      { wch: 25 }  // Validasi
    ];

    // Tambahkan informasi upload sheet
    const infoData = [
      { 'Informasi': 'Format File', 'Detail': 'File harus dalam format .xlsx, .xls, atau .csv' },
      { 'Informasi': 'Ukuran File', 'Detail': 'Maksimal 10MB per file' },
      { 'Informasi': 'Encoding', 'Detail': 'Gunakan UTF-8 untuk karakter khusus' },
      { 'Informasi': 'Header Kolom', 'Detail': 'Jangan ubah nama kolom pada baris pertama' },
      { 'Informasi': 'Data Kosong', 'Detail': 'Baris dengan semua kolom kosong akan diabaikan' },
      { 'Informasi': 'Duplikasi', 'Detail': 'Duplikasi diperiksa berdasarkan kombinasi: KIP + tahun_direktori' },
      { 'Informasi': 'Mode Upload', 'Detail': 'Tambah Data: menambah/update data existing | Ganti Semua: hapus semua data existing' },
      { 'Informasi': 'Validasi', 'Detail': 'Semua field wajib akan divalidasi sesuai kriteria yang ditetapkan' },
      { 'Informasi': 'Kode Referensi', 'Detail': 'Gunakan kode angka untuk Badan Usaha, Lokasi Perusahaan, Tenaga Kerja, Investasi, dan Omset' }
    ];

    const infoSheet = XLSX.utils.json_to_sheet(infoData);
    infoSheet['!cols'] = [
      { wch: 20 }, // Informasi
      { wch: 80 }  // Detail
    ];

    // Tambahkan sheet referensi kode
    const referenceData = [
      { 'Jenis': 'Badan Usaha', 'Kode': '1', 'Keterangan': 'PT/PT Persero/Perum' },
      { 'Jenis': 'Badan Usaha', 'Kode': '2', 'Keterangan': 'CV' },
      { 'Jenis': 'Badan Usaha', 'Kode': '3', 'Keterangan': 'Firma' },
      { 'Jenis': 'Badan Usaha', 'Kode': '4', 'Keterangan': 'Koperasi/ Dana Pensiun' },
      { 'Jenis': 'Badan Usaha', 'Kode': '5', 'Keterangan': 'Yayasan' },
      { 'Jenis': 'Badan Usaha', 'Kode': '6', 'Keterangan': 'Izin Khusus' },
      { 'Jenis': 'Badan Usaha', 'Kode': '7', 'Keterangan': 'Perwakilan Perusahaan/Lembaga Asing' },
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

    // Style header untuk reference sheet
    const refHeaderRange = XLSX.utils.decode_range(referenceSheet['!ref'] || 'A1:C1');
    for (let col = refHeaderRange.s.c; col <= refHeaderRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!referenceSheet[cellAddress]) continue;
      
      referenceSheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E8F5E8" } },
        alignment: { horizontal: "center" }
      };
    }

    // Tambahkan semua sheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Direktori');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Petunjuk Kolom');
    XLSX.utils.book_append_sheet(workbook, referenceSheet, 'Kode Referensi');
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informasi Upload');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      bookSST: false,
      compression: true
    });

    console.log('✅ Perusahaan template generated successfully');

    // Get current date for filename
    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `template_data_direktori_${dateString}.xlsx`;

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
    console.error('❌ Error generating perusahaan template:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal membuat template direktori',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}