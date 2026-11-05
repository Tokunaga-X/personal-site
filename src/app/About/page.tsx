import { useContext, useEffect, useRef, type ReactNode } from "react";
import { LanguageContext } from "../store/LanguageContext";

function isHan(char: string) {
  return /\p{Script=Han}/u.test(char);
}

function isLatin(char: string) {
  return /\p{Script=Latin}/u.test(char);
}

function renderGlyph(char: string, index: number) {
  if (char === "/") {
    return (
      <span key={`slash-${index}`} className="manifesto-char manifesto-slash" aria-hidden="true">
        <svg viewBox="0 0 12 24" focusable="false" aria-hidden="true">
          <line
            x1="10"
            y1="2"
            x2="2"
            y2="22"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span key={`${char}-${index}`} className="manifesto-char" aria-hidden="true">
      {char === " " ? " " : char}
    </span>
  );
}

/** Keep the slash with the word it belongs to so the icon never sits alone on a line. */
function keepBounds(chars: string[], slashAt: number) {
  let start = slashAt;
  let end = slashAt;

  if (slashAt > 0 && isLatin(chars[slashAt - 1])) {
    while (start > 0 && isLatin(chars[start - 1])) start -= 1;
  } else if (slashAt > 0 && isHan(chars[slashAt - 1])) {
    const bound = Math.max(0, slashAt - 2);
    while (start > bound && isHan(chars[start - 1])) start -= 1;
  }

  const next = chars[slashAt + 1];
  if (next && next !== " " && isHan(next)) {
    const bound = Math.min(chars.length, slashAt + 3);
    while (end + 1 < bound && isHan(chars[end + 1])) end += 1;
  } else if (next && isLatin(next)) {
    while (end + 1 < chars.length && isLatin(chars[end + 1])) end += 1;
  }

  return [start, end] as const;
}

function renderLine(line: string) {
  const chars = Array.from(line);
  const slashAt = chars.indexOf("/");
  const [keepStart, keepEnd] = slashAt === -1 ? [-1, -1] : keepBounds(chars, slashAt);
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < chars.length) {
    if (slashAt !== -1 && index === keepStart) {
      const group = [];
      for (let cursor = keepStart; cursor <= keepEnd; cursor += 1) {
        group.push(renderGlyph(chars[cursor], cursor));
      }
      nodes.push(
        <span key={`keep-${index}`} className="manifesto-keep">
          {group}
        </span>
      );
      index = keepEnd + 1;
      continue;
    }
    nodes.push(renderGlyph(chars[index], index));
    index += 1;
  }

  return nodes;
}

function manifestoLines(text: string) {
  const cut = text.indexOf("。");
  if (cut === -1) return [text];
  const rest = text.slice(cut + 1);
  return rest ? [text.slice(0, cut + 1), rest] : [text];
}

function ScrollTitle({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const label = text.replace(/\//g, "");
  const lines = manifestoLines(text);

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
        const target = node.classList.contains("manifesto-slash") ? "var(--accent)" : "var(--text)";
        node.style.color = `color-mix(in srgb, ${target} ${ink * 100}%, var(--ink-dim))`;
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
    <h1 id="manifesto-title" ref={ref} aria-label={label}>
      {lines.map((line) => (
        <span key={line} className="manifesto-line">
          {renderLine(line)}
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
        <div className="manifesto-head">
          <ScrollTitle text={t("manifesto")} />
          <button type="button" className="manifesto-help" aria-label={t("slashTipAria")}>
            <span aria-hidden="true">?</span>
            <span className="tip" role="tooltip">
              {t("slashTip")}
            </span>
          </button>
        </div>
      </section>

      <section className="flow" id="bio" aria-labelledby="bio-title">
        <h2 className="bio-heading" id="bio-title">
          {t("bioHeading")}
        </h2>
        <div className="split" data-reveal>
          <div className="sticky-col">
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
