import * as Phaser from 'phaser';


export class RightPanelView {
    private scene: Phaser.Scene;
    private buttonGroup: Phaser.GameObjects.Group;
    private onSpinCallback?: () => void;

    constructor(scene: Phaser.Scene, onSpinCallback?: () => void) {
        this.scene = scene;
        this.buttonGroup = this.scene.add.group();
        this.onSpinCallback = onSpinCallback;
        this.createPanel();
    }

    private createPanel() {
        const GAME_WIDTH = this.scene.sys.game.config.width as number;
        const turboBtnWidth = 22,
            turboBtnHeight = 24;
        const spinBtnWidth = 150,
            spinBtnHeight = 150;
        const autoplayBtnWidth = 28,
            autoplayBtnHeight = 28;
        const infoBtnWidth = 12,
            infoBtnHeight = 18;
        const btnCirclePadding = 14;

        const controllerButtonAssets = [
            {
                key: 'Turbo',
                width: turboBtnWidth,
                height: turboBtnHeight,
            },
            {
                key: 'Spin',
                width: spinBtnWidth,
                height: spinBtnHeight,
            },
            {
                key: 'Autoplay',
                width: autoplayBtnWidth,
                height: autoplayBtnHeight,
            },
            {
                key: 'Info',
                width: infoBtnWidth,
                height: infoBtnHeight,
            },
        ];
        const rightAreaX = GAME_WIDTH - 200;
        const turboY = 180;
        const spinY = turboY + turboBtnHeight / 2 + spinBtnHeight / 2 + 22;
        const autoplayY = spinY + spinBtnHeight / 2 + autoplayBtnHeight / 2 + 22;
        const infoY = autoplayY + autoplayBtnHeight / 2 + infoBtnHeight / 2 + 50;
        const buttonYs = [turboY, spinY, autoplayY, infoY];

        for (let i = 0; i < controllerButtonAssets.length; i++) {
            const { key, width, height } = controllerButtonAssets[i];
            const y = buttonYs[i];
            let mainContainerRadius;
            if (key !== 'Spin') {
                const darkCircleRadius = Math.max(width, height) / 2 + btnCirclePadding;
                const circle = this.scene.add.graphics();
                circle.fillStyle(0x000000, 0.6);
                circle.fillCircle(rightAreaX, y, darkCircleRadius);
                circle.setDepth(99);
                this.buttonGroup.add(circle);
                mainContainerRadius = darkCircleRadius + 8;
            } else {
                mainContainerRadius = Math.max(width, height) / 2 + 8;
            }
            const mainContainerCircle = this.scene.add.graphics();
            mainContainerCircle.fillStyle(0x888888, 0.4);
            mainContainerCircle.fillCircle(rightAreaX, y, mainContainerRadius);
            mainContainerCircle.setDepth(97);
            this.buttonGroup.add(mainContainerCircle);

            const btn = this.scene.add
                .image(rightAreaX, y, key)
                .setDisplaySize(width, height)
                .setDepth(100);
            btn.setInteractive({ useHandCursor: true });
            if (key === 'Spin' && this.onSpinCallback) {
                btn.on('pointerdown', () => {
                    console.log('[RightPanelView] Spin button pressed');
                    this.onSpinCallback && this.onSpinCallback();
                });
            }
            this.buttonGroup.add(btn);
        }
    }

    public setVisible(visible: boolean) {
        this.buttonGroup.setVisible(visible);
    }
}
