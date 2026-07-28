---
title: What is d6e?
description: A high-level view of instances, workspaces, the central account site, and the public API.
---

d6e is a **self-hostable AI work platform**. You deploy an instance into your own environment (on-premise or private cloud) and host workspaces there. AI agents use the same capabilities through the chat console, MCP, or the REST API.

## Three actors

```
┌────────────────────────────────┐
│ Your code                      │
│ · Local AI agents              │
│ · Scripts / backends           │
│ · Custom frontends             │
└───────────┬────────────────────┘
            │ MCP / REST / OAuth
            ▼
┌────────────────────────────────┐     ┌──────────────────────────┐
│ d6e instance                   │     │ Central account site     │
│ ${D6E_BASE_URL}                │◄────│ https://www.d6e.ai       │
│ · Console (SvelteKit)          │auth │ · Accounts / login       │
│ · Rust API /api/v1/*           │broker│ · OAuth client registry │
│ · MCP :8081/mcp                │     │ · Billing / franchise    │
│ · PostgreSQL / files           │     └──────────────────────────┘
│ · STFs, workflows, SaaS        │
└────────────────────────────────┘
```

| Actor | Role | Where data lives |
|---|---|---|
| **d6e instance** | Hosts workspaces. Provides SQL, files, STFs, workflows, SaaS credentials, and chat | **Your infrastructure** |
| **Central account site** ([www.d6e.ai](https://www.d6e.ai)) | Accounts, login, OAuth client / redirect URI registration, billing | Account info only — no workspace data |
| **Your code** | Local AI agents, scripts, custom frontends | Your hosting |

## What a workspace bundles

- PostgreSQL-backed workspace DB (`user_data` schema)
- File storage (uploads, generated reports, Google Drive sync)
- STFs (State Transition Functions — business logic)
- Workflows and schedules
- SaaS credentials (freee, Money Forward, Google Workspace, Salesforce, Notion, Box, GitHub, Chatwork, Zendesk, …)
- A chat console where the AI agent operates on all of the above

## “Everything is a public API”

The console and the built-in chat agent sit on **the same surface you call with an API key or MCP**. There is no privileged internal API.

| Surface | Use |
|---|---|
| REST `/api/v1/*` | Scripts, backends, custom frontends |
| MCP `d6e_*` (~96 tools) | Local AI agents / same tools as the built-in chat agent |
| Console | A web UI that is a client of the REST / MCP surface above |

## Next pages

- [Architecture](/en/getting-started/architecture/) — trust boundaries and diagrams
- [Design philosophy](/en/getting-started/design-philosophy/) — loose-coupling principles
- [Choosing a path](/en/getting-started/choosing-a-path/) — console / Plugin / Docker STF / custom FE
- [Local AI development](/en/guides/local-ai-development/) — shortest MCP setup
