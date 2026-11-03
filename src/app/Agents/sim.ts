import type { RoomLayout, Spot } from "./layout";
import { findPath, pathLength, pointAlong } from "./path";
import type { AgentState, StudioAgent } from "./types";

export const WALK_SPEED = 32;

const PRIORITY: Record<AgentState, number> = {
  waiting_approval: 0,
  error: 1,
  thinking: 2,
  coding: 2,
  executing: 2,
  researching: 2,
  planning: 2,
  deploying: 2,
  meeting: 2,
  done: 3,
  idle: 4,
  offline: 5,
};

export type PoseMode = "seat" | "zone" | "walk";

export type Pose = {
  x: number;
  y: number;
  moving: boolean;
  mode: PoseMode;
  act: Spot["act"] | "";
  hidden: boolean;
  seat: number;
};

type Goal = {
  key: string;
  pathTo: { x: number; y: number };
  draw: { x: number; y: number };
  mode: PoseMode;
  act: Spot["act"] | "";
  spot: number | null;
};

type Walker = {
  x: number;
  y: number;
  goalKey: string;
  path: { x: number; y: number }[];
  length: number;
  dist: number;
  pause: number;
  spot: number | null;
  lastSpot: number;
  rng: number;
  drawX: number;
  drawY: number;
};

export type Sim = {
  walkers: Map<string, Walker>;
};

export type Placement = {
  visible: StudioAgent[];
  hidden: StudioAgent[];
  seatOf: Map<string, number>;
  poses: Map<string, Pose>;
};

function nextRand(seed: number): { value: number; seed: number } {
  const next = (seed * 16807) % 2147483647;
  return { value: next / 2147483647, seed: next };
}

function seedFor(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const positive = (hash >>> 0) % 2147483646;
  return positive + 1;
}

function rankAgents(agents: StudioAgent[]): StudioAgent[] {
  return [...agents].sort((a, b) => PRIORITY[a.state] - PRIORITY[b.state] || agents.indexOf(a) - agents.indexOf(b));
}

export function assignSeats(layout: RoomLayout, agents: StudioAgent[]): { visible: StudioAgent[]; hidden: StudioAgent[]; seatOf: Map<string, number> } {
  let visible = agents;
  let hidden: StudioAgent[] = [];
  if (agents.length > layout.seats.length) {
    const ranked = rankAgents(agents);
    const keep = new Set(ranked.slice(0, layout.seats.length).map((agent) => agent.id));
    visible = agents.filter((agent) => keep.has(agent.id));
    hidden = agents.filter((agent) => !keep.has(agent.id));
  }

  const seatOf = new Map<string, number>();
  const used = new Set<number>();
  for (const agent of visible) {
    if (agent.seat >= 0 && agent.seat < layout.seats.length && !used.has(agent.seat)) {
      seatOf.set(agent.id, agent.seat);
      used.add(agent.seat);
    }
  }
  for (const agent of visible) {
    if (seatOf.has(agent.id)) continue;
    let seat = 0;
    while (used.has(seat)) seat += 1;
    seatOf.set(agent.id, seat);
    used.add(seat);
  }
  return { visible, hidden, seatOf };
}

function meetingGoals(layout: RoomLayout, visible: StudioAgent[]): Map<string, Goal> {
  const groups = new Map<string, StudioAgent[]>();
  for (const agent of visible) {
    if (agent.state !== "meeting" || !agent.meetingId) continue;
    const group = groups.get(agent.meetingId) ?? [];
    group.push(agent);
    groups.set(agent.meetingId, group);
  }
  const goals = new Map<string, Goal>();
  const spots = layout.zones.meeting ?? [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    group.forEach((agent, index) => {
      const spot = spots[index % spots.length];
      if (!spot) return;
      goals.set(agent.id, {
        key: `meet:${agent.meetingId}:${index % spots.length}`,
        pathTo: spot.p,
        draw: { x: spot.p.x, y: spot.p.y + spot.dy },
        mode: "zone",
        act: "",
        spot: null,
      });
    });
  }
  return goals;
}

function zoneGoal(layout: RoomLayout, agent: StudioAgent, used: Record<string, number>): Goal | null {
  if (agent.state !== "planning" && agent.state !== "researching" && agent.state !== "deploying") return null;
  const spots = layout.zones[agent.state];
  if (!spots) return null;
  const index = used[agent.state] ?? 0;
  if (index >= spots.length) return null;
  used[agent.state] = index + 1;
  const spot = spots[index];
  return {
    key: `${agent.state}:${index}`,
    pathTo: spot.p,
    draw: { x: spot.p.x, y: spot.p.y + spot.dy },
    mode: "zone",
    act: "",
    spot: null,
  };
}

