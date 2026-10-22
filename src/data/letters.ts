export interface Letter {
  id: string;
  from: string;
  subject: string;
  body: string[];
}

/** {name} and {farm} are replaced with the player's choices */
export const LETTERS: Record<string, Letter> = {
  welcome: {
    id: 'welcome',
    from: 'Mayor Hollis',
    subject: 'Welcome to Brookhollow',
    body: [
      'Dear {name},',
      "Welcome to {farm} Farm. Your great-uncle worked that land for forty years, and I know he'd be glad to see it in family hands again.",
      "I'll be honest: the village council isn't sure a newcomer can bring it back. So here is our agreement. You have three years. On the first day of spring in Year 4 I'll walk the farm with you, and if it's thriving, it's yours for good.",
      "Start small. Clear a patch of the field, till it with your hoe, and plant the turnip seeds your uncle left behind. Water them every day unless it rains. Ship what you harvest in the bin by the house; the buyer collects at night and pays in the morning.",
      "Nell's general store in the village sells seeds. Mind the hours: nine to five, closed Wednesdays.",
      'Rooting for you,',
      'Hollis',
    ],
  },
  summer: {
    id: 'summer', from: 'Nell', subject: 'Summer seeds are in!',
    body: ['Hi {name}!', 'Tomatoes, corn, onions and even pineapples are on the shelves now. Spring crops won\'t survive the heat, so clear them out.', '- Nell'],
  },
  fall: {
    id: 'fall', from: 'Nell', subject: 'Autumn harvest',
    body: ['Hi {name}!', 'Carrots, sweet potatoes, eggplants and peppers are in stock for autumn. They fetch good prices in the city.', '- Nell'],
  },
  winter: {
    id: 'winter', from: 'Mayor Hollis', subject: 'Winter on the farm',
    body: ['{name},', "Nothing grows outdoors in winter here. Rest, mend your tools, and get to know your neighbours. A greenhouse would let you farm through the cold - we'll talk about that once the carpenter is back.", '- Hollis'],
  },
};
