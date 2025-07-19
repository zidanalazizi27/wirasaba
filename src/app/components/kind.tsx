"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function KawasanIndustri() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Panggil sekali untuk set nilai awal setelah komponen terpasang
    handleScroll();

    // Pasang event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener saat komponen unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Data Kawasan Industri
  const kawasanList = [
    {
      src: "/image/kws_1.png",
      alt: "Central Industrial Park",
      title: "Central Industrial Park",
      size: "52,00 Ha",
      link: "/peta_tematik?lat=-7.4443415&lng=112.7499363",
    },
    {
      src: "/image/kws_2.png",
      alt: "Kawasan Industri Safe N Lock",
      title: "Kawasan Safe N Lock",
      size: "147,25 Ha",
      link: "/peta_tematik?lat=-7.4619433&lng=112.7471288",
    },
    {
      src: "/image/kws_3.png",
      alt: "Kawasan Industri Sidoarjo",
      title: "Kawasan Industri Sidoarjo",
      size: "88,64 Ha",
      link: "/peta_tematik?lat=-7.5453303&lng=112.7752512",
    },
    {
      src: "/image/kws_4.png",
      alt: "Kawasan Industri SIRIE",
      title: "Kawasan Industri SIRIE",
      size: "105,00 Ha",
      link: "/peta_tematik?lat=-7.4606707&lng=112.741371",
    },
    {
      src: "/image/kws_5.png",
      alt: "Sidoarjo Industrial Estate Berbek",
      title: "Kawasan SIER Berbek",
      size: "87,00 Ha",
      link: "/peta_tematik?lat=-7.3391755&lng=112.7552335",
    },
  ];

  return (
    <div
      className={`mx-[5%] font-roboto pb-10 transition-all duration-800 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {/* Judul */}
      <h1 className="text-2xl font-bold text-cdark text-center mt-10 mb-6">
        Kawasan Industri Terkait
      </h1>

      {/* Deskripsi */}
      <div
        className={`w-full text-cdark text-sm leading-relaxed text-justify font-semibold transition-all duration-1000 delay-400 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <p className="indent-8">
          Kawasan industri adalah area khusus yang dirancang untuk memusatkan
          kegiatan industri dengan dukungan berbagai sarana dan prasarana
          penunjang. Pengelolaan dan pengembangannya dilakukan oleh perusahaan
          kawasan industri guna menciptakan lingkungan yang kondusif bagi
          pertumbuhan sektor manufaktur. Selain berada dalam kawasan industri,
          beberapa perusahaan pengolahan juga tersebar di berbagai kompleks
          pergudangan, yang berfungsi sebagai pusat distribusi dan penyimpanan
          bahan baku maupun produk jadi. Keberadaan kawasan ini berperan penting
          dalam meningkatkan efisiensi operasional serta mendukung perkembangan
          industri secara berkelanjutan.
        </p>

        {/* Kartu Kawasan Industri */}
        <div className="flex flex-wrap justify-center gap-8 mt-6">
          {kawasanList.map((kawasan, index) => (
            <div
              key={index}
              className="relative w-[180px] h-[250px] shadow-lg rounded-xl overflow-hidden bg-[#74512D] text-sm hover:scale-105 transition-transform duration-300"
            >
              <Link href={kawasan.link}>
                {/* Gambar dengan Overlay Gradasi */}
                <div className="relative w-full h-[80%]">
                  <Image
                    src={kawasan.src}
                    alt={kawasan.alt}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-xl"
                  />
                  {/* Efek Gradasi di Bagian Bawah */}
                  <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#74512D] to-transparent"></div>
                </div>

                {/* Label */}
                <div className="w-full bg-[#74512D] text-white text-center py-2 rounded-b-xl">
                  <p className="text-sm font-semibold">{kawasan.title}</p>
                  <p className="text-xs font-semibold">({kawasan.size})</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
