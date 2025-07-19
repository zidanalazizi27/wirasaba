"use client";

import { useEffect, useState } from "react";

export default function IM() {
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
  }, []); // Tidak ada dependencies disini

  return (
    <div
      className={`mx-[5%] font-roboto pb-10 transition-all duration-800 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <h1 className="text-2xl font-bold text-cdark text-center mt-10 mb-6">
        Industri Manufaktur
      </h1>
      <div
        className={`w-full text-cdark text-sm leading-relaxed text-justify font-semibold transition-all duration-1000 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <p className="indent-8">
          Merupakan suatu kegiatan ekonomi yang melakukan mengubah suatu barang
          dasar secara mekanis, kimia, atau dengan tangan sehingga menjadi
          barang jadi/setengah jadi, dan atau barang yang kurang nilainya
          menjadi barang yang lebih tinggi nilainya dan sifatnya lebih dekat
          kepada pemakai akhir. Termasuk dalam kegiatan ini adalah jasa
          industri/maklun dan pekerjaan perakitan (assembling). Perusahaan atau
          usaha industri adalah suatu unit (kesatuan) usaha yang melakukan
          kegiatan ekonomi, bertujuan menghasilkan barang atau jasa, terletak
          pada suatu bangunan atau lokasi tertentu, dan mempunyai catatan
          administrasi tersendiri mengenai produksi dan struktur biaya serta ada
          seorang atau lebih yang bertanggung jawab atas usaha tersebut.
          Industri manufaktur memiliki sebutan lain yaitu industri pengolahan
          (KBLI Kategori C).
        </p>
      </div>
    </div>
  );
}