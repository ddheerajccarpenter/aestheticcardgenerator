import type { GuideArticle } from '../types/card';

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'how-to-make-aesthetic-text-cards',
    path: '/guides/how-to-make-aesthetic-text-cards',
    title: 'How to Make Aesthetic Text Cards: The Editorial Typesetting Guide',
    subtitle: 'A step-by-step guide to transforming raw thoughts into tactile, archival stationery artifacts.',
    description:
      'Learn the core principles of editorial typography, negative space, and analog paper textures to create timeless aesthetic text cards.',
    metaTitle: 'How to Make Aesthetic Text Cards — Typesetting & Design Guide',
    metaDescription:
      'Comprehensive guide to making aesthetic text cards. Learn optimal line measures, margin ratios, paper palettes, and export standards.',
    category: 'Foundations & Craft',
    readTime: '6 min read',
    publishedDate: 'October 2026',
    featuredAspect: '1:1',
    recommendedTemplateIds: ['st-germain-editorial', 'camus-summer'],
    actionPrompt: 'Open the Studio Editor and craft your first aesthetic card with balanced margins.',
    sections: [
      {
        heading: '1. Why Most Text Posts Fail the Aesthetic Test',
        body:
          'Most text shared online fails not because the words lack meaning, but because digital defaults are hostile to reading comfort. Default system sans-serifs, edge-to-edge margins, harsh high-contrast black backgrounds, and artificial drop shadows create cognitive strain. An authentic aesthetic card approaches text with the discipline of print bookmaking: treating negative space as an active compositional element rather than empty void.',
        bullets: [
          'Edge crowding: Text pushed right up against the container boundary feels claustrophobic.',
          'Harsh contrast: Pure white (#FFFFFF) on pure black (#000000) causes optical halation on OLED screens.',
          'Line measure runaway: Sentences stretching past 70 characters fatigue the eye during rapid scanning.',
        ],
      },
      {
        heading: '2. The Three Pillars of Editorial Typesetting',
        body:
          'When designing cards in the Studio Editor, master these three foundational controls:',
        bullets: [
          'Optical Negative Space: Maintain at least 36px to 44px of internal margin on all sides. The text block should occupy no more than 40-50% of the total card area.',
          'Archival Paper Palettes: Ground your design in real print tones. Substitute pure white with French cream (#f4ede4), warm linen (#fce7cf), or celadon mist (#e2ecf9).',
          'Curated Serif Pairing: Employ classical serifs like Newsreader or Playfair Display with refined tracking and leading to elevate philosophical and literary reflections.',
        ],
        callout: {
          title: 'Typesetting Rule of Thumb',
          text: 'If your card feels crowded, resist the urge to add graphic elements. Instead, reduce your font size by 2px and increase padding by 4px. Whitespace consistently elevates perceived value.',
        },
      },
      {
        heading: '3. Step-by-Step Creation Workflow',
        body:
          'Follow this practical workflow to typeset a text card from scratch in under two minutes:',
        bullets: [
          'Step 1: Paste your text into the Words inspector. Review line breaks to ensure phrases break at natural semantic pauses.',
          'Step 2: Select an art direction from the Palette tab. Match the emotional tone of the words (e.g., St. Germain for quiet reflection, Obsidian for stoic axioms).',
          'Step 3: Adjust the font size slider until your main quote occupies between three and six balanced lines.',
          'Step 4: Enable analog film grain at 30-40% to lend tactile physical micro-texture.',
          'Step 5: Export as a 2x Retina PNG for pixel-perfect social publishing.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-design-quote-cards',
    path: '/guides/how-to-design-quote-cards',
    title: 'How to Design Timeless Quote Cards: Hierarchy & Attribution',
    subtitle: 'Mastering attribution lines, folio headers, and hanging quotation punctuation.',
    description:
      'Learn how to typeset memorable quotes with proper typographic hierarchy, citation placement, and curled quotation marks.',
    metaTitle: 'How to Design Timeless Quote Cards — Typography & Layout Guide',
    metaDescription:
      'Master quote card design with proper author attribution, folio stamps, and optical font scaling. Free step-by-step tutorial.',
    category: 'Design Technique',
    readTime: '5 min read',
    publishedDate: 'October 2026',
    featuredAspect: '4:5',
    recommendedTemplateIds: ['oxford-navy-journal', 'coral-statement'],
    actionPrompt: 'Typeset your favorite quote into an archival card right now.',
    sections: [
      {
        heading: '1. The Anatomy of an Editorial Quote Card',
        body:
          'An editorial quote card is composed of three distinct functional layers: the Header Folio Ribbon (providing context, source archive, or date), the Central Prose Block (the quote itself), and the Signature Footer (the author and specific work cited). When these three elements maintain strict optical balance, the artifact commands respect.',
      },
      {
        heading: '2. Establishing Clear Visual Hierarchy',
        body:
          'The biggest pitfall in quote graphics is competing scale. The author name should never rival the quote text in size. Follow these proportional ratios:',
        bullets: [
          'Quote Text: Primary visual anchor, sized at 24px - 30px with comfortable 1.5x line height.',
          'Author Citation: Subordinate anchor, sized at 12px - 14px (roughly 45-50% of the quote scale), preceded by an em-dash (—).',
          'Folio Tagline: Anchoring metadata, set in small uppercase tracking (10px - 11px font-mono) with subtle 70% opacity.',
        ],
        callout: {
          title: 'Hanging Punctuation Note',
          text: 'Curled quotation marks (“ ”) carry visual weight. In traditional letterpress printing, opening quotes are optically hung into the margin so the first capital letter aligns squarely with the reading edge.',
        },
      },
      {
        heading: '3. Left-Align vs. Center-Align: When to Use Which',
        body:
          'Never default to center alignment without evaluating text length. Long passages with staggered, rag-both-sides center alignment create jagged reading paths that cause eye strain. Use left alignment for quotes exceeding three lines, and reserve center alignment strictly for short 1-2 line aphorisms.',
      },
    ],
  },
  {
    slug: 'card-sizes-for-social-media',
    path: '/guides/card-sizes-for-social-media',
    title: 'Card Sizes for Social Media: 1:1, 4:5, 9:16 & 16:9 Specifications',
    subtitle: 'The comprehensive guide to aspect ratios, pixel density, and avoiding platform compression blur.',
    description:
      'A technical breakdown of ideal card dimensions for Instagram feeds, Stories, Twitter cards, and desktop presentations.',
    metaTitle: 'Card Sizes for Social Media — Aspect Ratios & 2x Retina Specs',
    metaDescription:
      'Complete guide to social media card dimensions: 1:1 Square, 4:5 Portrait, 9:16 Stories, and 16:9 Landscape. Prevent compression blur.',
    category: 'Technical Specifications',
    readTime: '7 min read',
    publishedDate: 'October 2026',
    featuredAspect: '4:5',
    recommendedTemplateIds: ['vignelli-canon', 'dieter-rams-minimal'],
    actionPrompt: 'Choose your ideal social aspect ratio in the Studio Editor and export at 2x Retina resolution.',
    sections: [
      {
        heading: '1. Why 2x Retina Export Is Non-Negotiable',
        body:
          'Modern smartphones feature high-DPI displays (such as Apple Super Retina and Android AMOLED screens) operating at device pixel ratios of 2.0 to 3.5. If you export a 1080x1080 pixel image, modern mobile screens must interpolate those pixels across a 3x physical density, creating noticeable fuzziness around fine serif letters. Exporting at 2x Retina (2160x2160 pixels) ensures your text remains razor-sharp when rendered on mobile feeds.',
      },
      {
        heading: '2. The 4:5 Social Portrait Advantage',
        body:
          'For Instagram and Threads feeds, the 4:5 aspect ratio (1080x1350 at 1x, or 2160x2700 at 2x) is the undisputed gold standard. A 4:5 card commands approximately 25% more vertical viewport real estate than a standard 1:1 square, slowing down fast-scrolling readers and providing vital vertical headroom for multi-line quotes.',
      },
      {
        heading: '3. Comprehensive Platform Sizing Matrix',
        body:
          'Reference this exact dimension table when choosing your project aspect ratio:',
        bullets: [
          'Square (1:1) — 2160 x 2160 px: Best for evergreen profile grids, Twitter/X cards, and carousel slides.',
          'Social Portrait (4:5) — 2160 x 2700 px: Ideal for Instagram in-feed posts, Threads, and LinkedIn image attachments.',
          'Story / Reel (9:16) — 2160 x 3840 px: Essential for Instagram Stories, TikTok text cards, and smartphone lockscreen wallpapers.',
          'Landscape (16:9) — 3840 x 2160 px: Optimal for newsletter header banners, YouTube community tabs, and slide decks.',
        ],
      },
    ],
  },
  {
    slug: 'typography-and-text-readability',
    path: '/guides/typography-and-text-readability',
    title: 'Typography & Text Readability: Kerning, Contrast & Font Stacks',
    subtitle: 'How to pair classical serifs and modern sans fonts without sacrificing legibility.',
    description:
      'Deep dive into font psychology, x-heights, contrast ratios, and line height calculation for digital card layouts.',
    metaTitle: 'Typography & Text Readability Guide — Font Stacks & Kerning',
    metaDescription:
      'Learn typographic principles for card design: font pairing, x-height balance, WCAG contrast, and line spacing.',
    category: 'Foundations & Craft',
    readTime: '6 min read',
    publishedDate: 'October 2026',
    featuredAspect: '1:1',
    recommendedTemplateIds: ['st-germain-editorial', 'obsidian-monochrome'],
    actionPrompt: 'Experiment with classical serifs and tabular monospace fonts in the Studio Editor.',
    sections: [
      {
        heading: '1. The Psychology of the Four Font Families',
        body:
          'Our generator provides four distinct typographic stacks, each engineered for specific emotional resonance:',
        bullets: [
          'Newsreader (Editorial Serif): High optical flexibility with warm, literary proportions. Evokes literary magazines and classic novels.',
          'Playfair Display (Display Serif): Pronounced thick-to-thin stroke contrast. Ideal for expressive poetic fragments and aphorisms.',
          'Inter (Humanist Sans): Neutral, hyper-legible geometry with tall x-height. Perfect for actionable axioms, design advice, and notes.',
          'JetBrains Mono (Tabular Code): Fixed-width character spacing with technical authority. Ideal for mental models and study flashcards.',
        ],
      },
      {
        heading: '2. Contrast Ratios & Ink Colors',
        body:
          'Contrast is essential for accessibility, but excessive harsh contrast causes visual fatigue. The sweet spot for comfortable reading is a contrast ratio between 7:1 and 12:1. Instead of pairing #000000 on #FFFFFF (which creates a harsh 21:1 stark contrast), use rich charcoal inks like #2c2825 or #181d26 over warm cream paper (#f4ede4).',
      },
      {
        heading: '3. Line Height and Character Measure',
        body:
          'When line height is too tight (under 1.3x), ascending letters collide with descending letters. When line height is too loose (over 1.8x), lines disconnect and disrupt reading flow. Keep line height set to a balanced 1.5x to 1.6x for multi-line quotes.',
      },
    ],
  },
  {
    slug: 'how-to-make-a-book-review-card',
    path: '/guides/how-to-make-a-book-review-card',
    title: 'How to Make a Book Review Card: Highlighting Literary Insights',
    subtitle: 'Turn book highlights and critical takeaways into aesthetic Bookstagram cards.',
    description:
      'Structure book excerpts, marginalia, and reading recommendations into disciplined cards that celebrate ideas over hype.',
    metaTitle: 'How to Make a Book Review Card — Bookstagram & Reading Notes',
    metaDescription:
      'Step-by-step guide to designing book review cards and reading excerpts for Bookstagram and literary newsletters.',
    category: 'Specific Card Formats',
    readTime: '5 min read',
    publishedDate: 'October 2026',
    featuredAspect: '4:5',
    recommendedTemplateIds: ['cambridge-notes', 'aurelius-meditations'],
    actionPrompt: 'Take a favorite passage from your current book and typeset a review card.',
    sections: [
      {
        heading: '1. Shifting from Promotional Collages to Thought Cards',
        body:
          'Bookstagram feeds are crowded with staged coffee cups and cluttered book jackets. What readers actually seek is intellectual resonance—a single passage or perspective shift that changes how they perceive the world. A book review card isolates this passage and presents it with literary dignity.',
      },
      {
        heading: '2. Structuring Your Review Layout',
        body:
          'Use the three card metadata zones strategically:',
        bullets: [
          'Header Tag: The book title and chapter or book number (e.g. "ESSAYS • ON THE BREVITY OF LIFE").',
          'Corner Badge: Your reading status, star rating, or volume archive (e.g. "CANON • 5/5").',
          'Main Quote: The most resonant single sentence from the book—avoid long rambling summaries.',
          'Footer Signature: The author name, publication year, and translator credit.',
        ],
      },
    ],
  },
  {
    slug: 'digital-journal-card-design',
    path: '/guides/digital-journal-card-design',
    title: 'Digital Journal Card Design: Preserving Daily Reflections',
    subtitle: 'How to document habit milestones, gratitude prompts, and private breakthroughs.',
    description:
      'Design personal digital journal cards with calm colorways, date badges, and mindful typographic pacing.',
    metaTitle: 'Digital Journal Card Design — Mindful Reflection Cards Guide',
    metaDescription:
      'Aesthetic design guide for digital journal cards. Learn how to format daily insights, habit reflections, and morning pages.',
    category: 'Specific Card Formats',
    readTime: '5 min read',
    publishedDate: 'October 2026',
    featuredAspect: '4:5',
    recommendedTemplateIds: ['rubin-morning', 'camus-summer'],
    actionPrompt: 'Capture today’s key reflection in a quiet journal card.',
    sections: [
      {
        heading: '1. The Value of Atomic Reflections',
        body:
          'Traditional journal entries can feel sprawling and difficult to revisit. An atomic journal card forces you to synthesize your daily thoughts into a single core realization. Condensing an experience into 25 words clarifies your thinking and creates an archive of personal growth.',
      },
      {
        heading: '2. Selecting Calm Palettes for Mindful Focus',
        body:
          'Colors influence emotional state. For reflective journaling, choose soothing pastel and linen palettes:',
        bullets: [
          'Celadon Mist (#e2ecf9): Fresh morning clarity for goal setting and habit milestones.',
          'Tuscan Peach (#fcab79): Warm, contemplative afternoon and gratitude reflections.',
          'Warm Linen (#fce7cf): Classic notebook texture for evening brain dumps and lessons learned.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-use-scrapbook-card-styles',
    path: '/guides/how-to-use-scrapbook-card-styles',
    title: 'How to Use Scrapbook Card Styles: Kraft Paper & Vintage Textures',
    subtitle: 'Recreating tactile stationery ephemera, antique seals, and botanical stamps in the browser.',
    description:
      'Learn how to leverage procedural grain layers, warm kraft tones, and corner ornaments for vintage aesthetic cards.',
    metaTitle: 'Scrapbook Card Styles Guide — Kraft Paper & Vintage Ephemera',
    metaDescription:
      'How to design scrapbook-style cards with kraft paper tones, analog film grain, and vintage ornaments online.',
    category: 'Specific Card Formats',
    readTime: '5 min read',
    publishedDate: 'October 2026',
    featuredAspect: '1:1',
    recommendedTemplateIds: ['camus-summer', 'emily-dickinson-mint'],
    actionPrompt: 'Typeset a vintage scrapbook card with unbleached kraft paper textures.',
    sections: [
      {
        heading: '1. Emulating Physical Paper Grain Without Heavy Images',
        body:
          'Traditional photo editors rely on large 5MB raster paper texture images that slow down performance. Our Studio Editor utilizes procedural SVG radial grain masks blended with CSS multiply blend modes. This delivers authentic paper tooth and unbleached fiber appearance while generating instantly in browser memory.',
      },
      {
        heading: '2. Pairing Vintage Tones and Ornaments',
        body:
          'To achieve an authentic antique stationary aesthetic:',
        bullets: [
          'Pair Antique Parchment (#efe6d5) or Warm Kraft (#fce7cf) with dark espresso ink (#342f2b).',
          'Activate the corner foliage ornament glyph (such as auto_awesome or bookmark) for an antique seal effect.',
          'Keep corner rounding at 12px to 16px to simulate hand-cut rounded paper corners.',
        ],
      },
    ],
  },
];
