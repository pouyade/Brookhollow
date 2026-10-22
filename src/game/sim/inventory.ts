import { ITEMS } from '../../data/items';
import { G } from './state';
import type { InvSlot } from './state';

/** how many of `id` would fit right now */
export function spaceFor(id: string): number {
  const def = ITEMS[id];
  let n = 0;
  for (const s of G.inventory) {
    if (!s) n += def.stack;
    else if (s.id === id) n += def.stack - s.qty;
  }
  return n;
}

/** add qty of item; returns the amount that did NOT fit */
export function addItem(id: string, qty: number): number {
  const def = ITEMS[id];
  let left = qty;
  for (const slot of G.inventory) {
    if (left <= 0) break;
    if (slot && slot.id === id && slot.qty < def.stack) {
      const take = Math.min(def.stack - slot.qty, left);
      slot.qty += take;
      left -= take;
    }
  }
  for (let i = 0; i < G.inventory.length && left > 0; i++) {
    if (!G.inventory[i]) {
      const take = Math.min(def.stack, left);
      G.inventory[i] = { id, qty: take };
      left -= take;
    }
  }
  return left;
}

export function countItem(id: string): number {
  return G.inventory.reduce((n, s) => n + (s && s.id === id ? s.qty : 0), 0);
}

export function removeItem(id: string, qty: number): boolean {
  if (countItem(id) < qty) return false;
  let left = qty;
  for (let i = 0; i < G.inventory.length && left > 0; i++) {
    const s = G.inventory[i];
    if (s && s.id === id) {
      const take = Math.min(s.qty, left);
      s.qty -= take;
      left -= take;
      if (s.qty <= 0) G.inventory[i] = null;
    }
  }
  return true;
}

export function selectedSlot(): InvSlot | null {
  return G.inventory[G.selected] ?? null;
}

/** remove n from a slot (defaults to the selected one) */
export function consumeSlot(n = 1, slot = G.selected) {
  const s = G.inventory[slot];
  if (!s) return;
  s.qty -= n;
  if (s.qty <= 0) G.inventory[slot] = null;
}

/** swap two inventory slots (drag & drop / reorganising) */
export function swapSlots(a: number, b: number) {
  const tmp = G.inventory[a];
  G.inventory[a] = G.inventory[b];
  G.inventory[b] = tmp;
}
