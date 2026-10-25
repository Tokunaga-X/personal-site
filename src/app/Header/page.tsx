import { useContext, useEffect, useState } from "react";
import { DarkModeContext } from "../store/DarkModeContext";
import { LanguageContext } from "../store/LanguageContext";
import BrandLogo from "./BrandLogo";

const LINKS = [
  ["bio", "bio"],
  ["stack", "stack"],
  ["contact", "contact"],
] as const;

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20 14.6A8.2 8.2 0 0 1 9.4 4 7.1 7.1 0 1 0 20 14.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.4v1.8M12 18.8v1.8M3.4 12h1.8M18.8 12h1.8M6.1 6.1l1.3 1.3M16.6 16.6l1.3 1.3M17.9 6.1l-1.3 1.3M7.4 16.6l-1.3 1.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header() {
  const { t, toggleLanguage } = useContext(LanguageContext);
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: "-120px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <header className={scrolled ? "site-header is-scrolled" : "site-header"}>
      <BrandLogo label={t("name")} />
      <nav aria-label={t("name")}>
        <ul className="nav-list">
          {LINKS.map(([id, key]) => (
            <li key={id}>
              <a href={`#${id}`}>{t(key)}</a>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleDarkMode}
              aria-pressed={darkMode}
              aria-label={darkMode ? t("themeToLight") : t("themeToDark")}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </li>
          <li>
            <button
              type="button"
              className="lang-toggle"
              onClick={toggleLanguage}
              aria-label={t("langAria")}
            >
              {t("langLabel")}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
