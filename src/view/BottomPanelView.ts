import * as Phaser from 'phaser';

export class BottomPanelView {
	public updateBalanceDisplay() {
		if (this.balanceText) {
			this.balanceText.setText(
				`$ ${this.balanceController
					.getBalance()
					.toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`
			);
		}
	}
	public balanceController: import('../controller/BalanceController').default;
	private balanceText!: Phaser.GameObjects.Text;
	private scene: Phaser.Scene;
	private panelGroup: Phaser.GameObjects.Group;
	private betText!: Phaser.GameObjects.Text;
	constructor(
		scene: Phaser.Scene,
		balanceController: import('../controller/BalanceController').default
	) {
		this.scene = scene;
		this.balanceController = balanceController;
		this.panelGroup = this.scene.add.group();
		this.createPanel();
	}

	private drawPlusMinusButton(
		x: number,
		y: number,
		type: 'plus' | 'minus',
		depth: number = 202
	): Phaser.GameObjects.Graphics {
		const g = this.scene.add.graphics();
		const radius = 10;
		g.fillStyle(0x000000, 0.32);
		g.fillCircle(x, y, radius);
		// No border for the background circle
		g.lineStyle(2, 0xffffff, 1);
		g.beginPath();
		if (type === 'minus' || type === 'plus') {
			g.moveTo(x - 5, y);
			g.lineTo(x + 5, y);
		}
		if (type === 'plus') {
			g.moveTo(x, y - 5);
			g.lineTo(x, y + 5);
		}
		g.strokePath();
		g.setDepth(depth);
		this.panelGroup.add(g);

		// Make interactive with hover effect
		g.setInteractive(
			new Phaser.Geom.Circle(x, y, radius),
			Phaser.Geom.Circle.Contains
		);
		g.on('pointerover', () => {
			g.clear();
			g.fillStyle(0x7fffd4, 0.5); // Highlight color
			g.fillCircle(x, y, radius);
			g.lineStyle(2, 0xffffff, 1);
			g.beginPath();
			if (type === 'minus' || type === 'plus') {
				g.moveTo(x - 5, y);
				g.lineTo(x + 5, y);
			}
			if (type === 'plus') {
				g.moveTo(x, y - 5);
				g.lineTo(x, y + 5);
			}
			g.strokePath();
		});
		g.on('pointerout', () => {
			g.clear();
			g.fillStyle(0x000000, 0.32);
			g.fillCircle(x, y, radius);
			g.lineStyle(2, 0xffffff, 1);
			g.beginPath();
			if (type === 'minus' || type === 'plus') {
				g.moveTo(x - 5, y);
				g.lineTo(x + 5, y);
			}
			if (type === 'plus') {
				g.moveTo(x, y - 5);
				g.lineTo(x, y + 5);
			}
			g.strokePath();
		});
		return g;
	}

