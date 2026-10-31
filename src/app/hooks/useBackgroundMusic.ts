import { useEffect, useState } from "react";
import { subscribePageScroll } from "./pageScroll";

/**
 * Background music.
 * Future tracks must be loudness-normalized the same way before they land in
 * public/: ffmpeg loudnorm, two-pass, linear gain, target -18 LUFS integrated,
 * true peak -1.5 dBTP. Do not mix masters that were only trimmed with
 * audio.volume — iOS ignores that property.
 *
 * Current track: Tokyo Sunset by HoliznaCC0 (CC0).
 * https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/tokyo-sunset-lofi-peaceful-soft/
 */

const SRC = "/audio/bgm-lofi.mp3";
const STORAGE_KEY = "portfolio_music_muted";
const TARGET = 0.4;
const FADE_MS = 5000;
const START_DELAY_MS = 5000;

function readMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeMuted(muted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, muted ? "true" : "false");
  } catch {
    /* private mode */
  }
}

export function useBackgroundMusic() {
  const [muted, setMuted] = useState(readMuted);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = document.createElement("audio");
    audio.preload = "none";
    audio.loop = true;
    audio.src = SRC;
    audio.setAttribute("playsinline", "");
    audio.hidden = true;
    document.body.appendChild(audio);

    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    let context: AudioContext | null = null;
    let gain: GainNode | null = null;
    let fadeFrom = 0;
    let resumeOnVisible = false;
    let started = false;
    let gestureArmed = false;
    const mutedRef = { current: readMuted() };

    let scrollProgress = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scrollFactor = () => 1 - 0.75 * scrollProgress;

    const applyScene = (y: number, heroHeight: number) => {
      scrollProgress = Math.min(1, Math.max(0, y / heroHeight));
      const hero = document.getElementById("hero");
      const layer = hero?.querySelector<HTMLElement>(".hero-parallax");
      if (y > 8) hero?.classList.add("is-cue-done");
      if (layer && !reduced) {
        const shift = Math.min(60, y * 0.25);
        layer.style.transform = `translate3d(0, ${-shift}px, 0)`;
        layer.style.opacity = String(1 - 0.15 * scrollProgress);
      }
    };

    const applyGain = () => {
      if (!context || !gain) return;
      const fade = fadeFrom
        ? Math.min(1, (performance.now() - fadeFrom) / FADE_MS)
        : 0;
      const level = mutedRef.current ? 0 : TARGET * scrollFactor() * fade;
      gain.gain.setTargetAtTime(level, context.currentTime, 0.2);
      if (fadeFrom && fade < 1 && !mutedRef.current) {
        requestAnimationFrame(applyGain);
      }
    };

    const ensureGraph = () => {
      if (!AudioCtx || context) return;
      context = new AudioCtx();
      const source = context.createMediaElementSource(audio);
      gain = context.createGain();
      gain.gain.value = 0;
      source.connect(gain);
      gain.connect(context.destination);
    };

    const begin = () => {
      if (mutedRef.current || started) return;
      ensureGraph();
      audio.preload = "auto";
      const resume =
        context && context.state === "suspended" ? context.resume() : Promise.resolve();
      // play() and resume() run in this turn so a tap still counts as a gesture.
      const startedPlayback = audio.play();
      void Promise.all([startedPlayback, resume])
        .then(() => {
          if (mutedRef.current) {
            audio.pause();
            return;
          }
          started = true;
          fadeFrom = performance.now();
          setPlaying(true);
          applyGain();
        })
        .catch(() => {
          armGesture();
        });
    };

    const armGesture = () => {
      if (gestureArmed || mutedRef.current) return;
      gestureArmed = true;
      const onGesture = (event: Event) => {
        const target = event.target;
        if (target instanceof Element && target.closest("[data-music-toggle]")) return;
        window.removeEventListener("pointerdown", onGesture, true);
        window.removeEventListener("keydown", onGesture, true);
        window.removeEventListener("touchend", onGesture, true);
        gestureArmed = false;
        void begin();
      };
      window.addEventListener("pointerdown", onGesture, true);
      window.addEventListener("keydown", onGesture, true);
      window.addEventListener("touchend", onGesture, true);
    };

    const startTimer = window.setTimeout(() => {
      void begin();
    }, START_DELAY_MS);

    const unsubscribe = subscribePageScroll((snap) => {
      applyScene(snap.y, snap.heroHeight);
      if (started) applyGain();
    });

    const onVisibility = () => {
      if (document.hidden) {
        if (!audio.paused) {
          resumeOnVisible = true;
          audio.pause();
        }
        return;
      }
      if (resumeOnVisible && !mutedRef.current) {
        resumeOnVisible = false;
        void audio.play().catch(() => {
          armGesture();
        });
      }
    };

    const onToggle = (event: Event) => {
      const next = (event as CustomEvent<boolean>).detail;
      mutedRef.current = next;
      writeMuted(next);
      setMuted(next);
      if (next) {
        audio.pause();
        fadeFrom = 0;
        setPlaying(false);
        applyGain();
        return;
      }
      started = false;
      void begin();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("portfolio-music-toggle", onToggle);

    return () => {
      window.clearTimeout(startTimer);
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("portfolio-music-toggle", onToggle);
      audio.pause();
      audio.remove();
      void context?.close();
    };
  }, []);

  return { muted, playing };
}
