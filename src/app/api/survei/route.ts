// src/app/api/survei/route.ts
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

// Validation functions
function validateSurveiData(data: any) {
  const errors: string[] = [];

  // Validate nama_survei
  if (!data.nama_survei || typeof data.nama_survei !== 'string') {
    errors.push("Nama survei wajib diisi");
  } else {
    const namaSurvei = data.nama_survei.trim();
    if (namaSurvei.length < 3) {
      errors.push("Nama survei minimal 3 karakter");
    }
    if (namaSurvei.length > 100) {
      errors.push("Nama survei maksimal 100 karakter");
    }
  }

  // Validate fungsi
  if (!data.fungsi || typeof data.fungsi !== 'string' || data.fungsi.trim() === '') {
    errors.push("Fungsi wajib diisi");
  }

  // Validate periode
  if (!data.periode || typeof data.periode !== 'string' || data.periode.trim() === '') {
    errors.push("Periode wajib diisi");
  }

  // Validate tahun
  if (!data.tahun) {
    errors.push("Tahun wajib diisi");
  } else {
    const tahun = typeof data.tahun === 'string' ? parseInt(data.tahun) : data.tahun;
    if (isNaN(tahun)) {
      errors.push("Tahun harus berupa angka");
    } else if (tahun < 1900 || tahun > 2100) {
      errors.push("Tahun harus antara 1900-2100");
    }
  }
  return errors;
}

// Sanitize data function
function sanitizeSurveiData(data: any) {
  return {
    nama_survei: data.nama_survei ? data.nama_survei.toString().trim() : '',
    fungsi: data.fungsi ? data.fungsi.toString().trim() : '',
    periode: data.periode ? data.periode.toString().trim() : '',
    tahun: typeof data.tahun === 'string' ? parseInt(data.tahun) : data.tahun
  };
}

// GET endpoint with advanced filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchTerm = searchParams.get("search") || "";
  const fungsiFilter = searchParams.get("fungsi") || "all";
  const periodeFilter = searchParams.get("periode") || "all";
  const tahunFilter = searchParams.get("tahun") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100); // Limit max 100
  const offset = (page - 1) * limit;

  // Sorting parameters
  const sortParam = searchParams.get("sort");
  let orderByClause = "ORDER BY id_survei DESC"; // Default sorting

  try {
    // Create database connection
    const connection = await createDbConnection();

    // Prepare where conditions
    let whereConditions = [];
    let queryParams = [];

    // Search filter (multi-column)
    if (searchTerm) {
      whereConditions.push(
        "(nama_survei LIKE ? OR fungsi LIKE ? OR periode LIKE ?)"
      );
      queryParams.push(
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`
      );
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
    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // Handle sorting
    if (sortParam) {
      try {
        const sortOptions = JSON.parse(sortParam);
        const orderByParts = sortOptions.map((sort: any) => {
          const allowedColumns = ['id_survei', 'nama_survei', 'fungsi', 'periode', 'tahun'];
          const column = allowedColumns.includes(sort.column) ? sort.column : 'id_survei';
          const direction = sort.direction === "desc" ? "DESC" : "ASC";
          return `${column} ${direction}`;
        });
        orderByClause = "ORDER BY " + orderByParts.join(", ");
      } catch (e) {
        // If sort parsing fails, use default
        orderByClause = "ORDER BY id_survei DESC";
      }
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
        perPage: limit,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new survey
export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();
    
    // Sanitize input data
    const data = sanitizeSurveiData(rawData);
    
    // Validate input data
    const validationErrors = validateSurveiData(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Create database connection
    const connection = await createDbConnection();

    try {
      // Check for duplicate survey name in the same year
      const [existingRows] = await connection.execute(
        `SELECT id_survei FROM survei WHERE nama_survei = ? AND tahun = ?`,
        [data.nama_survei, data.tahun]
      );

      if ((existingRows as any[]).length > 0) {
        await connection.end();
        return NextResponse.json(
          {
            success: false,
            message: "Nama survei sudah ada untuk tahun yang sama",
          },
          { status: 409 }
        );
      }

      // Begin transaction
      await connection.beginTransaction();

      // Insert new survey
      const [result] = await connection.execute(
        `INSERT INTO survei (nama_survei, fungsi, periode, tahun) 
         VALUES (?, ?, ?, ?)`,
        [data.nama_survei, data.fungsi, data.periode, data.tahun]
      );

      // Commit transaction
      await connection.commit();

      // Get new survey ID
      const newSurveyId = (result as any).insertId;

      await connection.end();

      return NextResponse.json({
        success: true,
        message: "Data survei berhasil ditambahkan",
        data: {
          id: newSurveyId,
          nama_survei: data.nama_survei,
          fungsi: data.fungsi,
          periode: data.periode,
          tahun: data.tahun,
        },
      });
    } catch (dbError) {
      // Rollback transaction on error
      await connection.rollback();
      await connection.end();
      throw dbError;
    }
  } catch (error) {
    console.error("Database error:", error);
    
    // Check for specific MySQL errors
    if ((error as any).code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        {
          success: false,
          message: "Data survei dengan informasi yang sama sudah ada",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menyimpan data",
      },
      { status: 500 }
    );
  }
}