import BalanceModel from '../model/BalanceModel';

export default class BalanceController {
        getTotalWin(): number {
            return this.model.totalWin;
        }
    private model: BalanceModel;

    constructor(model: BalanceModel) {
        this.model = model;
    }

    getBalance(): number {
        return this.model.balance;
    }

    getBet(): number {
        return this.model.bet;
    }

    setBet(amount: number) {
        const minBet = 10;
        const maxBet = 10000;
        this.model.bet = Math.max(minBet, Math.min(maxBet, amount));
    }

    canSpin(): boolean {
        return this.model.canSpin();
    }

    deductBet(): void {
        if (this.canSpin()) {
            this.model.placeBet();
        }
    }

    addWin(amount: number): void {
        this.model.addWin(amount);
    }
}
