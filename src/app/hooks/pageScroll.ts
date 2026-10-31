export type ScrollSnapshot = {
  y: number;
  heroBottom: number;
  heroHeight: number;
  headerHeight: number;
  sectionTops: Record<string, number>;
};

const SECTION_IDS = ["bio", "stack", "rankings", "contact"];
const listeners = new Set<(snap: ScrollSnapshot) => void>();
let queued = false;
let attached = false;

function measure(): ScrollSnapshot {
  const hero = document.getElementById("hero");
  const header = document.querySelector(".site-header");
  const sectionTops: Record<string, number> = {};
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    sectionTops[id] = el ? el.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
  }
  return {
    y: window.scrollY,
    heroBottom: hero ? hero.getBoundingClientRect().bottom : 0,
    heroHeight: hero && hero.offsetHeight > 0 ? hero.offsetHeight : window.innerHeight,
    headerHeight: header ? header.getBoundingClientRect().height : 80,
    sectionTops,
  };
}

function flush() {
  queued = false;
  const snap = measure();
  listeners.forEach((listener) => listener(snap));
}

function requestFlush() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}

export function subscribePageScroll(listener: (snap: ScrollSnapshot) => void) {
  listeners.add(listener);
  if (!attached) {
    attached = true;
    window.addEventListener("scroll", requestFlush, { passive: true });
    window.addEventListener("resize", requestFlush, { passive: true });
  }
  requestFlush();
  return () => {
    listeners.delete(listener);
  };
}
