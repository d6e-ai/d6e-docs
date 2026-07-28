---
title: Choosing a path
description: Incremental adoption — console → Plugin → Docker STF → custom frontend.
---

d6e does not require a big-bang adoption. Stop at any step and you still have a working system.

## Decision flow

```
Does chat cover the work?
  ├─ Yes → Console-only is enough
  └─ No / need reproducible behavior
         ├─ Keep console UX, distribute the behavior → Plugin
         ├─ Heavy compute / any language / external network → Docker STF
         │   (can be bundled inside a Plugin)
         └─ Need a dedicated UI / own domain → Custom frontend
                                              (usually combined with a Plugin)
```

## Path comparison

| Path | Good for | Not ideal for | Start here |
|---|---|---|---|
| **Console only** | Exploration, data loading, team chat | Dedicated UX, external distribution | Log into your instance |
| **Plugin** | Packaging prompts, STFs, workflows, policies for install/distribution | Custom screens | [Plugin guide](/en/guides/plugins/) |
| **Docker STF** | Any language, heavy jobs, explicit external API/DB access | Simple SQL-only logic (JS STF is enough) | [Docker STF guide](/en/guides/docker-stf/) |
| **Custom FE** | Task-specific UI, branding, simplified flows | Work that is fine in the console | [Custom FE guide](/en/guides/custom-frontend/) |

## Recommended start

1. **Issue an API key** and [connect your local AI agent via MCP](/en/guides/local-ai-development/)
2. Try tables and prompts in the console or via MCP; harden what works
3. When reproducibility matters, package into a Plugin with `template.yaml`
4. If you need containers, build a Docker STF with [d6e-docker-stf-skills](https://github.com/d6e-ai/d6e-docker-stf-skills) and include it in the Plugin
5. If you need a dedicated UI, build a frontend with [d6e-custom-frontend-skills](https://github.com/d6e-ai/d6e-custom-frontend-skills) that consumes the workspace the Plugin prepared

## Skills repositories (Agent Skills)

Implementation guides meant to be loaded into AI coding agents:

```bash
# Plugin
npx skills add d6e-ai/d6e-plugin-skills --skill d6e-plugin-development

# Docker STF
npx skills add d6e-ai/d6e-docker-stf-skills --skill d6e-docker-stf-development

# Custom frontend
npx skills add d6e-ai/d6e-custom-frontend-skills --skill d6e-auth-integration
npx skills add d6e-ai/d6e-custom-frontend-skills --skill d6e-workspace-api-client
npx skills add d6e-ai/d6e-custom-frontend-skills --skill d6e-prompt-driven-ui
```

This docs site focuses on the big picture and references. The skills repositories remain the source of truth for code generation details.
