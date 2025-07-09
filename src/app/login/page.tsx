import { Metadata } from "next";
import Login from "../components/login";

export const metadata: Metadata = {
  title: "Login | Kahuripan",
  description: "Masuk ke admin Kahuripan, platform untuk mengelola dan berbagi pengetahuan.",
};

export default function Login_Page() {
  return (
    <>
      <Login />
    </>
  );
}
