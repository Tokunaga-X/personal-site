import { pathOf, project, type WP } from "./iso";

type Face = { top: string; left: string; right: string };

/** A box aligned to the isometric axes. Left face is +y, right face is +x. */
export function IsoBox({
  x,
  y,
  z,
  w,
  d,
  h,
  top,
  left,
  right,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
} & Face) {
  return (
    <g>
      <path
        d={pathOf([
          [x + w, y, z],
          [x + w, y + d, z],
          [x + w, y + d, z + h],
          [x + w, y, z + h],
        ])}
        fill={right}
      />
      <path
        d={pathOf([
          [x, y + d, z],
          [x + w, y + d, z],
          [x + w, y + d, z + h],
          [x, y + d, z + h],
        ])}
        fill={left}
      />
      <path
        d={pathOf([
          [x, y, z + h],
          [x + w, y, z + h],
          [x + w, y + d, z + h],
          [x, y + d, z + h],
        ])}
        fill={top}
      />
    </g>
  );
}

export function FloorDisc({
  x,
  y,
  r,
  z = 0.03,
  fill,
  stroke,
  strokeWidth,
}: {
  x: number;
  y: number;
  r: number;
  z?: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  const steps = 40;
  const pts: WP[] = [];
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r, z]);
  }
  return <path d={pathOf(pts)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
}

const BARS = [
  { at: 0.2, len: 0.74, fill: "var(--iso-code-a)" },
  { at: 0.42, len: 0.46, fill: "var(--iso-code-b)" },
  { at: 0.6, len: 0.68, fill: "var(--iso-code-c)" },
  { at: 0.78, len: 0.36, fill: "var(--iso-code-a)" },
] as const;

function ScreenBars({
  x,
  y,
  z,
  w,
  h,
  axis,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  axis: "x" | "y";
}) {
  return (
    <g>
      {BARS.map((bar) => {
        const z0 = z + h * (1 - bar.at);
        const z1 = z0 - Math.max(0.045, h * 0.07);
        if (axis === "x") {
          const x1 = x + w * bar.len;
          return (
            <path
              key={bar.at}
              d={pathOf([
                [x, y, z0],
                [x1, y, z0],
                [x1, y, z1],
                [x, y, z1],
              ])}
              fill={bar.fill}
            />
          );
        }
        const y1 = y + w * bar.len;
        return (
          <path
            key={bar.at}
            d={pathOf([
              [x, y, z0],
              [x, y1, z0],
              [x, y1, z1],
              [x, y, z1],
            ])}
            fill={bar.fill}
          />
        );
      })}
    </g>
  );
}

export function Monitor({
  x,
  y,
  z,
  face,
}: {
  x: number;
  y: number;
  z: number;
  face: "front" | "right";
}) {
  if (face === "right") {
    const d = 0.98;
    const h = 0.68;
    const t = 0.1;
    return (
      <g>
        <IsoBox x={x - 0.08} y={y + d * 0.32} z={z - 0.18} w={0.16} d={0.16} h={0.18} top="var(--iso-bezel)" left="var(--iso-bezel-d)" right="var(--iso-bezel)" />
        <IsoBox x={x - 0.02} y={y} z={z} w={t} d={d} h={h} top="var(--iso-bezel)" left="var(--iso-bezel-d)" right="var(--iso-bezel)" />
        <path
          d={pathOf([
            [x + t + 0.012, y + 0.08, z + 0.08],
            [x + t + 0.012, y + d - 0.08, z + 0.08],
            [x + t + 0.012, y + d - 0.08, z + h - 0.08],
            [x + t + 0.012, y + 0.08, z + h - 0.08],
          ])}
          fill="var(--iso-screen)"
        />
        <ScreenBars x={x + t + 0.02} y={y + 0.16} z={z + 0.16} w={d - 0.32} h={h - 0.3} axis="y" />
      </g>
    );
  }

  const w = 1.02;
  const h = 0.68;
  const t = 0.1;
  return (
    <g>
      <IsoBox x={x + w / 2 - 0.07} y={y - 0.02} z={z - 0.18} w={0.14} d={0.14} h={0.18} top="var(--iso-bezel)" left="var(--iso-bezel)" right="var(--iso-bezel-d)" />
      <IsoBox x={x} y={y} z={z} w={w} d={t} h={h} top="var(--iso-bezel)" left="var(--iso-bezel)" right="var(--iso-bezel-d)" />
      <path
        d={pathOf([
          [x + 0.08, y + t + 0.012, z + 0.08],
          [x + w - 0.08, y + t + 0.012, z + 0.08],
          [x + w - 0.08, y + t + 0.012, z + h - 0.08],
          [x + 0.08, y + t + 0.012, z + h - 0.08],
        ])}
        fill="var(--iso-screen)"
      />
      <ScreenBars x={x + 0.16} y={y + t + 0.02} z={z + 0.16} w={w - 0.32} h={h - 0.3} axis="x" />
    </g>
  );
}

