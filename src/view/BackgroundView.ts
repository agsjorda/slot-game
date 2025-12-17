import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

export class BackgroundView {
    private scene: Phaser.Scene;
    private bg: Phaser.GameObjects.Image;
    private mainCloud: Phaser.GameObjects.Image;
    private mainForeground: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.bg = this.createBackground();
        this.mainCloud = this.createMainCloud();
        this.mainForeground = this.createMainForeground();
        this.animateCloud();
    }

    private createBackground(): Phaser.GameObjects.Image {
        const bg = this.scene.add.image(0, 0, 'main_bg').setOrigin(0, 0);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        return bg;
    }

    private createMainCloud(): Phaser.GameObjects.Image {
        const mainCloud = this.scene.add.image(0, 0, 'main_cloud').setOrigin(0, 0);
        mainCloud.setDisplaySize(GAME_WIDTH, 700);
        return mainCloud;
    }

    private createMainForeground(): Phaser.GameObjects.Image {
        const foregroundYOffset = -200;
        const mainForeground = this.scene.add.image(0, foregroundYOffset, 'main_foreground').setOrigin(0, 0);
        mainForeground.setDisplaySize(GAME_WIDTH, 920);
        return mainForeground;
    }

    private animateCloud() {
        this.scene.tweens.add({
            targets: this.mainCloud,
            y: 20,
            duration: 3500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 0,
        });
    }

    public setVisible(visible: boolean) {
        this.bg.setVisible(visible);
        this.mainCloud.setVisible(visible);
        this.mainForeground.setVisible(visible);
    }
}
