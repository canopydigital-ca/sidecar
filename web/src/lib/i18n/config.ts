export const defaultLocale = 'en-ca';

export const locales = {
	'en-ca': 'English (Canada)',
	fr: 'Français',
	es: 'Español',
	da: 'Dansk',
	hi: 'हिन्दी',
	id: 'Bahasa Indonesia',
	it: 'Italiano',
	ja: '日本語',
	ko: '한국어',
	ku: 'Kurdî',
	nl: 'Nederlands',
	pt: 'Português',
	ro: 'Română',
	ru: 'Русский',
	tr: 'Türkçe',
	uk: 'Українська'
} as const;

export type Locale = keyof typeof locales;

export function isLocale(key: string): key is Locale {
	return key in locales;
}

export function getLangEntries() {
	const supportedLocales = Object.keys(locales);
	const routeParams: Array<{ lang: string }> = [
		{ lang: '' }, // Default (root)
	];

	// Add all other locales as prefixes
	for (const lang of supportedLocales) {
		if (lang !== defaultLocale) {
			routeParams.push({ lang });
		}
	}

	return routeParams;
}
