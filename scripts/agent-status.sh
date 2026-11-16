#!/usr/bin/env bash
# Report a bot's presence to the personal site.
#
#   agent-status.sh start <agent> [working|chatting]
#   agent-status.sh stop <agent>
#   agent-status.sh beat <agent> [working|chatting|idle]
#
# start posts once, then detaches a loop that posts the same state every 60s.
# The loop stops itself after 2 hours. stop kills that loop and posts nothing;
# the site drops the bot to idle after 2 minutes without a beat.
# Starting again replaces the previous loop for that agent.
#
#   AGENT_STATUS_URL          default https://tokunagax.tech/api/agents
#   AGENT_STATUS_TOKEN        bearer token (preferred)
#   AGENT_STATUS_TOKEN_FILE   file whose contents are the token, if the env var is unset
#
# Silent. Exits 0 even when the network fails. Never prints the token.

set -u

url="${AGENT_STATUS_URL:-https://tokunagax.tech/api/agents}"

read_token() {
  if [[ -n "${AGENT_STATUS_TOKEN:-}" ]]; then
    printf '%s' "$AGENT_STATUS_TOKEN" | tr -d '[:space:]'
    return 0
  fi
  if [[ -n "${AGENT_STATUS_TOKEN_FILE:-}" && -r "${AGENT_STATUS_TOKEN_FILE}" ]]; then
    tr -d '[:space:]' < "$AGENT_STATUS_TOKEN_FILE" || true
  fi
  return 0
}

post() {
  local agent="$1" state="$2" token
  token="$(read_token)"
  [[ -n "$token" ]] || return 0
  curl --silent --max-time 5 --output /dev/null \
    --request POST \
    --header "Authorization: Bearer ${token}" \
    --header "Content-Type: application/json" \
    --data "{\"agent\":\"${agent}\",\"state\":\"${state}\"}" \
    -- "$url" || true
  return 0
}

pidfile_for() {
  printf '%s/agent-status-%s.pid' "${XDG_RUNTIME_DIR:-/tmp}" "$1"
}

stop_loop() {
  local agent="$1" pidfile pid cmd
  pidfile="$(pidfile_for "$agent")"
  [[ -f "$pidfile" ]] || return 0
  pid="$(tr -cd '0-9' < "$pidfile" 2>/dev/null || true)"
  rm -f "$pidfile" 2>/dev/null || true
  [[ -n "$pid" ]] || return 0
  cmd="$(ps -p "$pid" -o args= 2>/dev/null || true)"
  case "$cmd" in
    *agent-status*)
      # The loop is a session leader. Signal the group so bash and its sleep both stop.
      # A TERM trap would defer until sleep returns, so the loop does not catch TERM.
      kill -TERM -- "-$pid" 2>/dev/null || true
      kill -TERM "$pid" 2>/dev/null || true
      ;;
  esac
  return 0
}

spawn_loop() {
  local agent="$1" state="$2" pidfile
  pidfile="$(pidfile_for "$agent")"
  mkdir -p "$(dirname "$pidfile")" 2>/dev/null || true
  if command -v setsid >/dev/null 2>&1; then
    setsid nohup bash "$0" __loop "$agent" "$state" "$pidfile" </dev/null >/dev/null 2>&1 &
  else
    nohup bash "$0" __loop "$agent" "$state" "$pidfile" </dev/null >/dev/null 2>&1 &
  fi
  local _i
  for _i in 1 2 3 4 5 6 7 8 9 10; do
    [[ -s "$pidfile" ]] && break
    sleep 0.05
  done
  return 0
}

cmd="${1:-}"
agent="${2:-}"
state="${3:-}"

case "$agent" in
  ""|*[!a-z0-9_-]*) exit 0 ;;
esac

case "$cmd" in
  start)
    case "$state" in
      ""|working) state="working" ;;
      chatting) ;;
      *) exit 0 ;;
    esac
    stop_loop "$agent"
    post "$agent" "$state"
    spawn_loop "$agent" "$state"
    exit 0
    ;;
  stop)
    stop_loop "$agent"
    exit 0
    ;;
  beat)
    case "$state" in
      ""|working) state="working" ;;
      chatting|idle) ;;
      *) exit 0 ;;
    esac
    post "$agent" "$state"
    exit 0
    ;;
  __loop)
    pidfile="${4:-}"
    case "$state" in
      working|chatting) ;;
      *) exit 0 ;;
    esac
    [[ -n "$pidfile" ]] || exit 0
    printf '%s\n' "$$" > "$pidfile" 2>/dev/null || exit 0
    # Ignore hangup only. Do not catch TERM: bash would defer the trap until sleep ends.
    trap '' HUP
    started="$(date +%s)"
    while true; do
      sleep 60 || exit 0
      now="$(date +%s)"
      if (( now - started >= 7200 )); then
        break
      fi
      post "$agent" "$state"
    done
    if [[ -f "$pidfile" ]] && [[ "$(tr -cd '0-9' < "$pidfile" 2>/dev/null || true)" == "$$" ]]; then
      rm -f "$pidfile"
    fi
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
