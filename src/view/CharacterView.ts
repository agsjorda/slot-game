import { GameObjects, Scene } from 'phaser';
import { SpineGameObject } from '@esotericsoftware/spine-phaser';

export default class CharacterView extends GameObjects.Container {
	private spineCharacter: SpineGameObject | null = null;

	constructor(scene: Scene, x: number, y: number) {
		super(scene, x, y);
		scene.add.existing(this);

		// Create Spine character using the Spine runtime
		this.spineCharacter = scene.add.spine(0, 0, 'character', 'character');
		
		// Scale to match the previous manual size
		this.spineCharacter.setScale(0.18);
		
		// Play idle animation
		this.spineCharacter.animationState.setAnimation(0, 'Idle', true);
		
		this.add(this.spineCharacter);
		this.setDepth(10);
	}

	public playAnimation(animationName: string, loop: boolean = true) {
		if (this.spineCharacter) {
			this.spineCharacter.animationState.setAnimation(0, animationName, loop);
		}
	}

	public stopAnimation() {
		if (this.spineCharacter) {
			this.spineCharacter.animationState.clearTracks();
		}
	}
}
