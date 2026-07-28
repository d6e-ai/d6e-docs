---
title: Installing Agent Skills
description: Load d6e development skills into Cursor / Claude Code / Codex. Install all skills for design, Q&A, and custom frontends.
---

[Agent Skills](https://skills.sh) are implementation guides that AI coding agents (Cursor, Claude Code, Codex, and others) read. This docs site focuses on the big picture and references — **skills remain the source of truth for code generation and detailed design**.

## Recommended: install everything

Install **all skills from all three repositories** when any of the following apply:

- You are building a custom frontend (you will usually need Plugin and Docker STF skills too)
- You are asking an LLM harness to design architecture or answer product questions
- You have not decided which adoption path to take yet

Installing only one side makes it easy for the agent to misunderstand the boundary between workspace contents (Plugin / STF) and the UI. With everything installed, that boundary stays consistent.

```bash
# All skills (recommended)
npx skills add d6e-ai/d6e-plugin-skills --skill '*' -y
npx skills add d6e-ai/d6e-docker-stf-skills --skill '*' -y
npx skills add d6e-ai/d6e-custom-frontend-skills --skill '*' -y
```

This installs into the current project. Add `-g` for a global install. To target every supported agent (Cursor / Claude Code / Codex, …), add `--agent '*'` or use `--all` (`--skill '*' --agent '*' -y`):

```bash
# Example: all skills → all agents
npx skills add d6e-ai/d6e-plugin-skills --all
npx skills add d6e-ai/d6e-docker-stf-skills --all
npx skills add d6e-ai/d6e-custom-frontend-skills --all
```

Also connect the instance MCP via [Local AI development](/en-us/guides/local-ai-development/) so the same agent can validate against a live workspace.

## Skill catalog

| Repository | Skill | Responsibility |
|---|---|---|
| [d6e-plugin-skills](https://github.com/d6e-ai/d6e-plugin-skills) | `d6e-plugin-development` | `template.yaml`, packaging JS/Docker STFs, distribution |
| [d6e-docker-stf-skills](https://github.com/d6e-ai/d6e-docker-stf-skills) | `d6e-docker-stf-development` | Container STFs (stdin/stdout JSON) |
| [d6e-custom-frontend-skills](https://github.com/d6e-ai/d6e-custom-frontend-skills) | `d6e-auth-integration` | OAuth2, sessions, redirect URIs |
| same | `d6e-workspace-api-client` | Server-side API proxy |
| same | `d6e-prompt-driven-ui` | Prompt-driven UI JSON contracts |

That is **five skills** total. `--skill '*'` installs every skill in the given repository.

## Path-specific minimal sets (optional)

Use these only when you intentionally narrow scope. When unsure, go back to “install everything”.

### Plugin only

```bash
npx skills add d6e-ai/d6e-plugin-skills --skill d6e-plugin-development -y
# Also when writing Docker STFs
npx skills add d6e-ai/d6e-docker-stf-skills --skill '*' -y
```

### Docker STF only

```bash
npx skills add d6e-ai/d6e-docker-stf-skills --skill d6e-docker-stf-development -y
# Also when packaging into a Plugin
npx skills add d6e-ai/d6e-plugin-skills --skill '*' -y
```

### Custom frontend

**Frontend skills alone are often not enough.** Tables, prompts, workflows, and STFs live on the Plugin / Docker STF side — so the default is all skills.

```bash
# Recommended (FE + Plugin + Docker STF)
npx skills add d6e-ai/d6e-plugin-skills --skill '*' -y
npx skills add d6e-ai/d6e-docker-stf-skills --skill '*' -y
npx skills add d6e-ai/d6e-custom-frontend-skills --skill '*' -y
```

## After install

You can ask the agent things like:

- “Following d6e’s design philosophy, propose a Plugin plus a thin custom FE for expense claims”
- “Compare console-only vs Plugin vs custom FE for this workflow”
- “Create an Echo Docker STF and test it locally”

For adoption-path guidance, see [Choosing a path](/en-us/getting-started/choosing-a-path/).
