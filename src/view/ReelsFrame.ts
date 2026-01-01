// ...existing code...
import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, REELS, ROWS } from '../config/gameConfig';
import { SYMBOLS } from '../config/symbols';

export class ReelsFrameView {
	private isSpinning: boolean = false;
	// Masking removed: not needed when using visibility logic
	private frameImage!: Phaser.GameObjects.Image;
	private scene: Phaser.Scene;
// Masking removed
	private symbolsContainer?: Phaser.GameObjects.Container;
	// 3 visible + 2 extra symbols per reel for smooth rolling
	private symbolImages: Phaser.GameObjects.Image[][] = [];
	// === Slot Animation Configuration ===
	/**
	 * Number of symbol cycles before the first column stops.
	 * Increase for longer spins, decrease for shorter spins.
	 */
	public spinCycles: number = 15;
	/**
	 * Delay in ms between each column stopping (staggered stop effect).
	 * Increase for a slower cascade, decrease for a faster stop.
	 */
	public spinStopDelay: number = 500;
	/**
	 * Speed in ms for each symbol move (affects spin smoothness).
	 */
	public spinSymbolSpeed: number = 100;
	// === Symbol Layout ===
	public symbolW: number = 110;
	public symbolH: number = 110;
	public symbolSpacingX: number = 20;
	public symbolSpacingY: number = 14;

	private frameX: number;
	private frameY: number;
	private frameWidth: number;
	private frameHeight: number;

	// Inline visibility check - much faster than getBounds()
	private isVisible(y: number): boolean {
		const halfHeight = this.symbolH / 2;
		// Symbol is visible only if fully inside the frame
		return (y - halfHeight >= this.frameY && y + halfHeight <= this.frameY + this.frameHeight);
	}

	constructor(
		scene: Phaser.Scene,
		frameX?: number,
		frameY?: number,
		frameWidth?: number,
		frameHeight?: number
	) {
		this.scene = scene;
		this.frameWidth = frameWidth ?? 720;
		this.frameHeight = frameHeight ?? 430;
		this.frameX = frameX ?? (GAME_WIDTH - this.frameWidth) / 2;
		this.frameY = frameY ?? (GAME_HEIGHT - this.frameHeight) / 2;
		this.initFrame();
		this.initSymbols();
		// Ensure no leftover graphics for masking are created or left visible
	}
	

	// ...existing code...

	private initFrame() {
		const frameOffsetX = 0,
			frameOffsetY = -20;
		this.frameX = (GAME_WIDTH - this.frameWidth) / 2 + frameOffsetX;
		this.frameY = (GAME_HEIGHT - this.frameHeight) / 2 + frameOffsetY;
		this.frameImage = this.scene.add.image(
			this.frameX + this.frameWidth / 2,
			this.frameY + this.frameHeight / 2,
			'slot_frame'
		);
		this.frameImage.setDisplaySize(this.frameWidth, this.frameHeight);
		this.frameImage.setDepth(10);
	}

	private getGridStart() {
		const gridW = REELS * this.symbolW + (REELS - 1) * this.symbolSpacingX;
		const gridH = ROWS * this.symbolH + (ROWS - 1) * this.symbolSpacingY;
		return {
			x: this.frameX + (this.frameWidth - gridW) / 2 + this.symbolW / 2,
			y: this.frameY + (this.frameHeight - gridH) / 2 + this.symbolH / 2,
		};
	}

	private initSymbols() {
		const { x: gridStartX, y: gridStartY } = this.getGridStart();
		this.symbolsContainer = this.scene.add.container(0, 0);
		const symbolKeys = SYMBOLS.map((s) => s.id);
		for (let col = 0; col < REELS; col++) {
			this.symbolImages[col] = [];
			for (let row = -1; row <= ROWS; row++) {
				const x = gridStartX + col * (this.symbolW + this.symbolSpacingX);
				const y = gridStartY + row * (this.symbolH + this.symbolSpacingY);
				const symbolKey = Phaser.Utils.Array.GetRandom(symbolKeys);
				const symbolImg = this.scene.add
					.image(x, y, symbolKey)
					.setDisplaySize(this.symbolW, this.symbolH)
					.setDepth(30);
				// Hide symbols outside the frame
				symbolImg.setVisible(
					y >= this.frameY && y < this.frameY + this.frameHeight
				);
				this.symbolImages[col][row + 1] = symbolImg;
				this.symbolsContainer.add(symbolImg);
			}
		}
	}


	// Update the grid with a new 2D array of symbol ids (for spins)
	public updateSymbols(newGrid: string[][]) {
		if (this.isSpinning) return;
		const { x: gridStartX, y: gridStartY } = this.getGridStart();
		const visibleTop = this.frameY;
		const visibleBottom = this.frameY + this.frameHeight;
		for (let col = 0; col < REELS; col++) {
			for (let row = 0; row < ROWS; row++) {
				const symbolId = newGrid[col][row];
				const img = this.symbolImages[col][row + 1];
				img.setTexture(symbolId);
				img.x = gridStartX + col * (this.symbolW + this.symbolSpacingX);
				img.y = gridStartY + row * (this.symbolH + this.symbolSpacingY);
				img.setVisible(img.y >= visibleTop && img.y < visibleBottom);
			}
			this.updateExtraSymbols(col, gridStartY, visibleTop, visibleBottom);
		}
	}

