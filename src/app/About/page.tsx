import { useContext } from "react";
import { translations } from "../constants/translations";
import { LanguageContext } from "../store/LanguageContext";

export default function About() {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  return (
    <section id="about">
      <div className="max-w-[107rem] mx-auto flex flex-col lg:flex-row items-center lg:justify-center lg:gap-[4vw]">
        <img
          src="/about.png"
          alt="About me"
          className="w-[41rem] sm:h-[35rem] h-auto mb-14 rounded-[1.7rem]"
        />
        <div className="max-w-[54rem] pr-6">
          <p className="section-title">{t.aboutTitle}</p>
          <h3 className="section-header">{t.aboutDescription}</h3>
          <p className="font-special text-[#767676] dark:text-white text-[1.7rem] font-[500] mb-8">
            {t.aboutMe1}
          </p>
        </div>
      </div>
    </section>
  );
}
