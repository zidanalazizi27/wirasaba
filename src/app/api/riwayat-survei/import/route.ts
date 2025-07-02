// src/app/api/riwayat-survei/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

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

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    console.log('🔄 Starting riwayat survei import...');
    
    // Parse form data
    const formData = await request.formData();
    const mode = formData.get('mode') as string || 'append';
    const dataString = formData.get('data') as string;
    
    if (!dataString) {
      return NextResponse.json({
        success: false,
        message: 'Data tidak ditemukan dalam request'
      }, { status: 400 });
    }

    // Parse the JSON data
    let importData: any[];
    try {
      importData = JSON.parse(dataString);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Format data tidak valid'
      }, { status: 400 });
    }

    if (!Array.isArray(importData) || importData.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Data harus berupa array dan tidak boleh kosong'
      }, { status: 400 });
    }

    console.log(`📊 Processing ${importData.length} records in ${mode} mode`);

    // Create database connection
    connection = await createDbConnection();
    
    // Start transaction
    await connection.beginTransaction();
    console.log('🔄 Transaction started');

    let insertedCount = 0;
    let updatedCount = 0;

    try {
      // If replace mode, delete all existing data first
      if (mode === 'replace') {
        console.log('🗑️ Deleting all existing riwayat survei data...');
        await connection.execute('DELETE FROM riwayat_survei');
        console.log('✅ All existing data deleted');
      }

      // Process each record
      for (const item of importData) {
        console.log(`Processing item:`, item);

        // Validate required fields
        if (!item.id_survei || !item.id_perusahaan || !item.id_pcl || !item.selesai) {
          throw new Error(`Data tidak lengkap: ${JSON.stringify(item)}`);
        }

        // Validate foreign key constraints
        // Check if survei exists
        const [surveiRows] = await connection.execute(
          'SELECT id_survei FROM survei WHERE id_survei = ?',
          [item.id_survei]
        );
        if ((surveiRows as any[]).length === 0) {
          throw new Error(`Survei dengan ID ${item.id_survei} tidak ditemukan`);
        }

        // Check if perusahaan exists
        const [perusahaanRows] = await connection.execute(
          'SELECT id_perusahaan FROM perusahaan WHERE id_perusahaan = ?',
          [item.id_perusahaan]
        );
        if ((perusahaanRows as any[]).length === 0) {
          throw new Error(`Perusahaan dengan ID ${item.id_perusahaan} tidak ditemukan`);
        }

        // Check if pcl exists
        const [pclRows] = await connection.execute(
          'SELECT id_pcl FROM pcl WHERE id_pcl = ?',
          [item.id_pcl]
        );
        if ((pclRows as any[]).length === 0) {
          throw new Error(`PCL dengan ID ${item.id_pcl} tidak ditemukan`);
        }

        // Check for existing record with same survei + perusahaan combination
        if (mode === 'append') {
          const checkQuery = `
            SELECT id_riwayat FROM riwayat_survei 
            WHERE id_survei = ? AND id_perusahaan = ?
          `;
          
          const [existingRows] = await connection.execute(checkQuery, [
            item.id_survei,
            item.id_perusahaan
          ]);

          if ((existingRows as any[]).length > 0) {
            // Update existing record
            const updateQuery = `
              UPDATE riwayat_survei 
              SET id_pcl = ?, selesai = ?, ket_survei = ?
              WHERE id_survei = ? AND id_perusahaan = ?
            `;
            
            await connection.execute(updateQuery, [
              item.id_pcl,
              item.selesai,
              item.ket_survei || '',
              item.id_survei,
              item.id_perusahaan
            ]);
            
            updatedCount++;
            console.log(`✅ Updated existing record for survei ${item.id_survei} + perusahaan ${item.id_perusahaan}`);
          } else {
            // Insert new record
            const insertQuery = `
              INSERT INTO riwayat_survei (id_survei, id_perusahaan, id_pcl, selesai, ket_survei)
              VALUES (?, ?, ?, ?, ?)
            `;
            
            await connection.execute(insertQuery, [
              item.id_survei,
              item.id_perusahaan,
              item.id_pcl,
              item.selesai,
              item.ket_survei || ''
            ]);
            
            insertedCount++;
            console.log(`✅ Inserted new record for survei ${item.id_survei} + perusahaan ${item.id_perusahaan}`);
          }
        } else {
          // Replace mode - always insert
          const insertQuery = `
            INSERT INTO riwayat_survei (id_survei, id_perusahaan, id_pcl, selesai, ket_survei)
            VALUES (?, ?, ?, ?, ?)
          `;
          
          await connection.execute(insertQuery, [
            item.id_survei,
            item.id_perusahaan,
            item.id_pcl,
            item.selesai,
            item.ket_survei || ''
          ]);
          
          insertedCount++;
          console.log(`✅ Inserted record for survei ${item.id_survei} + perusahaan ${item.id_perusahaan}`);
        }
      }

      console.log(`✅ Inserted ${insertedCount} new records, updated ${updatedCount} existing records`);

      // Commit transaction
      await connection.commit();
      console.log('🎉 Transaction committed successfully');
      
      console.log('🎉 Import completed successfully');

      return NextResponse.json({
        success: true,
        message: mode === 'replace' 
          ? `Berhasil mengganti semua data dengan ${insertedCount} data baru`
          : `Berhasil memproses ${insertedCount + updatedCount} data riwayat survei`,
        inserted: insertedCount,
        updated: updatedCount,
        total: insertedCount + updatedCount
      });

    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      console.log('❌ Transaction rolled back due to error');
      throw error;
    }

  } catch (error) {
    console.error('❌ Error in riwayat survei import:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal mengimport data riwayat survei",
        error: process.env.NODE_ENV === 'development' ? 
          (error as Error).message : 'Internal server error'
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
    message: "Gunakan endpoint /api/riwayat-survei/template untuk mendapatkan template"
  }, { status: 404 });
}