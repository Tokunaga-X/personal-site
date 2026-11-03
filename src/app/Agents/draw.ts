import { SKY, shirtColor, type RoomColors, type Tod } from "./colors";
import type { RoomLayout } from "./layout";
import type { Pose } from "./sim";
import type { AgentKind, AgentState, StudioAgent } from "./types";

const PX = 3;

const BODY = ["..hhhh..", ".hhhhhh.", ".hssssh.", ".sossos.", ".ssssss.", "..ssss..", ".bbbbbb.", "bbbbbbbb", "sbbbbbbs", ".bbbbbb.", ".ll..ll.", ".ll..ll."];
const BODY_ALT = ["..hhhh..", ".hhhhhh.", ".hssssh.", ".sossos.", ".ssssss.", "..ssss..", ".bbbbbb.", "bbbbbbbb", "bbbbbbbb", "sbbbbbbs", ".ll..ll.", ".ll..ll."];
const BODY_WALK = ["..hhhh..", ".hhhhhh.", ".hssssh.", ".sossos.", ".ssssss.", "..ssss..", ".bbbbbb.", "bbbbbbbb", "sbbbbbbs", ".bbbbbb.", ".ll...l.", ".l....ll"];

const GLYPH: Record<AgentState, string> = {
  idle: "z",
  thinking: "…",
  coding: "</>",
  executing: ">_",
  researching: "?",
  planning: "✎",
  deploying: "↑",
  meeting: "…",
  waiting_approval: "!",
  error: "×",
  done: "✓",
  offline: "",
};

const ACT_GLYPH: Record<string, string> = { window: "∿", tea: "茶", sofa: "…", plant: "✿", rug: "~" };

export type SceneAgent = StudioAgent & { pose?: Pose };

export type NoteFlight = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** 0–1 while flying, above 1 once the note has landed. */
  u: number;
};

export type Speech = { x: number; y: number; text: string };

type Drawable = { y: number; paint: (ctx: CanvasRenderingContext2D) => void };

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function accessoryFor(kind: AgentKind): "clip" | "hat" | "bulb" | "bird" | "goggles" | "beret" | "headset" {
  switch (kind) {
    case "hub":
      return "clip";
    case "ops":
      return "hat";
    case "idea":
      return "bulb";
    case "social":
      return "bird";
    case "scout":
      return "goggles";
    case "site":
      return "beret";
    case "coder":
      return "headset";
  }
}

function paintAccessory(
  ctx: CanvasRenderingContext2D,
  kind: AgentKind,
  x: number,
  y: number,
  shirt: string,
  colors: RoomColors,
) {
  const acc = accessoryFor(kind);
  if (acc === "hat") {
    rect(ctx, x, y - 3, 24, 6, "#d9a521");
    return;
  }
  if (acc === "bulb") {
    rect(ctx, x + 9, y - 12, 6, 6, "#e8c547");
    rect(ctx, x + 10, y - 6, 4, 2, colors.muted);
    return;
  }
  if (acc === "bird") {
    rect(ctx, x + 21, y + 15, 6, 4, colors.ink);
    return;
  }
  if (acc === "goggles") {
    rect(ctx, x + 3, y + 8, 18, 3, colors.ink);
    return;
  }
  if (acc === "beret") {
    rect(ctx, x + 1, y - 3, 20, 4, shirt);
    rect(ctx, x + 10, y - 6, 3, 3, shirt);
    return;
  }
  if (acc === "headset") {
    rect(ctx, x + 2, y - 2, 20, 2, colors.ink);
    rect(ctx, x, y + 6, 3, 7, colors.ink);
    rect(ctx, x + 21, y + 6, 3, 7, colors.ink);
    return;
  }
  rect(ctx, x + 22, y + 20, 7, 9, colors.surface);
  ctx.strokeStyle = colors.muted;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 22.5, y + 20.5, 6, 8);
}

function paintPixels(ctx: CanvasRenderingContext2D, rows: string[], ox: number, oy: number, colors: RoomColors, shirt: string) {
  rows.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx += 1) {
      const cell = row[rx];
      const fill =
        cell === "h" ? colors.hair : cell === "s" ? colors.skin : cell === "o" ? colors.ink : cell === "b" ? shirt : cell === "l" ? colors.muted : "";
      if (!fill) continue;
      rect(ctx, ox + rx * PX, oy + ry * PX, PX, PX, fill);
    }
  });
}

