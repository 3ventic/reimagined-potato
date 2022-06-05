<script lang="ts">
	import {
		Checkbox,
		ListItem,
		NumberInput,
		OrderedList,
		Tab,
		TabContent,
		Tabs,
		Tag,
		TextInput,
		Theme,
		Tile,
		Toggle
	} from 'carbon-components-svelte';
	import 'carbon-components-svelte/css/all.css';
	import type { CarbonTheme } from 'node_modules/carbon-components-svelte/types/Theme/Theme.svelte';
	import type { Intrinsic, OtherData, RankData } from 'src/ranks';
	import type { Category, Item, UniqueName } from 'warframe-items';
	import { masteryRankTitles } from '../models/mastery-ranks';

	export let items: Item[];
	export let categories: Category[];

	const intrinsics: Intrinsic[] = ['Tactical', 'Piloting', 'Gunnery', 'Engineering', 'Command'];
	const highMultiplierCategories: Category[] = ['Archwing', 'Pets', 'Sentinels', 'Warframes'];
	const starChartXPMax = 27501;
	const steelPathXPMax = 27501;

	let theme: CarbonTheme = 'g100';

	const checked: Record<Category, boolean> = {
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
	let unowned = false;
	let unmastered = false;

	const otherDataString =
		typeof window !== 'undefined' && localStorage?.getItem('reimagined-potato.otherData');
	const otherDataLoaded = otherDataString ? JSON.parse(otherDataString) : {};
	if (!Object.hasOwn(otherDataLoaded, 'intrinsics')) {
		otherDataLoaded.intrinsics = {};
	}
	const otherData: OtherData = {
		starChartXP: 0,
		steelPathXP: 0,
		intrinsics: {
			Tactical: 0,
			Piloting: 0,
			Gunnery: 0,
			Engineering: 0,
			Command: 0
		},
		plexusRank: 0,
		...otherDataLoaded
	};
	otherData.intrinsics = {
		Tactical: 0,
		Piloting: 0,
		Gunnery: 0,
		Engineering: 0,
		Command: 0,
		...otherDataLoaded.intrinsics
	};

	const itemDataString =
		typeof window !== 'undefined' && localStorage?.getItem('reimagined-potato.itemData');

	const itemData: { [key: UniqueName]: RankData } = itemDataString
		? JSON.parse(itemDataString)
		: {};

	const masteryRequirements: number[] = [];
	// MR 1-30
	for (let i = 1; i <= 30; i++) {
		masteryRequirements.push(2500 * Math.pow(i, 2));
	}
	// Legendary 1-5
	for (let i = 1; i <= 5; i++) {
		masteryRequirements.push(2250000 + i * 147500);
	}

	items.forEach((item) => {
		if (!Object.hasOwn(itemData, item.uniqueName)) {
			itemData[item.uniqueName] = {
				rank: 0,
				category: item.category,
				owned: false
			};
		} else {
			itemData[item.uniqueName].category = item.category;
			itemData[item.uniqueName].owned = itemData[item.uniqueName].owned ?? false;
			itemData[item.uniqueName].rank = itemData[item.uniqueName].rank ?? 0;
		}
	});

	$: shownItems = items
		.filter((item) => {
			// search terms
			if (search.length > 0) {
				if (
					!item.name.toLowerCase().includes(search.toLowerCase()) &&
					!item.category.toLowerCase().includes(search.toLowerCase()) &&
					!item.productCategory?.toLowerCase().includes(search.toLowerCase()) &&
					!item.description?.toLowerCase().includes(search.toLowerCase())
				) {
					return false;
				}
			}

			// other filters
			if (unowned && itemData[item.uniqueName].owned) {
				return false;
			}
			if (unmastered && itemData[item.uniqueName].rank === (item.maxLevelCap ?? 30)) {
				return false;
			}
			return true;
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

	$: categoryShownItems = shownItems.filter((item) => checked[item.category]);

	$: mastery =
		items.reduce((acc, item) => {
			let rank = itemData[item.uniqueName].rank;
			return acc + rank * masteryMultiplier(item);
		}, 0) +
		otherData.starChartXP +
		otherData.steelPathXP +
		otherData.plexusRank * 200 +
		otherData.intrinsics.Tactical * 1500 +
		otherData.intrinsics.Piloting * 1500 +
		otherData.intrinsics.Gunnery * 1500 +
		otherData.intrinsics.Engineering * 1500 +
		otherData.intrinsics.Command * 1500;

	$: ownedPotentialMastery =
		mastery +
		items.reduce((acc, item) => {
			let max = item.maxLevelCap ?? 30;
			let rank = itemData[item.uniqueName].rank;
			return acc + (max - rank) * masteryMultiplier(item);
		}, 0);

	// star chart max + steel path max + plexus rank max + intrinsic max + mastery max + "Amp" empty item
	$: totalPotentialMastery =
		starChartXPMax +
		steelPathXPMax +
		6000 +
		1500 * 10 * 5 +
		items.reduce((acc, item) => {
			return acc + (item.maxLevelCap ?? 30) * masteryMultiplier(item);
		}, 0) +
		3000;

	// $: console.log(shownItems);

	function imageUrl(item: Item) {
		return `https://cdn.warframestat.us/img/${item.imageName}`;
	}

	function saveItemData() {
		localStorage.setItem('reimagined-potato.itemData', JSON.stringify(itemData));
	}

	function saveOtherData() {
		localStorage.setItem('reimagined-potato.otherData', JSON.stringify(otherData));
	}

	function masteryMultiplier(item: Item) {
		let multiplier = 100;
		if (
			highMultiplierCategories.includes(item.category) ||
			(item.type === 'K-Drive Component' && item.uniqueName.endsWith('Deck'))
		) {
			multiplier = 200;
		}
		return multiplier;
	}

	function requirementTagType(
		requirement: number
	): 'red' | 'blue' | 'green' | 'cool-gray' | 'warm-gray' {
		if (mastery >= requirement) {
			return 'green';
		}
		if (ownedPotentialMastery >= requirement) {
			return 'blue';
		}
		if (totalPotentialMastery >= requirement) {
			return 'cool-gray';
		}
		return 'red';
	}
</script>

<Theme bind:theme persist persistKey="__carbon-theme" />

<section>
	<header>
		<h1>A Warframe Mastery Checklist / Planner</h1>
	</header>
	<Tabs autoWidth class="fl-center">
		<Tab label="Overview" />
		<Tab label="Equipment" />
		<Tab label="Other Mastery" />
		<svelte:fragment slot="content">
			<TabContent>
				<h3>Point Totals</h3>
				<p><strong>Acquired Mastery:</strong> {mastery.toLocaleString()}</p>
				<p><strong>Owned Potential Mastery:</strong> {ownedPotentialMastery.toLocaleString()}</p>
				<p><strong>Total Potential Mastery:</strong> {totalPotentialMastery.toLocaleString()}</p>
				<h3>Mastery Table</h3>
				<Tag type="green">Achieved</Tag>
				<Tag type="blue">Requires leveling existing gear</Tag>
				<Tag type="cool-gray">Requires more gear</Tag>
				<Tag type="red">Currently unattainable</Tag>
				<OrderedList>
					{#each masteryRequirements as requirement, i}
						<ListItem>
							<Tag type={requirementTagType(requirement)}>{requirement.toLocaleString()}</Tag>
							{masteryRankTitles[i]}
						</ListItem>
					{/each}
				</OrderedList>
			</TabContent>
			<TabContent>
				<search-area>
					<h3>{shownItems.length} / {items.length}</h3>
					<search>
						<TextInput placeholder="Search..." bind:value={search} />
					</search>
				</search-area>
				<filter-boxes>
					<filter-box>
						<Toggle
							bind:toggled={unowned}
							labelA={`Unowned (${
								categoryShownItems.filter((item) => !itemData[item.uniqueName].owned).length
							})`}
							labelB={`Unowned (${
								categoryShownItems.filter((item) => !itemData[item.uniqueName].owned).length
							})`}
						/>
					</filter-box>
					<filter-box>
						<Toggle
							bind:toggled={unmastered}
							labelA={`Unmaxed (${
								categoryShownItems.filter(
									(item) => itemData[item.uniqueName].rank < (item.maxLevelCap ?? 30)
								).length
							})`}
							labelB={`Unmaxed (${
								categoryShownItems.filter(
									(item) => itemData[item.uniqueName].rank < (item.maxLevelCap ?? 30)
								).length
							})`}
						/>
					</filter-box>
					{#each categories as category}
						<filter-box
							><Checkbox
								bind:checked={checked[category]}
								labelText={`${category} (${
									shownItems.filter((item) => item.category === category).length
								})`}
							/>
						</filter-box>
					{/each}
				</filter-boxes>
				<items-container>
					{#each categoryShownItems as item}
						<div class="item">
							<Tile>
								<div class="item-in">
									<img src={imageUrl(item)} alt={`${item.name} image`} loading="lazy" />
									<h4 class="item-name" title={item.name}>
										{#if itemData[item.uniqueName].rank === (item.maxLevelCap ?? 30)}
											<Tag size="sm" type={masteryMultiplier(item) > 100 ? 'green' : 'teal'}
												>Maxed</Tag
											>
										{:else if itemData[item.uniqueName].owned}
											<Tag size="sm" type="purple">Owned</Tag>
										{/if}
										{item.name}
									</h4>
									<NumberInput
										bind:value={itemData[item.uniqueName].rank}
										label="Rank"
										on:change={saveItemData}
										min={0}
										max={item.maxLevelCap ?? 30}
										disabled={!itemData[item.uniqueName].owned}
										invalidText={`Number must be between 0 and ${item.maxLevelCap ?? 30}`}
									/>
									<owned-toggle>
										<Toggle
											bind:toggled={itemData[item.uniqueName].owned}
											on:toggle={saveItemData}
											labelA="Unowned"
											labelB="Owned"
										/>
									</owned-toggle>
								</div>
							</Tile>
						</div>
					{/each}
				</items-container>
			</TabContent>
			<TabContent>
				<h3>Star Chart XP</h3>
				<p>You can find these in your profile while in your orbiter.</p>
				<NumberInput
					bind:value={otherData.starChartXP}
					label="Star Chart XP"
					on:change={saveOtherData}
					min={0}
					max={starChartXPMax}
				/>
				<NumberInput
					bind:value={otherData.steelPathXP}
					label="Steel Path XP"
					on:change={saveOtherData}
					min={0}
					max={steelPathXPMax}
				/>
				<h3>Empyrean</h3>
				<h4>Plexus</h4>
				<NumberInput
					bind:value={otherData.plexusRank}
					label="Rank"
					on:change={saveOtherData}
					min={0}
					max={30}
				/>
				<h4>Intrinsics</h4>
				{#each intrinsics as intrinsic}
					<NumberInput
						bind:value={otherData.intrinsics[intrinsic]}
						label={intrinsic}
						on:change={saveOtherData}
						min={0}
						max={10}
					/>
				{/each}
			</TabContent>
		</svelte:fragment>
	</Tabs>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 95%;
		margin: 0 auto;
		height: 100%;
		min-width: 35em;
	}
	header {
		width: 100%;
		display: flex;
		justify-content: center;
	}
	header h1 {
		white-space: nowrap;
	}
	@media only screen and (max-width: 60em) {
		header h1 {
			font-size-adjust: 0.3;
		}
	}
	filter-boxes {
		padding: 0.5em;
		width: 100%;
		display: flex;
		flex-direction: row;
		flex-grow: 5;
		flex-wrap: wrap;
		align-items: center;
		min-width: 15em;
	}
	filter-box {
		padding: 1em;
		min-width: 12em;
		height: 4em;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
	items-container {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		width: 100%;
	}
	.item {
		margin: 1em;
	}
	.item-in {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		width: 15em;
		height: 20em;
	}
	.item-in > img {
		height: 10em;
	}
	.item-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}
	owned-toggle {
		width: 7.5em;
	}
	search-area {
		display: flex;
		flex-direction: row;
	}
	search {
		padding: 0 1.5em;
		flex-grow: 5;
	}
	:global(.fl-center) {
		display: flex;
		justify-content: center;
	}
	:global(.fl-center > *) {
		flex-grow: 5;
	}
</style>
