import type { RequestHandler } from './$types';
import { seoData } from '$lib/config/seo';
import blogData from '$lib/content/blog.json';
import { locales, defaultLocale } from '$lib/i18n/config';

export const prerender = true;

type BlogPost = {
	slug: string;
	date?: string; // ISO or YYYY-MM-DD
	updated?: string;
	lastmod?: string;
	lang?: string;
};

function asPosts(data: unknown): BlogPost[] {
	if (Array.isArray(data)) return data as BlogPost[];
	if (data && typeof data === 'object') {
		const o = data as any;
		return (o.posts ?? o.items ?? []) as BlogPost[];
	}
	return [];
}

function isoDate(d?: string): string | undefined {
	if (!d) return undefined;
	// Keep it simple: if it already looks like YYYY-MM-DD, accept it.
	if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
	const parsed = new Date(d);
	if (Number.isNaN(parsed.getTime())) return undefined;
	return parsed.toISOString().slice(0, 10);
}

function xmlEscape(s: string): string {
	return s
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

export const GET: RequestHandler = async ({ url }) => {
	const origin = seoData.baseUrl ?? url.origin;
	const base = String(origin).replace(/\/+$/, '');

	// Dynamic discovery of static pages
	// We scan for all +page.svelte files under the [[lang]] route
	const modules = import.meta.glob('/src/routes/**/+page.svelte');

	const staticPaths = Object.keys(modules)
		.filter(path => path.includes('/src/routes/[[lang]]/'))
		.map(path => {
			// Transform: /src/routes/[[lang]]/foo/+page.svelte -> /foo
			// Transform: /src/routes/[[lang]]/+page.svelte -> /
			return path
				.replace('/src/routes/[[lang]]', '')
				.replace('/+page.svelte', '') || '/';
		})
		.filter(path => {
			// Exclude dynamic routes (e.g. /blog/[slug])
			return !path.includes('[');
		})
		.map(path => path === '/' ? '' : path); // Normalize root to empty string for consistency with loop below

	const posts = asPosts(blogData).filter((p) => typeof p?.slug === 'string' && p.slug.length > 0);

	const supportedLocales = Object.keys(locales);

	// Helper: if default locale is "en", URL is /about. If "es", URL is /es/about.
	// Adjust logic if you want /en/about for default locale too.
	const langPrefix = (lang: string) => (lang === defaultLocale ? '' : `/${lang}`);

	const entries: Array<{ loc: string; lastmod?: string }> = [];

	for (const lang of supportedLocales) {
		const prefix = langPrefix(lang);

		for (const p of staticPaths) {
			entries.push({ loc: `${base}${prefix}${p}` });
		}

		for (const post of posts) {
			// If posts are language-specific, keep only matching ones.
			if (post.lang && post.lang !== lang) continue;

			const lastmod = isoDate(post.updated ?? post.lastmod ?? post.date);
			entries.push({ loc: `${base}${prefix}/blog/${post.slug}`, lastmod });
		}
	}

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		entries
			.map((e) => {
				const lastmod = e.lastmod ? `\n    <lastmod>${xmlEscape(e.lastmod)}</lastmod>` : '';
				return `  <url>\n    <loc>${xmlEscape(e.loc)}</loc>${lastmod}\n  </url>`;
			})
			.join('\n') +
		`\n</urlset>\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		}
	});
};
