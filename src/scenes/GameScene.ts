/**
 * Draws a plus or minus button at the given position.
 * @param x X position of the button center
 * @param y Y position of the button center
 * @param type 'plus' or 'minus'
 * @param depth Optional depth for the button graphics
 * @returns The Phaser.GameObjects.Graphics instance
 */

import * as Phaser from 'phaser';
import SlotModel from '../model/SlotModel';
import BalanceModel from '../model/BalanceModel';
import SlotController from '../controller/SlotController';
import SlotView from '../view/SlotView';
import { RightPanelView } from '../view/RightPanelView';
import { LanternView } from '../view/LanternView';
import { LogoView } from '../view/LogoView';
import { BackgroundView } from '../view/BackgroundView';
import { BottomPanelView } from '../view/BottomPanelView';
import { ReelsFrameView } from '../view/ReelsFrame';
import { SYMBOLS } from '../config/symbols';

export default class GameScene extends Phaser.Scene {
	private controller!: SlotController;
	private view!: SlotView;
	private reelsFrameView!: ReelsFrameView;


	/**
	 * Preload assets for the game scene
	 */
	preload() {
		const backgrounds = [
			{ key: 'main_bg', path: 'assets/background/Main_Background.png' },
			{ key: 'main_cloud', path: 'assets/background/Main_Cloud.png' },
			{ key: 'main_foreground', path: 'assets/background/Main_Foreground.png' },
			{ key: 'cloud', path: 'assets/background/Cloud.png' }
		];
		const logo = { key: 'logo', path: 'assets/Logo/Logo.png' };
		const lantern = { key: 'lantern', path: 'assets/background/Main_Latern.png' };
		const controllers = [
			{ key: 'Autoplay', path: 'assets/Controllers/Autoplay.png' },
			{ key: 'Turbo', path: 'assets/Controllers/Turbo.png' },
			{ key: 'Spin', path: 'assets/Controllers/Spin.png' },
			{ key: 'Info', path: 'assets/Controllers/Info.png' }
		];
		const slotFrame = { key: 'slot_frame', path: 'assets/Reels/Property 1=Default.png' };

		[logo, lantern, slotFrame, ...backgrounds, ...controllers].forEach(asset => {
			this.load.image(asset.key, asset.path);
		});
		// Load symbol images from config
		SYMBOLS.forEach(symbol => {
			this.load.image(symbol.id, symbol.image);
		});
	}

	create() {
		// --- Background, Cloud, Foreground ---
		new BackgroundView(this);

		// --- Lanterns ---
		new LanternView(this);

		// --- Reels Frame ---
		this.reelsFrameView = new ReelsFrameView(this);

		// --- Logo  ---
		new LogoView(this);

		// --- Right-side UI Panel ---
		new RightPanelView(this, () => this.onSpin());

		// --- Bottom UI Panel ---
		new BottomPanelView(this);

		// Initialize MVC components
		const slotModel = new SlotModel();
		const balanceModel = new BalanceModel();
		this.controller = new SlotController(slotModel, balanceModel);
		this.view = new SlotView(this, this.reelsFrameView);
	}

	onSpin() {
		const result = this.controller.spin();
		if (!result) return;

		this.view.renderGrid(result.grid);
		console.log('Win:', result.win, 'Balance:', result.balance);
	}
}
