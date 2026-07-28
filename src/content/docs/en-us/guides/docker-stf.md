---
title: Docker STF development
description: Build containerized business logic with a stdin/stdout JSON contract.
---

A Docker STF is a State Transition Function implemented as a container in any language. The contract is simple:

- **stdin:** JSON input
- **stdout:** `{"output": ...}`
- **stderr:** error messages
- **Secrets:** injected as environment variables at run time (write-only via API)

Because it is an ordinary container with no d6e SDK, you can unit-test with local `docker run`.

## Install skills

When designing, asking questions, or combining with Plugin / custom FE, prefer [installing all skills](/en-us/guides/agent-skills/). Docker-STF-focused minimum:

```bash
npx skills add d6e-ai/d6e-docker-stf-skills --skill '*' -y
# Also when packaging into a Plugin
npx skills add d6e-ai/d6e-plugin-skills --skill '*' -y
```

Repository: [d6e-ai/d6e-docker-stf-skills](https://github.com/d6e-ai/d6e-docker-stf-skills)

5-minute Quick Start: [docs/QUICKSTART.md](https://github.com/d6e-ai/d6e-docker-stf-skills/blob/main/docs/QUICKSTART.md)

## Typical flow

1. Generate code with the skill (Dockerfile / entrypoint / README)
2. `docker build` → `docker run` locally and verify stdin/stdout
3. Publish to a registry (ghcr.io / Docker Hub / …)
4. Register as an STF in the d6e console or API (`runtime: docker`)
5. Optionally bundle into a [Plugin](/en-us/guides/plugins/) `template.yaml`

## When to choose Docker STF

| Choose Docker STF | JS STF (QuickJS) is enough |
|---|---|
| Any language, heavy compute, native deps | Simple SQL transforms / aggregations |
| Explicit external network / external DB | Fully contained in workspace SQL |
| Reuse existing container assets | A few lines of pure function |

## Doc index

- [DEVELOPER_GUIDE.md](https://github.com/d6e-ai/d6e-docker-stf-skills/blob/main/docs/DEVELOPER_GUIDE.md)
- [TESTING.md](https://github.com/d6e-ai/d6e-docker-stf-skills/blob/main/docs/TESTING.md)
- [PUBLISHING.md](https://github.com/d6e-ai/d6e-docker-stf-skills/blob/main/docs/PUBLISHING.md)
- [AI-PROMPTS.md](https://github.com/d6e-ai/d6e-docker-stf-skills/blob/main/docs/AI-PROMPTS.md)

For registration, instant-run, and describe, see [REST API](/en-us/reference/rest-api/#stfs) and [MCP](/en-us/reference/mcp-tools/#stfs--libraries).