function seatGoal(layout: RoomLayout, seatIndex: number): Goal {
  const seat = layout.seats[seatIndex];
  return {
    key: `seat:${seatIndex}`,
    pathTo: seat.nav,
    draw: { x: seat.fx, y: seat.feet },
    mode: "seat",
    act: "",
    spot: null,
  };
}

function spotGoal(layout: RoomLayout, index: number): Goal {
  const spot = layout.spots[index];
  return {
    key: `spot:${index}`,
    pathTo: spot.p,
    draw: { x: spot.p.x, y: spot.p.y + spot.dy },
    mode: "walk",
    act: spot.act,
    spot: index,
  };
}

function ensureWalker(sim: Sim, id: string, goal: Goal): Walker {
  const existing = sim.walkers.get(id);
  if (existing) return existing;
  const created: Walker = {
    x: goal.draw.x,
    y: goal.draw.y,
    goalKey: goal.key,
    path: [],
    length: 0,
    dist: 0,
    pause: 0.8 + (seedFor(id) % 17) / 10,
    spot: null,
    lastSpot: -1,
    rng: seedFor(id),
    drawX: goal.draw.x,
    drawY: goal.draw.y,
  };
  sim.walkers.set(id, created);
  return created;
}

function beginPath(layout: RoomLayout, walker: Walker, goal: Goal) {
  if (walker.goalKey === goal.key && walker.path.length) return;
  const path = findPath(layout, { x: walker.x, y: walker.y }, goal.pathTo);
  walker.path = path;
  walker.length = pathLength(path);
  walker.dist = 0;
  walker.goalKey = goal.key;
  walker.drawX = goal.draw.x;
  walker.drawY = goal.draw.y;
  walker.spot = goal.spot;
}

function settle(walker: Walker, goal: Goal) {
  walker.x = goal.draw.x;
  walker.y = goal.draw.y;
  walker.drawX = goal.draw.x;
  walker.drawY = goal.draw.y;
  walker.path = [];
  walker.length = 0;
  walker.dist = 0;
  walker.goalKey = goal.key;
  walker.spot = goal.spot;
}

function poseFrom(agent: StudioAgent, seat: number, walker: Walker, moving: boolean, goal: Goal, hidden: boolean): Pose {
  return {
    x: walker.x,
    y: walker.y,
    moving,
    mode: moving ? "walk" : goal.mode,
    act: moving ? "" : goal.act,
    hidden,
    seat,
  };
}

export function createSim(): Sim {
  return { walkers: new Map() };
}

/**
 * Advance everyone by `dt` seconds.
 * Walk slots cover idle wandering and trips to a zone or back to a desk.
 * Task-driven trips take the slots first. Rest spots are held by one agent.
 */
