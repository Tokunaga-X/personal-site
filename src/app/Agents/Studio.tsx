import { useContext, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { TranslationKey } from "../constants/translations";
import { DarkModeContext } from "../store/DarkModeContext";
import { LanguageContext } from "../store/LanguageContext";
import { readRoomColors, shanghaiHour, timeOfDay } from "./colors";
import { paintRoom, paintShell, type NoteFlight, type SceneAgent, type Speech } from "./draw";
import { BASE_W, ROOM_H, buildLayout, type RoomLayout } from "./layout";
import { createMockFeed, previewSnapshot } from "./mockFeed";
import { assignSeats, createSim, stepSim, type Sim } from "./sim";
import type { AgentState, StudioAgent, StudioFeed, StudioSnapshot } from "./types";

const STATE_KEY: Record<AgentState, TranslationKey> = {
  idle: "agentStateIdle",
  thinking: "agentStateThinking",
  coding: "agentStateCoding",
  executing: "agentStateExecuting",
  researching: "agentStateResearching",
  planning: "agentStatePlanning",
  deploying: "agentStateDeploying",
  meeting: "agentStateMeeting",
  waiting_approval: "agentStateWaiting",
  error: "agentStateError",
  done: "agentStateDone",
  offline: "agentStateOffline",
};

const WORKING = new Set<AgentState>(["thinking", "coding", "executing", "researching", "planning", "deploying", "meeting"]);

type View = {
  viewX: number;
  viewY: number;
  viewW: number;
  viewH: number;
  scale: number;
  dpr: number;
  mobile: boolean;
  tiny: boolean;
  pannable: boolean;
  maxPan: number;
};

function measureView(cssWidth: number, viewport: number, roomW: number): View {
  const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
  const width = Math.max(160, cssWidth);
  if (viewport < 320) {
    const viewW = Math.min(300, width);
    return { viewX: 0, viewY: 96, viewW, viewH: 214, scale: 1, dpr, mobile: false, tiny: true, pannable: false, maxPan: 0 };
  }
  if (viewport <= 700) {
    const half = BASE_W / 2;
    const scale = Math.max(1, Math.floor(width / half));
    const viewW = scale >= 2 ? half : Math.min(roomW, Math.floor(width));
    return {
      viewX: 0,
      viewY: 0,
      viewW,
      viewH: ROOM_H,
      scale,
      dpr,
      mobile: true,
      tiny: false,
      pannable: false,
      maxPan: Math.max(0, roomW - viewW),
    };
  }
  const viewW = Math.min(roomW, BASE_W);
  const scale = Math.max(1, Math.floor(width / viewW));
  return {
    viewX: 0,
    viewY: 0,
    viewW,
    viewH: ROOM_H,
    scale,
    dpr,
    mobile: false,
    tiny: false,
    pannable: roomW - viewW > 8,
    maxPan: Math.max(0, roomW - viewW),
  };
}

function clamp(value: number, max: number) {
  return Math.min(max, Math.max(0, value));
}

export default function Studio() {
  const { language, t } = useContext(LanguageContext);
  const { darkMode } = useContext(DarkModeContext);
  const [snapshot, setSnapshot] = useState<StudioSnapshot>(() => previewSnapshot(language));
  const [pan, setPan] = useState(0);
  const [selected, setSelected] = useState("");
  const [doorOpen, setDoorOpen] = useState(false);
  const [box, setBox] = useState({ width: 640, viewport: 1024 });

  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLCanvasElement | null>(null);
  const shellKey = useRef("");
  const feedRef = useRef<StudioFeed | null>(null);
  const simRef = useRef<Sim>(createSim());
  const layoutRef = useRef<RoomLayout | null>(null);
  const tagRefs = useRef(new Map<string, HTMLButtonElement>());
  const doorRef = useRef<HTMLButtonElement>(null);
  const panRef = useRef(0);
  const selectedRef = useRef("");
  const languageRef = useRef(language);
  const darkRef = useRef(darkMode);
  const runningRef = useRef(false);
  const lastRef = useRef(0);
  const dragRef = useRef<{ x: number; y: number; pan: number; pointer: number } | null>(null);

  languageRef.current = language;
  darkRef.current = darkMode;
  selectedRef.current = selected;

  const roomGuess = snapshot.agents.length > 10 ? BASE_W + 160 : BASE_W;
  const view = measureView(box.width, box.viewport, layoutRef.current?.w ?? roomGuess);

  useEffect(() => {
    const feed = createMockFeed();
    feedRef.current = feed;
    const pull = () => setSnapshot(feed.getSnapshot(languageRef.current));
    pull();
    const unsubscribe = feed.subscribe(pull);
    return () => {
      unsubscribe();
      feed.destroy();
      feedRef.current = null;
    };
  }, []);

  useEffect(() => {
    const feed = feedRef.current;
    if (feed) setSnapshot(feed.getSnapshot(language));
  }, [language]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const apply = () => setBox({ width: stage.clientWidth, viewport: window.innerWidth });
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(stage);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  useEffect(() => {
    panRef.current = clamp(panRef.current, view.maxPan);
    setPan(panRef.current);
  }, [view.maxPan]);

  useEffect(() => {
    const root = stageRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    let frame = 0;
    let stopped = false;

    const draw = (time: number) => {
      const feed = feedRef.current;
      const ctx = canvas.getContext("2d");
      if (!feed || !ctx) return;
      const lang = languageRef.current;
      const snap = feed.getSnapshot(lang);
      const expanded = snap.agents.length > 10;
      if (!layoutRef.current || layoutRef.current.expanded !== expanded) {
        layoutRef.current = buildLayout(expanded);
        simRef.current = createSim();
      }
      const layout = layoutRef.current;
      const cssWidth = stageRef.current?.clientWidth || box.width;
      const live = measureView(cssWidth, window.innerWidth, layout.w);
      live.viewX = live.tiny ? 0 : Math.round(clamp(panRef.current, live.maxPan));
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || live.tiny;
      const previous = lastRef.current;
      lastRef.current = time;
      const dt = runningRef.current && previous ? (time - previous) / 1000 : 0;
      const cap = live.mobile || live.tiny ? 2 : 3;
      const placement = stepSim(simRef.current, layout, snap.agents, dt, cap, reduce);
      const dark = document.documentElement.classList.contains("dark");
      const tod = timeOfDay(shanghaiHour());
      const colors = readRoomColors(dark);
      const dpr = live.dpr;
      const pixelW = Math.max(1, Math.floor(live.viewW * live.scale * dpr));
      const pixelH = Math.max(1, Math.floor(live.viewH * live.scale * dpr));
      if (canvas.width !== pixelW) canvas.width = pixelW;
      if (canvas.height !== pixelH) canvas.height = pixelH;
      canvas.style.width = `${live.viewW * live.scale}px`;
      canvas.style.height = `${live.viewH * live.scale}px`;

      const key = `${colors.bg}|${colors.accent}|${colors.wood}|${tod}|${layout.w}|${live.scale}|${dpr}|${dark ? 1 : 0}`;
      if (shellKey.current !== key) {
        const shell = shellRef.current ?? document.createElement("canvas");
        shell.width = Math.floor(layout.w * live.scale * dpr);
        shell.height = Math.floor(layout.h * live.scale * dpr);
        const shellCtx = shell.getContext("2d");
        if (shellCtx) {
          shellCtx.setTransform(live.scale * dpr, 0, 0, live.scale * dpr, 0, 0);
          shellCtx.imageSmoothingEnabled = false;
          paintShell(shellCtx, layout, colors, tod, dark);
        }
        shellRef.current = shell;
        shellKey.current = key;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const shell = shellRef.current;
      if (shell) {
        const sx = live.viewX * live.scale * dpr;
        const sy = live.viewY * live.scale * dpr;
        ctx.drawImage(shell, sx, sy, pixelW, pixelH, 0, 0, pixelW, pixelH);
      }
      ctx.setTransform(live.scale * dpr, 0, 0, live.scale * dpr, -live.viewX * live.scale * dpr, -live.viewY * live.scale * dpr);

      const tick = Math.floor(time / 120);
      const now = Date.now();
      const events = feed.getEvents(lang);
      const notes: NoteFlight[] = [];
      const speeches: Speech[] = [];
      if (!reduce) {
        for (const event of events) {
          if (event.type === "handoff" && now - event.at < 2300) {
            const from = placement.poses.get(event.from);
            const to = placement.poses.get(event.to);
            const door = { x: layout.door.x + 14, y: layout.door.y + 16 };
            notes.push({
              x0: from ? from.x : door.x,
              y0: from ? from.y : door.y,
              x1: to ? to.x : door.x,
              y1: to ? to.y : door.y,
              u: (now - event.at) / 1500,
            });
          }
          if (event.type === "message" && now - event.at < 2200) {
            const pose = placement.poses.get(event.id);
            if (pose) speeches.push({ x: pose.x, y: pose.y, text: event.text });
          }
        }
      }

      const sceneAgents: SceneAgent[] = snap.agents.map((agent) => {
        const pose = placement.poses.get(agent.id);
        return pose ? { ...agent, pose } : agent;
      });
      paintRoom(ctx, layout, colors, tod, dark, sceneAgents, tick, reduce, selectedRef.current, notes, speeches);

      const hidden = new Set(placement.hidden.map((agent) => agent.id));
      for (const agent of snap.agents) {
        const node = tagRefs.current.get(agent.id);
        if (!node) continue;
        const pose = placement.poses.get(agent.id);
        const seatIndex = placement.seatOf.get(agent.id) ?? agent.seat;
        const seat = layout.seats[seatIndex];
        const x = pose?.x ?? seat?.fx ?? 0;
        const y = (pose?.y ?? seat?.feet ?? 0) + 8;
        const localX = x - live.viewX;
        const localY = y - live.viewY;
        const onStage = !hidden.has(agent.id) && localX > -30 && localX < live.viewW + 30 && localY > -10 && localY < live.viewH + 16;
        node.hidden = !onStage;
        node.style.left = `${localX * live.scale}px`;
        node.style.top = `${localY * live.scale}px`;
        node.classList.toggle("is-low", localY < 120);
        node.classList.toggle("is-offline", agent.state === "offline");
      }
      const door = doorRef.current;
      if (door) {
        const localX = layout.door.x + 2 - live.viewX;
        const localY = layout.door.y - 14 - live.viewY;
        const onStage = localX > -20 && localX < live.viewW && localY > -20 && localY < live.viewH;
        door.hidden = !onStage;
        door.style.left = `${localX * live.scale}px`;
        door.style.top = `${localY * live.scale}px`;
      }
    };

    const loop = (time: number) => {
      if (stopped) return;
      draw(time);
      if (runningRef.current) frame = requestAnimationFrame(loop);
    };

    const syncRunning = () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tiny = window.innerWidth < 320;
      const visible = !document.hidden;
      const rect = root.getBoundingClientRect();
      const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
      const next = visible && onScreen && !reduce && !tiny;
      if (next && !runningRef.current) {
        runningRef.current = true;
        lastRef.current = 0;
        frame = requestAnimationFrame(loop);
        return;
      }
      if (!next && runningRef.current) {
        runningRef.current = false;
        cancelAnimationFrame(frame);
        lastRef.current = 0;
      }
      draw(performance.now());
    };

    const observer = new IntersectionObserver(syncRunning, { threshold: 0 });
    observer.observe(root);
    document.addEventListener("visibilitychange", syncRunning);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", syncRunning);
    syncRunning();

    return () => {
      stopped = true;
      runningRef.current = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncRunning);
      motion.removeEventListener("change", syncRunning);
    };
  }, [box.width, box.viewport, darkMode, language, snapshot, pan]);

  const layout = layoutRef.current ?? buildLayout(snapshot.agents.length > 10);
  const assigned = assignSeats(layout, snapshot.agents);
  const hiddenIds = new Set(assigned.hidden.map((agent) => agent.id));

  const online = snapshot.agents.filter((agent) => agent.state !== "offline").length;
  const working = snapshot.agents.filter((agent) => WORKING.has(agent.state)).length;
  const waiting = snapshot.agents.filter((agent) => agent.state === "waiting_approval").length;
  const errors = snapshot.agents.filter((agent) => agent.state === "error").length;
  const hidden = snapshot.agents.filter((agent) => hiddenIds.has(agent.id));

  const jump = (next: number) => {
    panRef.current = clamp(next, view.maxPan);
    setPan(panRef.current);
  };

  const showAgent = (agent: StudioAgent) => {
    if (hiddenIds.has(agent.id)) {
      setDoorOpen(true);
      return;
    }
    setSelected(agent.id);
    const seat = layout.seats[Math.min(agent.seat, layout.seats.length - 1)];
    const x = seat?.fx ?? 0;
    if (view.mobile || view.pannable) panRef.current = clamp(x - view.viewW / 2, view.maxPan);
    setPan(panRef.current);
    window.setTimeout(() => tagRefs.current.get(agent.id)?.focus(), 40);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    dragRef.current = { x: event.clientX, y: event.clientY, pan: panRef.current, pointer: event.pointerId };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointer !== event.pointerId || !view.pannable) return;
    panRef.current = clamp(drag.pan - (event.clientX - drag.x) / Math.max(1, view.scale), view.maxPan);
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (view.mobile && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      panRef.current = dx < 0 ? view.maxPan : 0;
    }
    setPan(panRef.current);
  };

  return (
    <div className="studio">
      <div className="studio-summary">
        <span>
          <i className="dot online" aria-hidden="true" />
          {t("agentsOnline")} {online}
        </span>
        <span>
          <i className="dot working" aria-hidden="true" />
          {t("agentsWorking")} {working}
        </span>
        <span>
          <i className="dot waiting" aria-hidden="true" />
          {t("agentsWaiting")} {waiting}
        </span>
        <span>
          <i className="dot error" aria-hidden="true" />
          {t("agentsError")} {errors}
        </span>
        <span className="studio-demo">{t("agentsDemo")}</span>
        {view.mobile && (
          <span className="studio-halves" role="group" aria-label={t("agentsScene")}>
            <button type="button" aria-pressed={pan <= 0} onClick={() => jump(0)}>
              {t("agentsDesks")}
            </button>
            <button type="button" aria-pressed={pan > 0} onClick={() => jump(Math.min(view.maxPan, BASE_W / 2))}>
              {t("agentsLounge")}
            </button>
          </span>
        )}
        {view.pannable && (
          <span className="studio-pan">
            <button type="button" onClick={() => jump(panRef.current - 140)} aria-label={t("agentsPanLeft")} disabled={pan <= 0}>
              ←
            </button>
            <button type="button" onClick={() => jump(panRef.current + 140)} aria-label={t("agentsPanRight")} disabled={pan >= view.maxPan}>
              →
            </button>
          </span>
        )}
      </div>

      <div className="studio-stage" ref={stageRef}>
        <div
          className={view.pannable ? "studio-frame is-pannable" : "studio-frame"}
          ref={frameRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <canvas ref={canvasRef} role="img" aria-label={t("agentsScene")} />
          <div className="studio-tags">
            {snapshot.agents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                className="agent-tag"
                ref={(node) => {
                  if (node) tagRefs.current.set(agent.id, node);
                  else tagRefs.current.delete(agent.id);
                }}
                aria-label={`${agent.alias}, ${t(STATE_KEY[agent.state])}${agent.task ? `. ${agent.task}` : ""}`}
                aria-pressed={selected === agent.id}
                onClick={() => setSelected(agent.id)}
              >
                <span className="agent-tag-name">{agent.alias}</span>
                <span className="agent-card">
                  <strong>{agent.alias}</strong>
                  <em className={agent.state === "waiting_approval" ? "is-wait" : agent.state === "error" ? "is-err" : undefined}>
                    {t(STATE_KEY[agent.state])}
                  </em>
                  {agent.task && <span>{agent.task}</span>}
                </span>
              </button>
            ))}
            {hidden.length > 0 && (
              <button
                type="button"
                className="studio-door"
                ref={doorRef}
                aria-expanded={doorOpen}
                onClick={() => setDoorOpen((open) => !open)}
              >
                +{hidden.length}
              </button>
            )}
          </div>
          {doorOpen && hidden.length > 0 && (
            <div className="studio-door-card">
              {hidden.map((agent) => (
                <p key={agent.id}>
                  {agent.alias} · {t(STATE_KEY[agent.state])}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <ul className="agent-roster">
        {snapshot.agents.map((agent) => {
          const behind = hiddenIds.has(agent.id);
          return (
            <li key={agent.id}>
              <button
                type="button"
                className={selected === agent.id ? "is-current" : undefined}
                onClick={() => showAgent(agent)}
              >
                <span className="agent-roster-alias">{agent.alias}</span>
                <span> · {t(STATE_KEY[agent.state])}</span>
                {behind && <span> · {t("agentsBehind")}</span>}
                {agent.task && <span className="agent-roster-task"> — {agent.task}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
