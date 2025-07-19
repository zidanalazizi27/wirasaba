// src/app/api/riwayat-survei/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";

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

// Function untuk check duplicate
async function handleCheckDuplicate(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const idSurvei = searchParams.get("id_survei");
  const idPerusahaan = searchParams.get("id_perusahaan");
  const excludeId = searchParams.get("exclude_id");

  if (!idSurvei || !idPerusahaan) {
    return NextResponse.json({
      success: false,
      message: "Parameter id_survei dan id_perusahaan diperlukan"
    }, { status: 400 });
  }

  try {
    const connection = await createDbConnection();

    let query = `
      SELECT COUNT(*) as count 
      FROM riwayat_survei 
      WHERE id_survei = ? AND id_perusahaan = ?
    `;
    const params: (string | null)[] = [idSurvei, idPerusahaan];

    // Exclude current record if editing
    if (excludeId && excludeId !== "") {
      query += " AND id_riwayat != ?";
      params.push(excludeId);
    }

    const [rows] = await connection.execute<RowDataPacket[]>(query, params);
    await connection.end();

    const count = rows[0].count;
    
    return NextResponse.json({
      success: true,
      isDuplicate: count > 0
    });
  } catch (error) {
    console.error("Error checking duplicate:", error);
    return NextResponse.json({
      success: false,
      message: "Error saat mengecek duplikasi data"
    }, { status: 500 });
  }
}

// Function untuk check duplicate company group
async function handleCheckDuplicateCompanyGroup(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id_survei = searchParams.get('id_survei');
    const id_perusahaan_list = searchParams.get('id_perusahaan_list');
    const exclude_id = searchParams.get('exclude_id');

    if (!id_survei || !id_perusahaan_list) {
      return NextResponse.json({ isDuplicate: false });
    }

    const connection = await createDbConnection();

    const idArray = id_perusahaan_list.split(',').map(id => parseInt(id.trim()));
    const placeholders = idArray.map(() => '?').join(',');
    
    let query = `
      SELECT rs.*, p.nama_perusahaan, p.kip 
      FROM riwayat_survei rs
      JOIN perusahaan p ON rs.id_perusahaan = p.id_perusahaan
      WHERE rs.id_survei = ? AND rs.id_perusahaan IN (${placeholders})
    `;
    
    const queryParams = [id_survei, ...idArray];
    
    if (exclude_id) {
      query += ' AND rs.id_riwayat != ?';
      queryParams.push(exclude_id);
    }

    const [rows] = await connection.execute<RowDataPacket[]>(query, queryParams);
    await connection.end();
    
    if (rows.length > 0) {
      return NextResponse.json({
        isDuplicate: true,
        duplicateInfo: {
          existing_entries: rows,
          message: "Survei ini sudah memiliki data untuk perusahaan dengan KIP dan nama yang sama"
        }
      });
    }

    return NextResponse.json({ isDuplicate: false });
  } catch (error) {
    console.error('Error checking duplicate company group:', error);
    return NextResponse.json({ isDuplicate: false });
  }
}

