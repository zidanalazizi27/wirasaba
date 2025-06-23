"use client";

import React, { useState, useEffect, useRef } from "react";
import { Metadata } from "next";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import CountUp from "react-countup";

// Interface untuk struktur KBLI
interface KBLIStructure {
  kategori: number;
  golonganPokok: number;
  golongan: number;
  subgolongan: number;
  kelompok: number;
}

// Interface untuk kategori KBLI
interface KBLICategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Interface untuk accordion item
interface AccordionItem {
  id: string;
  title: string;
  content: string;
  isExpanded: boolean;
}

const KBLIPage: React.FC = () => {
  // Animation controls
  const controls = useAnimation();
  const strukturRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Scroll detection untuk animasi CountUp
  useEffect(() => {
    const handleScroll = () => {
      if (strukturRef.current) {
        const rect = strukturRef.current.getBoundingClientRect();
        const isInViewport =
          rect.top >= 0 && rect.top <= window.innerHeight * 0.8;
        if (isInViewport && !isVisible) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Check initial state
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isVisible]);

  // Data struktur KBLI
  const kbliStructure: KBLIStructure = {
    kategori: 21,
    golonganPokok: 88,
    golongan: 245,
    subgolongan: 567,
    kelompok: 1789,
  };

  // Data kategori KBLI
  const kbliCategories: KBLICategory[] = [
    {
      id: "A",
      name: "Pertanian, Kehutanan dan Perikanan",
      description:
        "Kategori ini mencakup semua kegiatan ekonomi/lapangan usaha, yang meliputi pertanian tanaman pangan, perkebunan, hortikultura, peternakan, pemanenan hasil hutan serta penangkapan dan budidaya ikan/biota air. Kategori ini juga mencakup jasa penunjang masing-masing kegiatan ekonomi tersebut.",
      icon: "/image/kbli_a.svg",
    },
    {
      id: "B",
      name: "Pertambangan dan Penggalian",
      description:
        "Kategori ini mencakup kegiatan ekonomi/lapangan usaha pengambilan mineral dalam bentuk alami, yaitu padat (batu bara dan bijih logam), cair (minyak bumi) atau gas (gas alam). Kegiatan ini dapat dilakukan dengan metode yang berbeda seperti pertambangan dan penggalian di permukaan tanah atau dibawah tanah, pengoperasian sumur pertambangan, penambangan di dasar laut dan lain-lain. Kategori ini juga mencakup kegiatan tambahan untuk penyiapan barang tambang dan galian mentah untuk dipasarkan seperti pemecahan, pengasahan, pembersihan, pengeringan, sortasi bijih logam, pencairan gas alam dan aglomerasi bahan bakar padat.",
      icon: "/image/kbli_b.svg",
    },
    {
      id: "C",
      name: "Industri Pengolahan",
      description:
        "Kategori ini meliputi kegiatan ekonomi/lapangan usaha di bidang perubahan secara kimia atau fisik dari bahan, unsur atau komponen menjadi produk baru. Bahan baku industri pengolahan berasal dari produk pertanian, kehutanan, perikanan, pertambangan atau penggalian seperti produk dari kegiatan industri pengolahan lainnya. Perubahan, pembaharuan atau rekonstruksi yang pokok dari barang secara umum diperlakukan sebagai industri pengolahan. Unit industri pengolahan digambarkan sebagai pabrik, mesin atau peralatan yang khusus digerakkan dengan mesin dan tangan. Termasuk kategori industri pengolahan di sini adalah unit yang mengubah bahan menjadi produk baru dengan menggunakan tangan, kegiatan maklon atau kegiatan penjualan produk yang dibuat di tempat yang sama di mana produk tersebut dijual dan unit yang melakukan pengolahan bahan-bahan dari pihak lain atas dasar kontrak.",
      icon: "/image/kbli_c.svg",
    },
    {
      id: "D",
      name: "Pengadaan Listrik, Gas, Uap/Air Panas Dan Udara Dingin",
      description:
        "Kategori ini mencakup kegiatan ekonomi/lapangan usaha pengadaan tenaga listrik, gas alam, uap panas, air panas dan sejenisnya melalui jaringan, saluran atau pipa infrastruktur permanen. Dimensi jaringan/infrastruktur tidak dapat ditentukan dengan pasti, termasuk kegiatan pendistribusian listrik, gas, uap panas dan air panas serta sejenisnya dalam lokasi pabrik atau bangunan tempat tinggal. Kategori ini juga mencakup pengoperasian mesin pembangkit listrik dan gas, yang menghasilkan, mengontrol dan menyalurkan tenaga listrik atau gas. Juga mencakup pengadaan uap panas dan udara dingin/sistem tata udara. Termasuk kegiatan produksi es baik untuk kebutuhan konsumsi maupun kebutuhan lainnya.",
      icon: "/image/kbli_d.svg",
    },
    {
      id: "E",
      name: "Treatment Air, Air Limbah, Pemulihan Material Sampah, dan Remediasi",
      description:
        "Kategori ini mencakup kegiatan ekonomi/lapangan usaha yang berhubungan dengan treatment air. Kategori ini juga mencakup treatment berbagai bentuk limbah dan sampah, seperti limbah dan sampah padat atau bukan yang berasal dari rumah tangga dan industri, yang dapat mencemari lingkungan. Hasil dari proses pengolahan limbah dan sampah dapat dibuang atau menjadi input dalam proses produksi lainnya.",
      icon: "/image/kbli_e.svg",
    },
    {
      id: "F",
      name: "Konstruksi",
      description:
        "Kategori ini mencakup kegiatan ekonomi di bidang konstruksi umum dan khusus, baik untuk bangunan gedung maupun bangunan sipil. Cakupan kegiatan meliputi pembangunan baru, perbaikan, penambahan, perubahan, serta konstruksi sementara. Pekerjaan dapat dilakukan sendiri atau berdasarkan kontrak, dan dapat disubkontrakkan seluruhnya atau sebagian.",
      icon: "/image/kbli_f.svg",
    },
    {
      id: "G",
      name: "Perdagangan Besar Dan Eceran; Reparasi Dan Perawatan Mobil Dan Sepeda Motor",
      description:
        "Kategori ini mencakup kegiatan perdagangan besar dan eceran berbagai jenis barang tanpa perubahan teknis, serta jasa terkait penjualan. Perdagangan besar meliputi penjualan barang baru atau bekas kepada pengecer, industri, atau lembaga melalui grosir, distributor, agen, dan broker, termasuk aktivitas penyortiran, pengepakan, dan distribusi. Perdagangan eceran ditujukan langsung kepada konsumen akhir melalui berbagai saluran seperti toko, kios, atau penjual keliling. Kategori ini juga mencakup layanan reparasi dan perawatan mobil serta sepeda motor. Penjualan dapat dilakukan dengan kepemilikan barang atau melalui sistem komisi/konsinyasi.",
      icon: "/image/kbli_g.svg",
    },
    {
      id: "H",
      name: "Pengangkutan dan Pergudangan",
      description:
        "Kategori ini mencakup penyediaan angkutan penumpang atau barang, baik yang berjadwal maupun tidak, dengan menggunakan jalan rel, saluran pipa, darat, perairan atau udara dan kegiatan yang berhubungan dengan itu seperti fasilitas terminal dan parkir, penanganan kargo/bongkar muat barang, pergudangan dan lain-lain. Termasuk dalam kategori ini penyewaan alat angkutan dengan pengemudi atau operator, juga kegiatan pos dan kurir.",
      icon: "/image/kbli_h.svg",
    },
    {
      id: "I",
      name: "Penyediaan Akomodasi Dan Penyediaan Makan Minum",
      description:
        "Kategori ini mencakup penyediaan akomodasi penginapan jangka pendek untuk pengunjung dan pelancong serta penyediaan makanan dan minuman untuk konsumsi segera. Jumlah dan jenis layanan tambahan yang disediakan dalam kategori ini sangat bervariasi. Tidak termasuk penyediaan akomodasi jangka panjang seperti tempat tinggal utama, penyiapan makanan atau minuman bukan untuk dikonsumsi segera atau yang dijual melalui kegiatan perdagangan besar dan eceran.",
      icon: "/image/kbli_i.svg",
    },
    {
      id: "J",
      name: "Informasi Dan Komunikasi",
      description:
        "Kategori ini mencakup kegiatan produksi dan distribusi informasi serta produk kebudayaan, termasuk penyediaan sarana komunikasi dan pengolahan data. Ruang lingkupnya meliputi penerbitan (termasuk perangkat lunak), produksi film dan rekaman suara, pemrograman dan penyiaran radio/TV, telekomunikasi, teknologi informasi, dan jasa informasi lainnya.",
      icon: "/image/kbli_j.svg",
    },
    {
      id: "K",
      name: "Aktivitas Keuangan dan Asuransi",
      description:
        "Kategori ini mencakup aktivitas keuangan, termasuk asuransi, reasuransi dan kegiatan dana pensiun dan jasa penunjang keuangan. Kategori ini juga mencakup kegiatan dari pemegang aset, seperti kegiatan perusahaan holding dan kegiatan dari lembaga penjaminan atau pendanaan dan lembaga keuangan sejenis.",
      icon: "/image/kbli_k.svg",
    },
    {
      id: "L",
      name: "Real Estat",
      description:
        "Kategori ini mencakup kegiatan yang berkaitan dengan penyewaan, penjualan, pembelian, dan pengelolaan properti (tanah dan bangunan), baik atas nama sendiri maupun pihak lain. Termasuk di dalamnya layanan agen, broker, penaksir properti, serta pengelolaan real estat atas dasar kontrak atau balas jasa. Juga mencakup kegiatan pembangunan gedung yang disertai dengan pemeliharaan atau penyewaan bangunan tersebut.",
      icon: "/image/kbli_l.svg",
    },
    {
      id: "M",
      name: "Aktivitas Profesional, Ilmiah Dan Teknis",
      description:
        "Kategori ini mencakup khususnya kegiatan profesional, ilmu pengetahuan dan teknik, kegiatan ini membutuhkan suatu tingkat pelatihan yang tinggi dan menghasilkan ilmu pengetahuan dan ketrampilan khusus yang tersedia untuk pengguna.",
      icon: "/image/kbli_m.svg",
    },
    {
      id: "N",
      name: "Aktivitas Penyewaan dan Sewa Guna Usaha Tanpa Hak Opsi, Ketenagakerjaan, Agen Perjalanan dan Penunjang Usaha Lainnya",
      description:
        "Kategori ini mencakup berbagai macam kegiatan yang mendukung operasional usaha atau bisnis secara umum. Kegiatan ini berbeda dari kegiatan yang termasuk dalam kategori M, karena tujuan utamanya bukanlah transfer ilmu pengetahuan khusus.",
      icon: "/image/kbli_n.svg",
    },
    {
      id: "O",
      name: "Administrasi Pemerintahan, Pertahanan Dan Jaminan Sosial Wajib",
      description:
        "Kategori ini mencakup kegiatan pemerintahan seperti administrasi publik, legislatif, perpajakan, pertahanan, keamanan, imigrasi, hubungan luar negeri, dan pengelolaan program pemerintah, termasuk jaminan sosial wajib. Kegiatan ini dapat dilakukan oleh badan pemerintahan atau pihak lain, namun diklasifikasikan di sini berdasarkan jenis kegiatannya, bukan status hukumnya.",
      icon: "/image/kbli_o.svg",
    },
    {
      id: "P",
      name: "Pendidikan",
      description:
        "Kategori ini mencakup kegiatan pendidikan di semua jenjang dan jenis, baik secara lisan, tertulis, maupun melalui berbagai media komunikasi. Termasuk pendidikan formal di sekolah umum, pendidikan orang dewasa, program literasi, serta pendidikan khusus untuk siswa dengan kebutuhan khusus. Juga mencakup akademi militer, sekolah di lembaga pemasyarakatan, pelatihan olahraga, hiburan, serta kegiatan penunjang pendidikan. Pendidikan dapat diselenggarakan oleh lembaga negeri atau swasta, dan disampaikan secara langsung maupun melalui media seperti radio, televisi, internet, atau surat menyurat.",
      icon: "/image/kbli_p.svg",
    },
    {
      id: "Q",
      name: "Aktivitas Kesehatan Manusia Dan Aktivitas Sosial",
      description:
        "Kategori ini mencakup kegiatan penyediaan jasa kesehatan dan aktivitas sosial. Kegiatan yang termasuk dalam kategori ini cukup luas cakupannya, dimulai dari pelayanan kesehatan yang diberikan oleh tenaga profesional terlatih di rumah sakit dan fasilitas kesehatan lain, hingga kegiatan perawatan di rumah yang melibatkan tingkatan kegiatan pelayanan kesehatan dan kegiatan sosial yang tidak melibatkan tenaga kesehatan profesional.",
      icon: "/image/kbli_q.svg",
    },
    {
      id: "R",
      name: "Kesenian, Hiburan Dan Rekreasi",
      description:
        "Kategori ini mencakup kegiatan yang cukup luas untuk memenuhi kebutuhan kesenian/kebudayaan, hiburan dan rekreasi masyarakat umum, termasuk pertunjukan langsung, pengoperasian tempat bersejarah, tempat perjudian, olahraga dan rekreasi.",
      icon: "/image/kbli_r.svg",
    },
    {
      id: "S",
      name: "Aktivitas Jasa Lainnya",
      description:
        "Kategori ini mencakup kegiatan dari keanggotaan organisasi, reparasi komputer dan barang-barang rumah tangga dan barang pribadi, berbagai kegiatan jasa perorangan yang tidak dicakup di tempat lain dalam klasifikasi ini.",
      icon: "/image/kbli_s.svg",
    },
    {
      id: "T",
      name: "Aktivitas Rumah Tangga Sebagai Pemberi Kerja; Aktivitas Yang Menghasilkan Barang Dan Jasa Oleh Rumah Tangga yang Digunakan untuk Memenuhi Kebutuhan Sendiri",
      description:
        "Kategori ini mencakup kegiatan rumah tangga sebagai pemberi kerja dan kegiatan yang menghasilkan barang dan jasa oleh rumah tangga yang digunakan untuk memenuhi kebutuhan sendiri.",
      icon: "/image/kbli_t.svg",
    },
    {
      id: "U",
      name: "Aktivitas Badan Internasional Dan Badan Ekstra Internasional Lainnya",
      description:
        "Kategori ini mencakup kegiatan badan internasional seperti Perserikatan Bangsa-Bangsa (PBB), IMF, Bank Dunia, WHO, OECD, OPEC, serta organisasi regional seperti Uni Eropa dan EFTA. Juga termasuk kegiatan perwakilan diplomatik dan konsuler (seperti kedutaan besar) yang beroperasi di negara tempat mereka berada, mewakili negara lain atau organisasi internasional.",
      icon: "/image/kbli_u.svg",
    },
  ];

  // State untuk accordion
  const [accordionItems, setAccordionItems] = useState<AccordionItem[]>([
    {
      id: "golongan-pokok",
      title: "Golongan Pokok",
      content:
        "Adalah rincian lebih lanjut dari kategori, di mana setiap kategori dijabarkan ke dalam satu atau beberapa golongan sesuai sifatnya. Setiap golongan pokok memiliki kode angka dua digit.",
      isExpanded: false,
    },
    {
      id: "golongan",
      title: "Golongan",
      content:
        "Adalah uraian lebih lanjut dari golongan pokok dengan kode tiga digit. Dua digit pertama menunjukkan golongan pokok terkait, sementara digit terakhir merepresentasikan aktivitas ekonomi. Setiap golongan pokok dapat memiliki hingga sembilan golongan.",
      isExpanded: true,
    },
    {
      id: "subgolongan",
      title: "Subgolongan",
      content:
        "Subgolongan merinci lebih lanjut aktivitas ekonomi dalam suatu golongan. Kode empat digitnya terdiri dari tiga digit pertama yang menunjukkan golongan terkait dan satu digit terakhir menunjukkan aktivitas ekonomi dari subgolongan. Setiap golongan dapat memiliki hingga sembilan subgolongan.",
      isExpanded: false,
    },
    {
      id: "kelompok",
      title: "Kelompok",
      content:
        "Kelompok adalah rincian terkecil dalam struktur klasifikasi KBLI yang memberikan detail aktivitas ekonomi spesifik.",
      isExpanded: false,
    },
  ]);

  // State untuk kategori aktif dan carousel
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(0);

  // Auto-scroll carousel untuk kategori
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategoryIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % kbliCategories.length;
        setActiveCategory(nextIndex);
        return nextIndex;
      });
    }, 3000); // Berganti setiap 3 detik

    return () => clearInterval(interval);
  }, [kbliCategories.length]);

  // Update activeCategory bersamaan dengan currentCategoryIndex
  useEffect(() => {
    setActiveCategory(currentCategoryIndex);
  }, [currentCategoryIndex]);

  // Navigation functions for carousel
  const goToPrevious = () => {
    const prevIndex =
      currentCategoryIndex === 0
        ? kbliCategories.length - 1
        : currentCategoryIndex - 1;
    setCurrentCategoryIndex(prevIndex);
    setActiveCategory(prevIndex);
  };

  const goToNext = () => {
    const nextIndex = (currentCategoryIndex + 1) % kbliCategories.length;
    setCurrentCategoryIndex(nextIndex);
    setActiveCategory(nextIndex);
  };

  // State untuk pencarian
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fungsi untuk handle search
  const handleSearch = (value: string) => {
    if (value.trim()) {
      const searchUrl = `https://searchengine.web.bps.go.id/search?q=${encodeURIComponent(value)}&content=kbli2020&page=1&title=0&mfd=all&from=all&to=all&sort=relevansi`;
      window.open(searchUrl, "_blank");
    }
  };

  // Handle search on Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchTerm);
    }
  };

  const toggleAccordion = (id: string) => {
    setAccordionItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
      )
    );
  };

  // Struktur items data untuk cards
  const strukturItems = [
    {
      label: "Kategori",
      value: kbliStructure.kategori,
      color: "bg-cdarkbrown",
    },
    {
      label: "Golongan Pokok",
      value: kbliStructure.golonganPokok,
      color: "bg-cdarkbrown",
    },
    {
      label: "Golongan",
      value: kbliStructure.golongan,
      color: "bg-cdarkbrown",
    },
    {
      label: "Subgolongan",
      value: kbliStructure.subgolongan,
      color: "bg-cdarkbrown",
    },
    {
      label: "Kelompok",
      value: kbliStructure.kelompok,
      color: "bg-cdarkbrown",
    },
  ];

  return (
    <div className="bg-base">
      <Navbar />
      <div className="min-h-screen">
        {/* Hero Section with KBLI Title */}
        <div className="mx-[5%] font-roboto py-12">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/image/kbli_icon.svg"
                alt="KBLI Icon"
                width={100}
                height={100}
                className="mr-4"
              />
              <h1 className="text-3xl md:text-4xl font-bold text-cdarkbrown text-left">
                Klasifikasi Baku
                <br />
                Lapangan Usaha
                <br />
                Indonesia
              </h1>
            </div>

            <div className="w-full text-cdark text-sm text-justify font-medium leading-relaxed">
              <p className="indent-8">
                Merupakan standar klasifikasi yang diterbitkan oleh BPS untuk
                mengelompokkan kegiatan ekonomi ke dalam berbagai lapangan
                usaha. Penyusunan KBLI didasarkan pada dua pendekatan utama,
                yaitu pendekatan kegiatan yang berfokus pada proses produksi
                barang/jasa serta pendekatan fungsi yang mempertimbangkan peran
                pelaku ekonomi dalam memanfaatkan tenaga kerja, modal, serta
                barang/jasa untuk menghasilkan output. KBLI membantu
                menyeragamkan pengumpulan, pengolahan, dan analisis data
                statistik agar dapat dibandingkan secara nasional, regional, dan
                internasional.
              </p>
            </div>
          </div>

          {/* Struktur KBLI Section - Updated Design */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold text-cdark text-center mt-10 mb-6">
              Struktur KBLI
            </h1>

            {/* Cards Container */}
            <div
              ref={strukturRef}
              className="flex flex-wrap justify-center gap-6 md:gap-8"
            >
              {strukturItems.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  {/* Card */}
                  <motion.div
                    className={`${item.color} text-white rounded-lg shadow-md overflow-hidden w-20 h-32 md:w-24 md:h-36 flex items-center justify-center cursor-pointer`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{
                      translateY: -8,
                      scale: 1.05,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <div className="text-xl md:text-3xl font-bold">
                        {isVisible ? (
                          <CountUp
                            end={item.value}
                            duration={2 + index * 0.3}
                            delay={index * 0.2}
                          />
                        ) : (
                          0
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Label */}
                  <motion.div
                    className="mt-3 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                  >
                    <span className="text-base font-semibold text-cdark leading-tight">
                      {item.label}
                    </span>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Accordion Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="space-y-2">
              {accordionItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-cdark rounded-lg shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full flex items-center justify-between p-2 text-left bg-cdark text-white hover:bg-opacity-90 transition-colors"
                  >
                    <span className="text-sm font-medium pb-0">
                      {item.title}
                    </span>
                    {item.isExpanded ? (
                      <ChevronUpIcon className="w-6 h-6" strokeWidth={2.5} />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6" strokeWidth={2.5} />
                    )}
                  </button>

                  {item.isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-cdark border-t border-cdark"
                    >
                      <div className="p-2 pt-0">
                        <p className="text-white text-xs md:text-sm leading-relaxed text-justify font-medium">
                          {item.content}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* KBLI 2020 Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-2xl font-bold text-cdark text-center mb-6">
              KBLI 2020
            </h1>
            <div className="w-full text-cdark text-sm text-justify font-medium leading-relaxed mb-8">
              <p className="indent-8">
                KBLI 2020 merupakan hasil penyempurnaan dari KBLI 2015, disusun
                dengan mengacu pada International Standard Industrial
                Classification of All Economic Activities (ISIC) Rev.4 yang
                diterbitkan oleh United Nations Statistical Division (UNSD) pada
                tahun 2008 hingga tingkat empat digit. Sementara itu, pada
                tingkat lima digit, KBLI 2020 disesuaikan dengan karakteristik
                aktivitas ekonomi di Indonesia. Regulasi ini diterbitkan dalam
                bentuk Peraturan BPS No. 2 Tahun 2020 tentang Klasifikasi Baku
                Lapangan Usaha Indonesia. Dengan berlakunya peraturan tersebut,
                penggunaan KBLI 2015, KBLI 2009, serta versi sebelumnya secara
                bertahap harus dihentikan. Selain itu, KBLI 2020 juga disusun
                untuk mendukung perkembangan sektor usaha dan sistem perizinan
                di Indonesia.
              </p>
            </div> 
          </div>

          {/* List Kategori Section */}
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-cdark text-center mb-6">
              List Kategori
            </h1>

            {/* Horizontal Cards Container */}
            <div className="relative mb-6">
              {/* Navigation Arrow Left */}
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-cdarkbrown hover:bg-opacity-80 text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-lg transition-all duration-200 z-10"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
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

              {/* Cards Container */}
              <div className="mx-12 md:mx-16 overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out gap-4"
                  style={{
                    transform: `translateX(-${currentCategoryIndex * (100 / Math.min(5, kbliCategories.length))}%)`,
                  }}
                >
                  {kbliCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      className={`flex-shrink-0 rounded-xl shadow-lg overflow-hidden cursor-pointer ${
                        activeCategory === index
                          ? "bg-cdark"
                          : "bg-cdarkbrown hover:bg-opacity-90"
                      }`}
                      style={{
                        width: `${100 / Math.min(5, kbliCategories.length) - 1}%`,
                      }}
                      onClick={() => {
                        setActiveCategory(index);
                        setCurrentCategoryIndex(index);
                      }}
                      whileHover={{
                        translateY: -5,
                        scale: 1.02,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="p-4 md:p-6 text-white text-center">
                        {/* Icon */}
                        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 flex items-center justify-center">
                          <Image
                            src={category.icon}
                            alt={`KBLI ${category.id}`}
                            width={48}
                            height={48}
                            className="w-8 h-8 md:w-12 md:h-12 filter brightness-0 invert"
                          />
                        </div>

                        {/* Category ID */}
                        <div className="text-2xl md:text-3xl font-bold mb-2">
                          {category.id}
                        </div>

                        {/* Category Name */}
                        <div className="text-xs md:text-sm font-medium leading-tight">
                          {category.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrow Right */}
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-cdarkbrown hover:bg-opacity-80 text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-lg transition-all duration-200 z-10"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
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
            </div>

            {/* Active Category Details */}
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6 md:p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-cdarkbrown rounded-full flex items-center justify-center text-white mr-4">
                  <span className="text-xl md:text-2xl font-bold">
                    {kbliCategories[activeCategory].id}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-cdark">
                  {kbliCategories[activeCategory].name}
                </h3>
              </div>
              <p className="text-cdark text-sm md:text-base leading-relaxed text-justify">
                {kbliCategories[activeCategory].description}
              </p>
            </motion.div>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-cdark text-center mb-6">
              Pencarian Klasifikasi
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Pencarian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-cdark focus:ring-2 focus:ring-cdark focus:ring-opacity-20 outline-none transition-all duration-300"
              />
              <button
                onClick={() => handleSearch(searchTerm)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform"
              >
                <svg
                  className="w-6 h-6 text-gray-400 hover:text-cdark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-center text-xs md:text-sm text-cdark mt-2">
              Pencarian akan mengarahkan ke database KBLI 2020 BPS
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default KBLIPage;
