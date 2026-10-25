/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#faf6ed",
        surface: "#fffaf1",
        ink: "#183b40",
        muted: "#31565b",
        line: "#d8dfd8",
        accent: "#087c91",
        hero: "#073743",
        cream: "#fff9ee",
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '"PingFang SC"',
          '"Noto Sans SC"',
          '"Microsoft YaHei"',
          '"WenQuanYi Micro Hei"',
          "system-ui",
          "sans-serif",
        ],
        serif: [
          "Newsreader",
          '"Iowan Old Style"',
          "Palatino",
          '"Songti SC"',
          '"Noto Serif SC"',
          '"STSong"',
          "Georgia",
          "serif",
        ],
      },
      maxWidth: {
        headline: "19ch",
        section: "21ch",
        contact: "23ch",
        prose: "70ch",
        bio: "66ch",
        page: "1100px",
      },
      letterSpacing: {
        tightish: "-0.025em",
        kicker: "0.14em",
      },
    },
  },
  plugins: [],
};
