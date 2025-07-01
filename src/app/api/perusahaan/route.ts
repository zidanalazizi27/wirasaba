import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Utility function to create database connection
async function createDbConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

// Fungsi untuk menentukan status berdasarkan persentase penyelesaian
function determineStatus(completedCount: number, totalCount: number): string {
  if (totalCount === 0) return "kosong";
  
  const percentage = (completedCount / totalCount) * 100;
  
  if (percentage >= 80) return "tinggi";
  if (percentage >= 50) return "sedang";
  return "rendah";
}

// Fungsi untuk deduplication perusahaan berdasarkan KIP + nama_perusahaan
function deduplicatePerusahaan(data: any[]): any[] {
  const uniqueMap = new Map<string, any>();
  const duplicateInfo = new Map<string, any[]>();

  // Group berdasarkan kombinasi KIP + nama (case insensitive)
  data.forEach((item) => {
    const key = `${(item.kip || '').toLowerCase()}-${(item.nama_perusahaan || '').toLowerCase()}`;
    
    if (!duplicateInfo.has(key)) {
      duplicateInfo.set(key, []);
    }
    duplicateInfo.get(key)!.push(item);
  });

  // Proses setiap group
  duplicateInfo.forEach((group, key) => {
    if (group.length > 1) {
      // Ada duplikasi - ambil yang terbaru (berdasarkan id_perusahaan tertinggi)
      const latest = group.reduce((prev, current) => {
        return Number(current.id_perusahaan) > Number(prev.id_perusahaan) ? current : prev;
      });

      // Tandai sebagai duplicate dan simpan info duplikasi
      latest.isDuplicate = true;
      latest.duplicateCount = group.length;
      latest.duplicateIds = group.map(g => g.id_perusahaan);
      
      uniqueMap.set(key, latest);
    } else {
      // Tidak ada duplikasi
      const item = group[0];
      item.isDuplicate = false;
      item.duplicateCount = 1;
      uniqueMap.set(key, item);
    }
  });

  // Convert map to array dan sort berdasarkan nama
  return Array.from(uniqueMap.values()).sort((a, b) => 
    (a.nama_perusahaan || '').localeCompare(b.nama_perusahaan || '')
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const deduplicate = searchParams.get("deduplicate") === "true"; // Parameter untuk deduplication
  const year = searchParams.get("year") || new Date().getFullYear().toString();
  const searchTerm = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const pcl = searchParams.get("pcl") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = (page - 1) * limit;

  // Special endpoint untuk dropdown riwayat survei
  const forDropdown = searchParams.get("for_dropdown") === "true";

  try {
    const connection = await createDbConnection();

    // Query berbeda untuk dropdown vs table display
    let query: string;
    let queryParams: any[] = [];

    if (forDropdown) {
      // Query sederhana untuk dropdown - hanya ambil data yang diperlukan
      query = `
        SELECT DISTINCT
          p.id_perusahaan, 
          p.kip, 
          p.nama_perusahaan,
          p.created_at,
          p.updated_at
        FROM perusahaan p
        WHERE 1=1
      `;

      // Search filter untuk dropdown
      if (searchTerm) {
        query += " AND (p.nama_perusahaan LIKE ? OR p.kip LIKE ?)";
        queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
      }

      query += " ORDER BY p.nama_perusahaan ASC";

      // Limit lebih besar untuk dropdown
      query += " LIMIT ?";
      queryParams.push(1000);

    } else {
      // Query kompleks untuk table display (existing logic)
      let whereConditions = [];
      
      // Filter berdasarkan tahun direktori
      whereConditions.push("d.thn_direktori = ?");
      queryParams.push(year);

      // Filter berdasarkan pencarian
      if (searchTerm) {
        whereConditions.push("(p.kip LIKE ? OR p.nama_perusahaan LIKE ? OR p.alamat LIKE ?)");
        queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
      }

      // Filter berdasarkan PCL
      if (pcl !== "all") {
        whereConditions.push("p.pcl_utama = ?");
        queryParams.push(pcl);
      }

      // Build WHERE clause
      const whereClause = whereConditions.length > 0 
        ? "WHERE " + whereConditions.join(" AND ") 
        : "";

      query = `
        SELECT 
          p.id_perusahaan, 
          p.kip, 
          p.nama_perusahaan, 
          p.alamat, 
          p.jarak,
          p.pcl_utama,
          p.created_at,
          p.updated_at,
          (SELECT COUNT(*) FROM riwayat_survei rs WHERE rs.id_perusahaan = p.id_perusahaan) AS total_survei,
          (SELECT COUNT(*) FROM riwayat_survei rs WHERE rs.id_perusahaan = p.id_perusahaan AND rs.selesai = 'Iya') AS completed_survei
        FROM perusahaan p
        JOIN direktori d ON p.id_perusahaan = d.id_perusahaan
        ${whereClause}
        GROUP BY p.id_perusahaan
        ORDER BY p.id_perusahaan ASC
      `;
    }

    const [rows] = await connection.execute(query, queryParams);
    let data = rows as any[];

    // Jika deduplicate = true, proses untuk menghilangkan duplikasi
    if (deduplicate && forDropdown) {
      data = deduplicatePerusahaan(data);
    }

    // Processing berbeda untuk dropdown vs table
    if (forDropdown) {
      // Simple processing untuk dropdown
      const processedData = data.map(item => ({
        id: item.id_perusahaan,
        name: item.nama_perusahaan || '',
        kip: item.kip || '',
        isDuplicate: item.isDuplicate || false,
        duplicateCount: item.duplicateCount || 1,
        duplicateIds: item.duplicateIds || [item.id_perusahaan]
      }));

      await connection.end();

      return NextResponse.json({
        success: true,
        data: processedData,
        count: processedData.length,
        deduplicated: deduplicate,
      });

    } else {
      // Complex processing untuk table (existing logic)
      const formattedRows = data.map((row, index) => {
        const totalSurvei = row.total_survei || 0;
        const completedSurvei = row.completed_survei || 0;
        const calcStatus = determineStatus(completedSurvei, totalSurvei);
        
        return {
          ...row,
          jarak: row.jarak ? `${row.jarak} km` : "",
          pcl: row.pcl_utama || "-",
          status: calcStatus,
          completion_percentage: totalSurvei > 0 ? Math.round((completedSurvei / totalSurvei) * 100) : 0
        };
      });

      // Filter berdasarkan status
      let filteredRows = formattedRows;
      if (status !== "all") {
        filteredRows = formattedRows.filter(row => row.status === status);
      }
      
      // Apply pagination after filtering
      const total = filteredRows.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedRows = filteredRows.slice(offset, offset + limit).map((row, idx) => ({
        ...row,
        no: offset + idx + 1
      }));

      await connection.end();

      return NextResponse.json({
        data: paginatedRows,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          perPage: limit,
        }
      });
    }

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Database error",
      message: (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle special actions
    if (body.action === "get_duplicates") {
      return await handleGetDuplicates(body);
    }

    // Handle regular perusahaan creation (existing logic)
    return await handleCreatePerusahaan(body);

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat memproses request: " + (error as Error).message 
    }, { status: 500 });
  }
}

