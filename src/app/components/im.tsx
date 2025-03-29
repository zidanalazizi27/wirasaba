"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export default function IM() {
  const controls = useAnimation();

  useEffect(() => {
    // Buat variabel untuk menyimpan fungsi handleScroll
    const handleScroll = () => {
      // controls.start() di dalam event listener di useEffect aman digunakan
      controls.start(
        window.scrollY > 100 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
      );
    };

    // Panggil sekali untuk set nilai awal
    handleScroll();

    // Pasang event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener saat komponen unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]); // controls sebagai dependensi

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mx-[5%] font-roboto pb-10"
    >
      <h1 className="text-2xl font-bold text-cdark text-center mt-10 mb-6">
        Industri Manufaktur
      </h1>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        transition={{ duration: 1, delay: 0.4 }}
        className="w-full text-cdark text-sm text-justify font-medium"
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
      </motion.div>
    </motion.div>
  );
}