	private createPanel() {
		const GAME_WIDTH = this.scene.sys.game.config.width as number;
		const GAME_HEIGHT = this.scene.sys.game.config.height as number;
		const panelWidth = 700;
		const panelHeight = 80;
		const panelX = GAME_WIDTH / 2 - panelWidth / 2;
		const panelY = GAME_HEIGHT - panelHeight - 80;
		const sectionCount = 4;
		const sectionWidth = panelWidth / sectionCount;
		const boxTop = panelY + 6;
		const boxHeight = panelHeight - 12;

		// Draw a rounded rectangle box for each section
		for (let i = 0; i < sectionCount; i++) {
			const box = this.scene.add.graphics();
			box.fillStyle(0x000000, 0.15);
			box.fillRoundedRect(
				panelX + sectionWidth * i + 6,
				panelY + 6,
				sectionWidth - 12,
				panelHeight - 12,
				12
			);
			box.setDepth(199);
			this.panelGroup.add(box);
		}

		// --- Section 1: Balance ---
		const balanceBoxCenter = panelX + sectionWidth * 0 + sectionWidth / 2;
		const labelY = boxTop + boxHeight / 2 - 18;
		const valueY = boxTop + boxHeight / 2 + 2;
		this.panelGroup.add(
			this.scene.add
				.text(balanceBoxCenter, labelY, 'BALANCE', {
					fontFamily: 'Arial',
					fontSize: '15px',
					color: '#7fffd4',
					fontStyle: 'bold',
				})
				.setOrigin(0.5, 0)
				.setDepth(201)
		);
		this.balanceText = this.scene.add
			.text(
				balanceBoxCenter,
				valueY,
				`$ ${this.balanceController
					.getBalance()
					.toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`,
				{
					fontFamily: 'Arial',
					fontSize: '22px',
					color: '#fff',
					fontStyle: 'bold',
				}
			)
			.setOrigin(0.5, 0)
			.setDepth(201)
			.setFontStyle('bold');
		this.panelGroup.add(this.balanceText);

		// --- Section 2: Total Win ---

		const winBoxCenter = panelX + sectionWidth * 1 + sectionWidth / 2;
		this.panelGroup.add(
			this.scene.add
				.text(winBoxCenter, labelY, 'TOTAL WIN', {
					fontFamily: 'Arial',
					fontSize: '15px',
					color: '#7fffd4',
					fontStyle: 'bold',
				})
				.setOrigin(0.5, 0)
				.setDepth(201)
		);
		this.winText = this.scene.add
			.text(
				winBoxCenter,
				valueY,
				`$ ${this.balanceController
					.getTotalWin()
					.toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`,
				{
					fontFamily: 'Arial',
					fontSize: '22px',
					color: '#fff',
					fontStyle: 'bold',
				}
			)
			.setOrigin(0.5, 0)
			.setDepth(201)
			.setFontStyle('bold');
		this.panelGroup.add(this.winText);

		// --- Section 3: Bet (with - and + buttons) ---
		const betBoxCenter = panelX + sectionWidth * 2 + sectionWidth / 2;
		this.panelGroup.add(
			this.scene.add
				.text(betBoxCenter, labelY, 'BET', {
					fontFamily: 'Arial',
					fontSize: '15px',
					color: '#7fffd4',
					fontStyle: 'bold',
				})
				.setOrigin(0.5, 0)
				.setDepth(201)
		);
		const minusBtn = this.drawPlusMinusButton(
			betBoxCenter - 38,
			valueY + 12,
			'minus'
		);
		this.betText = this.scene.add
			.text(betBoxCenter, valueY, this.balanceController.getBet().toString(), {
				fontFamily: 'Arial',
				fontSize: '22px',
				color: '#fff',
				fontStyle: 'bold',
			})
			.setOrigin(0.5, 0)
			.setDepth(201)
			.setFontStyle('bold');
		this.panelGroup.add(this.betText);
		const plusBtn = this.drawPlusMinusButton(
			betBoxCenter + 38,
			valueY + 12,
			'plus'
		);

		// Make buttons interactive
		minusBtn.on('pointerdown', () => {
			this.changeBet(-10);
		});
		plusBtn.on('pointerdown', () => {
			this.changeBet(10);
		});

		// --- Section 4: Line (with - and + buttons) ---
		const lineBoxCenter = panelX + sectionWidth * 3 + sectionWidth / 2;
		this.panelGroup.add(
			this.scene.add
				.text(lineBoxCenter, labelY, 'LINE', {
					fontFamily: 'Arial',
					fontSize: '15px',
					color: '#7fffd4',
					fontStyle: 'bold',
				})
				.setOrigin(0.5, 0)
				.setDepth(201)
		);
		this.drawPlusMinusButton(lineBoxCenter - 38, valueY + 12, 'minus');
		this.panelGroup.add(
			this.scene.add
				.text(lineBoxCenter, valueY, '1', {
					fontFamily: 'Arial',
					fontSize: '22px',
					color: '#fff',
					fontStyle: 'bold',
				})
				.setOrigin(0.5, 0)
				.setDepth(201)
		);
		this.drawPlusMinusButton(lineBoxCenter + 38, valueY + 12, 'plus');
	}

	private winText!: Phaser.GameObjects.Text;

	public updateWinDisplay() {
		if (this.winText) {
			this.winText.setText(
				`$ ${this.balanceController
					.getTotalWin()
					.toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`
			);
		}
	}

	public setVisible(visible: boolean) {
		this.panelGroup.setVisible(visible);
	}

	public getBetValue(): number {
		return this.balanceController.getBet();
	}

	public deductBalance(amount: number) {
		for (let i = 0; i < amount / this.balanceController.getBet(); i++) {
			this.balanceController.deductBet();
		}
		if (this.balanceText) {
			this.balanceText.setText(
				`$ ${this.balanceController
					.getBalance()
					.toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`
			);
		}
	}

	public changeBet(delta: number) {
		const newBet = this.balanceController.getBet() + delta;
		this.balanceController.setBet(newBet);
		if (this.betText) {
			this.betText.setText(this.balanceController.getBet().toString());
		}
	}
}

export default BottomPanelView;
