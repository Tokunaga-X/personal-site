import { useContext, useEffect, useRef, useState } from "react";
import { LanguageContext } from "../store/LanguageContext";

type CatalogItem = {
  id: string;
  type: "movie" | "tv";
  zh: string;
  en: string;
  rating: number | null;
  douban_url: string;
  douban_score: number | null;
};

const GROUPS = [5, 4, 3, 2, 1, null] as const;

let catalogPromise: Promise<CatalogItem[]> | null = null;

function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch("/rankings/douban-all.json").then((response) => {
      if (!response.ok) throw new Error("ratings");
      return response.json() as Promise<CatalogItem[]>;
    });
  }
  return catalogPromise;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function AllRatingsModal({ onClose }: { onClose: () => void }) {
  const { language, t } = useContext(LanguageContext);
  const dialogRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"movie" | "tv">("movie");
  const [openPhase, setOpenPhase] = useState(false);
  const [bodyPhase, setBodyPhase] = useState<"idle" | "in" | "out">("idle");
  const [line, setLine] = useState({ left: 0, width: 0 });
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const closing = useRef(false);

  useEffect(() => {
    let alive = true;
    loadCatalog()
      .then((data) => {
        if (alive) setItems(data);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpenPhase(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const bar = tabsRef.current;
    const button = bar?.querySelector<HTMLElement>(`[data-tab="${tab}"]`);
    if (!bar || !button) return;
    setLine({ left: button.offsetLeft, width: button.offsetWidth });
  }, [tab, language, items]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOpenPhase(false);
    window.setTimeout(onClose, reduce ? 0 : 280);
  };

  const selectTab = (next: "movie" | "tv") => {
    if (next === tab || bodyPhase === "out") return;
    setBodyPhase("out");
    window.setTimeout(() => {
      setTab(next);
      setBodyPhase("in");
    }, 100);
  };

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const nodes = () =>
      dialog ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
    nodes()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const list = nodes();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const pool = (items ?? []).filter((item) => item.type === tab);
  const groups = GROUPS.map((rating) => ({
    rating,
    items: pool
      .filter((item) => item.rating === rating)
      .slice()
      .sort((a, b) => (b.douban_score ?? -1) - (a.douban_score ?? -1)),
  })).filter((group) => group.items.length > 0);

  const titleOf = (item: CatalogItem) => (language === "zh" ? item.zh : item.en);
  const unit = t("rankUnit");

  return (
    <div
      className={openPhase ? "rank-modal-backdrop is-open" : "rank-modal-backdrop"}
      onClick={close}
    >
      <div
        className="rank-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rank-modal-title"
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="rank-modal-bar">
          <h2 id="rank-modal-title">{t("seeAllRatings")}</h2>
          <button type="button" className="rank-modal-close" onClick={close}>
            {t("close")}
          </button>
        </header>
        <div className="rank-tabs" role="tablist" ref={tabsRef}>
          <span
            className="rank-tab-line"
            style={{ width: line.width, transform: `translateX(${line.left}px)` }}
          />
          {(["movie", "tv"] as const).map((key) => {
            const count = items?.filter((item) => item.type === key).length;
            const label = key === "movie" ? t("movies") : t("tv");
            return (
              <button
                key={key}
                type="button"
                role="tab"
                data-tab={key}
                aria-selected={tab === key}
                className={tab === key ? "is-on" : undefined}
                onClick={() => selectTab(key)}
              >
                {label}
                {count != null ? <span>{count}</span> : null}
              </button>
            );
          })}
        </div>
        <div
          className={
            bodyPhase === "out"
              ? "rank-modal-body is-out"
              : bodyPhase === "in"
                ? "rank-modal-body is-in"
                : "rank-modal-body"
          }
        >
          {failed ? <p className="rank-modal-status">…</p> : null}
          {!items && !failed ? <p className="rank-modal-status">…</p> : null}
          {groups.map((group) => (
            <section key={String(group.rating)} className="rank-group">
              <h3>
                {group.rating == null
                  ? t("unrated")
                  : language === "zh"
                    ? `${group.rating} ${t("starsWord")}`
                    : `${group.rating} ${t("starsWord")}`}
                <span>
                  {group.items.length} {unit}
                </span>
              </h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a href={item.douban_url} target="_blank" rel="noopener noreferrer">
                      {titleOf(item)}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
