import * as Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        this.load.image('logo', '/assets/Logo/Logo.png');
        this.load.image('play_btn', '/assets/Controllers/Spin.png');
        this.load.image('bonus_bg', '/assets/background/Bonus_Background.png');
    }

    create() {
        const config = this.sys.game.config as unknown as { width: number; height: number };
        const centerX = Number(config.width) / 2;
        const centerY = Number(config.height) / 2;

        // Background
        this.add.image(centerX, centerY, 'bonus_bg').setOrigin(0.5).setDisplaySize(Number(config.width), Number(config.height));

        // Logo
        this.add.image(centerX, centerY - 100, 'logo').setOrigin(0.5).setScale(0.7);

        // Play Button (graphics + text, no CSS)
        const btnWidth = 180;
        const btnHeight = 64;
        const btnRadius = 18;
        const btnY = centerY + 80;

        // Button background
        const playBtnBg = this.add.graphics();
        playBtnBg.fillStyle(0x222222, 1);
        playBtnBg.lineStyle(4, 0x7fffd4, 1);
        playBtnBg.fillRoundedRect(centerX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, btnRadius);
        playBtnBg.strokeRoundedRect(centerX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, btnRadius);
        playBtnBg.setInteractive(new Phaser.Geom.Rectangle(centerX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight), Phaser.Geom.Rectangle.Contains);

        // Button text
        this.add.text(centerX, btnY, 'PLAY', {
            fontFamily: 'Arial',
            fontSize: '40px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Interactivity
        playBtnBg.on('pointerover', () => {
            playBtnBg.clear();
            playBtnBg.fillStyle(0x444444, 1);
            playBtnBg.lineStyle(4, 0xffffff, 1);
            playBtnBg.fillRoundedRect(centerX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, btnRadius);
            playBtnBg.strokeRoundedRect(centerX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, btnRadius);
        });
        playBtnBg.on('pointerout', () => {
            playBtnBg.clear();
            playBtnBg.fillStyle(0x222222, 1);
            playBtnBg.lineStyle(4, 0x7fffd4, 1);
            playBtnBg.fillRoundedRect(centerX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, btnRadius);
            playBtnBg.strokeRoundedRect(centerX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, btnRadius);
        });
        playBtnBg.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}