export function Desk({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  const top = 0.68;
  return (
    <g>
      <IsoBox x={x + 0.08} y={y + 0.1} z={0} w={0.1} d={d - 0.18} h={top} top="var(--iso-leg)" left="var(--iso-leg-d)" right="var(--iso-leg)" />
      <IsoBox x={x + w - 0.18} y={y + 0.1} z={0} w={0.1} d={d - 0.18} h={top} top="var(--iso-leg)" left="var(--iso-leg-d)" right="var(--iso-leg)" />
      <IsoBox x={x} y={y} z={top} w={w} d={d} h={0.1} top="var(--iso-desk)" left="var(--iso-desk-d)" right="var(--iso-desk-d)" />
      <IsoBox x={x + 0.28} y={y + d * 0.42} z={top + 0.1} w={0.72} d={0.28} h={0.045} top="var(--iso-key)" left="var(--iso-key-d)" right="var(--iso-key-d)" />
    </g>
  );
}

export function Chair({ x, y }: { x: number; y: number }) {
  const seat = 0.46;
  return (
    <g>
      <IsoBox x={x - 0.05} y={y - 0.05} z={0.08} w={0.1} d={0.1} h={0.36} top="var(--iso-navy-d)" left="var(--iso-navy-d)" right="var(--iso-navy)" />
      <IsoBox x={x - 0.32} y={y - 0.18} z={0.02} w={0.64} d={0.46} h={0.06} top="var(--iso-navy)" left="var(--iso-navy-d)" right="var(--iso-navy-d)" />
      <IsoBox x={x - 0.4} y={y - 0.24} z={seat} w={0.8} d={0.64} h={0.12} top="var(--iso-navy-l)" left="var(--iso-navy)" right="var(--iso-navy-d)" />
      <IsoBox x={x - 0.38} y={y - 0.36} z={seat + 0.04} w={0.76} d={0.14} h={0.92} top="var(--iso-navy-l)" left="var(--iso-navy)" right="var(--iso-navy-d)" />
    </g>
  );
}

const LED_CYCLE = ["g", "g", "b", "g", "a", "g", "b", "g", "g", "a", "r", "g"] as const;

const LED_FILL: Record<(typeof LED_CYCLE)[number], string> = {
  g: "var(--iso-led-g)",
  b: "var(--iso-led-b)",
  a: "var(--iso-led-a)",
  r: "var(--iso-led-r)",
};

export function Rack({ x, y, w, d, h }: { x: number; y: number; w: number; d: number; h: number }) {
  const leds = [];
  const cols = 3;
  const rows = 11;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const px = x + 0.24 + col * ((w - 0.42) / (cols - 1));
      const pz = 0.42 + row * ((h - 0.7) / (rows - 1));
      const p = project(px, y + d + 0.03, pz);
      const tone = LED_CYCLE[(row * 2 + col) % LED_CYCLE.length];
      leds.push(<circle key={`${row}-${col}`} cx={p.x} cy={p.y} r={3.4} fill={LED_FILL[tone]} />);
    }
  }
  return (
    <g>
      <IsoBox x={x} y={y} z={0} w={w} d={d} h={h} top="var(--iso-rack-top)" left="var(--iso-rack-front)" right="var(--iso-rack-side)" />
      <path
        d={pathOf([
          [x + 0.12, y + d + 0.015, 0.22],
          [x + w - 0.12, y + d + 0.015, 0.22],
          [x + w - 0.12, y + d + 0.015, h - 0.16],
          [x + 0.12, y + d + 0.015, h - 0.16],
        ])}
        fill="var(--iso-rack-panel)"
      />
      {leds}
    </g>
  );
}

