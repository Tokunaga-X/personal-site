import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import { isAgentId, isAgentState } from "../src/app/data/agents";
import {
  STATUS_BLOB_PATH,
  applyBeat,
  derivePublicStatus,
  parseStatusDoc,
  type StatusDoc,
} from "../src/app/data/agentStatus";

const PUBLIC_CACHE = "public, s-maxage=15, stale-while-revalidate=15";

function env(name: string): string {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[name]?.trim() ?? "";
}

function json(body: unknown, status: number, cache: string): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": cache },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const left = enc.encode(a);
  const right = enc.encode(b);
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let i = 0; i < length; i += 1) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

function authorized(request: Request, secret: string): boolean {
  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  return timingSafeEqual(header.slice(prefix.length).trim(), secret);
}

async function readDoc(): Promise<{ doc: StatusDoc; etag?: string }> {
  const result = await get(STATUS_BLOB_PATH, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return { doc: {} };
  const text = await new Response(result.stream).text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    console.error("agent-status blob was not json", error instanceof Error ? error.name : "parse");
    return { doc: {} };
  }
  return { doc: parseStatusDoc(parsed), etag: result.blob.etag };
}

async function writeDoc(doc: StatusDoc, etag?: string): Promise<void> {
  await put(STATUS_BLOB_PATH, JSON.stringify(doc), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
    ...(etag ? { ifMatch: etag } : {}),
  });
}

async function handleGet(): Promise<Response> {
  const now = Date.now();
  if (!env("BLOB_READ_WRITE_TOKEN")) {
    return json(derivePublicStatus({}, now), 200, PUBLIC_CACHE);
  }
  try {
    const { doc } = await readDoc();
    return json(derivePublicStatus(doc, now), 200, PUBLIC_CACHE);
  } catch (error) {
    console.error("agent-status read failed", error instanceof Error ? error.name : "error");
    return json(derivePublicStatus({}, now), 200, PUBLIC_CACHE);
  }
}

async function handlePost(request: Request): Promise<Response> {
  const token = env("AGENT_STATUS_TOKEN");
  if (!token || !env("BLOB_READ_WRITE_TOKEN")) {
    return json({ error: "unavailable" }, 503, "no-store");
  }
  if (!authorized(request, token)) {
    return json({ error: "unauthorized" }, 401, "no-store");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid json" }, 400, "no-store");
  }
  if (!body || typeof body !== "object") {
    return json({ error: "invalid body" }, 400, "no-store");
  }
  const agent = (body as { agent?: unknown }).agent;
  const state = (body as { state?: unknown }).state;
  if (!isAgentId(agent)) return json({ error: "unknown agent" }, 400, "no-store");
  if (!isAgentState(state)) return json({ error: "invalid state" }, 400, "no-store");

  const now = Date.now();
  try {
    const first = await readDoc();
    try {
      await writeDoc(applyBeat(first.doc, agent, state, now), first.etag);
    } catch (error) {
      if (!(error instanceof BlobPreconditionFailedError)) throw error;
      const second = await readDoc();
      await writeDoc(applyBeat(second.doc, agent, state, now), second.etag);
    }
  } catch (error) {
    console.error("agent-status write failed", error instanceof Error ? error.name : "error");
    return json({ error: "unavailable" }, 503, "no-store");
  }

  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "GET") return handleGet();
    if (request.method === "POST") return handlePost(request);
    return new Response(null, {
      status: 405,
      headers: { Allow: "GET, POST", "Cache-Control": "no-store" },
    });
  },
};
