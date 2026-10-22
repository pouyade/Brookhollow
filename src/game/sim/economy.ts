import { ITEMS } from '../../data/items';
import { SHOPS } from '../../data/shops';
import type { ShopDef, ShopGood } from '../../data/shops';
import type { ActionResult } from './farming';
import { addItem, consumeSlot, spaceFor } from './inventory';
import { G, season } from './state';
import type { ShipLine } from './state';
import { weekday } from './time';
import { t } from '../../i18n';
import { itemName, shopName } from '../../i18n/data';

const fail = (msg: string): ActionResult => ({ ok: false, msg });

export function isShopOpen(shop: ShopDef, timeMin = G.timeMin): boolean {
  if (shop.closedWeekdays.includes(weekday(G))) return false;
  return timeMin >= shop.hours[0] && timeMin < shop.hours[1];
}

/** goods currently on sale (seasonal seeds are filtered by the current season) */
export function shopGoods(shopId: string): ShopGood[] {
  const s = season();
  return SHOPS[shopId].goods.filter((g) => !g.season || g.season === s);
}

export function buy(shopId: string, itemId: string, qty: number): ActionResult {
  const shop = SHOPS[shopId];
  if (!isShopOpen(shop)) return fail(t('msg.shopClosed', { shop: shopName(shop.id) }));
  const good = shopGoods(shopId).find((g) => g.item === itemId);
  if (!good) return fail(t('msg.notSold'));
  if (qty <= 0) return fail('');
  const cost = good.price * qty;
  if (G.gold < cost) return fail(t('msg.noGold'));
  if (spaceFor(itemId) < qty) return fail(t('msg.noRoom'));
  G.gold -= cost;
  addItem(itemId, qty);
  return { ok: true, msg: t('msg.bought', { qty, item: itemName(itemId), cost }), sfx: 'coin' };
}

export function canShip(id: string): boolean {
  return (ITEMS[id]?.sellPrice ?? 0) > 0;
}

/** move items from an inventory slot into the shipping bin */
export function ship(slot: number, qty: number): ActionResult {
  const s = G.inventory[slot];
  if (!s) return fail('');
  if (!canShip(s.id)) return fail(t('msg.cantShip', { item: itemName(s.id) }));
  const n = Math.min(qty, s.qty);
  const id = s.id;
  consumeSlot(n, slot);
  const existing = G.bin.find((b) => b.id === id);
  if (existing) existing.qty += n;
  else G.bin.push({ id, qty: n });
  return { ok: true, sfx: 'ship' };
}

/** take items back out of the bin before the day ends */
export function unship(binIndex: number): ActionResult {
  const b = G.bin[binIndex];
  if (!b) return fail('');
  const left = addItem(b.id, b.qty);
  if (left === b.qty) return fail(t('msg.bagFull'));
  b.qty = left;
  if (b.qty <= 0) G.bin.splice(binIndex, 1);
  return { ok: true };
}

export function binValue(): number {
  return G.bin.reduce((n, b) => n + ITEMS[b.id].sellPrice * b.qty, 0);
}

/** pays out the bin; called once per night from the day transition */
export function processShipping(): { lines: ShipLine[]; total: number } {
  const lines: ShipLine[] = G.bin.map((b) => ({ id: b.id, qty: b.qty, gold: ITEMS[b.id].sellPrice * b.qty }));
  const total = lines.reduce((n, l) => n + l.gold, 0);
  for (const l of lines) G.stats.shipped[l.id] = (G.stats.shipped[l.id] ?? 0) + l.qty;
  G.gold += total;
  G.stats.goldEarned += total;
  G.bin = [];
  return { lines, total };
}
