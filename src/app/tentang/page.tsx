import { Metadata } from "next";
import Tentang from "../components/tentang";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export const metadata: Metadata = {
  title: "Tentang | Kahuripan",
  description:
    "Menyediakan penjelasan Umum kegiatan survei IBS serta informasi mengenai proses publikasi dan pengelolaan data statisik di BPS Kabupaten Sidoarjo",
};

export default function Tentang_Page() {
  return (
    <>
      <Navbar />
      <Tentang />
      <Footer />
    </>
  );
}