export function paintShell(ctx: CanvasRenderingContext2D, layout: RoomLayout, colors: RoomColors, tod: Tod, dark: boolean) {
  const sky = SKY[tod];
  const width = layout.w;
  rect(ctx, 0, 0, width, 74, colors.wall);
  rect(ctx, 0, 54, width, 20, colors.wain);
  rect(ctx, 0, 74, width, layout.h - 74, colors.floor);
  for (let i = 0; i < Math.ceil((layout.h - 90) / 16); i += 1) {
    rect(ctx, 0, 90 + i * 16, width, 1, colors.plank);
  }
  rect(ctx, 0, 73, width, 3, colors.woodD);

  ctx.save();
  ctx.globalAlpha = sky.light;
  ctx.fillStyle = sky.sun;
  ctx.beginPath();
  ctx.moveTo(166, 76);
  ctx.lineTo(326, 76);
  ctx.lineTo(380, 210);
  ctx.lineTo(120, 210);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.14;
  rect(ctx, layout.rug.x, layout.rug.y, layout.rug.w, layout.rug.h, colors.accent);
  ctx.restore();
  ctx.strokeStyle = colors.accent;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  ctx.strokeRect(layout.rug.x + 6, layout.rug.y + 6, layout.rug.w - 12, layout.rug.h - 12);
  ctx.globalAlpha = 1;

  rect(ctx, 14, 12, 100, 48, colors.metal);
  rect(ctx, 17, 15, 94, 40, colors.paper);
  const notes: [number, number, string][] = [
    [22, 20, colors.accent],
    [36, 22, "#d9a521"],
    [50, 20, colors.leaf],
    [24, 36, "#d9a521"],
    [64, 24, colors.pot],
  ];
  notes.forEach(([x, y, fill]) => rect(ctx, x, y, 9, 8, fill));
  rect(ctx, 80, 22, 24, 1.5, colors.muted);
  rect(ctx, 80, 28, 18, 1.5, colors.muted);
  rect(ctx, 40, 42, 50, 1.5, colors.muted);
  rect(ctx, 20, 56, 88, 3, colors.metal);

  const door = layout.door;
  rect(ctx, door.x, door.y, 30, 52, colors.woodD);
  rect(ctx, door.x + 3, door.y + 3, 24, 49, colors.wood);
  rect(ctx, door.x + 21, door.y + 26, 3, 3, colors.ink);

  rect(ctx, 164, 8, 164, 58, colors.woodD);
  rect(ctx, 168, 12, 156, 50, sky.sky);
  rect(ctx, 168, 32, 156, 12, sky.sky2);
  rect(ctx, sky.sx - 5, sky.sy - 5, 10, 10, sky.sun);
  if (tod === "night") rect(ctx, sky.sx - 1, sky.sy - 5, 6, 8, sky.sky);
  ctx.fillStyle = sky.hill;
  ctx.beginPath();
  ctx.moveTo(168, 44);
  ctx.lineTo(190, 36);
  ctx.lineTo(214, 40);
  ctx.lineTo(240, 34);
  ctx.lineTo(262, 40);
  ctx.lineTo(280, 36);
  ctx.lineTo(300, 30);
  ctx.lineTo(324, 38);
  ctx.lineTo(324, 48);
  ctx.lineTo(168, 48);
  ctx.closePath();
  ctx.fill();
  rect(ctx, 168, 46, 156, 16, sky.lake);
  ctx.fillStyle = sky.pagoda;
  const pagoda = [
    [294, 18, 2, 4],
    [291, 22, 8, 3],
    [289, 25, 12, 2],
    [290, 27, 10, 4],
    [288, 31, 14, 2],
    [289, 33, 12, 4],
    [287, 37, 16, 2],
    [288, 39, 14, 6],
  ];
  pagoda.forEach(([x, y, w, h]) => rect(ctx, x, y, w, h, sky.pagoda));
  rect(ctx, 220, 12, 3, 50, colors.woodD);
  rect(ctx, 272, 12, 3, 50, colors.woodD);
  rect(ctx, 162, 62, 168, 4, colors.wood);

  if (dark && sky.dim > 0) {
    ctx.save();
    ctx.globalAlpha = sky.dim * 0.25;
    rect(ctx, 0, 0, width, layout.h, "#050a19");
    ctx.restore();
  }
}

