export default class BalanceModel {
	balance = 200_000;
	bet = 240;

	canSpin(): boolean {
		return this.balance >= this.bet;
	}

	placeBet(): void {
		this.balance -= this.bet;
	}

	addWin(amount: number): void {
		this.balance += amount;
	}
}
