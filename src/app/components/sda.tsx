"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export default function SDA() {
  const [showContent, setShowContent] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowContent(true);
      } else {
        setShowContent(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (showContent) {
      controls.start({ opacity: 1, y: 0 });
    } else {
      controls.start({ opacity: 0, y: 50 });
    }
  }, [showContent, controls]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center mx-[5%] font-roboto mt-20"
    >
      {/* Title */}
      <h1 className="text-2xl font-bold text-cdark text-center mt-10 mb-6">
        Kabupaten Sidoarjo
      </h1>

      {/* Container untuk Konten */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Gambar Peta (Responsif) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full md:w-2/5 flex justify-center"
        >
          <motion.img
            className="hover:cursor-pointer"
            src="/image/wil_sda.svg"
            alt="Peta Kabupaten Sidoarjo"
            whileHover={{ translateY: -5 }}
            srcSet=""
            width={400}
          />
        </motion.div>

        {/* Deskripsi Kabupaten Sidoarjo (Responsif) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          transition={{ duration: 1, delay: 0.4 }}
          className="w-full md:w-3/5 text-cdark text-sm leading-relaxed text-justify font-medium"
        >
          <p className="indent-8">
            Kabupaten Sidoarjo terletak di antara 7,3°–7,5° LS dan 112,5°–112,9°
            BT, berbatasan dengan Kota Surabaya dan Kabupaten Gresik di utara,
            Kabupaten Pasuruan di selatan, Selat Madura di timur, serta
            Kabupaten Mojokerto di barat. Dengan luas 719,34 km², Kabupaten
            Sidoarjo terdiri dari 18 kecamatan, 322 desa, dan 31 kelurahan. Pada
            akhir 2023, jumlah penduduk tercatat sebanyak 1.996.825 jiwa.
            Sebagai daerah penyangga Ibu Kota Provinsi Jawa Timur, Kabupaten
            Sidoarjo mengalami perkembangan yang pesat pada sektor industri.
            Kabupaten Sidoarjo memiliki 1.103 industri besar dan sedang,
            mencakup 18,59% dari total industri di Jawa Timur. Sektor industri
            pengolahan menjadi pilar utama perekonomian daerah dengan kontribusi
            sebesar 48,61%.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
