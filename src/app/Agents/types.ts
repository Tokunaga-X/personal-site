/**
 * Public studio data contract.
 *
 * A future real feed must only publish whitelisted, desensitized fields
 * (the shapes below — no hostnames, secrets, raw prompts, tool args, or
 * internal bot names) and must delay publication by 1–5 minutes.
 * Aliases stay the public English names in every language.
 */

export type AgentKind = "hub" | "ops" | "idea" | "social" | "scout" | "site" | "coder";

export type AgentState =
  | "idle"
  | "thinking"
  | "coding"
  | "executing"
  | "researching"
  | "planning"
  | "deploying"
  | "meeting"
  | "waiting_approval"
  | "error"
  | "done"
  | "offline";

export interface StudioAgent {
  id: string;
  alias: string;
  kind: AgentKind;
  /** Index into the studio palette (0–7), so public colors stay in the site range. */
  hue: number;
  /** Index into the room's seat list. Seats past the visible count wait behind the door. */
  seat: number;
  state: AgentState;
  task?: string;
  meetingId?: string;
}

export interface StudioSnapshot {
  agents: StudioAgent[];
}

export type StudioEvent =
  | { type: "state.change"; at: number; id: string; state: AgentState; task?: string }
  | { type: "handoff"; at: number; from: string; to: string }
  | { type: "message"; at: number; id: string; text: string }
  | { type: "subagent.spawn"; at: number; id: string; parentId: string }
  | { type: "subagent.end"; at: number; id: string };

/** Adapter boundary. The page only talks to the studio through this. */
export interface StudioFeed {
  /** True while the source is the local mock timeline. */
  readonly demo: boolean;
  getSnapshot(language: "zh" | "en"): StudioSnapshot;
  getEvents(language: "zh" | "en"): readonly StudioEvent[];
  subscribe(listener: () => void): () => void;
  destroy(): void;
}
