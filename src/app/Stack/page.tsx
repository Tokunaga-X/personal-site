import { useContext } from "react";
import type { TranslationKey } from "../constants/translations";
import { LanguageContext } from "../store/LanguageContext";
import { MARKS, type MarkName } from "./marks";

type StackItem = {
  name: string;
  icon: MarkName;
};

type StackGroup = {
  label: TranslationKey;
  items: readonly StackItem[];
};

// Groups with no real items stay in the list so labels can come back,
// but they are not rendered. Blockchain and security are in that state.
const GROUPS: readonly StackGroup[] = [
  {
    label: "stackFrontend",
    items: [
      { name: "React", icon: "react" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Next.js", icon: "next" },
      { name: "Tailwind CSS", icon: "tailwind" },
    ],
  },
  {
    label: "stackBackend",
    items: [
      { name: "Node.js", icon: "node" },
      { name: "Java", icon: "java" },
      { name: "MySQL", icon: "mysql" },
    ],
  },
  {
    label: "stackDevops",
    items: [
      { name: "Git", icon: "git" },
      { name: "Linux", icon: "linux" },
      { name: "Nginx", icon: "nginx" },
      { name: "Docker", icon: "docker" },
      { name: "Vercel", icon: "vercel" },
    ],
  },
  { label: "stackChain", items: [] },
  { label: "stackSecurity", items: [] },
];

function StackMark({ name }: { name: MarkName }) {
  // Simple Icons draws MySQL as a wordmark with the dolphin in the upper right.
  // Crop to the dolphin so it reads at the same size as the other marks.
  const viewBox = name === "mysql" ? "14.5 1.6 10.2 10.2" : "0 0 24 24";
  return (
    <span className={name === "mysql" ? "stack-mark is-mysql" : "stack-mark"} aria-hidden="true">
      <svg viewBox={viewBox} focusable="false">
        <path d={MARKS[name]} fill="currentColor" />
      </svg>
    </span>
  );
}

export default function Stack() {
  const { t } = useContext(LanguageContext);
  const groups = GROUPS.filter((group) => group.items.length > 0);

  return (
    <section className="flow" id="stack" aria-labelledby="stack-title">
      <div className="section-head" data-reveal>
        <h2 className="section-title" id="stack-title">
          {t("stackTitle")}
        </h2>
      </div>
      <ul className="ledger stack-list">
        {groups.map((group) => (
          <li key={group.label}>
            <h3>{t(group.label)}</h3>
            <ul className="stack-items">
              {group.items.map((item) => (
                <li key={item.name} className="stack-item">
                  <span>{item.name}</span>
                  <StackMark name={item.icon} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
