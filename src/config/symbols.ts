export interface SymbolConfig {
	id: string;
	payouts: Record<number, number>;
}

export const SYMBOLS: SymbolConfig[] = [
	{ id: 'W', payouts: { 3: 10, 4: 50, 5: 200 } },
	{ id: 'B', payouts: { 3: 5, 4: 25, 5: 100 } },
	{ id: 'STAR', payouts: { 3: 20, 4: 100, 5: 500 } },
];
