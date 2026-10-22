// Localisation core. UI and message strings live in flat dictionaries (en.ts / fa.ts);
// game content (items, villagers, letters...) keeps English in src/data and gets
// translated overlays through ./data.ts. Switching locale is reactive and instant.

import { ref } from 'vue';
import { EN } from './en';
import { FA } from './fa';

export type Locale = 'en' | 'fa';

export const LOCALES: Record<Locale, { name: string; dir: 'ltr' | 'rtl'; htmlLang: string }> = {
  en: { name: 'English', dir: 'ltr', htmlLang: 'en' },
  fa: { name: 'فارسی', dir: 'rtl', htmlLang: 'fa' },
};

const DICTS: Record<Locale, Record<string, string>> = { en: EN, fa: FA };
const STORAGE_KEY = 'hmbtn-locale';

function initial(): Locale {
  try {
    const v = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (v === 'en' || v === 'fa') return v;
  } catch {
    /* storage blocked */
  }
  return 'en';
}

/** current locale; reading it inside a Vue render makes the component re-render on change */
export const locale = ref<Locale>(initial());

export type Params = Record<string, string | number>;

export function format(s: string, params?: Params): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m));
}

/** translate a UI/message key; falls back to English, then to the key itself */
export function t(key: string, params?: Params): string {
  const s = DICTS[locale.value][key] ?? EN[key] ?? key;
  return format(s, params);
}

export function isRtl(): boolean {
  return LOCALES[locale.value].dir === 'rtl';
}

function applyDocument() {
  if (typeof document === 'undefined') return;
  const l = LOCALES[locale.value];
  document.documentElement.lang = l.htmlLang;
  document.documentElement.dir = l.dir;
}

export function setLocale(l: Locale) {
  locale.value = l;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, l);
  } catch {
    /* ignore */
  }
  applyDocument();
}

applyDocument();
