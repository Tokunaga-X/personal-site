export type Tod = "morning" | "noon" | "dusk" | "night";

export type RoomColors = {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  skin: string;
  hair: string;
  warn: string;
  err: string;
  leaf: string;
  pot: string;
  wall: string;
  wain: string;
  floor: string;
  plank: string;
  wood: string;
  woodD: string;
  paper: string;
  metal: string;
};

/** Site palette slots. Coding agents all use the last one so they read as one role. */
export const HUES_LIGHT = ["#087c91", "#9a6a2c", "#5e7f45", "#7d5a8c", "#46689a", "#a4603f", "#2f6b5c"];
export const HUES_DARK = ["#89c9cb", "#d8b07a", "#a9c98a", "#c3a3d1", "#9fb8e0", "#e0a283", "#7fbfa9"];

export function shanghaiHour(now = new Date()): number {
  try {
    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Shanghai",
        hour: "numeric",
        hour12: false,
      }).format(now),
    );
    if (Number.isFinite(hour)) return hour % 24;
  } catch {
    /* fall through */
  }
  return now.getHours();
}

export function timeOfDay(hour = shanghaiHour()): Tod {
  if (hour >= 5 && hour < 10) return "morning";
  if (hour >= 10 && hour < 16) return "noon";
  if (hour >= 16 && hour < 19) return "dusk";
  return "night";
}

export const SKY: Record<
  Tod,
  {
    sky: string;
    sky2: string;
    lake: string;
    hill: string;
    pagoda: string;
    sun: string;
    sx: number;
    sy: number;
    light: number;
    dim: number;
  }
> = {
  morning: { sky: "#f2d9b3", sky2: "#d8e6df", lake: "#9cc0c2", hill: "#86a299", pagoda: "#56695f", sun: "#fff0c4", sx: 186, sy: 34, light: 0.2, dim: 0 },
  noon: { sky: "#c9e3ea", sky2: "#e6f1ee", lake: "#86b8bf", hill: "#73968a", pagoda: "#4a5f58", sun: "#fffbe8", sx: 236, sy: 18, light: 0.24, dim: 0 },
  dusk: { sky: "#e79c70", sky2: "#f2c693", lake: "#b48577", hill: "#6a5458", pagoda: "#3a2e38", sun: "#f9b47c", sx: 300, sy: 38, light: 0.16, dim: 0.06 },
  night: { sky: "#141f3a", sky2: "#22335a", lake: "#1b2c48", hill: "#101a2d", pagoda: "#0a1120", sun: "#f4e3b0", sx: 194, sy: 20, light: 0, dim: 0.2 },
};

export function readRoomColors(dark: boolean): RoomColors {
  const css = getComputedStyle(document.documentElement);
  const pick = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    bg: pick("--bg", dark ? "#091b25" : "#faf6ed"),
    surface: pick("--surface", dark ? "#102833" : "#fffaf1"),
    ink: pick("--text", dark ? "#f1eee5" : "#183b40"),
    muted: pick("--muted", dark ? "#c4d8d3" : "#31565b"),
    line: pick("--line", dark ? "#28404a" : "#d8dfd8"),
    accent: pick("--accent", dark ? "#89c9cb" : "#087c91"),
    skin: dark ? "#e9cfae" : "#e9c9a4",
    hair: dark ? "#c4d8d3" : "#183b40",
    warn: dark ? "#f0a35e" : "#c8702a",
    err: dark ? "#e07a6a" : "#b8483a",
    leaf: dark ? "#7fa86a" : "#5e7f45",
    pot: dark ? "#b07a5a" : "#a4603f",
    wall: dark ? "#12303b" : "#f3ead8",
    wain: dark ? "#0e2833" : "#e7dbc2",
    floor: dark ? "#0e2832" : "#ecdfc6",
    plank: dark ? "#15333e" : "#dfcfb2",
    wood: dark ? "#5d4a38" : "#c9a57a",
    woodD: dark ? "#463729" : "#a7825a",
    paper: dark ? "#d9e3df" : "#fffdf7",
    metal: dark ? "#3a525c" : "#7c8f93",
  };
}

export function shirtColor(hue: number, dark: boolean): string {
  const palette = dark ? HUES_DARK : HUES_LIGHT;
  const index = ((hue % palette.length) + palette.length) % palette.length;
  return palette[index];
}
