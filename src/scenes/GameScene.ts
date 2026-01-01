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
import { SoundManager } from '../utils/SoundManager';
import { SYMBOLS } from '../config/symbols';
import { WinAnimator } from '../view/WinAnimator';
import BalanceController from '../controller/BalanceController';
import { SpinManager } from '../controller/SpinManager';

export default class GameScene extends Phaser.Scene {
	private controller!: SlotController;
	private reelsFrameView!: ReelsFrameView;
	private winAnimator!: WinAnimator;
	private soundManager!: SoundManager;
	private spinManager!: SpinManager;
	public bottomPanelView!: import('../view/BottomPanelView').BottomPanelView;

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

		// Load background music from public folder
		this.load.audio('bg_music', '/assets/sounds/background-default.mp3');
		this.load.audio('reel_spin', '/assets/sounds/reelSpin.mp3');
		this.load.audio('reel_stop', '/assets/sounds/reel_stop.mp3');
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
		// this.reelsFrameView.maskHeight = 380;
		// this.reelsFrameView.maskY = 160;
		// this.reelsFrameView.updateMask();

		// --- Logo ---
		new LogoView(this);

		// --- Right-side UI Panel ---
		new RightPanelView(this, this.onSpin.bind(this));

		// --- Bottom UI Panel ---
		const balanceModel = new BalanceModel();
		const balanceController = new BalanceController(balanceModel);
		this.bottomPanelView = new BottomPanelView(this, balanceController);

		// Initialize MVC components
		const slotModel = new SlotModel();
		this.controller = new SlotController(slotModel, balanceModel);

		// Initialize Win Animator
		this.winAnimator = new WinAnimator(this, this.reelsFrameView);

		this.soundManager = new SoundManager(this);
		this.soundManager.playBackgroundMusic();
		this.spinManager = new SpinManager(
			this,
			this.controller,
			this.reelsFrameView,
			this.winAnimator,
			this.soundManager
		);
	}

	private async onSpin(): Promise<void> {
		await this.spinManager.spin();
	}

}
