import { SKY, shirtColor, type RoomColors, type Tod } from "./colors";
import type { RoomLayout } from "./layout";
import type { Pose } from "./sim";
import type { StudioAgent } from "./types";

const PX = 3;

const BODY = ["..hhhh..", ".hhhhhh.", ".hssssh.", ".sossos.", ".ssssss.", "..ssss..", ".bbbbbb.", "bbbbbbbb", "sbbbbbbs", ".bbbbbb.", ".ll..ll.", ".ll..ll."];
const BODY_ALT = ["..hhhh..", ".hhhhhh.", ".hssssh.", ".sossos.", ".ssssss.", "..ssss..", ".bbbbbb.", "bbbbbbbb", "bbbbbbbb", "sbbbbbbs", ".ll..ll.", ".ll..ll."];
const BODY_WALK = ["..hhhh..", ".hhhhhh.", ".hssssh.", ".sossos.", ".ssssss.", "..ssss..", ".bbbbbb.", "bbbbbbbb", "sbbbbbbs", ".bbbbbb.", ".ll...l.", ".l....ll"];

const ACT_GLYPH: Record<string, string> = { window: "∿", tea: "茶", sofa: "…", shelf: "≡" };

export type SceneAgent = StudioAgent & { pose?: Pose };

type Drawable = { y: number; paint: (ctx: CanvasRenderingContext2D) => void };

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function paintAccessory(
  ctx: CanvasRenderingContext2D,
  kind: StudioAgent["kind"],
  x: number,
  y: number,
  shirt: string,
  colors: RoomColors,
) {
  if (kind === "trading") {
    rect(ctx, x + 3, y + 8, 18, 3, colors.ink);
    return;
  }
  if (kind === "x") {
    rect(ctx, x + 21, y + 15, 6, 4, colors.ink);
    return;
  }
  if (kind === "site") {
    rect(ctx, x + 1, y - 3, 20, 4, shirt);
    rect(ctx, x + 10, y - 6, 3, 3, shirt);
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

const BUBBLE_FONT = '8px "Plus Jakarta Sans", "WenQuanYi Micro Hei", sans-serif';

function bubbleSize(ctx: CanvasRenderingContext2D, text: string) {
  ctx.font = BUBBLE_FONT;
  return { w: Math.ceil(ctx.measureText(text).width) + 8, h: 13 };
}

function bubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, tone: string, colors: RoomColors) {
  const { w, h } = bubbleSize(ctx, text);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  rect(ctx, x, y, w, h, colors.surface);
  ctx.strokeStyle = tone;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.fillStyle = tone;
  ctx.textAlign = "center";
  ctx.fillText(text, x + w / 2, y + 7);
}

function paintLinux(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, reduce: boolean, colors: RoomColors) {
  rect(ctx, x, y, 56, 100, "#1d2a30");
  for (let row = 0; row < 7; row += 1) {
    rect(ctx, x + 4, y + 6 + row * 13, 48, 10, "#2b3a41");
    for (let led = 0; led < 3; led += 1) {
      const on = reduce || (frame + row * 2 + led * 5) % 7 < 4;
      rect(ctx, x + 8 + led * 6, y + 10 + row * 13, 3, 2, on ? "#7fd1a8" : "#41545c");
    }
    rect(ctx, x + 30, y + 10 + row * 13, 18, 2, "#41545c");
  }
}

function paintWindows(ctx: CanvasRenderingContext2D, x: number, y: number, colors: RoomColors, dark: boolean) {
  rect(ctx, x, y + 18, 16, 48, "#243038");
  rect(ctx, x + 3, y + 24, 10, 3, colors.line);
  rect(ctx, x + 5, y + 32, 6, 6, colors.accent);
  rect(ctx, x + 4, y + 56, 8, 3, "#7fd1a8");
  rect(ctx, x + 20, y, 56, 40, colors.ink);
  rect(ctx, x + 23, y + 3, 50, 30, dark ? "#123044" : "#d5e4ea");
  rect(ctx, x + 23, y + 3, 50, 6, colors.accent);
  rect(ctx, x + 26, y + 12, 20, 16, colors.surface);
  rect(ctx, x + 50, y + 12, 20, 16, colors.paper);
  rect(ctx, x + 23, y + 33, 50, 4, colors.muted);
  rect(ctx, x + 26, y + 34, 8, 2, colors.surface);
  rect(ctx, x + 44, y + 40, 8, 8, colors.metal);
  rect(ctx, x + 30, y + 48, 36, 4, colors.metal);
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
  teaLabel: string,
) {
  const draws: Drawable[] = [];
  const overlay: { x: number; y: number; text: string; tone: string }[] = [];

  layout.seats.forEach((seat) => {
    const desk = layout.desks[seat.desk];
    draws.push({
      y: desk.y + 1,
      paint: (c) => {
        rect(c, seat.fx - 9, desk.y - 10, 18, 14, colors.metal);
        rect(c, seat.fx - 7, desk.y - 8, 14, 9, colors.line);
      },
    });
  });

  layout.desks.forEach((desk) => {
    draws.push({
      y: desk.y + 18,
      paint: (c) => {
        rect(c, desk.x, desk.y, desk.w, 5, colors.wood);
        rect(c, desk.x, desk.y + 5, desk.w, 13, colors.woodD);
        desk.seats.forEach((sx) => {
          const seatIndex = layout.seats.findIndex((seat) => seat.desk === layout.desks.indexOf(desk) && seat.fx === desk.x + sx);
          const owner = agents.find((agent) => agent.pose?.seat === seatIndex);
          const here = !!owner?.pose && owner.pose.mode === "seat" && !owner.pose.moving && owner.state === "working";
          const mx = desk.x + sx + 12;
          const my = desk.y - 18;
          const screen = here ? colors.accent : owner ? colors.line : dark ? "#05121a" : "#45566a";
          rect(c, mx, my, 20, 14, colors.ink);
          rect(c, mx + 2, my + 2, 16, 10, screen);
          if (here) {
            for (let row = 0; row < 3; row += 1) {
              const width = 4 + ((frame + row * 3) % 4) * 3;
              rect(c, mx + 4, my + 4 + row * 3, reduce ? 10 : width, 1, colors.surface);
            }
          }
          rect(c, mx + 8, my + 14, 4, 4, colors.ink);
        });
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

  layout.machines.forEach((machine) => {
    draws.push({
      y: machine.y + machine.h,
      paint: (c) => {
        if (machine.kind === "linux") paintLinux(c, machine.x, machine.y, frame, reduce, colors);
        else paintWindows(c, machine.x, machine.y, colors, dark);
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
      c.fillText(teaLabel, tea.x + 30, tea.y + 24);
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
    if (!pose) return;
    const moving = pose.moving;
    const bob = agent.state === "chatting" && pose.mode === "chat" && !moving && !reduce && frame % 10 < 5 ? 1 : 0;
    const twitch = !reduce && !moving && agent.state !== "idle" && frame % 8 >= 4;
    const rows = moving ? (frame % 2 ? BODY_WALK : BODY) : twitch ? BODY_ALT : BODY;
    const shirt = shirtColor(agent.hue, dark);
    const sx = Math.round(pose.x - 12);
    const sy = Math.round(pose.y - 36 - bob);
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
        c.save();
        c.translate(pose.x, 0);
        c.scale(pose.face || 1, 1);
        c.translate(-pose.x, 0);
        paintPixels(c, rows, sx, sy, colors, shirt);
        paintAccessory(c, agent.kind, sx, sy, shirt, colors);
        c.restore();
      },
    });

    let glyph = "";
    if (agent.state === "working" && pose.mode === "seat" && !moving) glyph = reduce || frame % 8 < 5 ? "▸" : "▹";
    else if (agent.state === "chatting" && pose.mode === "chat" && !moving) glyph = "…";
    else if (!moving && pose.act) glyph = ACT_GLYPH[pose.act] ?? "";
    if (glyph) {
      const size = bubbleSize(ctx, glyph);
      const lift = agent.state === "chatting" && agent.seat % 2 === 1 ? 14 : 0;
      overlay.push({
        x: pose.x - size.w / 2,
        y: sy - 16 - lift,
        text: glyph,
        tone: agent.state === "working" ? colors.accent : colors.ink,
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

  if (sky.dim > 0) {
    ctx.save();
    ctx.globalAlpha = dark ? sky.dim * 0.6 : sky.dim;
    rect(ctx, 0, 0, layout.w, layout.h, "#050a19");
    ctx.restore();
  }

  overlay.forEach((item) => bubble(ctx, item.x, item.y, item.text, item.tone, colors));
}
