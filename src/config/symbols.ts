export interface SymbolConfig {
	id: string;
	payouts: Record<number, number>;
	image: string;
}

export const SYMBOLS: SymbolConfig[] = [
	{ id: 'W', payouts: { 3: 10, 4: 50, 5: 200 }, image: 'assets/Symbols/Symbol_7.png' },
	{ id: 'FACE', payouts: { 3: 50, 4: 200, 5: 1000 }, image: 'assets/Symbols/Symbol_0.png' },
	{ id: 'STAR', payouts: { 3: 20, 4: 100, 5: 500 }, image: 'assets/Symbols/Symbol_2.png' },
	{ id: 'GREENS', payouts: { 3: 20, 4: 100, 5: 500 }, image: 'assets/Symbols/Symbol_1.png' },
	{ id: 'CIRCLEP', payouts: { 3: 20, 4: 100, 5: 500 }, image: 'assets/Symbols/Symbol_3.png' },
	{ id: 'DROP', payouts: { 3: 20, 4: 100, 5: 500 }, image: 'assets/Symbols/Symbol_10.png' },
	{ id: 'HEART', payouts: { 3: 20, 4: 100, 5: 500 }, image: 'assets/Symbols/Symbol_5.png' },
	{ id: 'COOKIE', payouts: { 3: 20, 4: 100, 5: 500 }, image: 'assets/Symbols/Symbol_8.png' },
	{ id: 'TRIANGLE', payouts: { 3: 20, 4: 100, 5: 500 }, image: 'assets/Symbols/Symbol_9.png' },
];
