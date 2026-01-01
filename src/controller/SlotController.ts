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
}
