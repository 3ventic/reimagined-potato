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
let items = Array.from(
	new Items.default({
		category: ['All']
	})
);
items = items.filter((item) => {
	// fixes
	if (item.name === 'Voidrig' || item.name === 'Bonewidow') {
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
		if (item.uniqueName.includes('Barrel') && item.productCategory === 'Pistols') {
			return true;
		}
		if (item.type === 'K-Drive Component' && item.uniqueName.endsWith('Deck')) {
			return true;
		}
		return false;
	}
	return categories.includes(item.category);
});

export function get() {
	return {
		body: { categories, items }
	};
}
