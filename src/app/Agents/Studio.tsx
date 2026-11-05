import { useContext, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { TranslationKey } from "../constants/translations";
import { DarkModeContext } from "../store/DarkModeContext";
import { LanguageContext } from "../store/LanguageContext";
import { readRoomColors, shanghaiHour, timeOfDay } from "./colors";
import { paintRoom, paintShell, STATE_GLYPH, type NoteFlight, type SceneAgent, type Speech } from "./draw";
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

const LEGEND_STATES: AgentState[] = [
  "idle",
  "thinking",
  "coding",
  "executing",
  "researching",
  "planning",
  "deploying",
  "meeting",
  "waiting_approval",
  "error",
  "done",
];

function relativeSince(iso: string | undefined, zh: boolean): string {
  if (!iso) return "";
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 45) return zh ? "刚刚" : "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return zh ? `${minutes} 分钟前` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return zh ? `${hours} 小时前` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return zh ? `${days} 天前` : `${days}d ago`;
}

function coderTone(agent: StudioAgent): string {
  if (agent.kind !== "coder") return "";
  return agent.seat % 2 === 0 ? "is-coder-a" : "is-coder-b";
}

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
  const [legendOpen, setLegendOpen] = useState(false);
  const [liveText, setLiveText] = useState("");
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
  const prevStatesRef = useRef(new Map<string, AgentState>());
  const announcedRef = useRef(new Map<string, number>());
  const seenHandoffsRef = useRef(new Set<string>());

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
    const now = Date.now();
    const prev = prevStatesRef.current;
    const quiet = prev.size === 0;
    const next = new Map<string, AgentState>();
    let message = "";
    for (const agent of snapshot.agents) {
      next.set(agent.id, agent.state);
      if (quiet || prev.get(agent.id) === agent.state) continue;
      if (agent.state !== "waiting_approval" && agent.state !== "error") continue;
      const last = announcedRef.current.get(agent.id) ?? 0;
      if (now - last < 10000) continue;
      announcedRef.current.set(agent.id, now);
      if (!message) message = `${agent.alias} · ${t(STATE_KEY[agent.state])}`;
    }
    prevStatesRef.current = next;

    const feed = feedRef.current;
    if (!message && feed) {
      for (const event of feed.getEvents(language)) {
        if (event.type !== "handoff") continue;
        if (now - event.at > 4000) continue;
        const key = `${event.at}:${event.from}:${event.to}`;
        if (seenHandoffsRef.current.has(key)) continue;
        seenHandoffsRef.current.add(key);
        const from = snapshot.agents.find((agent) => agent.id === event.from)?.alias ?? event.from;
        const to = snapshot.agents.find((agent) => agent.id === event.to)?.alias ?? event.to;
        message = `${t("agentsHandoff")} ${from} → ${to}`;
        break;
      }
    }
    if (message) setLiveText(message);
  }, [snapshot, language]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSelected("");
      setDoorOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
            if (pose) speeches.push({ id: event.id, x: pose.x, y: pose.y, text: event.text });
          }
        }
      }

      const sceneAgents: SceneAgent[] = snap.agents.map((agent) => {
        const pose = placement.poses.get(agent.id);
        return pose ? { ...agent, pose } : agent;
      });
      paintRoom(ctx, layout, colors, tod, dark, sceneAgents, tick, reduce, selectedRef.current, notes, speeches, t("agentsTea"));

      const hidden = new Set(placement.hidden.map((agent) => agent.id));
      const placed: { node: HTMLButtonElement; cx: number; cy: number }[] = [];
      for (const agent of snap.agents) {
        const node = tagRefs.current.get(agent.id);
        if (!node) continue;
        node.classList.remove("is-nudged");
        const pose = placement.poses.get(agent.id);
        const parentId = agent.role === "sub" ? agent.parentId : undefined;
        const parentPose = parentId ? placement.poses.get(parentId) : undefined;
        const asApprentice =
          !!parentId && agent.state !== "offline" && !hidden.has(agent.id) && !!parentPose && !hidden.has(parentId);
        if (parentId && agent.state !== "offline" && !asApprentice) {
          node.hidden = true;
          continue;
        }
        const seatIndex = placement.seatOf.get(agent.id) ?? agent.seat;
        const seat = layout.seats[seatIndex];
        const x = asApprentice && parentPose ? parentPose.x + 10 : pose?.x ?? seat?.fx ?? 0;
        const baseY = asApprentice && parentPose ? parentPose.y + 4 : pose?.y ?? seat?.feet ?? 0;
        const y = baseY + 8;
        const localX = x - live.viewX;
        const localY = y - live.viewY;
        const onStage = !hidden.has(agent.id) && localX > -30 && localX < live.viewW + 30 && localY > -10 && localY < live.viewH + 16;
        node.hidden = !onStage;
        node.style.left = `${localX * live.scale}px`;
        node.style.top = `${localY * live.scale}px`;
        node.classList.toggle("is-low", localY < 120);
        node.classList.toggle("is-offline", agent.state === "offline");
        if (onStage) placed.push({ node, cx: localX * live.scale, cy: localY * live.scale });
      }
      // Nameplates are ~50px wide; use a wider pair threshold so meeting pairs
      // (Coder-2/Pixel) still stagger on mobile when centers are ~40–50px apart.
      for (let i = 0; i < placed.length; i += 1) {
        for (let j = i + 1; j < placed.length; j += 1) {
          const a = placed[i];
          const b = placed[j];
          if (Math.abs(a.cy - b.cy) > 14) continue;
          if (Math.abs(a.cx - b.cx) >= 56) continue;
          b.node.classList.add("is-nudged");
          const top = Number.parseFloat(b.node.style.top || "0") || b.cy;
          b.node.style.top = `${top + 16}px`;
          b.cy += 16;
        }
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
  const selectedAgent = snapshot.agents.find((agent) => agent.id === selected) ?? null;
  const since = selectedAgent ? relativeSince(selectedAgent.since, language === "zh") : "";
  const progressPct =
    selectedAgent && typeof selectedAgent.progress === "number"
      ? Math.round(Math.min(1, Math.max(0, selectedAgent.progress)) * 100)
      : null;

  const jump = (next: number) => {
    panRef.current = clamp(next, view.maxPan);
    setPan(panRef.current);
  };

  const panToDoor = () => {
    if (!view.mobile && !view.pannable) return;
    panRef.current = clamp(layout.door.x + 14 - view.viewW / 2, view.maxPan);
    setPan(panRef.current);
  };

  const focusAgent = (agent: StudioAgent) => {
    if (hiddenIds.has(agent.id)) {
      setDoorOpen(true);
      panToDoor();
      return;
    }
    setSelected(agent.id);
    const seat = layout.seats[Math.min(agent.seat, layout.seats.length - 1)];
    const x = seat?.fx ?? 0;
    if (view.mobile || view.pannable) panRef.current = clamp(x - view.viewW / 2, view.maxPan);
    setPan(panRef.current);
    window.setTimeout(() => tagRefs.current.get(agent.id)?.focus(), 40);
  };

  const selectAgent = (agent: StudioAgent) => {
    if (selected === agent.id) {
      setSelected("");
      return;
    }
    focusAgent(agent);
  };

  const focusState = (state: AgentState) => {
    const agent = snapshot.agents.find((item) => item.state === state);
    if (agent) focusAgent(agent);
  };

  const toggleDoor = () => {
    if (!doorOpen) panToDoor();
    setDoorOpen((open) => !open);
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
      <p className="studio-live" aria-live="polite" aria-atomic="true">
        {liveText}
      </p>
      <div className="studio-summary">
        <span>
          <i className="dot online" aria-hidden="true" />
          {t("agentsOnline")} {online}
        </span>
        <span>
          <i className="dot working" aria-hidden="true" />
          {t("agentsWorking")} {working}
        </span>
        <button type="button" className="studio-count" onClick={() => focusState("waiting_approval")} disabled={waiting === 0}>
          <i className="dot waiting" aria-hidden="true" />
          {t("agentsWaiting")} {waiting}
        </button>
        <button type="button" className="studio-count" onClick={() => focusState("error")} disabled={errors === 0}>
          <i className="dot error" aria-hidden="true" />
          {t("agentsError")} {errors}
        </button>
        <button
          type="button"
          className="studio-legend-toggle"
          aria-expanded={legendOpen}
          aria-controls="studio-legend"
          onClick={() => setLegendOpen((open) => !open)}
        >
          {t("agentsLegend")}
        </button>
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
            {layout.expanded && pan <= 0 && <span className="studio-bay-hint">{t("agentsBayHint")}</span>}
            <button type="button" onClick={() => jump(panRef.current - 140)} aria-label={t("agentsPanLeft")} disabled={pan <= 0}>
              ←
            </button>
            <button type="button" onClick={() => jump(panRef.current + 140)} aria-label={t("agentsPanRight")} disabled={pan >= view.maxPan}>
              →
            </button>
          </span>
        )}
      </div>
      {legendOpen && (
        <div className="studio-legend" id="studio-legend">
          <p className="studio-legend-title">{t("agentsLegendTitle")}</p>
          <ul className="studio-legend-status">
            {LEGEND_STATES.map((state) => (
              <li key={state}>
                <b aria-hidden="true">{STATE_GLYPH[state]}</b>
                <span>{t(STATE_KEY[state])}</span>
              </li>
            ))}
          </ul>
          <ul className="studio-legend-zones">
            <li>{t("agentsZonePlanning")}</li>
            <li>{t("agentsZoneResearch")}</li>
            <li>{t("agentsZoneDeploy")}</li>
          </ul>
        </div>
      )}

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
            {snapshot.agents.map((agent) => {
              const tone = coderTone(agent);
              return (
                <button
                  key={agent.id}
                  type="button"
                  className={["agent-tag", agent.kind === "coder" ? "is-coder" : "", tone, selected === agent.id ? "is-selected" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  ref={(node) => {
                    if (node) tagRefs.current.set(agent.id, node);
                    else tagRefs.current.delete(agent.id);
                  }}
                  aria-label={`${agent.alias}, ${t(STATE_KEY[agent.state])}${agent.task ? `. ${agent.task}` : ""}`}
                  aria-pressed={selected === agent.id}
                  onClick={() => setSelected(agent.id)}
                >
                  <span className={["agent-tag-name", tone].filter(Boolean).join(" ")}>{agent.alias}</span>
                  <span className="agent-card">
                    <strong>{agent.alias}</strong>
                    <em className={agent.state === "waiting_approval" ? "is-wait" : agent.state === "error" ? "is-err" : undefined}>
                      {t(STATE_KEY[agent.state])}
                    </em>
                    {agent.task && <span>{agent.task}</span>}
                  </span>
                </button>
              );
            })}
            {hidden.length > 0 && (
              <button
                type="button"
                className="studio-door"
                ref={doorRef}
                aria-expanded={doorOpen}
                onClick={toggleDoor}
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

      {selectedAgent && (
        <div className="studio-detail">
          <strong>{selectedAgent.alias}</strong>
          <em>{t(STATE_KEY[selectedAgent.state])}</em>
          {selectedAgent.task && <span>{selectedAgent.task}</span>}
          {since && (
            <span>
              {t("agentsSince")} {since}
            </span>
          )}
          {progressPct !== null && (
            <span className="studio-detail-progress" aria-hidden="true">
              <i style={{ width: `${progressPct}%` }} />
            </span>
          )}
          {selectedAgent.role === "sub" && <span className="studio-detail-sub">{t("agentsApprentice")}</span>}
          <button type="button" className="studio-detail-clear" aria-label={t("close")} onClick={() => setSelected("")}>
            ×
          </button>
        </div>
      )}

      <ul className="studio-roster-sr">
        {snapshot.agents.map((agent) => (
          <li key={agent.id}>
            <button
              type="button"
              onClick={() => selectAgent(agent)}
              aria-label={`${agent.alias}, ${t(STATE_KEY[agent.state])}${agent.task ? `. ${agent.task}` : ""}`}
            >
              {agent.alias}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
