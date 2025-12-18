import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, REELS, ROWS } from '../config/gameConfig';
import { SYMBOLS } from '../config/symbols';

export class ReelsFrameView {
	private isSpinning: boolean = false;
	/**
	 * Redraws the mask using the current maskX, maskY, maskWidth, and maskHeight values.
	 * Call this after changing any mask property to update the mask.
	 */
	public updateMask() {
		if (!this.symbolsMask) return;
		this.symbolsMask.clear();
		this.symbolsMask.fillStyle(0xffffff, 0); // alpha=0 for invisible mask
		const maskX = this.maskX !== null ? this.maskX : this.frameX;
		const maskY = this.maskY !== null ? this.maskY : this.frameY;
		const maskWidth =
			this.maskWidth !== null ? this.maskWidth : this.frameWidth;
		const maskHeight =
			this.maskHeight !== null ? this.maskHeight : this.frameHeight;
		this.symbolsMask.fillRect(maskX, maskY, maskWidth, maskHeight);
	}
	// Public mask adjustment properties
	public maskX: number | null = null;
	public maskY: number | null = null;
	public maskWidth: number | null = null;
	public maskHeight: number | null = null;
	private frameImage!: Phaser.GameObjects.Image;
	private scene: Phaser.Scene;
	private symbolsMask?: Phaser.GameObjects.Graphics;
	private symbolsContainer?: Phaser.GameObjects.Container;
	// 3 visible + 2 extra symbols per reel for smooth rolling
	private symbolImages: Phaser.GameObjects.Image[][] = [];
	// === Slot Animation Configuration ===
	/**
	 * Number of symbol cycles before the first column stops.
	 * Increase for longer spins, decrease for shorter spins.
	 */
	public spinCycles: number = 20;
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

	private frameX!: number;
	private frameY!: number;
	private frameWidth: number = 720;
	private frameHeight: number = 430;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.initFrame();
		this.initSymbols();
		this.initMask();
	}

	private initFrame() {
		const frameOffsetX = 0, frameOffsetY = -20;
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
			y: this.frameY + (this.frameHeight - gridH) / 2 + this.symbolH / 2
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
				this.symbolImages[col][row + 1] = symbolImg;
				this.symbolsContainer.add(symbolImg);
			}
		}
	}

	private initMask() {
		this.symbolsMask = this.scene.add.graphics();
		const maskX = this.maskX ?? this.frameX;
		const maskY = this.maskY ?? this.frameY;
		const maskWidth = this.maskWidth ?? this.frameWidth;
		const maskHeight = this.maskHeight ?? this.frameHeight;
		this.symbolsMask.fillStyle(0xffffff, 0);
		this.symbolsMask.fillRect(maskX, maskY, maskWidth, maskHeight);
		this.symbolsMask.setVisible(false);
		if (this.symbolsContainer && this.symbolsMask) {
			this.symbolsContainer.setMask(this.symbolsMask.createGeometryMask());
		}
	}



	// Update the grid with a new 2D array of symbol ids (for spins)
	public updateSymbols(newGrid: string[][]) {
		if (this.isSpinning) return;
		const { x: gridStartX, y: gridStartY } = this.getGridStart();
		for (let col = 0; col < REELS; col++) {
			for (let row = 0; row < ROWS; row++) {
				const symbolId = newGrid[col][row];
				const img = this.symbolImages[col][row + 1];
				img.setTexture(symbolId);
				img.x = gridStartX + col * (this.symbolW + this.symbolSpacingX);
				img.y = gridStartY + row * (this.symbolH + this.symbolSpacingY);
				img.setVisible(true);
			}
			this.updateExtraSymbols(col, gridStartY);
		}
	}

	private updateExtraSymbols(col: number, gridStartY: number) {
		const topExtra = this.symbolImages[col][0];
		const bottomExtra = this.symbolImages[col][ROWS + 1];
		topExtra.y = gridStartY - (this.symbolH + this.symbolSpacingY);
		bottomExtra.y = gridStartY + ROWS * (this.symbolH + this.symbolSpacingY);
		topExtra.setVisible(false);
		bottomExtra.setVisible(false);
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
				for (let row = 0; row < ROWS + 2; row++) {
					const img = this.symbolImages[col][row];
					this.scene.tweens.add({
						targets: img,
						y: img.y + this.symbolH + this.symbolSpacingY,
						duration: this.spinSymbolSpeed,
						ease: 'Cubic.easeInOut',
						onUpdate: () => this.updateColumnVisibility(col, gridStartY),
						onComplete: () => {
							if (img.y > gridStartY + ROWS * (this.symbolH + this.symbolSpacingY)) {
								img.y = gridStartY - (this.symbolH + this.symbolSpacingY);
								img.setTexture(Phaser.Utils.Array.GetRandom(symbolKeys));
							}
							this.updateColumnVisibility(col, gridStartY);
							if (row === ROWS + 1) {
								cycles++;
								if (cycles < totalCycles) {
									spinOneCycle();
								} else {
									// Snap to result immediately after this column finishes its cycles
									this.snapColumnToResult(col, resultGrid, gridStartX, gridStartY);
									columnsStopped++;
									if (columnsStopped === REELS) {
										this.isSpinning = false;
										console.log('[ReelsFrameView] Spin complete. Symbols locked.');
										onComplete?.();
									}
								}
							}
						}
					});
				}
			};
			spinOneCycle();
		}
	}

	private snapColumnToResult(col: number, resultGrid: string[][], gridStartX: number, gridStartY: number) {
		for (let row = 0; row < ROWS; row++) {
			const img = this.symbolImages[col][row + 1];
			img.setTexture(resultGrid[col][row]);
			img.x = gridStartX + col * (this.symbolW + this.symbolSpacingX);
			img.y = gridStartY + row * (this.symbolH + this.symbolSpacingY);
			img.setVisible(true);
		}
		this.updateExtraSymbols(col, gridStartY);
	}

	private updateColumnVisibility(col: number, gridStartY: number) {
		for (let row = 0; row < ROWS + 2; row++) {
			const img = this.symbolImages[col][row];
			const isVisible =
				img.y >= gridStartY &&
				img.y < gridStartY + ROWS * (this.symbolH + this.symbolSpacingY);
			img.setVisible(isVisible);
		}
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
