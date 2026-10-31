import { useContext } from "react";
import { useBackgroundMusic } from "../hooks/useBackgroundMusic";
import { LanguageContext } from "../store/LanguageContext";

export default function MusicToggle() {
  const { t } = useContext(LanguageContext);
  const { muted } = useBackgroundMusic();
  const label = muted ? t("musicOn") : t("musicOff");

  return (
    <button
      type="button"
      className="music-toggle"
      data-music-toggle
      aria-pressed={!muted}
      aria-label={label}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("portfolio-music-toggle", { detail: !muted })
        );
      }}
    >
      {muted ? <MutedIcon /> : <SoundIcon />}
      <span className="tip" role="tooltip">
        {label}
      </span>
    </button>
  );
}

function SoundIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 9.5h3.2L12 5.8v12.4l-4.8-3.7H4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M15.2 9.2a3.4 3.4 0 0 1 0 5.6M17.6 7a6.2 6.2 0 0 1 0 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 9.5h3.2L12 5.8v12.4l-4.8-3.7H4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16 10l4 4M20 10l-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
