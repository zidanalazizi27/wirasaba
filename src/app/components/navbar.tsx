"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IoLogIn, IoLogOut } from "react-icons/io5";
import { useAuth } from "@/app/context/AuthContext";

// Icon Components remain the same, just moved them to a separate file for cleaner organization
// Import them from a separate file like: import { ChevronDown, Lock, Activity, etc } from "@/components/icons"

const Navbar = () => {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState(pathname);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, logout, user } = useAuth();

  useEffect(() => {
    // Update active menu based on current path
    if (pathname === "/") setActiveMenu("Beranda");
    else if (pathname === "/peta_tematik") setActiveMenu("PTematik");
    else if (pathname === "/kbli") setActiveMenu("KBLI");
    else if (pathname === "/tentang") setActiveMenu("Tentang");
    else if (pathname?.startsWith("/admin")) setActiveMenu("Admin");
  }, [pathname]);

  const getMenuClasses = (menu: string) => {
    return activeMenu === menu
      ? "font-bold font-roboto text-sm text-clightbrown bg-white py-2 px-4 rounded-full transition-colors duration-100"
      : "font-bold font-roboto text-sm text-white transition-colors duration-100";
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 w-full bg-clightbrown z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/image/logo_wirasaba.png"
                alt="Wirasaba"
                width={140}
                height={80}
                priority
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Menu icon */}
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <Link href="/" className={getMenuClasses("Beranda")}>
              Beranda
            </Link>
            <Link href="/peta_tematik" className={getMenuClasses("PTematik")}>
              Peta Tematik
            </Link>
            <Link href="/kbli" className={getMenuClasses("KBLI")}>
              KBLI
            </Link>
            <Link href="/tentang" className={getMenuClasses("Tentang")}>
              Tentang
            </Link>
            {isLoggedIn && (
              <Link href="/admin/direktori" className={getMenuClasses("Admin")}>
                Admin
              </Link>
            )}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="font-bold font-roboto text-sm text-white hover:text-clightbrown hover:bg-white py-2 px-4 rounded-full transition-colors duration-100 flex items-center gap-1"
              >
                <span>Logout</span>
                <IoLogOut size={18} />
              </button>
            ) : (
              <Link
                href="/login"
                className="font-bold font-roboto text-sm text-white hover:text-clightbrown hover:bg-white py-2 px-4 rounded-full transition-colors duration-100 flex items-center gap-1"
              >
                <span>Login</span>
                <IoLogIn size={18} />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block ${getMenuClasses("Beranda")}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Beranda
            </Link>
            <Link
              href="/peta_tematik"
              className={`block ${getMenuClasses("PTematik")}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Peta Tematik
            </Link>
            <Link
              href="/kbli"
              className={`block ${getMenuClasses("KBLI")}`}
              onClick={() => setIsMenuOpen(false)}
            >
              KBLI
            </Link>
            <Link
              href="/tentang"
              className={`block ${getMenuClasses("Tentang")}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Tentang
            </Link>
            {isLoggedIn && (
              <Link
                href="/admin"
                className={`block ${getMenuClasses("Admin")}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left font-bold font-roboto text-sm text-white hover:text-clightbrown hover:bg-white py-2 px-4 rounded-full transition-colors duration-100 flex items-center gap-1"
              >
                <span>Logout</span>
                <IoLogOut size={18} />
              </button>
            ) : (
              <Link
                href="/login"
                className="font-bold font-roboto text-sm text-white hover:text-clightbrown hover:bg-white py-2 px-4 rounded-full transition-colors duration-100 flex items-center gap-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Login</span>
                <IoLogIn size={18} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;