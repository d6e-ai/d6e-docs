// Edge middleware for docs.d6e.ai.
//
// Goals:
// 1. `/` → /ja-JP/ or /en-US/ from Accept-Language (default ja-JP)
// 2. Address bar shows ja-JP / en-US (same as www.d6e.ai), while static
//    files live under lowercase /ja-jp/ /en-us/ (Astro content slug rule)
// 3. Legacy /en/... and unprefixed doc paths keep working
import { next, rewrite } from '@vercel/edge';

const DEFAULT_LOCALE = 'ja-JP';

const PASSTHROUGH_PREFIXES = [
	'/llms',
	'/sitemap',
	'/_astro',
	'/pagefind',
	'/favicon',
	'/logos',
	'/404',
	'/.well-known'
];

/**
 * Pick ja-JP or en-US from Accept-Language.
 * Prefers Japanese when any `ja*` tag ranks at least as high as the best `en*`.
 */
function pickLocale(acceptLanguage: string | null): 'ja-JP' | 'en-US' {
	if (!acceptLanguage) return DEFAULT_LOCALE;

	let bestJa = -1;
	let bestEn = -1;

	for (const part of acceptLanguage.split(',')) {
		const [tagRaw, ...params] = part.trim().split(';');
		const tag = (tagRaw || '').toLowerCase();
		if (!tag) continue;

		let q = 1;
		for (const param of params) {
			const match = param.trim().match(/^q=([0-9.]+)$/i);
			if (match) {
				q = Number(match[1]);
				if (Number.isNaN(q)) q = 0;
			}
		}

		if (tag === 'ja' || tag.startsWith('ja-')) {
			bestJa = Math.max(bestJa, q);
		} else if (tag === 'en' || tag.startsWith('en-')) {
			bestEn = Math.max(bestEn, q);
		}
	}

	if (bestJa < 0 && bestEn < 0) return DEFAULT_LOCALE;
	if (bestJa >= bestEn) return 'ja-JP';
	return 'en-US';
}

function shouldPassthrough(pathname: string): boolean {
	if (pathname === '/') return false;
	return PASSTHROUGH_PREFIXES.some(
		(prefix) =>
			pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix)
	);
}

/** Map mixed-case or lowercase locale prefix to the static file prefix. */
function toFileLocale(prefix: string): 'ja-jp' | 'en-us' | null {
	const lower = prefix.toLowerCase();
	if (lower === 'ja-jp') return 'ja-jp';
	if (lower === 'en-us') return 'en-us';
	return null;
}

/** Canonical address-bar locale (matches www.d6e.ai). */
function toCanonicalLocale(fileLocale: 'ja-jp' | 'en-us'): 'ja-JP' | 'en-US' {
	return fileLocale === 'ja-jp' ? 'ja-JP' : 'en-US';
}

export const config = {
	matcher: ['/', '/((?!_astro|pagefind|favicon|logos).*)']
};

export default function middleware(request: Request) {
	const url = new URL(request.url);
	const { pathname } = url;

	if (shouldPassthrough(pathname)) {
		return next();
	}

	// Root: browser-language home → canonical mixed-case path.
	if (pathname === '/' || pathname === '') {
		const locale = pickLocale(request.headers.get('accept-language'));
		url.pathname = `/${locale}/`;
		return Response.redirect(url, 302);
	}

	// Legacy English prefix from the first deploy: /en/... → /en-US/...
	if (pathname === '/en' || pathname.startsWith('/en/')) {
		const rest = pathname === '/en' ? '/' : pathname.slice('/en'.length);
		url.pathname = `/en-US${rest === '' ? '/' : rest}`;
		return Response.redirect(url, 308);
	}

	const segments = pathname.split('/');
	// pathname like /ja-JP/guides/... → ['', 'ja-JP', 'guides', ...]
	const first = segments[1] || '';
	const fileLocale = toFileLocale(first);

	if (fileLocale) {
		const canonical = toCanonicalLocale(fileLocale);
		const rest = '/' + segments.slice(2).join('/');
		const restPath = rest === '/' ? '/' : rest.endsWith('/') ? rest : `${rest}/`;

		// Lowercase file path in the address bar → redirect to canonical case.
		if (first !== canonical) {
			url.pathname = `/${canonical}${restPath === '/' ? '/' : restPath}`;
			return Response.redirect(url, 308);
		}

		// Canonical mixed-case URL → rewrite to lowercase static files.
		const dest = new URL(request.url);
		dest.pathname = `/${fileLocale}${restPath === '/' ? '/' : restPath}`;
		return rewrite(dest);
	}

	// Legacy unprefixed Japanese paths from the first deploy.
	url.pathname = `/${DEFAULT_LOCALE}${pathname.endsWith('/') ? pathname : `${pathname}/`}`;
	return Response.redirect(url, 308);
}
