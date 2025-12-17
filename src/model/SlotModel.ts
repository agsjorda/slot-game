import ReelModel from './ReelModel';
import { SYMBOLS } from '../config/symbols';
import { PAYLINES } from '../config/paylines';

export default class SlotModel {
	private reels: ReelModel[];

	constructor() {
		const ids = SYMBOLS.map((s) => s.id);
		this.reels = Array.from({ length: 5 }, () => new ReelModel(ids));
	}

	spin(): string[][] {
		return this.reels.map((reel) => reel.spin(3));
	}

	evaluate(grid: string[][], bet: number): number {
		let win = 0;

		PAYLINES.forEach((line) => {
			const first = grid[0][line[0]];
			let count = 1;

			for (let i = 1; i < 5; i++) {
				if (grid[i][line[i]] === first) count++;
				else break;
			}

			const symbol = SYMBOLS.find((s) => s.id === first);
			if (symbol?.payouts[count]) win += symbol.payouts[count] * bet;
		});

		return win;
	}
}
