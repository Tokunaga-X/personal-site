import {
  faBars,
  faLanguage,
  faSun,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import BrandLogo from "./BrandLogo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { DarkModeContext } from "../store/DarkModeContext";
import { LanguageContext } from "../store/LanguageContext";

export default function Header() {
  const [mobileMenuShow, setMobileMenuShow] = useState(false);
  const { toggleDarkMode } = useContext(DarkModeContext);
  const { t, toggleLanguage } = useContext(LanguageContext);

  return (
    <>
      <nav className="fixed z-10 w-full flex justify-between align-center py-[28px] pl-[40px] pr-[50px] bg-white dark:bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.09)]">
        <span
          onClick={toggleDarkMode}
          className="absolute right-10 ml-8 pl-1 pr-1 p-1 mr-12"
        >
          <FontAwesomeIcon
            icon={faSun}
            className="text-4xl text-yellow-500 hover:text-black dark:hover:text-white cursor-pointer animate-spin-slow"
          />
        </span>

        <span
          onClick={toggleLanguage}
          className="absolute right-4 ml-4 pl-1 pr-1 p-1"
        >
          <FontAwesomeIcon
            icon={faLanguage}
            className="text-4xl hover:text-black dark:hover:text-white cursor-pointer"
          />
        </span>

        <BrandLogo />

        <FontAwesomeIcon
          icon={faBars}
          className="text-4xl block sm:!hidden"
          onClick={() => setMobileMenuShow(!mobileMenuShow)}
        />

        <ul className="sm:flex gap-8 hidden mr-20">
          <li className="nav-li">
            <a href="#home">{t("home")}</a>
          </li>
          <li className="nav-li">
            <a href="#about">{t("about")}</a>
          </li>
          <li className="nav-li">
            <a href="#projects">{t("projects")}</a>
          </li>
          <li className="nav-li">
            <a href="#contact">{t("contact")}</a>
          </li>
        </ul>
      </nav>

      {mobileMenuShow ? (
        <ul
          className="gap-10 fixed w-screen h-screen bg-yellow-50 z-10 flex flex-col justify-center items-center"
          id="headerSub"
        >
          <FontAwesomeIcon
            icon={faXmark}
            className="w-10 h-10 absolute right-4 top-4"
            onClick={() => setMobileMenuShow(!mobileMenuShow)}
          />

          <li className="nav-li" onClick={() => setMobileMenuShow(!mobileMenuShow)}>
            <a href="#home">{t("home")}</a>
          </li>
          <li className="nav-li" onClick={() => setMobileMenuShow(!mobileMenuShow)}>
            <a href="#about">{t("about")}</a>
          </li>
          <li className="nav-li" onClick={() => setMobileMenuShow(!mobileMenuShow)}>
            <a href="#projects">{t("projects")}</a>
          </li>
          <li className="nav-li" onClick={() => setMobileMenuShow(!mobileMenuShow)}>
            <a href="#contact">{t("contact")}</a>
          </li>
        </ul>
      ) : (
        ""
      )}
    </>
  );
}
