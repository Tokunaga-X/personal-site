export type ScrollSnapshot = {
  y: number;
  heroBottom: number;
  heroHeight: number;
  headerHeight: number;
  scrollPadding: number;
  viewport: number;
  scrollHeight: number;
  sectionTops: Record<string, number>;
  sectionBottoms: Record<string, number>;
};

const SECTION_IDS = ["bio", "stack", "rankings", "contact"];
const listeners = new Set<(snap: ScrollSnapshot) => void>();
let queued = false;
let attached = false;

function measure(): ScrollSnapshot {
  const hero = document.getElementById("hero");
  const header = document.querySelector(".site-header");
  const sectionTops: Record<string, number> = {};
  const sectionBottoms: Record<string, number> = {};
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    const box = el?.getBoundingClientRect();
    sectionTops[id] = box ? box.top : Number.POSITIVE_INFINITY;
    sectionBottoms[id] = box ? box.bottom : Number.NEGATIVE_INFINITY;
  }
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
  return {
    y: window.scrollY,
    heroBottom: hero ? hero.getBoundingClientRect().bottom : 0,
    heroHeight: hero && hero.offsetHeight > 0 ? hero.offsetHeight : window.innerHeight,
    headerHeight: header ? header.getBoundingClientRect().height : 80,
    scrollPadding: Number.isFinite(padding) ? padding : 0,
    viewport: window.innerHeight,
    scrollHeight: document.documentElement.scrollHeight,
    sectionTops,
    sectionBottoms,
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
