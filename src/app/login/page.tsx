import { Metadata } from "next";
import Login from "../components/login";
import Map from "../components/map";

export const metadata: Metadata = {
  title: "Login | Kahuripan",
  description: "",
};

export default function Login_Page() {
  return (
    <>
      <Login />
    </>
  );
}