export function Plant({
  x,
  y,
  z = 0,
  kind,
}: {
  x: number;
  y: number;
  z?: number;
  kind: "small" | "medium" | "large";
}) {
  const s = kind === "large" ? 1.35 : kind === "small" ? 0.62 : 1;
  const pot = 0.4 * s;
  const potH = 0.36 * s;
  const top = project(x, y, z + potH);
  return (
    <g>
      <IsoBox
        x={x - pot / 2}
        y={y - pot / 2}
        z={z}
        w={pot}
        d={pot}
        h={potH}
        top="var(--iso-pot)"
        left="var(--iso-pot-d)"
        right="var(--iso-pot-d)"
      />
      <ellipse cx={top.x - 12 * s} cy={top.y - 8 * s} rx={13 * s} ry={8 * s} fill="var(--iso-leaf-d)" />
      <ellipse cx={top.x + 11 * s} cy={top.y - 10 * s} rx={12 * s} ry={8 * s} fill="var(--iso-leaf)" />
      <ellipse cx={top.x} cy={top.y - 18 * s} rx={11 * s} ry={9 * s} fill="var(--iso-leaf-l)" />
      <ellipse cx={top.x - 2 * s} cy={top.y - 28 * s} rx={7 * s} ry={6 * s} fill="var(--iso-leaf)" />
    </g>
  );
}

export function Lamp({ x, y, z }: { x: number; y: number; z: number }) {
  const shade = project(x, y, z + 0.55);
  const glow = project(x + 0.2, y + 0.45, z + 0.2);
  const a = project(x, y, z + 0.06);
  const b = project(x, y, z + 0.48);
  return (
    <g>
      <ellipse className="iso-lamp-glow" cx={glow.x} cy={glow.y} rx={86} ry={52} fill="url(#isoLampGlow)" />
      <IsoBox x={x - 0.08} y={y - 0.08} z={z} w={0.16} d={0.16} h={0.06} top="var(--iso-leg)" left="var(--iso-leg-d)" right="var(--iso-leg)" />
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--iso-leg)" strokeWidth={2.4} strokeLinecap="round" />
      <ellipse cx={shade.x} cy={shade.y + 6} rx={14} ry={6} fill="var(--iso-shade-d)" />
      <ellipse cx={shade.x} cy={shade.y} rx={14} ry={7} fill="var(--iso-shade)" />
    </g>
  );
}

const BOOK_FILLS = ["var(--iso-book-a)", "var(--iso-book-b)", "var(--iso-book-c)", "var(--iso-book-d)", "var(--iso-book-b)", "var(--iso-book-a)", "var(--iso-accent)", "var(--iso-book-c)"] as const;

export function Bookshelf({ x, y, w, d, h }: { x: number; y: number; w: number; d: number; h: number }) {
  const levels = [0.08, 0.74, 1.4];
  const books = [];
  for (let s = 0; s < levels.length; s += 1) {
    let cursor = y + 0.14;
    let i = 0;
    while (cursor < y + d - 0.22 && i < 8) {
      const thickness = 0.13 + ((i + s) % 3) * 0.02;
      books.push(
        <IsoBox
          key={`${s}-${i}`}
          x={x + 0.1}
          y={cursor}
          z={levels[s] + 0.07}
          w={w - 0.16}
          d={thickness}
          h={0.5 - (i % 4) * 0.045}
          top="var(--iso-paper)"
          left="var(--iso-paper)"
          right={BOOK_FILLS[(i + s * 2) % BOOK_FILLS.length]}
        />,
      );
      cursor += thickness + 0.025;
      i += 1;
    }
  }
  return (
    <g>
      <IsoBox x={x} y={y} z={0} w={0.08} d={d} h={h} top="var(--iso-wood-l)" left="var(--iso-wood)" right="var(--iso-wood-d)" />
      <IsoBox x={x} y={y} z={0} w={w} d={0.08} h={h} top="var(--iso-wood-l)" left="var(--iso-wood)" right="var(--iso-wood-d)" />
      <IsoBox x={x} y={y + d - 0.08} z={0} w={w} d={0.08} h={h} top="var(--iso-wood-l)" left="var(--iso-wood)" right="var(--iso-wood-d)" />
      {levels.map((sz) => (
        <IsoBox key={sz} x={x + 0.06} y={y + 0.08} z={sz} w={w - 0.08} d={d - 0.16} h={0.06} top="var(--iso-wood-l)" left="var(--iso-wood-d)" right="var(--iso-wood-d)" />
      ))}
      {books}
      <IsoBox x={x} y={y} z={h - 0.08} w={w} d={d} h={0.08} top="var(--iso-wood-l)" left="var(--iso-wood)" right="var(--iso-wood-d)" />
    </g>
  );
}

