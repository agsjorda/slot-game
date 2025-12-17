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

export default class GameScene extends Phaser.Scene {
	private controller!: SlotController;
	private view!: SlotView;


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
		const symbols = [
			{ key: 'symbol_0', path: 'assets/Symbols/Symbol_0.png' },
			{ key: 'symbol_1', path: 'assets/Symbols/Symbol_1.png' },
			{ key: 'symbol_2', path: 'assets/Symbols/Symbol_2.png' },
			{ key: 'symbol_3', path: 'assets/Symbols/Symbol_3.png' },
			{ key: 'symbol_5', path: 'assets/Symbols/Symbol_5.png' },
			{ key: 'symbol_5_1', path: 'assets/Symbols/Symbol_5-1.png' },
			{ key: 'symbol_7', path: 'assets/Symbols/Symbol_7.png' },
			{ key: 'symbol_8', path: 'assets/Symbols/Symbol_8.png' },
			{ key: 'symbol_9', path: 'assets/Symbols/Symbol_9.png' }
		];
		const controllers = [
			{ key: 'Autoplay', path: 'assets/Controllers/Autoplay.png' },
			{ key: 'Turbo', path: 'assets/Controllers/Turbo.png' },
			{ key: 'Spin', path: 'assets/Controllers/Spin.png' },
			{ key: 'Info', path: 'assets/Controllers/Info.png' }
		];
		const slotFrame = { key: 'slot_frame', path: 'assets/Reels/Property 1=Default.png' };

		[logo, lantern, slotFrame, ...backgrounds, ...symbols, ...controllers].forEach(asset => {
			this.load.image(asset.key, asset.path);
		});
	}

	create() {
		// --- Background, Cloud, Foreground ---
		new BackgroundView(this);

		// --- Lanterns ---
		new LanternView(this);

		// --- Reels Frame ---
		new ReelsFrameView(this);

		// --- Logo  ---
		new LogoView(this);

		// --- Right-side UI Panel ---
		new RightPanelView(this);

		// --- Bottom UI Panel ---
		new BottomPanelView(this);


		// Initialize MVC components

		const slotModel = new SlotModel();
		const balanceModel = new BalanceModel();
		this.controller = new SlotController(slotModel, balanceModel);
		this.view = new SlotView(this);
	}

	onSpin() {
		const result = this.controller.spin();
		if (!result) return;

		this.view.renderGrid(result.grid);
		console.log('Win:', result.win, 'Balance:', result.balance);
	}
}
