"use client";

import React from "react";

export default function AuthLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-80">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clightbrown mx-auto mb-4"></div>
        <p className="text-clightbrown font-medium">
          Memeriksa status login...
        </p>
      </div>
    </div>
  );
}
