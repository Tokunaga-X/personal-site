import type { AgentId, AgentState } from "../../data/agents";
import { BUBBLES, CAST, DESKS, EYES, LEDS, SCREENS, SEATS } from "./layout";

const ORDER = ["site", "general", "x", "trading"] as const;

const VARIANT: Record<AgentId, "a" | "b"> = {
  site: "a",
  general: "b",
  x: "a",
  trading: "b",
};

const LAG: Record<AgentId, string> = {
  site: "0s",
  general: "-1.7s",
  x: "-3.1s",
  trading: "-0.8s",
};

const FACE: Record<AgentId, "right" | "left"> = {
  site: "right",
  general: "right",
  x: "right",
  trading: "right",
};

function src(id: string, part: "body" | "top" | "shadow", theme?: "light" | "dark") {
  if (part === "shadow") return `/studio/cast/${id}-shadow.webp`;
  return `/studio/cast/${id}-${part}-${theme}.webp`;
}

type Point = { x: number; y: number } | null;

type SeatBox = { x: number; y: number; w: number; h: number };

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

/** Head-level point of a seat — where other bots look when this one has attention. */
function seatPoint(id: string): Point {
  const seat = (SEATS as Record<string, SeatBox | undefined>)[id];
  if (!seat) return null;
  return { x: seat.x + seat.w / 2, y: seat.y + seat.h * 0.3 };
}

/** Eye offset toward a target, ramped so very near targets barely move. */
function gazeOffset(target: Point, eye: { x: number; y: number }) {
  if (!target) return { x: 0, y: 0 };
  const dx = target.x - eye.x;
  const dy = target.y - eye.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 12) return { x: 0, y: 0 };
  const reach = Math.min((dist - 12) / 70, 1);
  const k = 2.4 * reach;
  return { x: (dx / dist) * k, y: (dy / dist) * k * 0.6 };
}

/** Tiny body lean toward whoever has the room's attention, in degrees. */
function leanToward(id: AgentId, focus: string) {
  if (!focus || focus === id) return 0;
  const own = SEATS[id];
  const other = seatPoint(focus);
  if (!other) return 0;
  return Math.max(-1, Math.min(1, (other.x - (own.x + own.w / 2)) / 260)) * 2.2;
}

function ScreenCode({ id, on }: { id: string; on: boolean }) {
  const screen = SCREENS.find((item) => item.id === id);
  if (!screen) return null;
  const spans = [0.88, 0.62, 0.94, 0.52, 0.78, 0.66, 0.88, 0.62, 0.94, 0.52];
  const step = 3.6;
  const skewDeg = (Math.atan2(screen.skew, screen.w) * 180) / Math.PI;
  const points = [
    [screen.x, screen.y],
    [screen.x + screen.w, screen.y + screen.skew],
    [screen.x + screen.w, screen.y + screen.skew + screen.h],
    [screen.x, screen.y + screen.h],
  ]
    .map((pair) => pair.join(","))
    .join(" ");
  return (
    <g className={on ? "screen is-on" : "screen"} data-screen={id}>
      <clipPath id={`code-${id}`}>
        <polygon points={points} />
      </clipPath>
      <g clipPath={`url(#code-${id})`}>
        <polygon points={points} fill="var(--screen)" fillOpacity={0.86} />
        <g transform={`translate(${screen.x} ${screen.y}) skewY(${skewDeg.toFixed(2)})`}>
          <g className="screen-lines">
            {spans.map((span, index) => (
              <rect
                key={index}
                x={3}
                y={3 + index * step}
                width={Math.max(5, (screen.w - 6) * span)}
                height={1.6}
                rx={0.5}
                fill={index % 3 === 0 ? "var(--code-b)" : index % 3 === 1 ? "var(--code-a)" : "var(--code-c)"}
              />
            ))}
          </g>
        </g>
      </g>
    </g>
  );
}

function Bubble({ id, on }: { id: AgentId; on: boolean }) {
  const spot = BUBBLES[id];
  return (
    <g className={on ? "bubble is-on" : "bubble"}>
      <rect x={spot.x} y={spot.y} width={28} height={16} rx={8} />
      <circle className="bubble-dot" cx={spot.x + 8} cy={spot.y + 8} r={1.5} />
      <circle className="bubble-dot" cx={spot.x + 14} cy={spot.y + 8} r={1.5} />
      <circle className="bubble-dot" cx={spot.x + 20} cy={spot.y + 8} r={1.5} />
    </g>
  );
}

/** Soft monitor light around a working bot's screen. */
function CastGlow({ id }: { id: AgentId }) {
  const screen = SCREENS.find((item) => item.id === id);
  const body = CAST[id].body;
  if (screen) {
    return (
      <ellipse
        className="cast-glow"
        cx={screen.x + screen.w / 2}
        cy={screen.y + (screen.h + screen.skew) / 2}
        rx={screen.w * 1.9}
        ry={(screen.h + screen.skew) * 1.4}
        fill="url(#cast-glow)"
      />
    );
  }
  return (
    <ellipse
      className="cast-glow"
      cx={body.x + body.w / 2}
      cy={body.y + body.h / 2}
      rx={body.w * 1.1}
      ry={body.h * 0.9}
      fill="url(#cast-glow)"
    />
  );
}

