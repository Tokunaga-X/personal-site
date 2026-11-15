import { useContext, useEffect, useState, type ReactNode } from "react";
import { LanguageContext } from "../store/LanguageContext";

function MaskLine({ index, children }: { index: number; children: ReactNode }) {
  return (
    <span className="mask-line" style={{ ["--i" as string]: index }}>
      <span className="mask-line-inner">{children}</span>
    </span>
  );
}

type LakeLight = "dawn" | "day" | "dusk" | "night";

/** Rough Hangzhou dayparts. Asia/Shanghai has no daylight saving. */
function lakeLight(date: Date): LakeLight {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0") % 24;
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const clock = hour + minute / 60;
  if (clock >= 5 && clock < 6.5) return "dawn";
  if (clock >= 6.5 && clock < 16.5) return "day";
  if (clock >= 16.5 && clock < 19) return "dusk";
  return "night";
}

function HangzhouClock({ now }: { now: Date }) {
  const { language, t } = useContext(LanguageContext);

  const timeLabel = new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    timeZone: "Asia/Shanghai",
    hour: "numeric",
    minute: "2-digit",
  })
    .format(now)
    .replace("AM", "am")
    .replace("PM", "pm");

  const stamp = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);

  return (
    <p className="hero-clock">
      <MaskLine index={0}>
        <span className="clock-kicker">{t("city")}</span>
      </MaskLine>
      <MaskLine index={1}>
        <time className="clock-time" dateTime={stamp}>
          {timeLabel}
        </time>
      </MaskLine>
    </p>
  );
}

export default function Home() {
  const { t } = useContext(LanguageContext);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const show = () => root.classList.add("hero-ready");
    const timeout = window.setTimeout(show, 2500);
    document.fonts.ready.then(() => {
      window.clearTimeout(timeout);
      show();
    });
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <section className="hero-scene" id="hero" data-light={lakeLight(now)} aria-label={t("city")}>
      <div className="hero-media">
        <div className="hero-parallax">
        <picture>
          <source
            media="(max-width: 700px)"
            srcSet="/hero/west-lake-illustration-mobile.avif"
            type="image/avif"
          />
          <source
            media="(max-width: 700px)"
            srcSet="/hero/west-lake-illustration-mobile.webp"
            type="image/webp"
          />
          <source srcSet="/hero/west-lake-illustration.avif" type="image/avif" />
          <source srcSet="/hero/west-lake-illustration.webp" type="image/webp" />
          <img src="/hero/west-lake-illustration.webp" alt={t("heroAlt")} />
        </picture>
        </div>
        <div className="hero-time" aria-hidden="true" />
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <HangzhouClock now={now} />
      <div className="hero-foot">
        <p className="hero-note">{t("heroNote")}</p>
        <a className="hero-meet" href="#manifesto">
          {t("meet")}
          <span className="hero-cue" aria-hidden="true">
            ↓
          </span>
        </a>
        <span aria-hidden="true" />
      </div>
    </section>
  );
}
