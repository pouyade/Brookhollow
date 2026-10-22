import { CH } from '../gfx/kenney';

export interface NpcDef {
  id: string;
  name: string;
  frame: number;
  /** waypoints in town tile coords; npc walks the loop, pausing at each */
  route: { x: number; y: number; wait: number }[];
  likes: string[]; // item ids that give bonus friendship
  /** dialogue tiers: 0-2 hearts, 3-5 hearts, 6+ hearts */
  lines: string[][];
  likedLine: string;
  neutralLine: string;
}

export const NPCS: Record<string, NpcDef> = {
  anna: {
    id: 'anna', name: 'Anna', frame: CH.anna,
    route: [
      { x: 12, y: 12, wait: 6 }, { x: 15, y: 12, wait: 4 },
      { x: 15, y: 15, wait: 5 }, { x: 12, y: 15, wait: 4 },
    ],
    likes: ['strawberry', 'cabbage', 'milk'],
    lines: [
      ["Welcome to Mineral Village!", "My family runs the general store.", "Seeds change with the seasons, so check back often!"],
      ["Oh, hi there! Your farm is really coming along.", "Strawberries are my favorite... just saying!"],
      ["You're practically family now.", "I always smile when I see you walk in."],
    ],
    likedLine: "For me?! This is my favorite! Thank you so much!",
    neutralLine: "Oh, a gift? That's very kind of you.",
  },
  greg: {
    id: 'greg', name: 'Greg', frame: CH.greg,
    route: [
      { x: 23, y: 13, wait: 8 }, { x: 25, y: 13, wait: 5 },
      { x: 25, y: 16, wait: 6 }, { x: 21, y: 16, wait: 5 },
    ],
    likes: ['potato', 'corn', 'egg'],
    lines: [
      ["I'm Greg, the blacksmith.", "Bring me gold and I'll upgrade your tools.", "A good tool makes a good farmer."],
      ["Your tools are looking well-used. That's a good sign.", "An upgraded hoe tills three squares at once, you know."],
      ["You've got the hands of a true farmer now.", "It's been an honor keeping your tools sharp, friend."],
    ],
    likedLine: "Ha! Now that's a fine gift. Much obliged!",
    neutralLine: "Hm. Thanks, I suppose.",
  },
  maria: {
    id: 'maria', name: 'Maria', frame: CH.maria,
    route: [
      { x: 8, y: 18, wait: 4 }, { x: 17, y: 18, wait: 6 },
      { x: 17, y: 8, wait: 5 }, { x: 8, y: 8, wait: 6 },
    ],
    likes: ['turnip', 'tomato', 'carrot'],
    lines: [
      ["Oh! Hello. I'm Maria.", "I love walking around the village square.", "Have you visited the pond? It's lovely."],
      ["I saw your farm from the hill. The crops look healthy!", "Fresh vegetables are the best part of village life."],
      ["Walking with you would be nice someday...", "I mean-- the weather! Lovely weather today!"],
    ],
    likedLine: "This is so fresh! You grew this? Amazing!",
    neutralLine: "Thank you! That's sweet of you.",
  },
  lily: {
    id: 'lily', name: 'Lily', frame: CH.lily,
    route: [
      { x: 29, y: 7, wait: 8 }, { x: 32, y: 7, wait: 5 },
      { x: 32, y: 10, wait: 6 }, { x: 29, y: 10, wait: 4 },
    ],
    likes: ['egg', 'milk', 'corn'],
    lines: [
      ["Welcome to the ranch! I'm Lily.", "We sell chickens, cows, and animal supplies.", "Feed your animals every day or they won't produce!"],
      ["How are your animals doing? Fed and happy, I hope!", "A cow needs fodder every single day. No skipping!"],
      ["You take such good care of your animals.", "They're lucky to have you. And so are we."],
    ],
    likedLine: "Straight from a happy animal! You're wonderful!",
    neutralLine: "Aw, thanks! That's kind.",
  },
};

export const HEART_PER = 100;
export const MAX_FRIENDSHIP = 1000;

export function heartTier(friendship: number): number {
  const hearts = Math.floor(friendship / HEART_PER);
  return hearts >= 6 ? 2 : hearts >= 3 ? 1 : 0;
}
