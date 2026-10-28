# Changelog

The version is the one the server reports in `serverInfo` and in the MCP Registry.

## 1.2.1 · 2026-10-28

- Registry entry links this repository.

## 1.2.0 · 2026-10-28

- Renamed to Levelset by StandPoint. The server reports `levelset`, titled "Levelset by StandPoint".
- Listed in the official MCP Registry as `com.standpointhq/levelset`.
- Nine read only tools: `picks_today`, `picks_open`, `picks_closed`, `picks_record`, `overdrive_mine`, `ticker_profile`, `levels_get`, `screen`, `books_mine`.
- Nine prompts, shown as ready made questions in Claude's + menu.
- `screen` sorts by relative strength (`rs`) and filters by theme.
- Sign in with OAuth 2.0, or an `spk_` API key in the `Authorization` header.
