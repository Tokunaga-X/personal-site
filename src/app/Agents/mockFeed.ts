import type { AgentState, StudioAgent, StudioEvent, StudioFeed, StudioSnapshot } from "./types";

type Lang = "zh" | "en";
type Copy = { zh: string; en: string };

type InternalAgent = {
  id: string;
  alias: string;
  kind: StudioAgent["kind"];
  hue: number;
  seat: number;
  state: AgentState;
  task: Copy | null;
  meetingId?: string;
  since: string;
  progress?: number;
  role?: StudioAgent["role"];
  parentId?: string;
};

type AgentSeed = Omit<InternalAgent, "since">;

type Phase = {
  /** Seconds from the start of the loop. */
  t: number;
  patch?: Record<
    string,
    Partial<Pick<InternalAgent, "state" | "meetingId" | "progress" | "role" | "parentId">> & {
      task?: Copy | null;
      clearMeeting?: boolean;
    }
  >;
  handoff?: { from: string; to: string };
  message?: { id: string; text: Copy };
  spawn?: { id: string; parentId: string };
  end?: string;
};

const LOOP = 56;
/** Calm window at the loop boundary: no events fire while walkers finish up. */
const SETTLE = 2;

function agent(
  id: string,
  alias: string,
  kind: StudioAgent["kind"],
  hue: number,
  seat: number,
  state: AgentState,
  task: Copy | null,
  meetingId?: string,
): AgentSeed {
  return { id, alias, kind, hue, seat, state, task, meetingId };
}

function initial(loopStart = Date.now()): InternalAgent[] {
  const since = new Date(loopStart).toISOString();
  const seeds: AgentSeed[] = [
    agent("hub", "Hub", "hub", 0, 0, "coding", { zh: "整理一份任务说明", en: "Writing up a task note" }),
    agent("rack", "Rack", "ops", 1, 1, "deploying", { zh: "部署站点新版本", en: "Deploying the site" }),
    agent("spark", "Spark", "idea", 2, 2, "idle", null),
    agent("echo", "Echo", "social", 3, 3, "waiting_approval", { zh: "一条草稿等确认", en: "A draft needs a yes" }),
    agent("scout", "Scout", "scout", 4, 4, "researching", { zh: "读本周新出的 agent 框架", en: "Reading a new agent framework" }),
    agent("pixel", "Pixel", "site", 5, 5, "planning", { zh: "排 Agents 区块的里程碑", en: "Lining up the Agents section" }),
    agent("coder-1", "Coder-1", "coder", 6, 6, "error", { zh: "构建失败，准备重试", en: "Build failed, about to retry" }),
    agent("coder-2", "Coder-2", "coder", 6, 7, "coding", { zh: "对接 Pixel 的区块", en: "Wiring up Pixel's section" }),
  ];
  return seeds.map((seed) => ({ ...seed, since }));
}

const PHASES: Phase[] = [
  { t: 1.2, handoff: { from: "hub", to: "pixel" } },
  { t: 3.2, message: { id: "pixel", text: { zh: "收到了", en: "Got it" } } },
  {
    t: 7,
    patch: { spark: { state: "thinking", task: { zh: "一个小想法", en: "A small idea" } } },
  },
  { t: 10, handoff: { from: "spark", to: "hub" } },
  {
    t: 12,
    patch: { hub: { state: "thinking", task: { zh: "看看 Spark 的想法", en: "Looking at Spark's idea" } } },
    message: { id: "hub", text: { zh: "我看看", en: "On it" } },
  },
  {
    t: 16,
    patch: { "coder-1": { state: "coding", task: { zh: "重试构建", en: "Retrying the build" }, progress: 0.2 } },
  },
  {
    t: 20,
    patch: {
      pixel: { state: "meeting", task: { zh: "和 Coder-2 对接口", en: "Syncing an API with Coder-2" }, meetingId: "sync" },
      "coder-2": { state: "meeting", task: { zh: "和 Pixel 对接口", en: "Syncing an API with Pixel" }, meetingId: "sync" },
    },
  },
  {
    t: 26,
    patch: { scout: { state: "done", task: { zh: "笔记记完了", en: "Notes are done" } } },
    handoff: { from: "scout", to: "echo" },
  },
  {
    t: 28,
    patch: {
      pixel: { state: "coding", task: { zh: "接口对上了", en: "API lines up" }, progress: 0.3, clearMeeting: true },
      "coder-2": { state: "coding", task: { zh: "接口对上了", en: "API lines up" }, progress: 0.5, clearMeeting: true },
    },
  },
  { t: 32, message: { id: "echo", text: { zh: "还在等", en: "Still waiting" } } },
  {
    t: 34,
    patch: { pixel: { state: "coding", task: { zh: "开始写这个区块", en: "Starting the section" }, progress: 0.15 } },
  },
  {
    t: 38,
    patch: { rack: { state: "done", task: { zh: "部署好了", en: "Deploy is up" } } },
  },
  {
    t: 44,
    patch: {
      spark: { state: "idle", task: null },
      "coder-1": { state: "done", task: { zh: "构建过了", en: "Build passed" }, progress: 1 },
    },
  },
];

