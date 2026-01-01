import * as Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import StartScene from './scenes/StartScene';

new Phaser.Game({
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: [StartScene, GameScene],
    dom: {
        createContainer: true
    }
});
