import { SEASONS } from '../../data/crops';
import { ITEMS } from '../../data/items';
import { FRIENDSHIP, MAX_FRIENDSHIP, NPCS, heartTier, hearts } from '../../data/npcs';
import { EV, bus } from './events';
import type { ActionResult } from './farming';
import { consumeSlot } from './inventory';
import { G, npcState } from './state';
import { t } from '../../i18n';
import { npcText } from '../../i18n/data';

export type GiftReaction = 'loved' | 'liked' | 'neutral' | 'disliked';

export function isBirthday(npcId: string): boolean {
  const b = NPCS[npcId].birthday;
  return SEASONS[G.seasonIndex] === b.season && G.day === b.day;
}

function addFriendship(npcId: string, amount: number) {
  const s = npcState(npcId);
  const before = hearts(s.friendship);
  s.friendship = Math.max(0, Math.min(MAX_FRIENDSHIP, s.friendship + amount));
  const after = hearts(s.friendship);
  if (after > before) bus.emit(EV.FRIENDSHIP_MILESTONE, { npc: npcId, hearts: after });
}

/** lines for a conversation; the first chat of the day raises friendship */
export function talk(npcId: string): string[] {
  const s = npcState(npcId);
  const firstMeet = !s.met;
  s.met = true;
  if (!s.talkedToday) {
    s.talkedToday = true;
    addFriendship(npcId, FRIENDSHIP.talk);
  }
  const lines = npcText(npcId, 'lines');
  if (firstMeet) return lines[0];
  const tier = lines[heartTier(s.friendship)];
  if (isBirthday(npcId)) return [t('npc.birthdayToday'), tier[0]];
  const rain = npcText(npcId, 'rainLine');
  if ((G.weather === 'rain' || G.weather === 'storm') && rain) return [rain];
  // rotate through the tier's lines by day so repeat visits feel different
  return [tier[(G.day + G.seasonIndex) % tier.length]];
}

export function giftReaction(npcId: string, itemId: string): GiftReaction {
  const d = NPCS[npcId];
  if (d.loves.includes(itemId)) return 'loved';
  if (d.likes.includes(itemId)) return 'liked';
  if (d.dislikes.includes(itemId)) return 'disliked';
  return 'neutral';
}

export function canGift(itemId: string | undefined): boolean {
  return !!itemId && !!ITEMS[itemId]?.giftable;
}

export function gift(npcId: string, slot: number): ActionResult & { line?: string; reaction?: GiftReaction } {
  const s = npcState(npcId);
  const inv = G.inventory[slot];
  if (!inv || !canGift(inv.id)) return { ok: false, msg: t('msg.cantGive') };
  if (s.giftedToday) return { ok: false, msg: t('msg.alreadyGifted', { name: npcText(npcId, 'name') }) };
  const reaction = giftReaction(npcId, inv.id);
  let amount = FRIENDSHIP[reaction];
  if (isBirthday(npcId) && amount > 0) amount *= FRIENDSHIP.birthdayMultiplier;
  addFriendship(npcId, amount);
  s.giftedToday = true;
  s.met = true;
  if (!s.knownGifts.includes(inv.id)) s.knownGifts.push(inv.id);
  const itemId = inv.id;
  consumeSlot(1, slot);
  bus.emit(EV.GIFT_GIVEN, { npc: npcId, item: itemId, reaction });
  const line = npcText(npcId, isBirthday(npcId) && amount > 0 ? 'birthdayLine'
    : reaction === 'loved' ? 'lovedLine'
    : reaction === 'liked' ? 'likedLine'
    : reaction === 'disliked' ? 'dislikedLine'
    : 'neutralLine');
  return { ok: true, line, reaction, sfx: reaction === 'disliked' ? 'bad' : 'gift' };
}

export function resetDailySocial() {
  for (const s of Object.values(G.npcs)) {
    s.talkedToday = false;
    s.giftedToday = false;
  }
}
