import * as Phaser from 'phaser';

export class LanternView {
    private scene: Phaser.Scene;
    private lanterns: Phaser.GameObjects.Image[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createLanterns();
        this.animateLanterns();
    }

    private createLanterns() {
        // Lantern 1 (left top)
        const lantern1 = this.scene.add.image(250, 100, 'lantern').setDepth(6);
        lantern1.setDisplaySize(30, 60);
        lantern1.setOrigin(0.5, 0.05);
        this.lanterns.push(lantern1);
        // Lantern 2 (left lower)
        const lantern2 = this.scene.add.image(350, 50, 'lantern').setDepth(6);
        lantern2.setDisplaySize(38, 80);
        lantern2.setOrigin(0.5, 0.05);
        this.lanterns.push(lantern2);
        // Lantern 3 (right)
        const lantern3 = this.scene.add.image(1160, 60, 'lantern').setDepth(6);
        lantern3.setDisplaySize(38, 60);
        lantern3.setOrigin(0.5, 0.05);
        this.lanterns.push(lantern3);
    }

    private animateLanterns() {
        this.lanterns.forEach((lantern, i) => {
            this.scene.tweens.add({
                targets: lantern,
                angle: { from: -8, to: 8 },
                duration: 2200 + i * 300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: i * 300,
            });
        });
    }

    public setVisible(visible: boolean) {
        this.lanterns.forEach(lantern => lantern.setVisible(visible));
    }
}
