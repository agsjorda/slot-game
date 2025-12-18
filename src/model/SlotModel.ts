import ReelModel from './ReelModel';
import { SYMBOLS } from '../config/symbols';
import { PAYLINES } from '../config/paylines';

export interface WinResult {
	paylineIndex: number; // Which payline (0-19)
	paylinePattern: number[]; // The row pattern [0,0,0,0,0]
	symbol: string; // Winning symbol id ('cherry', 'seven', etc.)
	matchingCount: number; // How many consecutive matches (3, 4, or 5)
	payout: number; // Multiplier from symbol config (e.g., 5 for 3 cherries)
	winAmount: number; // payout * bet
	positions: { col: number; row: number }[]; // Positions of winning symbols
}

export default class SlotModel {
	private reels: ReelModel[];

	constructor() {
		const ids = SYMBOLS.map((s) => s.id);
		this.reels = Array.from({ length: 5 }, () => new ReelModel(ids));
	}

	spin(): string[][] {
		return this.reels.map((reel) => reel.spin(3));
	}

	evaluate(
		grid: string[][],
		bet: number
	): {
		totalWin: number;
		wins: WinResult[];
	} {
		const wins: WinResult[] = [];

		PAYLINES.forEach((paylinePattern, paylineIndex) => {
			const firstSymbol = grid[0][paylinePattern[0]];
			let matchingCount = 1;
			const positions = [{ col: 0, row: paylinePattern[0] }];

			// Count consecutive matches from left
			for (let col = 1; col < 5; col++) {
				const currentSymbol = grid[col][paylinePattern[col]];

				if (currentSymbol === firstSymbol) {
					matchingCount++;
					positions.push({ col, row: paylinePattern[col] });
				} else {
					break;
				}
			}

			// Only count as win if at least 3 matching symbols
			if (matchingCount >= 3) {
				const symbol = SYMBOLS.find((s) => s.id === firstSymbol);
				const payoutMultiplier = symbol?.payouts[matchingCount] || 0;
				const winAmount = payoutMultiplier * bet;

				wins.push({
					paylineIndex,
					paylinePattern: [...paylinePattern],
					symbol: firstSymbol,
					matchingCount,
					payout: payoutMultiplier,
					winAmount,
					positions,
				});
			}
		});

		const totalWin = wins.reduce((sum, win) => sum + win.winAmount, 0);

		return {
			totalWin,
			wins,
		};
	}
}