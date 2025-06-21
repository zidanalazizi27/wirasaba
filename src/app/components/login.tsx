"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

// Import Material UI icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({
    username: "",
    password: "",
    general: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { login, isLoggedIn } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/admin/direktori");
    }
  }, [isLoggedIn, router]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Reset errors
    setError({
      username: "",
      password: "",
      general: "",
    });

    // Simple validation
    let hasError = false;
    const newErrors = {
      username: "",
      password: "",
      general: "",
    };

    if (!username.trim()) {
      newErrors.username = "Username harus diisi";
      hasError = true;
    }

    if (!password) {
      newErrors.password = "Password harus diisi";
      hasError = true;
    }

    if (hasError) {
      setError(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Call login function from AuthContext
      const result = await login(username, password);

      if (result.success) {
        // Login successful, redirect is handled by AuthContext
      } else {
        setError({
          ...newErrors,
          general: result.message || "Login gagal. Silakan coba lagi.",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError({
        ...newErrors,
        general: "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex h-screen items-center justify-center"
      style={{
        backgroundImage: `url(/image/login_bg.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-80 bg-white rounded-md shadow-md p-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img className="h-20" src="/image/logo_only.png" alt="Logo" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* General error message */}
          {error.general && (
            <div className="mb-4 text-center">
              <p className="text-sm text-red-500">{error.general}</p>
            </div>
          )}

          {/* Username field */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm mb-1 font-semibold"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 focus:outline-none"
              name="username"
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
            {error.username && (
              <p className="text-xs text-red-500 mt-1">{error.username}</p>
            )}
          </div>

          {/* Password field */}
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm mb-1 font-semibold"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="w-full bg-gray-100 rounded px-3 py-2 text-gray-700 focus:outline-none"
                name="password"
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <span
                className="absolute right-2 top-2.5 cursor-pointer text-gray-500"
                onClick={handleTogglePasswordVisibility}
              >
                {showPassword ? (
                  <VisibilityOffIcon fontSize="small" />
                ) : (
                  <VisibilityIcon fontSize="small" />
                )}
              </span>
            </div>
            {error.password && (
              <p className="text-xs text-red-500 mt-1">{error.password}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              className="text-gray-600 text-sm hover:underline"
              onClick={() => router.push("/")}
              disabled={isSubmitting}
            >
              Kembali
            </button>
            <button
              type="submit"
              className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Login..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
