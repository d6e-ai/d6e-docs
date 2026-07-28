---
title: Design philosophy
description: Five design principles — your environment, public API, portable assets, incremental adoption, governance at the boundary.
---

This page is adapted from the [design philosophy document on www.d6e.ai](https://www.d6e.ai/docs/design-philosophy.md). It is written for developers and architects deciding how much of their system should depend on d6e — and how much should not. Everything described here reflects the actual implementation, not aspirations.

## Why loose coupling?

Fat frameworks are fast at first and expensive later. When features are tightly coupled to the framework, replacing the framework becomes a breaking change for everything built on it.

AI-assisted development changes the trade-off. You no longer need a fat framework to move fast; a loosely coupled platform plus composable, standard parts is now fast *and* keeps your options open. d6e is deliberately designed to stay loosely coupled to the systems you already own: **it should host your work, not absorb your system.**

## Principle 1: Your data and AI stay in your environment

The instance — API, database, file storage, agent runtime — runs on infrastructure you control. Workspace data is not sent to d6e-operated servers. The central site never sees workspace contents; it only brokers authentication.

## Principle 2: Everything is a public API

There is exactly one API surface. The d6e console is a client of the same public REST API (`/api/v1/*`) that you can call with an API key. The instance's MCP server exposes the same tools the built-in chat agent uses — roughly 96 `d6e_*` tools.

Practical consequences:

- Anything the console can do, your scripts, backends, and custom frontends can do
- Your local AI coding agent can connect to the instance MCP and develop against the real workspace with tool-for-tool parity. There is no separate SDK to learn
- Custom frontends are ordinary web apps. They authenticate via standard OAuth2 and call the instance API

## Principle 3: Portable assets, loose coupling

| Asset | Format | Portability |
|---|---|---|
| JS STF | Plain JavaScript: read `$input`, `return` a JSON-serializable result | A pure function. No d6e SDK, no imports |
| Docker STF | Any container image: JSON on stdin, `{"output": ...}` on stdout | Runs anywhere Docker runs |
| Effect | A declarative HTTP call | Re-expressible in any HTTP client in minutes |
| Prompts | Markdown | Copy-paste portable |
| Workspace DB | Plain PostgreSQL (`user_data`) | Dump and restore with standard tooling |
| Files | Regular files with paths | Download or sync out at any time |
| Custom frontend | An independent web app | Already outside d6e |
| Plugin | `template.yaml` + the files above | Human-readable declaration |

What d6e itself provides is the **glue**: authentication, membership, credential storage, policy enforcement, audit logging, scheduling, and orchestration. Migration cost is bounded to the glue — your logic, data, and prompts move as-is.

## Principle 4: Adopt incrementally

1. **Console only** — deploy an instance and start working in chat
2. **Harden the instructions** — move recurring procedures into prompts → STFs and workflows
3. **Package as a Plugin** — distribute via `template.yaml` to other workspaces
4. **Custom frontend** — build a normal web app when a task deserves a dedicated UI

Each step is optional. Stopping at any step leaves you with a working system. See [Choosing a path](/en-us/getting-started/choosing-a-path/).

## Principle 5: Governance at the boundary

Because every consumer goes through the same API, controls are enforced in one place:

- **Table policies, deny by default** — denied unless an allow policy matches. Applies equally to console, agent, MCP, and API-key callers
- **Audit logs** — workspace operations are recorded
- **Usage analytics** — token consumption tracked per model and user
- **Encrypted credential storage** — SaaS credentials and STF secrets are encrypted server-side. Secrets are write-only and injected at run time

## The dependency boundary

**Put in d6e:** the state the AI operates on, and the credentials it uses (tables, files, SaaS connections, STFs/workflows that must run reproducibly next to that data).

**Keep outside d6e:** everything you already own (frontend, backend, external DBs). The workspace SQL surface is intentionally restricted to the instance's own `user_data`. When the agent must touch an external system, do it explicitly via a Docker STF or an Effect.

## Raw Markdown for AI agents

```
https://www.d6e.ai/docs/design-philosophy.md
https://www.d6e.ai/docs/design-philosophy.ja.md
```
