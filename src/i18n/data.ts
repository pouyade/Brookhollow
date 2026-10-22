// Translated game content. English lives in src/data/*; each helper returns the
// translation for the current locale, falling back to the English source text.

import { CROPS, SEASONS } from '../data/crops';
import type { Season } from '../data/crops';
import { ITEMS } from '../data/items';
import { LETTERS } from '../data/letters';
import { NPCS } from '../data/npcs';
import type { NpcDef } from '../data/npcs';
import { SHOPS } from '../data/shops';
import { TV_NEWS, TV_TIPS } from '../data/tv';
import { locale, t } from './index';
import type { Note } from '../game/sim/state';
import { formatTime } from '../game/sim/time';
import type { Locale } from './index';

interface NpcText {
  name: string;
  role: string;
  lines: string[][];
  rainLine?: string;
  lovedLine: string;
  likedLine: string;
  neutralLine: string;
  dislikedLine: string;
  birthdayLine: string;
}

interface ContentPack {
  seasons: Record<Season, string>;
  weekdays: string[];
  weather: Record<string, string>;
  maps: Record<string, string>;
  shops: Record<string, string>;
  items: Record<string, { name: string; desc?: string }>;
  crops: Record<string, string>;
  npcs: Record<string, NpcText>;
  letters: Record<string, { from: string; subject: string; body: string[] }>;
  tvTips: string[];
  tvNews: Record<string, string>;
  intro: string[];
}

