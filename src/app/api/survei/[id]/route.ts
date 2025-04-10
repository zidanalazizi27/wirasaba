import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// GET a specific survey by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });
    
    // Query to get survey by ID
    const [rows] = await connection.execute(
      `SELECT id_survei, nama_survei, fungsi, periode, tahun
       FROM survei
       WHERE id_survei = ?`,
      [id]
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
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT to update a survey
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
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
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });
    
    // Update survey data
    const [result] = await connection.execute(
      `UPDATE survei 
       SET nama_survei = ?, fungsi = ?, periode = ?, tahun = ?
       WHERE id_survei = ?`,
      [data.nama_survei, data.fungsi, data.periode, data.tahun, id]
    );
    
    const affectedRows = (result as any).affectedRows;
    
    await connection.end();
    
    if (affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Survei tidak ditemukan" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Data survei berhasil diperbarui" 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat memperbarui data: " + (error as Error).message 
    }, { status: 500 });
  }
}

// DELETE to remove a survey
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });
    
    // First check if there are any related records in the riwayat_survei table
    const [relatedRows] = await connection.execute(
      `SELECT COUNT(*) as count FROM riwayat_survei WHERE id_survei = ?`,
      [id]
    );
    
    if ((relatedRows as any[])[0].count > 0) {
      await connection.end();
      return NextResponse.json({ 
        success: false, 
        message: "Tidak dapat menghapus survei karena masih memiliki riwayat survei" 
      }, { status: 409 });
    }
    
    // Delete survey
    const [result] = await connection.execute(
      `DELETE FROM survei WHERE id_survei = ?`,
      [id]
    );
    
    const affectedRows = (result as any).affectedRows;
    
    await connection.end();
    
    if (affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Survei tidak ditemukan" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Survei berhasil dihapus" 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat menghapus data: " + (error as Error).message 
    }, { status: 500 });
  }
}