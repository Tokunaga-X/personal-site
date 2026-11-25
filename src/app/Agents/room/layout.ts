/** Positions in the 1280×720 room bitmap, measured on the empty room and v2 cast sprites. */

export const VIEW = { w: 1280, h: 720 };

export type Box = { x: number; y: number; w: number; h: number };

/** Hover/click targets, sized to each seated bot and its chair so the name tag sits right below the chair base. */
export const SEATS = {
  site: { id: "site" as const, x: 356, y: 268, w: 94, h: 176 },
  general: { id: "general" as const, x: 528, y: 300, w: 96, h: 180 },
  x: { id: "x" as const, x: 700, y: 344, w: 90, h: 168 },
  trading: { id: "trading" as const, x: 844, y: 388, w: 92, h: 180 },
};

/** Painted character pieces, placed on the 4 chair cushions behind the foreground chair backrests. */
export const CAST = {
  site: {
    shadow: { x: 392, y: 388, w: 38, h: 20 },
    body: { x: 360, y: 273.4, w: 88, h: 123.7 },
    top: { x: 380.4, y: 272, w: 29.1, h: 21.6 },
  },
  general: {
    shadow: { x: 564, y: 422, w: 42, h: 20 },
    body: { x: 532, y: 306.5, w: 90, h: 126.4 },
    top: { x: 557.6, y: 304, w: 15, h: 27.9 },
  },
  x: {
    shadow: { x: 736, y: 454, w: 42, h: 20 },
    body: { x: 705, y: 348, w: 84, h: 105.8 },
    top: null,
  },
  trading: {
    shadow: { x: 880, y: 509, w: 40, h: 20 },
    body: { x: 848, y: 392, w: 86, h: 118.4 },
    top: null,
  },
} as const;

export const RACK_HITS: Record<"hostinger" | "tencent", Box> = {
  hostinger: { x: 992, y: 158, w: 118, h: 300 },
  tencent: { x: 1104, y: 196, w: 96, h: 268 },
};

/**
 * Foreground chair backrest + front armrest cutouts, extracted pixel-exact from
 * the 2560×1440 room bitmaps (public/studio/room/desk-*-*.webp). Drawn above
 * the cast so each bot is cradled inside its office chair while breathing,
 * typing, leaning, or hopping.
 */
export const DESKS: Partial<Record<"site" | "general" | "x" | "trading", Box>> = {
  site: { x: 354, y: 324, w: 90, h: 126 },
  general: { x: 526, y: 358, w: 90, h: 126 },
  x: { x: 698, y: 390, w: 90, h: 126 },
  trading: { x: 842, y: 445, w: 90, h: 126 },
};

/** Isometric monitor screen panels for all 4 workstations. `skew` drops the right edge in pixels. */
export const SCREENS: { id: string; x: number; y: number; w: number; h: number; skew: number }[] = [
  { id: "site", x: 422, y: 271, w: 42, h: 28, skew: 18 },
  { id: "general", x: 594, y: 300, w: 42, h: 28, skew: 18 },
  { id: "x", x: 765, y: 327, w: 42, h: 28, skew: 18 },
  { id: "trading", x: 909, y: 382, w: 42, h: 28, skew: 18 },
];

/**
 * Vector SVG eyes for all 4 bots, in the 1280×720 room.
 * The painted eyes were inpainted out of the sprites so the SVG eyes can blink
 * (`scaleY`) and follow the pointer (`translate`) with zero ghosting.
 */
export const EYES: {
  id: "site" | "general" | "x" | "trading";
  x: number;
  y: number;
  rx?: number;
  ry?: number;
  rot?: number;
  light?: boolean;
  vector?: boolean;
}[] = [
  { id: "site", x: 410.6, y: 322.6, rx: 2.58, ry: 3.84, rot: -6, vector: true },
  { id: "site", x: 425.6, y: 318.1, rx: 2.3, ry: 3.52, rot: -6, vector: true },
  { id: "general", x: 580.7, y: 367.5, rx: 3.98, ry: 5.66, rot: -6, vector: true },
  { id: "general", x: 598.5, y: 359.8, rx: 3.44, ry: 5.51, rot: -6, vector: true },
  { id: "x", x: 745.2, y: 387.9, rx: 3.7, ry: 4.63, rot: -6, light: true, vector: true },
  { id: "x", x: 765.7, y: 382.0, rx: 3.24, ry: 4.32, rot: -6, light: true, vector: true },
  { id: "trading", x: 897.3, y: 440.7, rx: 2.64, ry: 3.81, rot: -6, vector: true },
  { id: "trading", x: 912.1, y: 436.3, rx: 2.3, ry: 3.5, rot: -6, vector: true },
];

/** Where a chat bubble sits, just above each head. */
export const BUBBLES = {
  site: { x: 354, y: 256 },
  general: { x: 526, y: 288 },
  x: { x: 698, y: 324 },
  trading: { x: 842, y: 368 },
} as const;

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