const FA_CONTENT: ContentPack = {
  seasons: { spring: 'بهار', summer: 'تابستان', fall: 'پاییز', winter: 'زمستان' },
  weekdays: ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه', 'یکشنبه'],
  weather: { sun: 'آفتابی', cloudy: 'ابری', rain: 'بارانی', storm: 'طوفانی', snow: 'برفی' },
  maps: { farm: 'مزرعه', house: 'خانهٔ مزرعه', town: 'بروک‌هالو', store: 'فروشگاه' },
  shops: { general: 'فروشگاه' },
  items: {
    hoe: { name: 'کج‌بیل', desc: 'خاک را شخم می‌زند تا بشود در آن بذر کاشت.' },
    can: { name: 'آب‌پاش', desc: 'خاک را آبیاری می‌کند. از برکه پرش کن.' },
    sickle: { name: 'داس', desc: 'علف هرز و محصولات پژمرده را می‌بُرد.' },
    axe: { name: 'تبر', desc: 'کُنده‌ها را به چوب تبدیل می‌کند.' },
    hammer: { name: 'چکش', desc: 'سنگ‌ها را می‌شکند.' },
    milker: { name: 'شیردوش', desc: 'گاوِ سیر را می‌دوشد.' },
    feed: { name: 'دان مرغ', desc: 'غذای یک روزِ یک مرغ.' },
    fodder: { name: 'علوفه', desc: 'غذای یک روزِ یک گاو یا گوسفند.' },
    egg: { name: 'تخم‌مرغ' },
    milk: { name: 'شیر' },
    bread: { name: 'نان', desc: 'تازه از فروشگاه.' },
  },
  crops: {
    turnip: 'شلغم', potato: 'سیب‌زمینی', cucumber: 'خیار', cabbage: 'کلم', strawberry: 'توت‌فرنگی',
    dawnbell: 'گل سپیده', tomato: 'گوجه‌فرنگی', corn: 'ذرت', onion: 'پیاز', pineapple: 'آناناس',
    sunburst: 'گل آفتاب', eggplant: 'بادمجان', carrot: 'هویج', sweetpotato: 'سیب‌زمینی شیرین', pepper: 'فلفل دلمه',
  },
  npcs: {
    nell: {
      name: 'نل', role: 'صاحب فروشگاه',
      lines: [
        ['به فروشگاه بروک‌هالو خوش آمدی!', 'بذرها با هر فصل عوض می‌شوند، پس زود به زود سر بزن.', 'ساعت نُه باز می‌کنیم و پنج می‌بندیم. چهارشنبه‌ها استراحت می‌کنم.'],
        ['کشتزارت حسابی سرسبز شده! از جادهٔ تپه پیداست.', 'توت‌فرنگی... اگر یک روز زیادی داشتی، می‌دانی کجا پیدایم کنی.'],
        ['راستش را بخواهی، تو بهترین مشتری این فروشگاه هستی.', 'کمی بمان. کتری همیشه برای تو گرم است.'],
      ],
      rainLine: 'باران برای بذرها خوب است و برای کاسبی بد!',
      lovedLine: 'برای من؟! وای، این محبوب‌ترین چیز من است!',
      likedLine: 'چه باملاحظه! ممنونم.',
      neutralLine: 'اِ، هدیه؟ لطف داری.',
      dislikedLine: 'آه... یک جوری ازش استفاده می‌کنم. شاید.',
      birthdayLine: 'تولدم یادت بود؟ کل سالم را ساختی!',
    },
    bram: {
      name: 'برام', role: 'آهنگر',
      lines: [
        ['اسمم برام است. آهنِ این روستا را صادق نگه می‌دارم.', 'کوره بعد از آتش‌سوزی دودکشِ زمستانِ پیش در حال بازسازی است.', 'وقتی راه افتاد، سنگ معدن و سکه بیاور تا ابزارهایت بدرخشند.'],
        ['ابزارهایت جای درستی ساییده شده‌اند. نشانِ یک کشاورزِ واقعی است.', 'کج‌بیلِ بهتر با هر ضربه زمین بیشتری شخم می‌زند. یادت باشد.'],
        ['جایت کنار سندان من محفوظ است، رفیق.', 'کم کسی پیدا می‌شود که از آتش کوره بیشتر کار کند. تو یکی از آن‌هایی.'],
      ],
      lovedLine: 'ها! امشب ذرت کبابی داریم. ممنونم!',
      likedLine: 'به این می‌گویند هدیه.',
      neutralLine: 'هوم. ممنون، گمانم.',
      dislikedLine: 'گل؟ برای یک آهنگر؟ ...باشد.',
      birthdayLine: 'سال‌هاست کسی تولدم را یادش نبوده. ممنونم.',
    },
    wren: {
      name: 'رِن', role: 'کتابدار',
      lines: [
        ['اِ! سلام. من رِن هستم. از کتابخانه نگهداری می‌کنم... وقتی باز باشد.', 'دور فواره قدم می‌زنم تا فکر کنم. کمکم می‌کند.', 'می‌دانستی مزرعهٔ قدیمی به‌خاطر شلغم‌هایش معروف بود؟'],
        ['کشتزارت را از روی تپه دیدم. خیلی زنده به نظر می‌رسد.', 'یک شعر کوچک دربارهٔ مزرعه‌ات نوشته‌ام. نه، نمی‌توانی بخوانی‌اش.'],
        ['قدم زدن با تو یک روز خوب می‌شد...', 'یعنی -- هوا را می‌گویم! چه هوای خوبی است امروز!'],
      ],
      rainLine: 'عاشق صدای باران روی فواره‌ام.',
      lovedLine: 'گل! خودت پرورشش دادی؟ چقدر زیباست...',
      likedLine: 'چقدر تازه است! ممنونم!',
      neutralLine: 'ممنونم! لطف داری.',
      dislikedLine: 'اِ... راستش زیاد از این‌ها نمی‌خورم. ولی ممنون.',
      birthdayLine: 'می‌دانستی امروز تولدم است؟ من... ممنونم.',
    },
    juno: {
      name: 'جونو', role: 'دامدار',
      lines: [
        ['من جونو هستم! دامداری خانواده‌ام جنوب همین‌جاست.', 'وقتی طویله دوباره ساخته شد، جوجه و گوساله می‌فروشیم.', 'به حیوان‌ها باید هر روز غذا بدهی. بدون استثنا!'],
        ['قیافه‌ات به آدمی می‌خورد که از پسِ یکی دو تا گاو برمی‌آید.', 'هویج اسب‌ها را به رقص درمی‌آورد. جدی می‌گویم.'],
        ['تو هوای همه چیز را داری. زمین، آدم‌ها... همین‌طوری.', 'خوشحالم که به بروک‌هالو آمدی.'],
      ],
      lovedLine: 'باورم نمی‌شود! این محبوب‌ترین چیز دنیاست!',
      likedLine: 'مستقیم از کشتزارت؟ عالی است!',
      neutralLine: 'آخی، ممنون!',
      dislikedLine: 'فلفل... تنها نقطه‌ضعف من. از نوع بدش.',
      birthdayLine: 'هدیهٔ تولد؟ تو بهترینی!',
    },
  },
  letters: {
    welcome: {
      from: 'کدخدا هالیس',
      subject: 'به بروک‌هالو خوش آمدی',
      body: [
        '{name} عزیز،',
        'به مزرعهٔ {farm} خوش آمدی. عموبزرگت چهل سال روی این زمین کار کرد و می‌دانم خوشحال می‌شد آن را دوباره در دستان خانواده ببیند.',
        'راستش را بگویم: شورای روستا مطمئن نیست یک تازه‌وارد بتواند آن را احیا کند. پس قرارمان این است: سه سال وقت داری. روز اول بهارِ سال چهارم با هم در مزرعه قدم می‌زنیم و اگر پررونق باشد، برای همیشه مال توست.',
        'از کم شروع کن. گوشه‌ای از کشتزار را پاک کن، با کج‌بیل شخمش بزن و بذرهای شلغمی را که عمویت به جا گذاشته بکار. هر روز آبشان بده، مگر اینکه باران ببارد. محصول را در جعبهٔ ارسال کنار خانه بگذار؛ خریدار شب‌ها می‌آید و صبح پولش را می‌دهد.',
        'فروشگاه نِل در روستا بذر می‌فروشد. حواست به ساعت کارش باشد: نُه تا پنج، چهارشنبه‌ها تعطیل.',
        'به امید موفقیتت،',
        'هالیس',
      ],
    },
    summer: {
      from: 'نل', subject: 'بذرهای تابستانی رسید!',
      body: ['سلام {name}!', 'گوجه‌فرنگی، ذرت، پیاز و حتی آناناس روی قفسه‌هاست. محصولات بهاری در گرما دوام نمی‌آورند، پس جمعشان کن.', '- نل'],
    },
    fall: {
      from: 'نل', subject: 'برداشت پاییزی',
      body: ['سلام {name}!', 'هویج، سیب‌زمینی شیرین، بادمجان و فلفل برای پاییز رسیده. در شهر قیمت خوبی دارند.', '- نل'],
    },
    winter: {
      from: 'کدخدا هالیس', subject: 'زمستان در مزرعه',
      body: ['{name}،', 'زمستان اینجا هیچ چیز در فضای باز رشد نمی‌کند. استراحت کن، ابزارهایت را تعمیر کن و با همسایه‌هایت آشنا شو. با یک گلخانه می‌شود در سرما هم کشاورزی کرد - وقتی نجار برگشت درباره‌اش حرف می‌زنیم.', '- هالیس'],
    },
  },
  tvTips: [
    'ساعت کشاورزی: محصولات فقط روزهایی رشد می‌کنند که خاکشان آب خورده باشد. روزهای بارانی آبیاری با آسمان است!',
    'ساعت کشاورزی: هر کیسه بذر یک قطعهٔ ۳×۳ می‌کارد. نُه خانه را کنار هم شخم بزن تا هیچ بذری هدر نرود.',
    'ساعت کشاورزی: توت‌فرنگی، گوجه‌فرنگی و ذرت بعد از اولین برداشت باز هم بار می‌دهند.',
    'ساعت کشاورزی: خسته‌ای؟ چیزی از کوله‌ات بخور یا کار را تعطیل کن. اگر از خستگی از حال بروی، دکتر روستا برایت صورت‌حساب می‌فرستد.',
    'ساعت کشاورزی: محصولاتی که موقع عوض شدن فصل هنوز در زمین‌اند پژمرده می‌شوند. آخرین کاشتت را حساب‌شده انجام بده!',
    'ساعت کشاورزی: کُنده‌ها چوب می‌دهند و سنگ‌ها سنگ. برای ساخت‌وساز نگهشان دار.',
    'ساعت کشاورزی: اهالی عاشق هدیه‌های باملاحظه‌اند، ولی فقط روزی یکی. هدیهٔ تولد سه برابر اثر دارد!',
  ],
  tvNews: {
    spring: 'اخبار بروک‌هالو: درختان گیلاس کنار فواره شکوفه داده‌اند. نل از فروش بی‌سابقهٔ بذر خبر می‌دهد.',
    summer: 'اخبار بروک‌هالو: گرمای تابستان از راه رسید. یادتان باشد زود و زیاد آبیاری کنید.',
    fall: 'اخبار بروک‌هالو: رنگ‌های پاییزی این هفته روی کوه نشسته. وقت خوبی برای پیاده‌روی است.',
    winter: 'اخبار بروک‌هالو: برف در راه است. هیزم شومینه را آماده کنید و به همسایه‌ها سر بزنید.',
  },
  intro: [
    'اتوبوس جایی می‌ایستد که جادهٔ آسفالت تمام می‌شود. آن‌سوی تپه‌ها، روستای بروک‌هالو آرام‌آرام بیدار می‌شود.',
    '{name} با یک چمدان و یک نامه پیاده می‌شود: سند مزرعه‌ای که عموبزرگی که کمتر می‌شناختش برایش گذاشته.',
    'مردی با موهای خاکستری که کنار تابلوی راهنما منتظر است می‌گوید: «مزرعهٔ {farm}. من هالیس هستم، کدخدای روستا. متأسفانه... روزهای بهتری هم دیده.»',
    'علف‌های هرز تا زانو. سنگ در هر شیار. کُنده‌هایی جای باغِ قدیمی. اما خاکِ زیرش تیره و پربار است.',
    'هالیس می‌گوید: «سه سال. اگر در سه سال دوباره جانش بدهی، روستا می‌فهمد که به اینجا تعلق داری.»',
    'بهار، سال اول. کار از فردا صبح شروع می‌شود.',
  ],
};

