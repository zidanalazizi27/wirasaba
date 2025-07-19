// src/app/api/survei/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";

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

interface SurveiData {
  id_survei?: number;
  nama_survei: string;
  fungsi: string;
  periode: string;
  tahun: number | string;
}

// Validation functions
function validateSurveiData(data: Partial<SurveiData>) {
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
    const tahun = typeof data.tahun === 'string' ? parseInt(data.tahun, 10) : data.tahun;
    if (isNaN(tahun)) {
      errors.push("Tahun harus berupa angka");
    } else if (tahun < 1900 || tahun > 2100) {
      errors.push("Tahun harus antara 1900-2100");
    }
  }
  return errors;
}

// Sanitize data function
function sanitizeSurveiData(data: Partial<SurveiData>): Partial<SurveiData> {
  return {
    nama_survei: data.nama_survei ? data.nama_survei.toString().trim() : '',
    fungsi: data.fungsi ? data.fungsi.toString().trim() : '',
    periode: data.periode ? data.periode.toString().trim() : '',
    tahun: typeof data.tahun === 'string' ? parseInt(data.tahun, 10) : data.tahun
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
    const whereConditions: string[] = [];
    const queryParams: (string | number)[] = [];

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
        const sortOptions: { column: string; direction: string }[] = JSON.parse(sortParam);
        if (Array.isArray(sortOptions) && sortOptions.length > 0) {
          const orderByParts = sortOptions.map((sort) => {
            const allowedColumns = ['id_survei', 'nama_survei', 'fungsi', 'periode', 'tahun'];
            const column = allowedColumns.includes(sort.column) ? sort.column : 'id_survei';
            const direction = sort.direction === "desc" ? "DESC" : "ASC";
            return `${column} ${direction}`;
          });
          orderByClause = "ORDER BY " + orderByParts.join(", ");
        }
      } catch {
        // If sort parsing fails, use default
        orderByClause = "ORDER BY id_survei DESC";
      }
    }

    // Count total records for pagination
    const [totalRows] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM survei ${whereClause}`,
      queryParams
    );

    // Execute query with pagination
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT id_survei, nama_survei, fungsi, periode, tahun 
       FROM survei 
       ${whereClause}
       ${orderByClause}
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Close connection
    await connection.end();

    interface SurveiRow {
      id_survei: number;
      nama_survei: string;
      fungsi: string;
      periode: string;
      tahun: number;
    }

    // Format the response
    const total = totalRows[0].total;
    const responseData = rows as SurveiRow[];

    return NextResponse.json({
      success: true,
      count: total,
      data: responseData,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch {
    console.error("Database error");
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new survey
export async function POST(request: NextRequest) {
  try {
    const rawData: Partial<SurveiData> = await request.json();
    
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
      const [existingRows] = await connection.execute<RowDataPacket[]>(
        `SELECT id_survei FROM survei WHERE nama_survei = ? AND tahun = ?`,
        [data.nama_survei, data.tahun]
      );

      if (existingRows.length > 0) {
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
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO survei (nama_survei, fungsi, periode, tahun) 
         VALUES (?, ?, ?, ?)`,
        [data.nama_survei, data.fungsi, data.periode, data.tahun]
      );

      // Commit transaction
      await connection.commit();

      await connection.end();

      return NextResponse.json({
        success: true,
        message: "Data survei berhasil ditambahkan",
        data: {
          id: result.insertId,
          ...data
        }
      });

    } catch (dbError) {
      if (connection) {
        // Rollback transaction on error
        await connection.rollback();
        await connection.end();
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Database error:", error);
    
    interface MySQLError extends Error {
      code: string;
    }

    // Check for specific MySQL errors
    if ((error as MySQLError).code === 'ER_DUP_ENTRY') {
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

export async function PUT(request: NextRequest) {
  try {
    const { id_survei, ...updateData }: SurveiData = await request.json();

    if (!id_survei) {
      return NextResponse.json({
        success: false,
        message: "ID survei diperlukan untuk update"
      }, { status: 400 });
    }
    
    // Sanitize and validate
    const dataToUpdate = sanitizeSurveiData(updateData);
    const validationErrors = validateSurveiData(dataToUpdate);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Validasi gagal",
        errors: validationErrors
      }, { status: 400 });
    }

    const connection = await createDbConnection();
    
    // Check for duplicate survey name in the same year, excluding the current survey
    const [existingRows] = await connection.execute<RowDataPacket[]>(
      `SELECT id_survei FROM survei WHERE nama_survei = ? AND tahun = ? AND id_survei != ?`,
      [dataToUpdate.nama_survei, dataToUpdate.tahun, id_survei]
    );

    if (existingRows.length > 0) {
      await connection.end();
      return NextResponse.json({
        success: false,
        message: "Nama survei sudah ada untuk tahun yang sama",
        isDuplicate: true
      }, { status: 409 });
    }
    
    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE survei SET nama_survei = ?, fungsi = ?, periode = ?, tahun = ?
       WHERE id_survei = ?`,
      [
        dataToUpdate.nama_survei,
        dataToUpdate.fungsi,
        dataToUpdate.periode,
        dataToUpdate.tahun,
        id_survei
      ]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: "Data survei tidak ditemukan atau tidak ada perubahan"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Data survei berhasil diperbarui"
    });

  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memperbarui data" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete multiple surveys by their IDs
export async function DELETE(request: NextRequest) {
  try {
    const { ids }: { ids: number[] } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Payload harus berisi array 'ids' yang tidak kosong"
      }, { status: 400 });
    }

    const connection = await createDbConnection();
    const placeholders = ids.map(() => '?').join(',');

    const [result] = await connection.execute<ResultSetHeader>(
      `DELETE FROM survei WHERE id_survei IN (${placeholders})`,
      ids
    );
    
    await connection.end();

    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: 'Tidak ada data yang cocok untuk dihapus'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `${result.affectedRows} data berhasil dihapus`
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menghapus data" },
      { status: 500 }
    );
  }
}