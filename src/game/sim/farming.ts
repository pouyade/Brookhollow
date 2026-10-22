import { CROPS, DAYS_PER_SEASON, SEASONS, daysToMature } from '../../data/crops';
import { t } from '../../i18n';
import { cropName, itemName, seasonName } from '../../i18n/data';
import type { CropDef } from '../../data/crops';
import { ITEMS } from '../../data/items';
import { getMap } from '../world/maps';
import { FIELD } from '../world/maps/farm';
import { idx, inBounds } from '../world/mapTypes';
import type { Facing } from '../world/mapTypes';
import { addItem, consumeSlot, spaceFor } from './inventory';
import { rngFor } from './rng';
import { CAN_CAPACITY, G, cellKey, ensureCell, getCell, pruneCell, season } from './state';
import type { DebrisType, FarmCell, ToolId } from './state';
import { STAMINA_COST_SEEDS, TOOLS, seedArea, toolArea } from './tools';

export interface ActionResult {
  ok: boolean;
  msg?: string;
  sfx?: string;
  /** farm cell keys that changed (for the renderer) */
  cells?: string[];
}

const fail = (msg: string): ActionResult => ({ ok: false, msg });

export const DEBRIS: Record<DebrisType, { tool: ToolId; tier: number; lumber?: number; stone?: number }> = {
  weed: { tool: 'sickle', tier: 0 },
  rock: { tool: 'hammer', tier: 0, stone: 1 },
  stump: { tool: 'axe', tier: 0, lumber: 2 },
  boulder: { tool: 'hammer', tier: 1, stone: 6 },
  bigstump: { tool: 'axe', tier: 1, lumber: 6 },
};

/** lower-case names for use inside sentences (a no-op for scripts without case) */
export const debrisName = (d: DebrisType) => t(`debris.${d}`).toLowerCase();
const toolWord = (id: ToolId) => itemName(id).toLowerCase();

export function cropDef(id: string): CropDef {
  return CROPS[id];
}

export function isMature(c: { id: string; stage: number; withered: boolean }): boolean {
  return !c.withered && c.stage >= CROPS[c.id].stages.length;
}

function isTillable(x: number, y: number) {
  const m = getMap('farm');
  return inBounds(m, x, y) && m.tillable[idx(m, x, y)] === 1;
}

/** cells that can be walked on: tilled soil and small crops are walkable, debris is not */
export function farmCellBlocks(x: number, y: number): boolean {
  const c = getCell(x, y);
  return !!c?.debris;
}

// ---------------------------------------------------------------- new game

/** scatter debris over the neglected field (seeded) */
export function generateDebris(seed: number) {
  const rand = rngFor(seed, 0xdeb);
  const { x, y, w, h } = FIELD;
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++) {
      // keep a small clear patch by the north gate so day one is approachable
      if (i >= 19 && i <= 24 && j <= y + 3) continue;
      const r = rand();
      const d: DebrisType | undefined =
        r < 0.2 ? 'weed' : r < 0.27 ? 'rock' : r < 0.31 ? 'stump' : r < 0.325 ? 'boulder' : r < 0.34 ? 'bigstump' : undefined;
      if (d) ensureCell(i, j).debris = d;
    }
}

// ---------------------------------------------------------------- tools

/**
 * Swing a tool at a tile on the current map. Stamina is only spent when the swing does
 * something, so the player is never charged for an invalid action.
 */
export function useTool(tool: ToolId, tx: number, ty: number, facing: Facing): ActionResult {
  const map = getMap(G.pos.map);
  // the watering can refills from any water tile on any map
  if (tool === 'can' && inBounds(map, tx, ty) && map.water[idx(map, tx, ty)]) {
    const cap = CAN_CAPACITY[G.tools.can];
    if (G.canWater >= cap) return fail(t('msg.canFull'));
    G.canWater = cap;
    return { ok: true, msg: t('msg.canRefilled'), sfx: 'refill' };
  }
  if (G.pos.map !== 'farm') return fail(t('msg.nothingHere'));

  const tier = G.tools[tool];
  const tiles = tool === 'hoe' || tool === 'can' ? toolArea(tier, tx, ty, facing) : [[tx, ty] as [number, number]];
  const cells: string[] = [];
  let firstFail: string | undefined;
  for (const [x, y] of tiles) {
    const r = applyTool(tool, x, y);
    if (r.ok) cells.push(cellKey(x, y));
    else if (!firstFail) firstFail = r.msg;
    if (tool === 'can' && G.canWater <= 0) break;
  }
  if (!cells.length) return fail(firstFail ?? t('msg.nothingHappens'));
  G.stamina = Math.max(0, G.stamina - TOOLS[tool].stamina);
  return { ok: true, cells, sfx: tool };
}

