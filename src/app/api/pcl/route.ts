// src/app/api/pcl/route.ts
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

// GET endpoint with advanced filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format");
  const searchTerm = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;
  
  try {
    // Buat koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wirasaba',
    });

    // Jika format=dropdown, gunakan format lama untuk dropdown di detail_direktori
    if (format === "dropdown") {
      const [rows] = await connection.execute(`
        SELECT id_pcl, nama_pcl, status_pcl
        FROM pcl
        ORDER BY nama_pcl
      `);
      
      await connection.end();
      
      // Format untuk dropdown
      const formattedData = (rows as any[]).map(pcl => ({
        name: `${pcl.nama_pcl} (${pcl.status_pcl})`,
        uid: pcl.nama_pcl
      }));
      
      return NextResponse.json(formattedData);
    }
    
    // Selain itu, gunakan format lengkap untuk tabel PCL
    // Buat kondisi WHERE untuk query
    let whereConditions = [];
    let queryParams = [];
    
    // Filter berdasarkan pencarian
    if (searchTerm) {
      whereConditions.push("nama_pcl LIKE ?");
      queryParams.push(`%${searchTerm}%`);
    }

    // Filter berdasarkan status
    if (status !== "all") {
      whereConditions.push("status_pcl = ?");
      queryParams.push(status);
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 
      ? "WHERE " + whereConditions.join(" AND ") 
      : "";

    // Get sort parameters if any
    const sorts = [];
    let i = 0;
    while (searchParams.has(`sort[${i}][column]`)) {
      const column = searchParams.get(`sort[${i}][column]`);
      const direction = searchParams.get(`sort[${i}][direction]`);
      if (column && direction) {
        sorts.push({ column, direction });
      }
      i++;
    }

    // Build ORDER BY clause for sorting
    let orderByClause = "";
    if (sorts.length > 0) {
      const orderByParts = sorts.map(sort => {
        // Prevent SQL injection by validating column names
        const validColumns = ["nama_pcl", "status_pcl"];
        const column = validColumns.includes(sort.column) ? sort.column : "nama_pcl";
        const direction = sort.direction === "ascending" ? "ASC" : "DESC";
        return `${column} ${direction}`;
      });
      orderByClause = "ORDER BY " + orderByParts.join(", ");
    } else {
      // Default sorting
      orderByClause = "ORDER BY nama_pcl ASC";
    }

    // Query untuk menghitung total data
    const [totalRows] = await connection.execute(
      `SELECT COUNT(*) as total FROM pcl ${whereClause}`,
      queryParams
    );

    // Query data pcl dengan pagination
    const [rows] = await connection.execute(
      `SELECT id_pcl, nama_pcl, status_pcl, telp_pcl
       FROM pcl
       ${whereClause}
       ${orderByClause}
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Close connection
    await connection.end();

    // Format the response
    const total = (totalRows as any[])[0].total;
    
    return NextResponse.json({
      success: true,
      count: total,
      data: rows
    });
  } catch (error) {
    console.error("Database error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new PCL
export async function POST(request: NextRequest) {
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
    
    // Insert new PCL
    const [result] = await connection.execute(
      `INSERT INTO pcl (nama_pcl, status_pcl, telp_pcl) 
       VALUES (?, ?, ?)`,
      [data.nama_pcl, data.status_pcl, data.telp_pcl || null]
    );
    
    // Get new PCL ID
    const newPclId = (result as any).insertId;
    
    await connection.end();
    
    return NextResponse.json({ 
      success: true, 
      message: "Data PCL berhasil ditambahkan",
      id: newPclId
    });
  } catch (error) {
    console.error("Database error:", error.message);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat menyimpan data: " + error.message 
    }, { status: 500 });
  }
}

// Add PUT endpoint to update existing PCL
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.id_pcl) {
      return NextResponse.json({ 
        success: false, 
        message: "ID PCL harus disertakan" 
      }, { status: 400 });
    }
    
    // Create database connection
    const connection = await createDbConnection();
    
    // Prepare update fields
    const updateFields = [];
    const updateParams = [];
    
    if (data.nama_pcl) {
      updateFields.push("nama_pcl = ?");
      updateParams.push(data.nama_pcl);
    }
    
    if (data.status_pcl) {
      updateFields.push("status_pcl = ?");
      updateParams.push(data.status_pcl);
    }
    
    if (data.telp_pcl) {
      updateFields.push("telp_pcl = ?");
      updateParams.push(data.telp_pcl);
    }
    
    // If no fields to update
    if (updateFields.length === 0) {
      await connection.end();
      return NextResponse.json({ 
        success: false, 
        message: "Tidak ada data yang diperbarui" 
      }, { status: 400 });
    }
    
    // Add id_pcl to params
    updateParams.push(data.id_pcl);
    
    // Update PCL
    const [result] = await connection.execute(
      `UPDATE pcl 
       SET ${updateFields.join(", ")} 
       WHERE id_pcl = ?`,
      updateParams
    );
    
    await connection.end();
    
    // Check if any rows were affected
    const affectedRows = (result as any).affectedRows;
    
    if (affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Data PCL tidak ditemukan" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Data PCL berhasil diperbarui",
      affectedRows
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat memperbarui data: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}

// Add DELETE endpoint to remove PCL
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id_pcl = searchParams.get("id");
    
    // Validate ID
    if (!id_pcl) {
      return NextResponse.json({ 
        success: false, 
        message: "ID PCL harus disertakan" 
      }, { status: 400 });
    }
    
    // Create database connection
    const connection = await createDbConnection();
    
    // Delete PCL
    const [result] = await connection.execute(
      `DELETE FROM pcl WHERE id_pcl = ?`,
      [id_pcl]
    );
    
    await connection.end();
    
    // Check if any rows were affected
    const affectedRows = (result as any).affectedRows;
    
    if (affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Data PCL tidak ditemukan" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Data PCL berhasil dihapus",
      affectedRows
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error saat menghapus data: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}