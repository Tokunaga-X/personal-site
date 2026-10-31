import { useContext, useEffect, useRef } from "react";
import { LanguageContext } from "../store/LanguageContext";

function ScrollTitle({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const chars = Array.from(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = ref.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(".manifesto-char"));
    const supportsView = CSS.supports("animation-timeline", "view()");

    const coverRange = () => {
      const height = root.getBoundingClientRect().height;
      const view = window.innerHeight;
      const span = view + height;
      const start = ((0.15 * view) / span) * 100;
      const end = ((0.65 * view) / span) * 100;
      const width = end - start;
      const total = nodes.length || 1;
      nodes.forEach((node, index) => {
        const from = start + (index / total) * width;
        const to = start + ((index + 1) / total) * width;
        node.style.setProperty("animation-range", `cover ${from}% cover ${to}%`);
      });
    };

    coverRange();
    if (supportsView) {
      const onResize = () => coverRange();
      window.addEventListener("resize", onResize, { passive: true });
      return () => window.removeEventListener("resize", onResize);
    }

    let queued = false;
    const paint = () => {
      queued = false;
      const top = root.getBoundingClientRect().top;
      const view = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (0.85 * view - top) / (0.5 * view)));
      const total = nodes.length || 1;
      nodes.forEach((node, index) => {
        const ink = Math.min(1, Math.max(0, progress * total - index));
        node.style.color = `color-mix(in srgb, var(--text) ${ink * 100}%, var(--ink-dim))`;
      });
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    paint();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [text]);

  return (
    <h1 id="manifesto-title" ref={ref} aria-label={text}>
      {chars.map((char, index) => (
        <span key={`${char}-${index}`} className="manifesto-char" aria-hidden="true">
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </h1>
  );
}

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
        <ScrollTitle text={t("manifesto")} />
        <p className="lead" data-reveal>
          {t("manifestoLead")}
        </p>
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
