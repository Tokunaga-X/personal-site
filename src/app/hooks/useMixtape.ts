import { useEffect, useRef, useState } from "react";
import { mixtape, type MixtapeTrack } from "../data/mixtape";

/**
 * Playlist playback.
 * Try to play as soon as the page loads. If the browser blocks that,
 * the first pointer, key, touch, scroll, or wheel starts it.
 * Only an explicit pause is remembered, under a new key. The old mute
 * flag from the single-track player is cleared and ignored.
 *
 * Level is audio.volume. Tracks should already be near -18 LUFS; iOS
 * ignores this property and uses the system volume.
 */

const LEGACY_MUTE_KEY = "portfolio_music_muted";
const STORAGE_KEY = "portfolio_mixtape_paused";
const TARGET = 0.8;

function readPaused() {
  try {
    localStorage.removeItem(LEGACY_MUTE_KEY);
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writePaused(paused: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, paused ? "true" : "false");
  } catch {
    /* private mode */
  }
}

type Commands = {
  toggle: () => void;
  prev: () => void;
  next: () => void;
};

export function useMixtape() {
  const tracks = mixtape;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const commands = useRef<Commands>({
    toggle: () => {},
    prev: () => {},
    next: () => {},
  });

  useEffect(() => {
    if (tracks.length === 0) return;

    let alive = true;
    const list = tracks;
    const indexRef = { current: 0 };
    const wantPlay = { current: !readPaused() };
    let playToken = 0;
    let resumeOnVisible = false;
    let gestureCleanup: (() => void) | null = null;
    let startInFlight = false;
    let quietScrollUntil = 0;
    let fromGesture = false;

    const audio = document.createElement("audio");
    audio.preload = "auto";
    audio.hidden = true;
    audio.loop = false;
    audio.setAttribute("playsinline", "");
    document.body.appendChild(audio);

    const setPlayingSafe = (next: boolean) => {
      if (alive) setPlaying(next);
    };

    const setIndexSafe = (next: number) => {
      indexRef.current = next;
      if (alive) setIndex(next);
    };

    const assignSrc = (src: string) => {
      const url = new URL(src, window.location.href);
      const remote = url.origin !== window.location.origin;
      if (remote && audio.crossOrigin !== "anonymous") audio.crossOrigin = "anonymous";
      if (!remote && audio.crossOrigin) audio.crossOrigin = null;
      if (audio.src !== url.href) audio.src = url.href;
    };

    assignSrc(list[0].src);
    audio.volume = TARGET;

    const disarm = () => {
      gestureCleanup?.();
      gestureCleanup = null;
    };

    const start = async () => {
      const track = list[indexRef.current];
      if (!track || !alive) return;
      const token = ++playToken;
      wantPlay.current = true;
      writePaused(false);
      assignSrc(track.src);
      audio.volume = TARGET;
      try {
        // play() is called in this turn so a gesture still counts.
        await audio.play();
        if (!alive || token !== playToken) return;
        disarm();
      } catch (error) {
        if (!alive || token !== playToken) return;
        const name = error instanceof DOMException ? error.name : "";
        if (name === "AbortError") return;
        if (name === "NotAllowedError") quietScrollUntil = performance.now() + 500;
        armGesture();
      }
    };

    const armGesture = () => {
      if (gestureCleanup || !wantPlay.current || !alive) return;
      const onGesture = (event: Event) => {
        if (!wantPlay.current || startInFlight) return;
        const soft = event.type === "scroll" || event.type === "wheel";
        if (soft && performance.now() < quietScrollUntil) return;
        fromGesture = true;
        window.setTimeout(() => {
          fromGesture = false;
        }, 0);
        startInFlight = true;
        void start().finally(() => {
          startInFlight = false;
        });
      };
      const capture = true;
      window.addEventListener("pointerdown", onGesture, capture);
      window.addEventListener("keydown", onGesture, capture);
      window.addEventListener("touchstart", onGesture, { capture, passive: true });
      window.addEventListener("wheel", onGesture, { capture, passive: true });
      window.addEventListener("scroll", onGesture, { capture, passive: true });
      gestureCleanup = () => {
        window.removeEventListener("pointerdown", onGesture, capture);
        window.removeEventListener("keydown", onGesture, capture);
        window.removeEventListener("touchstart", onGesture, capture);
        window.removeEventListener("wheel", onGesture, capture);
        window.removeEventListener("scroll", onGesture, capture);
      };
    };

    const stop = () => {
      playToken += 1;
      wantPlay.current = false;
      writePaused(true);
      disarm();
      audio.pause();
    };

    const load = (next: number) => {
      const count = list.length;
      if (count === 0) return;
      const wrapped = ((next % count) + count) % count;
      setIndexSafe(wrapped);
      if (count === 1) audio.currentTime = 0;
      else assignSrc(list[wrapped].src);
      if (wantPlay.current) void start();
    };

    const onPlay = () => setPlayingSafe(true);
    const onPause = () => setPlayingSafe(false);
    const onEnded = () => {
      if (!wantPlay.current) return;
      load(indexRef.current + 1);
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (!audio.paused) {
          resumeOnVisible = true;
          audio.pause();
        }
        return;
      }
      if (resumeOnVisible && wantPlay.current) {
        resumeOnVisible = false;
        void audio.play().catch(() => {
          if (alive) armGesture();
        });
      }
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", onVisibility);

    commands.current = {
      toggle: () => {
        // A click's pointerdown already counts as the first gesture and may
        // have started playback. Don't treat that same click as Pause.
        if (!audio.paused && !fromGesture) stop();
        else void start();
      },
      prev: () => load(indexRef.current - 1),
      next: () => load(indexRef.current + 1),
    };

    if (wantPlay.current) {
      armGesture();
      void start();
    }

    return () => {
      alive = false;
      disarm();
      commands.current = { toggle: () => {}, prev: () => {}, next: () => {} };
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      document.removeEventListener("visibilitychange", onVisibility);
      audio.pause();
      audio.remove();
    };
  }, [tracks]);

  const track: MixtapeTrack | null = tracks[index] ?? null;

  return {
    track,
    playing,
    toggle: () => commands.current.toggle(),
    prev: () => commands.current.prev(),
    next: () => commands.current.next(),
  };
}
