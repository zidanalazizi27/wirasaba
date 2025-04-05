"use client";

import React from "react";
import Sidebar, { SidebarItem } from "./sidebar_adm";
import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import ImportContactsRoundedIcon from "@mui/icons-material/ImportContactsRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { AnimatePresence, motion } from "framer-motion";

function SidebarLayout({ children }) {
  const [toast, setToast] = React.useState(false);

  const handleLogout = () => {
    // Clear specific items from local storage if needed
    // localStorage.removeItem('loginSuccess');
    // localStorage.removeItem('email');

    // Redirect to the home page
    window.location.href = "/";
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
      icon: <ImportContactsRoundedIcon />,
      text: "Buku Panduan",
      to: "/admin/panduan",
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
      to: "/",
      submenu: [],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-bold font-roboto">
      {/* Sidebar Section */}
      <div className="fixed w-1/6 h-full z-40 bg-white">
        <Sidebar>
          {sidebarItems.map((item, key) => (
            <SidebarItem
              key={key}
              text={item.text}
              icon={item.icon}
              to={item.to}
              submenu={item.submenu}
            />
          ))}
        </Sidebar>
      </div>

      <div className="flex-1 ml-[16.6667%] w-5/6 overflow-auto">{children}</div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-5 right-5"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SidebarLayout;
