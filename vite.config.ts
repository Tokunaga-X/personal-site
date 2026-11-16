import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/** Dev-only stand-in for GET /api/agents before the Blob store exists. Same payload as production with no beats: everyone idle. */
function agentStatusDev(): Plugin {
  const body = JSON.stringify({ site: "idle", general: "idle", x: "idle", trading: "idle" });
  return {
    name: "agent-status-dev",
    configureServer(server) {
      server.middlewares.use("/api/agents", (req, res, next) => {
        if ((req as { method?: string }).method !== "GET") {
          next();
          return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "public, s-maxage=15, stale-while-revalidate=15");
        res.end(body);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), agentStatusDev()],
});
