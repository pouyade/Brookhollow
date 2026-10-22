import { CH } from '../game/rendering/kenney';
import type { MapId } from '../game/world/mapTypes';
import type { Season } from './crops';

export interface NpcStop {
  x: number;
  y: number;
  /** game minutes to wait on arrival */
  wait: number;
}

export interface NpcDef {
  id: string;
  name: string;
  frame: number;
  role: string;
  birthday: { season: Season; day: number };
  /** where the NPC is during the day; `route` is a loop of tile waypoints on that map */
  map: MapId;
  route: NpcStop[];
  /** hours present on the map, [from, to) in game minutes */
  hours: [number, number];
  loves: string[];
  likes: string[];
  dislikes: string[];
  /** dialogue tiers: 0-2 hearts, 3-5 hearts, 6+ hearts */
  lines: string[][];
  rainLine?: string;
  lovedLine: string;
  likedLine: string;
  neutralLine: string;
  dislikedLine: string;
  birthdayLine: string;
}

export const NPCS: Record<string, NpcDef> = {
  nell: {
    id: 'nell', name: 'Nell', frame: CH.nell, role: 'General store owner',
    birthday: { season: 'spring', day: 11 },
    map: 'store', route: [{ x: 5, y: 3, wait: 999 }], hours: [9 * 60, 17 * 60],
    loves: ['strawberry', 'dawnbell'], likes: ['cabbage', 'milk', 'egg', 'cucumber'], dislikes: ['onion'],
    lines: [
      ["Welcome to Brookhollow's general store!", 'Seeds change with the seasons, so check back often.', 'We open at nine and close at five. Wednesdays I rest.'],
      ['Your field is really filling in! I can see it from the hill road.', 'Strawberries... if you ever grow too many, you know where I am.'],
      ["Honestly, you're the best customer this store has ever had.", 'Stay a while. The kettle is always warm for you.'],
    ],
    rainLine: 'Rain is good for the seeds and bad for business!',
    lovedLine: 'For me?! Oh, this is my absolute favorite!',
    likedLine: 'How thoughtful! Thank you.',
    neutralLine: "Oh, a gift? That's kind of you.",
    dislikedLine: "Ah... I'll find a use for it. Somehow.",
    birthdayLine: 'You remembered my birthday? That makes my whole year!',
  },
  bram: {
    id: 'bram', name: 'Bram', frame: CH.bram, role: 'Blacksmith',
    birthday: { season: 'fall', day: 3 },
    map: 'town', route: [{ x: 28, y: 12, wait: 40 }, { x: 34, y: 12, wait: 25 }], hours: [8 * 60, 19 * 60],
    loves: ['corn'], likes: ['potato', 'egg', 'bread'], dislikes: ['dawnbell', 'sunburst'],
    lines: [
      ["Name's Bram. I keep this village's iron honest.", "Forge is being rebuilt after last winter's chimney fire.", 'Once it is, bring me ore and gold and your tools will sing.'],
      ["Your tools are worn in the right places. That's a farmer's mark.", 'A better hoe tills more ground per swing. Remember that.'],
      ["You've earned a place at my anvil, friend.", 'Not many folk outwork a forge fire. You do.'],
    ],
    lovedLine: 'Ha! Roasted corn tonight. Much obliged!',
    likedLine: "Now that's a fine gift.",
    neutralLine: 'Hm. Thanks, I suppose.',
    dislikedLine: 'Flowers? For a blacksmith? ...Right.',
    birthdayLine: "Nobody's marked my birthday in years. Thank you.",
  },
  wren: {
    id: 'wren', name: 'Wren', frame: CH.wren, role: 'Librarian',
    birthday: { season: 'summer', day: 19 },
    map: 'town',
    route: [{ x: 13, y: 12, wait: 20 }, { x: 26, y: 12, wait: 15 }, { x: 26, y: 18, wait: 20 }, { x: 13, y: 18, wait: 15 }],
    hours: [10 * 60, 18 * 60],
    loves: ['dawnbell', 'sunburst'], likes: ['turnip', 'tomato', 'carrot', 'milk'], dislikes: ['egg'],
    lines: [
      ["Oh! Hello. I'm Wren. I look after the library... when it's open.", 'I walk around the fountain to think. It helps.', 'The old farm was famous for its turnips, you know.'],
      ['I saw your field from the hill. It looks so alive now.', 'I wrote a little poem about your farm. No, you cannot read it.'],
      ['Walking with you would be nice someday...', 'I mean -- the weather! Lovely weather today!'],
    ],
    rainLine: 'I love the sound of rain on the fountain.',
    lovedLine: "Flowers! You grew these? They're beautiful...",
    likedLine: 'This is so fresh! Thank you!',
    neutralLine: "Thank you! That's sweet.",
    dislikedLine: "Oh... um, I don't really eat those. But thank you.",
    birthdayLine: 'You knew it was my birthday? I... thank you.',
  },
  juno: {
    id: 'juno', name: 'Juno', frame: CH.juno, role: 'Rancher',
    birthday: { season: 'winter', day: 8 },
    map: 'town',
    route: [{ x: 22, y: 23, wait: 15 }, { x: 34, y: 23, wait: 20 }, { x: 34, y: 20, wait: 10 }, { x: 22, y: 20, wait: 15 }],
    hours: [7 * 60, 17 * 60],
    loves: ['milk', 'pineapple'], likes: ['egg', 'corn', 'carrot', 'turnip'], dislikes: ['pepper'],
    lines: [
      ["I'm Juno! My family's ranch is south of here.", "We'll have chicks and calves to sell once the barn's rebuilt.", 'Animals need feeding every day. No skipping!'],
      ['You look like someone who could handle a cow or two.', 'Carrots make the horses dance. True story.'],
      ['You take care of things. Land, people... you just do.', "I'm glad you came to Brookhollow."],
    ],
    lovedLine: 'No way! This is my favorite thing in the world!',
    likedLine: 'Straight from your field? Wonderful!',
    neutralLine: 'Aw, thanks!',
    dislikedLine: 'Peppers... my one weakness. In the bad way.',
    birthdayLine: 'A birthday gift? You are the best!',
  },
};

export const HEART_PER = 100;
export const MAX_FRIENDSHIP = 1000;
export const FRIENDSHIP = {
  talk: 10,
  loved: 80,
  liked: 40,
  neutral: 15,
  disliked: -30,
  birthdayMultiplier: 3,
};

export function heartTier(friendship: number): number {
  const hearts = Math.floor(friendship / HEART_PER);
  return hearts >= 6 ? 2 : hearts >= 3 ? 1 : 0;
}

export function hearts(friendship: number): number {
  return Math.min(10, Math.floor(friendship / HEART_PER));
}
