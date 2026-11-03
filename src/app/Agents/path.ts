import { CELL, type Pt, type RoomLayout } from "./layout";

function blocked(layout: RoomLayout, cx: number, cy: number): boolean {
  if (cx < 0 || cy < 0 || cx >= layout.cols || cy >= layout.rows) return true;
  return layout.blocked[cy * layout.cols + cx] === 1;
}

function nearestFree(layout: RoomLayout, p: Pt): [number, number] {
  const cx = Math.floor(p.x / CELL);
  const cy = Math.floor(p.y / CELL);
  for (let radius = 0; radius < 6; radius += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (!blocked(layout, cx + dx, cy + dy)) return [cx + dx, cy + dy];
      }
    }
  }
  return [Math.max(0, Math.min(layout.cols - 1, cx)), Math.max(0, Math.min(layout.rows - 1, cy))];
}

/** 4-direction BFS on the 8px grid. Paths are cached per layout. */
export function findPath(layout: RoomLayout, a: Pt, b: Pt): Pt[] {
  const key = `${Math.round(a.x)},${Math.round(a.y)}>${Math.round(b.x)},${Math.round(b.y)}`;
  const cached = layout.pathCache.get(key);
  if (cached) return cached;

  const start = nearestFree(layout, a);
  const goal = nearestFree(layout, b);
  const total = layout.cols * layout.rows;
  const prev = new Int32Array(total).fill(-2);
  const startIndex = start[1] * layout.cols + start[0];
  const goalIndex = goal[1] * layout.cols + goal[0];
  prev[startIndex] = -1;
  const queue = [startIndex];

  for (let head = 0; head < queue.length; head += 1) {
    const index = queue[head];
    if (index === goalIndex) break;
    const x = index % layout.cols;
    const y = Math.floor(index / layout.cols);
    const next = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const cell of next) {
      if (blocked(layout, cell[0], cell[1])) continue;
      const nextIndex = cell[1] * layout.cols + cell[0];
      if (prev[nextIndex] !== -2) continue;
      prev[nextIndex] = index;
      queue.push(nextIndex);
    }
  }

  const cells: Pt[] = [];
  if (prev[goalIndex] !== -2) {
    for (let index = goalIndex; index !== -1; index = prev[index]) {
      cells.unshift({
        x: (index % layout.cols) * CELL + CELL / 2,
        y: Math.floor(index / layout.cols) * CELL + CELL / 2,
      });
    }
  }

  const raw = [a, ...cells, b];
  const simplified: Pt[] = [raw[0]];
  for (let i = 1; i < raw.length - 1; i += 1) {
    const prevPt = simplified[simplified.length - 1];
    const mid = raw[i];
    const nextPt = raw[i + 1];
    if ((prevPt.x === mid.x && mid.x === nextPt.x) || (prevPt.y === mid.y && mid.y === nextPt.y)) continue;
    simplified.push(mid);
  }
  simplified.push(raw[raw.length - 1]);
  layout.pathCache.set(key, simplified);
  return simplified;
}

export function pathLength(pts: Pt[]): number {
  let sum = 0;
  for (let i = 1; i < pts.length; i += 1) {
    sum += Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y);
  }
  return sum;
}

export function pointAlong(pts: Pt[], distance: number): Pt {
  let rest = distance;
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    const length = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    if (rest <= length) {
      const t = length ? rest / length : 0;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    rest -= length;
  }
  return pts[pts.length - 1];
}
