import { useContext } from "react";
import { LanguageContext } from "../store/LanguageContext";
import Studio from "./Studio";

export default function Agents() {
  const { t } = useContext(LanguageContext);

  return (
    <section className="flow" id="agents" aria-labelledby="agents-title">
      <div className="section-head" data-reveal>
        <h2 className="section-title" id="agents-title">
          {t("agents")}
        </h2>
        <p className="section-lead">{t("agentsLead")}</p>
      </div>
      <Studio />
    </section>
  );
}
