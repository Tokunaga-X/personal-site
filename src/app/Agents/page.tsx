import { useContext } from "react";
import { LanguageContext } from "../store/LanguageContext";
import RoomStudio from "./room/RoomStudio";

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
      {/* Canvas studio (./Studio.tsx) and the code-drawn iso room (./iso) stay for rollback. */}
      <RoomStudio />
    </section>
  );
}
