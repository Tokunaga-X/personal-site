const crypto = require("crypto");
const { get, put, BlobPreconditionFailedError } = require("@vercel/blob");

// Keep these ids in sync with src/app/data/agents.ts.
const AGENT_IDS = ["site", "general", "x", "trading"];
const IDLE_AFTER_MS = 120000;
const BLOB_PATH = "agent-status.json";
const PUBLIC_CACHE = "public, s-maxage=15, stale-while-revalidate=15";

function idle() {
  return { site: "idle", general: "idle", x: "idle", trading: "idle" };
}

function isAgentId(value) {
  return typeof value === "string" && AGENT_IDS.includes(value);
}

function isState(value) {
  return value === "working" || value === "chatting" || value === "idle";
}

function env(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function tokensMatch(got, secret) {
  const left = crypto.createHash("sha256").update(got).digest();
  const right = crypto.createHash("sha256").update(secret).digest();
  return crypto.timingSafeEqual(left, right);
}

function authorized(req, secret) {
  const header = req.headers.authorization || "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  return tokensMatch(header.slice(prefix.length).trim(), secret);
}

function parseDoc(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const doc = {};
  for (const id of AGENT_IDS) {
    const entry = value[id];
    if (!entry || typeof entry !== "object") continue;
    const state = entry.state;
    const lastBeat = entry.lastBeat;
    if (state !== "working" && state !== "chatting") continue;
    if (typeof lastBeat !== "string" || !Number.isFinite(Date.parse(lastBeat))) continue;
    doc[id] = { state, lastBeat };
  }
  return doc;
}

function derive(doc, now) {
  const out = idle();
  for (const id of AGENT_IDS) {
    const beat = doc[id];
    if (!beat) continue;
    if (now - Date.parse(beat.lastBeat) >= IDLE_AFTER_MS) continue;
    out[id] = beat.state;
  }
  return out;
}

function applyBeat(doc, agent, state, now) {
  const next = { ...doc };
  if (state === "idle") {
    delete next[agent];
    return next;
  }
  next[agent] = { state, lastBeat: new Date(now).toISOString() };
  return next;
}

async function readDoc() {
  const result = await get(BLOB_PATH, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return { doc: {} };
  const text = await new Response(result.stream).text();
  try {
    return { doc: parseDoc(JSON.parse(text)), etag: result.blob.etag };
  } catch (error) {
    console.error("agent-status blob was not json", error instanceof Error ? error.name : "parse");
    return { doc: {} };
  }
}

async function writeDoc(doc, etag) {
  await put(BLOB_PATH, JSON.stringify(doc), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
    ...(etag ? { ifMatch: etag } : {}),
  });
}

function readBody(req) {
  const body = req.body;
  if (body && typeof body === "object") return body;
  if (typeof body === "string" && body) return JSON.parse(body);
  return null;
}

async function handleGet() {
  const now = Date.now();
  if (!env("BLOB_READ_WRITE_TOKEN")) return derive({}, now);
  try {
    const { doc } = await readDoc();
    return derive(doc, now);
  } catch (error) {
    console.error("agent-status read failed", error instanceof Error ? error.name : "error");
    return derive({}, now);
  }
}

async function handlePost(req) {
  const token = env("AGENT_STATUS_TOKEN");
  if (!token || !env("BLOB_READ_WRITE_TOKEN")) return { status: 503, body: { error: "unavailable" } };
  if (!authorized(req, token)) return { status: 401, body: { error: "unauthorized" } };

  let body;
  try {
    body = readBody(req);
  } catch {
    return { status: 400, body: { error: "invalid json" } };
  }
  if (!body || typeof body !== "object") return { status: 400, body: { error: "invalid body" } };
  if (!isAgentId(body.agent)) return { status: 400, body: { error: "unknown agent" } };
  if (!isState(body.state)) return { status: 400, body: { error: "invalid state" } };

  const now = Date.now();
  try {
    const first = await readDoc();
    try {
      await writeDoc(applyBeat(first.doc, body.agent, body.state, now), first.etag);
    } catch (error) {
      if (!(error instanceof BlobPreconditionFailedError)) throw error;
      const second = await readDoc();
      await writeDoc(applyBeat(second.doc, body.agent, body.state, now), second.etag);
    }
  } catch (error) {
    console.error("agent-status write failed", error instanceof Error ? error.name : "error");
    return { status: 503, body: { error: "unavailable" } };
  }
  return { status: 204, body: null };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      res.setHeader("Cache-Control", PUBLIC_CACHE);
      res.status(200).json(await handleGet());
      return;
    }
    if (req.method === "POST") {
      const result = await handlePost(req);
      res.setHeader("Cache-Control", "no-store");
      if (result.status === 204) {
        res.status(204).end();
        return;
      }
      res.status(result.status).json(result.body);
      return;
    }
    res.setHeader("Allow", "GET, POST");
    res.setHeader("Cache-Control", "no-store");
    res.status(405).end();
  } catch (error) {
    console.error("agent-status failed", error instanceof Error ? error.name : "error");
    res.setHeader("Cache-Control", req.method === "GET" ? PUBLIC_CACHE : "no-store");
    if (req.method === "GET") {
      res.status(200).json(idle());
      return;
    }
    res.status(503).json({ error: "unavailable" });
  }
};
