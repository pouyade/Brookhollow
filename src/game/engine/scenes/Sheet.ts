import Phaser from 'phaser';
import { SHEET, SHEET_COLS, SHEET_ROWS } from '../../rendering/kenney';

/** Dev tool (?sheet): the terrain sheet with column/row labels, for picking frame indices. */
export class SheetScene extends Phaser.Scene {
  constructor() {
    super('Sheet');
  }

  create() {
    const S = 20;
    for (let r = 0; r < SHEET_ROWS; r++) {
      this.add.text(0, 24 + r * S, String(r), { fontSize: '10px', color: '#ff0' });
      for (let c = 0; c < SHEET_COLS; c++) this.add.image(24 + c * S, 24 + r * S, SHEET, r * SHEET_COLS + c).setOrigin(0);
    }
    for (let c = 0; c < SHEET_COLS; c++) this.add.text(24 + c * S, 4, String(c), { fontSize: '9px', color: '#ff0' });
    const cam = this.cameras.main;
    cam.setZoom(2).setScroll(-cam.width / 4, -cam.height / 4);
    this.input.on('wheel', (_p: unknown, _o: unknown, dx: number, dy: number) => {
      cam.scrollX += dx / 2;
      cam.scrollY += dy / 2;
    });
  }
}