// GET endpoint with advanced filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Check duplicate endpoint
  if (searchParams.has("check_duplicate")) {
    return handleCheckDuplicate(request);
  }

  // Check duplicate company group endpoint
  if (searchParams.get('check_duplicate_company_group') === 'true') {
    return handleCheckDuplicateCompanyGroup(request);
  }

  // Extract filter parameters
  const searchTerm = searchParams.get("search") || "";
  const surveiFilter = searchParams.get("survei") || "all";
  const pclFilter = searchParams.get("pcl") || "all";
  const selesaiFilter = searchParams.get("selesai") || "all";
  const tahunFilter = searchParams.get("tahun") || "all";
  const kipFilter = searchParams.get("kip") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  let connection;
  
  try {
    // Create database connection
    connection = await createDbConnection();

    // Prepare where conditions
    const whereConditions: string[] = [];
    const queryParams: (string | number)[] = [];

    // Search filter (multi-column) - Include KIP in search
    if (searchTerm) {
      whereConditions.push(
        "(s.nama_survei LIKE ? OR p.kip LIKE ? OR p.nama_perusahaan LIKE ? OR pcl.nama_pcl LIKE ?)"
      );
      queryParams.push(
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`
      );
    }

    // Filter khusus berdasarkan KIP
    if (kipFilter) {
      whereConditions.push("p.kip = ?");
      queryParams.push(kipFilter);
    }

    // Survei filter
    if (surveiFilter !== "all") {
      whereConditions.push("r.id_survei = ?");
      queryParams.push(surveiFilter);
    }

    // PCL filter
    if (pclFilter !== "all") {
      whereConditions.push("r.id_pcl = ?");
      queryParams.push(pclFilter);
    }

    // Selesai filter
    if (selesaiFilter !== "all") {
      whereConditions.push("r.selesai = ?");
      queryParams.push(selesaiFilter);
    }

    // Tahun filter
    if (tahunFilter !== "all") {
      whereConditions.push("s.tahun = ?");
      queryParams.push(parseInt(tahunFilter));
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 
      ? "WHERE " + whereConditions.join(" AND ") 
      : "";

    // Get sort parameters
    const sorts = [];
    let i = 0;
    while (searchParams.has(`sort[${i}][column]`)) {
      const column = searchParams.get(`sort[${i}][column]`);
      const direction = searchParams.get(`sort[${i}][direction]`);
      if (column && direction) {
        // Validate column name to prevent SQL injection
        const validColumns = ["nama_survei", "kip", "nama_perusahaan", "nama_pcl", "tahun", "selesai", "id_riwayat"];
        if (validColumns.includes(column)) {
          sorts.push({ column, direction });
        }
      }
      i++;
    }

    // Build ORDER BY clause
    let orderByClause = "";
    if (sorts.length > 0) {
      const orderByParts = sorts.map((sort) => {
        const direction = sort.direction === "ascending" ? "ASC" : "DESC";
        
        // Map column names to their table prefixes
        let columnWithPrefix;
        switch (sort.column) {
          case "nama_survei":
            columnWithPrefix = "s.nama_survei";
            break;
          case "kip":
            columnWithPrefix = "p.kip";
            break;
          case "nama_perusahaan":
            columnWithPrefix = "p.nama_perusahaan";
            break;
          case "nama_pcl":
            columnWithPrefix = "pcl.nama_pcl";
            break;
          case "tahun":
            columnWithPrefix = "s.tahun";
            break;
          case "selesai":
            columnWithPrefix = "r.selesai";
            break;
          case "id_riwayat":
            columnWithPrefix = "r.id_riwayat";
            break;
          default:
            columnWithPrefix = "r.id_riwayat";
        }
        
        return `${columnWithPrefix} ${direction}`;
      });
      orderByClause = "ORDER BY " + orderByParts.join(", ");
    } else {
      // Default sorting
      orderByClause = "ORDER BY s.tahun DESC, s.nama_survei ASC, p.nama_perusahaan ASC";
    }

    // Build data query
    const dataQuery = `
      SELECT 
        r.id_riwayat,
        r.id_survei, 
        s.nama_survei,
        COALESCE(s.fungsi, '') as fungsi,
        COALESCE(s.periode, '') as periode,
        COALESCE(s.tahun, 0) as tahun,
        r.id_perusahaan,
        COALESCE(p.kip, '') as kip,
        COALESCE(p.nama_perusahaan, '') as nama_perusahaan,
        r.id_pcl,
        COALESCE(pcl.nama_pcl, '') as nama_pcl,
        r.selesai,
        COALESCE(r.ket_survei, '') as ket_survei
      FROM riwayat_survei r
      LEFT JOIN survei s ON r.id_survei = s.id_survei
      LEFT JOIN perusahaan p ON r.id_perusahaan = p.id_perusahaan
      LEFT JOIN pcl ON r.id_pcl = pcl.id_pcl
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM riwayat_survei r
      LEFT JOIN survei s ON r.id_survei = s.id_survei
      LEFT JOIN perusahaan p ON r.id_perusahaan = p.id_perusahaan
      LEFT JOIN pcl ON r.id_pcl = pcl.id_pcl
      ${whereClause}
    `;

    // Execute both queries in parallel
    const [
      [rows],
      [countRows]
    ] = await Promise.all([
      connection.execute<RowDataPacket[]>(dataQuery, [...queryParams, limit, offset]),
      connection.execute<RowDataPacket[]>(countQuery, queryParams)
    ]);
    
    // Format response data
    const responseData = rows.map((row: RowDataPacket) => ({
      id_riwayat: row.id_riwayat,
      id_survei: row.id_survei,
      id_perusahaan: row.id_perusahaan,
      id_pcl: row.id_pcl,
      nama_survei: row.nama_survei,
      fungsi: row.fungsi || "",
      periode: row.periode || "",
      tahun: row.tahun,
      nama_perusahaan: row.nama_perusahaan,
      kip: row.kip,
      nama_pcl: row.nama_pcl,
      selesai: row.selesai,
      ket_survei: row.ket_survei || "",
    }));

    // Get total rows without pagination for totalPages calculation
    const totalRows = countRows[0].total;

    // Close connection
    await connection.end();

    console.log("Query successful. Total rows:", totalRows, "Data rows:", responseData.length);

    return NextResponse.json({
      success: true,
      data: responseData,
      pagination: {
        page,
        limit,
        totalRows,
        totalPages: Math.ceil(totalRows / limit),
      },
      applied_filters: {
        search: searchTerm || null,
        kip: kipFilter || null,
        survei: surveiFilter !== "all" ? surveiFilter : null,
        pcl: pclFilter !== "all" ? pclFilter : null,
        selesai: selesaiFilter !== "all" ? selesaiFilter : null,
        tahun: tahunFilter !== "all" ? tahunFilter : null,
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    console.error("Error details:", {
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    
    // Close connection if still open
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Database error: " + (error as Error).message,
        error_details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

// Function untuk handle POST request (create)
export async function POST(request: NextRequest) {
  try {
    const { id_perusahaan_list, ...otherData } = await request.json();

    if (!Array.isArray(id_perusahaan_list) || id_perusahaan_list.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'id_perusahaan_list harus berupa array dan tidak boleh kosong'
      }, { status: 400 });
    }

    const connection = await createDbConnection();
    let insertedCount = 0;

    for (const id_perusahaan of id_perusahaan_list) {
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO riwayat_survei (id_survei, id_perusahaan, id_pcl, selesai, ket_survei)
         VALUES (?, ?, ?, ?, ?)`,
        [
          otherData.id_survei,
          id_perusahaan,
          otherData.id_pcl,
          otherData.selesai,
          otherData.ket_survei
        ]
      );
      if (result.affectedRows === 1) {
        insertedCount++;
      }
    }

    await connection.end();

    if (insertedCount === id_perusahaan_list.length) {
      return NextResponse.json({
        success: true,
        message: `Berhasil menambahkan ${insertedCount} data riwayat survei baru`
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Hanya berhasil menambahkan ${insertedCount} dari ${id_perusahaan_list.length} data. Mungkin ada duplikasi atau kesalahan lain.`
      }, { status: 207 }); // Multi-Status
    }

  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan saat menambahkan data riwayat survei"
    }, { status: 500 });
  }
}

// Function untuk handle PUT request (update)
export async function PUT(request: NextRequest) {
  try {
    const { id_riwayat, ...data } = await request.json();

    if (!id_riwayat) {
      return NextResponse.json({
        success: false,
        message: 'id_riwayat diperlukan untuk update'
      }, { status: 400 });
    }

    const connection = await createDbConnection();

    // Cek duplikasi sebelum update
    if (data.id_survei && data.id_perusahaan) {
      const [duplicateCheck] = await connection.execute<RowDataPacket[]>(
        `SELECT id_riwayat FROM riwayat_survei WHERE id_survei = ? AND id_perusahaan = ? AND id_riwayat != ?`,
        [data.id_survei, data.id_perusahaan, id_riwayat]
      );

      if (duplicateCheck.length > 0) {
        await connection.end();
        return NextResponse.json({
          success: false,
          message: 'Data dengan survei dan perusahaan yang sama sudah ada',
          isDuplicate: true
        }, { status: 409 });
      }
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE riwayat_survei
       SET id_survei = ?, id_perusahaan = ?, id_pcl = ?, selesai = ?, ket_survei = ?
       WHERE id_riwayat = ?`,
      [
        data.id_survei,
        data.id_perusahaan,
        data.id_pcl,
        data.selesai,
        data.ket_survei,
        id_riwayat
      ]
    );

    await connection.end();

    if (result.affectedRows > 0) {
      return NextResponse.json({
        success: true,
        message: 'Data riwayat survei berhasil diperbarui'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Data riwayat survei tidak ditemukan atau tidak ada perubahan'
      }, { status: 404 });
    }
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui data"
    }, { status: 500 });
  }
}

// Function untuk handle DELETE request
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Payload harus berisi array "ids" yang tidak kosong'
      }, { status: 400 });
    }

    const connection = await createDbConnection();
    const placeholders = ids.map(() => '?').join(',');

    const [result] = await connection.execute<ResultSetHeader>(
      `DELETE FROM riwayat_survei WHERE id_riwayat IN (${placeholders})`,
      ids
    );

    await connection.end();

    if (result.affectedRows === ids.length) {
      return NextResponse.json({
        success: true,
        message: `${result.affectedRows} data berhasil dihapus`
      });
    } else if (result.affectedRows > 0) {
      return NextResponse.json({
        success: false,
        message: `Hanya ${result.affectedRows} dari ${ids.length} data yang ditemukan dan dihapus`
      }, { status: 207 });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Tidak ada data yang cocok untuk dihapus'
      }, { status: 404 });
    }

  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan saat menghapus data"
    }, { status: 500 });
  }
}