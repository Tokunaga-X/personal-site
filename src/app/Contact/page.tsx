import { faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { LanguageContext } from "../store/LanguageContext";

const MAP_URL = "https://goo.gl/maps/pfK871NcLejwEA8Q8";
const LINKEDIN_URL = "https://www.linkedin.com/in/yuchao-xu24253/";
const GITHUB_URL = "https://github.com/Tokunaga-X";

export default function Contact() {
  const { t } = useContext(LanguageContext);

  return (
    <section className="flow contact" aria-labelledby="contact-title">
      <div className="contact-row" data-reveal>
        <div>
          <p className="kicker">{t("contactKicker")}</p>
          <h2 className="contact-title" id="contact-title">
            {t("contactTitle")}
          </h2>
          <p className="contact-body">{t("contactBody")}</p>
          <p className="contact-meta">
            <a href="mailto:officialxyc@gmail.com">{t("email")}</a>
            <span>{t("location")}</span>
          </p>
        </div>
        <ul className="icon-row">
          <li>
            <a className="icon-btn" href="mailto:officialxyc@gmail.com" aria-label={t("mailAria")}>
              <FontAwesomeIcon icon={faEnvelope} />
            </a>
          </li>
          <li>
            <a
              className="icon-btn"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("linkedinAria")}
            >
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
          </li>
          <li>
            <a
              className="icon-btn"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("githubAria")}
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </li>
          <li>
            <a
              className="icon-btn"
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("locationAria")}
            >
              <FontAwesomeIcon icon={faLocationDot} />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
