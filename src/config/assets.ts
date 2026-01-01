export interface AssetConfig {
	key: string;
	path: string;
}

export const BACKGROUND_ASSETS: AssetConfig[] = [
	{ key: 'main_bg', path: 'assets/background/Main_Background.png' },
	{ key: 'main_cloud', path: 'assets/background/Main_Cloud.png' },
	{ key: 'main_foreground', path: 'assets/background/Main_Foreground.png' },
	{ key: 'cloud', path: 'assets/background/Cloud.png' },
];

export const UI_ASSETS: AssetConfig[] = [
	{ key: 'logo', path: 'assets/Logo/Logo.png' },
	{ key: 'lantern', path: 'assets/background/Main_Latern.png' },
	{ key: 'slot_frame', path: 'assets/Reels/Property 1=Default.png' },
];

export const CONTROLLER_ASSETS: AssetConfig[] = [
	{ key: 'Autoplay', path: 'assets/Controllers/Autoplay.png' },
	{ key: 'Turbo', path: 'assets/Controllers/Turbo.png' },
	{ key: 'Spin', path: 'assets/Controllers/Spin.png' },
	{ key: 'Info', path: 'assets/Controllers/Info.png' },
	{ key: 'Volume', path: 'assets/Controllers/Volume.png' },
	{ key: 'Settings', path: 'assets/Controllers/Setting.png' },
];

export const AUDIO_ASSETS: AssetConfig[] = [
	{ key: 'bg_music', path: 'assets/sounds/background-default.mp3' },
	{ key: 'reel_spin', path: 'assets/sounds/reelSpin.mp3' },
	{ key: 'reel_stop', path: 'assets/sounds/reel_stop.mp3' },
	{ key: 'you-win-sequence-1', path: 'assets/sounds/you-win-sequence-1.mp3' },
];

export const SPINE_ASSETS = {
	character: {
		json: 'assets/Assets/Character/char.json',
		atlas: 'assets/Assets/Character/char.atlas',
	},
};
