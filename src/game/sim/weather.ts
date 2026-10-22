import type { Season } from '../../data/crops';
import { pickWeighted, rngFor } from './rng';
import type { Weather } from './state';

/** relative odds of each weather per season */
export const WEATHER_TABLE: Record<Season, Partial<Record<Weather, number>>> = {
  spring: { sun: 60, cloudy: 15, rain: 25 },
  summer: { sun: 65, cloudy: 10, rain: 17, storm: 8 },
  fall: { sun: 55, cloudy: 20, rain: 22, storm: 3 },
  winter: { sun: 40, cloudy: 20, snow: 40 },
};

export const WEATHER_NAMES: Record<Weather, string> = {
  sun: 'Sunny', cloudy: 'Cloudy', rain: 'Rain', storm: 'Storm', snow: 'Snow',
};

/** salt keeps weather rolls independent from other rolls on the same day */
const SALT = 0x57ea;

/**
 * Weather for an absolute day index. Pure: the same seed and day always give the same
 * result, which keeps bugs reproducible. The first day of each season is always clear.
 */
export function rollWeather(seed: number, day: number, s: Season, dayOfSeason: number): Weather {
  if (dayOfSeason === 1) return 'sun';
  const rand = rngFor(seed, day * 31 + SALT);
  return pickWeighted(rand, WEATHER_TABLE[s]);
}

export function isWet(w: Weather) {
  return w === 'rain' || w === 'storm';
}
