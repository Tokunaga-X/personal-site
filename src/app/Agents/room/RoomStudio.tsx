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

function scheduleText(bot: StudioBot, language: SupportedLanguage, t: (key: TranslationKey) => string): string {
  if (bot.schedule.length === 0) return t("agentsNoTasks");
  const count = bot.schedule.length;
  const head = count === 1 ? t("agentsTaskOne") : t("agentsTaskMany").replace("{n}", String(count));
  const times = bot.schedule.map((item) => item.label[language]).join(" · ");
  return `${head} · ${times}`;
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

const CARD_GAP = 16;
const CARD_PAD = 10;

function intersects(a: DOMRect, b: DOMRect, pad: number) {
  return a.right > b.left - pad && a.left < b.right + pad && a.bottom > b.top - pad && a.top < b.bottom + pad;
}

function vinylRect() {
  const vinylEl = document.querySelector(".vinyl-grow");
  return vinylEl instanceof HTMLElement ? vinylEl.getBoundingClientRect() : null;
}

/** Phone: the room is too short to hold type beside a figure, so the intro sits outside it. */
function placeOutsideRoom(card: HTMLElement, stage: HTMLElement) {
  const stageBox = stage.getBoundingClientRect();
  card.dataset.place = "outside";
  card.style.width = `${Math.max(0, stage.clientWidth)}px`;
  card.style.right = "auto";
  card.style.bottom = "auto";
  card.style.left = "0px";
  card.style.top = `${stage.offsetHeight + 18}px`;

  const vinyl = vinylRect();
  const below = card.getBoundingClientRect();
  const hitsVinyl = vinyl ? intersects(below, vinyl, 14) : false;
  const offScreen = below.bottom > window.innerHeight - 8 || below.top < 72;
  if (hitsVinyl || offScreen) {
    card.style.top = `${-card.offsetHeight - 18}px`;
  }
}

/**
 * Keep the intro off every bot and both racks.
 * Beside the figure when that gap is empty; otherwise the floor in front of it,
 * or the margin past the racks.
 */
function placeStudioCard(card: HTMLElement, anchor: HTMLElement, stage: HTMLElement) {
  const stageBox = stage.getBoundingClientRect();
  if (stageBox.width < 2) return;

  const narrow = window.innerWidth <= 600;
  if (narrow) {
    placeOutsideRoom(card, stage);
    return;
  }

  card.dataset.place = "beside";
  card.style.right = "auto";
  card.style.bottom = "auto";
  card.style.width = "200px";
  const cardW = card.offsetWidth;
  const cardH = card.offsetHeight;
  if (cardW < 2 || cardH < 2) return;

  const anchorBox = anchor.getBoundingClientRect();
  const obstacles = [...stage.querySelectorAll<HTMLElement>(".agent-tag, .server-tag")].map((el) =>
    el.getBoundingClientRect(),
  );
  const vinyl = vinylRect();
  const viewL = 12;
  const viewT = 76;
  const viewR = window.innerWidth - 12;
  const viewB = window.innerHeight - 12;
  const isRack = anchor.classList.contains("server-tag");

  const spots: { left: number; top: number; score: number }[] = [];
  const add = (left: number, top: number, bias: number) => {
    if (left < viewL || top < viewT || left + cardW > viewR || top + cardH > viewB) return;
    const rect = new DOMRect(left, top, cardW, cardH);
    if (vinyl && intersects(rect, vinyl, 12)) return;
    if (obstacles.some((ob) => intersects(rect, ob, CARD_PAD))) return;
    const acx = anchorBox.left + anchorBox.width / 2;
    const acy = anchorBox.top + anchorBox.height / 2;
    const score = Math.hypot(left + cardW / 2 - acx, top + cardH / 2 - acy) + bias;
    spots.push({ left: left - stageBox.left, top: top - stageBox.top, score });
  };

  add(anchorBox.left - CARD_GAP - cardW, anchorBox.top, isRack ? 260 : 40);
  add(anchorBox.right + CARD_GAP, anchorBox.top, isRack ? 20 : 40);
  add(anchorBox.left - CARD_GAP - cardW, anchorBox.top + (anchorBox.height - cardH) / 2, isRack ? 280 : 70);
  add(anchorBox.right + CARD_GAP, anchorBox.top + (anchorBox.height - cardH) / 2, isRack ? 40 : 70);

  const columnLeft = anchorBox.left + anchorBox.width / 2 - cardW / 2;
  let floorTop = anchorBox.bottom + 28;
  for (const ob of obstacles) {
    if (ob.right > columnLeft + 6 && ob.left < columnLeft + cardW - 6) floorTop = Math.max(floorTop, ob.bottom + 28);
  }
  add(columnLeft, floorTop, isRack ? 50 : 0);
  add(anchorBox.left, floorTop, isRack ? 40 : 0);

  let aboveBottom = anchorBox.top - CARD_GAP;
  const aboveLeft = anchorBox.left + anchorBox.width / 2 - cardW / 2;
  for (const ob of obstacles) {
    if (ob.right > aboveLeft + 6 && ob.left < aboveLeft + cardW - 6) aboveBottom = Math.min(aboveBottom, ob.top - CARD_GAP);
  }
  add(aboveLeft, aboveBottom - cardH, 100);

  let outerRight = viewL;
  let outerLeft = viewR;
  for (const ob of obstacles) {
    outerRight = Math.max(outerRight, ob.right);
    outerLeft = Math.min(outerLeft, ob.left);
  }
  add(outerRight + CARD_GAP, anchorBox.top, isRack ? -160 : 180);
  add(outerLeft - CARD_GAP - cardW, anchorBox.top, isRack ? 200 : 80);

  if (spots.length === 0) {
    placeOutsideRoom(card, stage);
    return;
  }
  spots.sort((a, b) => a.score - b.score);
  const choice = spots[0];
  card.style.left = `${Math.round(choice.left)}px`;
  card.style.top = `${Math.round(choice.top)}px`;
}

type FloatCard = {
  id: string;
  name: string;
  intro: string;
  phase: "from" | "in" | "out";
};

/** Bitmap room with SVG mascots. The canvas studio and the iso/ SVG room stay in the repo. */
export default function RoomStudio() {
  const { language, t } = useContext(LanguageContext);
  const { darkMode } = useContext(DarkModeContext);
  const overrideRef = useRef(castOverride());
  const [status, setStatus] = useState<Record<AgentId, AgentState>>(() => withOverride(idleStatus(), castOverride()));
  const [openId, setOpenId] = useState<OpenId>("");
  const [introId, setIntroId] = useState<OpenId>("");
  const [view, setView] = useState<FloatCard | null>(null);
  const [listen, setListen] = useState("");
  const [live, setLive] = useState("");
  const [paused, setPaused] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const botRefs = useRef(new Map<string, HTMLButtonElement>());
  const serverRefs = useRef(new Map<string, HTMLButtonElement>());
  const touchIds = useRef(new Set<string>());
  const liveRef = useRef("");

  const openBot = BOTS.find((bot) => bot.id === openId);
  const openServer = SERVERS.find((server) => server.id === openId);
  const openName = openBot?.name[language] ?? openServer?.name[language] ?? "";
  const openIntro = openBot?.intro[language] ?? openServer?.intro[language] ?? "";

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

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!openId || !openName) {
      if (reduce) {
        setView(null);
        return;
      }
      setView((current) => (current && current.phase !== "out" ? { ...current, phase: "out" } : current));
      return;
    }
    setView((current) => {
      if (reduce) return { id: openId, name: openName, intro: openIntro, phase: "in" };
      if (current && current.id === openId && current.phase !== "out") {
        if (current.name === openName && current.intro === openIntro) return current;
        return { ...current, name: openName, intro: openIntro };
      }
      return { id: openId, name: openName, intro: openIntro, phase: "from" };
    });
    if (reduce) return;
    const frame = window.requestAnimationFrame(() => {
      setView((current) =>
        current && current.id === openId && current.phase === "from" ? { ...current, phase: "in" } : current,
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [openId, openName, openIntro]);

  useEffect(() => {
    if (view?.phase !== "out") return;
    const timer = window.setTimeout(() => {
      setView((current) => (current?.phase === "out" ? null : current));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [view?.phase, view?.id]);

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

  useLayoutEffect(() => {
    if (!view) return;
    const card = cardRef.current;
    const stage = stageRef.current;
    const anchor = botRefs.current.get(view.id) ?? serverRefs.current.get(view.id);
    if (!card || !stage || !anchor) return;

    const place = () => placeStudioCard(card, anchor, stage);
    place();
    const observer = new ResizeObserver(place);
    observer.observe(stage);
    const vinyl = document.querySelector(".mixtape");
    const vinylWatch = new MutationObserver(place);
    if (vinyl) vinylWatch.observe(vinyl, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, { passive: true });
    return () => {
      observer.disconnect();
      vinylWatch.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place);
    };
  }, [view?.id, view?.phase, view?.name, view?.intro]);

  const toggle = (id: OpenId) => {
    if (openId === id) {
      setIntroId("");
      setOpenId("");
      return;
    }
    const isBot = BOTS.some((bot) => bot.id === id);
    setIntroId(isBot ? id : "");
    setOpenId(id);
  };

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
      <div className={`room-stage${darkMode ? " is-dark" : ""}`} ref={stageRef}>
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
        />
        <div className="studio-tags">
          {BOTS.map((bot) => {
            const seat = SEATS[bot.id];
            const state = status[bot.id];
            const name = bot.name[language];
            const cx = seat.x + seat.w / 2;
            const bottom = seat.y + seat.h;
            return (
              <button
                key={bot.id}
                type="button"
                className={tagClass("agent-tag", bot.id)}
                data-who={bot.id}
                style={{
                  left: pct(cx, VIEW.w),
                  top: pct(bottom, VIEW.h),
                  width: pct(seat.w, VIEW.w),
                  height: pct(seat.h, VIEW.h),
                }}
                data-side={cx > VIEW.w * 0.62 ? "east" : "west"}
                ref={(node) => {
                  if (node) botRefs.current.set(bot.id, node);
                  else botRefs.current.delete(bot.id);
                }}
                aria-label={`${name}, ${t(STATE_KEY[state])}`}
                aria-describedby={`agent-tip-${bot.id}`}
                aria-expanded={openId === bot.id}
                aria-controls={openId === bot.id ? "studio-intro" : undefined}
                onPointerDown={markPointer(bot.id)}
                onPointerEnter={() => setListen(bot.id)}
                onPointerLeave={() => setListen((current) => (current === bot.id ? "" : current))}
                onFocus={() => setListen(bot.id)}
                onBlur={() => setListen((current) => (current === bot.id ? "" : current))}
                onClick={() => toggle(bot.id)}
              >
                <span className="float-name">
                  <span className="agent-tip" role="tooltip" id={`agent-tip-${bot.id}`}>
                    {scheduleText(bot, language, t)}
                  </span>
                  <span className="agent-tag-name">{name}</span>
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
                data-who={server.id}
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
                <span className="float-name">
                  <span className="agent-tag-name">{server.name[language]}</span>
                </span>
              </button>
            );
          })}
        </div>
        {view && (
          <div
            className={`studio-card is-${view.phase}`}
            id="studio-intro"
            ref={cardRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby="studio-intro-title"
            tabIndex={-1}
          >
            <p className="studio-card-name" id="studio-intro-title">
              {view.name}
            </p>
            <p>{view.intro}</p>
          </div>
        )}
      </div>
    </div>
  );
}
