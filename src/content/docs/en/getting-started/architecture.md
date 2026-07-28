---
title: Architecture
description: Trust boundaries, instance layout, and how custom frontends relate.
---

d6e's boundaries are simple: **workspace data and AI execution live on the instance**, **accounts and OAuth registration live on the central site**, and **UI / your own backends live on your side**.

## Trust boundaries

```
┌─ You own ───────────────────────────────────────────────────┐
│  Custom FE / scripts / local AI agents                      │
│  · Session cookies (FE)                                     │
│  · API keys (d6e_…) or user tokens                          │
│  · No client secret (OAuth is brokered by the instance)     │
└───────────────────────────────┬─────────────────────────────┘
                                │ HTTPS
┌─ Instance (your infrastructure)┴────────────────────────────┐
│  Reverse proxy (one origin)                                 │
│   ├─ /api/v1/*     → Rust API (SQL / STF / files / SaaS…)   │
│   ├─ /api/*        → Console-side API (chat, …)             │
│   ├─ /mcp (:8081)  → MCP server (~96 d6e_* tools)           │
│   └─ /*            → Console UI                             │
│  PostgreSQL (user_data) / file storage / encrypted secrets  │
│  Policy enforcement · audit logs · membership               │
└─────────────────────────────────────────────────────────────┘
                                │ Auth brokerage only
┌─ Central site www.d6e.ai ───────────────────────────────────┐
│  Accounts · login · OAuth clients / redirect URIs           │
│  Never sees workspace contents                              │
└─────────────────────────────────────────────────────────────┘
```

## Two API surfaces on one origin

A single `D6E_BASE_URL` origin exposes two API surfaces, path-routed:

| Path | Implementation | Main uses |
|---|---|---|
| `/api/v1/*` | Rust (Axum) | SQL, files, STFs, workflows, policies, SaaS proxy, embeddings |
| `/api/*` (non-v1) | Console (SvelteKit) | Chat sessions, `execute-by-intent`, UI-oriented routes |

From the outside it is **one host**. Custom frontends and local AI agents both point at that host.

## Authentication skeleton

1. Redirect the browser to `https://www.d6e.ai/auth/login` (with `redirect_uri`)
2. POST the authorization code to the **instance** `POST /api/v1/auth/token`
3. The instance brokers the exchange with the central site and returns tokens scoped to the instance audience
4. Call `/api/v1/*` with `Authorization: Bearer …` (and `X-Workspace-ID` when required)

Frontends **never hold a client secret**. Register production callback URLs in d6e-auth (franchise portal or workspace settings). Loopback/`localhost` URLs need no registration.

For local development, the fastest path is an **API key (`d6e_…`)** issued from the console.

## Plugins vs custom frontends

| | Plugin | Custom frontend |
|---|---|---|
| What it is | A `template.yaml` package of workspace contents (prompts, STFs, workflows, files) | An independent web app that *uses* a workspace |
| Where it lives | **Inside** the instance | **Outside** the instance |
| UI | Via console / chat | It *is* the UI |

They extend opposite sides of the same API boundary and combine naturally. See [Custom frontend](/en/guides/custom-frontend/) and [Plugin development](/en/guides/plugins/).

## Source material

- [Frontend and instance relationship](https://github.com/d6e-ai/d6e-custom-frontend-skills/blob/main/docs/frontend-and-instance.md)
- [Local AI agent development guide](https://github.com/d6e-ai/d6e-plugin-skills/blob/main/docs/local-ai-development.md)
