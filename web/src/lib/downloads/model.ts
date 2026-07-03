export type BrowserId = 'chrome' | 'edge' | 'firefox';
export type VariantId = 'full';

export type BrowserDef = {
	id: BrowserId;
	label: string;
	mv: 2 | 3;
	badge?: string;
};

export type VariantDef = {
	id: VariantId;
	label: string;
	short: string;
	includes: { pets: boolean; quest: boolean };
};

export type DownloadModule = {
	id: string;
	name: string;
	description: string;
	size: number; // MB
	required?: boolean;
};

export const BROWSERS: BrowserDef[] = [
	{ id: 'chrome', label: 'Chrome', mv: 3, badge: 'MV3' },
	{ id: 'edge', label: 'Edge', mv: 3, badge: 'MV3' },
	{ id: 'firefox', label: 'Firefox', mv: 2, badge: 'MV2' },
];

export const VARIANTS: VariantDef[] = [
	{ id: 'full', label: 'Full', short: 'Full', includes: { pets: true, quest: true } },
];

export function requiredIds(modules: DownloadModule[]): Set<string> {
	const req = new Set<string>();
	for (const m of modules) if (m.required) req.add(m.id);
	return req;
}

export function allIds(modules: DownloadModule[]): Set<string> {
	const all = new Set<string>();
	for (const m of modules) all.add(m.id);
	return all;
}

export function presetIds(modules: DownloadModule[], variantId: VariantId): Set<string> {
	const variant = VARIANTS.find((v) => v.id === variantId);
	const req = requiredIds(modules);
	const ids = new Set<string>(req);

	if (!variant) return ids;

	if (variant.includes.pets) ids.add('pets');

	if (variant.includes.quest) {
		// support either/both ids depending on your module list
		ids.add('quest');
		ids.add('pq');
	}

	if (variantId === 'full') {
		for (const id of allIds(modules)) ids.add(id);
	}

	return ids;
}

export function presetSize(modules: DownloadModule[], variantId: VariantId): number {
	const ids = presetIds(modules, variantId);
	return modules.filter((m) => ids.has(m.id)).reduce((acc, m) => acc + m.size, 0);
}

export function artifactName(
	opts: { version: string; browser: BrowserId; mv: 2 | 3; variant: VariantId }
) {
	return `sidecar-v${opts.version}-${opts.browser}-mv${opts.mv}-${opts.variant}.zip`;
}

export function downloadHref(
	opts: { baseUrl?: string; version: string; browser: BrowserId; mv: 2 | 3; variant: VariantId }
) {
	if (!opts.baseUrl) return null;
	const base = opts.baseUrl.replace(/\/$/, '');
	return `${base}/${artifactName(opts)}`;
}
