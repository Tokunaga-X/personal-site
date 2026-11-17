/**
 * Mascots drawn in the room bitmap's 1280×720 space.
 * Each part is its own group so the next step can transform it.
 */

function Smile({ d, fill }: { d: string; fill: string }) {
  return <path d={d} fill={fill} />;
}

export function SiteMascot() {
  return (
    <g className="mascot" data-agent="site">
      <g data-part="hand-left">
        <ellipse cx="386" cy="352" rx="11" ry="9" fill="url(#siteHand)" />
      </g>
      <g data-part="hand-right">
        <ellipse cx="448" cy="328" rx="12" ry="10" fill="url(#siteHand)" />
      </g>
      <g data-part="body">
        <ellipse cx="412" cy="344" rx="40" ry="56" fill="url(#siteBody)" />
      </g>
      <g data-part="eyes">
        <ellipse cx="398" cy="326" rx="3.4" ry="4.2" fill="var(--ink)" />
        <ellipse cx="424" cy="326" rx="3.4" ry="4.2" fill="var(--ink)" />
        <circle cx="399.2" cy="324.6" r="1.1" fill="#fff" opacity="0.85" />
        <circle cx="425.2" cy="324.6" r="1.1" fill="#fff" opacity="0.85" />
      </g>
      <g data-part="mouth">
        <Smile d="M402 340 Q412 348 422 340 Q412 345 402 340 Z" fill="var(--mouth)" />
      </g>
      <g data-part="body">
        <ellipse cx="388" cy="338" rx="7" ry="4.2" fill="var(--blush)" />
        <ellipse cx="436" cy="338" rx="7" ry="4.2" fill="var(--blush)" />
      </g>
      <g data-part="top">
        <path d="M404 292 C403 278 402 268 404 256" stroke="var(--leaf)" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <ellipse cx="394" cy="270" rx="11" ry="6.5" fill="url(#leafA)" transform="rotate(-42 394 270)" />
        <ellipse cx="414" cy="262" rx="10" ry="6" fill="url(#leafB)" transform="rotate(28 414 262)" />
      </g>
    </g>
  );
}

export function GeneralMascot() {
  return (
    <g className="mascot" data-agent="general">
      <g data-part="hand-left">
        <ellipse cx="552" cy="348" rx="10" ry="8.5" fill="var(--bot-d)" />
      </g>
      <g data-part="hand-right">
        <ellipse cx="636" cy="348" rx="10" ry="8.5" fill="var(--bot-d)" />
      </g>
      <g data-part="body">
        <rect x="556" y="304" width="78" height="74" rx="18" fill="url(#botBody)" />
      </g>
      <g data-part="eyes">
        <rect x="574" y="324" width="14" height="18" rx="4" fill="var(--ink)" />
        <rect x="602" y="324" width="14" height="18" rx="4" fill="var(--ink)" />
        <rect x="577" y="327" width="5" height="5" rx="1.5" fill="#e7f7ff" />
        <rect x="605" y="327" width="5" height="5" rx="1.5" fill="#e7f7ff" />
      </g>
      <g data-part="mouth">
        <Smile d="M586 352 Q595 358 604 352 Q595 356 586 352 Z" fill="var(--mouth)" />
      </g>
      <g data-part="body">
        <ellipse cx="570" cy="348" rx="6" ry="3.6" fill="var(--blush)" />
        <ellipse cx="620" cy="348" rx="6" ry="3.6" fill="var(--blush)" />
      </g>
      <g data-part="top">
        <rect x="592" y="276" width="4.5" height="30" rx="2" fill="var(--bot-d)" />
        <circle cx="594.2" cy="272" r="8" fill="url(#botBody)" />
        <circle cx="591.5" cy="269.5" r="2.4" fill="#e7f7ff" />
      </g>
    </g>
  );
}

export function XMascot() {
  return (
    <g className="mascot" data-agent="x">
      <g data-part="hand-left">
        <ellipse cx="722" cy="384" rx="9" ry="7.5" fill="#141416" />
      </g>
      <g data-part="hand-right">
        <ellipse cx="786" cy="378" rx="9" ry="7.5" fill="#141416" />
      </g>
      <g data-part="body">
        <circle cx="752" cy="366" r="38" fill="url(#xBody)" />
      </g>
      <g data-part="top">
        <ellipse cx="736" cy="348" rx="12" ry="8" fill="#3a3e46" opacity="0.55" />
      </g>
      <g data-part="eyes">
        <ellipse cx="740" cy="360" rx="6.2" ry="7.4" fill="var(--x-eye)" />
        <ellipse cx="766" cy="360" rx="6.2" ry="7.4" fill="var(--x-eye)" />
      </g>
      <g data-part="mouth">
        <Smile d="M742 376 Q752 382 762 376 Q752 380 742 376 Z" fill="#d5dbe3" />
      </g>
    </g>
  );
}

