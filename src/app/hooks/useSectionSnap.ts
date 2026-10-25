import { useEffect } from "react";

const SNAP = "[data-snap]";
const EDGE = 3;

type Range = {
  el: HTMLElement;
  start: number;
  end: number;
};

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function padding() {
  const value = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
  return Number.isFinite(value) ? value : 0;
}

function snapTop(el: HTMLElement) {
  if (el.id === "hero") return 0;
  const top = el.getBoundingClientRect().top + window.scrollY;
  return Math.max(0, top - padding());
}

function ranges(): Range[] {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(SNAP));
  const limit = document.documentElement.scrollHeight;
  return nodes.map((el, index) => ({
    el,
    start: snapTop(el),
    end: index < nodes.length - 1 ? snapTop(nodes[index + 1]) : limit,
  }));
}

function currentRange(list = ranges(), y = window.scrollY) {
  let found = list[0];
  for (const range of list) {
    if (range.start <= y + EDGE) found = range;
  }
  return found;
}

function boxBottom(el: HTMLElement) {
  return el.getBoundingClientRect().bottom + window.scrollY;
}

function covers(range: Range) {
  const height = range.el.offsetHeight;
  if (range.el.id === "hero") return height <= window.innerHeight + EDGE;
  return height <= window.innerHeight - padding() + EDGE;
}

function atStart(range: Range, y: number) {
  return y <= range.start + EDGE;
}

function atEnd(range: Range, y: number) {
  if (covers(range)) return atStart(range, y);
  return y + window.innerHeight >= boxBottom(range.el) - EDGE;
}

function freeLimits(range: Range) {
  const min = range.start;
  const max = Math.max(min, boxBottom(range.el) - window.innerHeight);
  return { min, max };
}

function shouldFreeScroll(dir: 1 | -1, y = window.scrollY) {
  const list = ranges();
  if (!list.length) return false;
  const range = currentRange(list, y);
  if (covers(range)) return false;
  return dir > 0 ? !atEnd(range, y) : !atStart(range, y);
}

function scrollToY(top: number) {
  const behavior = reducedMotion() ? "auto" : "smooth";
  window.scrollTo({ top: Math.max(0, top), behavior });
}

function move(dir: 1 | -1) {
  const list = ranges();
  if (!list.length) return;
  const range = currentRange(list);
  const index = list.indexOf(range);
  const target = list[index + dir];
  if (!target) {
    if (dir > 0) scrollToY(freeLimits(range).max);
    else scrollToY(range.start);
    return;
  }
  scrollToY(target.start);
}

function clampScroll(dir: 1 | -1, delta: number) {
  const range = currentRange();
  if (!range) return;
  const { min, max } = freeLimits(range);
  const top = Math.min(max, Math.max(min, window.scrollY + dir * Math.abs(delta)));
  window.scrollTo({ top, behavior: "auto" });
}

function pixelDelta(event: WheelEvent) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 32;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

