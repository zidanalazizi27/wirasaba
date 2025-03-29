"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "@mui/icons-material";
import { usePathname } from "next/navigation";

type BreadcrumbItem = {
  label: string;
  href?: string;
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

  // Jika tidak ada item yang diberikan, buat breadcrumb otomatis dari pathname
  const breadcrumbItems =
    items.length > 0
      ? items
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
