// src/app/api/survei/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql, { Connection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

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

// Interface untuk data survei upload
interface SurveiUploadData {
  nama_survei: string;
  fungsi: string;
  periode: string;
  tahun: number;
}

// Interface untuk data mentah dari Excel
interface ExcelRow {
  nama_survei: string;
  fungsi: string;
  periode: string;
  tahun: number | string;
}

// Validation functions (sama seperti di form_survei.tsx)
function validateSurveiData(data: ExcelRow) {
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
function sanitizeSurveiData(data: ExcelRow): SurveiUploadData {
  return {
    nama_survei: data.nama_survei ? data.nama_survei.toString().trim() : '',
    fungsi: data.fungsi ? data.fungsi.toString().trim() : '',
    periode: data.periode ? data.periode.toString().trim() : '',
    tahun: typeof data.tahun === 'string' ? parseInt(data.tahun, 10) : data.tahun
  };
}

// Fungsi untuk cek duplikasi
async function checkForDuplicates(connection: Connection, data: SurveiUploadData[]) {
  const duplicates: (RowDataPacket & { uploadData: SurveiUploadData })[] = [];

  for (const item of data) {
    if (!item.nama_survei || !item.fungsi || !item.periode || !item.tahun) {
      continue; // Skip invalid items
    }

    const checkQuery = `
      SELECT 
        id_survei,
        nama_survei,
        fungsi,
        periode,
        tahun
      FROM survei 
      WHERE nama_survei = ? AND fungsi = ? AND periode = ? AND tahun = ?
      LIMIT 1
    `;
    
    const [rows] = await connection.execute<RowDataPacket[]>(checkQuery, [
      item.nama_survei.trim(),
      item.fungsi.trim(),
      item.periode.trim(),
      item.tahun
    ]);

    if (rows.length > 0) {
      duplicates.push({
        ...rows[0],
        uploadData: item // Include the upload data for comparison
      });
    }
  }

  return duplicates;
}

interface ImportRequestBody {
  data: ExcelRow[];
  mode: 'check_duplicates' | 'append' | 'replace';
  replaceExisting?: boolean;
}

export async function POST(request: NextRequest) {
  let connection: Connection | undefined;
  
  try {
    const body: ImportRequestBody = await request.json();
    const { data, mode, replaceExisting } = body;

    console.log('🚀 Starting survei import process...');
    console.log('📊 Import mode:', mode);
    console.log('📈 Data count:', data?.length || 0);

    // Handle check duplicates mode
    if (mode === 'check_duplicates') {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return NextResponse.json(
          { success: false, message: "Data tidak valid atau kosong" },
          { status: 400 }
        );
      }

      connection = await createDbConnection();
      console.log('✅ Database connected for duplicate check');

      const sanitizedData = data.map(item => sanitizeSurveiData(item));
      const duplicates = await checkForDuplicates(connection, sanitizedData);
      
      console.log(`🔍 Found ${duplicates.length} duplicates out of ${data.length} records`);

      await connection.end();

      return NextResponse.json({
        success: true,
        duplicates: duplicates,
        total: data.length,
        duplicateCount: duplicates.length
      });
    }

    // Handle normal import mode
    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid atau kosong" },
        { status: 400 }
      );
    }

    // Validate all data first
    const validationErrors: string[] = [];
    const validData: SurveiUploadData[] = [];

    data.forEach((item, index) => {
      const errors = validateSurveiData(item);
      if (errors.length > 0) {
        validationErrors.push(`Baris ${index + 1}: ${errors.join(', ')}`);
      } else {
        validData.push(sanitizeSurveiData(item));
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Data tidak valid",
          errors: validationErrors
        },
        { status: 400 }
      );
    }

    // Connect to database
    console.log('🔌 Connecting to database...');
    connection = await createDbConnection();
    console.log('✅ Database connected successfully');

    await connection.beginTransaction();

    let insertedCount = 0;
    let updatedCount = 0;

    try {
      if (mode === 'replace') {
        // Replace mode: Delete all existing data first
        console.log('🗑️ Deleting all existing survei data...');
        await connection.execute('DELETE FROM survei');
        console.log('✅ All existing data deleted');

        // Insert all new data
        for (const item of validData) {
          const insertQuery = `
            INSERT INTO survei (nama_survei, fungsi, periode, tahun)
            VALUES (?, ?, ?, ?)
          `;
          
          await connection.execute<ResultSetHeader>(insertQuery, [
            item.nama_survei,
            item.fungsi,
            item.periode,
            item.tahun
          ]);
          
          insertedCount++;
        }
        
        console.log(`✅ Inserted ${insertedCount} new records`);

      } else {
        // Append mode: Insert or update data
        for (const item of validData) {
          // Check if record exists (by nama_survei, fungsi, periode, tahun combination)
          const checkQuery = `
            SELECT id_survei FROM survei 
            WHERE nama_survei = ? AND fungsi = ? AND periode = ? AND tahun = ?
          `;
          
          const [existingRows] = await connection.execute<RowDataPacket[]>(checkQuery, [
            item.nama_survei,
            item.fungsi,
            item.periode,
            item.tahun
          ]);

          if (existingRows.length > 0) {
            // Record exists
            if (replaceExisting) {
              // Update existing record if replaceExisting is true
              const existingId = existingRows[0].id_survei;
              const updateQuery = `
                UPDATE survei
                SET nama_survei = ?, fungsi = ?, periode = ?, tahun = ?
                WHERE id_survei = ?
              `;
              
              await connection.execute<ResultSetHeader>(updateQuery, [
                item.nama_survei,
                item.fungsi,
                item.periode,
                item.tahun,
                existingId
              ]);
              updatedCount++;
            }
          } else {
            // Insert new record
            const insertQuery = `
              INSERT INTO survei (nama_survei, fungsi, periode, tahun)
              VALUES (?, ?, ?, ?)
            `;
            
            await connection.execute<ResultSetHeader>(insertQuery, [
              item.nama_survei,
              item.fungsi,
              item.periode,
              item.tahun
            ]);
            insertedCount++;
          }
        }
      }

      await connection.commit();
      
      console.log('✅ Transaction committed');

    } catch (dbError) {
      if (connection) {
        await connection.rollback();
        console.log('❌ Transaction rolled back due to error');
      }
      throw dbError; // Rethrow to be caught by outer catch block
    }

    await connection.end();
    console.log('✅ Database connection closed');

    return NextResponse.json({
      success: true,
      message: `Impor berhasil. ${insertedCount} data ditambahkan, ${updatedCount} data diperbarui.`,
      summary: {
        totalRecords: validData.length,
        inserted: insertedCount,
        updated: updatedCount,
      }
    });

  } catch (error) {
    console.error("❌ Detailed error in import:", error);
    
    // Make sure connection is closed even on error
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('❌ Error closing connection on fail:', closeError);
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      message: (error instanceof Error) ? error.message : "Terjadi kesalahan server yang tidak diketahui" 
    }, { status: 500 });
  }
}

// GET endpoint untuk redirect ke template
export async function GET() {
  return NextResponse.json({
    success: false,
    message: "Gunakan endpoint /api/survei/template untuk mendapatkan template"
  }, { status: 404 });
}