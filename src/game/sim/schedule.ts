import type { NpcDef } from '../../data/npcs';
import type { Facing } from '../world/mapTypes';

/** walking speed in tiles per game minute */
export const NPC_SPEED = 1.2;

export interface NpcPose {
  x: number; // tile coords, fractional while walking
  y: number;
  facing: Facing;
  moving: boolean;
}

/**
 * Where an NPC is at a given (fractional) game minute. Pure function of the schedule and
 * the clock, so an NPC is always in the same place when the player re-enters a map, and
 * nothing about NPC movement needs saving. Each leg walks x first, then y.
 */
export function npcPose(def: NpcDef, minute: number): NpcPose | null {
  if (minute < def.hours[0] || minute >= def.hours[1]) return null;
  const r = def.route;
  if (r.length === 1) return { x: r[0].x, y: r[0].y, facing: 'down', moving: false };
  const legs = r.map((a, i) => {
    const b = r[(i + 1) % r.length];
    const walk = (Math.abs(b.x - a.x) + Math.abs(b.y - a.y)) / NPC_SPEED;
    return { a, b, walk, total: a.wait + walk };
  });
  const cycle = legs.reduce((s, l) => s + l.total, 0);
  let t = (minute - def.hours[0]) % cycle;
  for (const { a, b, total } of legs) {
    if (t >= total) {
      t -= total;
      continue;
    }
    if (t < a.wait) return { x: a.x, y: a.y, facing: 'down', moving: false };
    const dist = (t - a.wait) * NPC_SPEED;
    const dx = b.x - a.x, dy = b.y - a.y;
    if (dist < Math.abs(dx)) return { x: a.x + Math.sign(dx) * dist, y: a.y, facing: dx > 0 ? 'right' : 'left', moving: true };
    const dyDist = Math.min(Math.abs(dy), dist - Math.abs(dx));
    return { x: b.x, y: a.y + Math.sign(dy) * dyDist, facing: dy > 0 ? 'down' : 'up', moving: true };
  }
  return { x: r[0].x, y: r[0].y, facing: 'down', moving: false };
}
