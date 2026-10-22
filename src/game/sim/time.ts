import { DAYS_PER_SEASON, DAYS_PER_YEAR, SEASONS, SEASON_NAMES } from '../../data/crops';

/** All clock tuning lives here. */
export const TIME = {
  dayStart: 6 * 60,
  /** at this time (2:00 next morning) the player collapses */
  passOut: 26 * 60,
  /** real milliseconds per in-game minute while the clock runs outdoors */
  msPerMinute: 700,
  /** clock stops inside buildings, like the classic games */
  pauseIndoors: true,
  /** first day of Year 4: the mayor's evaluation */
  evaluationYear: 4,
};

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface DateParts {
  day: number; // 1..30
  seasonIndex: number;
  year: number;
}

/** 0-based absolute day counter; day 1 spring year 1 = 0 */
export function dayIndex(d: DateParts): number {
  return (d.year - 1) * DAYS_PER_YEAR + d.seasonIndex * DAYS_PER_SEASON + (d.day - 1);
}

export function fromDayIndex(i: number): DateParts {
  const year = Math.floor(i / DAYS_PER_YEAR) + 1;
  const r = i % DAYS_PER_YEAR;
  return { year, seasonIndex: Math.floor(r / DAYS_PER_SEASON), day: (r % DAYS_PER_SEASON) + 1 };
}

/** 0 = Monday; spring 1 of year 1 is a Monday */
export function weekday(d: DateParts): number {
  return dayIndex(d) % 7;
}

export function formatTime(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const ampm = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm.toString().padStart(2, '0')} ${ampm}`;
}

export function formatDate(d: DateParts): string {
  return `${SEASON_NAMES[SEASONS[d.seasonIndex]]} ${d.day} (${WEEKDAYS[weekday(d)]}), Year ${d.year}`;
}

/**
 * Darkness 0..1 for the day/night overlay. Morning is bright, dusk warms from 17:00,
 * full night from 20:00.
 */
export function darkness(min: number): { alpha: number; color: number } {
  if (min < 7 * 60) return { alpha: Math.max(0, 0.16 - ((min - 6 * 60) / 60) * 0.16), color: 0xffb070 };
  if (min < 17 * 60) return { alpha: 0, color: 0 };
  if (min < 19 * 60) return { alpha: ((min - 17 * 60) / 120) * 0.22, color: 0xff8a3d };
  if (min < 20 * 60 + 30) return { alpha: 0.22 + ((min - 19 * 60) / 90) * 0.28, color: 0x1d2350 };
  return { alpha: 0.5, color: 0x101538 };
}
