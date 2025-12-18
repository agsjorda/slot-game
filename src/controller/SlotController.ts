// SlotController.ts
import SlotModel, { WinResult } from '@model/SlotModel';
import BalanceModel from '@model/BalanceModel';

export interface SpinResult {
	grid: string[][];
	wins: WinResult[];
	totalWin: number;
	balance: number;
}

export default class SlotController {
	constructor(
		private slotModel: SlotModel,
		private balanceModel: BalanceModel
	) {}

	spin(): SpinResult | null {
		if (!this.balanceModel.canSpin()) return null;

		// 1. Deduct bet
		this.balanceModel.placeBet();

		// 2. Generate spin result
		const grid = this.slotModel.spin();

		// 3. Evaluate wins (using the enhanced evaluate method)
		const bet = this.balanceModel.bet;
		const evaluation = this.slotModel.evaluate(grid, bet);

		// 4. Update balance with winnings
		this.balanceModel.addWin(evaluation.totalWin);

		// 5. Return complete result for View to process
		return {
			grid,
			wins: evaluation.wins,
			totalWin: evaluation.totalWin,
			balance: this.balanceModel.balance,
		};
	}

	// Optional: If you want the controller to handle presentation flow
	async spinWithPresentation(
		onStep?: (step: string, data?: any) => void
	): Promise<SpinResult | null> {
		if (!this.balanceModel.canSpin()) return null;

		// Notify UI: spin starting
		onStep?.('spin_start');

		// 1. Deduct bet
		this.balanceModel.placeBet();
		onStep?.('bet_placed', { bet: this.balanceModel.bet });

		// 2. Generate spin result
		const grid = this.slotModel.spin();
		onStep?.('grid_generated', { grid });

		// 3. Evaluate wins
		const bet = this.balanceModel.bet;
		const evaluation = this.slotModel.evaluate(grid, bet);
		onStep?.('wins_evaluated', { wins: evaluation.wins });

		// 4. Update balance
		this.balanceModel.addWin(evaluation.totalWin);
		onStep?.('balance_updated', {
			win: evaluation.totalWin,
			balance: this.balanceModel.balance,
		});

		return {
			grid,
			wins: evaluation.wins,
			totalWin: evaluation.totalWin,
			balance: this.balanceModel.balance,
		};
	}
}
