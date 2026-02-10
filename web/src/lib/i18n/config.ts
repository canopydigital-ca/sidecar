export const defaultLocale = 'en';

export const locales = {
	en: 'English',
	es: 'Español'
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
