// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

interface UserPayload {
  userId: number;
  username: string;
}

interface UpdateProfileBody {
  username: string;
  email: string;
  institution: string;
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

// Helper function untuk membuat koneksi database
async function createConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wirasaba",
  });
}

// Helper function untuk verifikasi token
async function verifyAuthToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "wirasaba-secret-key");
    if (typeof decoded === 'string' || !decoded.userId) {
      return null;
    }
    
    // Verifikasi apakah user masih ada di database
    const connection = await createConnection();
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT id_akun, username FROM akun WHERE id_akun = ?",
      [decoded.userId]
    );
    await connection.end();

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];
    return {
      userId: user.id_akun,
      username: user.username
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Helper function untuk response error
function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

// Helper function untuk response success
function successResponse(data: Record<string, unknown>, message: string = "Berhasil") {
  return NextResponse.json({
    success: true,
    message,
    ...data
  });
}

// GET /api/profile - Ambil data profil
export async function GET(request: NextRequest) {
  try {
    // Verifikasi token
    const user = await verifyAuthToken(request);
    if (!user) {
      return errorResponse("Token tidak valid", 401);
    }

    // Return data profil
    return successResponse({
      username: user.username,
      // Email dan institution default karena hanya untuk frontend
      email: `${user.username}@bps.go.id`,
      institution: "BPS Kabupaten Sidoarjo",
    }, "Data profil berhasil diambil");

  } catch (error) {
    console.error("Profile fetch error:", error);
    return errorResponse("Terjadi kesalahan saat mengambil profil", 500);
  }
}

// PUT /api/profile - Update profil dan ubah password
export async function PUT(request: NextRequest) {
  try {
    // Verifikasi token
    const user = await verifyAuthToken(request);
    if (!user) {
      return errorResponse("Token tidak valid", 401);
    }

    // Parse body request
    const body = await request.json();
    const { action } = body;

    // Routing berdasarkan action
    switch (action) {
      case "update-profile":
        return await handleUpdateProfile(user, body);
      case "change-password":
        return await handleChangePassword(user, body);
      default:
        return errorResponse("Action tidak valid. Gunakan 'update-profile' atau 'change-password'");
    }

  } catch (error) {
    console.error("Profile update error:", error);
    return errorResponse("Terjadi kesalahan saat memperbarui profil", 500);
  }
}

// POST /api/profile - Hash password existing (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verifikasi token
    const user = await verifyAuthToken(request);
    if (!user) {
      return errorResponse("Token tidak valid", 401);
    }

    // Parse body request
    const body = await request.json();
    const { action } = body;

    if (action === "hash-passwords") {
      return await handleHashPasswords();
    } else {
      return errorResponse("Action tidak valid. Gunakan 'hash-passwords'");
    }

  } catch (error) {
    console.error("Hash passwords error:", error);
    return errorResponse("Terjadi kesalahan saat hash password", 500);
  }
}

// Handler untuk update profil
async function handleUpdateProfile(user: UserPayload, body: UpdateProfileBody) {
  const { username, email, institution } = body;

  // Validasi input
  if (!username) {
    return errorResponse("Username diperlukan");
  }

  try {
    const connection = await createConnection();

    // Cek apakah username sudah digunakan oleh user lain
    const [existingUsers] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT id_akun FROM akun WHERE username = ? AND id_akun != ?",
      [username, user.userId]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      return errorResponse("Username sudah digunakan");
    }

    // Update username di database
    await connection.execute(
      "UPDATE akun SET username = ? WHERE id_akun = ?",
      [username, user.userId]
    );

    await connection.end();

    // Note: Email dan institution tidak disimpan ke database sesuai permintaan
    return successResponse({
      username: username,
      email: email, // Hanya untuk response, tidak disimpan
      institution: institution, // Hanya untuk response, tidak disimpan
    }, "Profil berhasil diperbarui");

  } catch (error) {
    console.error("Update profile error:", error);
    return errorResponse("Terjadi kesalahan saat memperbarui profil", 500);
  }
}

// Handler untuk ubah password
async function handleChangePassword(user: UserPayload, body: ChangePasswordBody) {
  const { currentPassword, newPassword } = body;

  // Validasi input
  if (!currentPassword || !newPassword) {
    return errorResponse("Password lama dan baru diperlukan");
  }

  if (newPassword.length < 6) {
    return errorResponse("Password baru minimal 6 karakter");
  }

  try {
    const connection = await createConnection();

    // Ambil password saat ini dari database
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT password FROM akun WHERE id_akun = ?",
      [user.userId]
    );

    if (rows.length === 0) {
      await connection.end();
      return errorResponse("User tidak ditemukan", 404);
    }

    const userData = rows[0];

    // Verifikasi password lama
    let isCurrentPasswordValid = false;
    
    if (userData.password.startsWith('$2a$') || userData.password.startsWith('$2b$')) {
      // Password sudah di-hash dengan bcrypt
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password);
    } else {
      // Password masih plain text (untuk backward compatibility)
      isCurrentPasswordValid = currentPassword === userData.password;
    }

    if (!isCurrentPasswordValid) {
      await connection.end();
      return errorResponse("Password lama tidak benar");
    }

    // Hash password baru dengan bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password di database
    await connection.execute(
      "UPDATE akun SET password = ? WHERE id_akun = ?",
      [hashedPassword, user.userId]
    );

    await connection.end();

    return successResponse({}, "Password berhasil diperbarui");

  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse("Terjadi kesalahan saat mengubah password", 500);
  }
}

// Handler untuk hash password (khusus admin, jika diperlukan)
async function handleHashPasswords() {
  try {
    const connection = await createConnection();

    // Ambil semua user yang passwordnya belum di-hash (misal, tidak diawali '$2a$')
    const [usersToHash] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT id_akun, password FROM akun WHERE password NOT LIKE '$2a$%' AND password NOT LIKE '$2b$%'"
    );

    if (usersToHash.length === 0) {
      await connection.end();
      return successResponse({}, "Tidak ada password yang perlu di-hash");
    }

    let updatedCount = 0;
    for (const user of usersToHash) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);

      await connection.execute(
        "UPDATE akun SET password = ? WHERE id_akun = ?",
        [hashedPassword, user.id_akun]
      );
      updatedCount++;
    }

    await connection.end();

    return successResponse({ updated: updatedCount }, `${updatedCount} password berhasil di-hash`);

  } catch (error) {
    console.error("Hashing passwords error:", error);
    return errorResponse("Terjadi kesalahan saat hashing", 500);
  }
}