import * as Phaser from 'phaser';
import SlotModel from '../model/SlotModel';
import BalanceModel from '../model/BalanceModel';
import SlotController from '../controller/SlotController';
import { RightPanelView } from '../view/RightPanelView';
import { LanternView } from '../view/LanternView';
import { LogoView } from '../view/LogoView';
import { BackgroundView } from '../view/BackgroundView';
import { BottomPanelView } from '../view/BottomPanelView';
import { ReelsFrameView } from '../view/ReelsFrame';
import { SYMBOLS } from '../config/symbols';
import { WinAnimator } from '../view/WinAnimator';
import { UiHelper } from '../utils/UiHelper'; // New utility

export default class GameScene extends Phaser.Scene {
	private controller!: SlotController;
	private reelsFrameView!: ReelsFrameView;
	private winAnimator!: WinAnimator;
	private isSpinning: boolean = false;

	preload() {
		const backgrounds = [
			{ key: 'main_bg', path: 'assets/background/Main_Background.png' },
			{ key: 'main_cloud', path: 'assets/background/Main_Cloud.png' },
			{ key: 'main_foreground', path: 'assets/background/Main_Foreground.png' },
			{ key: 'cloud', path: 'assets/background/Cloud.png' },
		];
		const logo = { key: 'logo', path: 'assets/Logo/Logo.png' };
		const lantern = {
			key: 'lantern',
			path: 'assets/background/Main_Latern.png',
		};
		const controllers = [
			{ key: 'Autoplay', path: 'assets/Controllers/Autoplay.png' },
			{ key: 'Turbo', path: 'assets/Controllers/Turbo.png' },
			{ key: 'Spin', path: 'assets/Controllers/Spin.png' },
			{ key: 'Info', path: 'assets/Controllers/Info.png' },
		];
		const slotFrame = {
			key: 'slot_frame',
			path: 'assets/Reels/Property 1=Default.png',
		};

		[logo, lantern, slotFrame, ...backgrounds, ...controllers].forEach(
			(asset) => {
				this.load.image(asset.key, asset.path);
			}
		);

		// Load symbol images from config
		SYMBOLS.forEach((symbol) => {
			this.load.image(symbol.id, symbol.image);
		});

		// Load sound effects
		// this.load.audio('spin_sound', 'assets/sounds/spin.mp3');
		// this.load.audio('reel_stop', 'assets/sounds/reel_stop.mp3');
		// this.load.audio('line_win', 'assets/sounds/line_win.mp3');
		// this.load.audio('big_win', 'assets/sounds/big_win.mp3');
	}

	create() {
		// --- Background, Cloud, Foreground ---
		new BackgroundView(this);

		// --- Lanterns ---
		new LanternView(this);

		// --- Reels Frame ---
		this.reelsFrameView = new ReelsFrameView(this);
		this.reelsFrameView.maskHeight = 380;
		this.reelsFrameView.maskY = 160;
		this.reelsFrameView.updateMask();

		// --- Logo ---
		new LogoView(this);

		// --- Right-side UI Panel ---
		new RightPanelView(this, this.onSpin.bind(this));

		// --- Bottom UI Panel ---
		new BottomPanelView(this);

		// Initialize MVC components
		const slotModel = new SlotModel();
		const balanceModel = new BalanceModel();
		this.controller = new SlotController(slotModel, balanceModel);

		// Initialize Win Animator
		this.winAnimator = new WinAnimator(this, this.reelsFrameView);
	}

	private async onSpin(): Promise<void> {
		if (this.isSpinning || this.winAnimator.isAnimatingWins()) {
			return;
		}

		this.isSpinning = true;

		try {
			// Play spin sound
			// this.sound.play('spin_sound', { volume: 0.3 });

			// 1. Get spin result from controller
			const result = this.controller.spin();
			if (!result) {
				UiHelper.showMessage(this, 'Not enough balance!', 0xff0000);
				return;
			}

			// 2. Animate the reels
			await this.animateReels(result.grid);

			// 3. Handle wins through WinAnimator
			if (result.wins.length > 0) {
				await this.winAnimator.presentWins(result.wins, result.totalWin);
			} else {
				UiHelper.showMessage(this, 'Try Again!', 0xffffff);
			}
		} catch (error) {
			console.error('Spin error:', error);
		} finally {
			this.isSpinning = false;
		}
	}

	private async animateReels(grid: string[][]): Promise<void> {
		return new Promise((resolve) => {
			this.reelsFrameView.spinAnimation(grid, () => {
				// Play reel stop sound
				// this.sound.play('reel_stop', { volume: 0.4 });
				resolve();
			});
		});
	}
}
