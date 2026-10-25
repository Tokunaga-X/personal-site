import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../store/LanguageContext";

function HangzhouClock() {
  const { language, t } = useContext(LanguageContext);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

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
      <span className="clock-kicker">{t("city")}</span>
      <time className="clock-time" dateTime={stamp}>
        {timeLabel}
      </time>
      <span className="clock-role">{t("roleLine")}</span>
    </p>
  );
}

export default function Home() {
  const { t } = useContext(LanguageContext);

  return (
    <section className="hero-scene" id="hero" aria-label={t("city")}>
      <div className="hero-media">
        <picture>
          <source
            media="(max-width: 700px)"
            srcSet="/hero/west-lake-mobile.avif"
            type="image/avif"
          />
          <source
            media="(max-width: 700px)"
            srcSet="/hero/west-lake-mobile.webp"
            type="image/webp"
          />
          <source srcSet="/hero/west-lake.avif" type="image/avif" />
          <source srcSet="/hero/west-lake.webp" type="image/webp" />
          <img
            src="/hero/west-lake.webp"
            alt={t("heroAlt")}
            fetchPriority="high"
          />
        </picture>
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <HangzhouClock />
      <div className="hero-foot">
        <p className="hero-note">{t("heroNote")}</p>
        <a className="hero-meet" href="#manifesto-title">
          {t("meet")}
          <span aria-hidden="true">↓</span>
        </a>
        <span aria-hidden="true" />
      </div>
    </section>
  );
}
