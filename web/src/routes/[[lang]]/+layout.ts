import { locales, isLocale, defaultLocale } from '$lib/i18n/config';
import { en } from '$lib/i18n/en';
import { es } from '$lib/i18n/es';
import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';

const translations = { en, es };

export const load: LayoutLoad = async ({ params }) => {
	const lang = params.lang || defaultLocale;

	if (params.lang && !isLocale(params.lang)) {
		throw error(404, `Language not supported: ${params.lang}`);
	}

	// Type-safe lookup
	const t = translations[lang as keyof typeof translations];

	return {
		lang,
		t
	};
};

export const prerender = true;
