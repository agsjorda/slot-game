import * as Phaser from 'phaser';
import { BackgroundView } from '../view/BackgroundView';
import { LanternView } from '../view/LanternView';
import { LogoView } from '../view/LogoView';
import { ReelsFrameView } from '../view/ReelsFrame';
import { RightPanelView } from '../view/RightPanelView';
import { BottomPanelView } from '../view/BottomPanelView';
import { SoundToggleView } from '../view/SoundToggleView';
import { SettingsIconView } from '../view/SettingsIconView';
import CharacterView from '../view/CharacterView';
import BalanceController from '../controller/BalanceController';

export interface GameViews {
	background: BackgroundView;
	lanterns: LanternView;
	logo: LogoView;
	reelsFrame: ReelsFrameView;
	rightPanel: RightPanelView;
	bottomPanel: BottomPanelView;
	character: CharacterView;
	soundToggle: SoundToggleView;
	settingsIcon: SettingsIconView;
}

export class ViewFactory {
	/**
	 * Create all game views in the correct order
	 */
	static createGameViews(
		scene: Phaser.Scene,
		balanceController: BalanceController,
		onSpin: () => void
	): GameViews {
		// Layer 1: Background elements
		const background = new BackgroundView(scene);
		const lanterns = new LanternView(scene);

		// Layer 2: Game frame and logo
		const reelsFrame = new ReelsFrameView(scene);
		const logo = new LogoView(scene);

		// Layer 3: UI panels
		const rightPanel = new RightPanelView(scene, onSpin);
		const bottomPanel = new BottomPanelView(scene, balanceController);

		// Layer 4: Character and controls
		const character = new CharacterView(scene, 160, 340);
		const soundToggle = new SoundToggleView(scene, 50, 670);
		const settingsIcon = new SettingsIconView(scene, 90, 670);

		return {
			background,
			lanterns,
			logo,
			reelsFrame,
			rightPanel,
			bottomPanel,
			character,
			soundToggle,
			settingsIcon,
		};
	}
}
