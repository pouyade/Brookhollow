import { beforeEach, describe, expect, it } from 'vitest';
import { FRIENDSHIP } from '../src/data/npcs';
import { load, save, deserialize, serialize, slotSummary } from '../src/game/save/save';
import { endDay, newGame } from '../src/game/sim/day';
import { addItem } from '../src/game/sim/inventory';
import { gift, talk } from '../src/game/sim/social';
import { G, defaultPlayer, npcState } from '../src/game/sim/state';
import { dayIndex, fromDayIndex, weekday } from '../src/game/sim/time';
import { rollWeather } from '../src/game/sim/weather';
import { getMap } from '../src/game/world/maps';
import { idx } from '../src/game/world/mapTypes';
import { freshFarm, mockStorage } from './helpers';

describe('calendar', () => {
  it('converts day indices both ways', () => {
    for (const i of [0, 29, 30, 119, 120, 359, 360]) expect(dayIndex(fromDayIndex(i))).toBe(i);
    expect(fromDayIndex(120)).toEqual({ year: 2, seasonIndex: 0, day: 1 });
    expect(weekday({ year: 1, seasonIndex: 0, day: 1 })).toBe(0);
    expect(weekday({ year: 1, seasonIndex: 0, day: 8 })).toBe(0);
  });

  it('weather is deterministic per seed and day', () => {
    const a = Array.from({ length: 30 }, (_, d) => rollWeather(7, d, 'spring', d + 1));
    const b = Array.from({ length: 30 }, (_, d) => rollWeather(7, d, 'spring', d + 1));
    expect(a).toEqual(b);
    expect(a[0]).toBe('sun');
    expect(new Set(a).size).toBeGreaterThan(1);
    expect(Array.from({ length: 30 }, (_, d) => rollWeather(7, d, 'winter', d + 1))).not.toContain('rain');
  });
});

describe('relationships', () => {
  beforeEach(() => freshFarm());

  it('first talk each day raises friendship once', () => {
    talk('wren');
    talk('wren');
    expect(npcState('wren').friendship).toBe(FRIENDSHIP.talk);
    endDay(dayIndex(G));
    talk('wren');
    expect(npcState('wren').friendship).toBe(FRIENDSHIP.talk * 2);
  });

  it('gift reactions follow preferences and are limited to one per day', () => {
    addItem('dawnbell', 2);
    const slot = G.inventory.findIndex((s) => s?.id === 'dawnbell');
    const r = gift('wren', slot);
    expect(r.ok && r.reaction).toBe('loved');
    expect(npcState('wren').friendship).toBe(FRIENDSHIP.loved);
    expect(gift('wren', slot).ok).toBe(false);
    expect(gift('wren', 0).ok).toBe(false); // tools aren't gifts
  });

  it('birthdays multiply positive gifts', () => {
    G.seasonIndex = 1;
    G.day = 19; // Wren's birthday
    addItem('turnip', 1);
    gift('wren', G.inventory.findIndex((s) => s?.id === 'turnip'));
    expect(npcState('wren').friendship).toBe(FRIENDSHIP.liked * FRIENDSHIP.birthdayMultiplier);
  });
});

describe('save / load', () => {
  beforeEach(() => mockStorage());

  it('round-trips the full state', () => {
    freshFarm(99);
    addItem('turnip', 7);
    G.farm['20,20'] = { tilled: true, watered: true, crop: { id: 'turnip', stage: 2, daysInStage: 1, withered: false, regrowing: false } };
    talk('nell');
    const snapshot = JSON.parse(JSON.stringify(G));
    expect(save(2)).toBe(true);
    newGame(defaultPlayer(), 1);
    expect(load(2).ok).toBe(true);
    expect(JSON.parse(JSON.stringify(G))).toEqual(snapshot);
    expect(slotSummary(2)?.name).toBe('Sam');
  });

  it('recovers from a corrupted save using the backup', () => {
    freshFarm();
    G.gold = 1234;
    save(1);
    G.gold = 999;
    save(1); // previous write becomes the backup
    localStorage.setItem('hmbtn-slot-1', '{not json');
    const r = load(1);
    expect(r.ok).toBe(true);
    expect(r.recovered).toBe(true);
    expect(G.gold).toBe(1234);
  });

  it('fills fields missing from older saves', () => {
    freshFarm();
    const env = JSON.parse(serialize(G));
    delete env.data.materials;
    delete env.data.stats;
    const s = deserialize(JSON.stringify(env));
    expect(s.materials).toEqual({ lumber: 0, stone: 0 });
    expect(s.stats.daysPlayed).toBe(0);
    expect(() => deserialize(JSON.stringify({ ...env, data: { ...env.data, day: 99 } }))).toThrow();
  });
});

describe('maps', () => {
  it('every warp lands on a walkable tile of an existing map', () => {
    for (const id of ['farm', 'house', 'town', 'store'] as const) {
      for (const w of getMap(id).warps) {
        const dest = getMap(w.to);
        expect(dest.solid[idx(dest, w.tx, w.ty)], `${id} -> ${w.to} (${w.tx},${w.ty})`).toBe(0);
      }
    }
  });

  it('new game scatters debris but keeps the gate clear', () => {
    newGame(defaultPlayer(), 5);
    const debris = Object.values(G.farm).filter((c) => c.debris).length;
    expect(debris).toBeGreaterThan(100);
    expect(G.farm['21,14']?.debris).toBeUndefined();
  });
});
