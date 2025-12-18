import * as Phaser from 'phaser';

export class UiHelper {
	static showMessage(
		scene: Phaser.Scene,
		text: string,
		color: number = 0xffffff,
		duration: number = 1500
	): void {
		const message = scene.add
			.text(
				scene.cameras.main.centerX,
				scene.cameras.main.centerY + 200,
				text,
				{
					fontSize: '32px',
					color: Phaser.Display.Color.IntegerToColor(color).rgba,
					fontStyle: 'bold',
				}
			)
			.setOrigin(0.5);

		scene.tweens.add({
			targets: message,
			scale: { from: 0.5, to: 1 },
			duration: 300,
			ease: 'Back.easeOut',
			onComplete: () => {
				scene.time.delayedCall(duration, () => {
					scene.tweens.add({
						targets: message,
						alpha: 0,
						duration: 300,
						onComplete: () => message.destroy(),
					});
				});
			},
		});
	}

	static showBalanceUpdate(scene: Phaser.Scene, newBalance: number): void {
		// You can add more UI helpers here
		// For example: balance update animations, bet display, etc.
	}
}
