import { GeneralMascot, RackLeds, Screen, SiteMascot, TradingMascot, XMascot } from "./Cast";
import { SCREENS, VIEW } from "./layout";

export default function RoomScene() {
  return (
    <svg className="room-overlay" viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} aria-hidden="true">
      <defs>
        <radialGradient id="siteBody" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="var(--cream-hi)" />
          <stop offset="62%" stopColor="var(--cream)" />
          <stop offset="100%" stopColor="var(--cream-shade)" />
        </radialGradient>
        <radialGradient id="siteHand" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="var(--cream-hi)" />
          <stop offset="100%" stopColor="var(--cream-shade)" />
        </radialGradient>
        <radialGradient id="leafA" cx="35%" cy="40%" r="70%">
          <stop offset="0%" stopColor="var(--leaf-hi)" />
          <stop offset="100%" stopColor="var(--leaf)" />
        </radialGradient>
        <radialGradient id="leafB" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="var(--leaf-hi)" />
          <stop offset="100%" stopColor="var(--leaf-d)" />
        </radialGradient>
        <radialGradient id="botBody" cx="36%" cy="30%" r="75%">
          <stop offset="0%" stopColor="var(--bot-hi)" />
          <stop offset="55%" stopColor="var(--bot)" />
          <stop offset="100%" stopColor="var(--bot-d)" />
        </radialGradient>
        <radialGradient id="xBody" cx="36%" cy="32%" r="72%">
          <stop offset="0%" stopColor="var(--x-hi)" />
          <stop offset="45%" stopColor="var(--x)" />
          <stop offset="100%" stopColor="var(--x-d)" />
        </radialGradient>
        <radialGradient id="mintBody" cx="38%" cy="42%" r="70%">
          <stop offset="0%" stopColor="var(--mint-hi)" />
          <stop offset="60%" stopColor="var(--mint)" />
          <stop offset="100%" stopColor="var(--mint-d)" />
        </radialGradient>
        <linearGradient id="mintTip" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--mint)" />
          <stop offset="100%" stopColor="var(--mint-hi)" />
        </linearGradient>
      </defs>
      {SCREENS.map((screen) => (
        <Screen key={screen.id} id={screen.id} points={screen.points} />
      ))}
      <g transform="translate(424 392) scale(1.05) translate(-412 -344)">
        <SiteMascot />
      </g>
      <g transform="translate(600 372) scale(1.02) translate(-595 -341)">
        <GeneralMascot />
      </g>
      <g transform="translate(772 396) scale(1.04) translate(-752 -366)">
        <XMascot />
      </g>
      <g transform="translate(948 440) scale(1.05) translate(-932 -410)">
        <TradingMascot />
      </g>
      <RackLeds />
    </svg>
  );
}
