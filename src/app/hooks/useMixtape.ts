import { useEffect, useRef, useState } from "react";
import { mixtape, type MixtapeTrack } from "../data/mixtape";

/**
 * Playlist playback.
 * Same autoplay idea as the old background track: try once after a short
 * wait, and if the browser blocks it, start on the next click or key.
 * A saved "off" choice stays off until Play.
 *
 * Level is audio.volume. Tracks should already be near -18 LUFS; iOS
 * ignores this property and uses the system volume.
 */

const STORAGE_KEY = "portfolio_music_muted";
const TARGET = 0.8;
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
    const wantPlay = { current: !readMuted() };
    let playToken = 0;
    let resumeOnVisible = false;
    let gestureCleanup: (() => void) | null = null;

    const audio = document.createElement("audio");
    audio.preload = "none";
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

    const armGesture = () => {
      if (gestureCleanup || !wantPlay.current || !alive) return;
      const onGesture = (event: Event) => {
        const target = event.target;
        if (target instanceof Element && target.closest("[data-mixtape]")) return;
        disarm();
        void start();
      };
      window.addEventListener("pointerdown", onGesture, true);
      window.addEventListener("keydown", onGesture, true);
      gestureCleanup = () => {
        window.removeEventListener("pointerdown", onGesture, true);
        window.removeEventListener("keydown", onGesture, true);
      };
    };

    const start = async () => {
      const track = list[indexRef.current];
      if (!track || !alive) return;
      const token = ++playToken;
      wantPlay.current = true;
      writeMuted(false);
      assignSrc(track.src);
      audio.volume = TARGET;
      audio.preload = "auto";
      try {
        await audio.play();
        if (!alive || token !== playToken) return;
        disarm();
      } catch (error) {
        if (!alive || token !== playToken) return;
        const name = error instanceof DOMException ? error.name : "";
        if (name === "AbortError") return;
        armGesture();
      }
    };

    const stop = () => {
      playToken += 1;
      wantPlay.current = false;
      writeMuted(true);
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
        if (!audio.paused) stop();
        else void start();
      },
      prev: () => load(indexRef.current - 1),
      next: () => load(indexRef.current + 1),
    };

    const startTimer = window.setTimeout(() => {
      if (!alive || !wantPlay.current) return;
      const policy = (
        navigator as Navigator & { getAutoplayPolicy?: (kind: string) => string }
      ).getAutoplayPolicy?.("mediaelement");
      // play() while autoplay is blocked still prints a console warning in
      // some browsers, even when the rejection is caught.
      if (policy === "disallowed" || policy === "allowed-muted") {
        armGesture();
        return;
      }
      void start();
    }, START_DELAY_MS);

    return () => {
      alive = false;
      window.clearTimeout(startTimer);
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
