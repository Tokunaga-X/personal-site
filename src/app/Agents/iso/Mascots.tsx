import type { ReactNode } from "react";

/**
 * Original mascots. Each part is its own group so a later step can
 * animate it with a transform without redrawing the character.
 * Local origin is the seat contact point; y grows downward.
 */

type Gaze = { gaze?: number };

function Parts({
  body,
  eyes,
  mouth,
  handLeft,
  handRight,
  top,
}: {
  body: ReactNode;
  eyes: ReactNode;
  mouth: ReactNode;
  handLeft: ReactNode;
  handRight: ReactNode;
  top: ReactNode;
}) {
  return (
    <g className="iso-mascot">
      <g className="iso-part iso-part-hand-left" data-part="hand-left">
        {handLeft}
      </g>
      <g className="iso-part iso-part-hand-right" data-part="hand-right">
        {handRight}
      </g>
      <g className="iso-part iso-part-body" data-part="body">
        {body}
      </g>
      <g className="iso-part iso-part-eyes" data-part="eyes">
        {eyes}
      </g>
      <g className="iso-part iso-part-mouth" data-part="mouth">
        {mouth}
      </g>
      <g className="iso-part iso-part-top" data-part="top">
        {top}
      </g>
    </g>
  );
}

/** Site bot: cream round blob with a small leaf. */
export function SiteMascot({ gaze = 0 }: Gaze) {
  return (
    <Parts
      handLeft={<ellipse cx={-36} cy={-30} rx={11} ry={9} fill="var(--iso-cream-shade)" />}
      handRight={<ellipse cx={36} cy={-30} rx={11} ry={9} fill="var(--iso-cream-shade)" />}
      body={
        <>
          <ellipse cx={0} cy={-40} rx={38} ry={42} fill="var(--iso-cream)" />
          <ellipse cx={-10} cy={-54} rx={16} ry={12} fill="var(--iso-cream-hi)" />
        </>
      }
      eyes={
        <>
          <ellipse cx={-13 + gaze} cy={-48} rx={3.4} ry={4} fill="var(--iso-ink)" />
          <ellipse cx={13 + gaze} cy={-48} rx={3.4} ry={4} fill="var(--iso-ink)" />
        </>
      }
      mouth={
        <path
          d="M-9,-34 Q0,-27 9,-34"
          fill="none"
          stroke="var(--iso-ink)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      }
      top={
        <>
          <path d="M0,-80 C0,-96 -1,-108 0,-118" stroke="var(--iso-leaf)" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M0,-102 C-8,-112 -26,-114 -28,-100 C-18,-96 -8,-98 0,-104" fill="var(--iso-leaf)" />
          <path d="M1,-108 C10,-120 28,-120 28,-104 C18,-102 8,-104 1,-110" fill="var(--iso-leaf-d)" />
        </>
      }
    />
  );
}

/** General bot: soft sky-blue cube robot with an antenna. */
export function GeneralMascot({ gaze = 0 }: Gaze) {
  return (
    <Parts
      handLeft={<ellipse cx={-40} cy={-32} rx={10} ry={8.5} fill="var(--iso-bot-d)" />}
      handRight={<ellipse cx={40} cy={-32} rx={10} ry={8.5} fill="var(--iso-bot-d)" />}
      body={
        <>
          <rect x={-34} y={-78} width={68} height={76} rx={16} fill="var(--iso-bot)" />
          <rect x={-24} y={-68} width={48} height={38} rx={10} fill="var(--iso-bot-l)" opacity={0.55} />
          <rect x={-18} y={-6} width={14} height={10} rx={3} fill="var(--iso-bot-d)" />
          <rect x={4} y={-6} width={14} height={10} rx={3} fill="var(--iso-bot-d)" />
        </>
      }
      eyes={
        <>
          <rect x={-18 + gaze} y={-58} width={12} height={16} rx={3} fill="var(--iso-ink)" />
          <rect x={6 + gaze} y={-58} width={12} height={16} rx={3} fill="var(--iso-ink)" />
          <rect x={-15 + gaze} y={-55} width={4} height={4} rx={1} fill="var(--iso-bot-l)" />
          <rect x={9 + gaze} y={-55} width={4} height={4} rx={1} fill="var(--iso-bot-l)" />
        </>
      }
      mouth={
        <path
          d="M-8,-34 H8"
          fill="none"
          stroke="var(--iso-ink)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      }
      top={
        <>
          <rect x={-2.2} y={-102} width={4.4} height={26} rx={2} fill="var(--iso-bot-d)" />
          <circle cx={0} cy={-106} r={8} fill="var(--iso-bot)" />
          <circle cx={-2.2} cy={-108.5} r={2.6} fill="var(--iso-bot-l)" />
        </>
      }
    />
  );
}

/** X bot: black round character with white dot eyes. */
export function XMascot({ gaze = 0 }: Gaze) {
  return (
    <Parts
      handLeft={<ellipse cx={-36} cy={-24} rx={10} ry={8} fill="var(--iso-x)" />}
      handRight={<ellipse cx={36} cy={-24} rx={10} ry={8} fill="var(--iso-x)" />}
      body={
        <>
          <circle cx={0} cy={-34} r={36} fill="var(--iso-x)" />
          <ellipse cx={-12} cy={-46} rx={14} ry={10} fill="var(--iso-x-hi)" opacity={0.55} />
        </>
      }
      eyes={
        <>
          <circle cx={-12 + gaze} cy={-38} r={5.2} fill="var(--iso-x-eye)" />
          <circle cx={12 + gaze} cy={-38} r={5.2} fill="var(--iso-x-eye)" />
        </>
      }
      mouth={
        <path
          d="M-7,-24 Q0,-19 7,-24"
          fill="none"
          stroke="var(--iso-x-eye)"
          strokeWidth={2}
          strokeLinecap="round"
        />
      }
      top={<ellipse cx={-8} cy={-56} rx={10} ry={6} fill="var(--iso-x-hi)" opacity={0.9} />}
    />
  );
}

/** Trading bot: mint-green droplet. */
export function TradingMascot({ gaze = 0 }: Gaze) {
  return (
    <Parts
      handLeft={<ellipse cx={-34} cy={-22} rx={10} ry={8} fill="var(--iso-mint-d)" />}
      handRight={<ellipse cx={34} cy={-22} rx={10} ry={8} fill="var(--iso-mint-d)" />}
      body={
        <>
          <path
            d="M0,8 C30,8 46,-6 46,-34 C46,-62 28,-88 0,-98 C-28,-88 -46,-62 -46,-34 C-46,-6 -30,8 0,8 Z"
            fill="var(--iso-mint)"
          />
          <ellipse cx={-12} cy={-48} rx={12} ry={9} fill="var(--iso-mint-hi)" opacity={0.85} />
        </>
      }
      eyes={
        <>
          <ellipse cx={-12 + gaze} cy={-40} rx={3.3} ry={3.8} fill="var(--iso-ink)" />
          <ellipse cx={12 + gaze} cy={-40} rx={3.3} ry={3.8} fill="var(--iso-ink)" />
        </>
      }
      mouth={
        <path
          d="M-8,-26 Q0,-20 8,-26"
          fill="none"
          stroke="var(--iso-ink)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      }
      top={<path d="M0,-86 C16,-88 18,-112 0,-138 C-18,-112 -16,-88 0,-86 Z" fill="var(--iso-mint)" />}
    />
  );
}

const MASCOTS = {
  site: SiteMascot,
  general: GeneralMascot,
  x: XMascot,
  trading: TradingMascot,
} as const;

export function Mascot({ id, gaze }: { id: keyof typeof MASCOTS; gaze: number }) {
  const Glyph = MASCOTS[id];
  return <Glyph gaze={gaze} />;
}
