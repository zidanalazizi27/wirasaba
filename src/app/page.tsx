import { Metadata } from "next";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

export const metadata: Metadata = {
  title: "Beranda | Wirasaba",
  description: "",
};

export default function Home() {
  return (
    <>
      <Navbar />
        <p>Hello World</p>
      <Footer />
    </>
  );
}
