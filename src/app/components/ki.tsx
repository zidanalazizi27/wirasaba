"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";

const classifications = [
  {
    title: "Mikro",
    workforce: "1-4",
    investment: "<1M",
    revenue: "<2M",
    topBgColor: "bg-[#AF8F6F]",
    bottomBgColor: "bg-[#74512D]",
    textColor: "text-cdark",
  },
  {
    title: "Kecil",
    workforce: "5-19",
    investment: "1M-5M",
    revenue: "2M-15M",
    topBgColor: "bg-[#AF8F6F]",
    bottomBgColor: "bg-[#74512D]",
    textColor: "text-black",
  },
  {
    title: "Sedang",
    workforce: "20-99",
    investment: "5M-10M",
    revenue: "15M-50M",
    topBgColor: "bg-[#AF8F6F]",
    bottomBgColor: "bg-[#1A120B]",
    textColor: "text-cdark",
  },
  {
    title: "Besar",
    workforce: ">99",
    investment: ">10M",
    revenue: ">50M",
    topBgColor: "bg-[#AF8F6F]",
    bottomBgColor: "bg-[#1A120B]",
    textColor: "text-cdark",
  },
];

export default function KI() {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mx-[5%] font-roboto pb-10"
    >
      <h1 className="text-2xl font-bold text-black text-center mt-10 mb-6">
        Klasifikasi Industri
      </h1>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        transition={{ duration: 1, delay: 0.4 }}
        className="w-full text-black text-sm"
      >
        <div className="flex flex-wrap justify-center gap-4 my-6 font-medium">
          {classifications.map((item, index) => (
            <motion.div
              key={index}
              className="rounded-lg w-[170px] shadow-md overflow-hidden"
              whileHover={{ translateY: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`${item.topBgColor} ${item.textColor} p-3 flex flex-col gap-1`}>
                <div className="flex items-center gap-1 text-sm">
                  <Image src="/image/ic_1.svg" alt="Tenaga Kerja" width={16} height={16} />
                  <span>Tenaga Kerja {item.workforce}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Image src="/image/ic_2.svg" alt="Investasi" width={16} height={16} />
                  <span>Investasi {item.investment}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Image src="/image/ic_3.svg" alt="Omset" width={16} height={16} />
                  <span>Omset {item.revenue}</span>
                </div>
              </div>
              <div className={`${item.bottomBgColor} w-full text-center py-2 font-bold ${item.titleTextColor || 'text-white'}`}>
                {item.title}
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-justify mt-4 indent-8 font-medium">
          Industri skala sedang mencakup manufaktur dengan tenaga kerja ≤99 orang, investasi 5–10
          miliar rupiah, atau omset 15–50 miliar rupiah. Industri skala besar memiliki >99 pekerja,
          investasi >10 miliar rupiah, atau omset >50 miliar rupiah. Untuk industri penggilingan
          padi, skala sedang berkapasitas 1,5–3 ton/jam, sementara skala besar melebihi 3 ton/jam.
        </p>
      </motion.div>
    </motion.div>
  );
}