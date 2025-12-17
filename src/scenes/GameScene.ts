
import * as Phaser from 'phaser';
import SlotModel from '../model/SlotModel';
import BalanceModel from '../model/BalanceModel';
import SlotController from '../controller/SlotController';
import SlotView from '../view/SlotView';
import { GAME_WIDTH, GAME_HEIGHT, REELS, ROWS } from '../config/gameConfig';

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
		// Load cloud and lantern assets
		this.load.image('cloud', 'assets/background/Cloud.png');
		this.load.image('lantern', 'assets/background/Main_Latern.png');
		// Load right-side controller button images
		this.load.image('Autoplay', 'assets/Controllers/Autoplay.png');
		this.load.image('Turbo', 'assets/Controllers/Turbo.png');
		this.load.image('Spin', 'assets/Controllers/Spin.png');
		this.load.image('Info', 'assets/Controllers/Info.png');
	}

	create() {
		// Add the background image, centered and scaled to fit
		const bg = this.add.image(0, 0, 'main_bg').setOrigin(0, 0);
		bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

		// Add the main cloud layer (animated)
		const mainCloud = this.add.image(0, 0, 'main_cloud').setOrigin(0, 0);
		mainCloud.setDisplaySize(GAME_WIDTH, 700);
		// Animate the main cloud layer softly up and down
		this.tweens.add({
			targets: mainCloud,
			y: 20,
			duration: 3500,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
			delay: 0,
		});

		// Add the main foreground layer
		// You can adjust the y-offset here to move the foreground up or down
		const foregroundYOffset = -200; // <--- Change this value to move foreground higher/lower
		const mainForeground = this.add
			.image(0, foregroundYOffset, 'main_foreground')
			.setOrigin(0, 0);
		mainForeground.setDisplaySize(GAME_WIDTH, 920);


		// --- Animated Lanterns ---
		// Place lanterns: two on left tree, one on right tree (positions from video)
		// Set correct size and pivot (origin at top tip)
		// You can adjust the x/y position of each lantern below:
		const lanterns = [];
		// Lantern 1 (left top)
		// Change x/y here for Lantern 1
		const lantern1 = this.add.image(250, 100, 'lantern').setDepth(6);
		lantern1.setDisplaySize(30, 60); // scale to match image
		lantern1.setOrigin(0.5, 0.05); // pivot at top tip
		lanterns.push(lantern1);
		// Lantern 2 (left lower)
		// Change x/y here for Lantern 2
		const lantern2 = this.add.image(350, 50, 'lantern').setDepth(6);
		lantern2.setDisplaySize(38, 80);
		lantern2.setOrigin(0.5, 0.05);
		lanterns.push(lantern2);
		// Lantern 3 (right)
		// Change x/y here for Lantern 3
		const lantern3 = this.add.image(1160, 60, 'lantern').setDepth(6);
		lantern3.setDisplaySize(38, 60);
		lantern3.setOrigin(0.5, 0.05);
		lanterns.push(lantern3);
		// Animate lanterns with a gentle swing
		lanterns.forEach((lantern, i) => {
			this.tweens.add({
				targets: lantern,
				angle: { from: -8, to: 8 },
				duration: 2200 + i * 300,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut',
				delay: i * 300,
			});
		});

		// Add the slot frame using the provided image
		// You can adjust the frame position here:
		const frameWidth = 720;
		const frameHeight = 430;
		const frameOffsetX = 0; // <--- Change this to move frame left/right
		const frameOffsetY = -20; // <--- Change this to move frame up/down
		const frameX = (GAME_WIDTH - frameWidth) / 2 + frameOffsetX; // center horizontally, plus offset
		const frameY = (GAME_HEIGHT - frameHeight) / 2 + frameOffsetY; // center vertically, plus offset
		const slotFrame = this.add.image(
			frameX + frameWidth / 2,
			frameY + frameHeight / 2,
			'slot_frame'
		);
		slotFrame.setDisplaySize(frameWidth, frameHeight);
		slotFrame.setDepth(10);

		// Add the logo at the top center, above the slot frame
		// You can adjust the logo position here:
		const logoX = GAME_WIDTH / 2; // center horizontally
		const logoY = 80; // adjust this value to move logo up/down
		const logoImg = this.add.image(logoX, logoY, 'logo');
		logoImg.setOrigin(0.5, 0.5);
		logoImg.setDisplaySize(230, 120); // Adjusted for pixel-perfect fit
		logoImg.setDepth(20);

		// --- Right-side UI Buttons (Turbo, Spin, Autoplay, Info) ---
		// Use the exact PNG asset keys from the Controllers folder
		// Button order (top to bottom): Turbo, Spin, Autoplay, Info
		// Button sizes and spacing
		// --- Button size and icon size adjustment ---
		// Change these values to adjust the button background circle size and icon size
		// Individual icon width/height (edit these for fine-tuning)
		const turboBtnWidth = 22, turboBtnHeight = 24;   // Turbo icon size
		const spinBtnWidth = 150, spinBtnHeight = 150;   // Spin icon size
		const autoplayBtnWidth = 28, autoplayBtnHeight = 28; // Autoplay icon size
		const infoBtnWidth = 12, infoBtnHeight = 18;     // Info icon size
		const btnCirclePadding = 14; // <--- Padding around icon for dark circle

		// If you want to adjust only the icon (not the circle), change the size in setDisplaySize below

		const controllerButtonAssets = [
			{ key: 'Turbo', png: 'Turbo.png', width: turboBtnWidth, height: turboBtnHeight },
			{ key: 'Spin', png: 'Spin.png', width: spinBtnWidth, height: spinBtnHeight },
			{ key: 'Autoplay', png: 'Autoplay.png', width: autoplayBtnWidth, height: autoplayBtnHeight },
			{ key: 'Info', png: 'Info.png', width: infoBtnWidth, height: infoBtnHeight },
		];
		// Manually set y-positions for pixel-perfect vertical alignment (no overlap)
		const rightAreaX = GAME_WIDTH - 200; // X position for right-side buttons
		// --- Button vertical positions ---
		// Change this value to move the entire button group up or down
		// Change these values to adjust the vertical spacing between buttons
		const turboY = 180; // <--- Turbo button Y position
		const spinY = turboY + turboBtnHeight/2 + spinBtnHeight/2 + 22;
		const autoplayY = spinY + spinBtnHeight/2 + autoplayBtnHeight/2 + 22;
		const infoY = autoplayY + autoplayBtnHeight/2 + infoBtnHeight/2 + 50;
		const buttonYs = [turboY, spinY, autoplayY, infoY];

		for (let i = 0; i < controllerButtonAssets.length; i++) {
			const { key, width, height } = controllerButtonAssets[i];
			const y = buttonYs[i];
			let mainContainerRadius;
			// Draw dark circle for Turbo, Autoplay, Info (not Spin)
			if (key !== 'Spin') {
				const darkCircleRadius = Math.max(width, height) / 2 + btnCirclePadding;
				// Draw dark circle
				const circle = this.add.graphics();
				circle.fillStyle(0x000000, .6); // dark gray, 60% opacity
				circle.fillCircle(rightAreaX, y, darkCircleRadius);
				circle.setDepth(99);
				// Transparent circle surrounds the dark circle with same thickness
				mainContainerRadius = darkCircleRadius + 8;
			} else {
				// For Spin, transparent circle surrounds the icon directly
				mainContainerRadius = Math.max(width, height) / 2 + 8;
			}
			// Draw main transparent container circle (soft, semi-transparent look)
			const mainContainerCircle = this.add.graphics();
			mainContainerCircle.fillStyle(0x888888, 0.4); // light gray, semi-transparent
			mainContainerCircle.fillCircle(rightAreaX, y, mainContainerRadius);
			mainContainerCircle.setDepth(97);

			// Use the asset key as loaded in preload (case-sensitive)
			// To adjust icon size, use width/height below
			const btn = this.add.image(rightAreaX, y, key).setDisplaySize(width, height).setDepth(100);
			btn.setInteractive({ useHandCursor: true });
		}

		// --- Add 5x3 grid of symbols centered in the slot frame ---
		const reels = REELS;
		const rows = ROWS;
		const symbolKeys = [
			'symbol_0',
			'symbol_1',
			'symbol_2',
			'symbol_3',
			'symbol_5',
			'symbol_5_1',
			'symbol_7',
			'symbol_8',
			'symbol_9',
		];
		// --- Symbol size and spacing ---
		// Change these to adjust symbol size
		const symbolW = 110; // <--- Symbol width
		const symbolH = 110; // <--- Symbol height
		// Change these to adjust spacing between symbols
		const symbolSpacingX = 20; // <--- Horizontal spacing between symbols
		const symbolSpacingY = 14; // <--- Vertical spacing between symbols

		// Calculate total grid size
		const gridW = reels * symbolW + (reels - 1) * symbolSpacingX;
		const gridH = rows * symbolH + (rows - 1) * symbolSpacingY;
		// Center the grid inside the frame
		const gridStartX = frameX + (frameWidth - gridW) / 2 + symbolW / 2;
		const gridStartY = frameY + (frameHeight - gridH) / 2 + symbolH / 2;

		for (let col = 0; col < reels; col++) {
			for (let row = 0; row < rows; row++) {
				const symbolKey = Phaser.Utils.Array.GetRandom(symbolKeys);
				const x = gridStartX + col * (symbolW + symbolSpacingX);
				const y = gridStartY + row * (symbolH + symbolSpacingY);
				this.add
					.image(x, y, symbolKey)
					.setDisplaySize(symbolW, symbolH)
					.setDepth(30);
			}
		}
		
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
