"use client";

import React, { useEffect, useState } from "react";
import Typed from "typed.js";
import Image from "next/image";

const HeroSection = () => {
  const el = React.useRef<HTMLSpanElement>(null);
  const [backgroundPositionY, setBackgroundPositionY] = useState(0);

  useEffect(() => {
    if (!el.current) return;

    const typed = new Typed(el.current, {
      strings: [
        '<span class="text-transparent bg-clip-text bg-gradient-to-r from-base to-white">Katalog Penghubung Riwayat Industri Pengolahan</span>',
      ],
      typeSpeed: 80,
      backSpeed: 50,
      loop: false,
      backDelay: 1000,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setBackgroundPositionY(scrollPosition * 0.5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      className="hero relative bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('/image/bg_beranda.png')",
        backgroundPositionY,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        minHeight: "100vh",
        width: "100%",
      }}
      id="hero"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      {/* Content container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <div className="mb-4 transform transition-all duration-500 hover:scale-105 animate-pulse">
          <Image
            src="/image/logo_wirasaba_vector.png"
            alt="Wirasaba Logo"
            width={120}
            height={120}
            className="mx-auto"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold text-white">
          <span ref={el} className="inline-block" />
        </h1>
      </div>
    </section>
  );
};

export default HeroSection;
