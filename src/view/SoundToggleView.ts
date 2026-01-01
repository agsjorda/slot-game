import { GameObjects, Scene } from 'phaser';

export class SoundToggleView extends GameObjects.Container {
	private soundIcon: GameObjects.Image;
	private isMuted: boolean = false;

	constructor(scene: Scene, x: number, y: number) {
		super(scene, x, y);

		// Remove background and border

		// Create sound icon using Volume.png from Controllers folder
		this.soundIcon = scene.add.image(0, 0, 'Volume');
		this.soundIcon.setOrigin(0.5, 0.5);
		this.soundIcon.setScale(0.4);
		this.add(this.soundIcon);

		// Make interactive
		this.setSize(50, 50);
		this.setInteractive({ useHandCursor: true });

		// Add hover effect: scale icon up on hover
		this.on('pointerover', () => {
			this.soundIcon.setScale(0.5);
		});
		this.on('pointerout', () => {
			this.soundIcon.setScale(0.4);
		});

		// Add click handler
		this.on('pointerdown', () => {
			this.toggleSound();
		});

		// Add to scene
		scene.add.existing(this);
	}

	private toggleSound(): void {
		this.isMuted = !this.isMuted;

		if (this.isMuted) {
			// Mute all sounds
			this.scene.sound.mute = true;
			this.soundIcon.setAlpha(0.3); // Dim icon when muted
		} else {
			// Unmute all sounds
			this.scene.sound.mute = false;
			this.soundIcon.setAlpha(1); // Full opacity when unmuted
		}
	}

	public setMuted(muted: boolean): void {
		this.isMuted = muted;
		this.scene.sound.mute = muted;
		this.soundIcon.setAlpha(muted ? 0.3 : 1);
	}
}
