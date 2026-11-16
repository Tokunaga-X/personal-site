import { useContext, useEffect, useRef, useState, type FocusEvent, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { useMixtape } from "../hooks/useMixtape";
import { LanguageContext } from "../store/LanguageContext";

const CLOSE_MS = 280;

export default function Mixtape() {
  const { language, t } = useContext(LanguageContext);
  const { track, playing, toggle, prev, next } = useMixtape();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const pointerKind = useRef("mouse");
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [status, setStatus] = useState("");
  const heard = useRef(false);
  const open = hover || pinned || keyOpen;

  const cancelClose = () => {
    if (closeTimer.current == null) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  useEffect(() => cancelClose, []);

  useEffect(() => {
    if (!pinned) return;
    const onDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node) || root.contains(event.target)) return;
      setPinned(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [pinned]);

  useEffect(() => {
    if (open) return;
    const active = document.activeElement;
    const controls = rootRef.current?.querySelector(".mixtape-controls");
    if (active instanceof HTMLElement && controls?.contains(active)) active.blur();
  }, [open]);

  useEffect(() => {
    if (!track) return;
    if (playing) {
      heard.current = true;
      setStatus(
        language === "zh"
          ? `${t("musicNow")} ${track.title}，${track.artist}`
          : `${t("musicNow")}: ${track.title}, ${track.artist}`,
      );
      return;
    }
    if (heard.current) setStatus(t("musicPaused"));
  }, [playing, track, language, t]);

  if (!track) return null;

  const onEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    cancelClose();
    setHover(true);
  };

  const onLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setHover(false);
    }, CLOSE_MS);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerKind.current = event.pointerType;
  };

  const onDiscClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) return;
    if (pointerKind.current !== "touch") return;
    setPinned((value) => !value);
  };

  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    const target = event.target;
    if (target instanceof Element && target.matches(":focus-visible")) setKeyOpen(true);
  };

  const label = language === "zh" ? `${t("musicPlayer")}：${track.title}` : `${t("musicPlayer")}: ${track.title}`;

  return (
    <div
      ref={rootRef}
      className={["mixtape", open && "is-open", playing && "is-playing"].filter(Boolean).join(" ")}
      data-mixtape
      role="region"
      aria-label={label}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onPointerDown={onPointerDown}
      onFocus={onFocus}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (nextFocus instanceof Node && event.currentTarget.contains(nextFocus)) return;
        setKeyOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        cancelClose();
        setPinned(false);
        setHover(false);
        setKeyOpen(false);
        const active = document.activeElement;
        if (active instanceof HTMLElement && event.currentTarget.contains(active)) active.blur();
      }}
    >
      <div className="mixtape-stage">
        <button
          type="button"
          className="vinyl-hit"
          aria-expanded={open}
          aria-controls="mixtape-controls"
          aria-label={open ? t("musicHide") : t("musicShow")}
          onClick={onDiscClick}
        >
          <span className="vinyl-grow">
            <span className="vinyl-rotor">
              {track.cover ? <img className="vinyl-cover" src={track.cover} alt="" /> : null}
              <span className="vinyl-hole" />
            </span>
          </span>
        </button>

        <div className="mixtape-controls" id="mixtape-controls" aria-hidden={open ? undefined : true}>
          <button
            type="button"
            className="mixtape-btn"
            aria-label={t("musicPrev")}
            tabIndex={open ? 0 : -1}
            onClick={prev}
          >
            <PrevIcon />
          </button>
          <button
            type="button"
            className="mixtape-btn"
            aria-label={playing ? t("musicPause") : t("musicPlay")}
            tabIndex={open ? 0 : -1}
            onClick={toggle}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            className="mixtape-btn"
            aria-label={t("musicNext")}
            tabIndex={open ? 0 : -1}
            onClick={next}
          >
            <NextIcon />
          </button>
        </div>
      </div>

      <p className="mixtape-status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

function PrevIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 6.2v11.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18.2 6.6 9.2 12l9 5.4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 6.2v11.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5.8 6.6 14.8 12l-9 5.4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.2 6.4v11.2L18 12z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6.2h2.4v11.6H8zM13.6 6.2H16v11.6h-2.4z" fill="currentColor" />
    </svg>
  );
}
