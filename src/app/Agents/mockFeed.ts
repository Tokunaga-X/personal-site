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
};

type Phase = {
  /** Seconds from the start of the loop. */
  t: number;
  patch?: Record<string, Partial<Pick<InternalAgent, "state" | "meetingId">> & { task?: Copy | null; clearMeeting?: boolean }>;
  handoff?: { from: string; to: string };
  message?: { id: string; text: Copy };
  spawn?: { id: string; parentId: string };
  end?: string;
};

const LOOP = 52;

function agent(
  id: string,
  alias: string,
  kind: StudioAgent["kind"],
  hue: number,
  seat: number,
  state: AgentState,
  task: Copy | null,
  meetingId?: string,
): InternalAgent {
  return { id, alias, kind, hue, seat, state, task, meetingId };
}

function initial(): InternalAgent[] {
  return [
    agent("hub", "Hub", "hub", 0, 0, "coding", { zh: "整理一份任务说明", en: "Writing up a task note" }),
    agent("rack", "Rack", "ops", 1, 1, "deploying", { zh: "部署站点新版本", en: "Deploying the site" }),
    agent("spark", "Spark", "idea", 2, 2, "idle", null),
    agent("echo", "Echo", "social", 3, 3, "waiting_approval", { zh: "一条草稿等确认", en: "A draft needs a yes" }),
    agent("scout", "Scout", "scout", 4, 4, "researching", { zh: "读本周新出的 agent 框架", en: "Reading a new agent framework" }),
    agent("pixel", "Pixel", "site", 5, 5, "planning", { zh: "排 Agents 区块的里程碑", en: "Lining up the Agents section" }),
    agent("coder-1", "Coder-1", "coder", 6, 6, "error", { zh: "构建失败，准备重试", en: "Build failed, about to retry" }),
    agent("coder-2", "Coder-2", "coder", 6, 7, "meeting", { zh: "和 Coder-3 对接口", en: "Syncing an API with Coder-3" }, "sync"),
    agent("coder-3", "Coder-3", "coder", 6, 8, "meeting", { zh: "和 Coder-2 对接口", en: "Syncing an API with Coder-2" }, "sync"),
    agent("coder-4", "Coder-4", "coder", 6, 9, "idle", null),
    agent("coder-5", "Coder-5", "coder", 6, 10, "thinking", { zh: "看着构建日志", en: "Watching the build log" }),
    agent("coder-6", "Coder-6", "coder", 6, 11, "offline", null),
  ];
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
    patch: { "coder-1": { state: "coding", task: { zh: "重试构建", en: "Retrying the build" } } },
  },
  {
    t: 19,
    patch: { "coder-6": { state: "coding", task: { zh: "补一个测试", en: "Adding a test" } } },
    spawn: { id: "coder-6", parentId: "coder-1" },
  },
  {
    t: 24,
    patch: { scout: { state: "done", task: { zh: "笔记记完了", en: "Notes are done" } } },
    handoff: { from: "scout", to: "echo" },
  },
  {
    t: 28,
    patch: {
      "coder-2": { state: "coding", task: { zh: "接口对上了", en: "API lines up" }, clearMeeting: true },
      "coder-3": { state: "coding", task: { zh: "接口对上了", en: "API lines up" }, clearMeeting: true },
    },
  },
  { t: 32, message: { id: "echo", text: { zh: "还在等", en: "Still waiting" } } },
  {
    t: 34,
    patch: { pixel: { state: "coding", task: { zh: "开始写这个区块", en: "Starting the section" } } },
  },
  {
    t: 38,
    patch: { rack: { state: "done", task: { zh: "部署好了", en: "Deploy is up" } } },
  },
  {
    t: 42,
    patch: { "coder-6": { state: "offline", task: null } },
    end: "coder-6",
  },
  {
    t: 44,
    patch: {
      spark: { state: "idle", task: null },
      "coder-1": { state: "done", task: { zh: "构建过了", en: "Build passed" } },
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
    ...(task ? { task } : {}),
    ...(agent.meetingId ? { meetingId: agent.meetingId } : {}),
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
  let agents = initial();
  let cursor = -1;
  let lastT = 0;
  type Stored =
    | { type: "state.change"; at: number; id: string; state: AgentState; task: Copy | null }
    | { type: "handoff"; at: number; from: string; to: string }
    | { type: "message"; at: number; id: string; text: Copy }
    | { type: "subagent.spawn"; at: number; id: string; parentId: string }
    | { type: "subagent.end"; at: number; id: string };

  const events: Stored[] = [];
  const listeners = new Set<() => void>();
  const started = performance.now();
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
        emit({ type: "state.change", at, id, state: target.state, task: target.task });
      }
    }
    if (phase.handoff) emit({ type: "handoff", at, from: phase.handoff.from, to: phase.handoff.to });
    if (phase.message) emit({ type: "message", at, id: phase.message.id, text: phase.message.text });
    if (phase.spawn) emit({ type: "subagent.spawn", at, id: phase.spawn.id, parentId: phase.spawn.parentId });
    if (phase.end) emit({ type: "subagent.end", at, id: phase.end });
  };

  const tick = () => {
    const elapsed = (performance.now() - started) / 1000;
    const t = elapsed % LOOP;
    const at = Date.now();
    let changed = false;
    if (t < lastT) {
      agents = initial();
      cursor = -1;
      changed = true;
    }
    while (cursor + 1 < PHASES.length && PHASES[cursor + 1].t <= t) {
      cursor += 1;
      apply(PHASES[cursor], at);
      changed = true;
    }
    lastT = t;
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