function nestedScroller(target: EventTarget | null, deltaY: number) {
  if (!(target instanceof Element)) return false;
  let el: Element | null = target;
  while (el && el !== document.documentElement) {
    const overflow = getComputedStyle(el).overflowY;
    if ((overflow === "auto" || overflow === "scroll") && el.scrollHeight > el.clientHeight + 1) {
      if (deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
      if (deltaY < 0 && el.scrollTop > 0) return true;
    }
    el = el.parentElement;
  }
  return false;
}

function typingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useSectionSnap() {
  useEffect(() => {
    let gestureLock = false;
    let gestureTimer = 0;
    let accum = 0;
    let accumTimer = 0;
    let freeGesture = false;
    let freeTimer = 0;
    let lineLockUntil = 0;
    let pendingDir: 1 | -1 | 0 = 0;
    let touch:
      | {
          y: number;
          top: number;
          index: number;
          freeDown: boolean;
          freeUp: boolean;
          finger: number;
        }
      | null = null;

    const unlockGesture = () => {
      window.clearTimeout(gestureTimer);
      gestureTimer = window.setTimeout(() => {
        gestureLock = false;
        accum = 0;
      }, 180);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (nestedScroller(event.target, event.deltaY)) return;
      const dir: 1 | -1 | 0 = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
      if (!dir) return;

      const delta = pixelDelta(event);
      const discrete = event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL || Math.abs(event.deltaY) >= 40;

      if (gestureLock && !discrete) {
        event.preventDefault();
        unlockGesture();
        return;
      }

      if (shouldFreeScroll(dir) || (freeGesture && !discrete)) {
        event.preventDefault();
        accum = 0;
        freeGesture = true;
        window.clearTimeout(freeTimer);
        freeTimer = window.setTimeout(() => {
          freeGesture = false;
        }, 180);
        clampScroll(dir, delta);
        return;
      }

      freeGesture = false;

      event.preventDefault();

      if (!discrete) {
        if (gestureLock) {
          unlockGesture();
          return;
        }
        accum += delta;
        window.clearTimeout(accumTimer);
        if (Math.abs(accum) < 24) {
          accumTimer = window.setTimeout(() => {
            accum = 0;
          }, 180);
          return;
        }
        accum = 0;
        move(dir);
        gestureLock = true;
        unlockGesture();
        return;
      }

      if (performance.now() < lineLockUntil) {
        pendingDir = dir;
        return;
      }
      move(dir);
      lineLockUntil = performance.now() + (reducedMotion() ? 40 : 520);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Home") {
        event.preventDefault();
        scrollToY(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        const list = ranges();
        const last = list[list.length - 1];
        if (last) scrollToY(freeLimits(last).max);
        return;
      }

      let dir: 1 | -1 | 0 = 0;
      let big = false;
      if (event.key === "ArrowDown") dir = 1;
      else if (event.key === "ArrowUp") dir = -1;
      else if (event.key === "PageDown") {
        dir = 1;
        big = true;
      } else if (event.key === "PageUp") {
        dir = -1;
        big = true;
      } else if (event.key === " " || event.key === "Spacebar") {
        if (typingTarget(event.target)) return;
        if (event.target instanceof HTMLElement && event.target.tagName === "BUTTON") return;
        dir = event.shiftKey ? -1 : 1;
        big = true;
      } else return;

      if (typingTarget(event.target) && !big) return;

      event.preventDefault();
      if (shouldFreeScroll(dir)) {
        clampScroll(dir, big ? window.innerHeight * 0.88 : 64);
        return;
      }
      move(dir);
    };

    const onScrollEnd = () => {
      lineLockUntil = 0;
      const dir = pendingDir;
      pendingDir = 0;
      if (dir && !shouldFreeScroll(dir)) move(dir);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        touch = null;
        return;
      }
      const list = ranges();
      const range = currentRange(list);
      touch = {
        y: event.touches[0].clientY,
        top: window.scrollY,
        index: Math.max(0, list.indexOf(range)),
        freeDown: shouldFreeScroll(1),
        freeUp: shouldFreeScroll(-1),
        finger: 0,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1) return;
      event.preventDefault();
      const point = event.touches[0];
      touch.finger = touch.y - point.clientY;
      const dir: 1 | -1 = touch.finger >= 0 ? 1 : -1;
      const free = dir > 0 ? touch.freeDown : touch.freeUp;
      if (!free) return;
      const origin = ranges()[touch.index];
      if (!origin) return;
      const { min, max } = freeLimits(origin);
      const top = Math.min(max, Math.max(min, touch.top + touch.finger));
      window.scrollTo({ top, behavior: "auto" });
    };

    const onTouchEnd = () => {
      if (!touch) return;
      const finger = touch.finger;
      const dir: 1 | -1 = finger >= 0 ? 1 : -1;
      const free = dir > 0 ? touch.freeDown : touch.freeUp;
      const origin = ranges()[touch.index];
      if (Math.abs(finger) > 12) {
        const blockClick = (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          document.removeEventListener("click", blockClick, true);
        };
        document.addEventListener("click", blockClick, true);
        window.setTimeout(() => document.removeEventListener("click", blockClick, true), 500);
      }
      if (!free && Math.abs(finger) >= 36) move(dir);
      else if (origin) {
        const { min, max } = freeLimits(origin);
        const y = window.scrollY;
        if (y > max) scrollToY(max);
        else if (y < min) scrollToY(min);
      }
      touch = null;
    };

    document.addEventListener("wheel", onWheel, { passive: false, capture: true });
    document.addEventListener("keydown", onKey, { capture: true });
    window.addEventListener("scrollend", onScrollEnd);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("wheel", onWheel, { capture: true });
      document.removeEventListener("keydown", onKey, { capture: true });
      window.removeEventListener("scrollend", onScrollEnd);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      window.clearTimeout(gestureTimer);
      window.clearTimeout(accumTimer);
      window.clearTimeout(freeTimer);
    };
  }, []);
}
