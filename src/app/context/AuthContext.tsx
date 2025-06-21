"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { setCookie, getCookie, deleteCookie } from "@/app/utils/cookieUtils";

interface AuthContextType {
  isLoggedIn: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
  user: { id: number; username: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ id: number; username: string } | null>(
    null
  );

  // Check authentication status on mount and pathname change
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Check for auth token (in both localStorage and cookies for better coverage)
        const token =
          localStorage.getItem("wirasaba_auth_token") ||
          getCookie("wirasaba_auth_token");
        const userData = localStorage.getItem("wirasaba_user");

        if (token) {
          // User is authenticated
          setIsLoggedIn(true);
          setUser(userData ? JSON.parse(userData) : null);

          // If user is logged in but tries to access login page, redirect to admin
          if (pathname === "/login") {
            router.push("/admin");
          }
        } else {
          // User is not authenticated
          setIsLoggedIn(false);
          setUser(null);

          // If user is not logged in but tries to access admin pages, redirect to login
          if (pathname?.startsWith("/admin")) {
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Login function - terintegrasi dengan database melalui API
  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);

    try {
      // Panggil API login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Simpan token dan data user
        localStorage.setItem("wirasaba_auth_token", data.token);
        localStorage.setItem("wirasaba_user", JSON.stringify(data.user));

        // Simpan cookies (7 days expiration)
        setCookie("wirasaba_auth_token", data.token, 7);

        // Update state
        setIsLoggedIn(true);
        setUser(data.user);

        setIsLoading(false);
        return { success: true, message: "Login berhasil" };
      } else {
        setIsLoading(false);
        return {
          success: false,
          message: data.message || "Username atau password tidak valid",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return { success: false, message: "Terjadi kesalahan saat login" };
    }
  };

  // Logout function
  const logout = () => {
    // Clear auth data from both localStorage and cookies
    localStorage.removeItem("wirasaba_auth_token");
    localStorage.removeItem("wirasaba_user");
    deleteCookie("wirasaba_auth_token");

    // Update state
    setIsLoggedIn(false);
    setUser(null);

    // Redirect to home page
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, login, logout, isLoading, user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