function paintPlant(ctx: CanvasRenderingContext2D, x: number, y: number, big: boolean, colors: RoomColors) {
  rect(ctx, x + 3, y + 6, 10, 10, colors.pot);
  rect(ctx, x + 7, y - (big ? 16 : 8), 2, big ? 22 : 14, colors.leaf);
  rect(ctx, x, y - (big ? 10 : 4), 7, 4, colors.leaf);
  rect(ctx, x + 9, y - (big ? 14 : 6), 7, 4, colors.leaf);
  rect(ctx, x + 1, y - (big ? 2 : 0), 6, 3, colors.leaf);
  rect(ctx, x + 9, y, 6, 3, colors.leaf);
}

function bubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, tone: string, colors: RoomColors) {
  ctx.font = '8px "Plus Jakarta Sans", "WenQuanYi Micro Hei", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const width = Math.ceil(ctx.measureText(text).width) + 8;
  rect(ctx, x, y, width, 13, colors.surface);
  ctx.strokeStyle = tone;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, 12);
  ctx.fillStyle = tone;
  ctx.textAlign = "center";
  ctx.fillText(text, x + width / 2, y + 7);
}

export function paintRoom(
  ctx: CanvasRenderingContext2D,
  layout: RoomLayout,
  colors: RoomColors,
  tod: Tod,
  dark: boolean,
  agents: SceneAgent[],
  frame: number,
  reduce: boolean,
  selectedId: string,
  notes: NoteFlight[],
  speeches: Speech[],
) {
  const draws: Drawable[] = [];
  const overlay: Drawable[] = [];
  const bySeat = new Map<number, SceneAgent>();
  agents.forEach((agent) => {
    if (agent.pose && !agent.pose.hidden) bySeat.set(agent.pose.seat, agent);
    else if (!agents.some((other) => other.pose?.seat === agent.seat && other.id !== agent.id)) bySeat.set(agent.seat, agent);
  });

  layout.seats.forEach((seat, index) => {
    const desk = layout.desks[seat.desk];
    if (desk.kind === "stand") return;
    const chairY = desk.y - 10;
    draws.push({
      y: desk.y + 1,
      paint: (c) => {
        rect(c, seat.fx - 9, chairY, 18, 14, colors.metal);
        rect(c, seat.fx - 7, chairY + 2, 14, 9, colors.line);
      },
    });
    void index;
  });

  layout.desks.forEach((desk) => {
    const sortY = desk.kind === "L" ? desk.y + 40 : desk.kind === "stand" ? desk.y + 30 : desk.y + 18;
    draws.push({
      y: sortY,
      paint: (c) => {
        rect(c, desk.x, desk.y, desk.w, 5, colors.wood);
        if (desk.kind === "stand") {
          rect(c, desk.x + 4, desk.y + 5, 3, 25, colors.metal);
          rect(c, desk.x + desk.w - 7, desk.y + 5, 3, 25, colors.metal);
          rect(c, desk.x, desk.y + 28, desk.w, 2, colors.metal);
        } else {
          const front = 13;
          rect(c, desk.x, desk.y + 5, desk.w, front, colors.woodD);
          if (desk.kind === "L") {
            rect(c, desk.x + desk.w - 18, desk.y + 5, 18, 22, colors.wood);
            rect(c, desk.x + desk.w - 18, desk.y + 27, 18, 13, colors.woodD);
            rect(c, desk.x + desk.w - 14, desk.y + 10, 10, 7, colors.paper);
          }
        }
        desk.seats.forEach((sx, seatOffset) => {
          const seatIndex = layout.seats.findIndex((seat) => seat.desk === layout.desks.indexOf(desk) && seat.fx === desk.x + sx);
          const owner = bySeat.get(seatIndex);
          const here = !!owner?.pose && owner.pose.mode === "seat" && !owner.pose.moving;
          const state = owner?.state ?? "offline";
          const mx = desk.x + sx + 12;
          const my = desk.y - 18;
          let screen = dark ? "#05121a" : "#31565b";
          if (here && owner) {
            if (state === "error") screen = !reduce && frame % 4 < 2 ? colors.err : "#7a2a22";
            else if (state === "coding" || state === "executing" || state === "done") screen = colors.accent;
            else if (state === "waiting_approval" || state === "thinking") screen = colors.muted;
            else screen = colors.line;
          } else if (owner && state !== "offline") screen = colors.line;
          rect(c, mx, my, 20, 14, colors.ink);
          rect(c, mx + 2, my + 2, 16, 10, screen);
          if (here && (state === "coding" || state === "executing")) {
            for (let row = 0; row < 3; row += 1) {
              const width = 4 + ((frame + row * 3 + seatOffset) % 4) * 3;
              rect(c, mx + 4, my + 4 + row * 3, width, 1, colors.surface);
            }
          }
          if (here && state === "done") rect(c, mx + 7, my + 5, 6, 4, colors.surface);
          rect(c, mx + 8, my + 14, 4, 4, colors.ink);
          if (here && state === "waiting_approval") {
            const on = reduce || frame % 6 < 3;
            rect(c, mx + 22, desk.y - 6, 7, 5, on ? colors.warn : colors.woodD);
            rect(c, mx + 24, desk.y - 8, 3, 2, colors.warn);
          }
        });
        if (desk.kind === "pair") {
          const lx = desk.x + desk.w - 9;
          rect(c, lx + 2, desk.y - 12, 2, 12, colors.ink);
          rect(c, lx - 1, desk.y - 16, 8, 5, colors.warn);
          if (tod === "night") {
            c.save();
            c.globalAlpha = 0.16;
            c.fillStyle = "#ffd98a";
            c.beginPath();
            c.arc(lx + 3, desk.y - 6, 16, 0, Math.PI * 2);
            c.fill();
            c.restore();
          }
        }
      },
    });
  });

  const shelf = layout.shelf;
  draws.push({
    y: 120,
    paint: (c) => {
      rect(c, shelf.x, shelf.y, 52, 104, colors.woodD);
      rect(c, shelf.x + 4, shelf.y + 4, 44, 96, colors.wood);
      const bookColors = [colors.accent, colors.pot, colors.leaf, colors.muted, "#d9a521", colors.line];
      for (let row = 0; row < 4; row += 1) {
        rect(c, shelf.x + 4, shelf.y + 26 + row * 24, 44, 3, colors.woodD);
        for (let book = 0; book < 6; book += 1) {
          const lift = (book + row) % 3;
          rect(c, shelf.x + 7 + book * 7, shelf.y + 10 + row * 24 + lift, 5, 16 - lift, bookColors[(book + row * 2) % bookColors.length]);
        }
      }
    },
  });

  const rackFast = agents.some((agent) => agent.state === "deploying");
  const rack = layout.rack;
  draws.push({
    y: 128,
    paint: (c) => {
      rect(c, rack.x, rack.y, 56, 100, "#1d2a30");
      for (let row = 0; row < 7; row += 1) {
        rect(c, rack.x + 4, rack.y + 6 + row * 13, 48, 10, "#2b3a41");
        for (let led = 0; led < 3; led += 1) {
          const on = reduce || (frame * (rackFast ? 3 : 1) + row * 2 + led * 5) % 7 < 4;
          const fill = on ? (led === 2 && rackFast ? colors.warn : "#7fd1a8") : "#41545c";
          rect(c, rack.x + 8 + led * 6, rack.y + 10 + row * 13, 3, 2, fill);
        }
        rect(c, rack.x + 30, rack.y + 10 + row * 13, 18, 2, "#41545c");
      }
    },
  });

  const table = layout.table;
  draws.push({
    y: table.y + 28,
    paint: (c) => {
      rect(c, table.x + 6, table.y, 72, 4, colors.wood);
      rect(c, table.x, table.y + 4, 84, 14, colors.wood);
      rect(c, table.x + 6, table.y + 18, 72, 4, colors.woodD);
      rect(c, table.x + 14, table.y + 22, 4, 8, colors.woodD);
      rect(c, table.x + 66, table.y + 22, 4, 8, colors.woodD);
      rect(c, table.x + 28, table.y + 7, 12, 7, colors.paper);
      rect(c, table.x + 48, table.y + 8, 8, 6, colors.surface);
      c.strokeStyle = colors.muted;
      c.lineWidth = 0.6;
      c.strokeRect(table.x + 48, table.y + 8, 8, 6);
    },
  });
  [20, 64].forEach((dx) => {
    draws.push({
      y: table.y - 5,
      paint: (c) => {
        const x = table.x + dx;
        rect(c, x - 8, table.y - 20, 16, 14, colors.metal);
        rect(c, x - 6, table.y - 18, 12, 9, colors.line);
      },
    });
  });

  const tea = layout.tea;
  draws.push({
    y: tea.y + 28,
    paint: (c) => {
      rect(c, tea.x, tea.y + 8, 60, 5, colors.wood);
      rect(c, tea.x + 2, tea.y + 13, 56, 16, colors.woodD);
      rect(c, tea.x + 8, tea.y, 9, 8, colors.muted);
      rect(c, tea.x + 17, tea.y + 2, 3, 3, colors.muted);
      rect(c, tea.x + 38, tea.y + 3, 5, 5, colors.paper);
      rect(c, tea.x + 46, tea.y + 3, 5, 5, colors.paper);
      c.font = '7px "WenQuanYi Micro Hei", "Plus Jakarta Sans", sans-serif';
      c.fillStyle = colors.surface;
      c.textAlign = "center";
      c.textBaseline = "alphabetic";
      c.fillText("茶水", tea.x + 30, tea.y + 24);
    },
  });

  const sofa = layout.sofa;
  draws.push({
    y: sofa.y + 20,
    paint: (c) => {
      c.save();
      c.globalAlpha = 0.75;
      rect(c, sofa.x + 6, sofa.y, 80, 16, colors.muted);
      c.globalAlpha = 0.55;
      rect(c, sofa.x + 6, sofa.y + 16, 80, 10, colors.muted);
      c.restore();
      rect(c, sofa.x, sofa.y + 8, 8, 20, colors.muted);
      rect(c, sofa.x + 84, sofa.y + 8, 8, 20, colors.muted);
    },
  });

  const coffee = layout.coffee;
  draws.push({
    y: coffee.y + 10,
    paint: (c) => {
      rect(c, coffee.x, coffee.y, 60, 4, colors.wood);
      rect(c, coffee.x + 4, coffee.y + 4, 3, 7, colors.woodD);
      rect(c, coffee.x + 53, coffee.y + 4, 3, 7, colors.woodD);
      rect(c, coffee.x + 22, coffee.y - 5, 6, 5, colors.paper);
    },
  });

  const lamp = layout.lamp;
  draws.push({
    y: lamp.y + 34,
    paint: (c) => {
      rect(c, lamp.x + 7, lamp.y + 10, 2, 60, colors.ink);
      rect(c, lamp.x + 3, lamp.y + 68, 10, 3, colors.ink);
      rect(c, lamp.x, lamp.y, 16, 10, colors.warn);
      if (tod === "night") {
        c.save();
        c.globalAlpha = 0.18;
        c.fillStyle = "#ffd98a";
        c.beginPath();
        c.arc(lamp.x + 8, lamp.y + 22, 26, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    },
  });

  layout.plants.forEach((plant) => {
    draws.push({
      y: plant.y + 16,
      paint: (c) => paintPlant(c, plant.x, plant.y, plant.big, colors),
    });
  });

  agents.forEach((agent) => {
    const pose = agent.pose;
    if (!pose || agent.state === "offline") return;
    const visualState: AgentState = pose.mode === "walk" && pose.moving ? "idle" : agent.state;
    const moving = pose.moving;
    const shake = visualState === "error" && !reduce ? (frame % 2 ? 1 : -1) : 0;
    const sx = Math.round(pose.x - 12 + shake);
    const sy = Math.round(pose.y - 36);
    const rows = moving ? (frame % 2 ? BODY_WALK : BODY) : !reduce && frame % 8 >= 4 && visualState !== "idle" ? BODY_ALT : BODY;
    const shirt = shirtColor(agent.hue, dark);
    draws.push({
      y: pose.y,
      paint: (c) => {
        if (selectedId === agent.id) {
          c.strokeStyle = colors.accent;
          c.lineWidth = 1.5;
          c.setLineDash([3, 2]);
          c.strokeRect(sx - 3, sy - 3, 30, 42);
          c.setLineDash([]);
        }
        paintPixels(c, rows, sx, sy, colors, shirt);
        if (visualState === "waiting_approval" || visualState === "planning") {
          const lift = visualState === "planning" && !reduce && frame % 6 < 3 ? 3 : 0;
          rect(c, sx + 24, sy + 6 - lift, 3, 15, colors.skin);
          if (visualState === "planning") rect(c, sx + 24, sy + 1 - lift, 3, 5, colors.accent);
        }
        if (visualState === "researching") {
          rect(c, sx + 5, sy + 21, 14, 8, colors.accent);
          rect(c, sx + (!reduce && frame % 6 < 3 ? 7 : 12), sy + 22, 5, 6, colors.paper);
        }
        if (visualState === "deploying") rect(c, sx + 4, sy + 22, 16, 7, colors.metal);
        paintAccessory(c, agent.kind, sx, sy, shirt, colors);
      },
    });

    let glyph = pose.mode === "walk" && !pose.moving ? ACT_GLYPH[pose.act] ?? "" : GLYPH[visualState];
    if (visualState === "idle" && pose.mode === "seat" && !reduce && frame % 20 > 12) glyph = "";
    if (glyph) {
      const tone = visualState === "waiting_approval" && pose.mode !== "walk" ? colors.warn : visualState === "error" ? colors.err : colors.ink;
      overlay.push({
        y: 0,
        paint: (c) => bubble(c, sx + 16, sy - 15, glyph, tone, colors),
      });
    }
  });

  draws.sort((a, b) => a.y - b.y);
  draws.forEach((item) => item.paint(ctx));

  const sky = SKY[tod];
  if (tod === "night") {
    const stars = [
      [178, 16],
      [214, 24],
      [252, 15],
      [290, 22],
      [312, 14],
      [236, 28],
    ];
    stars.forEach(([x, y], index) => {
      ctx.globalAlpha = !reduce && frame % 10 < 5 && index % 2 ? 0.4 : 0.9;
      rect(ctx, x, y, 2, 2, "#f4e3b0");
    });
    ctx.globalAlpha = 1;
  }
  if (!reduce) {
    for (let row = 0; row < 3; row += 1) {
      ctx.globalAlpha = 0.6;
      rect(ctx, 180 + row * 46 + (frame % 8), 51 + row * 3, 12, 1, sky.sky2);
    }
    ctx.globalAlpha = 1;
  }
  if (agents.some((agent) => agent.state === "planning")) {
    const nudge = !reduce && frame % 16 < 8 ? 10 : 0;
    rect(ctx, 64 + nudge, 24, 9, 8, colors.pot);
  }

  if (sky.dim > 0) {
    ctx.save();
    ctx.globalAlpha = dark ? sky.dim * 0.6 : sky.dim;
    rect(ctx, 0, 0, layout.w, layout.h, "#050a19");
    ctx.restore();
  }

  speeches.forEach((speech) => {
    bubble(ctx, speech.x - 8, speech.y - 52, speech.text, colors.accent, colors);
  });
  overlay.forEach((item) => item.paint(ctx));

  notes.forEach((note) => {
    const cx = (note.x0 + note.x1) / 2;
    const cy = Math.min(note.y0, note.y1) - 36;
    ctx.save();
    ctx.strokeStyle = colors.accent;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(note.x0, note.y0);
    ctx.quadraticCurveTo(cx, cy, note.x1, note.y1);
    ctx.stroke();
    ctx.restore();

    if (note.u < 1) {
      const t = note.u;
      const mt = 1 - t;
      const x = mt * mt * note.x0 + 2 * mt * t * cx + t * t * note.x1;
      const y = mt * mt * note.y0 + 2 * mt * t * cy + t * t * note.y1;
      ctx.save();
      ctx.translate(x, y);
      if (!reduce) ctx.rotate((((frame % 4) - 1.5) * 8 * Math.PI) / 180);
      rect(ctx, -6, -4, 12, 9, colors.paper);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-5.5, -3.5, 11, 8);
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.lineTo(0, 1);
      ctx.lineTo(6, -4);
      ctx.stroke();
      ctx.restore();
    } else {
      rect(ctx, note.x1 - 22, note.y1 + 4, 14, 11, colors.surface);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(note.x1 - 21.5, note.y1 + 4.5, 13, 10);
      rect(ctx, note.x1 - 20, note.y1 + 6, 10, 1, colors.accent);
      ctx.beginPath();
      ctx.moveTo(note.x1 - 20, note.y1 + 6);
      ctx.lineTo(note.x1 - 15, note.y1 + 10);
      ctx.lineTo(note.x1 - 10, note.y1 + 6);
      ctx.stroke();
    }
  });
}
