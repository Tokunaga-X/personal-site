import type { AgentId, AgentState } from "../../data/agents";
import Cast from "./Cast";
import { VIEW } from "./layout";

type Props = {
  status: Record<AgentId, AgentState>;
  listen: string;
  intro: string;
  busy: boolean;
};

/** The room photo is the background. These sprites are the painted cast, in the same 1280×720 space. */
export default function RoomScene({ status, listen, intro, busy }: Props) {
  return (
    <svg className="room-overlay" viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} aria-hidden="true">
      <Cast status={status} listen={listen} intro={intro} busy={busy} />
    </svg>
  );
}
