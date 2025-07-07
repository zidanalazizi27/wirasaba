"use client";

import React from "react";
import { Metadata } from "next";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// Interface untuk tipe data survei
interface SurveiType {
  id: string;
  title: string;
  description: string;
  isExpanded: boolean;
}

const TentangPage: React.FC = () => {
  // State untuk mengelola accordion
  const [surveiList, setSurveiList] = React.useState<SurveiType[]>([
    {
      id: "sku",
      title: "Survei Karakteristik Usaha (SKU)",
      description:
        "survei tahunan sejak tahun 2019 yang mencakup perusahaan atau usaha dari berbagai skala, mulai dari kecil hingga besar, yang terdaftar dalam Statistical Business Register (SBR), kecuali untuk kategori A, O, T, dan U. Survei ini mencakup 17 kategori atau lapangan usaha dan menggunakan metode systematic sampling dalam pemilihan sampelnya. Informasi yang disajikan mencakup data umum perusahaan, indikator terkait penggunaan dan pemanfaatan teknologi informasi dan komunikasi (TIK), serta indikator utama yang berkaitan dengan kegiatan inovasi dan ketenagakerjaan.",
      isExpanded: false,
    },
    {
      id: "shp",
      title: "Survei Harga Produsen (SHP)",
      description:
        "Survei ini dilakukan setiap bulan untuk mengumpulkan data harga produsen untuk perhitungan Indeks Harga Produsen (IHP), yang berfungsi sebagai deflator PDB dan indikator ekonomi. Responden mencakup perusahaan di sektor pertanian, pertambangan, industri, dan konstruksi. Komoditas yang disurvei merupakan bagian dari paket khusus sektor konstruksi.",
      isExpanded: false,
    },
    {
      id: "sphb",
      title: "Survei Harga Perdagangan Besar (SPHB)",
      description:
        "survei rutin bulanan yang bertujuan mengumpulkan data harga grosir yang akurat dan tepat waktu untuk memantau perkembangan harga. Data tersebut juga digunakan dalam penyusunan Indeks Harga Perdagangan Besar (IHPB) bulanan. Survei mencakup lima sektor utama: pertanian, pertambangan dan penggalian, industri, barang impor, dan barang ekspor.",
      isExpanded: false,
    },
    {
      id: "ecommerce",
      title: "Survei E-Commerce",
      description:
        "survei tahunan yang bertujuan mengumpulkan data mengenai perusahaan yang menjalankan kegiatan e-commerce (memanfaatkan internet dalam menerima pesanan atau penjualan barang dan jasa). Survei ini menyajikan indikator utama terkait aktivitas e-commerce, seperti jumlah usaha, jenis barang atau jasa yang dijual, nilai transaksi, metode pembayaran, dan cara pengiriman. Cakupan unit usaha yang menjadi sasaran survei adalah kategori lapangan usaha A, C, G, H, I, J, M, N, P (kecuali pendidikan formal), Q, R, dan S.",
      isExpanded: false,
    },
    {
      id: "skps",
      title: "Survei Khusus Perusahaan Swasta Non Finansial (SKPS)",
      description:
        "Survei ini bertujuan untuk mengumpulkan informasi mengenai karakteristik korporasi swasta non-finansial, termasuk jenis usaha, struktur permodalan, dan jumlah tenaga kerja. Selain itu, survei ini juga mencatat hasil transaksi usaha melalui laporan keuangan perusahaan, seperti Laporan Posisi Keuangan (Balance Sheet) dan Laporan Laba Rugi (Income Statement). Dari data tersebut, dapat dianalisis struktur aset, kewajiban, modal, serta komponen output dan biaya operasional perusahaan.",
      isExpanded: false,
    },
    {
      id: "sksppi",
      title: "Survei Khusus Studi Penyusunan Perubahan Inventori (SKSPPI)",
      description:
        "Survei tahunan yang bertujuan untuk memperoleh gambaran kuantitas dan nilai inventori pada awal dan akhir tahun, mengidentifikasi pola serta struktur inventori berdasarkan jenis komoditas dan klasifikasi usaha, serta menghitung rasio inventori terhadap nilai produksi. Data yang dihasilkan berperan penting dalam analisis investasi dan perhitungan PDB. Cakupan survei meliputi berbagai sektor usaha di seluruh provinsi Indonesia, dengan responden dari perusahaan swasta di sektor industri, perdagangan, dll.",
      isExpanded: false,
    },
    {
      id: "sibs",
      title: "Survei Industri Besar dan Sedang (SIBS)",
      description:
        "Survei bulanan yang mencakup data produksi, nilai produksi, dan jumlah tenaga kerja. Bertujuan menghasilkan indeks produksi serta pertumbuhan industri manufaktur skala menengah dan besar yang menjadi dasar perhitungan PDRB sektor industri manufaktur.",
      isExpanded: false,
    },
    {
      id: "stpim",
      title: "Survei Tahunan Perusahaan Industri Manufaktur (STPIM)",
      description:
        "Survei tahunan yang bertujuan mengumpulkan data industri manufaktur skala menengah dan besar, mencakup jumlah perusahaan, bahan baku, produksi, tenaga kerja, dan karakteristik lainnya. Data disajikan pada level nasional berdasarkan KBLI 2 digit. Cakupan sampel untuk tahun 2023 meliputi perusahaan pada kategori C (industri pengolahan) KBLI 2020, kecuali KBLI 13 dan 14. Survei ini menggunakan pendekatan perusahaan dengan metode probability sampling dengan teknik sampling Stratified PPS–Systematic Sampling.",
      isExpanded: false,
    },
    {
      id: "skim",
      title: "Survei Komoditas Industri Manufaktur (SKIM)",
      description:
        "Survei tahunan yang bertujuan untuk mengumpulkan data industri manufaktur skala menengah dan besar untuk kategori usaha tertentu. Komoditas yang dipilih pada SKIM 2023 adalah tekstil (KBLI 13) dan pakaian jadi (KBLI 14). Kerangka sampel diambil dari daftar perusahaan aktif hasil Pemutakhiran Direktori Perusahaan Awal (DPA).",
      isExpanded: false,
    },
  ]);

  // State untuk carousel dokumentasi kegiatan
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const images = [
    "/image/act1.png",
    "/image/act2.png",
    "/image/act3.png",
    "/image/act4.png",
    "/image/act5.png",
    "/image/act6.png",
    "/image/act7.png",
  ];

  // Auto-scroll carousel
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Berganti setiap 3 detik

    return () => clearInterval(interval);
  }, [images.length]);

  // Fungsi untuk toggle accordion
  const toggleAccordion = (id: string) => {
    setSurveiList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
      )
    );
  };

  // Fungsi navigasi carousel
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="bg-base">
      <Navbar />

      <div className="min-h-screen bg-base">
        {/* Header Section - Layout Perbaikan */}
        <div className="mx-[5%] font-roboto py-12">
          <h1 className="text-2xl font-bold text-cdark text-center mb-6">
            Penjelasan Umum
          </h1>

          {/* Paragraf Pertama - Full Width */}
          <div className="w-full text-cdark text-sm text-justify font-medium leading-relaxed mb-8">
            <p className="indent-8">
              Badan Pusat Statistik (BPS) Kabupaten Sidoarjo merupakan salah
              satu instansi vertikal yang memiliki tugas dalam penyelenggaraan
              statistik dasar di Kabupaten Sidoarjo. Seiring dengan pertumbuhan
              jumlah perusahaan Industri Besar dan Sedang (IBS) dari waktu ke
              waktu, BPS Kabupaten Sidoarjo secara berkala melakukan
              pemutakhiran direktori untuk memastikan keakuratan data. Proses
              pemutakhiran ini diperlukan karena adanya dinamika dalam status
              perusahaan, seperti pendirian perusahaan baru, perpindahan lokasi,
              atau penghentian operasional. Pemutakhiran dilakukan dengan
              mencocokkan daftar nama dan alamat perusahaan yang diperoleh dari
              berbagai instansi terkait, seperti Dinas Perindustrian, BKPMD, dan
              Dinas Perizinan, dengan direktori terbaru yang dimiliki oleh BPS
              Kabupaten Sidoarjo. Jika ditemukan perusahaan yang belum terdaftar
              dalam direktori, maka perusahaan tersebut dicatat sebagai calon
              perusahaan yang selanjutnya akan dilakukan verifikasi lapangan
              untuk memastikan status operasionalnya.
            </p>
          </div>

          {/* Container 2 Kolom - Hanya untuk Tabel dan Paragraf Kedua */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Kolom Kiri - Tabel Kode Keadaan Lapangan */}
            <div className="w-full">
              <div className="rounded-lg shadow-md">
                {/* Tabel Kode Keadaan Lapangan */}
                <h4 className="text-sm font-semibold text-cdark text-center">
                  Kode Keadaan Lapangan:
                </h4>
                {/* <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-cdark"> */}
                <div className="overflow-hidden rounded-lg border border-cdark">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-cdark">
                        <th className="border border-cdark px-2 text-center text-sm font-semibold text-white w-12">
                          Kode
                        </th>
                        <th className="border border-cdark px-2 text-center text-sm font-semibold text-white">
                          Keterangan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-cdark px-2 text-sm text-cdark text-center font-medium">
                          1
                        </td>
                        <td className="border border-cdark px-2 text-sm text-cdark font-medium">
                          Perusahaan sudah berproduksi komersial
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-cdark px-2 text-sm text-cdark text-center font-medium">
                          2
                        </td>
                        <td className="border border-cdark px-2 text-sm text-cdark font-medium">
                          Perusahaan masih produksi percobaan
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-cdark px-2 text-sm text-cdark text-center font-medium">
                          3
                        </td>
                        <td className="border border-cdark px-2 text-sm text-cdark font-medium">
                          Perusahaan sedang dibangun
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-cdark px-2 text-sm text-cdark text-center font-medium">
                          4
                        </td>
                        <td className="border border-cdark px-2 text-sm text-cdark font-medium">
                          Baru ada lokasi / Penyelidikan Umum
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-cdark px-2 text-sm text-cdark text-center font-medium">
                          5
                        </td>
                        <td className="border border-cdark px-2 text-sm text-cdark font-medium">
                          Perusahaan yang dulu ada, sekarang tutup
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-cdark px-2 text-sm text-cdark text-center font-medium">
                          6
                        </td>
                        <td className="border border-cdark px-2 text-sm text-cdark font-medium">
                          Perusahaan berada di wilayah kabupaten/kota lain
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-cdark px-2 text-sm text-cdark text-center font-medium">
                          7
                        </td>
                        <td className="border border-cdark px-2 text-sm text-cdark font-medium">
                          Perusahaan bukan sektor industri
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-cdark px-2 text-sm text-cdark text-center font-medium">
                          8
                        </td>
                        <td className="border border-cdark px-2 text-sm text-cdark font-medium">
                          Perusahaan tidak ditemukan
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Kolom Kanan - Paragraf Kedua */}
            <div className="w-full text-cdark text-sm text-justify font-medium leading-relaxed">
              <p className="indent-8 mb-6">
                Berdasarkan hasil pengecekan lapangan, perusahaan yang memenuhi
                kriteria skala besar atau sedang serta memiliki kode 1 akan
                dimasukkan ke dalam direktori. Sementara itu, perusahaan dengan
                kode 2, 3, dan 4 masih memerlukan verifikasi lebih lanjut pada
                tahun berikutnya sebelum dapat ditambahkan. Adapun perusahaan
                yang memiliki kode 5 hingga 8 tidak dapat dimasukkan ke dalam
                direktori dan tidak memerlukan pengecekan ulang di tahun
                mendatang. Termasuk dalam kelompok ini adalah perusahaan skala
                kecil dan mikro, yaitu perusahaan yang memiliki kurang dari 20
                tenaga kerja, atau nilai investasi tetap sejak awal pendirian
                hingga akhir tahun kurang dari 1 miliar rupiah, atau memiliki
                omset tahunan di bawah 2 miliar rupiah.
              </p>
            </div>
          </div>

          {/* Bagian Kegiatan Survei Terkait - Full Width */}
          <h1 className="text-2xl font-bold text-cdark text-center mt-10 mb-6">
            Kegiatan Survei Terkait
          </h1>
          <div className="w-full text-cdark text-sm text-justify font-medium leading-relaxed">
            <p className="indent-8">
              Selain melakukan pemutakhiran direktori perusahaan manufaktur
              skala besar dan sedang (IBS) untuk penyusunan direktori perusahaan
              IBS. Setiap tahun BPS Kabupaten Sidoarjo juga secara rutin
              menyelenggarakan berbagai kegiatan survei terkait industri
              manufaktur skala besar dan sedang. Survei-survei tersebut
              merupakan bagian dari kegiatan fungsi internal di lingkungan BPS
              Kabupaten Sidoarjo. Adapun survei tersebut diantaranya.
            </p>
          </div>
        </div>

        {/* Survei Accordion Section */}
        <div className="mx-[5%] font-roboto pb-10">
          <div className="max-w-4xl mx-auto">
            {/* Fungsi Distribusi */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-center mb-2 text-cdark">
                Fungsi Distribusi
              </h3>
              <div className="space-y-4">
                {surveiList.slice(0, 4).map((survei) => (
                  <div
                    key={survei.id}
                    className="bg-cdark rounded-lg shadow-md overflow-hidden"
                  >
                    <button
                      onClick={() => toggleAccordion(survei.id)}
                      className="w-full flex items-center justify-between p-2 text-left bg-cdark text-white"
                    >
                      <span className="text-sm font-medium">
                        {survei.title}
                      </span>
                      {survei.isExpanded ? (
                        <ChevronUpIcon className="w-6 h-6" strokeWidth={2.5} />
                      ) : (
                        <ChevronDownIcon
                          className="w-6 h-6"
                          strokeWidth={2.5}
                        />
                      )}
                    </button>

                    {survei.isExpanded && survei.description && (
                      <div className="p-2 pt-0 bg-cdark">
                        <p className="text-white text-sm leading-relaxed text-justify font-medium">
                          {survei.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fungsi Neraca */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-center mb-2 text-cdark">
                Fungsi Neraca
              </h3>

              <div className="space-y-4">
                {surveiList.slice(4, 6).map((survei) => (
                  <div
                    key={survei.id}
                    className="bg-cdark rounded-lg shadow-md overflow-hidden"
                  >
                    <button
                      onClick={() => toggleAccordion(survei.id)}
                      className="w-full flex items-center justify-between p-2 text-left bg-cdark text-white"
                    >
                      <span className="text-sm font-medium">
                        {survei.title}
                      </span>
                      {survei.isExpanded ? (
                        <ChevronUpIcon className="w-6 h-6" strokeWidth={2.5} />
                      ) : (
                        <ChevronDownIcon
                          className="w-6 h-6"
                          strokeWidth={2.5}
                        />
                      )}
                    </button>

                    {survei.isExpanded && survei.description && (
                      <div className="p-2 pt-0 bg-cdark">
                        <p className="text-white text-sm leading-relaxed text-justify font-medium">
                          {survei.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fungsi Produksi */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-center mb-2 text-cdark">
                Fungsi Produksi
              </h3>

              <div className="space-y-4">
                {surveiList.slice(6).map((survei) => (
                  <div
                    key={survei.id}
                    className="bg-cdark rounded-lg shadow-md overflow-hidden"
                  >
                    <button
                      onClick={() => toggleAccordion(survei.id)}
                      className="w-full flex items-center justify-between p-2 text-left bg-cdark text-white"
                    >
                      <span className="text-sm font-medium">
                        {survei.title}
                      </span>
                      {survei.isExpanded ? (
                        <ChevronUpIcon className="w-6 h-6" strokeWidth={2.5} />
                      ) : (
                        <ChevronDownIcon
                          className="w-6 h-6"
                          strokeWidth={2.5}
                        />
                      )}
                    </button>

                    {survei.isExpanded && survei.description && (
                      <div className="p-2 pt-0 bg-cdark">
                        <p className="text-white text-sm leading-relaxed text-justify font-medium">
                          {survei.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tujuan Section */}
        <div className="mx-[5%] font-roboto pb-10">
          <h1 className="text-2xl font-bold text-cdark text-center mb-6">
            Tujuan
          </h1>
          <div className="w-full text-cdark text-sm text-justify font-medium leading-relaxed mb-8">
            <p className="indent-8">
              Sistem ini dirancang untuk menyajikan data direktori perusahaan
              Industri Besar dan Sedang di Kabupaten Sidoarjo menjadi lebih
              efektif melalui visualisasi interaktif berupa peta tematik. Dengan
              adanya sistem ini, pengguna data diharapkan dapat lebih mudah
              dalam memahami, mengakses, dan menganalisis informasi yang
              disajikan sehingga kepuasan terhadap layanan data statistik dapat
              meningkat. Selain itu, sistem ini juga akan mengintegrasikan
              pengelolaan data dari berbagai survei industri manufaktur guna
              memperkuat koordinasi antara internal BPS dan pencapaian lapangan.
              Sistem ini dilengkapi dengan informasi spasial, riwayat beban
              responden, dan tingkat kesulitan pencapaian untuk mendukung
              pengambilan keputusan yang lebih akurat, khususnya dalam menangani
              perusahaan yang sulit didata. Dengan demikian, sistem ini
              diharapkan dapat meningkatkan respons dari responden.
            </p>
          </div>
        </div>

        {/* Pencapaian Kami Section */}
        <div className="mx-[5%] font-roboto pb-10">
          <h1 className="text-2xl font-bold text-cdark text-center mb-6">
            Pencapaian Kami
          </h1>

          <div className="flex justify-center mb-12">
            <motion.div
              whileHover={{ translateY: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="hover:cursor-pointer"
            >
              <img
                src="/image/piagam.png"
                alt="Piagam Penghargaan BPS Kabupaten Sidoarjo"
                className="rounded-lg shadow-lg max-w-md w-full h-auto"
              />
            </motion.div>
          </div>
        </div>

        {/* Dokumentasi Kegiatan Section */}
        <div className="mx-[5%] font-roboto pb-10">
          <h1 className="text-2xl font-bold text-cdark text-center mb-6">
            Dokumentasi Kegiatan
          </h1>

          {/* Container dengan padding untuk arrows */}
          <div className="relative max-w-6xl mx-auto px-16">
            {/* Grid 3 Gambar Horizontal dengan aspect ratio konsisten */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tampilkan 3 gambar berdasarkan currentImageIndex */}
              {Array.from({ length: 3 }, (_, i) => {
                const imageIndex = (currentImageIndex + i) % images.length;
                return (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-xl shadow-lg bg-cdarkbrown"
                  >
                    <div className="aspect-[4/3] w-full">
                      <img
                        src={images[imageIndex]}
                        alt={`Dokumentasi Kegiatan ${imageIndex + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrows - Diposisikan di tengah vertikal gambar */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-cdark hover:bg-cdarkbrown text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-200 z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cdark hover:bg-cdarkbrown text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-200 z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex
                      ? "bg-cdark"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TentangPage;
