import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, REELS, ROWS } from '../config/gameConfig';
import { SYMBOLS } from '../config/symbols';

export class ReelsFrameView {
    private scene: Phaser.Scene;
    private frameImage: Phaser.GameObjects.Image;
    // Only 3 symbols per reel, always visible
    private symbolImages: Phaser.GameObjects.Image[][] = [];
    private frameX: number;
    private frameY: number;
    private frameWidth: number = 720;
    private frameHeight: number = 430;
    // private _spinDuration: number = 1500; // ms for each column
    // private _spinDelay: number = 300; // ms delay between columns (unused)
    // Allow external adjustment of spin duration/delay
    public setSpinDuration(_duration: number) {
        // No-op: parameter is unused, underscore to avoid TS warning
    }


    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        // Frame position
        const frameOffsetX = 0;
        const frameOffsetY = -20;
        this.frameX = (GAME_WIDTH - this.frameWidth) / 2 + frameOffsetX;
        this.frameY = (GAME_HEIGHT - this.frameHeight) / 2 + frameOffsetY;
        this.frameImage = this.scene.add.image(
            this.frameX + this.frameWidth / 2,
            this.frameY + this.frameHeight / 2,
            'slot_frame'
        );
        this.frameImage.setDisplaySize(this.frameWidth, this.frameHeight);
        this.frameImage.setDepth(10);
        this.createSymbols();
    }

    private createSymbols() {
        const reels = REELS;
        const rows = ROWS;
        const symbolKeys = SYMBOLS.map(s => s.id);
        const symbolW = 110;
        const symbolH = 110;
        const symbolSpacingX = 20;
        const symbolSpacingY = 14;
        const gridW = reels * symbolW + (reels - 1) * symbolSpacingX;
        const gridH = rows * symbolH + (rows - 1) * symbolSpacingY;
        const gridStartX = this.frameX + (this.frameWidth - gridW) / 2 + symbolW / 2;
        const gridStartY = this.frameY + (this.frameHeight - gridH) / 2 + symbolH / 2;
        // Only 3 symbols per reel
        for (let col = 0; col < reels; col++) {
            this.symbolImages[col] = [];
            for (let row = 0; row < rows; row++) {
                const symbolKey = Phaser.Utils.Array.GetRandom(symbolKeys);
                const x = gridStartX + col * (symbolW + symbolSpacingX);
                const y = gridStartY + row * (symbolH + symbolSpacingY);
                const symbolImg = this.scene.add
                    .image(x, y, symbolKey)
                    .setDisplaySize(symbolW, symbolH)
                    .setDepth(30);
                this.symbolImages[col][row] = symbolImg;
            }
        }
    }

    // Update the grid with a new 2D array of symbol ids (for spins)
    public updateSymbols(newGrid: string[][]) {
        const symbolW = 110;
        const symbolH = 110;
        const symbolSpacingX = 20;
        const symbolSpacingY = 14;
        const reels = REELS;
        const rows = ROWS;
        const gridW = reels * symbolW + (reels - 1) * symbolSpacingX;
        const gridH = rows * symbolH + (rows - 1) * symbolSpacingY;
        const gridStartX = this.frameX + (this.frameWidth - gridW) / 2 + symbolW / 2;
        const gridStartY = this.frameY + (this.frameHeight - gridH) / 2 + symbolH / 2;
        // Only update visible symbols (rows)
        for (let col = 0; col < reels; col++) {
            for (let row = 0; row < rows; row++) {
                const symbolId = newGrid[col][row];
                const img = this.symbolImages[col][row];
                img.setTexture(symbolId);
                img.x = gridStartX + col * (symbolW + symbolSpacingX);
                img.y = gridStartY + row * (symbolH + symbolSpacingY);
                img.setVisible(true);
            }
        }
    }

    // Animate each column spinning vertically, then stop on the result
    public spinAnimation(resultGrid: string[][], onComplete?: () => void) {
        const reels = REELS;
        const rows = ROWS;
        
        // Classic slot animation: spin columns one at a time, then stop one at a time after last starts
        const spinStartDelay = 150; // ms between each column starting
        const spinStopDelay = 600;  // ms between each column stopping
        const spinInterval = 50;    // ms between symbol changes while spinning
        const symbolKeys = SYMBOLS.map(s => s.id);
        const spinning: boolean[] = Array(reels).fill(false);
        const spinTimers: number[] = [];

        // Helper to start spinning a column
        const startSpin = (col: number) => {
            spinning[col] = true;
            spinTimers[col] = window.setInterval(() => {
                for (let row = 0; row < rows; row++) {
                    const img = this.symbolImages[col][row];
                    img.setTexture(Phaser.Utils.Array.GetRandom(symbolKeys));
                }
            }, spinInterval);
        };

        // Helper to stop spinning a column and show result
        const stopSpin = (col: number) => {
            spinning[col] = false;
            clearInterval(spinTimers[col]);
            for (let row = 0; row < rows; row++) {
                const img = this.symbolImages[col][row];
                img.setTexture(resultGrid[col][row]);
            }
        };

        let lastColumnStarted = false;
        for (let col = 0; col < reels; col++) {
            this.scene.time.delayedCall(col * spinStartDelay, () => {
                startSpin(col);
                // When the last column starts, set flag and begin stopping columns
                if (col === reels - 1 && !lastColumnStarted) {
                    lastColumnStarted = true;
                    for (let stopCol = 0; stopCol < reels; stopCol++) {
                        this.scene.time.delayedCall(spinStopDelay * (stopCol + 1), () => {
                            stopSpin(stopCol);
                            // When last column stops, call onComplete
                            if (stopCol === reels - 1 && onComplete) {
                                onComplete();
                            }
                        });
                    }
                }
            });
        }
    }

    public setVisible(visible: boolean) {
        this.frameImage.setVisible(visible);
        for (const col of this.symbolImages) {
            for (const img of col) {
                img.setVisible(visible);
            }
        }
    }
}
