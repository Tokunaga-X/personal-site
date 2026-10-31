import { useContext, useRef, useState, type CSSProperties } from "react";
import home from "../data/rank-home.json";
import { LanguageContext } from "../store/LanguageContext";
import AllRatingsModal from "./AllRatingsModal";

const ROW_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const PREVIEW_COUNT = 5;

type RankItem = {
  id: string;
  zh: string;
  en: string;
  rating: number;
  douban_url: string;
  douban_score: number;
  poster: string;
};

const LISTS = [
  { key: "movies", items: home.movies as RankItem[] },
  { key: "tv", items: home.tv as RankItem[] },
] as const;

function Stars({ count, label }: { count: number; label: string }) {
  return (
    <span className="stars" aria-label={label}>
      {Array.from({ length: count }, (_, index) => (
        <svg key={index} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
            fill="currentColor"
          />
        </svg>
      ))}
    </span>
  );
}

function RankColumn({
  listKey,
  items,
}: {
  listKey: "movies" | "tv";
  items: RankItem[];
}) {
  const { language, t } = useContext(LanguageContext);
  const [expanded, setExpanded] = useState(false);
  const extraRef = useRef<HTMLDivElement>(null);
  const titleOf = (item: RankItem) => (language === "zh" ? item.zh : item.en);
  const head = items.slice(0, PREVIEW_COUNT);
  const tail = items.slice(PREVIEW_COUNT);
  const panelId = `${listKey}-rest`;

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (!next) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    requestAnimationFrame(() => {
      extraRef.current?.querySelectorAll<HTMLElement>(".rank-row").forEach((row, index) => {
        row.animate(
          [
            { opacity: 0, transform: "translateY(14px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 540, easing: ROW_EASE, delay: index * 80, fill: "both" }
        );
      });
    });
  };

  const renderItem = (item: RankItem, index: number) => {
    const title = titleOf(item);
    const stars =
      language === "zh" ? `我打了 ${item.rating} 星` : `Rated ${item.rating} stars`;
    return (
      <li key={item.id}>
        <a className="rank-row" href={item.douban_url} target="_blank" rel="noopener noreferrer">
          <span className="num">{String(index + 1).padStart(2, "0")}</span>
          <span className="rank-poster">
            <img
              src={item.poster}
              alt={language === "zh" ? `${title} 海报` : `${title} poster`}
              width={300}
              height={450}
              loading="lazy"
            />
          </span>
          <span className="rank-title">{title}</span>
          <span className="rank-score">
            <Stars count={item.rating} label={stars} />
            <span className="rank-db">
              {t("doubanLabel")} {item.douban_score.toFixed(1)}
            </span>
          </span>
        </a>
      </li>
    );
  };

  return (
    <article className="rank-card">
      <header className="rank-head">
        <h3>{t(listKey)}</h3>
        <span className="rank-count">{t("rankTop")}</span>
      </header>
      <ol className="rank-list">{head.map((item, index) => renderItem(item, index))}</ol>
      <div className={expanded ? "rank-extra is-open" : "rank-extra"} id={panelId}>
        <div className="rank-extra-inner" ref={extraRef}>
          <ol className="rank-list">{tail.map((item, index) => renderItem(item, index + PREVIEW_COUNT))}</ol>
        </div>
      </div>
      <button
        type="button"
        className="rank-toggle"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={toggle}
      >
        {expanded ? t("showFewerRanks") : t("showAllRanks")}
      </button>
    </article>
  );
}

export default function Rankings() {
  const { t } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);

  return (
    <section className="flow rankings" id="rankings" aria-labelledby="rank-title">
      <div className="rank-section-head" data-reveal>
        <h2 className="section-title" id="rank-title">
          {t("rankTitle")}
        </h2>
        <button
          type="button"
          className="rank-all"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={t("seeAllRatings")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 6.5h14M5 12h14M5 17.5h9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span className="tip" role="tooltip">
            {t("seeAllRatings")}
          </span>
        </button>
      </div>

      <div
        className="rank-grid"
        style={{ "--rank-cols": String(LISTS.length) } as CSSProperties}
      >
        {LISTS.map((list) => (
          <RankColumn key={list.key} listKey={list.key} items={list.items} />
        ))}
      </div>

      {open ? <AllRatingsModal onClose={() => setOpen(false)} /> : null}
    </section>
  );
}