const EN_INTRO = [
  'The bus rattles to a stop where the paved road ends. Beyond the hills, the village of Brookhollow wakes up slowly.',
  '{name} steps out with one suitcase and a letter: the deed to a farm, left by a great-uncle they barely knew.',
  '"{farm} Farm," says a gray-haired man waiting by the signpost. "I\'m Hollis, the mayor. I\'m afraid it\'s... seen better days."',
  'Weeds to the knee. Stones in every furrow. Stumps where the orchard once stood. But the soil underneath is dark and rich.',
  '"Three years," Hollis says. "Bring it back to life in three years, and the village will know you belong here."',
  'Spring, Year 1. The work begins tomorrow morning.',
];

const PACKS: Partial<Record<Locale, ContentPack>> = { fa: FA_CONTENT };
const pack = () => PACKS[locale.value];

const EN_SEASONS: Record<Season, string> = { spring: 'Spring', summer: 'Summer', fall: 'Autumn', winter: 'Winter' };
const EN_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const EN_WEATHER: Record<string, string> = { sun: 'Sunny', cloudy: 'Cloudy', rain: 'Rain', storm: 'Storm', snow: 'Snow' };

export const seasonName = (s: Season | number) => {
  const key = typeof s === 'number' ? SEASONS[s] : s;
  return pack()?.seasons[key] ?? EN_SEASONS[key];
};
export const weekdayName = (i: number) => pack()?.weekdays[i] ?? EN_WEEKDAYS[i];
export const weatherName = (w: string) => pack()?.weather[w] ?? EN_WEATHER[w];
export const mapName = (id: string, fallback: string) => pack()?.maps[id] ?? fallback;
export const shopName = (id: string) => pack()?.shops[id] ?? SHOPS[id].name;

