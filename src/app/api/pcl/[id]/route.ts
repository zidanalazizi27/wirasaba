// src/app/api/pcl/[id]/route.ts
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

// GET a specific PCL by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // Create database connection
    const connection = await createDbConnection();
    
    // Query to get PCL by ID
    const [rows] = await connection.execute(
      `SELECT id_pcl, nama_pcl, status_pcl, telp_pcl
       FROM pcl
       WHERE id_pcl = ?`,
      [id]
    );
    
    await connection.end();
    
    if ((rows as any[]).length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "PCL tidak ditemukan" 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: (rows as any[])[0]
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Error saat mengambil data: " + (error instanceof Error ? error.message : "Unknown error")
      },
      { status: 500 }
    );
  }
}

// PUT to update a PCL dengan duplicate check
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const data = await request.json();
    
    // Validasi input basic
    if (!data.nama_pcl || !data.status_pcl) {
      return NextResponse.json({ 
        success: false, 
        message: "Nama PCL dan Status PCL wajib diisi" 
      }, { status: 400 });
    }

    // Validasi karakter berbahaya pada nama PCL
    const dangerousChars = /[<>"'&;(){}[\]]/;
    if (dangerousChars.test(data.nama_pcl.trim())) {
      return NextResponse.json({
        success: false,
        message: "Nama PCL tidak boleh mengandung karakter khusus berbahaya"
      }, { status: 400 });
    }

    // Validasi telepon jika diisi
    if (data.telp_pcl && data.telp_pcl.trim()) {
      const numbersOnly = /^[0-9]+$/;
      if (!numbersOnly.test(data.telp_pcl.trim())) {
        return NextResponse.json({
          success: false,
          message: "Nomor telepon harus berupa angka"
        }, { status: 400 });
      }
    }
    
    // Create database connection
    const connection = await createDbConnection();
    
    try {
      // Begin transaction
      await connection.beginTransaction();

      // Check if PCL exists
      const [existingRows] = await connection.execute(
        `SELECT id_pcl, nama_pcl, status_pcl FROM pcl WHERE id_pcl = ?`,
        [id]
      );

      if ((existingRows as any[]).length === 0) {
        await connection.rollback();
        await connection.end();
        return NextResponse.json({
          success: false,
          message: "PCL tidak ditemukan"
        }, { status: 404 });
      }

      // ===== DUPLICATE CHECK SEPERTI DI SURVEI_FORM.TSX =====
      // Check for duplicate nama_pcl + status_pcl combination (excluding current record)
      const [duplicateRows] = await connection.execute(
        `SELECT id_pcl FROM pcl 
         WHERE LOWER(TRIM(nama_pcl)) = LOWER(?) 
         AND LOWER(TRIM(status_pcl)) = LOWER(?) 
         AND id_pcl != ?`,
        [data.nama_pcl.trim(), data.status_pcl.trim(), id]
      );

      if ((duplicateRows as any[]).length > 0) {
        await connection.rollback();
        await connection.end();
        return NextResponse.json(
          {
            success: false,
            message: `Kombinasi Nama PCL "${data.nama_pcl.trim()}" dengan Status "${data.status_pcl.trim()}" sudah terdaftar dalam sistem.`,
          },
          { status: 409 } // 409 = Conflict
        );
      }

      // Update PCL data jika tidak duplikat
      const [result] = await connection.execute(
        `UPDATE pcl 
         SET nama_pcl = ?, status_pcl = ?, telp_pcl = ? 
         WHERE id_pcl = ?`,
        [
          data.nama_pcl.trim(),
          data.status_pcl.trim(),
          data.telp_pcl ? data.telp_pcl.trim() : null,
          id
        ]
      );
      
      const affectedRows = (result as any).affectedRows;

      await connection.commit();
      await connection.end();
      
      if (affectedRows === 0) {
        return NextResponse.json({ 
          success: false, 
          message: "PCL tidak ditemukan" 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Data PCL berhasil diperbarui" 
      });

    } catch (dbError) {
      await connection.rollback();
      await connection.end();
      throw dbError;
    }

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat memperbarui data: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}

// DELETE to remove a PCL
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // Create database connection
    const connection = await createDbConnection();
    
    // Delete PCL
    const [result] = await connection.execute(
      `DELETE FROM pcl WHERE id_pcl = ?`,
      [id]
    );
    
    const affectedRows = (result as any).affectedRows;
    
    await connection.end();
    
    if (affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "PCL tidak ditemukan" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "PCL berhasil dihapus" 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat menghapus data: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}