<script lang="ts">
	import { Checkbox, Theme } from 'carbon-components-svelte';
	import 'carbon-components-svelte/css/all.css';
	import type { CarbonTheme } from 'node_modules/carbon-components-svelte/types/Theme/Theme.svelte';
	import type { RankData } from 'src/ranks';
	import type { Category, Item, UniqueName } from 'warframe-items';

	export let items: Item[];
	export let categories: Category[];

	let theme: CarbonTheme = 'g100';

	let checked: Record<Category, boolean> = {
		All: false,
		Arcanes: true,
		'Arch-Gun': true,
		'Arch-Melee': true,
		Archwing: true,
		Fish: true,
		Gear: true,
		Glyphs: true,
		Melee: true,
		Misc: true,
		Mods: true,
		Node: true,
		Pets: true,
		Primary: true,
		Quests: true,
		Relics: true,
		Resources: true,
		Secondary: true,
		Sentinels: true,
		Sigils: true,
		Skins: true,
		Warframes: true
	};

	let search = '';

	$: shownItems = items
		.filter((item) => {
			// search terms
			if (search.length > 0) {
				if (!item.name.toLowerCase().includes(search.toLowerCase())) {
					return false;
				}
			}

			// category filter
			if (checked[item.category]) {
				return true;
			}
		})
		.sort((a, b) => {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});

	let itemDataString =
		typeof window !== 'undefined' && localStorage?.getItem('reimagined-potato.itemData');

	let itemData: { [key: UniqueName]: RankData } = itemDataString ? JSON.parse(itemDataString) : {};

	$: shownItems.forEach((item) => {
		if (!Object.hasOwn(itemData, item.uniqueName)) {
			itemData[item.uniqueName] = {
				rank: 0,
				category: item.category,
				owned: false
			};
		} else {
			itemData[item.uniqueName].category = item.category;
			itemData[item.uniqueName].owned = itemData[item.uniqueName].owned ?? false;
		}
	});

	$: console.log(shownItems);

	function imageUrl(item: Item) {
		return `https://cdn.warframestat.us/img/${item.imageName}`;
	}
</script>

<Theme bind:theme persist persistKey="__carbon-theme" />

<section>
	<header>
		<h1>Reimagined Potato MR Tracker</h1>
		<span>Showing</span>
		{#each categories as category}
			<div>
				<Checkbox bind:checked={checked[category]} labelText={category} />
				<input
					type="checkbox"
					name={`category-filter-${category}`}
					id={`category-filter-${category}`}
					bind:checked={checked[category]}
				/><label for={`category-filter-${category}`}>{category}</label>
			</div>
		{/each}
		<search>
			<input type="text" placeholder="Search..." bind:value={search} />
		</search>
	</header>
	<div>
		{#each shownItems as item}
			<div class="item">
				<img src={imageUrl(item)} alt={`${item.name} image`} loading="lazy" />
				<span class="item-name" title={item.name}>{item.name}</span>
				<div>
					<label for={`item-rank-${item.name}`}>Rank</label><input
						type="number"
						id={`item-rank-${item.name}`}
						max={item.maxLevelCap ?? 30}
						min="0"
						bind:value={itemData[item.uniqueName].rank}
						on:blur={() =>
							localStorage.setItem('reimagined-potato.itemData', JSON.stringify(itemData))}
					/>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		min-width: 35em;
	}
	section > * {
		width: 100%;
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
	}
	header {
		height: 30em;
		align-content: center;
		border-bottom: 0.2em solid #35006d;
	}
	header > h1 {
		line-height: 1rem;
		margin: 0.5em 5em 0.5em 0;
	}
	header > span {
		margin-right: 5em;
	}
	header > div {
		padding: 0.5em;
		width: 8em;
	}
	header label {
		margin-left: 0.5em;
	}
	section > div:last-child {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}
	.item {
		width: 10em;
		height: 16em;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		margin: 1em;
		border: 0.15em solid #35006d;
		padding: 1em;
	}
	.item > img {
		height: 8em;
	}
	.item-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}

	search {
		padding: 1.5em;
	}
	search > input {
		padding: 0.5em;
	}
	@media (min-width: 115em) {
		header {
			height: 5em;
		}
	}
</style>
