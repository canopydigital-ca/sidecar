import { readFileSync } from 'fs';
import { resolve } from 'path';

export const load = async () => {
	try {
		const iconsPath = resolve(process.cwd(), '../packages/icons/icons.json');
		const newIconsPath = resolve(process.cwd(), '../packages/icons/icons.new.json');

		const content = readFileSync(iconsPath, 'utf-8');
		const newContent = readFileSync(newIconsPath, 'utf-8');


		const icons = JSON.parse(content);
		const newIcons = JSON.parse(newContent);

		return { icons, newIcons };
	} catch (error) {
		console.error('Failed to load icons:', error);
		return { icons: {}, newIcons: {} };
	}
};
