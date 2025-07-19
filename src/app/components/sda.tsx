"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";

export default function SDA() {
  const [isVisible, setIsVisible] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Panggil sekali untuk set nilai awal
    handleScroll();

    // Pasang event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener saat komponen unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Efek terpisah untuk mengontrol animasi berdasarkan state isVisible
  useEffect(() => {
    if (isVisible) {
      controls.start({ opacity: 1, y: 0 });
    } else {
      controls.start({ opacity: 0, y: 50 });
    }
  }, [isVisible, controls]);

  return (
    <div className="flex flex-col items-center mx-[5%] font-roboto mt-20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Title */}
        <h1 className="text-2xl font-bold text-cdark text-center mt-10 mb-6">
          Kabupaten Sidoarjo
        </h1>

        {/* Container untuk Konten */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Gambar Peta (Responsif) */}
          <div className="w-full md:w-2/5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={controls}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <Image
                className="hover:cursor-pointer"
                src="/image/wil_sda.svg"
                alt="Peta Kabupaten Sidoarjo"
                width={400}
                height={400}
              />
            </motion.div>
          </div>

          {/* Deskripsi Kabupaten Sidoarjo (Responsif) */}
          <div className="w-full md:w-3/5 text-cdark text-sm leading-relaxed text-justify font-semibold">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={controls}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <p className="indent-8">
                Kabupaten Sidoarjo terletak di antara 7,3°–7,5° LS dan
                112,5°–112,9° BT, berbatasan dengan Kota Surabaya dan Kabupaten
                Gresik di utara, Kabupaten Pasuruan di selatan, Selat Madura di
                timur, serta Kabupaten Mojokerto di barat. Dengan luas 719,34
                km², Kabupaten Sidoarjo terdiri dari 18 kecamatan, 322 desa, dan
                31 kelurahan. Pada akhir 2023, jumlah penduduk tercatat sebanyak
                1.996.825 jiwa. Sebagai daerah penyangga Ibu Kota Provinsi Jawa
                Timur, Kabupaten Sidoarjo mengalami perkembangan yang pesat pada
                sektor industri. Kabupaten Sidoarjo memiliki 1.203 industri
                besar dan sedang, mencakup 18,59% dari total industri di Jawa
                Timur. Sektor industri pengolahan menjadi pilar utama
                perekonomian daerah dengan kontribusi sebesar 48,61%.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
