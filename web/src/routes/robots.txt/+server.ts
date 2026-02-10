import { seoData } from '$lib/config/seo';

export const prerender = true;

export const GET = async () => {
	const sitemapUrl = `${seoData.baseUrl}/sitemap.xml`;

	const content = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}`;

	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain'
		}
	});
};
