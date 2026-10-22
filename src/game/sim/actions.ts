/**
 * The public command API. Scenes and UI components call these; they validate, mutate
 * GameState, and announce what changed on the bus. Nothing else should write to G.
 */
import { ITEMS } from '../../data/items';
import { LETTERS } from '../../data/letters';
import { NPCS } from '../../data/npcs';
import { save } from '../save/save';
import type { Facing, MapId } from '../world/mapTypes';
import { endDay } from './day';
import * as economy from './economy';
import { EV, bus, changed, toast } from './events';
import * as farming from './farming';
import type { ActionResult } from './farming';
import { consumeSlot, swapSlots } from './inventory';
import * as social from './social';
import { G, HOTBAR_SIZE } from './state';
import { TIME, dayIndex } from './time';
import { isToolId } from './tools';
import { t } from '../../i18n';
import { itemName, npcText } from '../../i18n/data';

/** stamina thresholds for warnings and the exhausted movement penalty */
export const STAMINA = { tired: 30, exhausted: 10 };

function report(r: ActionResult): ActionResult {
  if (r.msg) toast(r.msg);
  if (r.sfx) bus.emit(EV.SFX, r.sfx);
  if (r.cells?.length) bus.emit(EV.FARM, r.cells);
  changed();
  return r;
}

let lastWarned = 100;
function staminaCheck(before: number) {
  const s = G.stamina;
  if (s <= 0) {
    bus.emit(EV.PASS_OUT);
    return;
  }
  if (before > STAMINA.exhausted && s <= STAMINA.exhausted && lastWarned > STAMINA.exhausted) {
    toast(t('msg.exhausted'));
    lastWarned = s;
  } else if (before > STAMINA.tired && s <= STAMINA.tired && lastWarned > STAMINA.tired) {
    toast(t('msg.tired'));
    lastWarned = s;
  }
}

// ---------------------------------------------------------------- selection

export function select(i: number) {
  G.selected = ((i % HOTBAR_SIZE) + HOTBAR_SIZE) % HOTBAR_SIZE;
  changed();
}

export function cycleSelected(dir = 1) {
  select(G.selected + dir);
}

export function swapInventory(a: number, b: number) {
  swapSlots(a, b);
  changed();
}

// ---------------------------------------------------------------- world actions

/** Space: use whatever is selected on the target tile */
export function useSelected(tx: number, ty: number, facing: Facing): ActionResult {
  const slot = G.inventory[G.selected];
  if (!slot) return report({ ok: false });
  const before = G.stamina;
  let r: ActionResult;
  if (isToolId(slot.id)) r = farming.useTool(slot.id, tx, ty, facing);
  else if (ITEMS[slot.id].kind === 'seed') r = farming.plant(G.selected, tx, ty);
  else r = { ok: false, msg: ITEMS[slot.id].energy ? t('msg.openBagToEat') : undefined };
  report(r);
  if (r.ok) staminaCheck(before);
  return r;
}

export function harvest(x: number, y: number) {
  const r = farming.harvest(x, y);
  report(r);
  if (r.ok) bus.emit(EV.CROP_HARVESTED, { id: r.item, qty: r.qty });
  return r;
}

export function eat(slot: number): ActionResult {
  const s = G.inventory[slot];
  const def = s && ITEMS[s.id];
  if (!def?.energy) return report({ ok: false, msg: t('msg.cantEat') });
  if (G.stamina >= G.maxStamina) return report({ ok: false, msg: t('msg.notHungry') });
  G.stamina = Math.min(G.maxStamina, G.stamina + def.energy);
  if (G.stamina > STAMINA.tired) lastWarned = 100;
  consumeSlot(1, slot);
  return report({ ok: true, msg: t('msg.ate', { item: itemName(def.id).toLowerCase(), n: def.energy }), sfx: 'eat' });
}

// ---------------------------------------------------------------- economy

export const buy = (shop: string, item: string, qty: number) => report(economy.buy(shop, item, qty));
export const ship = (slot: number, qty: number) => {
  const id = G.inventory[slot]?.id;
  const r = report(economy.ship(slot, qty));
  if (r.ok) bus.emit(EV.ITEM_SHIPPED, { id, qty });
  return r;
};
export const unship = (i: number) => report(economy.unship(i));

// ---------------------------------------------------------------- social

export function talk(npc: string): string[] {
  const lines = social.talk(npc);
  changed();
  return lines;
}

export function gift(npc: string, slot = G.selected) {
  return report(social.gift(npc, slot));
}

export function npcName(id: string) {
  return NPCS[id] ? npcText(id, 'name') : id;
}

// ---------------------------------------------------------------- mail

/** take the oldest unread letter out of the mailbox; returns its id */
export function readMail(): string | null {
  const id = G.mail.shift();
  if (!id) return null;
  G.readMail.push(id);
  changed();
  return LETTERS[id] ? id : null;
}

// ---------------------------------------------------------------- time & movement

export function setPosition(map: MapId, x: number, y: number, facing: Facing) {
  const mapChanged = G.pos.map !== map;
  G.pos = { map, x, y, facing };
  if (mapChanged) changed();
}

/** advance the clock by one minute; returns true if the player must collapse */
export function tickMinute(): boolean {
  G.timeMin++;
  bus.emit(EV.MINUTE, G.timeMin);
  if (G.timeMin % 10 === 0) changed();
  if (G.timeMin >= TIME.passOut) {
    bus.emit(EV.PASS_OUT);
    return true;
  }
  return false;
}

/** sleep (or collapse) and run the overnight transition, then autosave */
export function sleep(passedOut = false): boolean {
  const ok = endDay(dayIndex(G), { passedOut });
  lastWarned = 100;
  if (ok) save();
  changed();
  bus.emit(EV.FARM);
  return ok;
}

export function saveGame(): boolean {
  const ok = save();
  toast(ok ? t('msg.saved') : t('msg.saveFailed'));
  return ok;
}
