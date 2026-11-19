/** Positions in the 1280×720 room bitmap, measured on the concept and the empty room. */

export const VIEW = { w: 1280, h: 720 };

export type Box = { x: number; y: number; w: number; h: number };

/** Hover/click targets, sized to the painted sprites. */
export const SEATS = {
  site: { id: "site" as const, x: 318, y: 272, w: 112, h: 168 },
  general: { id: "general" as const, x: 492, y: 292, w: 100, h: 128 },
  x: { id: "x" as const, x: 688, y: 322, w: 88, h: 112 },
  trading: { id: "trading" as const, x: 874, y: 436, w: 96, h: 108 },
};

/** Painted character pieces. Same silhouette in both themes; night is a dusk grade of the day paint. */
export const CAST = {
  site: {
    shadow: { x: 325, y: 416, w: 80, h: 23 },
    body: { x: 309, y: 290, w: 105, h: 139 },
    top: { x: 348, y: 279, w: 46, h: 29 },
  },
  general: {
    shadow: { x: 506, y: 392, w: 72, h: 17 },
    body: { x: 502, y: 315, w: 81, h: 89 },
    top: { x: 531, y: 297, w: 27, h: 20 },
  },
  x: {
    shadow: { x: 698, y: 410, w: 58, h: 15 },
    body: { x: 686, y: 333, w: 135, h: 90 },
    top: null,
  },
  trading: {
    shadow: { x: 890, y: 514, w: 65, h: 15 },
    body: { x: 886, y: 450, w: 73, h: 78 },
    top: { x: 899, y: 430, w: 47, h: 22 },
  },
} as const;

/** A short forearm from the painted arm onto the near keys. `hx`/`hy` is the typing nudge. */
export const HANDS = {
  site: { x1: 398, y1: 352, cx: 410, cy: 344, x2: 420, y2: 338, w: 5.2, hx: 1.3, hy: -0.6 },
  general: { x1: 572, y1: 372, cx: 586, cy: 370, x2: 600, y2: 372, w: 4.6, hx: 1.4, hy: 0.35 },
  x: { x1: 746, y1: 400, cx: 758, cy: 400, x2: 770, y2: 402, w: 5, hx: 1.25, hy: 0.3 },
  trading: { x1: 916, y1: 462, cx: 910, cy: 452, x2: 904, y2: 444, w: 4.4, hx: -0.4, hy: -1.2 },
} as const;

/**
 * Where the intro note anchors, in the 1280×720 room.
 * `ox`/`oy` are the CSS transform that parks the note beside that point.
 */
export const NOTES: Record<string, { x: number; y: number; ox: string; oy: string }> = {
  site: { x: 360, y: 286, ox: "-12%", oy: "calc(-100% - 8px)" },
  general: { x: 548, y: 308, ox: "-46%", oy: "calc(-100% - 8px)" },
  x: { x: 692, y: 360, ox: "calc(-100% - 10px)", oy: "-18%" },
  trading: { x: 880, y: 484, ox: "calc(-100% - 10px)", oy: "-42%" },
  hostinger: { x: 986, y: 188, ox: "calc(-100% - 10px)", oy: "0px" },
  tencent: { x: 1096, y: 268, ox: "calc(-100% - 10px)", oy: "-8%" },
};

export const RACK_HITS: Record<"hostinger" | "tencent", Box> = {
  hostinger: { x: 992, y: 158, w: 118, h: 300 },
  tencent: { x: 1104, y: 196, w: 96, h: 268 },
};

/** Glass on each monitor. `skew` drops the right edge in pixels. */
export const SCREENS: { id: string; x: number; y: number; w: number; h: number; skew: number }[] = [
  { id: "site", x: 420, y: 274, w: 42, h: 50, skew: 4 },
  { id: "general", x: 594, y: 308, w: 44, h: 48, skew: 3 },
  { id: "x", x: 770, y: 330, w: 40, h: 46, skew: 3 },
  { id: "trading", x: 912, y: 384, w: 40, h: 48, skew: 3 },
];

/** Two eyes, in the 1280×720 room. `light` eyes are the white pair on the black bot. */
export const EYES: { id: "site" | "general" | "x" | "trading"; x: number; y: number; light?: boolean }[] = [
  { id: "site", x: 376, y: 360 },
  { id: "site", x: 390, y: 358 },
  { id: "general", x: 546, y: 366 },
  { id: "general", x: 564, y: 364 },
  { id: "x", x: 736, y: 382, light: true },
  { id: "x", x: 752, y: 380, light: true },
  { id: "trading", x: 922, y: 490 },
  { id: "trading", x: 938, y: 488 },
];

/** Where a chat bubble sits, just above each head. */
export const BUBBLES = {
  site: { x: 312, y: 314 },
  general: { x: 578, y: 314 },
  x: { x: 652, y: 322 },
  trading: { x: 950, y: 428 },
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
