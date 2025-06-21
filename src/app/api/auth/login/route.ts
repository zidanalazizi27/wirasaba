import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Buat fungsi handler untuk endpoint POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    // Parse body request
    const body = await request.json();
    const { username, password } = body;

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password diperlukan" },
        { status: 400 }
      );
    }

    // Buat koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "wirasaba",
    });

    // Query untuk mencari user berdasarkan username
    const [rows] = await connection.execute(
      "SELECT id_akun, username, password FROM akun WHERE username = ?",
      [username]
    );

    // Tutup koneksi database
    await connection.end();

    // Cek apakah user ditemukan
    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "Username atau password tidak valid" },
        { status: 401 }
      );
    }

    const user = (rows as any[])[0];

    // Verifikasi password
    // Catatan: Dalam database sebenarnya, password seharusnya di-hash menggunakan bcrypt
    // Kode di bawah ini mengasumsikan password disimpan langsung (tidak di-hash)
    // Untuk keamanan yang lebih baik, kita perlu mengubahnya nanti
    const isPasswordValid = password === user.password;
    
    // Jika password tidak valid
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Username atau password tidak valid" },
        { status: 401 }
      );
    }

    // Jika password valid, buat token JWT
    const token = jwt.sign(
      { userId: user.id_akun, username: user.username },
      process.env.JWT_SECRET || "wirasaba-secret-key",
      { expiresIn: "7d" }
    );

    // Persiapkan data user tanpa password
    const userData = {
      id: user.id_akun,
      username: user.username,
    };

    // Kembalikan respons sukses dengan token dan data user
    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}