// @ts-check
// Astro + Starlight config for docs.d6e.ai.
// Japanese is the default (root) locale; English lives under /en/.
// AI agents can fetch llms.txt / raw Markdown via starlight-llms-txt.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

// https://astro.build/config
// Static Starlight site. Vercel auto-detects Astro static output.
export default defineConfig({
	site: 'https://docs.d6e.ai',
	integrations: [
		starlight({
			title: 'd6e Docs',
			favicon: '/favicon.svg',
			logo: {
				light: './src/assets/logos/d6e.svg',
				dark: './src/assets/logos/d6e-white.svg',
				alt: 'd6e',
				replacesTitle: true
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/d6e-ai/d6e-docs'
				}
			],
			customCss: ['./src/styles/custom.css'],
			defaultLocale: 'root',
			locales: {
				root: {
					label: '日本語',
					lang: 'ja'
				},
				en: {
					label: 'English',
					lang: 'en'
				}
			},
			editLink: {
				baseUrl: 'https://github.com/d6e-ai/d6e-docs/edit/main/'
			},
			sidebar: [
				{
					label: 'はじめに',
					translations: { en: 'Getting started' },
					items: [
						{
							label: 'd6e とは',
							translations: { en: 'What is d6e?' },
							slug: 'getting-started/what-is-d6e'
						},
						{
							label: 'アーキテクチャ',
							translations: { en: 'Architecture' },
							slug: 'getting-started/architecture'
						},
						{
							label: '設計思想',
							translations: { en: 'Design philosophy' },
							slug: 'getting-started/design-philosophy'
						},
						{
							label: '開発パスの選び方',
							translations: { en: 'Choosing a path' },
							slug: 'getting-started/choosing-a-path'
						}
					]
				},
				{
					label: 'ガイド',
					translations: { en: 'Guides' },
					items: [
						{
							label: 'ローカル AI 開発',
							translations: { en: 'Local AI development' },
							slug: 'guides/local-ai-development'
						},
						{
							label: 'Plugin 開発',
							translations: { en: 'Plugin development' },
							slug: 'guides/plugins'
						},
						{
							label: 'Docker STF 開発',
							translations: { en: 'Docker STF development' },
							slug: 'guides/docker-stf'
						},
						{
							label: 'カスタムフロントエンド',
							translations: { en: 'Custom frontend' },
							slug: 'guides/custom-frontend'
						}
					]
				},
				{
					label: 'コアコンセプト',
					translations: { en: 'Core concepts' },
					items: [
						{
							label: 'コアコンセプト',
							translations: { en: 'Core concepts' },
							slug: 'concepts/core-concepts'
						}
					]
				},
				{
					label: 'リファレンス',
					translations: { en: 'Reference' },
					items: [
						{
							label: 'REST API',
							translations: { en: 'REST API' },
							slug: 'reference/rest-api'
						},
						{
							label: 'MCP ツール',
							translations: { en: 'MCP tools' },
							slug: 'reference/mcp-tools'
						}
					]
				}
			],
			plugins: [
				starlightLlmsTxt({
					projectName: 'd6e',
					description:
						'Developer documentation for d6e — a self-hostable AI work platform. Covers architecture, plugins, Docker STFs, custom frontends, REST API, and MCP tools.'
				})
			]
		})
	]
});