function applyTool(tool: ToolId, x: number, y: number): ActionResult {
  const cell = getCell(x, y);
  switch (tool) {
    case 'hoe': {
      if (!isTillable(x, y)) return fail(t('msg.tooHard'));
      if (cell?.debris) return fail(t('msg.clearFirst', { debris: debrisName(cell.debris) }));
      if (cell?.crop) return fail(t('msg.somethingGrowing'));
      if (cell?.tilled) return fail(t('msg.alreadyTilled'));
      const c = ensureCell(x, y);
      c.tilled = true;
      return { ok: true };
    }
    case 'can': {
      if (G.canWater <= 0) return fail(t('msg.canEmpty'));
      if (!cell?.tilled) return fail(t('msg.waterSoil'));
      cell.watered = true;
      G.canWater--;
      return { ok: true };
    }
    case 'sickle': {
      if (cell?.debris === 'weed') return clearDebris(cell, x, y);
      if (cell?.crop?.withered) {
        delete cell.crop;
        return { ok: true };
      }
      if (cell?.crop) return fail(isMature(cell.crop) ? t('msg.harvestByHand') : t('msg.stillGrowing'));
      return fail(t('msg.nothingToCut'));
    }
    case 'axe':
    case 'hammer': {
      if (cell?.debris) {
        const d = DEBRIS[cell.debris];
        const name = debrisName(cell.debris);
        if (d.tool !== tool) return fail(t('msg.useToolOn', { tool: toolWord(d.tool), debris: name }));
        if (G.tools[tool] < d.tier) return fail(t('msg.needsUpgrade', { debris: name, tool: toolWord(tool) }));
        return clearDebris(cell, x, y);
      }
      if (tool === 'hammer' && cell?.tilled && !cell.crop) {
        cell.tilled = false;
        cell.watered = false;
        pruneCell(x, y);
        return { ok: true };
      }
      return fail(t('msg.nothingToBreak'));
    }
  }
}

function clearDebris(cell: FarmCell, x: number, y: number): ActionResult {
  const d = DEBRIS[cell.debris!];
  G.materials.lumber += d.lumber ?? 0;
  G.materials.stone += d.stone ?? 0;
  delete cell.debris;
  G.stats.debrisCleared++;
  pruneCell(x, y);
  return { ok: true };
}

// ---------------------------------------------------------------- planting & harvest

export function canGrowNow(c: CropDef): boolean {
  return c.season === season();
}

/** sow the selected seed bag over a 3x3 patch of tilled, empty soil */
export function plant(slot: number, tx: number, ty: number): ActionResult {
  if (G.pos.map !== 'farm') return fail(t('msg.seedsNeedFarm'));
  const s = G.inventory[slot];
  const item = s && ITEMS[s.id];
  if (!item || item.kind !== 'seed' || !item.cropId) return fail(t('msg.selectSeeds'));
  const def = CROPS[item.cropId];
  if (!canGrowNow(def)) return fail(t('msg.wrongSeason', { crop: cropName(def.id), season: seasonName(def.season) }));
  const cells: string[] = [];
  for (const [x, y] of seedArea(tx, ty)) {
    const c = getCell(x, y);
    if (!c?.tilled || c.crop || c.debris) continue;
    c.crop = { id: def.id, stage: 0, daysInStage: 0, withered: false, regrowing: false };
    cells.push(cellKey(x, y));
  }
  if (!cells.length) return fail(t('msg.tillFirst'));
  consumeSlot(1, slot);
  G.stats.planted += cells.length;
  G.stamina = Math.max(0, G.stamina - STAMINA_COST_SEEDS);
  const left = DAYS_PER_SEASON - G.day;
  const msg = daysToMature(def) > left ? t('msg.mayNotMature', { crop: cropName(def.id) }) : undefined;
  return { ok: true, cells, sfx: 'seeds', msg };
}

export function harvest(x: number, y: number): ActionResult & { item?: string; qty?: number } {
  const cell = getCell(x, y);
  const crop = cell?.crop;
  if (!crop) return fail('');
  if (crop.withered) return fail(t('msg.withered'));
  if (!isMature(crop)) return fail(t('msg.notReady', { crop: cropName(crop.id).toLowerCase() }));
  const def = CROPS[crop.id];
  if (spaceFor(def.id) < def.harvestQty) return fail(t('msg.bagFull'));
  addItem(def.id, def.harvestQty);
  G.stats.harvested[def.id] = (G.stats.harvested[def.id] ?? 0) + def.harvestQty;
  if (def.regrow) {
    crop.stage = def.stages.length - 1;
    crop.daysInStage = 0;
    crop.regrowing = true;
  } else {
    delete cell!.crop;
  }
  return { ok: true, cells: [cellKey(x, y)], sfx: 'harvest', item: def.id, qty: def.harvestQty };
}

// ---------------------------------------------------------------- overnight

function stageNeed(def: CropDef, crop: { stage: number; regrowing: boolean }) {
  if (crop.regrowing && crop.stage === def.stages.length - 1 && def.regrow) return def.regrow;
  return def.stages[crop.stage];
}

/** advance every watered crop by one day, then dry the soil */
export function growCrops() {
  for (const cell of Object.values(G.farm)) {
    const crop = cell.crop;
    if (crop && !crop.withered && cell.watered) {
      const def = CROPS[crop.id];
      if (crop.stage < def.stages.length) {
        crop.daysInStage++;
        if (crop.daysInStage >= stageNeed(def, crop)) {
          crop.stage++;
          crop.daysInStage = 0;
        }
      }
    }
    cell.watered = false;
  }
}

/** called after the calendar rolls into a new season */
export function onSeasonChange(seed: number, dayIdx: number): number {
  const s = SEASONS[G.seasonIndex];
  let withered = 0;
  for (const cell of Object.values(G.farm)) {
    if (cell.crop && !cell.crop.withered && CROPS[cell.crop.id].season !== s) {
      cell.crop.withered = true;
      withered++;
    }
  }
  // a handful of weeds creep back onto untouched field ground
  const rand = rngFor(seed, dayIdx * 7 + 0x77);
  const { x, y, w, h } = FIELD;
  for (let n = 0; n < 25; n++) {
    const i = x + Math.floor(rand() * w), j = y + Math.floor(rand() * h);
    const c = getCell(i, j);
    if (!c) ensureCell(i, j).debris = 'weed';
  }
  return withered;
}

/** rain and storms water every tilled tile on the farm */
export function rainWater() {
  for (const cell of Object.values(G.farm)) if (cell.tilled) cell.watered = true;
}
