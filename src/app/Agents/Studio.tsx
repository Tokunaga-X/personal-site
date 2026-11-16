import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { SupportedLanguage, TranslationKey } from "../constants/translations";
import {
  BOTS,
  SERVERS,
  idleStatus,
  isAgentState,
  type AgentId,
  type AgentState,
  type StudioBot,
} from "../data/agents";
import { DarkModeContext } from "../store/DarkModeContext";
import { LanguageContext } from "../store/LanguageContext";
import { readRoomColors, shanghaiHour, timeOfDay } from "./colors";
import { paintRoom, paintShell, type SceneAgent } from "./draw";
import { BASE_W, ROOM_H, buildLayout, type RoomLayout } from "./layout";
import { createSim, stepSim, type Sim } from "./sim";
import type { StudioAgent } from "./types";

const STATE_KEY: Record<AgentState, TranslationKey> = {
  idle: "agentStateIdle",
  working: "agentStateWorking",
  chatting: "agentStateChatting",
};

const POLL_MS = 20_000;

type OpenId = AgentId | (typeof SERVERS)[number]["id"] | "";

function readStatus(data: unknown): Record<AgentId, AgentState> {
  const next = idleStatus();
  if (!data || typeof data !== "object") return next;
  const source = data as Record<string, unknown>;
  (Object.keys(next) as AgentId[]).forEach((id) => {
    const value = source[id];
    if (isAgentState(value)) next[id] = value;
  });
  return next;
}

function scheduleText(
  bot: StudioBot,
  language: SupportedLanguage,
  t: (key: TranslationKey) => string,
): string {
  if (bot.schedule.length === 0) return t("agentsNoTasks");
  const count = bot.schedule.length;
  const head = count === 1 ? t("agentsTaskOne") : t("agentsTaskMany").replace("{n}", String(count));
  const times = bot.schedule.map((item) => item.label[language]).join(" · ");
  return `${head} · ${times}`;
}

