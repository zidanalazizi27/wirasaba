import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wirasaba',
};

// Utility function to create database connection
async function createDbConnection() {
  return await mysql.createConnection(dbConfig);
}

// GET endpoint with advanced filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format");
  const searchTerm = searchParams.get("search") || "";
  const fungsiFilter = searchParams.get("fungsi") || "all";
  const periodeFilter = searchParams.get("periode") || "all";
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
      whereConditions.push("(nama_survei LIKE ? OR fungsi LIKE ? OR periode LIKE ?)");
      queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Fungsi filter
    if (fungsiFilter !== "all") {
      whereConditions.push("fungsi = ?");
      queryParams.push(fungsiFilter);
    }

    // Periode filter
    if (periodeFilter !== "all") {
      whereConditions.push("periode = ?");
      queryParams.push(periodeFilter);
    }

    // Tahun filter
    if (tahunFilter !== "all") {
      whereConditions.push("tahun = ?");
      queryParams.push(parseInt(tahunFilter));
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 
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
        const validColumns = ["nama_survei", "fungsi", "periode", "tahun"];
        if (validColumns.includes(column)) {
          sorts.push({ column, direction });
        }
      }
      i++;
    }

    // Build ORDER BY clause
    let orderByClause = "";
    if (sorts.length > 0) {
      const orderByParts = sorts.map(sort => {
        const direction = sort.direction === "ascending" ? "ASC" : "DESC";
        return `${sort.column} ${direction}`;
      });
      orderByClause = "ORDER BY " + orderByParts.join(", ");
    } else {
      // Default sorting
      orderByClause = "ORDER BY id_survei DESC";
    }

    // Count total records for pagination
    const [totalRows] = await connection.execute(
      `SELECT COUNT(*) as total FROM survei ${whereClause}`,
      queryParams
    );

    // Execute query with pagination
    const [rows] = await connection.execute(
      `SELECT id_survei, nama_survei, fungsi, periode, tahun 
       FROM survei 
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
        perPage: limit
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new survey
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.nama_survei || !data.fungsi || !data.periode || !data.tahun) {
      return NextResponse.json({ 
        success: false, 
        message: "Semua field wajib diisi" 
      }, { status: 400 });
    }
    
    // Create database connection
    const connection = await createDbConnection();
    
    // Insert new survey
    const [result] = await connection.execute(
      `INSERT INTO survei (nama_survei, fungsi, periode, tahun) 
       VALUES (?, ?, ?, ?)`,
      [data.nama_survei, data.fungsi, data.periode, data.tahun]
    );
    
    // Get new survey ID
    const newSurveyId = (result as any).insertId;
    
    await connection.end();
    
    return NextResponse.json({ 
      success: true, 
      message: "Data survei berhasil ditambahkan",
      id: newSurveyId
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat menyimpan data: " + (error as Error).message 
    }, { status: 500 });
  }
}