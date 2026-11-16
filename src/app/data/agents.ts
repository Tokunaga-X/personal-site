/**
 * Studio roster. Edit this file to change who appears in the Agents room.
 *
 * Coordinates are pixels in the 520×320 studio.
 * Schedule labels are times only — never task contents. The public page
 * shows these strings as-is.
 *
 * AGENT_IDS is repeated in api/agents.js. That file is CommonJS so the
 * Vercel function does not depend on the app's ESM TypeScript build.
 */

export const AGENT_IDS = ["site", "general", "x", "trading"] as const;

export type AgentId = (typeof AGENT_IDS)[number];

export type AgentState = "working" | "chatting" | "idle";

export type Localized = { zh: string; en: string };

export type AgentSchedule = {
  label: Localized;
};

export type StudioBot = {
  id: AgentId;
  name: Localized;
  /** Top-left of this bot's desk. */
  desk: { x: number; y: number };
  intro: Localized;
  schedule: AgentSchedule[];
  /** Index into the site palette. */
  hue: number;
};

export type StudioServer = {
  id: "hostinger" | "tencent";
  name: Localized;
  intro: Localized;
  kind: "linux" | "windows";
  x: number;
  y: number;
  w: number;
  h: number;
};

export const BOTS: readonly StudioBot[] = [
  {
    id: "site",
    name: { zh: "个人网站bot", en: "Site bot" },
    desk: { x: 18, y: 118 },
    hue: 0,
    intro: {
      zh: "我管几个小网站，从改代码到上线都归我。你在页面上看到的变化，多半是我改的。",
      en: "I look after a few small sites, from the edit to the deploy. If something on this page changed, it was probably me.",
    },
    schedule: [
      { label: { zh: "每天 09:00", en: "Daily 09:00" } },
      { label: { zh: "每周日 22:00", en: "Sundays 22:00" } },
    ],
  },
  {
    id: "general",
    name: { zh: "通用任务bot", en: "General bot" },
    desk: { x: 114, y: 118 },
    hue: 1,
    intro: {
      zh: "杂事都找我：查资料、整理笔记、记提醒。哪件事没人管，最后就落到我这儿。",
      en: "Odd jobs land here. Look something up, tidy a note, set a reminder. If nobody else has it, I do.",
    },
    schedule: [],
  },
  {
    id: "x",
    name: { zh: "X-bot", en: "X bot" },
    desk: { x: 18, y: 196 },
    hue: 3,
    intro: {
      zh: "我在 X 上帮忙看看动态、整理有意思的帖子，偶尔起个草稿，发不发由主人决定。",
      en: "I watch X, pull out posts worth keeping, and sometimes draft one. Posting is still the owner's call.",
    },
    schedule: [],
  },
  {
    id: "trading",
    name: { zh: "trading bot", en: "Trading bot" },
    desk: { x: 114, y: 196 },
    hue: 4,
    intro: {
      zh: "我盯行情，有异动就提醒。我只看不碰，下单永远是人来。",
      en: "I watch the market and say when something moves. I don't touch the account. A person always places the order.",
    },
    schedule: [],
  },
];

export const SERVERS: readonly StudioServer[] = [
  {
    id: "hostinger",
    name: { zh: "Hostinger VPS", en: "Hostinger VPS" },
    kind: "linux",
    x: 452,
    y: 36,
    w: 56,
    h: 108,
    intro: {
      zh: "一台老服务器，以前跑过好几个站，现在主要存备份，偶尔还担点活。",
      en: "An old server. It used to run a few sites. Now it mostly keeps backups, and still takes a job now and then.",
    },
  },
  {
    id: "tencent",
    name: { zh: "腾讯云 Windows", en: "Tencent Cloud Windows" },
    kind: "windows",
    x: 392,
    y: 168,
    w: 78,
    h: 70,
    intro: {
      zh: "我是一台 Windows 机器，专门跑脚本和浏览器自动化，那些重复点来点去的活都在我这儿。",
      en: "A Windows machine. I run scripts and browser automation, the work that's the same clicks over and over.",
    },
  },
];

export function isAgentId(value: unknown): value is AgentId {
  return typeof value === "string" && (AGENT_IDS as readonly string[]).includes(value);
}

export function isAgentState(value: unknown): value is AgentState {
  return value === "working" || value === "chatting" || value === "idle";
}

export function idleStatus(): Record<AgentId, AgentState> {
  return { site: "idle", general: "idle", x: "idle", trading: "idle" };
}
