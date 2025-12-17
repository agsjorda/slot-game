import * as Phaser from 'phaser';
import { GAME_WIDTH } from '../config/gameConfig';

export class LogoView {
    private scene: Phaser.Scene;
    private logoImg: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.logoImg = this.createLogo();
    }

    private createLogo(): Phaser.GameObjects.Image {
        const logoX = GAME_WIDTH / 2;
        const logoY = 80;
        const logoImg = this.scene.add.image(logoX, logoY, 'logo');
        logoImg.setOrigin(0.5, 0.5);
        logoImg.setDisplaySize(230, 120);
        logoImg.setDepth(20);
        return logoImg;
    }

    public setVisible(visible: boolean) {
        this.logoImg.setVisible(visible);
    }
}
