"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "@mui/icons-material";
import { usePathname } from "next/navigation";

type BreadcrumbItem = {
  label: string;
  link?: string; // Ubah href menjadi link untuk konsistensi dengan pemanggilan
  href?: string; // Pertahankan href untuk kompatibilitas
};

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  homeLabel?: string;
  homeHref?: string;
}

export default function Breadcrumb({
  items = [],
  homeLabel = "Admin",
  homeHref = "/admin",
}: BreadcrumbProps) {
  const pathname = usePathname();

  // Normalisasi items untuk mendukung baik link maupun href
  const normalizedItems = items.map((item) => ({
    label: item.label,
    href: item.link || item.href, // Gunakan link jika ada, otherwise gunakan href
  }));

  // Jika tidak ada item yang diberikan, buat breadcrumb otomatis dari pathname
  const breadcrumbItems =
    normalizedItems.length > 0
      ? normalizedItems
      : pathname
          .split("/")
          .filter((path) => path !== "")
          .map((path, index, array) => {
            // Buat href untuk setiap level
            const href = "/" + array.slice(0, index + 1).join("/");
            // Capitalize dan replace dash dengan spasi
            const label =
              path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

            return { label, href: index < array.length - 1 ? href : undefined };
          });

  return (
    <nav className="flex mb-5" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href={homeHref}
            className="text-sm font-medium text-cdark hover:text-blue-600"
          >
            {homeLabel}
          </Link>
        </li>

        {breadcrumbItems.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-cdark mx-1" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-cdark hover:text-blue-600"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-cdark">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
