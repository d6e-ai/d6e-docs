# d6e Docs

Developer documentation for [d6e](https://www.d6e.ai) — a self-hostable AI work platform.

**Site:** https://docs.d6e.ai

## Local development

```bash
# Node.js >= 22.12
npm install
npm run dev
```

Open http://localhost:4321

## Build

```bash
npm run build
npm run preview
```

## Content

- Japanese (default / root locale): `src/content/docs/`
- English: `src/content/docs/en/`
- Sidebar & i18n: `astro.config.mjs`

AI agents can fetch the full corpus at `/llms.txt` after deploy.

## Related repositories

- [d6e-plugin-skills](https://github.com/d6e-ai/d6e-plugin-skills)
- [d6e-docker-stf-skills](https://github.com/d6e-ai/d6e-docker-stf-skills)
- [d6e-custom-frontend-skills](https://github.com/d6e-ai/d6e-custom-frontend-skills)
- Landing / auth: [d6e-auth](https://github.com/d6e-ai/d6e-auth) (`/developers`)
