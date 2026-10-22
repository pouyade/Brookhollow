import Phaser from 'phaser';

// Global event bus for scene <-> UI communication
export const bus = new Phaser.Events.EventEmitter();

export const EV = {
  HUD: 'hud', // refresh HUD
  DIALOGUE: 'dialogue', // { name, frame, lines: string[], hearts? }
  TOAST: 'toast', // string
  SHOP: 'shop', // shopId
  SUMMARY: 'summary', // { items: {name, qty, gold}[], total, day-info }
  SUMMARY_CLOSED: 'summary-closed',
  SLEEP: 'sleep', // { penalty: boolean }
  MINUTE: 'minute',
} as const;
