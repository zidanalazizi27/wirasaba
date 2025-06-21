"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import Image from "next/image";

// KBLI Data Structure
interface KBLIStats {
  struktur: number;
  kategori: number;
  golonganPokok: number;
  golongan: number;
  subGolongan: number;
  kelompok: number;
}

interface KBLICategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const kbliStats: KBLIStats = {
  struktur: 21,
  kategori: 21,
  golonganPokok: 88,
  golongan: 240,
  subGolongan: 520,
  kelompok: 1587,
};

const kbliCategories: KBLICategory[] = [
  {
    id: "A",
    name: "Pertanian, Kehutanan dan Perikanan",
    icon: "/icons/agriculture.svg",
    description:
      "Mencakup semua kegiatan ekonomi/lapangan usaha yang berkaitan dengan pertanian, kehutanan, dan perikanan.",
  },
  {
    id: "B",
    name: "Pertambangan dan Penggalian",
    icon: "/icons/mining.svg",
    description:
      "Mencakup kegiatan ekonomi/lapangan usaha pengambilan mineral dalam bentuk alami.",
  },
  {
    id: "C",
    name: "Industri Pengolahan",
    icon: "/icons/industry.svg",
    description:
      "Mencakup kegiatan ekonomi/lapangan usaha pengolahan bahan baku menjadi barang jadi atau setengah jadi.",
  },
  {
    id: "D",
    name: "Pengadaan Listrik, Gas, Uap/Air Panas dan Udara Dingin",
    icon: "/icons/electricity.svg",
    description:
      "Mencakup kegiatan ekonomi/lapangan usaha pengadaan tenaga listrik, gas alam, uap panas, air panas dan sejenisnya.",
  },
  {
    id: "E",
    name: "Pengelolaan Air, Air Limbah, Daur Ulang",
    icon: "/icons/water.svg",
    description:
      "Mencakup kegiatan ekonomi/lapangan usaha yang berhubungan dengan pengelolaan air, air limbah, dan sampah/daur ulang.",
  },
  {
    id: "F",
    name: "Konstruksi",
    icon: "/icons/construction.svg",
    description:
      "Mencakup kegiatan ekonomi/lapangan usaha di bidang konstruksi umum dan konstruksi khusus pekerjaan bangunan gedung dan bangunan sipil.",
  },
];

interface AccordionItemProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  content,
  isOpen,
  onClick,
}) => {
  return (
    <div className="border-b border-gray-200">
      <button
        className="flex justify-between items-center w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={onClick}
      >
        <span className="font-medium">{title}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          <p>{content}</p>
        </div>
      )}
    </div>
  );
};

