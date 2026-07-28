---
title: Local AI development
description: Connect Cursor / Claude Code / Codex to the instance MCP server and develop against a live workspace.
---

Connect a local AI coding agent to a **running d6e instance** and develop/test Plugins and workspace assets — no special deploy step until you are ready to ship.

The core idea: **everything the hosted AI agent can do is available as a public HTTP API / MCP**. Your laptop gets the same ~96 `d6e_*` tools the built-in chat uses.

```
┌────────────────────┐        ┌────────────────────────────────────┐
│ Local AI agent     │  MCP   │ d6e instance                       │
│ (Cursor / Claude   │───────▶│  MCP :8081/mcp  →  Rust /api/v1/*  │
│  Code / Codex)     │  REST  │                 →  PostgreSQL      │
└────────────────────┘───────▶└────────────────────────────────────┘
```

This page is a summary. Full steps, differences, and troubleshooting live in the source guide:

> Canonical: [local-ai-development.md](https://github.com/d6e-ai/d6e-plugin-skills/blob/main/docs/local-ai-development.md)

## 0. Install Agent Skills (recommended)

Before asking an agent to design, answer questions, or implement Plugins / Docker STFs / custom frontends, install the skills. **When unsure, install everything.**

```bash
npx skills add d6e-ai/d6e-plugin-skills --skill '*' -y
npx skills add d6e-ai/d6e-docker-stf-skills --skill '*' -y
npx skills add d6e-ai/d6e-custom-frontend-skills --skill '*' -y
```

See [Installing Agent Skills](/en-us/guides/agent-skills/) for details.

## 1. Issue an API key (~1 minute)

1. Log into the console (`${D6E_BASE_URL}`)
2. Avatar → **API keys** (`/{locale}/user/api-keys`)
3. Create a key and copy the `d6e_…` value (shown once)

Smoke test:

```bash
curl -s ${D6E_BASE_URL}/api/v1/workspaces \
  -H "Authorization: Bearer ${D6E_API_KEY}"
```

API keys are tied to your user account and inherit workspace membership. Add `X-Workspace-ID` for workspace-scoped endpoints.

## 2. Connect MCP (recommended)

The instance exposes MCP over HTTP (default **port 8081**, path `/mcp`).

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "d6e": {
      "url": "http://<instance-host>:8081/mcp",
      "headers": { "Authorization": "Bearer d6e_YOUR_API_KEY" }
    }
  }
}
```

After connecting, you can ask the agent to:

- “List tables in the current workspace”
- “Run this SQL and summarize the result”
- “Instant-run this STF”

See [MCP tools](/en-us/reference/mcp-tools/) for the full catalog.

## 3. What to test where

| What you want to test | Where it runs | How |
|---|---|---|
| Workspace SQL | Remote (real DB) | `POST .../sql` or `d6e_sql` |
| JS STF | Remote (QuickJS) | `POST .../stfs/instant-run` or `d6e_instant_run_stf` |
| Docker STF logic | **Local** `docker run` | stdin/stdout JSON; point `api_url` at the live instance for integration |
| SaaS calls | Remote | `POST .../saas-proxy` or `d6e_call_external_api` |
| Workflows | Remote | `POST .../workflows/{id}/execute` or `d6e_execute_workflow` |

## 4. Plugin vs frontend scope

- **This guide:** developing and testing workspace contents (Plugins)
- **Custom frontend:** an independent web app — see [Custom frontend](/en-us/guides/custom-frontend/) and [frontend-and-instance.md](https://github.com/d6e-ai/d6e-custom-frontend-skills/blob/main/docs/frontend-and-instance.md)

## Next steps

- [Plugin development](/en-us/guides/plugins/)
- [Docker STF development](/en-us/guides/docker-stf/)
- [REST API](/en-us/reference/rest-api/)
