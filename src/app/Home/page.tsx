import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { CSSProperties } from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../constants/translations";
import { DarkModeContext } from "../store/DarkModeContext";
import { LanguageContext } from "../store/LanguageContext";

const NAME_COLORS = ["#eab308", "#ef4444", "#14b8a6", "#3b82f6", "#a855f7"];
const NAME_COLOR_CYCLE_MS = 8000;

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (channel: number) =>
    channel.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function interpolateColor(fromHex: string, toHex: string, progress: number) {
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);
  const r = Math.round(from.r + (to.r - from.r) * progress);
  const g = Math.round(from.g + (to.g - from.g) * progress);
  const b = Math.round(from.b + (to.b - from.b) * progress);
  return rgbToHex(r, g, b);
}

export default function Home() {
  const { darkMode } = useContext(DarkModeContext);
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const [nameElapsedMs, setNameElapsedMs] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = window.setInterval(() => {
      setNameElapsedMs(Date.now() - start);
    }, 80);

    return () => window.clearInterval(timer);
  }, []);

  const nameGradientStyle = useMemo(() => {
    const segment = Math.floor(nameElapsedMs / NAME_COLOR_CYCLE_MS);
    const progress =
      (nameElapsedMs % NAME_COLOR_CYCLE_MS) / NAME_COLOR_CYCLE_MS;
    const colorA = NAME_COLORS[segment % NAME_COLORS.length];
    const colorB = NAME_COLORS[(segment + 1) % NAME_COLORS.length];
    const colorC = NAME_COLORS[(segment + 2) % NAME_COLORS.length];

    return {
      "--name-color-from": interpolateColor(colorA, colorB, progress),
      "--name-color-to": interpolateColor(colorB, colorC, progress),
    } as CSSProperties;
  }, [nameElapsedMs]);

  return (
    <div
      className="min-h-screen flex flex-col items-center dark:!bg-slate-950 bg-cover bg-center"
      id="home"
      style={{
        backgroundImage: !darkMode ? "url('/home-bg.jpg')" : "none",
      }}
    >
      <div className="relative flex flex-col lg:flex-row justify-center items-center my-0 md:mt-10 xl:mt-40 mx-auto px-16 lg:h-[65rem] max-w-[107rem] py-[11rem] lg:py-0 gap-12 lg:gap-0">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-[10rem]">
          <div className="max-w-[50rem]">
            <h1 className="text-center lg:text-left text-[#2d2e32] dark:text-white font-bold text-6xl sm:text-[5.5rem] my-8 leading-tight">
              {t.greeting}{" "}
              <span className="name-gradient-text" style={nameGradientStyle}>
                {t.name}
              </span>
            </h1>
            <p className="text-center lg:text-left font-special text-[1.8rem] text-[#767676] dark:text-white font-medium">
              {t.role}
            </p>
            <p className="text-center lg:text-left font-special text-[1.8rem] text-[#767676] dark:text-white font-medium">
              {t.homeLocation}
            </p>
            <div className="flex gap-[1.3rem] my-10 justify-center lg:justify-start">
              <a
                className="hover:scale-110 hover:text-font-blue transition-all duration-500 dark:text-white"
                href="https://www.linkedin.com/in/yuchao-xu24253/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faLinkedin} className="text-5xl" />
              </a>
              <a
                className="hover:scale-110 hover:text-font-blue transition-all duration-500 dark:text-white"
                href="https://github.com/Tokunaga-X"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faGithub} className="text-5xl" />
              </a>
            </div>
          </div>
          <img
            src="/myself.png"
            alt="myself"
            className="sm:w-[35rem] sm:h-[35rem] w-[30rem] h-[30rem] object-cover animate-morph border-[3px] border-solid border-black"
          />
        </div>
        <div className="static lg:absolute bottom-0 left-[4rem] flex flex-col lg:flex-row items-center">
          <div className="flex flex-col items-center lg:items-start mb-12 lg:mb-0 lg:mr-28 lg:pr-8 relative">
            <p className="font-special text-[#2d2e32] dark:text-white text-[1.7rem] font-[700]">
              {t.techStack}
            </p>
            <span className="tech-stack-divider" aria-hidden="true"></span>
          </div>
          <div className="flex flex-col gap-8 items-center lg:items-start">
            <ul className="flex flex-wrap gap-12 list-none justify-center lg:justify-start">
              <li className="stack-li group">
                <img src="/react.png" alt="React" className="w-[3.4rem]" />
                <span className="absolute p-10 hidden group-hover:inline-block top-[6rem] text-2xl transition-all dark:text-white">
                  {t.react}
                </span>
              </li>
              <li className="stack-li group">
                <img src="/nextjs.svg" alt="nextjs" className="w-[3.4rem]" />
                <span className="absolute p-10 hidden group-hover:inline-block top-[6rem] text-2xl transition-all dark:text-white">
                  {t.nextjs}
                </span>
              </li>
              <li className="stack-li group">
                <img src="/typescript.png" alt="typescript" className="w-[3.4rem]" />
                <span className="absolute p-10 hidden group-hover:inline-block top-[6rem] text-2xl transition-all dark:text-white">
                  {t.typescript}
                </span>
              </li>
              <li className="stack-li group">
                <img src="/tailwind-css.svg" alt="tailwind-css" className="w-[3.4rem]" />
                <span className="absolute p-10 hidden group-hover:inline-block top-[6rem] text-2xl transition-all dark:text-white">
                  {t.tailwindcss}
                </span>
              </li>
              <li className="stack-li group">
                <img src="/nodejs.svg" alt="NodeJs" className="w-[3.4rem]" />
                <span className="absolute p-10 hidden group-hover:inline-block top-[6rem] text-2xl transition-all dark:text-white">
                  {t.nodejs}
                </span>
              </li>
              <li className="stack-li group">
                <img src="/solidity.svg" alt="Solidity" className="w-[3.4rem]" />
                <span className="absolute p-10 hidden group-hover:inline-block top-[6rem] text-2xl transition-all dark:text-white">
                  {t.solidity}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