export const cropName = (id: string) => pack()?.crops[id] ?? CROPS[id].name;

export function itemName(id: string): string {
  const def = ITEMS[id];
  if (!def) return id;
  if (def.kind === 'seed' && def.cropId) return t('item.seeds', { crop: cropName(def.cropId) });
  if (def.kind === 'produce' && def.cropId) return cropName(def.cropId);
  return pack()?.items[id]?.name ?? def.name;
}

export function itemDesc(id: string): string | undefined {
  const def = ITEMS[id];
  if (!def) return undefined;
  if (def.kind === 'seed' && def.cropId) return t('item.seedsDesc', { season: seasonName(CROPS[def.cropId].season) });
  return pack()?.items[id]?.desc ?? def.desc;
}

/** an upgradeable tool's display name, e.g. "Copper Hoe" */
export function toolName(id: string, tier: number): string {
  const base = itemName(id);
  return tier > 0 ? t(`tier.${tier}`, { tool: base }) : base;
}

export function npcText<K extends keyof NpcText>(id: string, key: K): NpcText[K] {
  const fa = pack()?.npcs[id]?.[key];
  return (fa ?? (NPCS[id] as NpcDef)[key as keyof NpcDef]) as NpcText[K];
}

/** a letter in the current language with {name}/{farm} filled in */
export function letterText(id: string, player: { name: string; farmName: string }) {
  const l = pack()?.letters[id] ?? LETTERS[id];
  const fill = (s: string) => s.replaceAll('{name}', player.name).replaceAll('{farm}', player.farmName);
  return { from: l.from, subject: fill(l.subject), body: l.body.map(fill) };
}

export const tvTip = (i: number) => pack()?.tvTips[i] ?? TV_TIPS[i];
export const tvNews = (s: Season) => pack()?.tvNews[s] ?? TV_NEWS[s];
export const introPages = () => pack()?.intro ?? EN_INTRO;

/** "Spring 3" / "۳ بهار" */
export function shortDate(seasonIndex: number, day: number) {
  return t('common.date', { season: seasonName(seasonIndex), day });
}

export function fullDate(d: { day: number; seasonIndex: number; year: number }, weekday: number) {
  return t('common.dateFull', { season: seasonName(d.seasonIndex), day: d.day, weekday: weekdayName(weekday), year: d.year });
}

/** render a stored Note in the current language */
export function noteText(n: Note): string {
  const p: Record<string, string | number> = { ...(n.params ?? {}) };
  if (typeof p.season === 'number') p.season = seasonName(p.season);
  if (typeof p.weather === 'string') p.weather = weatherName(p.weather);
  if (typeof p.npc === 'string') p.name = npcText(p.npc, 'name');
  return t(n.key, p);
}

/** clock text: 12-hour in English, 24-hour in Persian */
export function timeText(min: number): string {
  if (locale.value === 'en') return formatTime(min);
  const m = ((min % 1440) + 1440) % 1440;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
}
