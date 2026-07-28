// @ts-check
// Astro + Starlight config for docs.d6e.ai.
// Locale *paths* are lowercase (ja-jp / en-us) because Astro content slugs
// are lowercased. HTML lang tags stay ja-JP / en-US. Edge middleware
// canonicalizes the address bar to /ja-JP/ and /en-US/ (same as www.d6e.ai).
// Root `/` is redirected by middleware based on Accept-Language.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

// https://astro.build/config
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
			defaultLocale: 'ja-jp',
			locales: {
				'ja-jp': {
					label: '日本語',
					lang: 'ja-JP'
				},
				'en-us': {
					label: 'English',
					lang: 'en-US'
				}
			},
			disable404Route: true,
			editLink: {
				baseUrl: 'https://github.com/d6e-ai/d6e-docs/edit/main/'
			},
			sidebar: [
				{
					label: 'はじめに',
					translations: { 'en-us': 'Getting started' },
					items: [
						{
							label: 'd6e とは',
							translations: { 'en-us': 'What is d6e?' },
							slug: 'getting-started/what-is-d6e'
						},
						{
							label: 'アーキテクチャ',
							translations: { 'en-us': 'Architecture' },
							slug: 'getting-started/architecture'
						},
						{
							label: '設計思想',
							translations: { 'en-us': 'Design philosophy' },
							slug: 'getting-started/design-philosophy'
						},
						{
							label: '開発パスの選び方',
							translations: { 'en-us': 'Choosing a path' },
							slug: 'getting-started/choosing-a-path'
						}
					]
				},
				{
					label: 'ガイド',
					translations: { 'en-us': 'Guides' },
					items: [
						{
							label: 'ローカル AI 開発',
							translations: { 'en-us': 'Local AI development' },
							slug: 'guides/local-ai-development'
						},
						{
							label: 'Plugin 開発',
							translations: { 'en-us': 'Plugin development' },
							slug: 'guides/plugins'
						},
						{
							label: 'Docker STF 開発',
							translations: { 'en-us': 'Docker STF development' },
							slug: 'guides/docker-stf'
						},
						{
							label: 'カスタムフロントエンド',
							translations: { 'en-us': 'Custom frontend' },
							slug: 'guides/custom-frontend'
						}
					]
				},
				{
					label: 'コアコンセプト',
					translations: { 'en-us': 'Core concepts' },
					items: [
						{
							label: 'コアコンセプト',
							translations: { 'en-us': 'Core concepts' },
							slug: 'concepts/core-concepts'
						}
					]
				},
				{
					label: 'リファレンス',
					translations: { 'en-us': 'Reference' },
					items: [
						{
							label: 'REST API',
							translations: { 'en-us': 'REST API' },
							slug: 'reference/rest-api'
						},
						{
							label: 'MCP ツール',
							translations: { 'en-us': 'MCP tools' },
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
