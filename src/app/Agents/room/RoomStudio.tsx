import { useContext, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { SupportedLanguage, TranslationKey } from "../../constants/translations";
import {
  AGENT_IDS,
  BOTS,
  SERVERS,
  idleStatus,
  isAgentState,
  type AgentId,
  type AgentState,
  type StudioBot,
} from "../../data/agents";
import { DarkModeContext } from "../../store/DarkModeContext";
import { LanguageContext } from "../../store/LanguageContext";
import { RACK_HITS, SEATS, VIEW } from "./layout";
import RoomScene from "./RoomScene";
import "./room.css";

const LIGHT_SET = "/studio/room-light-1280.webp 1280w, /studio/room-light.webp 2560w";
const DARK_SET = "/studio/room-dark-1280.webp 1280w, /studio/room-dark.webp 2560w";
const SIZES = "(max-width: 700px) 92vw, 1100px";

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

function scheduleText(bot: StudioBot, language: SupportedLanguage): string {
  if (bot.schedule.length === 0) return "";
  return bot.schedule.map((item) => item.label[language]).join(" · ");
}

function pct(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

/** Screenshot hook. `?cast=site:working,general:idle` overrides those bots. No visible control. */
function castOverride(): Partial<Record<AgentId, AgentState>> | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("cast");
  if (!raw) return null;
  const next: Partial<Record<AgentId, AgentState>> = {};
  raw.split(",").forEach((piece) => {
    const [id, state] = piece.split(":");
    if ((AGENT_IDS as readonly string[]).includes(id) && isAgentState(state)) next[id as AgentId] = state;
  });
  return Object.keys(next).length > 0 ? next : null;
}

function withOverride(base: Record<AgentId, AgentState>, override: Partial<Record<AgentId, AgentState>> | null) {
  if (!override) return base;
  const next = { ...base };
  (Object.keys(override) as AgentId[]).forEach((id) => {
    const value = override[id];
    if (value) next[id] = value;
  });
  return next;
}

/** Bitmap room with SVG mascots. The canvas studio and the iso/ SVG room stay in the repo. */
export default function RoomStudio() {
  const { language, t } = useContext(LanguageContext);
  const { darkMode } = useContext(DarkModeContext);
  const overrideRef = useRef(castOverride());
  const [status, setStatus] = useState<Record<AgentId, AgentState>>(() => withOverride(idleStatus(), castOverride()));
  const [openId, setOpenId] = useState<OpenId>("");
  const [introId, setIntroId] = useState<OpenId>("");
  const [listen, setListen] = useState("");
  const [live, setLive] = useState("");
  const [paused, setPaused] = useState(false);
  const [gaze, setGaze] = useState<{ x: number; y: number } | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const introTimer = useRef(0);
  const botRefs = useRef(new Map<string, HTMLButtonElement>());
  const serverRefs = useRef(new Map<string, HTMLButtonElement>());
  const touchIds = useRef(new Set<string>());
  const liveRef = useRef("");
  const stageRef = useRef<HTMLDivElement>(null);
  const gazeRef = useRef<{ x: number; y: number } | null>(null);
  const gazePending = useRef(false);
  const reduceMotion = useRef(false);

  const openBot = BOTS.find((bot) => bot.id === openId);
  const openServer = SERVERS.find((server) => server.id === openId);
  const open = openBot
    ? { name: openBot.name[language], intro: openBot.intro[language] }
    : openServer
      ? { name: openServer.name[language], intro: openServer.intro[language] }
      : null;

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.setAttribute("imagesrcset", darkMode ? DARK_SET : LIGHT_SET);
    link.setAttribute("imagesizes", SIZES);
    document.head.appendChild(link);
    return () => link.remove();
  }, [darkMode]);

  useEffect(() => {
    let timer = 0;
    let cancelled = false;

    const pull = () => {
      fetch("/api/agents", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (cancelled) return;
          const next = data ? readStatus(data) : idleStatus();
          setStatus(withOverride(next, overrideRef.current));
        })
        .catch(() => {
          if (!cancelled) setStatus(withOverride(idleStatus(), overrideRef.current));
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
      setPaused(document.hidden);
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
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  /** Mouse in the room: everyone's eyes follow it. A hovered bot gets the room's attention instead. */
  const trackGaze = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || reduceMotion.current) return;
    const node = stageRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = ((event.clientX - rect.left) / rect.width) * VIEW.w;
    const y = ((event.clientY - rect.top) / rect.height) * VIEW.h;
    const last = gazeRef.current;
    if (last && Math.hypot(x - last.x, y - last.y) < 6) return;
    gazeRef.current = { x, y };
    if (gazePending.current) return;
    gazePending.current = true;
    window.requestAnimationFrame(() => {
      gazePending.current = false;
      setGaze(gazeRef.current);
    });
  };

  const clearGaze = () => {
    gazeRef.current = null;
    setGaze(null);
  };

  useEffect(() => {
    if (!openId) return;
    cardRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const id = openId;
      setIntroId("");
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
      setIntroId("");
      setOpenId("");
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [openId]);

  const toggle = (id: OpenId) => {
    window.clearTimeout(introTimer.current);
    if (openId === id) {
      setIntroId("");
      setOpenId("");
      return;
    }
    const isBot = BOTS.some((bot) => bot.id === id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isBot || reduce) {
      setIntroId(isBot ? id : "");
      setOpenId(id);
      return;
    }
    setIntroId(id);
    introTimer.current = window.setTimeout(() => setOpenId(id), 460);
  };

  useEffect(() => () => window.clearTimeout(introTimer.current), []);

  const markPointer = (id: string) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch") touchIds.current.add(id);
    else touchIds.current.delete(id);
  };

  const tagClass = (kind: "agent-tag" | "server-tag", id: string) =>
    [kind, openId === id && "is-selected", touchIds.current.has(id) && "from-touch"].filter(Boolean).join(" ");

  return (
    <div className={`studio room-studio${darkMode ? " is-dark" : ""}${paused ? " is-paused" : ""}`}>
      <p className="studio-live" aria-live="polite">
        {live}
      </p>
      <div
        className={`room-stage${darkMode ? " is-dark" : ""}`}
        ref={stageRef}
        onPointerMove={trackGaze}
        onPointerLeave={clearGaze}
      >
        <picture className="room-photo room-photo-light">
          <img
            src="/studio/room-light.webp"
            srcSet={LIGHT_SET}
            sizes={SIZES}
            alt=""
            width={VIEW.w}
            height={VIEW.h}
            decoding="async"
          />
        </picture>
        <picture className="room-photo room-photo-dark">
          <img
            src="/studio/room-dark.webp"
            srcSet={DARK_SET}
            sizes={SIZES}
            alt=""
            width={VIEW.w}
            height={VIEW.h}
            decoding="async"
          />
        </picture>
        <RoomScene
          status={status}
          listen={listen}
          intro={introId}
          busy={AGENT_IDS.some((id) => status[id] === "working")}
          gaze={gaze}
          focus={reduceMotion.current ? "" : listen}
        />
        <div className="studio-tags">
          {BOTS.map((bot) => {
            const seat = SEATS[bot.id];
            const state = status[bot.id];
            const name = bot.name[language];
            const schedule = scheduleText(bot, language);
            const cx = seat.x + seat.w / 2;
            const bottom = seat.y + seat.h;
            return (
              <button
                key={bot.id}
                type="button"
                className={tagClass("agent-tag", bot.id)}
                style={{
                  left: pct(cx, VIEW.w),
                  top: pct(bottom, VIEW.h),
                  width: pct(seat.w, VIEW.w),
                  height: pct(seat.h, VIEW.h),
                }}
                data-side={cx > VIEW.w * 0.62 ? "east" : "west"}
                data-state={state}
                data-active={openId === bot.id || introId === bot.id ? "true" : undefined}
                ref={(node) => {
                  if (node) botRefs.current.set(bot.id, node);
                  else botRefs.current.delete(bot.id);
                }}
                aria-label={`${name}, ${t(STATE_KEY[state])}`}
                aria-describedby={schedule ? `agent-tip-${bot.id}` : undefined}
                aria-expanded={openId === bot.id}
                aria-controls={openId === bot.id ? "studio-intro" : undefined}
                onPointerDown={markPointer(bot.id)}
                onPointerEnter={() => setListen(bot.id)}
                onPointerLeave={() => setListen((current) => (current === bot.id ? "" : current))}
                onFocus={() => setListen(bot.id)}
                onBlur={() => setListen((current) => (current === bot.id ? "" : current))}
                onClick={() => toggle(bot.id)}
              >
                <span className="agent-hud">
                  <span className="agent-hud-head">
                    <span className="agent-hud-dot" aria-hidden="true" />
                    <span className="agent-tag-name">{name}</span>
                  </span>
                  {schedule && (
                    <span className="agent-tip" role="tooltip" id={`agent-tip-${bot.id}`}>
                      {schedule}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
          {SERVERS.map((server) => {
            const rack = RACK_HITS[server.id];
            return (
              <button
                key={server.id}
                type="button"
                className={tagClass("server-tag", server.id)}
                style={{
                  left: pct(rack.x, VIEW.w),
                  top: pct(rack.y, VIEW.h),
                  width: pct(rack.w, VIEW.w),
                  height: pct(rack.h, VIEW.h),
                }}
                ref={(node) => {
                  if (node) serverRefs.current.set(server.id, node);
                  else serverRefs.current.delete(server.id);
                }}
                aria-label={server.name[language]}
                aria-expanded={openId === server.id}
                aria-controls={openId === server.id ? "studio-intro" : undefined}
                onPointerDown={markPointer(server.id)}
                onClick={() => toggle(server.id)}
              >
                <span className="server-hud">
                  <span className="agent-hud-dot is-server" aria-hidden="true" />
                  <span className="server-hud-name">{server.name[language]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {open && (
        <div
          className="studio-card studio-caption"
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
          <p className="studio-card-intro">{open.intro}</p>
        </div>
      )}
    </div>
  );
}
