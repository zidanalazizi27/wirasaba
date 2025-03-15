"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter hook

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
  });
  const router = useRouter(); // Initialize router

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset errors
    setError({
      username: "",
      password: "",
    });

    // Simple validation
    let hasError = false;
    const newErrors = {
      username: "",
      password: "",
    };

    if (!username.trim()) {
      newErrors.username = "Username is required";
      hasError = true;
    }

    if (!password) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    if (hasError) {
      setError(newErrors);
      return;
    }

    // Here you would typically handle the login logic
    console.log("Login attempt with:", { username, password });

    // Navigate to admin page after successful login
    router.push("/admin");
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
            >
              Kembali
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;