import { useEffect } from "react";
import { subscribePageScroll } from "./pageScroll";

/** Lake parallax and the hero scroll cue. Kept apart from the mixtape. */
export function useHeroScene() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return subscribePageScroll((snap) => {
      const y = snap.y;
      const hero = document.getElementById("hero");
      const layer = hero?.querySelector<HTMLElement>(".hero-parallax");
      if (y > 8) hero?.classList.add("is-cue-done");
      if (layer && !reduced) {
        const progress = Math.min(1, Math.max(0, y / snap.heroHeight));
        const shift = Math.min(60, y * 0.25);
        layer.style.transform = `translate3d(0, ${-shift}px, 0)`;
        layer.style.opacity = String(1 - 0.15 * progress);
      }
    });
  }, []);
}
