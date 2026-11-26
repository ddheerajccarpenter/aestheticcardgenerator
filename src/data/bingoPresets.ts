export type BingoKindId = 'classic' | 'bucket-list' | 'movie-night' | 'road-trip';

export interface BingoPalette {
  id: string;
  name: string;
  bg: string;
  ink: string;
  border: string;
  stampBg: string;
  stampInk: string;
  cellBg: string;
}

export interface BingoKindConfig {
  id: BingoKindId;
  label: string;
  shortDesc: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultPaletteId: string;
  prompts: string[];
}

export const BINGO_PALETTES: BingoPalette[] = [
  {
    id: 'archival-cream',
    name: 'Archival Cream',
    bg: '#f4ede4',
    ink: '#2c2825',
    border: '#c9beaf',
    stampBg: '#a83f2b',
    stampInk: '#ffffff',
    cellBg: '#faf6f0',
  },
  {
    id: 'sage-linen',
    name: 'Sage Linen',
    bg: '#eaf0e8',
    ink: '#182d1f',
    border: '#b8c7b5',
    stampBg: '#235337',
    stampInk: '#ffffff',
    cellBg: '#f4f8f2',
  },
  {
    id: 'projection-room',
    name: 'Projection Room',
    bg: '#191715',
    ink: '#f1ebdd',
    border: '#48413a',
    stampBg: '#e2d9c8',
    stampInk: '#171717',
    cellBg: '#24211e',
  },
  {
    id: 'travel-vintage',
    name: 'Travel Vintage',
    bg: '#f5edd6',
    ink: '#143742',
    border: '#c7bba0',
    stampBg: '#183c48',
    stampInk: '#f5edd6',
    cellBg: '#fbf6e8',
  },
];

export const BINGO_KINDS: BingoKindConfig[] = [
  {
    id: 'classic',
    label: 'Classic 75-Ball',
    shortDesc: 'Traditional 1–75 column numbers',
    defaultTitle: 'CLASSIC BINGO',
    defaultSubtitle: '75-BALL EDITION',
    defaultPaletteId: 'archival-cream',
    prompts: [],
  },
  {
    id: 'bucket-list',
    label: 'Bucket List',
    shortDesc: 'Cozy weekend & creative prompts',
    defaultTitle: 'WEEKEND BINGO',
    defaultSubtitle: 'SLOW LIVING EDITION',
    defaultPaletteId: 'sage-linen',
    prompts: [
      'Read 20 pages',
      'Bake from scratch',
      'Morning walk',
      'No phone for 2h',
      'Write a postcard',
      'Visit a bookstore',
      'Try a new tea',
      'Tidy one drawer',
      'Sketch or doodle',
      'Cook a family recipe',
      'Watch the sunset',
      'Listen to a full album',
      'Call an old friend',
      'Fresh flowers',
      'Stretch for 15 min',
      'Journal 3 lines',
      'Visit a farmers market',
      'Declutter desktop',
      'Make iced coffee',
      'Learn 5 words',
      'Candlelit dinner',
      'Photo walk',
      'Donate 3 items',
      'Early bedtime',
      'Handwritten note',
      'Try a new café',
      'Water all plants',
      'Screen-free lunch',
    ],
  },
  {
    id: 'movie-night',
    label: 'Movie Night',
    shortDesc: 'Cinema tropes & watch-party moments',
    defaultTitle: 'WATCH PARTY',
    defaultSubtitle: 'CINEMA BINGO',
    defaultPaletteId: 'projection-room',
    prompts: [
      'Rainy window scene',
      'Montage sequence',
      'Unexpected cameo',
      'Dramatic walk-away',
      'Needle drop hits',
      'Plot twist',
      'Car won’t start',
      'Training montage',
      'Slow-mo entrance',
      'Spilled coffee',
      'Overheard secret',
      'Title card drop',
      'Elevator silence',
      'Last-second save',
      'Flashback scene',
      'Mirror reflection',
      'Suitcase packed',
      'Airport sprint',
      ' Diner booth talk',
      'Power goes out',
      'Credits roll early',
      'Post-credit tease',
      'Iconic one-liner',
      'Rooftop talk',
      'Old photo clue',
      'Missed phone call',
      'Standing ovation',
      'Quiet ending',
    ],
  },
  {
    id: 'road-trip',
    label: 'Road Trip',
    shortDesc: 'Highway sights & travel scavenger',
    defaultTitle: 'ROAD TRIP',
    defaultSubtitle: 'HIGHWAY SCAVENGER',
    defaultPaletteId: 'travel-vintage',
    prompts: [
      'Yellow car',
      'Vintage motel sign',
      'Windmill',
      'Train crossing',
      'State border sign',
      'Roadside diner',
      'Bridge over river',
      'Convertible',
      'Water tower',
      'Bike on a roof rack',
      'Barn quilt',
      'Scenic overlook',
      'Classic pickup',
      'Red tractor',
      'Mountain peak',
      'Lighthouse or lake',
      'Fruit stand',
      'Camper van',
      'Double-decker bus',
      'Neon open sign',
      'Tunnel',
      'Covered bridge',
      'Hot air balloon',
      'Cow herd',
      'Out-of-state plate',
      'Sunburst clouds',
      'Mile marker 100',
      'Gas station snack',
    ],
  },
];

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateBingoCells(kindId: BingoKindId): string[] {
  if (kindId === 'classic') {
    // Standard 75-ball: B(1-15), I(16-30), N(31-45), G(46-60), O(61-75)
    const columns = [0, 1, 2, 3, 4].map((col) => {
      const start = col * 15 + 1;
      const pool = Array.from({ length: 15 }, (_, idx) => String(start + idx));
      return shuffleArray(pool).slice(0, 5);
    });
    const cells: string[] = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        cells.push(row === 2 && col === 2 ? 'FREE' : columns[col][row]);
      }
    }
    return cells;
  }

  const config = BINGO_KINDS.find((k) => k.id === kindId) ?? BINGO_KINDS[1];
  const picked = shuffleArray(config.prompts).slice(0, 24).map((p) => p.trim());
  return [...picked.slice(0, 12), 'FREE', ...picked.slice(12, 24)];
}
