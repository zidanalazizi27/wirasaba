import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    // Buat koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    // Query data perusahaan berdasarkan id
    const [perusahaanRows] = await connection.execute(
      `SELECT 
        p.id_perusahaan, p.kip, p.nama_perusahaan, 
        p.badan_usaha, bu.ket_bu AS badan_usaha_nama,
        p.alamat, 
        p.kec, k.nama_kec AS kec_nama,
        p.des, d.nama_des AS des_nama,
        p.kode_pos, p.skala,
        p.lok_perusahaan, lp.ket_lok AS lok_perusahaan_nama,
        p.nama_kawasan, p.lat, p.lon, p.jarak,
        p.produk, p.KBLI, p.telp_perusahaan, p.email_perusahaan, p.web_perusahaan,
        p.tkerja, tk.ket_tkerja AS tkerja_nama,
        p.investasi, i.ket_investasi AS investasi_nama,
        p.omset, o.ket_omset AS omset_nama,
        p.nama_narasumber, p.jbtn_narasumber, p.email_narasumber, p.telp_narasumber, p.catatan,
        p.pcl_utama
      FROM perusahaan p
      LEFT JOIN badan_usaha bu ON p.badan_usaha = bu.id_bu
      LEFT JOIN kecamatan k ON p.kec = k.kode_kec
      LEFT JOIN desa d ON p.des = d.kode_des
      LEFT JOIN lokasi_perusahaan lp ON p.lok_perusahaan = lp.id_lok
      LEFT JOIN tenaga_kerja tk ON p.tkerja = tk.id_tkerja
      LEFT JOIN investasi i ON p.investasi = i.id_investasi
      LEFT JOIN omset o ON p.omset = o.id_omset
      WHERE p.id_perusahaan = ?`,
      [id]
    );
    if (!perusahaanRows || (perusahaanRows as any[]).length === 0) {
      return NextResponse.json({ error: "Perusahaan tidak ditemukan" }, { status: 404 });
    }
    // Query tahun direktori
    const [direktoriRows] = await connection.execute(
      `SELECT thn_direktori FROM direktori WHERE id_perusahaan = ?`,
      [id]
    );
    
    // Close connection
    await connection.end();
    
    // Prepare response data
    const perusahaan = (perusahaanRows as any[])[0];
    const tahun_direktori = (direktoriRows as any[]).map(row => row.thn_direktori);
    
    return NextResponse.json({
      ...perusahaan,
      tahun_direktori
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// Ganti seluruh fungsi PUT dengan implementasi yang lengkap
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const data = await request.json();
    
    // Tambahkan logging untuk debugging
    console.log("Update request for ID:", id);
    console.log("Update data:", data);
    
    // Buat koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    // Update data pada tabel perusahaan
    const [result] = await connection.execute(
      `UPDATE perusahaan 
       SET 
         kip = ?, 
         nama_perusahaan = ?, 
         badan_usaha = ?, 
         alamat = ?, 
         kec = ?, 
         des = ?, 
         kode_pos = ?, 
         skala = ?, 
         lok_perusahaan = ?, 
         nama_kawasan = ?, 
         lat = ?, 
         lon = ?, 
         jarak = ?, 
         produk = ?, 
         KBLI = ?, 
         telp_perusahaan = ?, 
         email_perusahaan = ?, 
         web_perusahaan = ?, 
         tkerja = ?, 
         investasi = ?, 
         omset = ?, 
         nama_narasumber = ?, 
         jbtn_narasumber = ?, 
         email_narasumber = ?, 
         telp_narasumber = ?, 
         pcl_utama = ?, 
         catatan = ?
       WHERE id_perusahaan = ?`,
      [
        data.kip || null,
        data.nama_perusahaan,
        data.badan_usaha,
        data.alamat,
        data.kec || null,
        data.des || null,
        data.kode_pos || null,
        data.skala,
        data.lok_perusahaan || null,
        data.nama_kawasan || null,
        data.lat || null,
        data.lon || null,
        data.jarak || null,
        data.produk || null,
        data.KBLI || null,
        data.telp_perusahaan || null,
        data.email_perusahaan || null,
        data.web_perusahaan || null,
        data.tkerja || null,
        data.investasi || null,
        data.omset || null,
        data.nama_narasumber || null,
        data.jbtn_narasumber || null,
        data.email_narasumber || null,
        data.telp_narasumber || null,
        data.pcl_utama || null,
        data.catatan || null,
        id
      ]
    );
    
    // Handle tahun direktori - hapus yang lama dan tambahkan yang baru
    if (data.tahun_direktori && Array.isArray(data.tahun_direktori)) {
      // Hapus semua tahun direktori untuk perusahaan ini
      await connection.execute(
        `DELETE FROM direktori WHERE id_perusahaan = ?`,
        [id]
      );
      
      // Tambahkan tahun direktori baru
      if (data.tahun_direktori.length > 0) {
        const direktoriValues = data.tahun_direktori.map(year => [id, year]);
        
        await connection.query(
          `INSERT INTO direktori (id_perusahaan, thn_direktori) VALUES ?`,
          [direktoriValues]
        );
      }
    }
    
    console.log("Update result:", result);
    await connection.end();
    
    return NextResponse.json({ 
      success: true, 
      message: "Data berhasil diperbarui" 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat memperbarui data: " + error.message 
    }, { status: 500 });
  }
}