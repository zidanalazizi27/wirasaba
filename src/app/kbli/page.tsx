import React, { Suspense } from "react";
import { Metadata } from "next";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Kblisection from "../components/kbli_section";

// Lazy load components
const Hero = React.lazy(() => import("../components/hero"));

export const metadata: Metadata = {
  title: "KBLI | Wirasaba",
  description: "Klasifikasi Baku Lapangan Usaha Indonesia",
};

export default function KBLI() {
  return (
    <div className="bg-base">
      <Navbar />
      <Hero />
      <Suspense fallback={<Navbar />}>
        <Kblisection />
      </Suspense>
      <Footer />
    </div>
  );
}
