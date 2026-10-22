// Screen flow: title -> new game -> intro -> world, plus load / quit.
import { load, save, setSlot } from '../game/save/save';
import { newGame } from '../game/sim/day';
import { G } from '../game/sim/state';
import type { PlayerInfo } from '../game/sim/state';
import { changed } from '../game/sim/events';
import { say, showToast, ui } from '../stores/ui';
import { t } from '../i18n';

export function startNewGame(slot: number, player: PlayerInfo) {
  newGame(player);
  setSlot(slot);
  save(slot);
  ui.modal = null;
  ui.dialogue = null;
  ui.screen = 'intro';
}

export function enterWorld() {
  ui.screen = 'game';
  changed();
  if (!G.flags.introDone) {
    G.flags.introDone = true;
    setTimeout(() => say([t('intro.tutorial.1'), t('intro.tutorial.2'), t('intro.tutorial.3')]), 400);
  }
}

export function continueGame(slot: number): boolean {
  const r = load(slot);
  if (!r.ok) {
    showToast(t('msg.loadFailed', { error: r.error ?? '' }));
    return false;
  }
  if (r.recovered) showToast(t('msg.recovered'));
  ui.modal = null;
  ui.dialogue = null;
  enterWorld();
  return true;
}

export function quitToTitle() {
  ui.modal = null;
  ui.dialogue = null;
  ui.screen = 'title';
}
