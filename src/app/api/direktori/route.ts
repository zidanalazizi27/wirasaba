import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// GET - Untuk mendapatkan semua data direktori atau data direktori berdasarkan id_perusahaan
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id_perusahaan = searchParams.get('id_perusahaan');
  
  try {
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });

    let query = `
      SELECT id_direktori, id_perusahaan, thn_direktori 
      FROM direktori
    `;
    
    const params = [];
    
    // Jika ada parameter id_perusahaan, filter berdasarkan id_perusahaan
    if (id_perusahaan) {
      query += ` WHERE id_perusahaan = ?`;
      params.push(id_perusahaan);
    }
    
    // Tambahkan sorting
    query += ` ORDER BY thn_direktori`;
    
    const [rows] = await dbConnection.execute(query, params);
    
    await dbConnection.end();
    
    return NextResponse.json({ 
      success: true, 
      count: (rows as any[]).length,
      data: rows 
    });
  } catch (error) {
    console.error('Database error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Untuk menambahkan tahun direktori baru
export async function POST(request: NextRequest) {
  try {
    const { id_perusahaan, thn_direktori } = await request.json();
    
    if (!id_perusahaan || !thn_direktori) {
      return NextResponse.json({ 
        success: false, 
        message: "ID perusahaan dan tahun direktori diperlukan" 
      }, { status: 400 });
    }
    
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });
    
    // Cek apakah kombinasi id_perusahaan dan thn_direktori sudah ada
    const [existingRows] = await dbConnection.execute(
      `SELECT id_direktori FROM direktori 
       WHERE id_perusahaan = ? AND thn_direktori = ?`,
      [id_perusahaan, thn_direktori]
    );
    
    if ((existingRows as any[]).length > 0) {
      await dbConnection.end();
      return NextResponse.json({ 
        success: false, 
        message: "Tahun direktori tersebut sudah ada untuk perusahaan ini" 
      }, { status: 409 });
    }
    
    // Tambahkan tahun direktori baru
    const [result] = await dbConnection.execute(
      `INSERT INTO direktori (id_perusahaan, thn_direktori) 
       VALUES (?, ?)`,
      [id_perusahaan, thn_direktori]
    );
    
    await dbConnection.end();
    
    return NextResponse.json({ 
      success: true, 
      message: "Tahun direktori berhasil ditambahkan",
      data: result
    });
  } catch (error) {
    console.error('Database error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Untuk menghapus tahun direktori
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id_perusahaan = searchParams.get('id_perusahaan');
  const thn_direktori = searchParams.get('thn_direktori');
  
  if (!id_perusahaan || !thn_direktori) {
    return NextResponse.json({ 
      success: false, 
      message: "ID perusahaan dan tahun direktori diperlukan" 
    }, { status: 400 });
  }
  
  try {
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });
    
    // Hapus tahun direktori
    const [result] = await dbConnection.execute(
      `DELETE FROM direktori 
       WHERE id_perusahaan = ? AND thn_direktori = ?`,
      [id_perusahaan, thn_direktori]
    );
    
    const rowsAffected = (result as any).affectedRows;
    
    await dbConnection.end();
    
    if (rowsAffected === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Tahun direktori tidak ditemukan" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Tahun direktori berhasil dihapus"
    });
  } catch (error) {
    console.error('Database error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}