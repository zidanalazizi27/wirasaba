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