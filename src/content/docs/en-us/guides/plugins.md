---
title: Plugin development
description: Package prompts, STFs, and workflows in template.yaml and distribute via URL or the Marketplace.
---

A Plugin packages **workspace contents** — prompts, tables/policies, STFs, workflows, effects, files — into a `template.yaml`. It is installed **into** an instance and executed **by** the instance. Users interact through the built-in console and chat.

## Install skills

When designing, asking questions, or combining with a custom FE, prefer [installing all skills](/en-us/guides/agent-skills/). Plugin-focused minimum:

```bash
npx skills add d6e-ai/d6e-plugin-skills --skill '*' -y
# Also when writing Docker STFs
npx skills add d6e-ai/d6e-docker-stf-skills --skill '*' -y
```

Repository: [d6e-ai/d6e-plugin-skills](https://github.com/d6e-ai/d6e-plugin-skills)

## What goes in a Plugin

| Piece | Summary |
|---|---|
| `template.yaml` | Manifest declaring prompts, STFs, workflows, policies, file refs, … |
| Prompts | Markdown that shapes chat-agent behavior |
| JS STF | Pure functions on QuickJS |
| Docker STF | Containers (see [Docker STF](/en-us/guides/docker-stf/)) |
| Effect | Declarative HTTP calls |
| Workflow | Orchestration of STF / Effect steps |
| Policies | Table ACL (deny by default) |

Schema: [schema/template.schema.json](https://github.com/d6e-ai/d6e-plugin-skills/blob/main/schema/template.schema.json)

## Typical workflow

1. Connect MCP via [Local AI development](/en-us/guides/local-ai-development/)
2. Iterate on SQL, STFs, and prompts; capture what works in `template.yaml`
3. Distribute via Install from URL, or Marketplace / registry

Details:

- [template-yaml-spec.md](https://github.com/d6e-ai/d6e-plugin-skills/blob/main/docs/template-yaml-spec.md)
- [publishing.md](https://github.com/d6e-ai/d6e-plugin-skills/blob/main/docs/publishing.md)
- [security-guidelines.md](https://github.com/d6e-ai/d6e-plugin-skills/blob/main/docs/security-guidelines.md)

## Relation to custom frontends

Plugins prepare workspace behavior; custom frontends consume it. Shipping `template.yaml` alongside frontend code in one repo is common. If you touch the FE, install the skills together ([Installing Agent Skills](/en-us/guides/agent-skills/)). See [Choosing a path](/en-us/getting-started/choosing-a-path/).
