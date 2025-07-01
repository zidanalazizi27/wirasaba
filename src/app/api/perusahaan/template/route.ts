// src/app/api/perusahaan/template/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Generating perusahaan template...');

    // ✅ Template data dengan format yang BENAR untuk Excel
    const templateData = [
      {
        'KIP': '3515000001',  // ✅ String, bukan number
        'Nama Perusahaan': 'PT Contoh Industri Utama',
        'Badan Usaha': '1',
        'Alamat': 'Jl. Industri No. 123, Gedangan',
        'Kecamatan': 'Gedangan',
        'Desa': 'Gedangan',
        'Kode Pos': '61254',
        'Skala': 'Besar',
        'Lokasi Perusahaan': '2',
        'Nama Kawasan': 'SIER',
        'Latitude': -7.3953,  // ✅ Number, bukan string
        'Longitude': 112.7312,  // ✅ Number, bukan string
        'Jarak (KM)': 15.2,
        'Produk': 'Komponen Elektronik',
        'KBLI': 26122,  // ✅ Number, bukan string
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
        'Tahun Direktori': '2024,2025'  // ✅ String format dengan koma, BUKAN number
      },
      {
        'KIP': '3515000002',  // ✅ String, bukan number
        'Nama Perusahaan': 'CV Maju Bersama',
        'Badan Usaha': '2',
        'Alamat': 'Jl. Raya Sidoarjo No. 456',
        'Kecamatan': 'Sidoarjo',
        'Desa': 'Lemahputro',
        'Kode Pos': '61213',
        'Skala': 'Sedang',
        'Lokasi Perusahaan': '4',
        'Nama Kawasan': '',
        'Latitude': -7.4478,  // ✅ Number
        'Longitude': 112.7183,  // ✅ Number
        'Jarak (KM)': 2.5,
        'Produk': 'Furniture Kayu',
        'KBLI': 31001,  // ✅ Number
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
        'Tahun Direktori': '2024'  // ✅ String format
      }
    ];

    // Buat workbook dan worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // ✅ PERBAIKAN: Set format Excel yang tepat untuk kolom-kolom khusus
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:AB3');

    // Format kolom KIP sebagai text (kolom A = 0)
    for (let row = range.s.r; row <= range.e.r; row++) {
      const kipCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      if (kipCell) {
        kipCell.z = '@'; // Text format
        kipCell.t = 's'; // String type
      }
    }

    // Format kolom Tahun Direktori sebagai text (kolom AB = 27)
    for (let row = range.s.r; row <= range.e.r; row++) {
      const tahunCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 27 })];
      if (tahunCell) {
        tahunCell.z = '@'; // Text format
        tahunCell.t = 's'; // String type
      }
    }

    // Format kolom KBLI sebagai number (kolom O = 14)
    for (let row = range.s.r; row <= range.e.r; row++) {
      const kbliCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 14 })];
      if (kbliCell) {
        kbliCell.z = '0'; // Number format
        kbliCell.t = 'n'; // Number type
      }
    }

    // Format kolom Latitude sebagai number (kolom K = 10)
    for (let row = range.s.r; row <= range.e.r; row++) {
      const latCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 10 })];
      if (latCell) {
        latCell.z = '0.0000'; // Decimal format
        latCell.t = 'n'; // Number type
      }
    }

    // ✅ BUG FIX: Format kolom Longitude sebagai number (kolom L = 11) 
    // Sebelumnya salah menggunakan variabel latCell
    for (let row = range.s.r; row <= range.e.r; row++) {
      const lonCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 11 })];
      if (lonCell) {
        lonCell.z = '0.0000'; // Decimal format - FIX: menggunakan lonCell bukan latCell
        lonCell.t = 'n'; // Number type
      }
    }

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
      { wch: 18 }   // Tahun Direktori (diperbesar untuk format text)
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

    // Tambahkan sheet instruksi dengan kode referensi yang benar
    const instructionsData = [
      { 
        'Kolom': 'KIP', 
        'Keterangan': 'Kode Identifikasi Perusahaan (WAJIB DIISI, maksimal 10 digit angka, format TEXT)', 
        'Contoh': '3515000001',
        'Validasi': 'String angka, maksimal 10 digit'
      },
      { 
        'Kolom': 'Nama Perusahaan', 
        'Keterangan': 'Nama lengkap perusahaan (WAJIB DIISI)', 
        'Contoh': 'PT Contoh Industri Utama',
        'Validasi': 'String, minimal 3 karakter'
      },
      { 
        'Kolom': 'Badan Usaha', 
        'Keterangan': 'Kode badan usaha (WAJIB DIISI): 1=PT/PT Persero/Perum, 2=CV, 3=Firma, 4=Koperasi/Dana Pensiun, 5=Yayasan, 6=Izin Khusus, 7=Perwakilan Perusahaan/Lembaga Asing, 8=Tidak Berbadan Usaha', 
        'Contoh': '1',
        'Validasi': 'Angka 1-8'
      },
      { 
        'Kolom': 'Alamat', 
        'Keterangan': 'Alamat lengkap perusahaan (WAJIB DIISI)', 
        'Contoh': 'Jl. Industri No. 123, Gedangan',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Kecamatan', 
        'Keterangan': 'Nama kecamatan (WAJIB DIISI, harus sesuai data master)', 
        'Contoh': 'Gedangan',
        'Validasi': 'String, harus ada di database'
      },
      { 
        'Kolom': 'Desa', 
        'Keterangan': 'Nama desa/kelurahan (WAJIB DIISI, harus sesuai data master)', 
        'Contoh': 'Gedangan',
        'Validasi': 'String, harus ada di database'
      },
      { 
        'Kolom': 'Kode Pos', 
        'Keterangan': 'Kode pos alamat (OPSIONAL)', 
        'Contoh': '61254',
        'Validasi': '5 digit angka'
      },
      { 
        'Kolom': 'Skala', 
        'Keterangan': 'Skala usaha (WAJIB DIISI)', 
        'Contoh': 'Besar, Sedang',
        'Validasi': 'Enum: Besar|Sedang'
      },
      { 
        'Kolom': 'Lokasi Perusahaan', 
        'Keterangan': 'Kode lokasi perusahaan (WAJIB DIISI): 1=Kawasan Berikat, 2=Kawasan Industri, 3=Kawasan Peruntukan Industri, 4=Luar Kawasan', 
        'Contoh': '2',
        'Validasi': 'Angka 1-4'
      },
      { 
        'Kolom': 'Nama Kawasan', 
        'Keterangan': 'Nama kawasan industri (OPSIONAL)', 
        'Contoh': 'SIER',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Latitude', 
        'Keterangan': 'Koordinat lintang (WAJIB DIISI, format NUMBER)', 
        'Contoh': '-7.3953',
        'Validasi': 'Number desimal, range -90 sampai 90'
      },
      { 
        'Kolom': 'Longitude', 
        'Keterangan': 'Koordinat bujur (WAJIB DIISI, format NUMBER)', 
        'Contoh': '112.7312',
        'Validasi': 'Number desimal, range -180 sampai 180'
      },
      { 
        'Kolom': 'Jarak (KM)', 
        'Keterangan': 'Jarak ke kantor BPS dalam KM (OPSIONAL - otomatis dihitung)', 
        'Contoh': '15.2',
        'Validasi': 'Number desimal positif'
      },
      { 
        'Kolom': 'Produk', 
        'Keterangan': 'Produk utama perusahaan (WAJIB DIISI)', 
        'Contoh': 'Komponen Elektronik',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'KBLI', 
        'Keterangan': 'Kode KBLI 5 digit (WAJIB DIISI, format NUMBER)', 
        'Contoh': '26122',
        'Validasi': '5 digit number'
      },
      { 
        'Kolom': 'Telepon Perusahaan', 
        'Keterangan': 'Nomor telepon perusahaan (OPSIONAL)', 
        'Contoh': '031-8531234',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Email Perusahaan', 
        'Keterangan': 'Email perusahaan (OPSIONAL)', 
        'Contoh': 'info@contoh.com',
        'Validasi': 'Format email valid'
      },
      { 
        'Kolom': 'Website Perusahaan', 
        'Keterangan': 'Website perusahaan (OPSIONAL)', 
        'Contoh': 'www.contoh.com',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Tenaga Kerja', 
        'Keterangan': 'Kode tenaga kerja (WAJIB DIISI): 1=1-4 orang, 2=5-19 orang, 3=20-99 orang, 4=Lebih dari 99 orang', 
        'Contoh': '4',
        'Validasi': 'Angka 1-4'
      },
      { 
        'Kolom': 'Investasi', 
        'Keterangan': 'Kode investasi (WAJIB DIISI): 1=Kurang dari 1 Miliar, 2=1 sampai 5 Miliar, 3=5 sampai 10 Miliar, 4=Lebih dari 10 Miliar', 
        'Contoh': '4',
        'Validasi': 'Angka 1-4'
      },
      { 
        'Kolom': 'Omset', 
        'Keterangan': 'Kode omset (WAJIB DIISI): 1=Kurang dari 2 Miliar, 2=2 sampai 15 Miliar, 3=15 sampai 50 Miliar, 4=Lebih dari 50 Miliar', 
        'Contoh': '4',
        'Validasi': 'Angka 1-4'
      },
      { 
        'Kolom': 'Nama Narasumber', 
        'Keterangan': 'Nama contact person (OPSIONAL)', 
        'Contoh': 'Budi Santoso',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Jabatan Narasumber', 
        'Keterangan': 'Jabatan contact person (OPSIONAL)', 
        'Contoh': 'Direktur Operasional',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Email Narasumber', 
        'Keterangan': 'Email narasumber (OPSIONAL)', 
        'Contoh': 'budi@contoh.com',
        'Validasi': 'Format email valid'
      },
      { 
        'Kolom': 'Telepon Narasumber', 
        'Keterangan': 'Telepon narasumber (OPSIONAL)', 
        'Contoh': '081234567890',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'PCL Utama', 
        'Keterangan': 'Nama PCL yang menangani (OPSIONAL)', 
        'Contoh': 'Ahmad Rizki',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Catatan', 
        'Keterangan': 'Catatan tambahan (OPSIONAL)', 
        'Contoh': 'Perusahaan aktif dan kooperatif',
        'Validasi': 'String'
      },
      { 
        'Kolom': 'Tahun Direktori', 
        'Keterangan': 'Tahun direktori dipisahkan koma (WAJIB DIISI, format TEXT)', 
        'Contoh': '2024,2025 atau 2024',
        'Validasi': 'String format: YYYY,YYYY atau YYYY (2000-2100)'
      }
    ];

    const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [
      { wch: 18 }, // Kolom
      { wch: 80 }, // Keterangan (diperbesar untuk menampung kode referensi)
      { wch: 25 }, // Contoh
      { wch: 30 }  // Validasi (diperbesar untuk detail format)
    ];

    // Style header untuk instructions sheet
    const instHeaderRange = XLSX.utils.decode_range(instructionsSheet['!ref'] || 'A1:D1');
    for (let col = instHeaderRange.s.c; col <= instHeaderRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!instructionsSheet[cellAddress]) continue;
      
      instructionsSheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "FFF2CC" } },
        alignment: { horizontal: "center" }
      };
    }

    // Tambahkan sheet kode referensi
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

    // Tambahkan informasi upload sheet dengan penekanan pada format
    const infoData = [
      { 'Informasi': 'Format File', 'Detail': 'File harus dalam format .xlsx, .xls, atau .csv' },
      { 'Informasi': 'Ukuran File', 'Detail': 'Maksimal 10MB per file' },
      { 'Informasi': 'Encoding', 'Detail': 'Gunakan UTF-8 untuk karakter khusus' },
      { 'Informasi': 'Header Kolom', 'Detail': 'Jangan ubah nama kolom pada baris pertama' },
      { 'Informasi': 'Data Kosong', 'Detail': 'Baris dengan semua kolom kosong akan diabaikan' },
      { 'Informasi': 'Field Wajib', 'Detail': 'KIP, Nama Perusahaan, Alamat, Kecamatan, Desa, Badan Usaha, Lokasi Perusahaan, KBLI, Produk, Latitude, Longitude, Tenaga Kerja, Investasi, Omset, Skala, Tahun Direktori (HARUS DIISI)' },
      { 'Informasi': 'Field Opsional', 'Detail': 'Kode Pos, Nama Kawasan, Jarak, Telepon Perusahaan, Email Perusahaan, Website Perusahaan, Nama Narasumber, Jabatan Narasumber, Email Narasumber, Telepon Narasumber, PCL Utama, Catatan' },
      { 'Informasi': 'Format KIP', 'Detail': '⚠️ PENTING: KIP harus berformat TEXT (contoh: "3515000001"), bukan number. Format kolom sebagai Text di Excel!' },
      { 'Informasi': 'Format Tahun Direktori', 'Detail': '⚠️ PENTING: Tahun Direktori harus berformat TEXT dengan koma (contoh: "2024,2025" atau "2024"), bukan number gabungan!' },
      { 'Informasi': 'Format Koordinat', 'Detail': '⚠️ PENTING: Latitude dan Longitude harus berformat NUMBER (contoh: -7.3953, 112.7312), bukan text!' },
      { 'Informasi': 'Format KBLI', 'Detail': '⚠️ PENTING: KBLI harus berformat NUMBER 5 digit (contoh: 26122), bukan text!' },
      { 'Informasi': 'Kode Referensi', 'Detail': 'Gunakan kode angka untuk: Badan Usaha (1-8), Lokasi Perusahaan (1-4), Tenaga Kerja (1-4), Investasi (1-4), Omset (1-4). Lihat sheet Kode Referensi' },
      { 'Informasi': 'Duplikasi', 'Detail': 'Duplikasi diperiksa berdasarkan kombinasi: KIP + tahun_direktori' },
      { 'Informasi': 'Mode Upload', 'Detail': 'Tambah Data: menambah/update data existing | Ganti Semua: hapus semua data existing' },
      { 'Informasi': 'Validasi', 'Detail': 'Semua field wajib akan divalidasi sesuai kriteria yang ditetapkan' },
      { 'Informasi': 'Tips Excel', 'Detail': 'Gunakan Format Cells untuk memastikan tipe data benar: KIP & Tahun Direktori = Text, Koordinat & KBLI = Number' }
    ];

    const infoSheet = XLSX.utils.json_to_sheet(infoData);
    infoSheet['!cols'] = [
      { wch: 25 }, // Informasi (diperbesar)
      { wch: 120 } // Detail (diperbesar untuk menampung informasi format)
    ];

    // Style header untuk info sheet
    const infoHeaderRange = XLSX.utils.decode_range(infoSheet['!ref'] || 'A1:B1');
    for (let col = infoHeaderRange.s.c; col <= infoHeaderRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!infoSheet[cellAddress]) continue;
      
      infoSheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "FCE4EC" } },
        alignment: { horizontal: "center" }
      };
    }

    // Tambahkan semua sheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Direktori');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Petunjuk Kolom');
    XLSX.utils.book_append_sheet(workbook, referenceSheet, 'Kode Referensi');
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informasi Upload');

    // Generate Excel buffer dengan optimasi
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      bookSST: false,
      compression: true,
      cellStyles: true  // ✅ Pastikan cell styles disimpan
    });

    console.log('✅ Perusahaan template generated successfully with proper formatting');

    // Get current date for filename
    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `template_data_direktori_fixed_${dateString}.xlsx`;

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