/** Painted characters. Motion is CSS on these groups; the pictures themselves do not change. */
export default function Cast({ status, listen, intro, busy, gaze, focus }: Props) {
  return (
    <>
      {ORDER.map((id) => {
        const part = CAST[id];
        const state = status[id];
        const eyes = EYES.filter((eye) => eye.id === id);
        const lean = leanToward(id, focus);
        return (
          <g
            key={id}
            className="mascot"
            data-mascot={id}
            data-state={state}
            data-listen={listen === id ? "true" : "false"}
            data-intro={intro === id ? "true" : "false"}
            data-variant={VARIANT[id]}
            data-face={FACE[id]}
            style={{ ["--lag" as string]: LAG[id], ["--lean" as string]: `${lean}deg` }}
          >
            <image
              className="mascot-shadow"
              data-part="shadow"
              href={src(id, "shadow")}
              x={part.shadow.x}
              y={part.shadow.y}
              width={part.shadow.w}
              height={part.shadow.h}
            />
            <g className="mascot-hop">
              <g className="mascot-listen">
                <g className="mascot-act">
                  <image
                    className="cast-light"
                    data-part="body"
                    href={src(id, "body", "light")}
                    x={part.body.x}
                    y={part.body.y}
                    width={part.body.w}
                    height={part.body.h}
                  />
                  <image
                    className="cast-dark"
                    data-part="body"
                    href={src(id, "body", "dark")}
                    x={part.body.x}
                    y={part.body.y}
                    width={part.body.w}
                    height={part.body.h}
                  />
                  {eyes.map((eye) => {
                    const target = focus && focus !== id ? seatPoint(focus) : gaze;
                    const off = gazeOffset(target, eye);
                    if (eye.vector) {
                      const rx = eye.rx ?? 2.8;
                      const ry = eye.ry ?? 3.3;
                      const rot = eye.rot ?? 0;
                      return (
                        <g
                          key={`${eye.x}-${eye.y}`}
                          className="eye is-vector"
                          transform={`translate(${eye.x} ${eye.y}) rotate(${rot})`}
                        >
                          <g
                            className="gaze"
                            style={{ ["--gx" as string]: `${off.x}px`, ["--gy" as string]: `${off.y}px` }}
                          >
                            <g className="eye-blink">
                              <ellipse
                                rx={rx}
                                ry={ry}
                                className={eye.light ? "pupil is-light is-vector" : "pupil is-vector"}
                              />
                              <circle
                                className="eye-shine"
                                cx={-rx * 0.28}
                                cy={-ry * 0.3}
                                r={Math.max(0.75, rx * 0.26)}
                              />
                            </g>
                          </g>
                        </g>
                      );
                    }
                    return (
                      <g key={`${eye.x}-${eye.y}`} className="eye" transform={`translate(${eye.x} ${eye.y})`}>
                        <g
                          className="gaze"
                          style={{ ["--gx" as string]: `${off.x}px`, ["--gy" as string]: `${off.y}px` }}
                        >
                          <circle r={eye.light ? 2.5 : 2.15} className={eye.light ? "pupil is-light" : "pupil"} />
                        </g>
                        <ellipse className="lid" rx={eye.light ? 3.1 : 2.7} ry={eye.light ? 2.6 : 2.3} />
                      </g>
                    );
                  })}
                  {part.top && (
                    <g className="mascot-top">
                      <image
                        className="cast-light"
                        data-part="top"
                        href={src(id, "top", "light")}
                        x={part.top.x}
                        y={part.top.y}
                        width={part.top.w}
                        height={part.top.h}
                      />
                      <image
                        className="cast-dark"
                        data-part="top"
                        href={src(id, "top", "dark")}
                        x={part.top.x}
                        y={part.top.y}
                        width={part.top.w}
                        height={part.top.h}
                      />
                    </g>
                  )}
                </g>
                <Bubble id={id} on={state === "chatting"} />
              </g>
            </g>
          </g>
        );
      })}
      {ORDER.map((id) => {
        const desk = DESKS[id];
        if (!desk) return null;
        return (
          <g key={`desk-${id}`} className="desk-front" data-desk={id}>
            <image
              className="cast-light"
              href={`/studio/room/desk-${id}-light.webp`}
              x={desk.x}
              y={desk.y}
              width={desk.w}
              height={desk.h}
            />
            <image
              className="cast-dark"
              href={`/studio/room/desk-${id}-dark.webp`}
              x={desk.x}
              y={desk.y}
              width={desk.w}
              height={desk.h}
            />
          </g>
        );
      })}
      {ORDER.map((id) => (
        <ScreenCode key={`screen-${id}`} id={id} on={status[id] === "working"} />
      ))}
      {ORDER.map((id) => (status[id] === "working" ? <CastGlow key={`glow-${id}`} id={id} /> : null))}
      <g className={busy ? "rack is-busy" : "rack"} aria-hidden="true">
        {LEDS.map((led, index) => (
          <circle
            key={`${led.x}-${led.y}-${led.k}`}
            className={`led led-${led.k}`}
            cx={led.x}
            cy={led.y}
            r={2.15}
            style={{ animationDelay: `${(index % 6) * 0.17}s` }}
          />
        ))}
      </g>
    </>
  );
}
