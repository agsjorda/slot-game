import { SoundManager } from '../utils/SoundManager';
import { WinAnimator } from '../view/WinAnimator';
import { UiHelper } from '../utils/UiHelper';
import SlotController from './SlotController';
import { ReelsFrameView } from '../view/ReelsFrame';

export class SpinManager {
    private scene: Phaser.Scene;
    private slotController: SlotController;
    private reelsFrameView: ReelsFrameView;
    private winAnimator: WinAnimator;
    private soundManager: SoundManager;
    private isSpinning: boolean = false;

    constructor(
        scene: Phaser.Scene,
        slotController: SlotController,
        reelsFrameView: ReelsFrameView,
        winAnimator: WinAnimator,
        soundManager: SoundManager
    ) {
        this.scene = scene;
        this.slotController = slotController;
        this.reelsFrameView = reelsFrameView;
        this.winAnimator = winAnimator;
        this.soundManager = soundManager;
    }

    public async spin(): Promise<void> {
        if (this.isSpinning || this.winAnimator.isAnimatingWins()) {
            return;
        }
        this.isSpinning = true;
        try {
            this.soundManager.playReelSpin();

            // Deduct bet from balance using BottomPanelView
            const bottomPanel = (this.scene as any).bottomPanelView as import('../view/BottomPanelView').BottomPanelView;
            if (bottomPanel && typeof bottomPanel.getBetValue === 'function' && typeof bottomPanel.deductBalance === 'function') {
                const bet = bottomPanel.getBetValue();
                bottomPanel.deductBalance(bet);
            }

            const result = this.slotController.spin();
            if (!result) {
                UiHelper.showMessage(this.scene, 'Not enough balance!', 0xff0000);
                this.soundManager.stopReelSpin();
                return;
            }
            await this.animateReels(result.grid);
            if (result.wins.length > 0) {
                await this.winAnimator.presentWins(result.wins, result.totalWin);
                // Update win and balance display after win
                if (bottomPanel && typeof bottomPanel.updateWinDisplay === 'function') {
                    bottomPanel.updateWinDisplay();
                }
                if (bottomPanel && typeof bottomPanel.updateBalanceDisplay === 'function') {
                    bottomPanel.updateBalanceDisplay();
                }
            } else {
                UiHelper.showMessage(this.scene, 'Try Again!', 0xffffff);
            }
        } catch (error) {
            console.error('Spin error:', error);
        } finally {
            this.isSpinning = false;
            this.soundManager.stopReelSpin();
        }
    }

    private async animateReels(grid: string[][]): Promise<void> {
        return new Promise((resolve) => {
            this.reelsFrameView.spinAnimation(grid, () => {
                this.soundManager.stopReelSpin();
                resolve();
            });
        });
    }
}
