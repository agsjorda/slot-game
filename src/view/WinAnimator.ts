import * as Phaser from 'phaser';
import { WinResult } from '../model/SlotModel';
import { ReelsFrameView } from '../view/ReelsFrame';

export class WinAnimator {
	private scene: Phaser.Scene;
	private reelsFrameView: ReelsFrameView;
	private isAnimating: boolean = false;

	constructor(scene: Phaser.Scene, reelsFrameView: ReelsFrameView) {
		this.scene = scene;
		this.reelsFrameView = reelsFrameView;
	}

	async presentWins(wins: WinResult[], totalWin: number): Promise<void> {
		if (this.isAnimating || wins.length === 0) return;

		this.isAnimating = true;

		try {
			// 1. Brief pause after reels stop
			await this.delay(500);

			// 2. Highlight all wins sequentially
			for (let i = 0; i < wins.length; i++) {
				const win = wins[i];
				this.highlightWinSymbols(win, i);
				await this.delay(1500);
				this.clearHighlight(win);
			}

			// 3. Show total win popup
			if (totalWin > 0) {
				this.showTotalWinPopup(totalWin);
				await this.delay(2000);
			}
		} finally {
			this.isAnimating = false;
		}
	}

	private highlightWinSymbols(win: WinResult, _winIndex: number): void {
		win.positions.forEach((pos: { col: number; row: number }) => {
			const symbol = this.reelsFrameView.getSymbolImage?.(pos.col, pos.row);
			if (symbol) {
				this.scene.tweens.killTweensOf(symbol);

				// Simple flash effect WITHOUT scaling
				this.scene.tweens.add({
					targets: symbol,
					alpha: { from: 1, to: 0.5 },
					duration: 100,
					yoyo: true,
					repeat: 3,
					ease: 'Linear',
					onRepeat: () => {
						// Alternate tint color on each repeat
						symbol.tint = symbol.tint === 0xffff00 ? 0xffffff : 0xffff00;
					},
					onComplete: () => {
						symbol.clearTint();
						symbol.alpha = 1;
					},
				});
			}
		});
	}

	private clearHighlight(win: WinResult): void {
		win.positions.forEach((pos: { col: number; row: number }) => {
			const symbol = this.reelsFrameView.getSymbolImage?.(pos.col, pos.row);
			if (symbol) {
				this.scene.tweens.killTweensOf(symbol);
				symbol.clearTint();
				symbol.alpha = 1;
			}
		});
	}

	private showTotalWinPopup(totalWin: number): void {
		const centerX = this.scene.cameras.main.centerX;
		const centerY = this.scene.cameras.main.centerY;

		const container = this.scene.add.container(centerX, centerY);

		// Background
		const bg = this.scene.add
			.rectangle(0, 0, 350, 120, 0x000000, 0.9)
			.setStrokeStyle(3, 0xffd700);

		// Text
		const text = this.scene.add
			.text(0, 0, `WIN: $${totalWin}`, {
				fontSize: '36px',
				color: '#ffd700',
				fontStyle: 'bold',
			})
			.setOrigin(0.5);

		container.add([bg, text]);
		container.setScale(0);

		// Animate in
		this.scene.tweens.add({
			targets: container,
			scale: 1,
			duration: 400,
			ease: 'Back.easeOut',
			onComplete: () => {
				// Animate out after delay
				this.scene.time.delayedCall(1500, () => {
					this.scene.tweens.add({
						targets: container,
						scale: 0,
						alpha: 0,
						duration: 300,
						onComplete: () => container.destroy(),
					});
				});
			},
		});

		// Play win sound
		// this.scene.sound.play('big_win', { volume: 0.7 });
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => this.scene.time.delayedCall(ms, resolve));
	}

	public isAnimatingWins(): boolean {
		return this.isAnimating;
	}
}
