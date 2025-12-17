import * as Phaser from 'phaser';

export default class SlotView {
	constructor(private _scene: Phaser.Scene) {}

	renderGrid(grid: string[][]) {
		// Touch the scene so the field is genuinely used
		this._scene.cameras.main;

		grid.forEach((reel) => {
			reel.forEach(() => {
				// draw / update sprite at each position using this.scene
			});
		});
	}
}
