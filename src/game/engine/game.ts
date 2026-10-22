import Phaser from 'phaser';
import { BootScene } from './scenes/Boot';
import { SheetScene } from './scenes/Sheet';
import { WorldScene } from './scenes/World';

/** Creates the Phaser game inside `parent`. Keyboard input is handled by our own router. */
export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.WEBGL,
    parent,
    backgroundColor: '#1a1c24',
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth, height: parent.clientHeight },
    input: { keyboard: false },
    audio: { noAudio: true },
    banner: false,
    scene: [BootScene, WorldScene, SheetScene],
  });
}
