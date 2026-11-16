import { AGENT_IDS, type AgentId, type AgentState, idleStatus } from "./agents";

/** No beat inside this window means the public page shows idle. */
export const IDLE_AFTER_MS = 120_000;

export const STATUS_BLOB_PATH = "agent-status.json";

export type StoredBeat = {
  state: Exclude<AgentState, "idle">;
  lastBeat: string;
};

export type StatusDoc = Partial<Record<AgentId, StoredBeat>>;

export function parseStatusDoc(value: unknown): StatusDoc {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  const doc: StatusDoc = {};
  for (const id of AGENT_IDS) {
    const entry = source[id];
    if (!entry || typeof entry !== "object") continue;
    const state = (entry as { state?: unknown }).state;
    const lastBeat = (entry as { lastBeat?: unknown }).lastBeat;
    if (state !== "working" && state !== "chatting") continue;
    if (typeof lastBeat !== "string" || !Number.isFinite(Date.parse(lastBeat))) continue;
    doc[id] = { state, lastBeat };
  }
  return doc;
}

/** Public payload. Timestamps never leave the server. */
export function derivePublicStatus(doc: StatusDoc, now: number): Record<AgentId, AgentState> {
  const out = idleStatus();
  for (const id of AGENT_IDS) {
    const beat = doc[id];
    if (!beat) continue;
    if (now - Date.parse(beat.lastBeat) >= IDLE_AFTER_MS) continue;
    out[id] = beat.state;
  }
  return out;
}

export function applyBeat(doc: StatusDoc, agent: AgentId, state: AgentState, now: number): StatusDoc {
  const next: StatusDoc = { ...doc };
  if (state === "idle") {
    delete next[agent];
    return next;
  }
  next[agent] = { state, lastBeat: new Date(now).toISOString() };
  return next;
}
