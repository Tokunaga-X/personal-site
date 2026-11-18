/** Positions in the 1280×720 room bitmap, measured on the concept and the empty room. */

export const VIEW = { w: 1280, h: 720 };

export type Box = { x: number; y: number; w: number; h: number };

/** Hover/click targets. */
export const SEATS = {
  site: { id: "site" as const, x: 360, y: 252, w: 108, h: 158 },
  general: { id: "general" as const, x: 500, y: 260, w: 120, h: 130 },
  x: { id: "x" as const, x: 700, y: 340, w: 96, h: 92 },
  trading: { id: "trading" as const, x: 900, y: 348, w: 110, h: 120 },
};

export const RACK_HITS: Record<"hostinger" | "tencent", Box> = {
  hostinger: { x: 992, y: 158, w: 118, h: 300 },
  tencent: { x: 1104, y: 196, w: 96, h: 268 },
};

/** Painted code block on each monitor. `skew` drops the right edge in pixels. */
export const SCREENS: { id: string; x: number; y: number; w: number; h: number; skew: number }[] = [
  { id: "site", x: 420, y: 278, w: 30, h: 26, skew: 3 },
  { id: "general", x: 594, y: 310, w: 28, h: 26, skew: 3 },
  { id: "x", x: 770, y: 334, w: 28, h: 26, skew: 4 },
  { id: "trading", x: 900, y: 388, w: 36, h: 28, skew: 4 },
];

/** Painted rack lights. `k` is green, blue, or the one amber. */
export const LEDS: { x: number; y: number; k: "g" | "b" | "a" }[] = [
  { x: 1019, y: 236, k: "g" },
  { x: 1019, y: 250, k: "g" },
  { x: 1019, y: 263, k: "g" },
  { x: 1019, y: 276, k: "g" },
  { x: 1018, y: 288, k: "b" },
  { x: 1019, y: 307, k: "a" },
  { x: 1019, y: 336, k: "b" },
  { x: 1019, y: 348, k: "g" },
  { x: 1018, y: 361, k: "b" },
  { x: 1018, y: 373, k: "g" },
  { x: 1079, y: 263, k: "g" },
  { x: 1088, y: 267, k: "b" },
  { x: 1078, y: 275, k: "a" },
  { x: 1088, y: 280, k: "b" },
  { x: 1078, y: 287, k: "g" },
  { x: 1088, y: 293, k: "b" },
  { x: 1077, y: 300, k: "g" },
  { x: 1089, y: 306, k: "b" },
  { x: 1079, y: 314, k: "g" },
  { x: 1088, y: 318, k: "b" },
  { x: 1075, y: 332, k: "b" },
  { x: 1079, y: 350, k: "g" },
  { x: 1080, y: 363, k: "b" },
  { x: 1079, y: 375, k: "g" },
  { x: 1113, y: 278, k: "b" },
  { x: 1113, y: 291, k: "g" },
  { x: 1113, y: 304, k: "g" },
  { x: 1113, y: 317, k: "g" },
  { x: 1113, y: 330, k: "b" },
  { x: 1113, y: 349, k: "a" },
  { x: 1113, y: 365, k: "g" },
  { x: 1113, y: 378, k: "b" },
  { x: 1113, y: 391, k: "g" },
  { x: 1113, y: 404, k: "g" },
  { x: 1113, y: 417, k: "g" },
];
