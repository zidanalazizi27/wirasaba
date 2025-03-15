"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function PD() {
  const controls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      controls.start(
        window.scrollY > 100 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
      );
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  const covers = [
    {
      src: "/image/cover_1.png",
      alt: "Cover 1",
      link: "https://sidoarjokab.bps.go.id/id/publication/2023/12/29/7576c3c563a6e35bbd237ce0/direktori-perusahaan-industri-besar-sedang-kabupaten-sidoarjo-2022",
    },
    {
      src: "/image/cover_2.png",
      alt: "Cover 2",
      link: "https://sidoarjokab.bps.go.id/id/publication/2024/12/13/574e52526a9fd969157e2a43/direktori-perusahaan-industri-besar-sedang-kabupaten-sidoarjo-2023",
    },
    {
      src: "/image/cover_3.png",
      alt: "Cover 3",
      link: "https://sidoarjokab.bps.go.id/id/publication/2025/03/14/c947392c003915f1c03cc55f/direktori-industri-besar-dan-sedang-kab--sidoarjo-2025",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mx-[5%] font-roboto pb-10"
    >
      <h1 className="text-2xl font-bold text-cdark text-center mt-10 mb-6">
        Publikasi Direktori
      </h1>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        transition={{ duration: 1, delay: 0.4 }}
        className="w-full text-cdark text-sm text-justify font-medium"
      >
        <p className="indent-8">
          Merupakan publikasi tahunan yang berisi daftar nama, alamat, produk
          utama, dan nomor telepon seluruh perusahaan industri besar dan sedang
          yang masih aktif. Direktori ini dikelompokkan ke dalam 24 kategori
          sesuai dengan KBLI 2020. BPS Kabupaten Sidoarjo secara rutin
          memperbarui direktori IBS secara sistematis untuk menyesuaikan dengan
          perubahan jumlah perusahaan yang baru, pindah, atau tutup.
          Pemutakhiran dilakukan dengan mencocokkan data perusahaan dari
          instansi terkait, seperti Dinas Perindustrian, BKPMD, dan Dinas
          Perizinan, dengan direktori terbaru BPS. Direktori ini dapat pengguna
          akses melaui file dan menu pada peta tematik.
        </p>

        {/* Card Sampul Buku */}
        <div className="flex justify-center gap-10 mt-6">
          {covers.map((cover, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="shadow-lg rounded-lg overflow-hidden"
            >
              <Link href={cover.link} target="_blank" rel="noopener noreferrer">
                <Image
                  src={cover.src}
                  alt={cover.alt}
                  width={140}
                  height={210}
                  className="rounded-lg cursor-pointer"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
