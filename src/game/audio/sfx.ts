// Tiny synthesized sound effects (WebAudio), so there are no audio assets to license.
// Music arrives in the polish milestone; volume/mute already apply here.

import { loadSettings } from '../save/save';

let ctx: AudioContext | null = null;
let settings = loadSettings();

export function applyAudioSettings() {
  settings = loadSettings();
}

type Note = [freq: number, dur: number, type?: OscillatorType, delay?: number];

const SOUNDS: Record<string, Note[]> = {
  hoe: [[140, 0.07, 'square'], [90, 0.06, 'square', 0.05]],
  can: [[900, 0.05, 'sine'], [700, 0.06, 'sine', 0.04], [800, 0.05, 'sine', 0.09]],
  sickle: [[600, 0.04, 'sawtooth'], [300, 0.05, 'sawtooth', 0.03]],
  axe: [[110, 0.09, 'square'], [70, 0.08, 'triangle', 0.06]],
  hammer: [[180, 0.05, 'square'], [120, 0.08, 'square', 0.04]],
  seeds: [[500, 0.04, 'triangle'], [650, 0.04, 'triangle', 0.05], [800, 0.04, 'triangle', 0.1]],
  harvest: [[523, 0.08, 'triangle'], [659, 0.08, 'triangle', 0.07], [784, 0.12, 'triangle', 0.14]],
  ship: [[392, 0.06, 'square'], [523, 0.08, 'square', 0.06]],
  coin: [[988, 0.05, 'square'], [1319, 0.12, 'square', 0.05]],
  gift: [[659, 0.08, 'triangle'], [880, 0.15, 'triangle', 0.08]],
  bad: [[300, 0.1, 'sawtooth'], [220, 0.15, 'sawtooth', 0.09]],
  eat: [[400, 0.05, 'triangle'], [450, 0.05, 'triangle', 0.08]],
  refill: [[300, 0.08, 'sine'], [450, 0.1, 'sine', 0.06], [600, 0.12, 'sine', 0.12]],
  door: [[200, 0.05, 'triangle'], [160, 0.06, 'triangle', 0.05]],
  menu: [[700, 0.03, 'square']],
};

export function playSfx(name: string) {
  const notes = SOUNDS[name];
  if (!notes || settings.muted || settings.volume <= 0) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    for (const [freq, dur, type = 'square', delay = 0] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const v = 0.08 * settings.volume;
      gain.gain.setValueAtTime(v, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.02);
    }
  } catch {
    /* audio unavailable */
  }
}
