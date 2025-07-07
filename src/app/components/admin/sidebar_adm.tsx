"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  // ChevronLeft,
  // ChevronRight,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";

const Sidebar = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const [isScreenWide, setIsScreenWide] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsScreenWide(window.innerWidth >= 1280);
      setIsSidebarOpen(window.innerWidth >= 1280);
    };

    // Set initial values
    checkScreenWidth();

    // Add event listener
    window.addEventListener("resize", checkScreenWidth);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative">
      <aside
        className={`h-screen z-40 fixed top-0 left-0 p-4 ${
          isSidebarOpen ? "w-60" : "w-24"
        } transition-all duration-300`}
      >
        <nav className="flex flex-col bg-clightbrown border-r rounded-2xl shadow-sm transition-all duration-300 h-full">
          <div className="p-4 flex justify-center">
            <Link href="/">
              <img
                src="/image/logo_wirasaba_vector_dark.png"
                className={`overflow-hidden transition-all duration-300 ${
                  isSidebarOpen ? "w-20" : "w-0"
                }`}
                alt="Logo"
              />
            </Link>
            <button
              onClick={toggleSidebar}
              className={`p-1 pl-2 rounded-lg bg-clightbrown hover:bg-clightbrown ${
                isScreenWide ? "md:hidden" : ""
              }`}
            >
              {isSidebarOpen ? (
                <FaCircleChevronLeft className="text-cdark text-2xl" />
              ) : (
                <FaCircleChevronRight className="text-cdark text-2xl" />
              )}
            </button>
          </div>

          <ul className="flex-1 px-2">
            {React.Children.map(children, (child) =>
              React.cloneElement(child, {
                isSidebarOpen,
                pathname,
                setIsSidebarOpen,
              })
            )}
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export function SidebarItem({
  icon,
  text,
  alert,
  to,
  action, // Add action prop for items like logout
  submenu,
  isSidebarOpen,
  pathname,
  setIsSidebarOpen,
}) {
  const router = useRouter();
  const isActive =
    pathname === to ||
    (pathname?.startsWith(to) && to !== "/") ||
    (submenu &&
      submenu.some(
        (subItem) =>
          subItem.to === pathname ||
          (subItem.to !== "/" && pathname?.startsWith(subItem.to))
      ));
  const hasSubmenu = submenu && submenu.length > 0;
  const [submenuOpen, setSubmenuOpen] = useState(false);

  useEffect(() => {
    if (isActive && hasSubmenu) {
      setSubmenuOpen(true);
    }
  }, [isActive, hasSubmenu]);

  const handleSubmenuToggle = (e) => {
    e.stopPropagation();
    setSubmenuOpen(!submenuOpen);
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
    }
  };

  const handleNavigation = (e) => {
    if (hasSubmenu) {
      e.preventDefault();
      handleSubmenuToggle(e);
    } else if (action) {
      // If there's an action prop (like logout), execute it
      e.preventDefault();
      action();
    } else if (to) {
      router.push(to);
    }
  };

  return (
    <>
      <div onClick={handleNavigation}>
        <li
          className={`
            relative flex items-center py-2 px-3 my-2
            font-medium rounded-md cursor-pointer
            transition-colors group
            ${isActive ? "bg-white text-cdark" : "text-cdark"}
            ${isSidebarOpen ? "ml-3" : "ml-0"}
          `}
        >
          {React.cloneElement(icon, {
            className: isActive ? "text-cdark" : "text-cdark",
          })}
          <span
            className={`overflow-hidden transition-all duration-300 ${
              isSidebarOpen ? "ml-3" : "w-0 opacity-0"
            }`}
          >
            {text}
          </span>
          {hasSubmenu && isSidebarOpen && (
            <button
              className="ml-auto focus:outline-none"
              onClick={handleSubmenuToggle}
            >
              {submenuOpen ? (
                <ExpandLess
                  className={isActive ? "text-cdark" : "text-cdark"}
                />
              ) : (
                <ExpandMore
                  className={isActive ? "text-cdark" : "text-cdark"}
                />
              )}
            </button>
          )}
          {alert && (
            <div
              className={`absolute right-2 w-2 h-2 rounded bg-white ${
                isSidebarOpen ? "" : "top-2"
              }`}
            />
          )}
        </li>

        {hasSubmenu && submenuOpen && isSidebarOpen && (
          <ul className="ml-5">
            {submenu.map((subItem, index) => (
              <Link key={index} href={subItem.to}>
                <li
                  className={`
                    relative flex items-center py-2 px-3 my-1
                    font-medium rounded-md cursor-pointer
                    transition-colors group
                    ${
                      pathname === subItem.to
                        ? "bg-white text-cdark"
                        : "text-cdark"
                    }
                  `}
                >
                  <span className="ml-6">
                    {React.cloneElement(subItem.icon, {
                      className:
                        pathname === subItem.to ? "text-cdark" : "text-cdark",
                    })}
                  </span>
                  <span className="ml-3">{subItem.text}</span>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default Sidebar;
