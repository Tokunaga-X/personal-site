import { BOTS, SERVERS, type StudioServer } from "../data/agents";

export const ROOM_H = 320;
export const BASE_W = 520;
export const CELL = 8;
export const DESK_W = 88;

export type Pt = { x: number; y: number };
export type DeskKind = "single";

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

export type Spot = { p: Pt; act: "window" | "tea" | "sofa" | "shelf"; dy: number };

export type ChatSpot = { p: Pt; face: -1 | 1; dy: number };

export type RoomLayout = {
  w: number;
  h: number;
  desks: Desk[];
  seats: Seat[];
  spots: Spot[];
  chats: ChatSpot[];
  machines: StudioServer[];
  obstacles: number[][];
  blocked: Uint8Array;
  cols: number;
  rows: number;
  pathCache: Map<string, Pt[]>;
  shelf: Pt;
  tea: Pt;
  sofa: Pt;
  coffee: Pt;
  lamp: Pt;
  rug: { x: number; y: number; w: number; h: number };
  plants: { x: number; y: number; big: boolean }[];
  door: Pt;
};

function deskObstacles(desks: Desk[]): number[][] {
  return desks.map((desk) => [desk.x, desk.y + 8, desk.w, 12]);
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

export function buildLayout(): RoomLayout {
  const desks: Desk[] = BOTS.map((bot) => ({
    x: bot.desk.x,
    y: bot.desk.y,
    w: DESK_W,
    kind: "single",
    seats: [28],
  }));
  const seats: Seat[] = desks.map((desk, deskIndex) => ({
    desk: deskIndex,
    fx: desk.x + desk.seats[0],
    nav: { x: desk.x + desk.seats[0], y: desk.y + 4 },
    feet: desk.y + 14,
  }));

  const spots: Spot[] = [
    { p: { x: 250, y: 96 }, act: "window", dy: 0 },
    { p: { x: 236, y: 304 }, act: "tea", dy: 0 },
    { p: { x: 370, y: 140 }, act: "shelf", dy: 0 },
    { p: { x: 456, y: 304 }, act: "sofa", dy: 0 },
  ];

  const chats: ChatSpot[] = [
    { p: { x: 250, y: 214 }, face: 1, dy: 0 },
    { p: { x: 312, y: 214 }, face: -1, dy: 0 },
    { p: { x: 250, y: 252 }, face: 1, dy: 0 },
    { p: { x: 312, y: 252 }, face: -1, dy: 0 },
  ];

  const shelf = { x: 344, y: 16 };
  const tea = { x: 168, y: 268 };
  const sofa = { x: 414, y: 258 };
  const coffee = { x: 300, y: 308 };
  const lamp = { x: 498, y: 156 };
  const plants = [
    { x: 304, y: 88, big: false },
    { x: 220, y: 160, big: true },
    { x: 8, y: 160, big: false },
  ];

  const furniture: number[][] = [
    [shelf.x, shelf.y, 52, 104],
    [tea.x, tea.y + 8, 60, 24],
    [sofa.x, sofa.y + 8, 92, 22],
    [coffee.x, coffee.y, 60, 12],
    [lamp.x, lamp.y, 16, 72],
    ...plants.map((plant) => [plant.x, plant.y, 16, 16]),
    ...SERVERS.map((machine) => [machine.x, machine.y, machine.w, machine.h]),
  ];

  const obstacles = [...deskObstacles(desks), ...furniture];
  const w = BASE_W;

  return {
    w,
    h: ROOM_H,
    desks,
    seats,
    spots,
    chats,
    machines: [...SERVERS],
    obstacles,
    blocked: bakeBlocked(w, obstacles),
    cols: w / CELL,
    rows: ROOM_H / CELL,
    pathCache: new Map(),
    shelf,
    tea,
    sofa,
    coffee,
    lamp,
    rug: { x: 232, y: 196, w: 100, h: 72 },
    plants,
    door: { x: 122, y: 22 },
  };
}
