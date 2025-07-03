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

// Function to verify and get ID from related tables
async function verifyAndGetIds(connection: mysql.Connection, item: any, rowNumber: number): Promise<{
  id_survei: number;
  id_perusahaan: number;
  id_pcl: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let id_survei = 0;
  let id_perusahaan = 0;
  let id_pcl = 0;

  try {
    // 1. Verify KIP and Nama Perusahaan
    if (!item.kip || !item.nama_perusahaan) {
      errors.push('KIP dan Nama Perusahaan wajib diisi');
    } else {
      const kip = item.kip.toString().trim();
      if (kip.length > 10) {
        errors.push(`KIP "${kip}" terlalu panjang. Maksimal 10 digit`);
      } else {
        const [perusahaanRows] = await connection.execute(
          `SELECT id_perusahaan, nama_perusahaan, kip 
           FROM perusahaan 
           WHERE kip = ? AND nama_perusahaan = ?`,
          [kip, item.nama_perusahaan.toString().trim()]
        );

        if ((perusahaanRows as any[]).length === 0) {
          // Try to find by KIP only
          const [kipRows] = await connection.execute(
            `SELECT id_perusahaan, nama_perusahaan, kip 
             FROM perusahaan 
             WHERE kip = ?`,
            [kip]
          );

          if ((kipRows as any[]).length === 0) {
            errors.push(`KIP "${kip}" tidak ditemukan dalam database perusahaan`);
          } else {
            const found = (kipRows as any[])[0];
            errors.push(`KIP "${kip}" ditemukan, tetapi nama perusahaan tidak cocok. Database: "${found.nama_perusahaan}", Input: "${item.nama_perusahaan}"`);
          }
        } else {
          id_perusahaan = (perusahaanRows as any[])[0].id_perusahaan;
        }
      }
    }

    // 2. Verify Nama Survei and Tahun
    if (!item.nama_survei || !item.tahun) {
      errors.push('Nama Survei dan Tahun wajib diisi');
    } else {
      const [surveiRows] = await connection.execute(
        `SELECT id_survei, nama_survei, tahun 
         FROM survei 
         WHERE nama_survei = ? AND tahun = ?`,
        [item.nama_survei.toString().trim(), parseInt(item.tahun)]
      );

      if ((surveiRows as any[]).length === 0) {
        // Try to find by nama_survei only
        const [namaRows] = await connection.execute(
          `SELECT id_survei, nama_survei, tahun 
           FROM survei 
           WHERE nama_survei = ?`,
          [item.nama_survei.toString().trim()]
        );

        if ((namaRows as any[]).length === 0) {
          errors.push(`Nama survei "${item.nama_survei}" tidak ditemukan dalam database survei`);
        } else {
          const availableYears = (namaRows as any[]).map(row => row.tahun).join(', ');
          errors.push(`Survei "${item.nama_survei}" ditemukan, tetapi tahun ${item.tahun} tidak tersedia. Tahun yang tersedia: ${availableYears}`);
        }
      } else {
        id_survei = (surveiRows as any[])[0].id_survei;
      }
    }

    // 3. Verify Nama PCL
    if (!item.nama_pcl) {
      errors.push('Nama PCL wajib diisi');
    } else {
      const [pclRows] = await connection.execute(
        `SELECT id_pcl, nama_pcl 
         FROM pcl 
         WHERE nama_pcl = ?`,
        [item.nama_pcl.toString().trim()]
      );

      if ((pclRows as any[]).length === 0) {
        // Try to find similar names
        const [similarRows] = await connection.execute(
          `SELECT id_pcl, nama_pcl 
           FROM pcl 
           WHERE nama_pcl LIKE ?`,
          [`%${item.nama_pcl.toString().trim()}%`]
        );

        if ((similarRows as any[]).length === 0) {
          errors.push(`Nama PCL "${item.nama_pcl}" tidak ditemukan dalam database PCL`);
        } else {
          const suggestions = (similarRows as any[]).map(row => row.nama_pcl).slice(0, 3).join(', ');
          errors.push(`Nama PCL "${item.nama_pcl}" tidak ditemukan. Saran: ${suggestions}`);
        }
      } else {
        id_pcl = (pclRows as any[])[0].id_pcl;
      }
    }

    // 4. Verify Status Selesai
    if (!item.selesai) {
      errors.push('Status Selesai wajib diisi');
    } else {
      const status = item.selesai.toString().trim();
      if (status !== 'Iya' && status !== 'Tidak') {
        errors.push(`Status Selesai harus "Iya" atau "Tidak", ditemukan: "${status}"`);
      }
    }

    // 5. Verify Keterangan length
    if (item.ket_survei && item.ket_survei.toString().length > 500) {
      errors.push('Keterangan survei maksimal 500 karakter');
    }

  } catch (error) {
    console.error('Error verifying relations:', error);
    errors.push('Terjadi kesalahan saat memverifikasi data relasi');
  }

  return {
    id_survei,
    id_perusahaan,
    id_pcl,
    errors
  };
}

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    console.log('🔄 Starting riwayat survei import with relation verification...');
    
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
    let skippedCount = 0;
    const relationErrors: string[] = [];
    const duplicateWarnings: string[] = [];

    try {
      // If replace mode, delete all existing data first
      if (mode === 'replace') {
        console.log('🗑️ Deleting all existing riwayat survei data...');
        await connection.execute('DELETE FROM riwayat_survei');
        console.log('✅ All existing data deleted');
      }

      // Process each record with relation verification
      for (let index = 0; index < importData.length; index++) {
        const item = importData[index];
        const rowNumber = index + 2; // +2 karena ada header dan index mulai dari 0
        
        console.log(`Processing row ${rowNumber}:`, item);

        // Verify relations and get IDs
        const verification = await verifyAndGetIds(connection, item, rowNumber);
        
        if (verification.errors.length > 0) {
          verification.errors.forEach(error => {
            relationErrors.push(`Baris ${rowNumber}: ${error}`);
          });
          skippedCount++;
          continue; // Skip this record
        }

        // Prepare final data with verified IDs
        const finalData = {
          id_survei: verification.id_survei,
          id_perusahaan: verification.id_perusahaan,
          id_pcl: verification.id_pcl,
          selesai: item.selesai.toString().trim(),
          ket_survei: item.ket_survei ? item.ket_survei.toString().trim() : ''
        };

        // Check for existing record with same survei + perusahaan combination
        if (mode === 'append') {
          const checkQuery = `
            SELECT id_riwayat, 
                   s.nama_survei, s.tahun,
                   p.nama_perusahaan, p.kip
            FROM riwayat_survei rs
            JOIN survei s ON rs.id_survei = s.id_survei
            JOIN perusahaan p ON rs.id_perusahaan = p.id_perusahaan
            WHERE rs.id_survei = ? AND rs.id_perusahaan = ?
          `;
          
          const [existingRows] = await connection.execute(checkQuery, [
            finalData.id_survei,
            finalData.id_perusahaan
          ]);

          if ((existingRows as any[]).length > 0) {
            const existing = (existingRows as any[])[0];
            duplicateWarnings.push(
              `Baris ${rowNumber}: Data dengan KIP "${existing.kip}" dan survei "${existing.nama_survei} ${existing.tahun}" sudah ada - data akan diperbarui`
            );

            // Update existing record
            const updateQuery = `
              UPDATE riwayat_survei 
              SET id_pcl = ?, selesai = ?, ket_survei = ?
              WHERE id_survei = ? AND id_perusahaan = ?
            `;
            
            await connection.execute(updateQuery, [
              finalData.id_pcl,
              finalData.selesai,
              finalData.ket_survei,
              finalData.id_survei,
              finalData.id_perusahaan
            ]);
            
            updatedCount++;
            console.log(`✅ Updated existing record for row ${rowNumber}`);
          } else {
            // Insert new record
            const insertQuery = `
              INSERT INTO riwayat_survei (id_survei, id_perusahaan, id_pcl, selesai, ket_survei)
              VALUES (?, ?, ?, ?, ?)
            `;
            
            await connection.execute(insertQuery, [
              finalData.id_survei,
              finalData.id_perusahaan,
              finalData.id_pcl,
              finalData.selesai,
              finalData.ket_survei
            ]);
            
            insertedCount++;
            console.log(`✅ Inserted new record for row ${rowNumber}`);
          }
        } else {
          // Replace mode - always insert
          const insertQuery = `
            INSERT INTO riwayat_survei (id_survei, id_perusahaan, id_pcl, selesai, ket_survei)
            VALUES (?, ?, ?, ?, ?)
          `;
          
          await connection.execute(insertQuery, [
            finalData.id_survei,
            finalData.id_perusahaan,
            finalData.id_pcl,
            finalData.selesai,
            finalData.ket_survei
          ]);
          
          insertedCount++;
          console.log(`✅ Inserted record for row ${rowNumber}`);
        }
      }

      console.log(`✅ Processed: ${insertedCount} inserted, ${updatedCount} updated, ${skippedCount} skipped`);

      // If there are relation errors, return them
      if (relationErrors.length > 0) {
        await connection.rollback();
        console.log('❌ Transaction rolled back due to relation errors');
        
        return NextResponse.json({
          success: false,
          message: `Ditemukan ${relationErrors.length} error verifikasi relasi data`,
          errors: relationErrors.slice(0, 20), // Limit to first 20 errors
          totalErrors: relationErrors.length,
          processed: insertedCount + updatedCount,
          skipped: skippedCount
        }, { status: 400 });
      }

      // Commit transaction
      await connection.commit();
      console.log('🎉 Transaction committed successfully');
      
      console.log('🎉 Import completed successfully');

      let message = '';
      if (mode === 'replace') {
        message = `Berhasil mengganti semua data dengan ${insertedCount} data baru`;
      } else {
        message = `Berhasil memproses ${insertedCount + updatedCount} data riwayat survei`;
        if (updatedCount > 0) {
          message += ` (${insertedCount} baru, ${updatedCount} diperbarui)`;
        }
      }

      // Add duplicate warnings to response if any
      const response: any = {
        success: true,
        message: message,
        inserted: insertedCount,
        updated: updatedCount,
        skipped: skippedCount,
        total: insertedCount + updatedCount,
        relationVerified: true
      };

      if (duplicateWarnings.length > 0) {
        response.warnings = duplicateWarnings;
        response.hasWarnings = true;
      }

      return NextResponse.json(response);

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