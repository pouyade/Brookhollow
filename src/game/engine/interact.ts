// What happens when the player presses E at something. Opens UI through the ui store and
// mutates state only through actions.

import { SEASONS } from '../../data/crops';
import { NPCS } from '../../data/npcs';
import { SHOPS } from '../../data/shops';
import { t } from '../../i18n';
import { fullDate, itemName, npcText, shopName, shortDate, timeText, tvNews, tvTip, weatherName, weekdayName } from '../../i18n/data';
import { ask, openModal, say } from '../../stores/ui';
import * as actions from '../sim/actions';
import { isShopOpen } from '../sim/economy';
import { canGift } from '../sim/social';
import { G } from '../sim/state';
import { weekday } from '../sim/time';
import type { Interactable } from '../world/mapTypes';

export interface SceneHooks {
  sleep: () => void;
}

export const SIGNS: Record<string, () => string[]> = {
  farm: () => [t('sign.farm.title', { farm: G.player.farmName }), t('sign.farm.body')],
  smith: () => [t('sign.smith.title'), t('sign.smith.body')],
  board: () => [t('sign.board.title'), t('sign.board.1'), t('sign.board.2'), t('sign.board.3')],
};

function hours(shopId: string) {
  const s = SHOPS[shopId];
  const closed = s.closedWeekdays.map(weekdayName).join('، ');
  return t('shop.hours', { open: timeText(s.hours[0]), close: timeText(s.hours[1]) }) + (closed ? t('shop.closedOn', { days: closed }) : '');
}

export function shopHoursText(shopId: string) {
  return t('shop.closedHours', { shop: shopName(shopId), hours: hours(shopId) });
}

export function interactWith(it: Interactable, hooks: SceneHooks) {
  switch (it.kind) {
    case 'bin':
      openModal({ kind: 'bin' });
      break;
    case 'bed':
      ask(t('bed.ask'), [
        { label: t('bed.sleep'), run: hooks.sleep },
        { label: t('bed.notYet'), run: () => {} },
      ]);
      break;
    case 'mailbox': {
      const id = actions.readMail();
      if (id) openModal({ kind: 'letter', id });
      else say([t('mail.none')]);
      break;
    }
    case 'tv':
      ask(t('tv.ask'), [
        { label: t('tv.weather'), run: () => say([t('tv.forecast', { weather: weatherName(G.tomorrowWeather) }), t(`tv.flavor.${G.tomorrowWeather}`)]) },
        { label: t('tv.farmHour'), run: () => say([tvTip(weekday(G))]) },
        { label: t('tv.news'), run: () => say([tvNews(SEASONS[G.seasonIndex])]) },
        { label: t('tv.off'), run: () => {} },
      ]);
      break;
    case 'calendar':
      say(calendarLines());
      break;
    case 'sign':
      say(SIGNS[it.data ?? '']?.() ?? ['...']);
      break;
    case 'shop':
      shopCounter(it.data ?? 'general');
      break;
  }
}

function calendarLines(): string[] {
  const s = SEASONS[G.seasonIndex];
  const bdays = Object.values(NPCS)
    .filter((n) => n.birthday.season === s && n.birthday.day >= G.day)
    .map((n) => t('calendar.birthday', { name: npcText(n.id, 'name'), date: shortDate(G.seasonIndex, n.birthday.day) }));
  return [t('calendar.today', { date: fullDate(G, weekday(G)) }), bdays.length ? bdays.join('\n') : t('calendar.noBirthdays')];
}

function shopCounter(shopId: string) {
  const shop = SHOPS[shopId];
  const keeper = NPCS[shop.keeper];
  if (!isShopOpen(shop)) {
    say([shopHoursText(shopId)]);
    return;
  }
  const who = { name: npcText(keeper.id, 'name'), portrait: keeper.frame };
  ask(t('shop.welcome', { shop: shopName(shopId) }), [
    { label: t('shop.buyOption'), run: () => openModal({ kind: 'shop', shop: shopId }) },
    { label: t('shop.chat'), run: () => say(actions.talk(keeper.id), who) },
    ...giftChoice(keeper.id),
    { label: t('shop.leave'), run: () => {} },
  ], who);
}

function giftChoice(npcId: string) {
  const sel = G.inventory[G.selected];
  if (!sel || !canGift(sel.id)) return [];
  return [{ label: t('shop.give', { item: itemName(sel.id) }), run: () => giveGift(npcId) }];
}

function giveGift(npcId: string) {
  const r = actions.gift(npcId);
  const n = NPCS[npcId];
  if (r.ok && 'line' in r) say([r.line as string], { name: npcText(npcId, 'name'), portrait: n.frame });
}

export function talkTo(npcId: string) {
  const n = NPCS[npcId];
  const who = { name: npcText(npcId, 'name'), portrait: n.frame };
  const sel = G.inventory[G.selected];
  if (sel && canGift(sel.id) && npcId !== 'nell') {
    ask(t('gift.notice', { name: who.name, item: itemName(sel.id).toLowerCase() }), [
      { label: t('gift.give'), run: () => giveGift(npcId) },
      { label: t('gift.chat'), run: () => say(actions.talk(npcId), who) },
    ], who);
    return;
  }
  say(actions.talk(npcId), who);
}
