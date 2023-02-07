export const prerender = true;
export const trailingSlash = true;

import * as Items from 'warframe-items';
const categories: Items.Category[] = [
	'Arch-Gun',
	'Arch-Melee',
	'Archwing',
	'Melee',
	'Misc',
	'Pets',
	'Primary',
	'Secondary',
	'Sentinels',
	'Warframes'
];
const items = Array.from(
	new Items.default({
		category: [...categories, 'SentinelWeapons']
	})
)
	.filter((item) => {
		if (!item.name) return false;

		// fixes
		if (isNecramech(item)) {
			item.maxLevelCap = 40;
		}

		// non-mastery items
		if (item.category === 'Pets' && item.type !== 'Pets' && item.name !== 'Venari') {
			return false;
		}
		if (item.category === 'Pets' && item.uniqueName.includes('Deimos')) {
			return false;
		}
		if (item.category === 'Melee' && item.type === 'Zaw Component') {
			// Allow zaw strikes only
			return (
				[
					'balla',
					'dokrahm',
					'kronsh',
					'ooltha',
					'plague keewar',
					'plague kripath',
					'rabvee',
					'sepfahn',
					'dehtat',
					'cyath',
					'mewan'
				].includes(item.name.toLowerCase()) && !item.uniqueName.includes('PvPVariant')
			);
		}
		if (item.category === 'Misc') {
			// Kitgun barrels
			if (
				item.uniqueName.includes('Barrel') &&
				(item as Items.Component).productCategory === 'Pistols'
			) {
				return true;
			}
			// K-drive decks
			if (item.type === 'K-Drive Component' && item.uniqueName.endsWith('Deck')) {
				return true;
			}
			return false;
		}
		return item.category && categories.includes(item.category);
	})
	.map((item) => item as Items.MinimalItem);

function isNecramech(item: Items.Item): item is Items.Warframe {
	return ['Voidrig', 'Bonewidow'].includes(item.name ?? '');
}

export function load() {
	return { categories, items } as const;
}
