// import { Roboto } from "next/font/google";
import type { Config } from "tailwindcss";
// import { nextui } from "@nextui-org/react";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // background: "var(--background)",
        // foreground: "var(--foreground)",
        cdark: "#1A120B",
        cdakbrown: "#74512D",
        clightbrown: "#AF8F6F",
        cbeige: "#FFEAC5",
        base: "#EEF0F2",

        cdarkblue: "#0B588F",
        clightblue: "#26AAE1",
        corange: "#EB891B",
        cgreen: "#68B92E",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
      screens: {
        'xs': '350px',
        '2xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
        '3xl': '1536px',
      },
    },
  },
  // plugins: [nextui()],
} satisfies Config;
