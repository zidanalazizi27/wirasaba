import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    // Konfigurasi koneksi database
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });

    // Query untuk mengambil data perusahaan dengan seleksi kolom lengkap
    // Memastikan format yang benar untuk lat/lon (yang disimpan sebagai decimal di database)
    const [rows] = await dbConnection.execute(`
      SELECT 
        p.id_perusahaan, 
        p.kip, 
        p.nama_perusahaan, 
        p.alamat, 
        p.kec, 
        p.des, 
        p.badan_usaha, 
        p.skala, 
        p.lok_perusahaan, 
        p.nama_kawasan, 
        p.lat, 
        p.lon, 
        p.produk, 
        p.KBLI, 
        p.telp_perusahaan, 
        p.email_perusahaan, 
        p.web_perusahaan,
        k.nama_kec,
        d.nama_des,
        bu.ket_bu AS badan_usaha_nama,
        lp.ket_lok AS lokasi_perusahaan_nama
      FROM 
        perusahaan p
      LEFT JOIN 
        kecamatan k ON p.kec = k.kode_kec
      LEFT JOIN 
        desa d ON p.des = d.kode_des
      LEFT JOIN 
        badan_usaha bu ON p.badan_usaha = bu.id_bu
      LEFT JOIN 
        lokasi_perusahaan lp ON p.lok_perusahaan = lp.id_lok
      WHERE 
        p.lat IS NOT NULL AND p.lon IS NOT NULL
    `);

    // Log untuk debugging
    const perusahaanRows = rows as mysql.RowDataPacket[];
    console.log("Data perusahaan pertama:", perusahaanRows.length > 0 ? perusahaanRows[0] : "Tidak ada data");
    console.log(`Total data retrieved: ${perusahaanRows.length}`);

    // Tutup koneksi database
    await dbConnection.end();

    // Kembalikan data dalam format JSON
    return NextResponse.json({ 
      success: true, 
      count: perusahaanRows.length,
      data: perusahaanRows 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error('Database error:', errorMessage);
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}