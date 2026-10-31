import { useContext, useState, type CSSProperties } from "react";
import home from "../data/rank-home.json";
import { LanguageContext } from "../store/LanguageContext";
import AllRatingsModal from "./AllRatingsModal";

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

export default function Rankings() {
  const { language, t } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const titleOf = (item: RankItem) => (language === "zh" ? item.zh : item.en);

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
          <article className="rank-card" key={list.key}>
            <header className="rank-head">
              <h3>{t(list.key)}</h3>
              <span className="rank-count">
                {list.items.length} {t("rankUnit")}
              </span>
            </header>
            <ol className="rank-list">
              {list.items.map((item, index) => {
                const title = titleOf(item);
                const stars =
                  language === "zh"
                    ? `我打了 ${item.rating} 星`
                    : `Rated ${item.rating} stars`;
                return (
                  <li key={item.id}>
                    <a
                      className="rank-row"
                      href={item.douban_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
              })}
            </ol>
          </article>
        ))}
      </div>

      {open ? <AllRatingsModal onClose={() => setOpen(false)} /> : null}
    </section>
  );
}
