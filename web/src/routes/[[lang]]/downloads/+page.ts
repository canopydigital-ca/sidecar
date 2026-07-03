import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const p = await parent();
	// Adjust this line to your actual i18n shape:
	return { t: p.t.secondaryFeatures };
};
