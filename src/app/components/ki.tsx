"use client";

import { useEffect, useState } from "react";
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
    titleTextColor: "text-white",
  },
  {
    title: "Kecil",
    workforce: "5-19",
    investment: "1M-5M",
    revenue: "2M-15M",
    topBgColor: "bg-[#AF8F6F]",
    bottomBgColor: "bg-[#74512D]",
    textColor: "text-black",
    titleTextColor: "text-white",
  },
  {
    title: "Sedang",
    workforce: "20-99",
    investment: "5M-10M",
    revenue: "15M-50M",
    topBgColor: "bg-[#AF8F6F]",
    bottomBgColor: "bg-[#1A120B]",
    textColor: "text-cdark",
    titleTextColor: "text-white",
  },
  {
    title: "Besar",
    workforce: ">99",
    investment: ">10M",
    revenue: ">50M",
    topBgColor: "bg-[#AF8F6F]",
    bottomBgColor: "bg-[#1A120B]",
    textColor: "text-cdark",
    titleTextColor: "text-white",
  },
];

export default function KI() {
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

  return (
    <div
      className={`mx-[5%] font-roboto pb-10 transition-all duration-800 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <h1 className="text-2xl font-bold text-cdark text-center mt-10 mb-6">
        Klasifikasi Industri
      </h1>

      <div
        className={`w-full text-cdark text-sm transition-all duration-1000 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="flex flex-wrap justify-center gap-4 my-6 font-medium">
          {classifications.map((item, index) => (
            <div
              key={index}
              className="rounded-lg w-[170px] shadow-md overflow-hidden hover:-translate-y-1 transition-transform duration-300"
            >
              <div
                className={`${item.topBgColor} ${item.textColor} p-3 flex flex-col gap-1 font-semibold text-xs`}
              >
                <div className="flex items-center gap-3 text-sm">
                  <Image
                    src="/image/ic_1.svg"
                    alt="Tenaga Kerja"
                    width={16}
                    height={16}
                  />
                  <span>Pekerja {item.workforce}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Image
                    src="/image/ic_2.svg"
                    alt="Investasi"
                    width={16}
                    height={16}
                  />
                  <span>Investasi {item.investment}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Image
                    src="/image/ic_3.svg"
                    alt="Omset"
                    width={16}
                    height={16}
                  />
                  <span>Omset {item.revenue}</span>
                </div>
              </div>
              <div
                className={`${item.bottomBgColor} w-full text-center py-2 font-bold ${item.titleTextColor}`}
              >
                {item.title}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 indent-8 text-cdark text-sm leading-relaxed text-justify font-semibold">
          Penentuan skala usaha industri besar dan sedang didasarkan pada
          sejumlah kriteria. Industri skala sedang merupakan perusahaan
          manufaktur yang memenuhi salah satu dari kriteria berikut: jumlah
          tenaga kerja antara 20-99 orang, nilai investasi tetap sejak awal
          pendirian hingga akhir tahun tersebut 5 miliar rupiah hingga 10 miliar
          rupiah, atau omset pada tahun tersebut 15 miliar rupiah hingga 50
          miliar rupiah. Sementara itu, industri skala besar merupakan
          perusahaan manufaktur yang memiliki lebih dari 99 orang, nilai
          investasi tetap sejak awal pendirian hingga akhir tahun tersebut
          melebihi 10 miliar rupiah, atau omset pada tahun tersebut lebih dari
          50 miliar rupiah. Sebagai tambahan perusahaan yang telah tercatat
          dalam Direktori IBS namun memiliki jumlah tenaga kerja kurang dari 20
          orang atau nilai akumulasi investasi/modal tetap sejak pendirian
          pabrik hingga akhir tahun tersebut kurang dari 5 miliar rupiah atau
          omset perusahaan tahun tersebut kurang dari 15 miliar rupiah
          dikelompokkan menjadi perusahaan skala menengah (sedang).
        </p>
      </div>
    </div>
  );
}