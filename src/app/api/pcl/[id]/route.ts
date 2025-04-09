import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// GET a specific PCL by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // Buat koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });
    
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
    console.error("Database error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT to update a PCL
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.nama_pcl || !data.status_pcl) {
      return NextResponse.json({ 
        success: false, 
        message: "Nama PCL dan status harus diisi" 
      }, { status: 400 });
    }
    
    // Buat koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });
    
    // Update PCL data
    const [result] = await connection.execute(
      `UPDATE pcl 
       SET nama_pcl = ?, status_pcl = ?, telp_pcl = ?
       WHERE id_pcl = ?`,
      [data.nama_pcl, data.status_pcl, data.telp_pcl || null, id]
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
      message: "Data PCL berhasil diperbarui" 
    });
  } catch (error) {
    console.error("Database error:", error.message);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat memperbarui data: " + error.message 
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
    // Buat koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });
    
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
    console.error("Database error:", error.message);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat menghapus data: " + error.message 
    }, { status: 500 });
  }
}