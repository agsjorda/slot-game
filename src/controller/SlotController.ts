import SlotModel from '@model/SlotModel';
import BalanceModel from '@model/BalanceModel';

export default class SlotController {
	constructor(
		private slotModel: SlotModel,
		private balanceModel: BalanceModel
	) {}

	spin() {
		if (!this.balanceModel.canSpin()) return null;

		this.balanceModel.placeBet();
		const grid = this.slotModel.spin();
		const win = this.slotModel.evaluate(grid, this.balanceModel.bet);
		this.balanceModel.addWin(win);

		return {
			grid,
			win,
			balance: this.balanceModel.balance,
		};
	}
}
