import Phaser from 'phaser';
import { buildGenSheet } from '../../rendering/generate';
import { CHARS, GEN, SHEET } from '../../rendering/kenney';

const BASE = import.meta.env.BASE_URL;

/** Loads the Kenney sheets and paints the generated 'gen' sheet, then starts the world. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    const opts = { frameWidth: 16, frameHeight: 16, spacing: 1 };
    this.load.spritesheet(SHEET, `${BASE}assets/kenney/roguelikeSheet_transparent.png`, opts);
    this.load.spritesheet(CHARS, `${BASE}assets/kenney/roguelikeChar_transparent.png`, opts);
  }

  create() {
    const sheet = buildGenSheet();
    const tex = this.textures.createCanvas(GEN, sheet.width, sheet.height)!;
    sheet.draw(tex.getContext());
    for (const f of sheet.frames) tex.add(f.name, 0, f.x, f.y, 16, 16);
    tex.refresh();

    // 1px white texture for weather particles
    const g = this.make.graphics({}, false);
    g.fillStyle(0xffffff).fillRect(0, 0, 1, 1);
    g.generateTexture('px', 1, 1);
    g.destroy();

    const params = new URLSearchParams(location.search);
    this.scene.start(params.has('sheet') ? 'Sheet' : 'World');
  }
}