function publish(agent: InternalAgent, language: Lang): StudioAgent {
  const task = agent.task ? agent.task[language] : undefined;
  return {
    id: agent.id,
    alias: agent.alias,
    kind: agent.kind,
    hue: agent.hue,
    seat: agent.seat,
    state: agent.state,
    since: agent.since,
    ...(task ? { task } : {}),
    ...(agent.meetingId ? { meetingId: agent.meetingId } : {}),
    ...(agent.progress !== undefined ? { progress: agent.progress } : {}),
    ...(agent.role ? { role: agent.role } : {}),
    ...(agent.parentId ? { parentId: agent.parentId } : {}),
  };
}

/**
 * Local stand-in for the studio feed. It walks a fixed timeline so the room
 * keeps changing, and it only ever exposes the whitelisted snapshot fields.
 */
export function previewSnapshot(language: Lang): StudioSnapshot {
  return { agents: initial().map((item) => publish(item, language)) };
}

export function createMockFeed(): StudioFeed {
  let cycleStart = performance.now();
  let cycleEpoch = Date.now();
  let agents = initial(cycleEpoch);
  let cursor = -1;
  let settling = false;
  let settleUntil = 0;
  type Stored =
    | { type: "state.change"; at: number; id: string; state: AgentState; task: Copy | null }
    | { type: "handoff"; at: number; from: string; to: string }
    | { type: "message"; at: number; id: string; text: Copy }
    | { type: "subagent.spawn"; at: number; id: string; parentId: string }
    | { type: "subagent.end"; at: number; id: string };

  const events: Stored[] = [];
  const listeners = new Set<() => void>();
  let timer = 0;

  const emit = (event: Stored) => {
    events.push(event);
    if (events.length > 40) events.shift();
  };

  const apply = (phase: Phase, at: number) => {
    if (phase.patch) {
      for (const [id, patch] of Object.entries(phase.patch)) {
        const target = agents.find((item) => item.id === id);
        if (!target) continue;
        if (patch.state) target.state = patch.state;
        if (patch.task !== undefined) target.task = patch.task;
        if (patch.clearMeeting) delete target.meetingId;
        else if (patch.meetingId) target.meetingId = patch.meetingId;
        if (patch.progress !== undefined) target.progress = patch.progress;
        if (patch.role) target.role = patch.role;
        if (patch.parentId) target.parentId = patch.parentId;
        target.since = new Date(at).toISOString();
        emit({ type: "state.change", at, id, state: target.state, task: target.task });
      }
    }
    if (phase.handoff) emit({ type: "handoff", at, from: phase.handoff.from, to: phase.handoff.to });
    if (phase.message) emit({ type: "message", at, id: phase.message.id, text: phase.message.text });
    if (phase.spawn) emit({ type: "subagent.spawn", at, id: phase.spawn.id, parentId: phase.spawn.parentId });
    if (phase.end) emit({ type: "subagent.end", at, id: phase.end });
  };

  const tick = () => {
    let changed = false;

    if (settling) {
      if (Date.now() < settleUntil) return;
      cycleStart = performance.now();
      cycleEpoch = Date.now();
      agents = initial(cycleEpoch);
      cursor = -1;
      settling = false;
      changed = true;
    } else {
      const t = (performance.now() - cycleStart) / 1000;
      if (t >= LOOP) {
        settling = true;
        settleUntil = Date.now() + SETTLE * 1000;
        return;
      }
      while (cursor + 1 < PHASES.length && PHASES[cursor + 1].t <= t) {
        cursor += 1;
        const phase = PHASES[cursor];
        apply(phase, cycleEpoch + phase.t * 1000);
        changed = true;
      }
    }

    if (changed) listeners.forEach((listener) => listener());
  };

  timer = window.setInterval(tick, 400);

  return {
    demo: true,
    getSnapshot(language) {
      return { agents: agents.map((item) => publish(item, language)) };
    },
    getEvents(language) {
      return events.map((event): StudioEvent => {
        if (event.type === "state.change") {
          const task = event.task ? event.task[language] : undefined;
          return { type: "state.change", at: event.at, id: event.id, state: event.state, ...(task ? { task } : {}) };
        }
        if (event.type === "message") return { type: "message", at: event.at, id: event.id, text: event.text[language] };
        return event;
      });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      window.clearInterval(timer);
      listeners.clear();
    },
  };
}
