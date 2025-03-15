import React, { Suspense } from "react";
import { Metadata } from "next";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import BerandaCard from "./components/beranda_card";
import SDA from "./components/sda";
import IM from "./components/im";
import KI from "./components/ki";
import PD from "./components/pd";
import KInd from "./components/kind";

// Lazy load components
const Hero = React.lazy(() => import("./components/hero"));

export const metadata: Metadata = {
  title: "Beranda | Wirasaba",
  description: "",
};

export default function Home() {
  return (
    <div className="bg-base">
      <Navbar />
      <Hero />
      <Suspense fallback={<Navbar />}>
        <BerandaCard />
        <SDA/>
        <IM />
        <KI />
        <PD />
        <KInd />
      </Suspense>
      <Footer />
    </div>
  );
}
