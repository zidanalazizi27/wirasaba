// src/app/api/riwayat-survei/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";

// GET a specific riwayat by ID
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
    
    // Query to get riwayat survei by ID
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT r.id_riwayat, r.id_survei, r.id_perusahaan, r.id_pcl, r.selesai, r.ket_survei
       FROM riwayat_survei r
       WHERE r.id_riwayat = ?`,
      [id]
    );
    
    await connection.end();
    
    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Riwayat survei tidak ditemukan" 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT to update a riwayat survei
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.id_survei || !data.id_perusahaan || !data.id_pcl || !data.selesai) {
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
    
    // Update riwayat survei data
    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE riwayat_survei 
       SET id_survei = ?, id_perusahaan = ?, id_pcl = ?, selesai = ?, ket_survei = ?
       WHERE id_riwayat = ?`,
      [data.id_survei, data.id_perusahaan, data.id_pcl, data.selesai, data.ket_survei || "", id]
    );
    
    const affectedRows = result.affectedRows;
    
    await connection.end();
    
    if (affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Riwayat survei tidak ditemukan" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Data riwayat survei berhasil diperbarui" 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat memperbarui data: " + (error as Error).message 
    }, { status: 500 });
  }
}

// DELETE to remove a riwayat survei
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
    
    // Delete riwayat survei
    const [result] = await connection.execute<ResultSetHeader>(
      `DELETE FROM riwayat_survei WHERE id_riwayat = ?`,
      [id]
    );
    
    const affectedRows = result.affectedRows;
    
    await connection.end();
    
    if (affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Riwayat survei tidak ditemukan" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Riwayat survei berhasil dihapus" 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat menghapus data: " + (error as Error).message 
    }, { status: 500 });
  }
}