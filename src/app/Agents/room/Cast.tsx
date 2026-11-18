/**
 * Mascots in the room bitmap's 1280×720 space.
 * Parts stay separate so a later step can transform them. Nothing here animates.
 */

import { LEDS, SCREENS } from "./layout";

function Smile({ d }: { d: string }) {
  return <path d={d} fill="var(--mouth)" />;
}

export function SiteMascot() {
  return (
    <g className="mascot" data-agent="site">
      <ellipse data-part="shadow" cx="408" cy="398" rx="30" ry="8" fill="var(--contact)" />
      <g data-part="hand-left">
        <ellipse cx="370" cy="366" rx="10" ry="8" fill="url(#siteHand)" />
      </g>
      <g data-part="body">
        <path
          d="M408 294 C444 302 450 334 444 364 C438 400 376 404 370 366 C364 332 372 302 408 294 Z"
          fill="url(#siteBody)"
        />
        <ellipse cx="390" cy="338" rx="6.5" ry="3.8" fill="var(--blush)" />
        <ellipse cx="430" cy="338" rx="6.5" ry="3.8" fill="var(--blush)" />
      </g>
      <g data-part="hand-right">
        <ellipse cx="478" cy="362" rx="11" ry="8.5" fill="url(#siteHand)" />
      </g>
      <g data-part="eyes">
        <ellipse cx="396" cy="326" rx="3.3" ry="4" fill="var(--ink)" />
        <ellipse cx="422" cy="326" rx="3.3" ry="4" fill="var(--ink)" />
        <circle cx="397.1" cy="324.8" r="1" fill="#fff" opacity="0.85" />
        <circle cx="423.1" cy="324.8" r="1" fill="#fff" opacity="0.85" />
      </g>
      <g data-part="mouth">
        <Smile d="M400 340 Q409 347 418 340 Q409 344 400 340 Z" />
      </g>
      <g data-part="top">
        <path d="M406 294 C405 284 405 276 406 268" stroke="var(--leaf)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <ellipse cx="396" cy="276" rx="8" ry="4.6" fill="url(#leafA)" transform="rotate(-36 396 276)" />
        <ellipse cx="416" cy="270" rx="7.5" ry="4.4" fill="url(#leafB)" transform="rotate(32 416 270)" />
      </g>
    </g>
  );
}

export function GeneralMascot() {
  return (
    <g className="mascot" data-agent="general">
      <ellipse data-part="shadow" cx="592" cy="370" rx="28" ry="7" fill="var(--contact)" />
      <g data-part="hand-left">
        <ellipse cx="548" cy="346" rx="9" ry="7.5" fill="var(--bot-d)" />
      </g>
      <g data-part="body">
        <rect x="556" y="300" width="72" height="66" rx="16" fill="url(#botBody)" />
        <ellipse cx="572" cy="342" rx="5.5" ry="3.2" fill="var(--blush)" />
        <ellipse cx="614" cy="342" rx="5.5" ry="3.2" fill="var(--blush)" />
      </g>
      <g data-part="hand-right">
        <ellipse cx="632" cy="338" rx="9" ry="7.5" fill="var(--bot-d)" />
      </g>
      <g data-part="eyes">
        <rect x="572" y="318" width="13" height="16" rx="3.5" fill="var(--ink)" />
        <rect x="598" y="318" width="13" height="16" rx="3.5" fill="var(--ink)" />
        <rect x="575" y="321" width="4.5" height="4.5" rx="1.2" fill="#e7f7ff" />
        <rect x="601" y="321" width="4.5" height="4.5" rx="1.2" fill="#e7f7ff" />
      </g>
      <g data-part="mouth">
        <Smile d="M584 344 Q592 350 600 344 Q592 348 584 344 Z" />
      </g>
      <g data-part="top">
        <rect x="589.5" y="274" width="4" height="28" rx="2" fill="var(--bot-d)" />
        <circle cx="591.5" cy="270" r="7" fill="url(#botBody)" />
        <circle cx="589.2" cy="267.8" r="2.1" fill="#e7f7ff" />
      </g>
    </g>
  );
}

export function XMascot() {
  return (
    <g className="mascot" data-agent="x">
      <ellipse data-part="shadow" cx="744" cy="416" rx="26" ry="7" fill="var(--contact)" />
      <g data-part="hand-left">
        <ellipse cx="710" cy="400" rx="8" ry="6.5" fill="#121214" />
      </g>
      <g data-part="body">
        <circle cx="744" cy="384" r="32" fill="url(#xBody)" />
      </g>
      <g data-part="hand-right">
        <ellipse cx="792" cy="408" rx="8.5" ry="7" fill="#121214" />
      </g>
      <g data-part="top">
        <ellipse cx="730" cy="368" rx="10" ry="6.5" fill="#3a3e46" opacity="0.5" />
      </g>
      <g data-part="eyes">
        <ellipse cx="733" cy="378" rx="5.6" ry="6.6" fill="var(--x-eye)" />
        <ellipse cx="756" cy="378" rx="5.6" ry="6.6" fill="var(--x-eye)" />
      </g>
      <g data-part="mouth">
        <path d="M736 392 Q744 398 752 392 Q744 396 736 392 Z" fill="#d5dbe3" />
      </g>
    </g>
  );
}

export function TradingMascot() {
  return (
    <g className="mascot" data-agent="trading">
      <ellipse data-part="shadow" cx="924" cy="434" rx="26" ry="7" fill="var(--contact)" />
      <g data-part="hand-left">
        <ellipse cx="856" cy="404" rx="9" ry="7.5" fill="var(--mint-d)" />
      </g>
      <g data-part="body">
        <path
          d="M924 372 C948 388 960 408 960 422 C960 440 944 450 924 450 C904 450 888 440 888 422 C888 408 900 388 924 372 Z"
          fill="url(#mintBody)"
        />
        <ellipse cx="908" cy="418" rx="5.5" ry="3.2" fill="var(--blush)" />
        <ellipse cx="940" cy="418" rx="5.5" ry="3.2" fill="var(--blush)" />
      </g>
      <g data-part="hand-right">
        <ellipse cx="956" cy="412" rx="8" ry="6.5" fill="var(--mint-d)" />
      </g>
      <g data-part="eyes">
        <ellipse cx="914" cy="412" rx="3.1" ry="3.8" fill="var(--ink)" />
        <ellipse cx="932" cy="412" rx="3.1" ry="3.8" fill="var(--ink)" />
        <circle cx="915" cy="410.8" r="0.9" fill="#fff" opacity="0.9" />
        <circle cx="933" cy="410.8" r="0.9" fill="#fff" opacity="0.9" />
      </g>
      <g data-part="mouth">
        <Smile d="M916 422 Q923 428 930 422 Q923 426 916 422 Z" />
      </g>
      <g data-part="top">
        <path d="M924 378 C934 376 940 360 924 346 C908 360 914 376 924 378 Z" fill="url(#mintTip)" />
      </g>
    </g>
  );
}

const LINE_SPAN = [1, 0.72, 0.9, 0.55, 0.8];

export function Screen({
  id,
  x,
  y,
  w,
  h,
  skew,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  skew: number;
}) {
  const row = (t: number, span: number) => {
    const y0 = y + h * t;
    const y1 = y0 + Math.max(2.1, h * 0.09);
    const x1 = x + w * span;
    const s0 = (skew * (x - x)) / w;
    const s1 = (skew * (x1 - x)) / w;
    const sl = (skew * 0) / w;
    return `${x},${(y0 + sl).toFixed(1)} ${x1.toFixed(1)},${(y0 + s1).toFixed(1)} ${x1.toFixed(1)},${(y1 + s1).toFixed(1)} ${x},${(y1 + s0).toFixed(1)}`;
  };
  const plate = `${x - 1},${y - 1} ${x + w + 2},${(y + skew - 1).toFixed(1)} ${x + w + 2},${(y + h + skew + 1).toFixed(1)} ${x - 1},${y + h + 1}`;
  const colors = ["var(--code-a)", "var(--code-b)", "var(--code-c)", "var(--code-a)", "var(--code-b)"];
  return (
    <g data-screen={id}>
      <polygon points={plate} fill="var(--screen)" />
      {LINE_SPAN.map((span, i) => (
        <polygon key={i} points={row(0.08 + i * 0.17, span)} fill={colors[i]} />
      ))}
    </g>
  );
}

export function Screens() {
  return (
    <g>
      {SCREENS.map((screen) => (
        <Screen key={screen.id} {...screen} />
      ))}
    </g>
  );
}

const LED_FILL = { g: "var(--led-g)", b: "var(--led-b)", a: "var(--led-a)" };

export function RackLeds() {
  return (
    <g data-part="leds">
      {LEDS.map((dot) => (
        <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r="2.15" fill={LED_FILL[dot.k]} />
      ))}
    </g>
  );
}
