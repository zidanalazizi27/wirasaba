// src/app/api/survei/[id]/route.ts
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

// Validation functions (same as in route.ts)
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

// Validate ID parameter
function validateId(id: string): { isValid: boolean; numericId?: number; error?: string } {
  const numericId = parseInt(id);
  
  if (isNaN(numericId) || numericId <= 0) {
    return {
      isValid: false,
      error: "ID survei tidak valid"
    };
  }
  
  return {
    isValid: true,
    numericId
  };
}

// GET a specific survey by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Validate ID
  const idValidation = validateId(id);
  if (!idValidation.isValid) {
    return NextResponse.json({
      success: false,
      message: idValidation.error
    }, { status: 400 });
  }

  try {
    // Create database connection
    const connection = await createDbConnection();

    // Query to get survey by ID
    const [rows] = await connection.execute(
      `SELECT id_survei, nama_survei, fungsi, periode, tahun
       FROM survei
       WHERE id_survei = ?`,
      [idValidation.numericId]
    );

    await connection.end();

    if ((rows as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        message: "Survei tidak ditemukan"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: (rows as any[])[0]
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PUT to update a survey
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Validate ID
  const idValidation = validateId(id);
  if (!idValidation.isValid) {
    return NextResponse.json({
      success: false,
      message: idValidation.error
    }, { status: 400 });
  }

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
      // Begin transaction
      await connection.beginTransaction();

      // Check if survey exists
      const [existingRows] = await connection.execute(
        `SELECT id_survei, nama_survei, tahun FROM survei WHERE id_survei = ?`,
        [idValidation.numericId]
      );

      if ((existingRows as any[]).length === 0) {
        await connection.rollback();
        await connection.end();
        return NextResponse.json({
          success: false,
          message: "Survei tidak ditemukan"
        }, { status: 404 });
      }

      const existingSurvei = (existingRows as any[])[0];

      // Check for duplicate survey name in the same year (excluding current record)
      const [duplicateRows] = await connection.execute(
        `SELECT id_survei FROM survei 
         WHERE nama_survei = ? AND tahun = ? AND id_survei != ?`,
        [data.nama_survei, data.tahun, idValidation.numericId]
      );

      if ((duplicateRows as any[]).length > 0) {
        await connection.rollback();
        await connection.end();
        return NextResponse.json(
          {
            success: false,
            message: "Nama survei sudah ada untuk tahun yang sama",
          },
          { status: 409 }
        );
      }

      // Update survey data
      const [result] = await connection.execute(
        `UPDATE survei 
         SET nama_survei = ?, fungsi = ?, periode = ?, tahun = ?
         WHERE id_survei = ?`,
        [data.nama_survei, data.fungsi, data.periode, data.tahun, idValidation.numericId]
      );

      // Check if update was successful
      if ((result as any).affectedRows === 0) {
        await connection.rollback();
        await connection.end();
        return NextResponse.json({
          success: false,
          message: "Gagal memperbarui data survei"
        }, { status: 500 });
      }

      // Commit transaction
      await connection.commit();
      await connection.end();

      return NextResponse.json({
        success: true,
        message: "Data survei berhasil diperbarui",
        data: {
          id: idValidation.numericId,
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
        message: "Terjadi kesalahan saat memperbarui data",
      },
      { status: 500 }
    );
  }
}

// DELETE a survey
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Validate ID
  const idValidation = validateId(id);
  if (!idValidation.isValid) {
    return NextResponse.json({
      success: false,
      message: idValidation.error
    }, { status: 400 });
  }

  try {
    // Create database connection
    const connection = await createDbConnection();

    try {
      // Begin transaction
      await connection.beginTransaction();

      // Check if survey exists
      const [existingRows] = await connection.execute(
        `SELECT id_survei FROM survei WHERE id_survei = ?`,
        [idValidation.numericId]
      );

      if ((existingRows as any[]).length === 0) {
        await connection.rollback();
        await connection.end();
        return NextResponse.json({
          success: false,
          message: "Survei tidak ditemukan"
        }, { status: 404 });
      }

      // Check if survey is referenced in riwayat_survei
      const [referencedRows] = await connection.execute(
        `SELECT COUNT(*) as count FROM riwayat_survei WHERE id_survei = ?`,
        [idValidation.numericId]
      );

      const isReferenced = (referencedRows as any[])[0].count > 0;

      if (isReferenced) {
        await connection.rollback();
        await connection.end();
        return NextResponse.json({
          success: false,
          message: "Tidak dapat menghapus survei karena masih digunakan dalam riwayat survei"
        }, { status: 409 });
      }

      // Delete survey
      const [result] = await connection.execute(
        `DELETE FROM survei WHERE id_survei = ?`,
        [idValidation.numericId]
      );

      if ((result as any).affectedRows === 0) {
        await connection.rollback();
        await connection.end();
        return NextResponse.json({
          success: false,
          message: "Gagal menghapus data survei"
        }, { status: 500 });
      }

      // Commit transaction
      await connection.commit();
      await connection.end();

      return NextResponse.json({
        success: true,
        message: "Data survei berhasil dihapus"
      });
    } catch (dbError) {
      // Rollback transaction on error
      await connection.rollback();
      await connection.end();
      throw dbError;
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menghapus data",
      },
      { status: 500 }
    );
  }
}