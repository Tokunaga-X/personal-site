import { Mascot } from "./Mascots";
import {
  Bookshelf,
  Chair,
  CoffeeTable,
  Desk,
  FloorDisc,
  IsoBox,
  Lamp,
  Monitor,
  Picture,
  Plant,
  Rack,
  Sofa,
} from "./furniture";
import {
  COS,
  DESKS,
  LOUNGE,
  RACKS,
  ROOM,
  SCALE,
  SIN,
  VIEW,
  project,
  type DeskSpec,
} from "./iso";

const WINDOW = { u0: 0.78, u1: 11.55, zTop: 3.82, zBot: 1.2 };

function Ground() {
  const { w, d, t } = ROOM;
  const shadow = project(w / 2, d / 2, 0);
  const lines = [];
  for (let i = 0; i <= w; i += 1) {
    const a = project(i, 0, 0.012);
    const b = project(i, d, 0.012);
    lines.push(
      <line key={`vx${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--iso-floor-line)" strokeWidth={1.35} />,
    );
  }
  for (let j = 0; j <= d; j += 1) {
    const a = project(0, j, 0.012);
    const b = project(w, j, 0.012);
    lines.push(
      <line key={`hy${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--iso-floor-line)" strokeWidth={1.35} />,
    );
  }
  return (
    <g>
      <ellipse className="iso-ground" cx={shadow.x} cy={shadow.y + 36} rx={460} ry={78} fill="var(--iso-shadow)" />
      <IsoBox
        x={0}
        y={0}
        z={-t}
        w={w}
        d={d}
        h={t}
        top="var(--iso-floor)"
        left="var(--iso-floor-side-l)"
        right="var(--iso-floor-side-r)"
      />
      {lines}
    </g>
  );
}

function Walls() {
  const { w, d, h } = ROOM;
  return (
    <g>
      <IsoBox
        x={-0.3}
        y={0}
        z={0}
        w={0.3}
        d={d}
        h={h}
        top="var(--iso-wall-top)"
        left="var(--iso-wall-side)"
        right="var(--iso-wall)"
      />
      <IsoBox
        x={0}
        y={-0.3}
        z={0}
        w={w}
        d={0.3}
        h={h}
        top="var(--iso-wall-top)"
        left="var(--iso-wall)"
        right="var(--iso-wall-side)"
      />
    </g>
  );
}

function LakeWindow() {
  const { h } = ROOM;
  const { u0, u1, zTop, zBot } = WINDOW;
  const v0 = h - zTop;
  const v1 = h - zBot;
  return (
    <g transform={`matrix(${COS * SCALE} ${SIN * SCALE} 0 ${SCALE} 0 ${-h * SCALE})`}>
      <svg
        className="iso-window-photo"
        x={u0}
        y={v0}
        width={u1 - u0}
        height={v1 - v0}
        viewBox="200 820 3400 760"
        preserveAspectRatio="xMidYMid slice"
      >
        <image href="/hero/west-lake-illustration.webp" width="3840" height="2160" />
      </svg>
      <rect className="iso-window-dusk" x={u0} y={v0} width={u1 - u0} height={v1 - v0} fill="url(#isoDusk)" />
      <rect className="iso-window-sheen" x={u0} y={v0} width={u1 - u0} height={(v1 - v0) * 0.22} fill="url(#isoSheen)" />
    </g>
  );
}

function WindowFrame() {
  const { u0, u1, zTop, zBot } = WINDOW;
  const posts = [0, 1, 2, 3].map((i) => u0 - 0.08 + ((u1 - u0) / 3) * i);
  const railW = u1 - u0 + 0.14;
  return (
    <g>
      <IsoBox
        x={u0 - 0.08}
        y={-0.06}
        z={zBot - 0.12}
        w={railW}
        d={0.32}
        h={0.12}
        top="var(--iso-frame)"
        left="var(--iso-frame-d)"
        right="var(--iso-frame)"
      />
      {posts.map((x) => (
        <IsoBox
          key={x}
          x={x}
          y={-0.05}
          z={zBot}
          w={0.14}
          d={0.18}
          h={zTop - zBot}
          top="var(--iso-frame)"
          left="var(--iso-frame-d)"
          right="var(--iso-frame)"
        />
      ))}
      <IsoBox
        x={u0 - 0.08}
        y={-0.05}
        z={zTop - 0.08}
        w={railW}
        d={0.18}
        h={0.16}
        top="var(--iso-frame)"
        left="var(--iso-frame-d)"
        right="var(--iso-frame)"
      />
      <IsoBox
        x={u0 - 0.08}
        y={-0.05}
        z={zBot}
        w={railW}
        d={0.18}
        h={0.14}
        top="var(--iso-frame)"
        left="var(--iso-frame-d)"
        right="var(--iso-frame)"
      />
    </g>
  );
}

function Workstation({ desk, selected }: { desk: DeskSpec; selected: boolean }) {
  const top = 0.78;
  const monitor =
    desk.screen === "front"
      ? { x: desk.x + (desk.id === "trading" ? 0.28 : 0.62), y: desk.y + desk.d - 0.16, z: top, face: "front" as const }
      : { x: desk.x + desk.w - 0.16, y: desk.y + 0.14, z: top, face: "right" as const };
  const behind = desk.seat.y + 0.15 < desk.y;
  const seat = project(desk.seat.x, desk.seat.y, 0.58);
  const sink = behind ? 22 : 4;
  const sitter = (
    <g data-agent={desk.id}>
      {selected ? (
        <FloorDisc x={desk.seat.x} y={desk.seat.y + 0.05} r={0.5} z={0.02} fill="none" stroke="var(--iso-accent)" strokeWidth={2.4} />
      ) : null}
      <Chair x={desk.seat.x} y={desk.seat.y} />
      <ellipse cx={seat.x} cy={seat.y + 8} rx={22} ry={8} fill="var(--iso-contact)" />
      <g transform={`translate(${seat.x} ${seat.y + sink})`}>
        <Mascot id={desk.id} gaze={desk.gaze} />
      </g>
    </g>
  );
  const furniture = (
    <g>
      <Desk x={desk.x} y={desk.y} w={desk.w} d={desk.d} />
      <Monitor x={monitor.x} y={monitor.y} z={monitor.z} face={monitor.face} />
      {desk.lamp ? <Lamp x={desk.x + desk.w - 0.55} y={desk.y + 0.22} z={top} /> : null}
    </g>
  );
  return behind ? (
    <g>
      {sitter}
      {furniture}
    </g>
  ) : (
    <g>
      {furniture}
      {sitter}
    </g>
  );
}

export default function IsoScene({ selected }: { selected: string }) {
  const { picture, shelf, sofa, rug, plants } = LOUNGE;
  const site = DESKS[0];
  const general = DESKS[1];
  const xbot = DESKS[2];
  const trading = DESKS[3];
  return (
    <svg
      className="iso-scene"
      viewBox={`${VIEW.minX} ${VIEW.minY} ${VIEW.w} ${VIEW.h}`}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="isoDusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--iso-dusk-top)" />
          <stop offset="42%" stopColor="var(--iso-dusk-mid)" />
          <stop offset="100%" stopColor="var(--iso-dusk-bot)" />
        </linearGradient>
        <linearGradient id="isoSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.42} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="isoLampGlow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="var(--iso-accent)" stopOpacity={0.42} />
          <stop offset="100%" stopColor="var(--iso-accent)" stopOpacity={0} />
        </radialGradient>
      </defs>
      <Ground />
      <Walls />
      <LakeWindow />
      <WindowFrame />
      <Picture x={picture.x} y={picture.y} w={picture.w} d={picture.d} h={picture.h} z={picture.z} />
      <Bookshelf x={shelf.x} y={shelf.y} w={shelf.w} d={shelf.d} h={shelf.h} />
      <Plant x={plants[0].x} y={plants[0].y} kind={plants[0].kind} />
      <Plant x={plants[1].x} y={plants[1].y} kind={plants[1].kind} />
      {RACKS.map((rack) => (
        <g key={rack.id}>
          {selected === rack.id ? (
            <FloorDisc
              x={rack.x + rack.w / 2}
              y={rack.y + rack.d / 2}
              r={0.72}
              z={0.02}
              fill="none"
              stroke="var(--iso-accent)"
              strokeWidth={2.4}
            />
          ) : null}
          <Rack x={rack.x} y={rack.y} w={rack.w} d={rack.d} h={rack.h} />
        </g>
      ))}
      <Workstation desk={general} selected={selected === general.id} />
      <Workstation desk={xbot} selected={selected === xbot.id} />
      <FloorDisc x={rug.x} y={rug.y} r={rug.r} z={0.02} fill="var(--iso-rug-edge)" />
      <FloorDisc x={rug.x} y={rug.y} r={rug.r - 0.16} z={0.03} fill="var(--iso-rug)" />
      <Sofa x={sofa.x} y={sofa.y} w={sofa.w} d={sofa.d} />
      <Workstation desk={site} selected={selected === site.id} />
      <CoffeeTable x={rug.x} y={rug.y + 0.05} />
      <Plant x={plants[2].x} y={plants[2].y} kind={plants[2].kind} />
      <Workstation desk={trading} selected={selected === trading.id} />
    </svg>
  );
}
