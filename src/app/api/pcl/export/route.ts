// src/app/api/pcl/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import * as XLSX from "xlsx";

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

// GET endpoint untuk export data PCL ke Excel
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    // Create database connection
    const connection = await createDbConnection();

    // Buat kondisi WHERE untuk query berdasarkan filter
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

    // Query untuk mengambil semua data PCL sesuai filter dan sorting
    const [rows] = await connection.execute(
      `SELECT id_pcl, nama_pcl, status_pcl, telp_pcl
       FROM pcl
       ${whereClause}
       ${orderByClause}`,
      queryParams
    );

    await connection.end();

    const pclData = rows as any[];

    // Jika tidak ada data
    if (pclData.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Tidak ada data PCL yang ditemukan untuk diekspor"
      }, { status: 404 });
    }

    // Format data untuk Excel dengan header yang sesuai (tanpa ID)
    const excelData = pclData.map((pcl, index) => ({
      "No": index + 1,
      "Nama PCL": pcl.nama_pcl,
      "Status": pcl.status_pcl,
      "Telepon": pcl.telp_pcl || "-"
    }));

    // Buat workbook Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set lebar kolom (tanpa kolom ID)
    const columnWidths = [
      { wch: 5 },   // No
      { wch: 25 },  // Nama PCL
      { wch: 15 },  // Status
      { wch: 15 }   // Telepon
    ];
    worksheet['!cols'] = columnWidths;

    // Tambahkan style untuk header (4 kolom tanpa ID)
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:D1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "DDDDDD" } },
        alignment: { horizontal: "center" }
      };
    }

    // Append worksheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data PCL");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: "buffer", 
      bookType: "xlsx" 
    });

    // Generate filename dengan timestamp dan filter info
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '');
    
    let filenamePrefix = "data-pcl";
    if (searchTerm || status !== "all") {
      filenamePrefix += "-filtered";
    }
    const filename = `${filenamePrefix}-${timestamp}.xlsx`;

    // Return Excel file sebagai response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Error exporting PCL data:", error);
    return NextResponse.json({
      success: false,
      message: "Error saat mengekspor data: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}