export function stepSim(
  sim: Sim,
  layout: RoomLayout,
  agents: StudioAgent[],
  dt: number,
  cap: number,
  reduce: boolean,
): Placement {
  const { visible, hidden, seatOf } = assignSeats(layout, agents);
  const meetings = meetingGoals(layout, visible);
  const zoneUse: Record<string, number> = {};
  const goals = new Map<string, Goal>();

  for (const agent of visible) {
    const seat = seatOf.get(agent.id) ?? 0;
    const meeting = meetings.get(agent.id);
    if (meeting) {
      goals.set(agent.id, meeting);
      continue;
    }
    const zone = zoneGoal(layout, agent, zoneUse);
    goals.set(agent.id, zone ?? seatGoal(layout, seat));
  }

  const poses = new Map<string, Pose>();
  if (reduce) {
    for (const agent of visible) {
      const seat = seatOf.get(agent.id) ?? 0;
      const goal = goals.get(agent.id) ?? seatGoal(layout, seat);
      const walker = ensureWalker(sim, agent.id, goal);
      settle(walker, goal);
      if (agent.state === "offline") continue;
      poses.set(agent.id, poseFrom(agent, seat, walker, false, goal, false));
    }
    return { visible, hidden, seatOf, poses };
  }

  const step = Math.min(0.05, Math.max(0, dt));
  const commuters: StudioAgent[] = [];
  const idlers: StudioAgent[] = [];

  for (const agent of visible) {
    if (agent.state === "offline") continue;
    const seat = seatOf.get(agent.id) ?? 0;
    const goal = goals.get(agent.id) ?? seatGoal(layout, seat);
    ensureWalker(sim, agent.id, goal);
    if (agent.state === "idle") idlers.push(agent);
    else {
      const walker = sim.walkers.get(agent.id)!;
      const settled = walker.goalKey === goal.key && walker.path.length === 0;
      if (!settled) commuters.push(agent);
      else settle(walker, goal);
    }
  }

  const walking = new Set<string>();
  for (const agent of commuters.slice(0, Math.max(0, cap))) walking.add(agent.id);
  for (const agent of commuters.slice(Math.max(0, cap))) {
    settle(sim.walkers.get(agent.id)!, goals.get(agent.id)!);
  }

  let slots = Math.max(0, cap - walking.size);
  const reserved = new Set<number>();
  const claim = (agent: StudioAgent) => {
    if (slots <= 0 || walking.has(agent.id)) return;
    walking.add(agent.id);
    slots -= 1;
  };

  for (const agent of idlers) {
    const walker = sim.walkers.get(agent.id)!;
    if (walker.path.length > 0) claim(agent);
  }
  for (const agent of idlers) {
    const walker = sim.walkers.get(agent.id)!;
    if (walker.path.length === 0 && walker.pause <= 0) claim(agent);
  }

  for (const agent of idlers) {
    const walker = sim.walkers.get(agent.id)!;
    if (walking.has(agent.id)) {
      if (walker.spot !== null) reserved.add(walker.spot);
      continue;
    }
    if (walker.goalKey.startsWith("spot:") || walker.path.length > 0) {
      settle(walker, seatGoal(layout, seatOf.get(agent.id) ?? 0));
      walker.spot = null;
      walker.pause = 0.8;
    }
  }

  for (const agent of visible) {
    if (agent.state === "offline") continue;
    const walker = sim.walkers.get(agent.id)!;
    const seat = seatOf.get(agent.id) ?? 0;
    const forced = goals.get(agent.id) ?? seatGoal(layout, seat);
    const idle = agent.state === "idle";

    if (!idle && walking.has(agent.id)) beginPath(layout, walker, forced);

    if (idle && walking.has(agent.id) && walker.path.length === 0 && walker.pause <= 0) {
      const roll = nextRand(walker.rng);
      walker.rng = roll.seed;
      let pick = -1;
      const start = Math.floor(roll.value * layout.spots.length);
      for (let attempt = 0; attempt < layout.spots.length; attempt += 1) {
        const index = (start + attempt) % layout.spots.length;
        if (reserved.has(index) || index === walker.lastSpot) continue;
        pick = index;
        break;
      }
      if (pick >= 0) {
        reserved.add(pick);
        walker.lastSpot = pick;
        beginPath(layout, walker, spotGoal(layout, pick));
      } else {
        walker.pause = 1.4;
      }
    }

    if (walker.path.length > 0 && walking.has(agent.id)) {
      walker.dist += WALK_SPEED * step;
      if (walker.dist >= walker.length) {
        const arrived = idle && walker.spot !== null ? spotGoal(layout, walker.spot) : forced;
        settle(walker, arrived);
        if (idle) {
          const pauseRoll = nextRand(walker.rng);
          walker.rng = pauseRoll.seed;
          walker.pause = 2.6 + pauseRoll.value * 3.4;
        }
      } else {
        const point = pointAlong(walker.path, walker.dist);
        walker.x = point.x;
        walker.y = point.y;
      }
    } else if (idle && walker.path.length === 0) {
      walker.pause = Math.max(0, walker.pause - step);
    }

    const moving = walker.path.length > 0;
    let mode: Pose["mode"] = forced.mode;
    let act: Pose["act"] = "";
    if (moving) mode = "walk";
    else if (idle && walker.spot !== null && walker.goalKey.startsWith("spot:")) {
      mode = "walk";
      act = layout.spots[walker.spot].act;
    }
    poses.set(agent.id, {
      x: walker.x,
      y: walker.y,
      moving,
      mode,
      act,
      hidden: false,
      seat,
    });
  }

  for (const id of [...sim.walkers.keys()]) {
    if (!agents.some((agent) => agent.id === id)) sim.walkers.delete(id);
  }

  return { visible, hidden, seatOf, poses };
}
