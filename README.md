# Personal Portfolio Site

## Run Locally

```bash
npm install
npm run dev
```

## Agent status

Bots report their own presence. Nothing on the site polls them, and there is no cron. `GET /api/agents` is public and only returns `working`, `chatting`, or `idle` (idle if the last beat is older than 2 minutes). `POST` needs `Authorization: Bearer $AGENT_STATUS_TOKEN` and a body `{ "agent", "state" }`. `state: "idle"` clears that bot.

Vercel env: `BLOB_READ_WRITE_TOKEN` (private Blob store) and `AGENT_STATUS_TOKEN`. Until those exist, the page shows everyone idle and POST returns 503.

```bash
export AGENT_STATUS_TOKEN=...          # or AGENT_STATUS_TOKEN_FILE=/path/to/token
# optional: AGENT_STATUS_URL=https://tokunagax.tech/api/agents
# valid agent ids: site | general | x | eggbot (aliases: dr-eggbot-v2, trading)

./scripts/agent-status.sh start site working
./scripts/agent-status.sh beat x chatting
./scripts/agent-status.sh start eggbot working
./scripts/agent-status.sh stop site
```

`start` posts once, then heartbeats every 60 seconds for at most 2 hours. `stop` ends that loop and does not post; the bot goes idle on its own. The script stays quiet and exits 0 if the network fails. It never prints the token.
