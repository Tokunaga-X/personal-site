import type { AgentId, AgentState } from "../data/agents";

export type { AgentState };

/** One bot in the room. `alias` is the display name in the current language. */
export interface StudioAgent {
  id: AgentId;
  alias: string;
  kind: AgentId;
  hue: number;
  seat: number;
  state: AgentState;
}
