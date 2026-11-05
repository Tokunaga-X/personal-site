import { useContext, type MouseEvent } from "react";
import { LanguageContext } from "../store/LanguageContext";

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
        </p>
      </div>
    </footer>
  );
}
