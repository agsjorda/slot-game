import { GameObjects, Scene } from 'phaser';

export class SettingsIconView extends GameObjects.Container {
    private settingsIcon: GameObjects.Image;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y);

        // Create settings icon using Setting.png from Controllers folder
        this.settingsIcon = scene.add.image(0, 0, 'Settings');
        this.settingsIcon.setOrigin(0.5, 0.5);
        this.settingsIcon.setScale(0.4);
        this.add(this.settingsIcon);

        // Make interactive
        this.setSize(50, 50);
        this.setInteractive({ useHandCursor: true });

        // Add hover effect: scale icon up on hover
        this.on('pointerover', () => {
            this.settingsIcon.setScale(0.5);
        });
        this.on('pointerout', () => {
            this.settingsIcon.setScale(0.4);
        });

        // Add to scene
        scene.add.existing(this);
    }
}
