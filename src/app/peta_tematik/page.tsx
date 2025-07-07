import { Metadata } from "next";
import Navbar from "../components/navbar";
import Map from "../components/map";

export const metadata: Metadata = {
  title: "Peta Tematik | Kahuripan",
  description: "",
};

export default function Peta_Tematik() {
  return (
    <>
      <Navbar />
      <Map />
    </>
  );
}
