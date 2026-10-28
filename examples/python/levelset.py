"""Call Levelset from Python with an API key. Standard library only, Python 3.10+.

    export LEVELSET_API_KEY=spk_...   # Account, Security on standpointhq.com
    python levelset.py NVDA
"""

import json
import os
import sys
import urllib.error
import urllib.request

ENDPOINT = "https://standpointhq.com/api/v1/mcp"


def call(tool: str, arguments: dict | None = None) -> dict:
    """Run one Levelset tool and return its structured result."""
    key = os.environ.get("LEVELSET_API_KEY")
    if not key:
        sys.exit("Set LEVELSET_API_KEY to a key made under Account, Security on standpointhq.com.")

    body = json.dumps({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {"name": tool, "arguments": arguments or {}},
    }).encode()
    request = urllib.request.Request(
        ENDPOINT,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            reply = json.load(response)
    except urllib.error.HTTPError as error:
        sys.exit(f"Levelset answered {error.code}: {error.read().decode()[:200]}")

    if "error" in reply:
        sys.exit(f"Levelset error: {reply['error']['message']}")
    result = reply["result"]
    if result.get("isError"):
        sys.exit(f"Tool error: {result['content'][0]['text']}")
    return result["structuredContent"]


if __name__ == "__main__":
    ticker = sys.argv[1] if len(sys.argv) > 1 else "NVDA"

    levels = call("levels_get", {"ticker": ticker})
    print(json.dumps(levels, indent=2)[:2000])

    stretched = call("screen", {"books": ["sp"], "sort": "reversion", "limit": 5})
    print(json.dumps(stretched, indent=2)[:2000])
