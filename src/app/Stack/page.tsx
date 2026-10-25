import { useContext } from "react";
import { LanguageContext } from "../store/LanguageContext";

const STACK = ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Solidity"];

export default function Stack() {
  const { t } = useContext(LanguageContext);

  return (
    <section className="flow" id="stack" aria-labelledby="stack-title">
      <div className="split section-head" data-reveal>
        <p className="kicker">{t("stackKicker")}</p>
        <h2 className="section-title" id="stack-title">
          {t("stackTitle")}
        </h2>
      </div>
      <div className="split">
        <div aria-hidden="true" />
        <ol className="ledger stack-list">
          {STACK.map((name, index) => (
            <li key={name}>
              <div className="ledger-title">
                <span className="num">{String(index + 1).padStart(2, "0")}</span>
                <h3>{name}</h3>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
