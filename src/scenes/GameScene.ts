
import * as Phaser from 'phaser';
import SlotModel from '../model/SlotModel';
import BalanceModel from '../model/BalanceModel';
import SlotController from '../controller/SlotController';
import SlotView from '../view/SlotView';

export default class GameScene extends Phaser.Scene {
	private controller!: SlotController;
	private view!: SlotView;

    /**
     * Preload assets for the game scene
     */
	preload() {
		// Load the main background image
		this.load.image('main_bg', 'assets/background/Main_Background.png');
		// Load the logo
		this.load.image('logo', 'assets/Logo/Logo.png');
		// Load main cloud and foreground
		this.load.image('main_cloud', 'assets/background/Main_Cloud.png');
		this.load.image('main_foreground', 'assets/background/Main_Foreground.png');
		// Load all symbol images from the Symbols folder
		this.load.image('symbol_0', 'assets/Symbols/Symbol_0.png');
		this.load.image('symbol_1', 'assets/Symbols/Symbol_1.png');
		this.load.image('symbol_2', 'assets/Symbols/Symbol_2.png');
		this.load.image('symbol_3', 'assets/Symbols/Symbol_3.png');
		this.load.image('symbol_5', 'assets/Symbols/Symbol_5.png');
		this.load.image('symbol_5_1', 'assets/Symbols/Symbol_5-1.png');
		this.load.image('symbol_7', 'assets/Symbols/Symbol_7.png');
		this.load.image('symbol_8', 'assets/Symbols/Symbol_8.png');
		this.load.image('symbol_9', 'assets/Symbols/Symbol_9.png');
		// Load the slot frame image
		this.load.image('slot_frame', 'assets/Reels/Property 1=Default.png');
	}

	create() {
		// Add the background image, centered and scaled to fit
		const bg = this.add.image(0, 0, 'main_bg').setOrigin(0, 0);
		bg.setDisplaySize(1280, 720);

		// Add the main cloud layer
		const mainCloud = this.add.image(0, 0, 'main_cloud').setOrigin(0, 0);
		mainCloud.setDisplaySize(1280, 720);

		// Add the main foreground layer
		const mainForeground = this.add.image(0, 0, 'main_foreground').setOrigin(0, 0);
		mainForeground.setDisplaySize(1280, 720);

		// Add the slot frame using the provided image
		// Figma: slot area is centered, with some margin from top and sides
		const frameX = 180; // left margin
		const frameY = 80;  // top margin
		const frameWidth = 920;
		const frameHeight = 480;
		const slotFrame = this.add.image(frameX + frameWidth / 2, frameY + frameHeight / 2, 'slot_frame');
		slotFrame.setDisplaySize(frameWidth, frameHeight);
		slotFrame.setDepth(10);

		// Add the logo at the top center, above the slot frame
		const logoImg = this.add.image(640, 60, 'logo');
		logoImg.setOrigin(0.5, 0.5);
		logoImg.setDisplaySize(250, 100); // Adjusted for pixel-perfect fit
		logoImg.setDepth(20);

		// --- Add 5x3 grid of symbols centered in the slot frame ---
		const reels = 5;
		const rows = 3;
		const symbolKeys = [
			'symbol_0', 'symbol_1', 'symbol_2', 'symbol_3',
			'symbol_5', 'symbol_5_1', 'symbol_7', 'symbol_8', 'symbol_9'
		];
		// Figma: symbols are square, evenly spaced, with a little margin inside the frame
		const symbolW = 144;
		const symbolH = 144;
		// const gridW = symbolW * reels;
		// const gridH = symbolH * rows;
		const gridStartX = frameX + 28 + symbolW / 2; // 28px margin from frame left
		const gridStartY = frameY + 28 + symbolH / 2; // 28px margin from frame top

		for (let col = 0; col < reels; col++) {
			for (let row = 0; row < rows; row++) {
				const symbolKey = Phaser.Utils.Array.GetRandom(symbolKeys);
				const x = gridStartX + col * symbolW;
				const y = gridStartY + row * symbolH;
				this.add.image(x, y, symbolKey).setDisplaySize(symbolW, symbolH).setDepth(30);
			}
		}

		// Add the logo at the top center
		// Removed duplicate logo declaration

		const slotModel = new SlotModel();
		const balanceModel = new BalanceModel();
		this.controller = new SlotController(slotModel, balanceModel);
		this.view = new SlotView(this);

		const spinBtn = this.add.text(1100, 350, 'SPIN').setInteractive();
		spinBtn.on('pointerdown', () => this.onSpin());
	}

	onSpin() {
		const result = this.controller.spin();
		if (!result) return;

		this.view.renderGrid(result.grid);
		console.log('Win:', result.win, 'Balance:', result.balance);
	}
}
