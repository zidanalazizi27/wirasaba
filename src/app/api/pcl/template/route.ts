// src/app/api/pcl/template/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// POST endpoint untuk menghasilkan template Excel
export async function POST(request: NextRequest) {
  try {
    // Create template data
    const templateData = [
      {
        "Nama PCL": "Contoh PCL 1",
        "Status": "Mitra",
        "Telepon": "081234567890"
      },
      {
        "Nama PCL": "Contoh PCL 2", 
        "Status": "Staff",
        "Telepon": "081234567891"
      },
      {
        "Nama PCL": "Contoh PCL 3",
        "Status": "Mitra",
        "Telepon": ""
      }
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    const columnWidths = [
      { wch: 25 },  // Nama PCL
      { wch: 15 },  // Status
      { wch: 15 }   // Telepon
    ];
    worksheet['!cols'] = columnWidths;

    // Style header
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:C1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "DDDDDD" } },
        alignment: { horizontal: "center" }
      };
    }

    // Add validation notes as comments
    if (!worksheet['A1'].c) worksheet['A1'].c = [];
    worksheet['A1'].c.push({
      a: "System",
      t: "Format:\n• Nama PCL: Wajib diisi\n• Status: Harus 'Mitra' atau 'Staff'\n• Telepon: Opsional, hanya angka"
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, "Template PCL");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: "buffer", 
      bookType: "xlsx" 
    });

    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `template-pcl-${timestamp}.xlsx`;

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json({
      success: false,
      message: "Error saat membuat template: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}