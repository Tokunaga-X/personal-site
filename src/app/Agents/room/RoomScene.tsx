import Cast from "./Cast";
import { VIEW } from "./layout";

/** The room photo is the background. These sprites are the painted cast, in the same 1280×720 space. */
export default function RoomScene() {
  return (
    <svg className="room-overlay" viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} aria-hidden="true">
      <Cast />
    </svg>
  );
}
