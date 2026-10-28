#!/usr/bin/env bash
# Call Levelset from a shell with curl and jq.
#
#   export LEVELSET_API_KEY=spk_...   # Account, Security on standpointhq.com
#   ./levelset.sh                     # list the tools
#   ./levelset.sh levels_get '{"ticker":"NVDA"}'
set -euo pipefail

: "${LEVELSET_API_KEY:?Set LEVELSET_API_KEY to a key made under Account, Security on standpointhq.com.}"
ENDPOINT="https://standpointhq.com/api/v1/mcp"

rpc() {
  local reply
  reply=$(curl -sS -w '\n%{http_code}' "$ENDPOINT" \
    -H "Authorization: Bearer $LEVELSET_API_KEY" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d "$1")
  local status=${reply##*$'\n'}
  if [[ $status != 200 ]]; then
    echo "Levelset answered $status: ${reply%$'\n'*}" >&2
    exit 1
  fi
  printf '%s' "${reply%$'\n'*}"
}

if [[ $# -eq 0 ]]; then
  rpc '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq -r '.result.tools[] | "\(.name)\t\(.title)"'
else
  args="${2:-{\}}"
  rpc "$(jq -nc --arg name "$1" --argjson args "$args" \
    '{jsonrpc:"2.0",id:1,method:"tools/call",params:{name:$name,arguments:$args}}')" \
    | jq '.result.structuredContent // .result.content[0].text // .error'
fi