const KBLISection: React.FC = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4 text-amber-800">
          Klasifikasi Baku Lapangan Usaha Indonesia
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Klasifikasi Baku Lapangan Usaha Indonesia (KBLI) adalah standar
          klasifikasi yang digunakan untuk mengklasifikasikan aktivitas ekonomi
          di Indonesia. KBLI digunakan untuk pemberian izin usaha, pendataan
          statistik, dan keseragaman administrasi.
        </p>
      </div>

      {/* Search */}
      <div className="mb-10">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Cari kode KBLI atau deskripsi usaha..."
            className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-3 top-3 text-gray-400">
            <Search size={20} />
          </div>
        </div>
      </div>

      {/* Struktur KBLI */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-10 hover:shadow-lg transition-all duration-300">
        <h2 className="text-xl font-bold mb-6 text-amber-800">Struktur KBLI</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(kbliStats).map(([key, value], index) => (
            <div
              key={key}
              className={`text-white p-4 rounded-lg text-center transform transition-all duration-300 hover:scale-105 ${`bg-amber-${800 - index * 100}`}`}
            >
              <h3 className="text-2xl font-bold">{value}</h3>
              <p className="text-sm capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Apa Itu KBLI */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-10 hover:shadow-lg transition-all duration-300">
        <h2 className="text-xl font-bold mb-4 text-amber-800">Apa Itu KBLI?</h2>
        <div className="space-y-4">
          <AccordionItem
            title="Pengertian"
            content="KBLI merupakan singkatan dari Klasifikasi Baku Lapangan Usaha Indonesia, yaitu standar pengelompokan kegiatan ekonomi Indonesia yang disusun untuk menyediakan satu set kerangka klasifikasi aktivitas ekonomi yang komprehensif di Indonesia."
            isOpen={openAccordion === "pengertian"}
            onClick={() => toggleAccordion("pengertian")}
          />
          <AccordionItem
            title="Fungsi"
            content="KBLI digunakan untuk perencanaan, pengamatan, dan analisis statistik dalam bidang ekonomi, pemberian izin usaha dan persyaratan administratif lainnya, serta referensi dalam dokumen legal."
            isOpen={openAccordion === "fungsi"}
            onClick={() => toggleAccordion("fungsi")}
          />
          <AccordionItem
            title="Sejarah"
            content="KBLI pertama kali diterbitkan pada tahun 1997 dan telah mengalami beberapa kali revisi untuk menyesuaikan dengan perkembangan ekonomi dan standar internasional (ISIC). Versi terbaru adalah KBLI 2020."
            isOpen={openAccordion === "sejarah"}
            onClick={() => toggleAccordion("sejarah")}
          />
          <AccordionItem
            title="Manfaat"
            content="Dengan adanya KBLI, pelaku usaha dapat menentukan bidang usaha secara tepat untuk keperluan perizinan, lembaga pemerintah dapat mengklasifikasikan usaha secara konsisten, dan memudahkan pendataan statistik ekonomi nasional."
            isOpen={openAccordion === "manfaat"}
            onClick={() => toggleAccordion("manfaat")}
          />
        </div>
      </div>

      {/* List Kategori */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300">
        <h2 className="text-xl font-bold mb-6 text-amber-800">List Kategori</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {kbliCategories.map((category, index) => (
            <button
              key={category.id}
              className={`p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
                activeCategory === index
                  ? "bg-amber-700 text-white transform scale-105 shadow-md"
                  : "bg-gray-100 hover:bg-amber-100"
              }`}
              onClick={() => setActiveCategory(index)}
            >
              <div className="w-10 h-10 mb-2 flex items-center justify-center">
                <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full">
                  <span className="font-bold text-amber-800">
                    {category.id}
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium">{category.id}</span>
            </button>
          ))}
        </div>

        {/* Active Category */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center text-white mr-3">
              {kbliCategories[activeCategory].id}
            </div>
            <h3 className="text-lg font-semibold">
              {kbliCategories[activeCategory].name}
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            {kbliCategories[activeCategory].description}
          </p>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <AccordionItem
              title="01 - Pertanian Tanaman, Peternakan, Perburuan"
              content="Golongan pokok ini mencakup pertanian tanaman pangan, tanaman perkebunan, dan hortikultura; pemeliharaan hewan ternak dan unggas; perburuan dan penangkapan hewan dengan perangkap serta kegiatan penunjang yang berhubungan dengan itu."
              isOpen={openAccordion === "golongan-01"}
              onClick={() => toggleAccordion("golongan-01")}
            />
            <AccordionItem
              title="02 - Kehutanan dan Penebangan Kayu"
              content="Golongan pokok ini mencakup usaha penanaman, pemeliharaan, pemungutan hasil, pengolahan dan pemasaran jenis tanaman hutan dan hasil hutan lainnya."
              isOpen={openAccordion === "golongan-02"}
              onClick={() => toggleAccordion("golongan-02")}
            />
            <AccordionItem
              title="03 - Perikanan"
              content="Golongan pokok ini mencakup penangkapan dan budidaya ikan, jenis crustacea, mollusca dan biota air lainnya di laut, air payau dan air tawar."
              isOpen={openAccordion === "golongan-03"}
              onClick={() => toggleAccordion("golongan-03")}
            />
          </div>
        </div>
      </div>

      {/* Pencarian Klasifikasi */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-10 hover:shadow-lg transition-all duration-300">
        <h2 className="text-xl font-bold mb-6 text-amber-800">
          Pencarian Klasifikasi
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="kategori"
            >
              Kategori
            </label>
            <select
              id="kategori"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Pilih Kategori</option>
              {kbliCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.id} - {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-1/3">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="golonganPokok"
            >
              Golongan Pokok
            </label>
            <select
              id="golonganPokok"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled
            >
              <option value="">Pilih Golongan Pokok</option>
            </select>
          </div>
          <div className="w-full md:w-1/3">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="golongan"
            >
              Golongan
            </label>
            <select
              id="golongan"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled
            >
              <option value="">Pilih Golongan</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KBLISection;
