import * as Items from 'warframe-items';
const categories: Items.Category[] = [
	'Arch-Gun',
	'Arch-Melee',
	'Archwing',
	'Melee',
	'Pets',
	'Primary',
	'Secondary',
	'Sentinels',
	'Warframes'
];
const items = new Items.default({
	category: categories
}).filter((item) => {
	// non-mastery items
	if (item.category === 'Pets' && item.type !== 'Pets') {
		return false;
	}
	if (item.category === 'Pets' && item.uniqueName.includes('Deimos')) {
		return false;
	}
	return true;
});

export function get() {
	return {
		body: { categories, items }
	};
}
