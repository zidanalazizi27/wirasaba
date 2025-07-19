"use client";

import React, { useState } from "react";
import Sidebar, { SidebarItem } from "./sidebar_adm";
import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import ImportContactsRoundedIcon from "@mui/icons-material/ImportContactsRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

function SidebarLayout({ children }: SidebarLayoutProps) {
  const [toast, setToast] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    // Use the logout function from AuthContext
    logout();
  };

  const sidebarItems = [
    {
      icon: <FactoryRoundedIcon />,
      text: "Direktori IBS",
      to: "/admin/direktori",
      submenu: [],
    },
    {
      icon: <DescriptionRoundedIcon />,
      text: "Daftar Survei",
      to: "/admin/survei",
      submenu: [],
    },
    {
      icon: <GroupRoundedIcon />,
      text: "Daftar PCL",
      to: "/admin/pcl",
      submenu: [],
    },
    {
      icon: <HistoryRoundedIcon />,
      text: "Riwayat Survei",
      to: "/admin/riwayat_survei",
      submenu: [],
    },
    {
      icon: <ImportContactsRoundedIcon />,
      text: "Buku Panduan",
      action: () =>
        window.open(
          "https://docs.google.com/document/d/1ywDYVbq6y588HRl6jSY5w9BbwhdC9-4FOlb1JIjOdBk/edit?usp=sharing",
          "_blank"
        ),
      submenu: [],
    },
    {
      icon: <AccountCircleRoundedIcon />,
      text: "Profil",
      to: "/admin/profil",
    },
    {
      icon: <LogoutRoundedIcon />,
      text: "Keluar",
      action: handleLogout, // Use action property for logout instead of to
      submenu: [],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-bold font-roboto">
      {/* Sidebar Section */}
      <div className="fixed w-1/6 h-full z-40 bg-base">
        <Sidebar>
          {sidebarItems.map((item, key) => (
            <SidebarItem
              key={key}
              text={item.text}
              icon={item.icon}
              to={item.to}
              action={item.action} // Pass the action property to SidebarItem
              submenu={item.submenu}
            />
          ))}
        </Sidebar>
      </div>

      <div className="flex-1 ml-[16.6667%] w-5/6 overflow-auto">{children}</div>

      <AnimatePresence>
        {toast && (
          <div className="absolute bottom-5 right-5">
            <div
              id="toast-success"
              className="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow border-2 border-gray-200"
              role="alert"
            >
              <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                <span className="sr-only">Check icon</span>
              </div>
              <div className="ms-3 text-sm font-normal">Berhasil masuk</div>
              <button
                type="button"
                className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
                data-dismiss-target="#toast-success"
                aria-label="Close"
                onClick={() => setToast(false)}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SidebarLayout;
