---
title: Choosing a path
description: Incremental adoption — console → Plugin → Docker STF → custom frontend.
---

d6e does not require a big-bang adoption. Stop at any step and you still have a working system.

## Install Skills first (recommended)

When you ask Cursor / Claude Code / Codex to design or answer questions — and when you build a custom frontend — install **all skills from all three repositories**. A single-repo install makes it easy to misunderstand the boundary.

```bash
npx skills add d6e-ai/d6e-plugin-skills --skill '*' -y
npx skills add d6e-ai/d6e-docker-stf-skills --skill '*' -y
npx skills add d6e-ai/d6e-custom-frontend-skills --skill '*' -y
```

See [Installing Agent Skills](/en-us/guides/agent-skills/) for details.

## Decision flow

```
Does chat cover the work?
  ├─ Yes → Console-only is enough
  └─ No / need reproducible behavior
         ├─ Keep console UX, distribute the behavior → Plugin
         ├─ Heavy compute / any language / external network → Docker STF
         │   (can be bundled inside a Plugin)
         └─ Need a dedicated UI / own domain → Custom frontend
                                              (usually with Plugin ± Docker STF)
```

## Path comparison

| Path | Good for | Not ideal for | Start here |
|---|---|---|---|
| **Console only** | Exploration, data loading, team chat | Dedicated UX, external distribution | Log into your instance |
| **Plugin** | Packaging prompts, STFs, workflows, policies for install/distribution | Custom screens | [Plugin guide](/en-us/guides/plugins/) |
| **Docker STF** | Any language, heavy jobs, explicit external API/DB access | Simple SQL-only logic (JS STF is enough) | [Docker STF guide](/en-us/guides/docker-stf/) |
| **Custom FE** | Task-specific UI, branding, simplified flows | Work that is fine in the console | [Custom FE guide](/en-us/guides/custom-frontend/) |

Even when you choose a custom FE, dependent tables, prompts, workflows, and STFs usually live in a Plugin (and Docker STFs when needed). That is why the skills are installed together.

## Recommended start

1. [Install all Agent Skills](/en-us/guides/agent-skills/)
2. **Issue an API key** and [connect your local AI agent via MCP](/en-us/guides/local-ai-development/)
3. Try tables and prompts in the console or via MCP; harden what works
4. When reproducibility matters, package into a Plugin with `template.yaml`
5. If you need containers, build a Docker STF and include it in the Plugin
6. If you need a dedicated UI, build a custom frontend that consumes the workspace the Plugin prepared

This docs site focuses on the big picture and references. The skills repositories remain the source of truth for code generation details.
