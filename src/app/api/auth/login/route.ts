// src/app/api/auth/login/route.ts (Updated)
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

    // Verifikasi password dengan dukungan bcrypt dan backward compatibility
    let isPasswordValid = false;
    
    // Cek apakah password di database sudah di-hash dengan bcrypt
    if (user.password.startsWith('$2a') || user.password.startsWith('$2b')) {
      // Password sudah di-hash, gunakan bcrypt.compare
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Password masih plain text (untuk backward compatibility)
      // Dalam implementasi production, sebaiknya semua password di-hash
      isPasswordValid = password === user.password;
      
      // Optional: Auto-hash password lama saat login berhasil
      if (isPasswordValid) {
        try {
          const connectionUpdate = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_NAME || "wirasaba",
          });
          
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          
          await connectionUpdate.execute(
            "UPDATE akun SET password = ? WHERE id_akun = ?",
            [hashedPassword, user.id_akun]
          );
          
          await connectionUpdate.end();
        } catch (updateError) {
          console.error("Error auto-hashing password:", updateError);
          // Jangan gagalkan login jika update password gagal
        }
      }
    }
    
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