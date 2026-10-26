import { useContext } from "react";
import { LanguageContext } from "../store/LanguageContext";

export default function About() {
  const { t } = useContext(LanguageContext);

  return (
    <>
      <section
        className="manifesto"
        id="manifesto"
        tabIndex={-1}
        aria-labelledby="manifesto-title"
      >
        <div data-reveal>
          <h1 id="manifesto-title">{t("manifesto")}</h1>
          <p className="lead">{t("manifestoLead")}</p>
        </div>
      </section>

      <section className="flow" id="bio" aria-labelledby="bio-title">
        <div className="split" data-reveal>
          <div className="sticky-col">
            <h2 className="bio-heading" id="bio-title">
              {t("bioHeading")}
            </h2>
            <img
              className="bio-portrait"
              src="/myself.png"
              alt={t("name")}
              width={640}
              height={800}
            />
          </div>
          <div className="prose">
            <p>{t("aboutDescription")}</p>
            <p>{t("aboutMe1")}</p>
            <p>{t("aboutMe2")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
