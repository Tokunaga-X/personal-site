import { useContext, type MouseEvent } from "react";
import { LanguageContext } from "../store/LanguageContext";

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
        <a className="back-link" href="#hero" onClick={scrollToHero}>
          {t("back")}
          <span aria-hidden="true">↑</span>
        </a>
        <p className="footer-copy">
          <span>{t("copyright")}</span>
          <a
            className="site-version"
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("versionAria")}
          >
            v3
          </a>
        </p>
      </div>
    </footer>
  );
}
