import { useContext, type MouseEvent } from "react";
import { LanguageContext } from "../store/LanguageContext";

const PHOTO =
  "https://commons.wikimedia.org/wiki/File:Leifeng_Pagoda_on_West_Lake_at_Dusk.jpg";
const AUTHOR = "https://commons.wikimedia.org/wiki/User:Yinweichen";
const LICENSE = "https://creativecommons.org/licenses/by-sa/4.0/";
const REPO = "https://github.com/Tokunaga-X/personal-site";

function scrollToHero(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}

export default function Footer() {
  const { t } = useContext(LanguageContext);

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <a className="monogram" href="#hero" onClick={scrollToHero} aria-label={t("name")}>
          YX
        </a>
        <a className="back-link" href="#hero" onClick={scrollToHero}>
          {t("back")}
          <span aria-hidden="true">↑</span>
        </a>
        <p className="footer-sign">{t("signoff")}</p>
      </div>
      <div className="footer-meta">
        <p className="footer-copy">
          <span>{t("copyright")}</span>
          <a
            className="site-version"
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Version 3, repository"
          >
            v3
          </a>
        </p>
        <p>
          {t("photoBy")}{" "}
          <a href={AUTHOR} target="_blank" rel="noopener noreferrer">
            Yinweichen
          </a>
          ,{" "}
          <a href={LICENSE} target="_blank" rel="noopener noreferrer">
            {t("photoLicense")}
          </a>
          . {t("photoNote")}{" "}
          <a href={PHOTO} target="_blank" rel="noopener noreferrer">
            Wikimedia Commons
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
