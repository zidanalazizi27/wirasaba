// src/app/api/riwayat-survei/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "wirasaba",
};

// Utility function to create database connection
async function createDbConnection() {
  return await mysql.createConnection(dbConfig);
}

// GET endpoint with advanced filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchTerm = searchParams.get("search") || "";
  const surveiFilter = searchParams.get("survei") || "all";
  const pclFilter = searchParams.get("pcl") || "all";
  const selesaiFilter = searchParams.get("selesai") || "all";
  const tahunFilter = searchParams.get("tahun") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  const surveiResponse = await fetch("/api/riwayat-survei/filters?type=survei");
  const pclResponse = await fetch("/api/riwayat-survei/filters?type=pcl");
  const tahunResponse = await fetch("/api/riwayat-survei/filters?type=tahun");

  // Handle special endpoints
  const pathname = request.nextUrl.pathname;
  
  // Check duplicate endpoint
  if (searchParams.has("check_duplicate")) {
    return handleCheckDuplicate(request);
  }
  if (searchParams.has("filters")) {
    return handleGetFilters(request);
  }

  // Tambahkan function ini
  async function handleGetFilters(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    
    try {
      const connection = await createDbConnection();
      let query = "";
      
      switch (type) {
        case "survei":
          query = "SELECT DISTINCT s.id_survei as uid, s.nama_survei as name FROM survei s ORDER BY s.nama_survei";
          break;
        case "pcl":
          query = "SELECT DISTINCT p.id_pcl as uid, p.nama_pcl as name FROM pcl p ORDER BY p.nama_pcl";
          break;
        case "tahun":
          query = "SELECT DISTINCT s.tahun as uid, s.tahun as name FROM survei s ORDER BY s.tahun DESC";
          break;
        default:
          return NextResponse.json({ success: false, message: "Invalid filter type" }, { status: 400 });
      }
      
      const [rows] = await connection.execute(query);
      await connection.end();
      
      return NextResponse.json({
        success: true,
        data: rows
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "Error fetching filter options"
      }, { status: 500 });
    }
  }

  try {
    // Create database connection
    const connection = await createDbConnection();

    // Prepare where conditions
    let whereConditions = [];
    let queryParams = [];

    // Search filter (multi-column)
    if (searchTerm) {
      whereConditions.push(
        "(s.nama_survei LIKE ? OR p.kip LIKE ? OR p.nama_perusahaan LIKE ? OR pcl.nama_pcl LIKE ?)"
      );
      queryParams.push(
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`
      );
    }

    // Survei filter
    if (surveiFilter !== "all") {
      whereConditions.push("r.id_survei = ?");
      queryParams.push(surveiFilter);
    }

    // PCL filter
    if (pclFilter !== "all") {
      whereConditions.push("r.id_pcl = ?");
      queryParams.push(pclFilter);
    }

    // Selesai filter
    if (selesaiFilter !== "all") {
      whereConditions.push("r.selesai = ?");
      queryParams.push(selesaiFilter);
    }

    // Tahun filter
    if (tahunFilter !== "all") {
      whereConditions.push("s.tahun = ?");
      queryParams.push(parseInt(tahunFilter));
    }

    // Build WHERE clause
    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // Get sort parameters if any
    const sorts = [];
    let i = 0;
    while (searchParams.has(`sort[${i}][column]`)) {
      const column = searchParams.get(`sort[${i}][column]`);
      const direction = searchParams.get(`sort[${i}][direction]`);
      if (column && direction) {
        // Validate column name to prevent SQL injection
        const validColumns = ["nama_survei", "kip", "nama_perusahaan", "nama_pcl", "tahun"];
        if (validColumns.includes(column)) {
          sorts.push({ column, direction });
        }
      }
      i++;
    }

    // Build ORDER BY clause
    let orderByClause = "";
    if (sorts.length > 0) {
      const orderByParts = sorts.map((sort) => {
        const direction = sort.direction === "ascending" ? "ASC" : "DESC";
        
        // Map column names to their table prefixes
        let columnWithPrefix;
        switch (sort.column) {
          case "nama_survei":
            columnWithPrefix = "s.nama_survei";
            break;
          case "kip":
            columnWithPrefix = "p.kip";
            break;
          case "nama_perusahaan":
            columnWithPrefix = "p.nama_perusahaan";
            break;
          case "nama_pcl":
            columnWithPrefix = "pcl.nama_pcl";
            break;
          case "tahun":
            columnWithPrefix = "s.tahun";
            break;
          default:
            columnWithPrefix = "r.id_riwayat";
        }
        
        return `${columnWithPrefix} ${direction}`;
      });
      orderByClause = "ORDER BY " + orderByParts.join(", ");
    } else {
      // Default sorting
      orderByClause = "ORDER BY r.id_riwayat DESC";
    }

    // Count total records for pagination
    const [totalRows] = await connection.execute(
      `SELECT COUNT(*) as total 
       FROM riwayat_survei r
       JOIN survei s ON r.id_survei = s.id_survei
       JOIN perusahaan p ON r.id_perusahaan = p.id_perusahaan
       JOIN pcl ON r.id_pcl = pcl.id_pcl
       ${whereClause}`,
      queryParams
    );

    // Execute query with pagination
    const [rows] = await connection.execute(
      `SELECT 
         r.id_riwayat, 
         r.id_survei, 
         s.nama_survei,
         r.id_perusahaan,
         p.kip,
         p.nama_perusahaan,
         r.id_pcl,
         pcl.nama_pcl,
         s.tahun,
         r.selesai,
         r.ket_survei
       FROM riwayat_survei r
       JOIN survei s ON r.id_survei = s.id_survei
       JOIN perusahaan p ON r.id_perusahaan = p.id_perusahaan
       JOIN pcl ON r.id_pcl = pcl.id_pcl
       ${whereClause}
       ${orderByClause}
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Close connection
    await connection.end();

    // Format the response
    const total = (totalRows as any[])[0].total;

    return NextResponse.json({
      success: true,
      count: total,
      data: rows,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new riwayat survei
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.id_survei || !data.id_perusahaan || !data.id_pcl || !data.selesai) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua field wajib diisi",
        },
        { status: 400 }
      );
    }

    // Create database connection
    const connection = await createDbConnection();

    // Check for duplicate combination
    const [duplicateCheck] = await connection.execute(
      `SELECT r.id_riwayat, s.nama_survei, p.nama_perusahaan, p.kip
       FROM riwayat_survei r
       JOIN survei s ON r.id_survei = s.id_survei
       JOIN perusahaan p ON r.id_perusahaan = p.id_perusahaan
       WHERE r.id_survei = ? AND r.id_perusahaan = ?`,
      [data.id_survei, data.id_perusahaan]
    );

    if ((duplicateCheck as any[]).length > 0) {
      const duplicate = (duplicateCheck as any[])[0];
      await connection.end();
      return NextResponse.json(
        {
          success: false,
          message: `Kombinasi survei "${duplicate.nama_survei}" dan perusahaan "${duplicate.nama_perusahaan}" (KIP: ${duplicate.kip}) sudah terdaftar dalam sistem.`,
        },
        { status: 409 }
      );
    }

    // Insert new riwayat survei
    const [result] = await connection.execute(
      `INSERT INTO riwayat_survei (id_survei, id_perusahaan, id_pcl, selesai, ket_survei) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.id_survei,
        data.id_perusahaan,
        data.id_pcl,
        data.selesai,
        data.ket_survei || "",
      ]
    );

    // Get new riwayat ID
    const newRiwayatId = (result as any).insertId;

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Data riwayat survei berhasil ditambahkan",
      id: newRiwayatId,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error saat menyimpan data: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for bulk delete
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    // Validasi input
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "IDs array is required and cannot be empty",
        },
        { status: 400 }
      );
    }

    // Validasi bahwa semua IDs adalah number
    const validIds = ids.filter(id => Number.isInteger(Number(id)));
    if (validIds.length !== ids.length) {
      return NextResponse.json(
        {
          success: false,
          message: "All IDs must be valid integers",
        },
        { status: 400 }
      );
    }

    const connection = await createDbConnection();

    // Buat placeholders untuk query
    const placeholders = validIds.map(() => '?').join(',');
    
    // Query untuk menghapus multiple records
    const deleteQuery = `
      DELETE FROM riwayat_survei 
      WHERE id_riwayat IN (${placeholders})
    `;

    const [result] = await connection.execute(deleteQuery, validIds);
    const deleteResult = result as any;

    await connection.end();

    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada data yang dihapus. Mungkin data sudah tidak ada.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${deleteResult.affectedRows} data riwayat survei berhasil dihapus`,
      deletedCount: deleteResult.affectedRows,
    });

  } catch (error) {
    console.error("Error bulk deleting riwayat survei:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menghapus data",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// Helper function untuk check duplicate
async function handleCheckDuplicate(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);
    const id_survei = searchParams.get("id_survei");
    const id_perusahaan = searchParams.get("id_perusahaan");
    const exclude_id = searchParams.get("exclude_id");

    // Validasi parameter wajib
    if (!id_survei || !id_perusahaan) {
      return NextResponse.json(
        {
          success: false,
          message: "Parameter id_survei dan id_perusahaan wajib diisi",
        },
        { status: 400 }
      );
    }

    connection = await createDbConnection();

    // Query untuk cek duplikasi
    let query = `
      SELECT rs.id_riwayat, s.nama_survei, p.nama_perusahaan, p.kip
      FROM riwayat_survei rs
      JOIN survei s ON rs.id_survei = s.id_survei
      JOIN perusahaan p ON rs.id_perusahaan = p.id_perusahaan
      WHERE rs.id_survei = ? AND rs.id_perusahaan = ?
    `;
    
    const queryParams = [id_survei, id_perusahaan];

    // Exclude current record jika dalam mode edit
    if (exclude_id) {
      query += " AND rs.id_riwayat != ?";
      queryParams.push(exclude_id);
    }

    const [rows] = await connection.execute(query, queryParams);
    const results = rows as any[];

    const isDuplicate = results.length > 0;
    let duplicateInfo = null;

    if (isDuplicate) {
      duplicateInfo = {
        id_riwayat: results[0].id_riwayat,
        nama_survei: results[0].nama_survei,
        nama_perusahaan: results[0].nama_perusahaan,
        kip: results[0].kip,
      };
    }

    return NextResponse.json({
      success: true,
      isDuplicate,
      duplicateInfo,
      message: isDuplicate 
        ? `Kombinasi survei "${duplicateInfo.nama_survei}" dan perusahaan "${duplicateInfo.nama_perusahaan}" (KIP: ${duplicateInfo.kip}) sudah terdaftar dalam sistem.`
        : "Data tidak duplikat",
    });

  } catch (error) {
    console.error("Error checking duplicate:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat melakukan validasi duplikasi",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}