import { DAYS_PER_SEASON, SEASONS } from '../../data/crops';
import { NPCS } from '../../data/npcs';
import { processShipping } from './economy';
import { EV, bus } from './events';
import { generateDebris, growCrops, onSeasonChange, rainWater } from './farming';
import { resetDailySocial } from './social';
import { CAN_CAPACITY, G, defaultState, setState } from './state';
import type { GameState, Note, PlayerInfo } from './state';
import { TIME, dayIndex, fromDayIndex } from './time';
import { isWet, rollWeather } from './weather';
import { BED } from '../world/maps/house';

/** fraction of gold the doctor charges when the player collapses (capped) */
export const PASS_OUT_FEE = { fraction: 0.1, max: 1000 };

/** start a brand-new game with a fresh farm */
export function newGame(player: PlayerInfo, seed = (Math.random() * 2 ** 31) | 0): GameState {
  const s = defaultState(seed, player);
  setState(s);
  generateDebris(seed);
  G.tomorrowWeather = rollWeather(seed, 1, 'spring', 2);
  return G;
}

function weatherFor(i: number) {
  const d = fromDayIndex(i);
  return rollWeather(G.seed, i, SEASONS[d.seasonIndex], d.day);
}

/**
 * The single overnight transition (see README "Day transition"). `expectedDay` is the
 * day index the caller observed when the player went to bed; if that day was already
 * processed (double event, replayed handler) this is a no-op and returns false.
 */
export function endDay(expectedDay: number, opts: { passedOut?: boolean } = {}): boolean {
  const today = dayIndex(G);
  if (expectedDay !== today || G.lastProcessedDay >= today) return false;
  const notes: Note[] = [];

  // 1. shipping is collected overnight
  const { lines, total } = processShipping();

  // 2. crops grow from today's watering
  growCrops();

  // 3. advance the calendar
  const prevSeason = G.seasonIndex;
  const next = fromDayIndex(today + 1);
  G.day = next.day;
  G.seasonIndex = next.seasonIndex;
  G.year = next.year;

  // 4. weather: tomorrow's forecast becomes today, roll the new forecast
  G.weather = G.tomorrowWeather;
  G.tomorrowWeather = weatherFor(today + 2);

  // 5. season change
  if (G.seasonIndex !== prevSeason) {
    const withered = onSeasonChange(G.seed, today + 1);
    const sname = SEASONS[G.seasonIndex];
    notes.push({ key: 'note.season', params: { season: G.seasonIndex } });
    if (withered) notes.push({ key: 'note.withered', params: { n: withered } });
    if (!G.readMail.includes(sname) && !G.mail.includes(sname) && sname !== 'spring') G.mail.push(sname);
    bus.emit(EV.SEASON_CHANGED, G.seasonIndex);
  }

  // 6. morning weather effects on the farm
  if (isWet(G.weather)) rainWater();

  // 7. villagers: reset daily interactions, birthday reminders
  resetDailySocial();
  for (const n of Object.values(NPCS)) {
    if (n.birthday.season === SEASONS[G.seasonIndex] && n.birthday.day === G.day) notes.push({ key: 'note.birthday', params: { npc: n.id } });
  }
  if (G.player.birthday.season === SEASONS[G.seasonIndex] && G.player.birthday.day === G.day) notes.push({ key: 'note.yourBirthday' });
  if (G.day === DAYS_PER_SEASON) notes.push({ key: 'note.lastDay' });

  // 8. the player wakes up
  if (opts.passedOut) {
    const fee = Math.min(PASS_OUT_FEE.max, Math.floor(G.gold * PASS_OUT_FEE.fraction));
    G.gold -= fee;
    G.stamina = Math.ceil(G.maxStamina / 2);
    notes.unshift({ key: 'note.collapsed', params: { fee } });
  } else {
    G.stamina = G.maxStamina;
  }
  G.timeMin = TIME.dayStart;
  G.canWater = Math.min(G.canWater, CAN_CAPACITY[G.tools.can]);
  G.pos = { map: 'house', x: BED.x + 1, y: BED.y, facing: 'down' };
  if (G.weather !== 'sun') notes.push({ key: 'note.weather', params: { weather: G.weather } });

  // 9. bookkeeping: never process this day again
  G.lastProcessedDay = today;
  G.stats.daysPlayed++;
  G.morningReport = { shipped: lines, total, notes };
  bus.emit(EV.DAY_STARTED, { passedOut: !!opts.passedOut });
  return true;
}
