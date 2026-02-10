import { seoData } from '$lib/config/seo';

export const prerender = true;

export const GET = async () => {
	const base = seoData.baseUrl;
	const today = new Date().toISOString().split('T')[0];

	// Extract routes from seoData
	const routes = Object.values(seoData.routes).map(route => {
		// Convert canonical URL back to relative path for the sitemap loc
		// or just use the canonical directly if it matches the base
		const loc = route.canonical;
		return {
			loc,
			lastmod: today,
			changefreq: 'weekly',
			priority: loc === base ? 1.0 : 0.8
		};
	});

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${routes
			.map(
				({ loc, lastmod, changefreq, priority }) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
			)
			.join('')}
</urlset>`.trim();

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
};
