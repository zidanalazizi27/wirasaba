// src/app/api/pcl/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import * as XLSX from "xlsx";

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

// Interface untuk data Excel yang akan diimport
interface ExcelRowData {
  "Nama PCL": string;
  "Status": string;
  "Telepon"?: string;
}

interface ProcessedData {
  nama_pcl: string;
  status_pcl: string;
  telp_pcl: string | null;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

interface DuplicateData {
  row: number;
  nama_pcl: string;
  status_pcl: string;
  existing_id?: number;
}

// Validation functions (same as in pcl_form.tsx)
const validateField = (fieldName: string, value: any, rowIndex: number): ValidationError | null => {
  switch (fieldName) {
    case "nama_pcl":
      if (!value || !value.toString().trim()) {
        return {
          row: rowIndex,
          field: "Nama PCL",
          message: "Nama PCL wajib diisi",
          value: value
        };
      }
      // Check dangerous characters
      const dangerousChars = /[<>"'&;(){}[\]]/;
      if (dangerousChars.test(value.toString().trim())) {
        return {
          row: rowIndex,
          field: "Nama PCL", 
          message: "Tidak boleh mengandung karakter khusus berbahaya",
          value: value
        };
      }
      break;

    case "status_pcl":
      if (!value || !value.toString().trim()) {
        return {
          row: rowIndex,
          field: "Status",
          message: "Status PCL wajib dipilih",
          value: value
        };
      }
      const validStatuses = ["Mitra", "Staff"];
      if (!validStatuses.includes(value.toString().trim())) {
        return {
          row: rowIndex,
          field: "Status",
          message: `Status harus "Mitra" atau "Staff"`,
          value: value
        };
      }
      break;

    case "telp_pcl":
      if (value && value.toString().trim()) {
        const numbersOnly = /^[0-9]+$/;
        if (!numbersOnly.test(value.toString().trim())) {
          return {
            row: rowIndex,
            field: "Telepon",
            message: "Nomor telepon harus berupa angka",
            value: value
          };
        }
      }
      break;
  }
  return null;
};

// POST endpoint untuk import data PCL
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const mode = formData.get("mode") as string;
    const duplicateAction = formData.get("duplicateAction") as string | null;
    const duplicateData = formData.get("duplicateData") as string | null;

    // Handle duplicate resolution if this is a follow-up request
    if (duplicateAction && duplicateData) {
      return await handleDuplicateResolution(duplicateAction, duplicateData);
    }

    if (!file) {
      return NextResponse.json({
        success: false,
        message: "File tidak ditemukan"
      }, { status: 400 });
    }

    // Validate upload mode
    if (!["append", "replace"].includes(mode)) {
      return NextResponse.json({
        success: false,
        message: "Mode upload tidak valid"
      }, { status: 400 });
    }

    // Read and parse Excel file
    const fileBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet) as ExcelRowData[];

    if (rawData.length === 0) {
      return NextResponse.json({
        success: false,
        message: "File Excel kosong atau tidak ada data yang dapat diproses"
      }, { status: 400 });
    }

    // Validate and process data
    const processedData: ProcessedData[] = [];
    const validationErrors: ValidationError[] = [];