// Handler untuk mendapatkan semua duplikat dari sebuah perusahaan
async function handleGetDuplicates(body: any) {
  const { kip, nama_perusahaan } = body;

  if (!kip || !nama_perusahaan) {
    return NextResponse.json(
      { success: false, message: "KIP dan nama_perusahaan diperlukan" },
      { status: 400 }
    );
  }

  try {
    const connection = await createDbConnection();

    // Cari semua perusahaan dengan KIP dan nama yang sama (case insensitive)
    const [rows] = await connection.execute(
      `SELECT 
        p.id_perusahaan,
        p.kip,
        p.nama_perusahaan,
        p.alamat,
        p.created_at,
        p.updated_at,
        COUNT(rs.id_riwayat) as total_survei
       FROM perusahaan p
       LEFT JOIN riwayat_survei rs ON p.id_perusahaan = rs.id_perusahaan
       WHERE LOWER(p.kip) = LOWER(?) AND LOWER(p.nama_perusahaan) = LOWER(?)
       GROUP BY p.id_perusahaan
       ORDER BY p.updated_at DESC, p.id_perusahaan DESC`,
      [kip, nama_perusahaan]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      data: rows,
      count: (rows as any[]).length,
    });

  } catch (error) {
    console.error("Error getting duplicates:", error);
    return NextResponse.json(
      { success: false, message: "Error mendapatkan data duplikat" },
      { status: 500 }
    );
  }
}

// Handler untuk membuat perusahaan baru (existing logic)
async function handleCreatePerusahaan(data: any) {
  console.log("Data yang diterima:", data);
  
  try {
    const connection = await createDbConnection();
    
    // 1. Insert ke tabel perusahaan
    const [resultPerusahaan] = await connection.execute(
      `INSERT INTO perusahaan (
        kip, nama_perusahaan, badan_usaha, alamat, kec, des, 
        kode_pos, skala, lok_perusahaan, nama_kawasan, lat, lon, 
        jarak, produk, KBLI, telp_perusahaan, email_perusahaan, 
        web_perusahaan, tkerja, investasi, omset, nama_narasumber, 
        jbtn_narasumber, email_narasumber, telp_narasumber, pcl_utama, catatan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        data.catatan || null
      ]
    );
    
    console.log("Hasil INSERT perusahaan:", resultPerusahaan);
    
    // Ambil ID perusahaan yang baru saja dimasukkan
    const newPerusahaanId = (resultPerusahaan as any).insertId;
    
    if (!newPerusahaanId) {
      console.error("Insert berhasil tetapi tidak mendapatkan ID perusahaan baru", resultPerusahaan);
      throw new Error("Insert berhasil tetapi tidak mendapatkan ID perusahaan baru");
    }
    
    // 2. Insert ke tabel direktori untuk tahun-tahun yang dipilih
    if (data.tahun_direktori && Array.isArray(data.tahun_direktori) && data.tahun_direktori.length > 0) {
      // Prepare values for bulk insert
      const direktoriValues = data.tahun_direktori.map((year: any) => [newPerusahaanId, year]);
      
      // Gunakan prepared statement untuk menyisipkan data direktori
      await connection.query(
        `INSERT INTO direktori (id_perusahaan, thn_direktori) VALUES ?`,
        [direktoriValues]
      );
    }
    
    await connection.end();
    
    return NextResponse.json({ 
      success: true, 
      message: "Data berhasil disimpan",
      id: newPerusahaanId
    });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat menyimpan data: " + (error as Error).message 
    }, { status: 500 });
  }
}