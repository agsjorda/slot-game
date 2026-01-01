import * as Phaser from 'phaser';
import SlotModel from '../model/SlotModel';
import BalanceModel from '../model/BalanceModel';
import SlotController from '../controller/SlotController';
import { ReelsFrameView } from '../view/ReelsFrame';
import { SoundManager } from '../utils/SoundManager';
import { WinAnimator } from '../view/WinAnimator';
import BalanceController from '../controller/BalanceController';
import { SpinManager } from '../controller/SpinManager';
import { AssetLoader } from '../utils/AssetLoader';
import { ViewFactory } from '../utils/ViewFactory';
import type { BottomPanelView } from '../view/BottomPanelView';

export default class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: 'GameScene' });
	}
	private controller!: SlotController;
	private reelsFrameView!: ReelsFrameView;
	private winAnimator!: WinAnimator;
	private soundManager!: SoundManager;
	private spinManager!: SpinManager;
	public bottomPanelView!: BottomPanelView;

	preload() {
		AssetLoader.loadGameAssets(this);
	}

	create() {
		// Initialize models and controllers
		const balanceModel = new BalanceModel();
		const balanceController = new BalanceController(balanceModel);
		const slotModel = new SlotModel();
		this.controller = new SlotController(slotModel, balanceModel);

		// Create all views
		const views = ViewFactory.createGameViews(this, balanceController, this.onSpin.bind(this));
		this.reelsFrameView = views.reelsFrame;
		this.bottomPanelView = views.bottomPanel;

		// Initialize game managers
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
