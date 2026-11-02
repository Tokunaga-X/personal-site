import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faCubes, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import type { TranslationKey } from "../constants/translations";
import { LanguageContext } from "../store/LanguageContext";
import { MARKS, type MarkName } from "./marks";

type NamedGroup = {
  label: TranslationKey;
  items: readonly { name: string; icon: MarkName }[];
};

type EmblemGroup = {
  label: TranslationKey;
  emblem: IconDefinition;
};

type StackGroup = NamedGroup | EmblemGroup;

const GROUPS: readonly StackGroup[] = [
  {
    label: "stackFrontend",
    items: [
      { name: "React", icon: "react" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Next.js", icon: "next" },
      { name: "Ant Design Pro", icon: "antd" },
      { name: "Tailwind CSS", icon: "tailwind" },
    ],
  },
  {
    label: "stackBackend",
    items: [
      { name: "Java", icon: "java" },
      { name: "Spring Boot", icon: "spring" },
      { name: "Node.js", icon: "node" },
      { name: "MySQL", icon: "mysql" },
    ],
  },
  {
    label: "stackDevops",
    items: [
      { name: "Linux", icon: "linux" },
      { name: "Docker", icon: "docker" },
      { name: "Nginx", icon: "nginx" },
      { name: "Vercel", icon: "vercel" },
      { name: "Git", icon: "git" },
    ],
  },
  { label: "stackChain", emblem: faCubes },
  { label: "stackSecurity", emblem: faShieldHalved },
];

function isEmblem(group: StackGroup): group is EmblemGroup {
  return "emblem" in group;
}

function StackMark({ name }: { name: MarkName }) {
  return (
    <span className="stack-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d={MARKS[name]} fill="currentColor" />
      </svg>
    </span>
  );
}

export default function Stack() {
  const { t } = useContext(LanguageContext);

  return (
    <section className="flow" id="stack" aria-labelledby="stack-title">
      <div className="section-head" data-reveal>
        <h2 className="section-title" id="stack-title">
          {t("stackTitle")}
        </h2>
      </div>
      <ol className="ledger stack-list">
        {GROUPS.map((group, index) => (
          <li key={group.label} className={isEmblem(group) ? "is-emblem" : undefined}>
            <div className="stack-row">
              <span className="num">{String(index + 1).padStart(2, "0")}</span>
              <div className="stack-body">
                <h3>{t(group.label)}</h3>
                {isEmblem(group) ? (
                  <span className="stack-emblem" aria-hidden="true">
                    <FontAwesomeIcon icon={group.emblem} />
                  </span>
                ) : (
                  <ul className="stack-items">
                    {group.items.map((item) => (
                      <li key={item.name} className="stack-item">
                        <span>{item.name}</span>
                        <StackMark name={item.icon} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
