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
      zh: "负责个人站及 notes、words、todos 的开发、部署和维护。",
      en: "Develops, deploys, and maintains the personal site along with notes, words, and todos.",
    },
    schedule: [{ label: { zh: "每周日 22:00", en: "Sundays 22:00" } }],
  },
  {
    id: "general",
    name: { zh: "通用任务bot", en: "General bot" },
    desk: { x: 114, y: 118 },
    hue: 1,
    intro: {
      zh: "处理日常事务、邮件筛选、资料调研与信息整理。",
      en: "Handles daily tasks, email triage, research, and information organization.",
    },
    schedule: [
      { label: { zh: "每月单数日 20:00", en: "Odd days 20:00" } },
      { label: { zh: "每周五 23:00", en: "Fridays 23:00" } },
    ],
  },
  {
    id: "x",
    name: { zh: "X-bot", en: "X-bot" },
    desk: { x: 18, y: 196 },
    hue: 3,
    intro: {
      zh: "负责 X 内容检索、收藏整理、翻译解读，以及帖子、回复和私信草稿。",
      en: "Handles X content search, bookmark curation, translation and commentary, plus post, reply, and DM drafts.",
    },
    schedule: [],
  },
  {
    id: "trading",
    name: { zh: "dr eggbot v2", en: "dr eggbot v2" },
    desk: { x: 114, y: 196 },
    hue: 4,
    intro: {
      zh: "设计和创建职责清晰的 Bot，并检查团队对话与定时任务的运行情况。",
      en: "Designs and creates bots with well-defined roles, and monitors team conversations and scheduled task runs.",
    },
    schedule: [
      { label: { zh: "工作日 08:44", en: "Weekdays 08:44" } },
      { label: { zh: "每周一 08:49", en: "Mondays 08:49" } },
    ],
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
