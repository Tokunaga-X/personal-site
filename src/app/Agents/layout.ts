import type { AgentState } from "./types";

export const ROOM_H = 320;
export const BASE_W = 520;
export const BAY = 160;
export const CELL = 8;

export type Pt = { x: number; y: number };
export type DeskKind = "pair" | "L" | "stand";

export type Desk = {
  x: number;
  y: number;
  w: number;
  kind: DeskKind;
  seats: number[];
};

export type Seat = {
  desk: number;
  fx: number;
  nav: Pt;
  feet: number;
};

export type Spot = { p: Pt; act: "window" | "tea" | "sofa" | "plant" | "rug"; dy: number };
export type ZoneSpot = { p: Pt; dy: number };

export type RoomLayout = {
  w: number;
  h: number;
  expanded: boolean;
  desks: Desk[];
  seats: Seat[];
  zones: Partial<Record<AgentState, ZoneSpot[]>>;
  spots: Spot[];
  obstacles: number[][];
  blocked: Uint8Array;
  cols: number;
  rows: number;
  pathCache: Map<string, Pt[]>;
  shelf: Pt;
  rack: Pt;
  table: Pt;
  tea: Pt;
  sofa: Pt;
  coffee: Pt;
  lamp: Pt;
  rug: { x: number; y: number; w: number; h: number };
  plants: { x: number; y: number; big: boolean }[];
  door: Pt;
};

const BASE_DESKS: Desk[] = [
  { x: 24, y: 136, w: 120, kind: "pair", seats: [22, 72] },
  { x: 160, y: 136, w: 72, kind: "L", seats: [22] },
  { x: 252, y: 136, w: 52, kind: "stand", seats: [16] },
  { x: 24, y: 200, w: 120, kind: "pair", seats: [22, 72] },
  { x: 160, y: 200, w: 120, kind: "pair", seats: [22, 72] },
  { x: 24, y: 256, w: 120, kind: "pair", seats: [22, 72] },
];

/** Extra bay sits fully to the right of the original room, so the first camera frame stays intact. */
const BAY_DESKS: Desk[] = [
  { x: 544, y: 148, w: 120, kind: "pair", seats: [22, 72] },
  { x: 544, y: 220, w: 120, kind: "pair", seats: [22, 72] },
];

function deskObstacles(desks: Desk[]): number[][] {
  return desks.flatMap((desk) =>
    desk.kind === "L"
      ? [
          [desk.x, desk.y + 8, desk.w, 12],
          [desk.x + desk.w - 16, desk.y + 8, 16, 32],
        ]
      : [[desk.x, desk.y + 8, desk.w, 12]],
  );
}

function bakeBlocked(w: number, obstacles: number[][]): Uint8Array {
  const cols = w / CELL;
  const rows = ROOM_H / CELL;
  const grid = new Uint8Array(cols * rows);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const px = x * CELL + CELL / 2;
      const py = y * CELL + CELL / 2;
      const hit =
        py < 80 ||
        obstacles.some((o) => px >= o[0] && px < o[0] + o[2] && py >= o[1] && py < o[1] + o[3]);
      if (hit) grid[y * cols + x] = 1;
    }
  }
  return grid;
}

export function buildLayout(expanded: boolean): RoomLayout {
  const desks = expanded ? [...BASE_DESKS, ...BAY_DESKS] : BASE_DESKS;
  const seats: Seat[] = desks.flatMap((desk, deskIndex) =>
    desk.seats.map((sx) => ({
      desk: deskIndex,
      fx: desk.x + sx,
      nav: { x: desk.x + sx, y: desk.y + 4 },
      feet: desk.kind === "stand" ? desk.y + 18 : desk.y + 14,
    })),
  );

  const zones: RoomLayout["zones"] = {
    planning: [
      { p: { x: 100, y: 92 }, dy: 0 },
      { p: { x: 40, y: 92 }, dy: 0 },
    ],
    researching: [
      { p: { x: 360, y: 132 }, dy: 0 },
      { p: { x: 384, y: 132 }, dy: 0 },
    ],
    deploying: [
      { p: { x: 440, y: 140 }, dy: 0 },
      { p: { x: 484, y: 140 }, dy: 0 },
    ],
    meeting: [
      { p: { x: 318, y: 192 }, dy: 8 },
      { p: { x: 362, y: 192 }, dy: 8 },
      { p: { x: 318, y: 236 }, dy: 0 },
      { p: { x: 362, y: 236 }, dy: 0 },
    ],
  };

  const spots: Spot[] = [
    { p: { x: 228, y: 92 }, act: "window", dy: 0 },
    { p: { x: 268, y: 92 }, act: "window", dy: 0 },
    { p: { x: 196, y: 282 }, act: "tea", dy: 0 },
    { p: { x: 444, y: 290 }, act: "sofa", dy: 2 },
    { p: { x: 472, y: 290 }, act: "sofa", dy: 2 },
    { p: { x: 490, y: 224 }, act: "plant", dy: 0 },
    { p: { x: 458, y: 254 }, act: "rug", dy: 0 },
  ];

  const furniture: number[][] = [
    [344, 96, 52, 24],
    [452, 96, 56, 32],
    [300, 200, 80, 24],
    [168, 288, 56, 16],
    [416, 272, 88, 12],
    [430, 300, 60, 10],
    [8, 84, 16, 16],
    [408, 96, 16, 16],
    [500, 196, 16, 16],
    [140, 296, 16, 16],
    [504, 260, 8, 8],
    ...(expanded ? [[648, 108, 16, 16]] : []),
  ];

  const obstacles = [...deskObstacles(desks), ...furniture];
  const w = expanded ? BASE_W + BAY : BASE_W;

  return {
    w,
    h: ROOM_H,
    expanded,
    desks,
    seats,
    zones,
    spots,
    obstacles,
    blocked: bakeBlocked(w, obstacles),
    cols: w / CELL,
    rows: ROOM_H / CELL,
    pathCache: new Map(),
    shelf: { x: 344, y: 16 },
    rack: { x: 452, y: 28 },
    table: { x: 298, y: 196 },
    tea: { x: 166, y: 276 },
    sofa: { x: 414, y: 266 },
    coffee: { x: 430, y: 300 },
    lamp: { x: 500, y: 228 },
    rug: { x: 404, y: 238, w: 112, h: 76 },
    plants: [
      { x: 8, y: 84, big: true },
      { x: 408, y: 96, big: false },
      { x: 500, y: 196, big: true },
      { x: 140, y: 296, big: false },
      ...(expanded ? [{ x: 648, y: 108, big: false }] : []),
    ],
    door: { x: 122, y: 22 },
  };
}

export function layoutForCount(count: number): RoomLayout {
  return buildLayout(count > 10);
}
