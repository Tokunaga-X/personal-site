import {
  faEnvelopeOpenText,
  faMapLocation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { translations } from "../constants/translations";
import { LanguageContext } from "../store/LanguageContext";

export default function Contact() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const iconOnClick = (targetId: string) => {
    document.getElementById(targetId)?.click();
  };

  return (
    <section className="py-44" id="contact">
      <div className="max-w-[107rem] mx-auto">
        <p className="section-title">{t.contactTitle}</p>
        <h3 className="section-header">{t.contactText}</h3>
        <div className="flex flex-col md:flex-row flex-wrap gap-32 mt-24 items-center lg:justify-start">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div
              className="stack-li w-32 h-32 flex justify-center items-center hover:cursor-pointer"
              onClick={() => iconOnClick("email")}
            >
              <FontAwesomeIcon
                icon={faEnvelopeOpenText}
                style={{ color: "#147efb" }}
                className="text-5xl"
              />
            </div>
            <div className="text-[1.7rem]">
              <p className="text-[#2d2e32] dark:text-white font-bold text-center md:text-start">
                {t.mailTitle}
              </p>
              <p className="text-[#767676] dark:text-white">
                <a
                  id="email"
                  href="mailto:officialxyc@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-font-blue hover:cursor-pointer"
                >
                  officialxyc@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div
              className="stack-li w-32 h-32 flex justify-center items-center hover:cursor-pointer"
              onClick={() => iconOnClick("google-map")}
            >
              <FontAwesomeIcon
                icon={faMapLocation}
                style={{ color: "#147efb" }}
                className="text-5xl"
              />
            </div>
            <div className="text-[1.7rem]">
              <p className="text-[#2d2e32] dark:text-white font-bold text-center md:text-start">
                {t.locationTitle}
              </p>
              <p className="text-[#767676] dark:text-white">
                <a
                  id="google-map"
                  href="https://goo.gl/maps/pfK871NcLejwEA8Q8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-font-blue hover:cursor-pointer"
                >
                  {t.locationAddress}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
