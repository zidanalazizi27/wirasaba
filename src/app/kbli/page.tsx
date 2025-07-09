import { Metadata } from "next";
import KBLI from "../components/kbli";

export const metadata: Metadata = {
  title: "KBLI | Kahuripan",
  description: "Klasifikasi Baku Lapangan Usaha Indonesia (KBLI) adalah sistem klasifikasi yang digunakan untuk mengelompokkan jenis-jenis usaha di Indonesia. KBLI membantu dalam pengumpulan data statistik, perencanaan ekonomi, dan pengembangan kebijakan.",
};

export default function KBLI_Page() {
  return (
    <>
      <KBLI />
    </>
  );
}
