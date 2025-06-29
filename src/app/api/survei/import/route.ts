// src/app/api/survei/import/route.ts
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

// Interface untuk data survei upload
interface SurveiUploadData {
  nama_survei: string;
  fungsi: string;
  periode: string;
  tahun: number;
}

// Interface untuk hasil validasi
interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

// Interface untuk import stats
interface ImportStats {
  total: number;
  inserted: number;
  updated: number;
  errors: number;
  errorDetails: ValidationError[];
}

// Validation functions (sama seperti di form_survei.tsx)
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

// Fungsi untuk cek duplikasi
async function checkForDuplicates(connection: any, data: SurveiUploadData[]): Promise<any[]> {
  const duplicates: any[] = [];

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
    
    const [rows] = await connection.execute(checkQuery, [
      item.nama_survei.trim(),
      item.fungsi.trim(),
      item.periode.trim(),
      item.tahun
    ]);

    const existingRecords = rows as any[];
    if (existingRecords.length > 0) {
      duplicates.push({
        ...existingRecords[0],
        uploadData: item // Include the upload data for comparison
      });
    }
  }

  return duplicates;
}

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
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

      const duplicates = await checkForDuplicates(connection, data);
      
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
    const validData: any[] = [];

    data.forEach((item: any, index: number) => {
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
          
          await connection.execute(insertQuery, [
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
          
          const [existingRows] = await connection.execute(checkQuery, [
            item.nama_survei,
            item.fungsi, 
            item.periode,
            item.tahun
          ]);

          if ((existingRows as any[]).length > 0) {
            if (replaceExisting) {
              // Update existing record
              const updateQuery = `
                UPDATE survei 
                SET nama_survei = ?, fungsi = ?, periode = ?, tahun = ?
                WHERE id_survei = ?
              `;
              
              await connection.execute(updateQuery, [
                item.nama_survei,
                item.fungsi,
                item.periode,
                item.tahun,
                (existingRows as any[])[0].id_survei
              ]);
              
              updatedCount++;
            }
            // If replaceExisting is false, skip duplicate
          } else {
            // Insert new record
            const insertQuery = `
              INSERT INTO survei (nama_survei, fungsi, periode, tahun)
              VALUES (?, ?, ?, ?)
            `;
            
            await connection.execute(insertQuery, [
              item.nama_survei,
              item.fungsi,
              item.periode,
              item.tahun
            ]);
            
            insertedCount++;
          }
        }

        console.log(`✅ Inserted ${insertedCount} new records, updated ${updatedCount} existing records`);
      }

      // Commit transaction
      await connection.commit();
      
      console.log('🎉 Import completed successfully');

      return NextResponse.json({
        success: true,
        message: mode === 'replace' 
          ? `Berhasil mengganti semua data dengan ${insertedCount} data baru`
          : `Berhasil memproses ${insertedCount + updatedCount} data`,
        inserted: insertedCount,
        updated: updatedCount,
        total: insertedCount + updatedCount
      });

    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error in survei import:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal mengimport data",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// GET endpoint untuk redirect ke template
export async function GET() {
  return NextResponse.json({
    success: false,
    message: "Gunakan endpoint /api/survei/template untuk mendapatkan template"
  }, { status: 404 });
}