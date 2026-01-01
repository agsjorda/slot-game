import { GameObjects, Scene } from 'phaser';

export default class CharacterView extends GameObjects.Container {
	private characterBody: GameObjects.Image;
	private leftArm: GameObjects.Image;
	private rightArm: GameObjects.Image;
	private leftHorn: GameObjects.Image;
	private rightHorn: GameObjects.Image;
	private leftEye: GameObjects.Image;
	private rightEye: GameObjects.Image;
	private leftPupil: GameObjects.Image;
	private rightPupil: GameObjects.Image;
	private mouth: GameObjects.Image;

	constructor(scene: Scene, x: number, y: number) {
		super(scene, x, y);

		// Add this container to the scene first
		scene.add.existing(this);

		// Add a soft shadow/ellipse under the character for depth
		const shadow = scene.add.ellipse(0, 85, 80, 20, 0x000000, 0.25);
		shadow.setOrigin(0.5, 0.5);
		this.add(shadow);

		// Scale factor based on Spine skeleton data - adjusted for proper size
		const scale = 0.15;
		
		// Body (main blob) - The body is rotated 90° in the atlas
		// Position based on Lower-Body bone from skeleton
		this.characterBody = scene.add.image(0, 10, 'char', 'body');
		this.characterBody.setOrigin(0.5, 0.5);
		this.characterBody.setScale(scale * 1.1);
		this.characterBody.setAngle(-90.22); // Rotation from skeleton data
		this.add(this.characterBody);

		// Horns positioned based on Upper-Body bone hierarchy
		// L-Horn: x: 539.73, y: 227.26 (scaled down)
		this.leftHorn = scene.add.image(34, -45, 'char', 'horn-l');
		this.leftHorn.setOrigin(0.5, 1);
		this.leftHorn.setScale(scale * 0.85);
		this.leftHorn.setAngle(-90.17);
		this.add(this.leftHorn);

		// R-Horn: x: 549.49, y: -204.73 (scaled down)
		this.rightHorn = scene.add.image(-31, -45, 'char', 'horn-r');
		this.rightHorn.setOrigin(0.5, 1);
		this.rightHorn.setScale(scale * 0.85);
		this.rightHorn.setAngle(-90.17);
		this.add(this.rightHorn);

		// Eyes positioned based on skeleton data
		// L-Eye: x: 364.18, y: 170.57
		this.leftEye = scene.add.image(26, -25, 'char', 'l-eye');
		this.leftEye.setOrigin(0.5, 0.5);
		this.leftEye.setScale(scale);
		this.leftEye.setAngle(-90.17);
		this.add(this.leftEye);

		// R-Eye: x: 348.33, y: -187.51
		this.rightEye = scene.add.image(-28, -25, 'char', 'r-eye');
		this.rightEye.setOrigin(0.5, 0.5);
		this.rightEye.setScale(scale);
		this.rightEye.setAngle(-90.17);
		this.add(this.rightEye);

		// Pupils on top of eyes
		// L-EyeBall offset: x: -18.44, y: 5.59
		this.leftPupil = scene.add.image(26, -25, 'char', 'l-pupil');
		this.leftPupil.setOrigin(0.5, 0.5);
		this.leftPupil.setScale(scale);
		this.leftPupil.setAngle(-90.17);
		this.add(this.leftPupil);

		// R-EyeBall offset: x: 12.97, y: 14.73
		this.rightPupil = scene.add.image(-28, -25, 'char', 'r-pupil');
		this.rightPupil.setOrigin(0.5, 0.5);
		this.rightPupil.setScale(scale);
		this.rightPupil.setAngle(-90.17);
		this.add(this.rightPupil);

		// Mouth: x: 237.13, y: 14.09 (rotated in atlas)
		this.mouth = scene.add.image(0, -8, 'char', 'mouth-happy');
		this.mouth.setOrigin(0.5, 0.5);
		this.mouth.setScale(scale);
		this.mouth.setAngle(0.17);
		this.add(this.mouth);

		// Arms positioned based on Upper-Arm bones (rotated 90° in atlas)
		// L-Upper-Arm: rotation: 176.96, x: 85.9, y: 324.64
		this.leftArm = scene.add.image(48, 5, 'char', 'arm-l');
		this.leftArm.setOrigin(0.2, 0.5);
		this.leftArm.setScale(scale * 0.8);
		this.leftArm.setAngle(86.96); // 176.96 - 90 (atlas rotation)
		this.add(this.leftArm);

		// R-Upper-Arm: rotation: -174.98, x: 61.81, y: -314.01
		this.rightArm = scene.add.image(-47, 5, 'char', 'arm-r');
		this.rightArm.setOrigin(0.8, 0.5);
		this.rightArm.setScale(scale * 0.8);
		this.rightArm.setAngle(-84.98); // -174.98 + 90 (atlas rotation)
		this.add(this.rightArm);

		// Set depth to ensure character appears above background but below UI
		this.setDepth(10);

		// Add idle animation
		this.addIdleAnimation(scene);
	}

	private addIdleAnimation(scene: Scene): void {
		// Simple bobbing animation
		scene.tweens.add({
			targets: this,
			y: this.y + 15,
			duration: 1000,
			ease: 'Sine.easeInOut',
			yoyo: true,
			repeat: -1
		});

		// Arms slight sway
		scene.tweens.add({
			targets: this.leftArm,
			angle: -5,
			duration: 800,
			ease: 'Sine.easeInOut',
			yoyo: true,
			repeat: -1
		});

		scene.tweens.add({
			targets: this.rightArm,
			angle: 5,
			duration: 800,
			ease: 'Sine.easeInOut',
			yoyo: true,
			repeat: -1,
			delay: 400
		});
	}

	public playWinAnimation(): void {
		// Change mouth to happy
		this.mouth.setFrame('mouth-happy');

		// Jump animation
		this.scene.tweens.add({
			targets: this,
			y: this.y - 50,
			duration: 300,
			ease: 'Quad.easeOut',
			yoyo: true,
			repeat: 2
		});
	}
}
