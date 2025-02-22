"use client";

import React from "react";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from '@mui/icons-material/X';
import CallIcon from "@mui/icons-material/Call";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";


type FooterItem = {
  icon: React.ElementType;
  href?: string;
  text: string;
};

const medSos: FooterItem[] = [
  {
    icon: FacebookOutlinedIcon,
    href: "https://id-id.facebook.com/statistik.sidoarjo/",
    text:"",
  },
  {
    icon: InstagramIcon,
    href: "https://www.instagram.com/bps.sidoarjo/",
    text:"",
  },
  {
    icon: XIcon,
    href: "https://x.com/bpskabsidoarjo",
    text:"",
  },
  {
    icon: YouTubeIcon,
    href: "https://www.youtube.com/@bpskabupatensidoarjo3550",
    text:"",
  },
];

const contacts: FooterItem[] = [
  {
    icon: LocationOnIcon,
    href: "https://maps.app.goo.gl/4dMALXhFKqJ952D78/",
    text: "Jl. Pahlawan No 140",
  },
  {
    icon: CallIcon,
    text: "(031)8941744",
  },
  {
    icon: EmailIcon,
    href: "mailto:bps3515@bps.go.id",
    text: "bps3515@bps.go.id",
  },
];

type FooterListProps = {
  items: FooterItem[];
};

const FooterList: React.FC<FooterListProps> = ({ items }) => (
  <ol className="flex flex-wrap items-center justify-center gap-2">
    {items.map((item, index) => (
      <li className="flex items-center" key={index}>
        <a
          href={item.href}
          target={item.href ? "_blank" : undefined}
          rel={item.href ? "noopener noreferrer" : undefined}
          className="flex items-center justify-center p-2 transition-transform duration-300 ease-in-out transform hover:scale-110"
        >
          <item.icon fontSize="large" />
        </a>
        {item.text && (
          <a
            href={item.href}
            target={item.href ? "_blank" : undefined}
            rel={item.href ? "noopener noreferrer" : undefined}
            className="text-md group relative w-max ml-2"
          >
            <span>{item.text}</span>
          </a>
        )}
      </li>
    ))}
  </ol>
);

const Footer: React.FC = () => {
  return (
    <footer
      id="footer"
      className="relative flex flex-col p-5 mt-10 overflow-hidden bg-clightbrown text-white md:h-40 md:flex-around md:flex-row md:items-center md:p-0"
    >
      <div className="flex flex-col items-center justify-center mb-5 md:w-5/12 md:my-0">
        <div className="flex items-center">
          <img alt="logo" src="/image/logo.png" width={120} height={120} />
          <div className="w-[6px] rounded-full h-24 bg-white mx-4"></div>
          <p className="block text-2xl">
            <b>BPS</b> <span className="block">Kabupaten</span>
            <span className="block">
              <b>Sidoarjo</b>
            </span>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-1 md:w-7/12">
        <div>
          <FooterList items={medSos} />
        </div>
        <div>
          <FooterList items={contacts} />
        </div>
      </div>
      <div className="absolute bottom-0 right-0 hidden md:block">
        <img src="/image/footer_pattern.png" width={200} height={200} style={{ transform: "scaleX(-1)" }} />
      </div>
      <div className="absolute bottom-0 left-0 hidden md:block">
        <img src="/image/footer_pattern.png" width={200} height={200} />
      </div>
    </footer>
  );
};

export default Footer;