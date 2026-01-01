import * as Phaser from 'phaser';

export class SoundManager {
    private scene: Phaser.Scene;
    private reelSpinSound?: Phaser.Sound.BaseSound;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    playReelStop() {
        this.scene.sound.play('reel_stop', { volume: 0.5 });
    }

    playBackgroundMusic() {
        if (!this.scene.sound.get('bg_music')) {
            const bgMusic = this.scene.sound.add('bg_music', { loop: true, volume: 0.5 });
            bgMusic.play();
        } else {
            const bgMusic = this.scene.sound.get('bg_music');
            if (!bgMusic.isPlaying) {
                bgMusic.play();
            }
        }
    }

    playReelSpin() {
        if (!this.reelSpinSound || !this.reelSpinSound.isPlaying) {
            this.reelSpinSound = this.scene.sound.add('reel_spin', { loop: true, volume: 0.7 });
            this.reelSpinSound.play();
        }
    }

    stopReelSpin() {
        if (this.reelSpinSound && this.reelSpinSound.isPlaying) {
            this.reelSpinSound.stop();
        }
    }
}
