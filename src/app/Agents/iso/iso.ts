/**
 * True isometric projection (30°) and the static room layout.
 * Screen x grows with world +x and shrinks with world +y.
 * Screen y grows with world +x/+y and shrinks with world +z.
 * Later steps can move the named mascot parts without touching this math.
 */

export const COS = Math.sqrt(3) / 2;
export const SIN = 0.5;
export const SCALE = 54;

export const VIEW = { minX: -530, minY: -305, w: 1360, h: 1090 };

export const ROOM = { w: 16, d: 10, h: 4.75, t: 0.48 };

export type WP = [number, number, number];
export type Vec2 = { x: number; y: number };

export function project(x: number, y: number, z = 0): Vec2 {
  return {
    x: (x - y) * COS * SCALE,
    y: (x + y) * SIN * SCALE - z * SCALE,
  };
}

export function pathOf(points: readonly WP[]): string {
  let d = "";
  for (let i = 0; i < points.length; i += 1) {
    const p = project(points[i][0], points[i][1], points[i][2]);
    d += `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }
  return `${d}Z`;
}

export function toPct(x: number, y: number, z = 0): { left: number; top: number } {
  const p = project(x, y, z);
  return {
    left: ((p.x - VIEW.minX) / VIEW.w) * 100,
    top: ((p.y - VIEW.minY) / VIEW.h) * 100,
  };
}

export function boxPct(
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
): { left: number; top: number; width: number; height: number } {
  const corners: WP[] = [
    [x, y, z],
    [x + w, y, z],
    [x, y + d, z],
    [x + w, y + d, z],
    [x, y, z + h],
    [x + w, y, z + h],
    [x, y + d, z + h],
    [x + w, y + d, z + h],
  ];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const corner of corners) {
    const p = project(corner[0], corner[1], corner[2]);
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  return {
    left: ((minX - VIEW.minX) / VIEW.w) * 100,
    top: ((minY - VIEW.minY) / VIEW.h) * 100,
    width: ((maxX - minX) / VIEW.w) * 100,
    height: ((maxY - minY) / VIEW.h) * 100,
  };
}

export type SeatId = "site" | "general" | "x" | "trading";
export type RackId = "hostinger" | "tencent";

export type DeskSpec = {
  id: SeatId;
  x: number;
  y: number;
  w: number;
  d: number;
  /** Where the sitter's body meets the chair. */
  seat: { x: number; y: number };
  gaze: number;
  /** Screen faces the camera, or the sitter on the right. */
  screen: "front" | "right";
  lamp?: boolean;
};

export const DESKS: readonly DeskSpec[] = [
  { id: "site", x: 3.85, y: 4.55, w: 2.35, d: 1.28, seat: { x: 3.55, y: 6.05 }, gaze: 8, screen: "front" },
  { id: "general", x: 6.35, y: 2.72, w: 2.5, d: 1.26, seat: { x: 7.55, y: 2.48 }, gaze: 1, screen: "front" },
  { id: "x", x: 9.45, y: 3.02, w: 2.5, d: 1.26, seat: { x: 10.65, y: 2.78 }, gaze: -1, screen: "front" },
  { id: "trading", x: 11.7, y: 4.7, w: 2.4, d: 1.22, seat: { x: 13.85, y: 5.55 }, gaze: -6, screen: "front", lamp: true },
];

export type RackSpec = { id: RackId; x: number; y: number; w: number; d: number; h: number };

export const RACKS: readonly RackSpec[] = [
  { id: "hostinger", x: 13.55, y: 0.32, w: 1.08, d: 0.74, h: 4.15 },
  { id: "tencent", x: 14.78, y: 0.52, w: 1.08, d: 0.74, h: 4.15 },
];

export const LOUNGE = {
  shelf: { x: 0.12, y: 3.15, w: 0.52, d: 1.7, h: 2.2 },
  picture: { x: 0.05, y: 1.15, w: 0.06, d: 1.08, h: 0.84, z: 2.62 },
  sofa: { x: 0.32, y: 5.45, w: 0.92, d: 2.55 },
  rug: { x: 2.45, y: 7.55, r: 1.52 },
  plants: [
    { x: 0.95, y: 4.35, kind: "medium" as const },
    { x: 2.55, y: 2.55, kind: "small" as const },
    { x: 0.72, y: 8.85, kind: "large" as const },
  ],
};
