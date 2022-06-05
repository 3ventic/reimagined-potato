import type { Category } from 'warframe-items';

type RankData = {
	rank: number;
	category: Category;
	owned: boolean;
};

type Intrinsic = 'Tactical' | 'Piloting' | 'Gunnery' | 'Engineering' | 'Command';

type OtherData = {
	intrinsics: Record<Intrinsic, number>;
	starChartXP: number;
	steelPathXP: number;
	plexusRank: number;
};
