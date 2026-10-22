/** Logical actions -> KeyboardEvent.code values. Rebinding = editing this map. */
export type InputAction =
  | 'up' | 'down' | 'left' | 'right'
  | 'use' | 'interact' | 'cycle' | 'inventory' | 'journal' | 'pause';

export const DEFAULT_KEYS: Record<InputAction, string[]> = {
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  use: ['Space'],
  interact: ['KeyE', 'Enter'],
  cycle: ['KeyQ'],
  inventory: ['KeyI', 'Tab'],
  journal: ['KeyJ'],
  pause: ['Escape'],
};

export const keymap: Record<InputAction, string[]> = structuredClone(DEFAULT_KEYS);

export function actionFor(code: string): InputAction | null {
  for (const [a, codes] of Object.entries(keymap)) if (codes.includes(code)) return a as InputAction;
  return null;
}

/** keys currently held (by code), tracked on window so Vue and Phaser agree */
const held = new Set<string>();
window.addEventListener('keydown', (e) => held.add(e.code));
window.addEventListener('keyup', (e) => held.delete(e.code));
window.addEventListener('blur', () => held.clear());

export function isHeld(a: InputAction): boolean {
  return keymap[a].some((c) => held.has(c));
}

export function clearHeld() {
  held.clear();
}

export const KEY_LABELS: Record<string, string> = {
  Space: 'Space', Enter: 'Enter', Escape: 'Esc', Tab: 'Tab',
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
};

export function keyLabel(code: string) {
  return KEY_LABELS[code] ?? code.replace(/^Key|^Digit/, '');
}
