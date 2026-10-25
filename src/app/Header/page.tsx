import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../store/LanguageContext";
import BrandLogo from "./BrandLogo";

const LINKS = [
  ["bio", "bio"],
  ["stack", "stack"],
  ["projects", "projects"],
  ["contact", "contact"],
] as const;

export default function Header() {
  const { t, toggleLanguage } = useContext(LanguageContext);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: "-100px 0px 0px 0px", threshold: 0 }
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
