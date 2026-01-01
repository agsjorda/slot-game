import * as Phaser from 'phaser';
import { SYMBOLS } from '../config/symbols';
import {
	BACKGROUND_ASSETS,
	UI_ASSETS,
	CONTROLLER_ASSETS,
	AUDIO_ASSETS,
	SPINE_ASSETS,
	AssetConfig,
} from '../config/assets';

export class AssetLoader {
	/**
	 * Load all game assets
	 */
	static loadGameAssets(scene: Phaser.Scene): void {
		// Load image assets
		this.loadImages(scene, [...BACKGROUND_ASSETS, ...UI_ASSETS, ...CONTROLLER_ASSETS]);

		// Load symbol images from config
		SYMBOLS.forEach((symbol) => {
			const path = symbol.image.startsWith('assets/')
				? symbol.image
				: 'assets/' + symbol.image.replace(/^\/*/, '');
			scene.load.image(symbol.id, path);
		});

		// Load Spine character
		scene.load.spineJson('character', SPINE_ASSETS.character.json);
		scene.load.spineAtlas('character', SPINE_ASSETS.character.atlas);

		// Load audio
		this.loadAudio(scene, AUDIO_ASSETS);
	}

	/**
	 * Load start scene assets (lighter subset)
	 */
	static loadStartAssets(scene: Phaser.Scene): void {
		scene.load.image('logo', 'assets/Logo/Logo.png');
		scene.load.image('play_btn', 'assets/Controllers/Spin.png');
		scene.load.image('bonus_bg', 'assets/background/Bonus_Background.png');
	}

	private static loadImages(scene: Phaser.Scene, assets: AssetConfig[]): void {
		assets.forEach((asset) => scene.load.image(asset.key, asset.path));
	}

	private static loadAudio(scene: Phaser.Scene, assets: AssetConfig[]): void {
		assets.forEach((asset) => scene.load.audio(asset.key, asset.path));
	}
}
