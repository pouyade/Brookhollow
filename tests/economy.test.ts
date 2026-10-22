import { beforeEach, describe, expect, it } from 'vitest';
import { ITEMS } from '../src/data/items';
import { endDay } from '../src/game/sim/day';
import { binValue, buy, isShopOpen, ship, shopGoods, unship } from '../src/game/sim/economy';
import { addItem, countItem, removeItem, spaceFor } from '../src/game/sim/inventory';
import { G, INV_SIZE } from '../src/game/sim/state';
import { dayIndex } from '../src/game/sim/time';
import { SHOPS } from '../src/data/shops';
import { freshFarm } from './helpers';

describe('inventory', () => {
  beforeEach(() => freshFarm());

  it('stacks up to the limit and reports overflow', () => {
    const free = G.inventory.filter((s) => !s).length;
    const left = addItem('turnip', 99 * free + 5);
    expect(left).toBe(5);
    expect(spaceFor('turnip')).toBe(0);
    expect(addItem('potato', 1)).toBe(1);
    expect(G.inventory).toHaveLength(INV_SIZE);
  });

  it('removes across stacks and refuses to over-remove', () => {
    addItem('turnip', 150);
    expect(removeItem('turnip', 151)).toBe(false);
    expect(removeItem('turnip', 120)).toBe(true);
    expect(countItem('turnip')).toBe(30);
  });
});

describe('shop', () => {
  beforeEach(() => {
    freshFarm();
    G.timeMin = 10 * 60; // Monday 10:00
  });

  it('respects opening hours and weekly closing day', () => {
    expect(isShopOpen(SHOPS.general)).toBe(true);
    G.timeMin = 8 * 60;
    expect(isShopOpen(SHOPS.general)).toBe(false);
    G.timeMin = 10 * 60;
    G.day = 3; // Wednesday
    expect(isShopOpen(SHOPS.general)).toBe(false);
  });

  it('only sells seeds for the current season', () => {
    const ids = shopGoods('general').map((g) => g.item);
    expect(ids).toContain('turnip_seeds');
    expect(ids).not.toContain('tomato_seeds');
    expect(buy('general', 'tomato_seeds', 1).ok).toBe(false);
  });

  it('charges the right price and needs enough gold', () => {
    const gold = G.gold;
    expect(buy('general', 'turnip_seeds', 2).ok).toBe(true);
    expect(G.gold).toBe(gold - 240);
    G.gold = 100;
    expect(buy('general', 'cabbage_seeds', 1).ok).toBe(false);
    expect(G.gold).toBe(100);
  });
});

describe('shipping', () => {
  beforeEach(() => freshFarm());

  it('pays the next morning at sell price', () => {
    addItem('turnip', 9);
    const slot = G.inventory.findIndex((s) => s?.id === 'turnip');
    expect(ship(slot, 9).ok).toBe(true);
    expect(binValue()).toBe(9 * ITEMS.turnip.sellPrice);
    const gold = G.gold;
    endDay(dayIndex(G));
    expect(G.gold).toBe(gold + 540);
    expect(G.morningReport?.total).toBe(540);
    expect(G.bin).toHaveLength(0);
    expect(G.stats.shipped.turnip).toBe(9);
  });

  it('refuses tools and can be undone before night', () => {
    expect(ship(0, 1).ok).toBe(false); // hoe
    addItem('potato', 3);
    const slot = G.inventory.findIndex((s) => s?.id === 'potato');
    ship(slot, 3);
    expect(countItem('potato')).toBe(0);
    expect(unship(0).ok).toBe(true);
    expect(countItem('potato')).toBe(3);
  });

  it('never pays twice for the same day', () => {
    addItem('turnip', 5);
    ship(G.inventory.findIndex((s) => s?.id === 'turnip'), 5);
    const gold = G.gold;
    const d = dayIndex(G);
    expect(endDay(d)).toBe(true);
    expect(endDay(d)).toBe(false); // replayed handler
    expect(G.gold).toBe(gold + 300);
    expect(G.day).toBe(2);
  });
});
