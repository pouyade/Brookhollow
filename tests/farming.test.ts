import { beforeEach, describe, expect, it } from 'vitest';
import { CROPS, daysToMature } from '../src/data/crops';
import { endDay } from '../src/game/sim/day';
import { harvest, plant, useTool } from '../src/game/sim/farming';
import { countItem } from '../src/game/sim/inventory';
import { G, getCell } from '../src/game/sim/state';
import { dayIndex } from '../src/game/sim/time';
import { freshFarm } from './helpers';

const seedSlot = () => G.inventory.findIndex((s) => s?.id === 'turnip_seeds');

function sleep() {
  G.pos = { map: 'farm', x: 20, y: 20, facing: 'down' };
  // keep the weather deterministic for growth tests
  G.tomorrowWeather = 'sun';
  expect(endDay(dayIndex(G))).toBe(true);
  G.pos = { map: 'farm', x: 20, y: 20, facing: 'down' };
}

function tillPatch(cx: number, cy: number) {
  for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) useTool('hoe', x, y, 'down');
}

function waterPatch(cx: number, cy: number) {
  G.canWater = 99;
  for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) useTool('can', x, y, 'down');
}

describe('farming', () => {
  beforeEach(() => freshFarm());

  it('tills only inside the field and never over debris', () => {
    expect(useTool('hoe', 20, 20, 'down').ok).toBe(true);
    expect(getCell(20, 20)?.tilled).toBe(true);
    expect(useTool('hoe', 2, 2, 'down').ok).toBe(false); // outside the field
    G.farm['21,20'] = { tilled: false, watered: false, debris: 'rock' };
    expect(useTool('hoe', 21, 20, 'down').ok).toBe(false);
  });

  it('spends stamina only on successful actions', () => {
    const s = G.stamina;
    useTool('hoe', 2, 2, 'down');
    expect(G.stamina).toBe(s);
    useTool('hoe', 20, 20, 'down');
    expect(G.stamina).toBe(s - 2);
  });

  it('clears debris with the right tool and yields materials', () => {
    G.farm['20,20'] = { tilled: false, watered: false, debris: 'stump' };
    expect(useTool('hammer', 20, 20, 'down').ok).toBe(false);
    expect(useTool('axe', 20, 20, 'down').ok).toBe(true);
    expect(G.materials.lumber).toBe(2);
    G.farm['21,20'] = { tilled: false, watered: false, debris: 'boulder' };
    expect(useTool('hammer', 21, 20, 'down').ok).toBe(false); // needs an upgrade
  });

  it('plants a 3x3 patch and consumes one bag', () => {
    tillPatch(20, 20);
    const before = countItem('turnip_seeds');
    const r = plant(seedSlot(), 20, 20);
    expect(r.ok).toBe(true);
    expect(r.cells).toHaveLength(9);
    expect(countItem('turnip_seeds')).toBe(before - 1);
    expect(plant(seedSlot(), 30, 30).ok).toBe(false); // untilled
  });

  it('grows only on watered days and harvests when mature', () => {
    tillPatch(20, 20);
    plant(seedSlot(), 20, 20);
    // an unwatered night does nothing
    sleep();
    expect(getCell(20, 20)!.crop!.stage).toBe(0);
    const need = daysToMature(CROPS.turnip);
    for (let d = 0; d < need; d++) {
      expect(harvest(20, 20).ok).toBe(false);
      waterPatch(20, 20);
      sleep();
    }
    const r = harvest(20, 20);
    expect(r.ok).toBe(true);
    expect(countItem('turnip')).toBe(1);
    expect(getCell(20, 20)!.crop).toBeUndefined();
    expect(getCell(20, 20)!.tilled).toBe(true);
  });

  it('regrowing crops return to the last stage after harvest', () => {
    G.seasonIndex = 0;
    const c = { id: 'strawberry', stage: CROPS.strawberry.stages.length, daysInStage: 0, withered: false, regrowing: false };
    G.farm['20,20'] = { tilled: true, watered: false, crop: c };
    expect(harvest(20, 20).ok).toBe(true);
    const crop = getCell(20, 20)!.crop!;
    expect(crop.stage).toBe(CROPS.strawberry.stages.length - 1);
    for (let d = 0; d < CROPS.strawberry.regrow!; d++) {
      waterPatch(20, 20);
      sleep();
    }
    expect(harvest(20, 20).ok).toBe(true);
  });

  it('rain waters tilled soil overnight', () => {
    useTool('hoe', 20, 20, 'down');
    G.tomorrowWeather = 'rain';
    endDay(dayIndex(G));
    expect(G.weather).toBe('rain');
    expect(getCell(20, 20)!.watered).toBe(true);
  });

  it('the can refills at water and runs dry', () => {
    G.canWater = 1;
    useTool('hoe', 20, 20, 'down');
    useTool('hoe', 21, 20, 'down');
    expect(useTool('can', 20, 20, 'down').ok).toBe(true);
    expect(useTool('can', 21, 20, 'down').ok).toBe(false);
    // pond tile on the farm map
    expect(useTool('can', 33, 5, 'down').ok).toBe(true);
    expect(G.canWater).toBeGreaterThan(1);
  });
});

describe('seasons', () => {
  beforeEach(() => freshFarm());

  it('rejects out-of-season seeds', () => {
    useTool('hoe', 20, 20, 'down');
    G.inventory[6] = { id: 'tomato_seeds', qty: 1 };
    const r = plant(6, 20, 20);
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/summer/i);
  });

  it('withers out-of-season crops when the season changes', () => {
    G.day = 30;
    G.farm['20,20'] = { tilled: true, watered: true, crop: { id: 'turnip', stage: 1, daysInStage: 0, withered: false, regrowing: false } };
    endDay(dayIndex(G));
    expect(G.seasonIndex).toBe(1);
    expect(G.day).toBe(1);
    expect(getCell(20, 20)!.crop!.withered).toBe(true);
    G.pos.map = 'farm'; // the player wakes up in the house
    expect(useTool('sickle', 20, 20, 'down').ok).toBe(true);
    expect(getCell(20, 20)?.crop).toBeUndefined();
  });

  it('rolls over to a new year after winter', () => {
    G.day = 30;
    G.seasonIndex = 3;
    endDay(dayIndex(G));
    expect(G.year).toBe(2);
    expect(G.seasonIndex).toBe(0);
    expect(G.day).toBe(1);
  });
});