export function Sofa({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  const seat = 0.32;
  const pillowA = project(x + 0.34, y + 0.55, seat + 0.42);
  const pillowB = project(x + 0.36, y + 1.15, seat + 0.4);
  return (
    <g>
      <IsoBox x={x} y={y} z={0} w={w} d={d} h={seat + 0.16} top="var(--iso-navy-l)" left="var(--iso-navy)" right="var(--iso-navy-d)" />
      <IsoBox x={x} y={y} z={seat} w={0.22} d={d} h={0.7} top="var(--iso-navy-l)" left="var(--iso-navy)" right="var(--iso-navy-d)" />
      <IsoBox x={x + 0.16} y={y} z={seat} w={w - 0.2} d={0.16} h={0.36} top="var(--iso-navy-l)" left="var(--iso-navy)" right="var(--iso-navy-d)" />
      <IsoBox x={x + 0.16} y={y + d - 0.16} z={seat} w={w - 0.2} d={0.16} h={0.36} top="var(--iso-navy-l)" left="var(--iso-navy)" right="var(--iso-navy-d)" />
      <IsoBox x={x + 0.28} y={y + 0.28} z={seat + 0.16} w={w - 0.38} d={d * 0.34} h={0.1} top="var(--iso-navy)" left="var(--iso-navy-d)" right="var(--iso-navy-d)" />
      <IsoBox x={x + 0.28} y={y + 0.28 + d * 0.4} z={seat + 0.16} w={w - 0.38} d={d * 0.34} h={0.1} top="var(--iso-navy-l)" left="var(--iso-navy)" right="var(--iso-navy-d)" />
      <ellipse cx={pillowA.x} cy={pillowA.y} rx={12} ry={8} fill="var(--iso-pillow)" />
      <ellipse cx={pillowB.x} cy={pillowB.y} rx={11} ry={7.5} fill="var(--iso-pillow)" />
    </g>
  );
}

export function CoffeeTable({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <IsoBox x={x - 0.08} y={y - 0.08} z={0} w={0.16} d={0.16} h={0.4} top="var(--iso-table-d)" left="var(--iso-table-d)" right="var(--iso-wood-d)" />
      <FloorDisc x={x} y={y} r={0.62} z={0.4} fill="var(--iso-table-d)" />
      <FloorDisc x={x} y={y} r={0.58} z={0.46} fill="var(--iso-table)" />
      <IsoBox x={x - 0.22} y={y + 0.08} z={0.48} w={0.28} d={0.2} h={0.045} top="var(--iso-book-c)" left="var(--iso-book-d)" right="var(--iso-book-d)" />
      <IsoBox x={x - 0.16} y={y + 0.12} z={0.52} w={0.24} d={0.16} h={0.04} top="var(--iso-book-a)" left="var(--iso-navy)" right="var(--iso-navy-d)" />
      <Plant x={x + 0.22} y={y - 0.05} z={0.48} kind="small" />
    </g>
  );
}

export function Picture({ x, y, w, d, h, z }: { x: number; y: number; w: number; d: number; h: number; z: number }) {
  return (
    <g>
      <IsoBox x={x} y={y} z={z} w={w} d={d} h={h} top="var(--iso-frame)" left="var(--iso-frame-d)" right="var(--iso-frame)" />
      <path
        d={pathOf([
          [x + w + 0.01, y + 0.08, z + 0.08],
          [x + w + 0.01, y + d - 0.08, z + 0.08],
          [x + w + 0.01, y + d - 0.08, z + h - 0.08],
          [x + w + 0.01, y + 0.08, z + h - 0.08],
        ])}
        fill="var(--iso-art-sky)"
      />
      <path
        d={pathOf([
          [x + w + 0.02, y + 0.16, z + 0.1],
          [x + w + 0.02, y + d * 0.55, z + 0.34],
          [x + w + 0.02, y + d * 0.42, z + 0.1],
        ])}
        fill="var(--iso-art-hill)"
      />
      <path
        d={pathOf([
          [x + w + 0.02, y + d * 0.4, z + 0.1],
          [x + w + 0.02, y + d * 0.78, z + 0.42],
          [x + w + 0.02, y + d - 0.14, z + 0.1],
        ])}
        fill="var(--iso-art-hill-d)"
      />
    </g>
  );
}
