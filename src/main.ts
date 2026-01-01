import * as Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import StartScene from './scenes/StartScene';
import { SpinePlugin } from '@esotericsoftware/spine-phaser';

new Phaser.Game({
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: [StartScene, GameScene],
    plugins: {
        scene: [
            { key: 'SpinePlugin', plugin: SpinePlugin, mapping: 'spine' }
        ]
    },
    dom: {
        createContainer: true
    }
});