	private updateExtraSymbols(col: number, gridStartY: number, visibleTop?: number, visibleBottom?: number) {
		// Always use frameY/frameHeight for visibility
		if (visibleTop === undefined || visibleBottom === undefined) {
			visibleTop = this.frameY;
			visibleBottom = this.frameY + this.frameHeight;
		}
		const topExtra = this.symbolImages[col][0];
		const bottomExtra = this.symbolImages[col][ROWS + 1];
		topExtra.y = gridStartY - (this.symbolH + this.symbolSpacingY);
		bottomExtra.y = gridStartY + ROWS * (this.symbolH + this.symbolSpacingY);
		topExtra.setVisible(topExtra.y >= visibleTop && topExtra.y < visibleBottom);
		bottomExtra.setVisible(bottomExtra.y >= visibleTop && bottomExtra.y < visibleBottom);
	}

	// Animate each column spinning vertically, then stop on the result
	public spinAnimation(resultGrid: string[][], onComplete?: () => void) {
		if (this.isSpinning) return;
		this.isSpinning = true;
		const { x: gridStartX, y: gridStartY } = this.getGridStart();
		const symbolKeys = SYMBOLS.map((s) => s.id);
		let columnsStopped = 0;
		// Adjustable delay (ms) between each column stopping
		const stopDelayPerColumn = this.spinStopDelay;

		for (let col = 0; col < REELS; col++) {
			let cycles = 0;
			// Each column spins for a base number of cycles, plus extra cycles for the staggered stop effect
			const minSpinTime = this.spinCycles * this.spinSymbolSpeed;
			const requiredSpinTime = minSpinTime + col * stopDelayPerColumn;
			const totalCycles = Math.ceil(requiredSpinTime / this.spinSymbolSpeed);

			const spinOneCycle = () => {
				let completedInCycle = 0;

				for (let row = 0; row < ROWS + 2; row++) {
					const img = this.symbolImages[col][row];
					const newY = img.y + this.symbolH + this.symbolSpacingY;

					this.scene.tweens.add({
						targets: img,
						y: newY,
						duration: this.spinSymbolSpeed,
						ease: 'Linear',
						onUpdate: () => {
							img.setVisible(this.isVisible(img.y));
						},
						onComplete: () => {
							if (img.y > gridStartY + ROWS * (this.symbolH + this.symbolSpacingY)) {
								img.y = gridStartY - (this.symbolH + this.symbolSpacingY);
								img.setTexture(Phaser.Utils.Array.GetRandom(symbolKeys));
							}
							img.setVisible(this.isVisible(img.y));

							completedInCycle++;
							if (completedInCycle === ROWS + 2) {
								cycles++;
								if (cycles < totalCycles) {
									completedInCycle = 0;
									spinOneCycle();
								} else {
									this.snapColumnToResult(
										col,
										resultGrid,
										gridStartX,
										gridStartY
									);
									columnsStopped++;
									if (columnsStopped === REELS) {
										this.isSpinning = false;
										console.log('[ReelsFrameView] Spin complete. Symbols locked.');
										onComplete?.();
									}
								}
							}
						},
					});
				}
			};
			spinOneCycle();
		}
	}

	private snapColumnToResult(
		col: number,
		resultGrid: string[][],
		gridStartX: number,
		gridStartY: number
	) {
		for (let row = 0; row < ROWS; row++) {
			const img = this.symbolImages[col][row + 1];
			img.setTexture(resultGrid[col][row]);
			img.x = gridStartX + col * (this.symbolW + this.symbolSpacingX);
			img.y = gridStartY + row * (this.symbolH + this.symbolSpacingY);
			// Hide symbols outside the frame after snap
			img.setVisible(img.y >= this.frameY && img.y < this.frameY + this.frameHeight);
		}
		this.updateExtraSymbols(col, gridStartY);
		// Play reel stop sound via SoundManager if available
		const gameScene = this.scene as any;
		if (gameScene.soundManager && typeof gameScene.soundManager.playReelStop === 'function') {
			gameScene.soundManager.playReelStop();
		}
	}

	public getSymbolImage(
		col: number,
		row: number
	): Phaser.GameObjects.Image | undefined {
		if (col < 0 || col >= this.symbolImages.length) return undefined;
		if (row < 0 || row >= this.symbolImages[col].length) return undefined;

		// Note: Your symbolImages uses row + 1 offset for extra symbols
		// For visible symbols (rows 0-2), you need row + 1
		// You might need to adjust this based on your implementation
		return this.symbolImages[col][row + 1];
	}

	public setVisible(visible: boolean) {
		this.frameImage.setVisible(visible);
		if (this.symbolsContainer) {
			this.symbolsContainer.setVisible(visible);
		} else {
			for (const col of this.symbolImages) {
				for (const img of col) {
					img.setVisible(visible);
				}
			}
		}
	}
}
