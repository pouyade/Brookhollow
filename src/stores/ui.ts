import { computed, reactive, ref } from 'vue';
import { EV, bus } from '../game/sim/events';
import { G } from '../game/sim/state';
import type { GameState } from '../game/sim/state';

/**
 * Bridge between the simulation and Vue. Game state is NOT made reactive (Phaser reads it
 * every frame); instead `rev` is bumped whenever the sim announces a change and computed
 * values that read G re-evaluate.
 */
export const rev = ref(0);
bus.on(EV.CHANGED, () => rev.value++);
bus.on(EV.DAY_STARTED, () => rev.value++);

export function useGame<T>(fn: (g: GameState) => T) {
  return computed(() => {
    void rev.value;
    return fn(G);
  });
}

export interface Choice {
  label: string;
  run: () => void;
}

export interface Dialogue {
  name?: string;
  /** frame on the character sheet for the portrait */
  portrait?: number;
  lines: string[];
  index: number;
  choices?: Choice[];
  onClose?: () => void;
}

export type Modal =
  | { kind: 'inventory' }
  | { kind: 'shop'; shop: string }
  | { kind: 'bin' }
  | { kind: 'pause' }
  | { kind: 'letter'; id: string }
  | { kind: 'morning' }
  | { kind: 'journal' };

export type Screen = 'title' | 'newgame' | 'intro' | 'game';

export const ui = reactive({
  screen: 'title' as Screen,
  dialogue: null as Dialogue | null,
  modal: null as Modal | null,
  toasts: [] as { id: number; text: string }[],
  fading: false,
  /** contextual hint for what E / Space would do right now */
  hint: '',
  /** save slot chosen on the title screen for a new game */
  pendingSlot: 1,
  /** keyboard events before this timestamp are ignored (stops one key press doing two things) */
  inputLockUntil: 0,
});

/** true while the world should not take input or run the clock */
export function uiBlocking(): boolean {
  return !!ui.dialogue || !!ui.modal || ui.fading || ui.screen !== 'game';
}

export function inputLocked(): boolean {
  return performance.now() < ui.inputLockUntil;
}

function lockInput(ms = 180) {
  ui.inputLockUntil = performance.now() + ms;
}

export function say(lines: string[], opts: Omit<Dialogue, 'lines' | 'index'> = {}) {
  lockInput();
  ui.dialogue = { lines, index: 0, ...opts };
}

export function ask(question: string, choices: Choice[], opts: Omit<Dialogue, 'lines' | 'index' | 'choices'> = {}) {
  say([question], { ...opts, choices });
}

export function closeDialogue() {
  const d = ui.dialogue;
  ui.dialogue = null;
  lockInput();
  d?.onClose?.();
}

export function openModal(m: Modal) {
  lockInput();
  ui.modal = m;
}

export function closeModal() {
  ui.modal = null;
  lockInput();
}

let toastId = 0;
export function showToast(text: string) {
  if (!text) return;
  const id = ++toastId;
  ui.toasts.push({ id, text });
  if (ui.toasts.length > 4) ui.toasts.shift();
  setTimeout(() => {
    const i = ui.toasts.findIndex((t) => t.id === id);
    if (i >= 0) ui.toasts.splice(i, 1);
  }, 3200);
}
bus.on(EV.TOAST, showToast);
