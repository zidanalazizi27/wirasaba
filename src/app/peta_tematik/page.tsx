import { Metadata } from "next";
import Navbar from "../components/navbar";
import Map from "../components/map";

export const metadata: Metadata = {
  title: "Peta Tematik | Kahuripan",
  description:
    "Peta Tematik Kahuripan menyediakan visualisasi data geospasial yang mendukung pengambilan keputusan berbasis lokasi. Dengan peta interaktif, pengguna dapat menjelajahi berbagai tema seperti infrastruktur, lingkungan, dan demografi.",
};

export default function Peta_Tematik() {
  return (
    <>
      <Navbar />
      <Map />
    </>
  );
}