export default function Studio() {
  const { language, t } = useContext(LanguageContext);
  const { darkMode } = useContext(DarkModeContext);
  const [status, setStatus] = useState<Record<AgentId, AgentState>>(idleStatus);
  const [openId, setOpenId] = useState<OpenId>("");
  const [live, setLive] = useState("");
  const [box, setBox] = useState(640);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLCanvasElement | null>(null);
  const shellKey = useRef("");
  const simRef = useRef<Sim>(createSim());
  const layoutRef = useRef<RoomLayout>(buildLayout());
  const botRefs = useRef(new Map<string, HTMLButtonElement>());
  const serverRefs = useRef(new Map<string, HTMLButtonElement>());
  const agentsRef = useRef<StudioAgent[]>([]);
  const selectedRef = useRef("");
  const teaRef = useRef("");
  const liveRef = useRef("");
  const runningRef = useRef(false);
  const lastRef = useRef(0);

  const agents: StudioAgent[] = BOTS.map((bot, index) => ({
    id: bot.id,
    alias: bot.name[language],
    kind: bot.id,
    hue: bot.hue,
    seat: index,
    state: status[bot.id],
  }));
  agentsRef.current = agents;
  selectedRef.current = openId;
  teaRef.current = t("agentsTea");
  const statusKey = BOTS.map((bot) => status[bot.id]).join(".");

  const openBot = BOTS.find((bot) => bot.id === openId);
  const openServer = SERVERS.find((server) => server.id === openId);
  const open = openBot
    ? { name: openBot.name[language], intro: openBot.intro[language] }
    : openServer
      ? { name: openServer.name[language], intro: openServer.intro[language] }
      : null;

  useEffect(() => {
    let timer = 0;
    let cancelled = false;

    const pull = () => {
      fetch("/api/agents", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data) setStatus(readStatus(data));
        })
        .catch(() => {
          /* stay on the last known status; a missing store reads as idle */
        });
    };

    const arm = () => {
      window.clearInterval(timer);
      if (document.hidden) return;
      pull();
      timer = window.setInterval(() => {
        if (!document.hidden) pull();
      }, POLL_MS);
    };

    const onVis = () => {
      if (document.hidden) window.clearInterval(timer);
      else arm();
    };

    arm();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    const text = BOTS.map((bot) => `${bot.name[language]} ${t(STATE_KEY[status[bot.id]])}`).join(", ");
    if (liveRef.current && liveRef.current !== text) setLive(text);
    liveRef.current = text;
  }, [status, language, t]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const apply = () => setBox(stage.clientWidth);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!openId) return;
    cardRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const id = openId;
      setOpenId("");
      window.requestAnimationFrame(() => {
        botRefs.current.get(id)?.focus();
        serverRefs.current.get(id)?.focus();
      });
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (cardRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest(".agent-tag, .server-tag")) return;
      setOpenId("");
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [openId]);

  useLayoutEffect(() => {
    const root = stageRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    let frame = 0;
    let stopped = false;
    const layout = layoutRef.current;

    const draw = (time: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const cssWidth = stageRef.current?.clientWidth || box;
      const width = Math.max(160, cssWidth);
      const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
      const scale = width >= layout.w ? Math.max(1, Math.floor(width / layout.w)) : width / layout.w;
      const paint = (scale >= 1 ? Math.floor(scale) : 1) * dpr;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const previous = lastRef.current;
      lastRef.current = time;
      const dt = runningRef.current && previous ? (time - previous) / 1000 : 0;
      const cap = scale < 1 ? 2 : 3;
      const placement = stepSim(simRef.current, layout, agentsRef.current, dt, cap, reduce);
      const dark = document.documentElement.classList.contains("dark");
      const tod = timeOfDay(shanghaiHour());
      const colors = readRoomColors(dark);
      const pixelW = Math.max(1, Math.floor(layout.w * paint));
      const pixelH = Math.max(1, Math.floor(layout.h * paint));
      if (canvas.width !== pixelW) canvas.width = pixelW;
      if (canvas.height !== pixelH) canvas.height = pixelH;
      canvas.style.width = `${layout.w * scale}px`;
      canvas.style.height = `${layout.h * scale}px`;

      const key = `${colors.bg}|${colors.accent}|${colors.wood}|${tod}|${paint}|${dark ? 1 : 0}`;
      if (shellKey.current !== key) {
        const shell = shellRef.current ?? document.createElement("canvas");
        shell.width = pixelW;
        shell.height = pixelH;
        const shellCtx = shell.getContext("2d");
        if (shellCtx) {
          shellCtx.setTransform(paint, 0, 0, paint, 0, 0);
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
      if (shell) ctx.drawImage(shell, 0, 0);
      ctx.setTransform(paint, 0, 0, paint, 0, 0);

      const sceneAgents: SceneAgent[] = agentsRef.current.map((agent) => {
        const pose = placement.poses.get(agent.id);
        return pose ? { ...agent, pose } : agent;
      });
      paintRoom(ctx, layout, colors, tod, dark, sceneAgents, Math.floor(time / 120), reduce, selectedRef.current, teaRef.current);

      const placed: { node: HTMLButtonElement; cx: number; cy: number }[] = [];
      for (const agent of agentsRef.current) {
        const node = botRefs.current.get(agent.id);
        if (!node) continue;
        const pose = placement.poses.get(agent.id);
        const seat = layout.seats[placement.seatOf.get(agent.id) ?? agent.seat];
        const x = pose?.x ?? seat?.fx ?? 0;
        const y = (pose?.y ?? seat?.feet ?? 0) + 8;
        node.hidden = false;
        node.dataset.side = x > layout.w * 0.55 ? "east" : "west";
        node.style.left = `${x * scale}px`;
        node.style.top = `${y * scale}px`;
        node.style.height = `${56 * scale}px`;
        placed.push({ node, cx: x * scale, cy: y * scale });
      }
      for (let i = 0; i < placed.length; i += 1) {
        for (let j = i + 1; j < placed.length; j += 1) {
          const a = placed[i];
          const b = placed[j];
          if (Math.abs(a.cy - b.cy) > 18 || Math.abs(a.cx - b.cx) >= 96) continue;
          b.node.style.top = `${b.cy + 14}px`;
          b.cy += 14;
        }
      }
      for (const machine of layout.machines) {
        const node = serverRefs.current.get(machine.id);
        if (!node) continue;
        node.hidden = false;
        node.style.left = `${machine.x * scale}px`;
        node.style.top = `${machine.y * scale}px`;
        node.style.width = `${machine.w * scale}px`;
        node.style.height = `${machine.h * scale}px`;
      }
    };

    const loop = (time: number) => {
      if (stopped) return;
      draw(time);
      if (runningRef.current) frame = requestAnimationFrame(loop);
    };

    const syncRunning = () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const visible = !document.hidden;
      const rect = root.getBoundingClientRect();
      const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
      const next = visible && onScreen && !reduce;
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
  }, [box, darkMode, language, statusKey]);

  const toggle = (id: OpenId) => {
    setOpenId((current) => (current === id ? "" : id));
  };

  return (
    <div className="studio">
      <p className="studio-live" aria-live="polite">
        {live}
      </p>
      <div className="studio-stage" ref={stageRef}>
        <div className="studio-frame">
          <canvas ref={canvasRef} aria-hidden="true" />
          <div className="studio-tags">
            {BOTS.map((bot) => {
              const state = status[bot.id];
              const name = bot.name[language];
              return (
                <button
                  key={bot.id}
                  type="button"
                  className={openId === bot.id ? "agent-tag is-selected" : "agent-tag"}
                  ref={(node) => {
                    if (node) botRefs.current.set(bot.id, node);
                    else botRefs.current.delete(bot.id);
                  }}
                  aria-label={`${name}, ${t(STATE_KEY[state])}`}
                  aria-describedby={`agent-tip-${bot.id}`}
                  aria-expanded={openId === bot.id}
                  aria-controls={openId === bot.id ? "studio-intro" : undefined}
                  onClick={() => toggle(bot.id)}
                >
                  <span className="agent-tip" role="tooltip" id={`agent-tip-${bot.id}`}>
                    {scheduleText(bot, language, t)}
                  </span>
                  <span className="agent-tag-name">{name}</span>
                </button>
              );
            })}
            {SERVERS.map((server) => (
              <button
                key={server.id}
                type="button"
                className={openId === server.id ? "server-tag is-selected" : "server-tag"}
                ref={(node) => {
                  if (node) serverRefs.current.set(server.id, node);
                  else serverRefs.current.delete(server.id);
                }}
                aria-label={server.name[language]}
                aria-expanded={openId === server.id}
                aria-controls={openId === server.id ? "studio-intro" : undefined}
                onClick={() => toggle(server.id)}
              >
                <span>{server.name[language]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {open && (
        <div
          className="studio-card"
          id="studio-intro"
          ref={cardRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="studio-intro-title"
          tabIndex={-1}
        >
          <p className="studio-card-name" id="studio-intro-title">
            {open.name}
          </p>
          <p>{open.intro}</p>
        </div>
      )}
    </div>
  );
}
