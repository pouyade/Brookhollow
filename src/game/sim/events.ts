import EventEmitter from 'eventemitter3';

/**
 * Global event bus. The simulation emits; scenes and UI listen.
 * Payloads are documented next to each name.
 */
export const bus = new EventEmitter();

export const EV = {
  CHANGED: 'changed', // any state change the HUD should reflect
  MINUTE: 'minute', // clock ticked (timeMin)
  TOAST: 'toast', // string
  FARM: 'farm', // farm cells changed: string[] keys (or undefined for all)
  CROP_HARVESTED: 'crop-harvested', // { id, qty }
  ITEM_SHIPPED: 'item-shipped', // { id, qty }
  GIFT_GIVEN: 'gift-given', // { npc, item, reaction }
  FRIENDSHIP_MILESTONE: 'friendship-milestone', // { npc, hearts }
  DAY_STARTED: 'day-started', // { passedOut }
  SEASON_CHANGED: 'season-changed', // seasonIndex
  PASS_OUT: 'pass-out', // player collapsed (stamina or 2 AM)
  WARP: 'warp', // { map, x, y, facing }
  SFX: 'sfx', // sound name
} as const;

export function toast(msg: string) {
  bus.emit(EV.TOAST, msg);
}

export function changed() {
  bus.emit(EV.CHANGED);
}