    rawData.forEach((row, index) => {
      const rowIndex = index + 2; // Start from row 2 (accounting for header)
      
      // Normalize column names (handle variations in header naming)
      const normalizedRow = {
        "Nama PCL": row["Nama PCL"] || row["nama_pcl"] || row["Nama"] || row["nama"],
        "Status": row["Status"] || row["status"] || row["status_pcl"] || row["Status PCL"],
        "Telepon": row["Telepon"] || row["telepon"] || row["telp_pcl"] || row["Telp"] || row["No Telepon"]
      };

      // Validate each field
      const errors = [
        validateField("nama_pcl", normalizedRow["Nama PCL"], rowIndex),
        validateField("status_pcl", normalizedRow["Status"], rowIndex),
        validateField("telp_pcl", normalizedRow["Telepon"], rowIndex)
      ].filter(error => error !== null);

      if (errors.length > 0) {
        validationErrors.push(...errors);
      } else {
        // Process valid data
        processedData.push({
          nama_pcl: normalizedRow["Nama PCL"].toString().trim(),
          status_pcl: normalizedRow["Status"].toString().trim(),
          telp_pcl: normalizedRow["Telepon"] ? normalizedRow["Telepon"].toString().trim() : null
        });
      }
    });

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Validasi data gagal",
        errors: validationErrors
      }, { status: 400 });
    }

    // Database operations
    const connection = await createDbConnection();

    try {
      await connection.beginTransaction();

      // Handle "replace" mode - delete all existing data
      if (mode === "replace") {
        await connection.execute("DELETE FROM pcl");
        
        // Insert all data in replace mode
        let insertedCount = 0;
        for (const data of processedData) {
          await connection.execute(
            `INSERT INTO pcl (nama_pcl, status_pcl, telp_pcl) VALUES (?, ?, ?)`,
            [data.nama_pcl, data.status_pcl, data.telp_pcl]
          );
          insertedCount++;
        }

        await connection.commit();
        await connection.end();

        return NextResponse.json({
          success: true,
          message: `${insertedCount} data PCL berhasil diproses`,
          summary: {
            processed: insertedCount,
            total: processedData.length,
            mode: mode
          }
        });
      }

      // Check for duplicates in "append" mode
      const duplicates: DuplicateData[] = [];
      const duplicateIndexes: number[] = [];
      
      for (let i = 0; i < processedData.length; i++) {
        const data = processedData[i];
        const [existingRows] = await connection.execute(
          `SELECT id_pcl FROM pcl 
           WHERE LOWER(TRIM(nama_pcl)) = LOWER(?) 
           AND LOWER(TRIM(status_pcl)) = LOWER(?)`,
          [data.nama_pcl, data.status_pcl]
        );

        if ((existingRows as any[]).length > 0) {
          duplicates.push({
            row: i + 2,
            nama_pcl: data.nama_pcl,
            status_pcl: data.status_pcl,
            existing_id: (existingRows as any[])[0].id_pcl
          });
          duplicateIndexes.push(i);
        }
      }

      // If duplicates found, return them for user decision
      if (duplicates.length > 0) {
        await connection.rollback();
        await connection.end();

        return NextResponse.json({
          success: true,
          duplicates: duplicates,
          processedData: processedData, // Send back the processed data
          summary: {
            total: processedData.length,
            duplicates: duplicates.length,
            new_records: processedData.length - duplicates.length
          }
        });
      }

      // No duplicates - insert all data
      let insertedCount = 0;
      for (const data of processedData) {
        await connection.execute(
          `INSERT INTO pcl (nama_pcl, status_pcl, telp_pcl) VALUES (?, ?, ?)`,
          [data.nama_pcl, data.status_pcl, data.telp_pcl]
        );
        insertedCount++;
      }

      await connection.commit();
      await connection.end();

      return NextResponse.json({
        success: true,
        message: `${insertedCount} data PCL berhasil diproses`,
        summary: {
          processed: insertedCount,
          total: processedData.length,
          mode: mode
        }
      });

    } catch (dbError) {
      await connection.rollback();
      await connection.end();
      throw dbError;
    }

  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({
      success: false,
      message: "Error saat memproses file: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}

// Function to handle duplicate resolution
async function handleDuplicateResolution(action: string, dataString: string) {
  try {
    const { processedData, duplicates } = JSON.parse(dataString);
    
    if (!["replace", "skip"].includes(action)) {
      return NextResponse.json({
        success: false,
        message: "Aksi duplikasi tidak valid"
      }, { status: 400 });
    }

    const connection = await createDbConnection();

    try {
      await connection.beginTransaction();

      let processedCount = 0;
      
      if (action === "replace") {
        // Replace duplicates and insert new data
        for (let i = 0; i < processedData.length; i++) {
          const data = processedData[i];
          const isDuplicate = duplicates.some((dup: DuplicateData) => 
            dup.nama_pcl === data.nama_pcl && dup.status_pcl === data.status_pcl
          );

          if (isDuplicate) {
            // Update existing record
            await connection.execute(
              `UPDATE pcl 
               SET nama_pcl = ?, status_pcl = ?, telp_pcl = ?
               WHERE LOWER(TRIM(nama_pcl)) = LOWER(?) 
               AND LOWER(TRIM(status_pcl)) = LOWER(?)`,
              [data.nama_pcl, data.status_pcl, data.telp_pcl, data.nama_pcl, data.status_pcl]
            );
          } else {
            // Insert new record
            await connection.execute(
              `INSERT INTO pcl (nama_pcl, status_pcl, telp_pcl) VALUES (?, ?, ?)`,
              [data.nama_pcl, data.status_pcl, data.telp_pcl]
            );
          }
          processedCount++;
        }
      } else {
        // Skip duplicates, only insert new data
        for (let i = 0; i < processedData.length; i++) {
          const data = processedData[i];
          const isDuplicate = duplicates.some((dup: DuplicateData) => 
            dup.nama_pcl === data.nama_pcl && dup.status_pcl === data.status_pcl
          );

          if (!isDuplicate) {
            await connection.execute(
              `INSERT INTO pcl (nama_pcl, status_pcl, telp_pcl) VALUES (?, ?, ?)`,
              [data.nama_pcl, data.status_pcl, data.telp_pcl]
            );
            processedCount++;
          }
        }
      }

      await connection.commit();
      await connection.end();

      return NextResponse.json({
        success: true,
        message: `${processedCount} data PCL berhasil diproses`,
        summary: {
          processed: processedCount,
          total: processedData.length,
          action: action,
          duplicates_handled: duplicates.length
        }
      });

    } catch (dbError) {
      await connection.rollback();
      await connection.end();
      throw dbError;
    }

  } catch (error) {
    console.error("Duplicate resolution error:", error);
    return NextResponse.json({
      success: false,
      message: "Error saat menangani duplikasi: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}

// GET endpoint untuk template (redirect ke /api/pcl/template)
export async function GET() {
  return NextResponse.json({
    success: false,
    message: "Gunakan endpoint /api/pcl/template untuk mendapatkan template"
  }, { status: 404 });
}