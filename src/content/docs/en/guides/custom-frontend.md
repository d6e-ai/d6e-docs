---
title: Custom frontend
description: Build an ordinary web app that logs users in via OAuth2 and calls the public API.
---

A custom frontend is an independently deployed web app that logs users in via the central account site and then operates on **a specific workspace on a specific d6e instance** through the public HTTP API — the same API the console uses.

There is no privileged integration. The security boundary stays on the instance.

## Quick setup

```bash
npx skills add d6e-ai/d6e-custom-frontend-skills --skill d6e-auth-integration
npx skills add d6e-ai/d6e-custom-frontend-skills --skill d6e-workspace-api-client
npx skills add d6e-ai/d6e-custom-frontend-skills --skill d6e-prompt-driven-ui
```

Repository: [d6e-ai/d6e-custom-frontend-skills](https://github.com/d6e-ai/d6e-custom-frontend-skills)  
A reference implementation (AI bookkeeping) ships in the same repo.

## What the three skills cover

| Skill | Responsibility |
|---|---|
| `d6e-auth-integration` | OAuth2 (authorization code), session cookies, refresh, workspace allow-list |
| `d6e-workspace-api-client` | Server-side proxy (files / SQL / workflows / async jobs, …) |
| `d6e-prompt-driven-ui` | LLM `kind` JSON output, Zod parsing, revision flow, UI contracts |

## Auth essentials

1. Redirect the browser to `https://www.d6e.ai/auth/login`
2. POST the authorization code to the **instance** `POST /api/v1/auth/token`
3. Call `/api/v1/*` with the Bearer token afterwards

Frontends **never hold a client secret**. Register production callback URLs in d6e-auth (localhost is exempt). See [Architecture](/en/getting-started/architecture/).

## Conceptual docs (canonical)

- [frontend-and-instance.md](https://github.com/d6e-ai/d6e-custom-frontend-skills/blob/main/docs/frontend-and-instance.md) — the three actors
- [architecture.md](https://github.com/d6e-ai/d6e-custom-frontend-skills/blob/main/docs/architecture.md) — reference app sequences
- [d6e-api-integration.md](https://github.com/d6e-ai/d6e-custom-frontend-skills/blob/main/docs/d6e-api-integration.md) — request/response shapes
- [workspace-setup.md](https://github.com/d6e-ai/d6e-custom-frontend-skills/blob/main/docs/workspace-setup.md) — preparing the dependent workspace

## Combining with Plugins

Package the tables, prompts, and workflows your frontend depends on as a Plugin so new workspaces can be provisioned reproducibly. See [Choosing a path](/en/getting-started/choosing-a-path/).
