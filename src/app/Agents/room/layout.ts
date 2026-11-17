/** Positions in the 1280×720 room bitmap. Measured from the concept art. */

export const VIEW = { w: 1280, h: 720 };

export type Box = { x: number; y: number; w: number; h: number };

/** Hit target and anchor for each sitter. `x`/`y` is the top-left of the body. */
export const SEATS = {
  site: { id: "site" as const, x: 364, y: 248, w: 100, h: 140 },
  general: { id: "general" as const, x: 548, y: 258, w: 96, h: 128 },
  x: { id: "x" as const, x: 706, y: 318, w: 92, h: 96 },
  trading: { id: "trading" as const, x: 888, y: 342, w: 88, h: 112 },
};

export const RACK_HITS: Record<"hostinger" | "tencent", Box> = {
  hostinger: { x: 992, y: 158, w: 118, h: 300 },
  tencent: { x: 1104, y: 196, w: 96, h: 268 },
};

/** Monitor glass, as a quad in bitmap space (top-left, top-right, bottom-right, bottom-left). */
export const SCREENS: { id: string; points: string }[] = [
  { id: "site", points: "416,274 456,280 468,326 424,318" },
  { id: "general", points: "586,304 624,310 642,358 600,352" },
  { id: "x", points: "760,322 804,328 818,376 774,370" },
  { id: "trading", points: "906,378 944,384 960,432 918,426" },
];
