import type { AgentId, AgentState } from "../../data/agents";
import { BUBBLES, CAST, EYES, LEDS, SCREENS } from "./layout";

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
  trading: "left",
};

function src(id: string, part: "body" | "top" | "shadow", theme?: "light" | "dark") {
  if (part === "shadow") return `/studio/cast/${id}-shadow.webp`;
  return `/studio/cast/${id}-${part}-${theme}.webp`;
}

type Props = {
  status: Record<AgentId, AgentState>;
  listen: string;
  intro: string;
  busy: boolean;
};

function ScreenCode({ id, on }: { id: string; on: boolean }) {
  const screen = SCREENS.find((item) => item.id === id);
  if (!screen) return null;
  const spans = [1, 0.72, 0.9, 0.55, 0.84, 0.64, 1, 0.72, 0.9, 0.55];
  const step = 3.4;
  const points = [
    [screen.x, screen.y],
    [screen.x + screen.w, screen.y + screen.skew],
    [screen.x + screen.w, screen.y + screen.h],
    [screen.x, screen.y + screen.h - screen.skew * 0.4],
  ]
    .map((pair) => pair.join(","))
    .join(" ");
  return (
    <g className={on ? "screen is-on" : "screen"} data-screen={id}>
      <clipPath id={`code-${id}`}>
        <polygon points={points} />
      </clipPath>
      <g clipPath={`url(#code-${id})`}>
        <rect x={screen.x} y={screen.y - 2} width={screen.w} height={screen.h + 4} fill="var(--screen)" />
        <g className="screen-lines">
          {spans.map((span, index) => (
            <rect
              key={index}
              x={screen.x + 2}
              y={screen.y + 2 + index * step}
              width={Math.max(4, (screen.w - 4) * span)}
              height={1.6}
              rx={0.4}
              fill={index % 3 === 0 ? "var(--code-b)" : index % 3 === 1 ? "var(--code-a)" : "var(--code-c)"}
            />
          ))}
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

/** Painted characters. Motion is CSS on these groups; the pictures themselves do not change. */
export default function Cast({ status, listen, intro, busy }: Props) {
  return (
    <>
      {ORDER.map((id) => {
        const part = CAST[id];
        const state = status[id];
        const eyes = EYES.filter((eye) => eye.id === id);
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
            style={{ ["--lag" as string]: LAG[id] }}
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
                  {eyes.map((eye) => (
                    <g key={`${eye.x}-${eye.y}`} className="eye" transform={`translate(${eye.x} ${eye.y})`}>
                      <circle r={eye.light ? 2.5 : 2.15} className={eye.light ? "pupil is-light" : "pupil"} />
                      <ellipse className="lid" rx={eye.light ? 3.1 : 2.7} ry={eye.light ? 2.6 : 2.3} />
                    </g>
                  ))}
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
      {ORDER.map((id) => (
        <ScreenCode key={`screen-${id}`} id={id} on={status[id] === "working"} />
      ))}
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