export function TradingMascot() {
  return (
    <g className="mascot" data-agent="trading">
      <g data-part="hand-left">
        <ellipse cx="900" cy="412" rx="10" ry="8" fill="var(--mint-d)" />
      </g>
      <g data-part="hand-right">
        <ellipse cx="966" cy="408" rx="9" ry="7.5" fill="var(--mint-d)" />
      </g>
      <g data-part="body">
        <path
          d="M932 368 C958 386 972 408 972 424 C972 442 954 452 932 452 C910 452 892 442 892 424 C892 408 906 386 932 368 Z"
          fill="url(#mintBody)"
        />
      </g>
      <g data-part="eyes">
        <ellipse cx="922" cy="418" rx="3.3" ry="4" fill="var(--ink)" />
        <ellipse cx="942" cy="418" rx="3.3" ry="4" fill="var(--ink)" />
        <circle cx="923.2" cy="416.6" r="1" fill="#fff" opacity="0.9" />
        <circle cx="943.2" cy="416.6" r="1" fill="#fff" opacity="0.9" />
      </g>
      <g data-part="mouth">
        <Smile d="M924 428 Q932 434 940 428 Q932 432 924 428 Z" fill="var(--mouth)" />
      </g>
      <g data-part="body">
        <ellipse cx="912" cy="424" rx="6" ry="3.5" fill="var(--blush)" />
        <ellipse cx="952" cy="424" rx="6" ry="3.5" fill="var(--blush)" />
      </g>
      <g data-part="top">
        <path d="M932 376 C942 376 948 358 932 344 C916 358 922 376 932 376 Z" fill="url(#mintTip)" />
      </g>
    </g>
  );
}

const LINES = [
  { t: 0.22, w: 0.72, c: "var(--code-a)" },
  { t: 0.4, w: 0.46, c: "var(--code-b)" },
  { t: 0.56, w: 0.66, c: "var(--code-c)" },
  { t: 0.72, w: 0.38, c: "var(--code-a)" },
];

function lerp(a: number[], b: number[], t: number) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export function Screen({ id, points }: { id: string; points: string }) {
  const n = points.split(/[ ,]+/).map(Number);
  const tl = [n[0], n[1]];
  const tr = [n[2], n[3]];
  const br = [n[4], n[5]];
  const bl = [n[6], n[7]];
  const quad = (t0: number, t1: number, inset: number, span: number) => {
    const l0 = lerp(tl, bl, t0);
    const r0 = lerp(tr, br, t0);
    const l1 = lerp(tl, bl, t1);
    const r1 = lerp(tr, br, t1);
    const a = lerp(l0, r0, inset);
    const b = lerp(l0, r0, inset + span);
    const c = lerp(l1, r1, inset + span);
    const d = lerp(l1, r1, inset);
    return `${a[0].toFixed(1)},${a[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)} ${d[0].toFixed(1)},${d[1].toFixed(1)}`;
  };
  return (
    <g data-screen={id}>
      <polygon points={points} fill="var(--screen)" />
      {LINES.map((line) => (
        <polygon key={line.t} points={quad(line.t, line.t + 0.07, 0.14, line.w * 0.7)} fill={line.c} />
      ))}
    </g>
  );
}

export function RackLeds() {
  const cols = [
    { x: 1034, y0: 214, y1: 400 },
    { x: 1152, y0: 248, y1: 430 },
  ];
  const dots = cols.flatMap((col) =>
    Array.from({ length: 7 }, (_, i) => {
      const y = col.y0 + ((col.y1 - col.y0) * i) / 6;
      const hot = i === 3;
      return { x: col.x, y, hot, key: `${col.x}-${i}` };
    }),
  );
  return (
    <g data-part="leds">
      {dots.map((dot) => (
        <circle key={dot.key} cx={dot.x} cy={dot.y} r="2.3" fill={dot.hot ? "var(--led-hot)" : "var(--led)"} />
      ))}
    </g>
  );
}
