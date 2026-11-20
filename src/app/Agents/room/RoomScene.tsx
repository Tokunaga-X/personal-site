import type { AgentId, AgentState } from "../../data/agents";
import Cast from "./Cast";
import { VIEW } from "./layout";

type Point = { x: number; y: number } | null;

type Props = {
  status: Record<AgentId, AgentState>;
  listen: string;
  intro: string;
  busy: boolean;
  /** Pointer in room pixels while the mouse is over the stage; null when it leaves. */
  gaze: Point;
  /** Bot the pointer (or keyboard focus) is on. Everyone else glances that way. */
  focus: string;
};

/** The room photo is the background. These sprites are the painted cast, in the same 1280×720 space. */
export default function RoomScene({ status, listen, intro, busy, gaze, focus }: Props) {
  return (
    <svg
      className={`room-overlay${gaze || focus ? " is-gazing" : ""}`}
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cast-glow">
          <stop className="cast-glow-a" offset="0" stopOpacity="0.55" />
          <stop className="cast-glow-a" offset="1" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Cast status={status} listen={listen} intro={intro} busy={busy} gaze={gaze} focus={focus} />
    </svg>
  );
}
