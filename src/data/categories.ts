import type { CategoryMeta } from '../types/card';

export const TEMPLATE_CATEGORIES: CategoryMeta[] = [
  {
    id: 'aesthetic-text-cards',
    slug: 'aesthetic-text-cards',
    path: '/templates/aesthetic-text-cards',
    title: 'Aesthetic Text Cards',
    subtitle: 'Tactile, archival paper cards for evocative words and creative fragments.',
    description:
      'Transform poetic lines, aphorisms, and micro-essays into balanced digital cards with subtle paper grains and editorial serif typography.',
    longDescription:
      'Aesthetic text cards bridge digital brevity with the physical intimacy of printed stationery. Rather than posting raw text or generic screenshots, this format treats type as a physical imprint on archival linen, soft parchment, or cream cardstock. Designed for writers, poets, and curatorial accounts who value balanced negative space, hanging quotation marks, and subdued earthy tones.',
    useCase:
      'Ideal for creative writers sharing original poetry, designers posting typographic axioms, curated quote accounts on Instagram and Threads, and newsletters highlighting key passages.',
    designTips: [
      'Keep quote lengths between 15 and 45 words to allow comfortable 36px margins on all four sides.',
      'Use Newsreader or Playfair serif styles for literary and contemplative text.',
      'Pair soft cream or St. Germain backgrounds with deep espresso ink (#2c2825) rather than pure harsh black.',
      'Enable analog film grain at 30-40% opacity to introduce tactile micro-texture.',
    ],
    bestAspectRatios: ['1:1', '4:5'],
    matchedTemplateIds: ['st-germain-editorial', 'camus-summer', 'rilke-torso'],
    metaTitle: 'Aesthetic Text Cards — Curated Typography & Archival Presets',
    metaDescription:
      'Design aesthetic text cards online for free with editorial serifs, paper grain textures, and balanced margins. 100% browser-based with instant 2x Retina download.',
    keywords: [
      'aesthetic text cards',
      'quote card generator',
      'editorial typography cards',
      'instagram quote template',
      'paper texture cards',
    ],
    faq: [
      {
        q: 'What makes a text card feel genuinely aesthetic rather than generic?',
        a: 'The difference lies in typographic hierarchy and breathing room. Authentic editorial cards use deliberate line lengths (45-65 characters), generous margins (36-44px), organic paper palettes (such as French paper cream and warm linen), and avoid harsh pure black backgrounds.',
      },
      {
        q: 'Can I export cards without watermarks?',
        a: 'Yes. All cards generate entirely inside your browser memory without watermarks, tracking, or account requirements.',
      },
    ],
  },
  {
    id: 'quote-cards',
    slug: 'quote-cards',
    path: '/templates/quote-cards',
    title: 'Editorial Quote Cards',
    subtitle: 'Classic literary, architectural, and philosophical quotes rendered with timeless dignity.',
    description:
      'Format memorable thoughts, historical speeches, and philosophical passages with precise citation blocks and folio headers.',
    longDescription:
      'Memorable quotes deserve more than default sans-serif overlays. Our editorial quote card templates draw inspiration from classic monograph book jackets, mid-century architectural manifests, and literary reviews. Featuring structured citation rules, folio metadata tags, and optical font scaling to ensure the author and context receive equal dignity.',
    useCase:
      'Perfect for book clubs, literature teachers, philosophy podcasters, and editorial curators seeking to share passages from classic texts and contemporary thought leaders.',
    designTips: [
      'Ensure the citation line is styled at 40-50% the font size of the primary quote to maintain clear reading hierarchy.',
      'Use folio taglines (e.g. "ESSAY NO. 12 • RETURN TO TIPASA") to anchor historical context.',
      'Left-align quotes with more than three lines for natural eye tracking; reserve center alignment for brief 1-2 line axioms.',
    ],
    bestAspectRatios: ['1:1', '4:5'],
    matchedTemplateIds: ['oxford-navy-journal', 'st-germain-editorial', 'coral-statement'],
    metaTitle: 'Editorial Quote Card Generator — Timeless Typography & Citations',
    metaDescription:
      'Typeset literary and philosophical quotes into elegant editorial cards. Features folio metadata, optical kerning, and lossless export.',
    keywords: [
      'quote card creator',
      'literary quote maker',
      'philosophy quote cards',
      'book excerpt graphics',
      'typesetting quote templates',
    ],
    faq: [
      {
        q: 'How do I handle long quotes without crowding the card?',
        a: 'When pasting quotes over 200 characters, reduce the font size from 26px to 20-22px and increase card margins. You can also use the 4:5 vertical portrait aspect ratio to give multi-line passages additional vertical breathing room.',
      },
      {
        q: 'Are quotation marks included automatically?',
        a: 'Yes, quotes are rendered with balanced curled quotation marks that align optically with the text margins.',
      },
    ],
  },
  {
    id: 'journal-cards',
    slug: 'journal-cards',
    path: '/templates/journal-cards',
    title: 'Digital Journal Cards',
    subtitle: 'Reflective morning notes, gratitude prompts, and contemplative daily fragments.',
    description:
      'Capture private insights, habit reflections, and morning journal entries with date badges, calm palettes, and intimate spacing.',
    longDescription:
      'Journaling is fundamentally an act of slowing down. Digital journal cards mirror this mindful cadence by pairing peaceful celadon, soft peach, and antique parchment palettes with date stamps, volume numbers, and humanist sans-serif type. Whether recording a daily breakthrough or a quiet evening reflection, the layout keeps attention focused on personal truth.',
    useCase:
      'Used by mindfulness practitioners, bullet journal enthusiasts, wellness coaches, and reflective creators who document daily lessons, weekly reviews, and intentions.',
    designTips: [
      'Use the corner badge to denote date, journal day count (e.g. "DAY 42"), or volume number.',
      'Select soothing colorways like Celadon Mist or Tuscan Peach to evoke calmness.',
      'Opt for clean humanist sans-serifs like Inter for an approachable, modern notebook feel.',
    ],
    bestAspectRatios: ['4:5', '9:16'],
    matchedTemplateIds: ['rubin-morning', 'camus-summer'],
    metaTitle: 'Digital Journal Card Templates — Mindful Daily Reflection Cards',
    metaDescription:
      'Create beautiful digital journal cards with date badges, soft paper tones, and clean typography. Perfect for personal reflection and daily habits.',
    keywords: [
      'digital journal cards',
      'daily reflection card maker',
      'gratitude quote cards',
      'bullet journal social cards',
      'morning note templates',
    ],
    faq: [
      {
        q: 'Can I export journal cards for smartphone wallpapers or Stories?',
        a: 'Yes. Switch the canvas aspect ratio to 9:16 Story / Reel to format your journal card for vertical mobile screens and Instagram Stories.',
      },
      {
        q: 'Does anyone else see my journal notes?',
        a: 'Never. Processing is 100% client-side in your local browser memory. Your personal thoughts are never transmitted to any server.',
      },
    ],
  },
  {
    id: 'book-review-cards',
    slug: 'book-review-cards',
    path: '/templates/book-review-cards',
    title: 'Book Review Cards',
    subtitle: 'Structured reading notes, book critique excerpts, and memorable marginalia.',
    description:
      'Format book titles, star ratings, favorite passages, and critical assessments into structured literary artifacts.',
    longDescription:
      'Book reviewers and reading communities need an elegant alternative to busy book-cover collages. Book review cards provide a disciplined typographic template: a header tag for the author and publication year, a bold central thesis or excerpt, and an archival footer for the reviewer’s verdict. Built to highlight the substance of the book rather than promotional clutter.',
    useCase:
      'Designed for Bookstagram creators, Goodreads reviewers, literary essayists, and podcast hosts publishing reading lists and thoughtful critiques.',
    designTips: [
      'Structure the header with book title and publication date (e.g. "MEDITATIONS • BOOK IV").',
      'Highlight a single sentence that captures the core philosophical thesis of the chapter.',
      'Use the corner badge to represent book edition numbers or rating scores.',
    ],
    bestAspectRatios: ['4:5', '1:1'],
    matchedTemplateIds: ['cambridge-notes', 'vignelli-canon', 'aurelius-meditations'],
    metaTitle: 'Book Review Card Generator — Literary Notes & Bookstagram Cards',
    metaDescription:
      'Design clean book review cards and literature excerpt graphics with bookish serifs and structured citations. Free and browser-native.',
    keywords: [
      'book review card generator',
      'bookstagram quote maker',
      'reading note templates',
      'literature card graphics',
      'book review layout',
    ],
    faq: [
      {
        q: 'How do I credit multiple authors or translators?',
        a: 'You can use the author field to include both original author and translator (e.g. "Marcus Aurelius — Translated by Gregory Hays") for complete academic rigor.',
      },
    ],
  },
  {
    id: 'study-note-cards',
    slug: 'study-note-cards',
    path: '/templates/study-note-cards',
    title: 'Study Note Cards',
    subtitle: 'High-yield conceptual definitions, mental models, and knowledge summaries.',
    description:
      'Summarize key principles, cognitive heuristics, and revision notes with monospaced precision and high-contrast clarity.',
    longDescription:
      'Retaining complex knowledge requires distilling large volumes of text into atomic, memorable concepts. Study note cards utilize high-contrast layouts, monospaced metadata, and clear typographic anchors to produce memorable visual flashcards. Ideal for studying engineering principles, historical milestones, and mental models.',
    useCase:
      'Created for students, software engineers, medical professionals, and lifelong learners publishing visual summaries and flashcards.',
    designTips: [
      'Employ JetBrains Mono for technical codes, formula axioms, and tabular terminology.',
      'Keep definitions concise and punchy—one core mental model per card.',
      'Use sharp border boundaries and clear category taglines (e.g. "SYS.COGNITION • REF 04").',
    ],
    bestAspectRatios: ['1:1', '16:9'],
    matchedTemplateIds: ['obsidian-monochrome', 'cambridge-notes', 'dieter-rams-minimal'],
    metaTitle: 'Study Note Cards — Mental Models & Revision Flashcard Generator',
    metaDescription:
      'Typeset study notes, revision cards, and technical mental models into high-contrast digital artifacts with monospace and serif fonts.',
    keywords: [
      'study note card maker',
      'revision card generator',
      'mental model graphics',
      'flashcard maker aesthetic',
      'student notes typography',
    ],
    faq: [
      {
        q: 'Can I print these cards on physical paper?',
        a: 'Yes. The 2x Retina PNG export outputs at high resolution (up to 2160x2160 pixels), which prints with sharp edges on desktop inkjet and laser printers.',
      },
    ],
  },
  {
    id: 'scrapbook-cards',
    slug: 'scrapbook-cards',
    path: '/templates/scrapbook-cards',
    title: 'Scrapbook Text Cards',
    subtitle: 'Warm kraft paper, vintage ephemera, and tactile collage aesthetics.',
    description:
      'Recreate the nostalgic warmth of physical scrapbooking with warm fiber paper, antique stamps, and weathered print tones.',
    longDescription:
      'Scrapbook text cards bring the warmth of physical paper ephemera into the digital realm. Combining warm linen, weathered kraft cardboard, and vintage botanical stamps with classic humanist serif fonts, these templates feel like treasured keepsakes discovered between the yellowed pages of an antique journal.',
    useCase:
      'Loved by scrapbook hobbyists, vintage aesthetics enthusiasts, heritage accounts, and memory-keepers looking to commemorate meaningful moments.',
    designTips: [
      'Choose the Warm Kraft (#fce7cf) or Antique Parchment (#efe6d5) colorways.',
      'Turn on Analog Film Grain to emulate physical unbleached paper fibers.',
      'Select the botanical or bookmark glyph in the corner ornament options.',
    ],
    bestAspectRatios: ['1:1', '4:5'],
    matchedTemplateIds: ['camus-summer', 'aurelius-meditations', 'emily-dickinson-mint'],
    metaTitle: 'Scrapbook Text Cards — Vintage Kraft Paper & Ephemera Typography',
    metaDescription:
      'Design scrapbook-style digital cards with kraft paper textures, antique ornaments, and vintage typography. Free, client-side, and high-resolution.',
    keywords: [
      'scrapbook text cards',
      'vintage quote card maker',
      'kraft paper card template',
      'retro paper graphics',
      'journal scrapbook typography',
    ],
    faq: [
      {
        q: 'How is the paper grain created?',
        a: 'The analog texture is generated client-side via procedural SVG grain noise layers blended in multiply mode, ensuring zero heavy image downloads.',
      },
    ],
  },
  {
    id: 'minimal-cards',
    slug: 'minimal-cards',
    path: '/templates/minimal-cards',
    title: 'Minimalist Monochrome Cards',
    subtitle: 'Radical negative space, Swiss modernist typography, and gallery monochrome.',
    description:
      'Embrace the discipline of Dieter Rams and Massimo Vignelli with sparse, razor-sharp typography and uncompromising clarity.',
    longDescription:
      'Minimalism is not the absence of design; it is the presence of clarity. Minimalist monochrome cards eliminate all unnecessary ornamental distractions, letting line weight, letter-spacing, and stark contrast communicate truth. Based on Swiss International Typographic Style and Braun functionalism, these cards present ideas with architectural authority.',
    useCase:
      'Essential for product designers, architects, tech essayists, minimalist lifestyle curators, and brand strategists.',
    designTips: [
      'Use Gallery White (#ffffff) or Obsidian Dark (#18191c) with zero background noise.',
      'Select Inter Clean Sans or JetBrains Tabular Mono with generous padding (40px+).',
      'Let whitespace occupy at least 60% of the card area.',
    ],
    bestAspectRatios: ['1:1', '16:9'],
    matchedTemplateIds: ['obsidian-monochrome', 'dieter-rams-minimal', 'vignelli-canon'],
    metaTitle: 'Minimalist Monochrome Cards — Modern Swiss Typography Templates',
    metaDescription:
      'Create striking minimalist cards with stark monochrome palettes and Swiss modernist typography. Fast, free, and distraction-free.',
    keywords: [
      'minimalist text cards',
      'monochrome quote maker',
      'swiss typography cards',
      'black and white quote graphics',
      'modernist design cards',
    ],
    faq: [
      {
        q: 'Why avoid colored backgrounds in minimalist cards?',
        a: 'Stark black and white contrasts eliminate emotional bias, focusing reader cognition directly on the structural clarity of the statement.',
      },
    ],
  },
  {
    id: 'social-text-cards',
    slug: 'social-text-cards',
    path: '/templates/social-text-cards',
    title: 'Social Text Cards',
    subtitle: 'High-impact aspect ratios optimized for Instagram, Stories, Twitter, and Threads.',
    description:
      'Format text posts with exact dimensions for social feeds (1:1, 4:5, 9:16) with crisp 2x Retina rendering that never pixelates.',
    longDescription:
      'Social media feeds compress standard images aggressively, causing blurry text and awkward cropping. Social text cards are engineered specifically for social compression algorithms: exported at crisp 2160px Retina dimensions in 1:1 Square, 4:5 Portrait, or 9:16 Story formats so your typography stays pin-sharp on high-density mobile screens.',
    useCase:
      'Built for content creators, social media managers, newsletter authors, and educators publishing text-first carousel slides and feed posts.',
    designTips: [
      'Choose 4:5 Social Portrait to maximize vertical screen real estate in mobile feeds.',
      'Use 9:16 for Instagram Stories and TikTok text overlays.',
      'Keep your core thesis above the fold with 26px font size so readers stop scrolling immediately.',
    ],
    bestAspectRatios: ['4:5', '1:1', '9:16'],
    matchedTemplateIds: ['coral-statement', 'oxford-navy-journal', 'vignelli-canon'],
    metaTitle: 'Social Text Card Generator — 4:5 & 1:1 High-Res Social Post Creator',
    metaDescription:
      'Generate aesthetic text cards formatted perfectly for Instagram 4:5, 1:1, and 9:16 Stories. Export 2x Retina PNGs without watermarks.',
    keywords: [
      'social text cards',
      'instagram 4:5 text card generator',
      'threads quote graphics',
      'social media typography maker',
      'story text card template',
    ],
    faq: [
      {
        q: 'Why is 4:5 better than 1:1 for social feeds?',
        a: 'The 4:5 portrait ratio occupies roughly 25% more vertical viewport space on mobile devices than a 1:1 square, significantly improving visibility and reading engagement.',
      },
    ],
  },
  {
    id: 'aesthetic-id-cards',
    slug: 'aesthetic-id-cards',
    path: '/templates/aesthetic-id-cards',
    title: 'Aesthetic ID Cards & Badges',
    subtitle: 'Retro passport passes, romantic soulmate cards, Y2K credentials, and kawaii badges.',
    description:
      'Format nostalgic travel licenses, soulmate clearance passes, cyberpunk studio badges, and student credentials with custom metadata, star borders, and archival typography.',
    longDescription:
      'Aesthetic ID cards have become one of the most expressive design formats on Pinterest, Instagram, and TikTok. Blending bureaucratic nostalgia with romantic, artistic, or fictional identities, these cards turn ordinary text into official-feeling physical keepsakes. From Tyler the Creator-inspired "Call Me If You Get Lost" travel licenses and romantic Soulmate Clearance Passes to Y2K cyber creative studio credentials and kawaii pastel member IDs, this collection gives you authentic passport stamps, badge tags, and monospaced codes formatted directly in your browser.',
    useCase:
      'Cherished by couples creating personalized anniversary Soulmate Passes, travelers formatting Tyler-inspired passport badges, digital designers publishing studio credentials, fandom accounts designing character member cards, and students making aesthetic campus IDs.',
    designTips: [
      'Use monospaced typography (JetBrains Mono) for official registration numbers, authorization stamps, and clearance codes.',
      'Frame your card with star borders (★ ★ ★ ★ ★) or double hairline strokes to evoke vintage passbooks and official permits.',
      'Include structured identity fields: Name, Role, Issue Date, Validity ("Forever" or "All-Access"), and Authority ("Love Department" or "Studio Archive").',
      'Choose the 1:1 or 4:5 aspect ratio for social sharing, or 9:16 for vertical mobile lockscreens and phone wallpapers.',
    ],
    bestAspectRatios: ['1:1', '4:5', '9:16'],
    matchedTemplateIds: [
      'travel-license-pass',
      'soulmate-clearance-pass',
      'y2k-creative-studio-pass',
      'kawaii-pastel-member-id',
      'campus-student-identity',
      'vip-backstage-credentials',
    ],
    metaTitle: 'Aesthetic ID Card Generator — Retro Passport Passes, Soulmate Badges & Y2K Credentials',
    metaDescription:
      'Create aesthetic ID card templates online: Call Me If You Get Lost travel passes, romantic soulmate cards, Y2K studio passes, and kawaii badges. 100% free with instant Retina export.',
    keywords: [
      'aesthetic id card template',
      'soulmate pass generator',
      'call me if you get lost id card',
      'aesthetic passport pass',
      'y2k id card template',
      'kawaii member id card',
      'vintage travel license maker',
    ],
    faq: [
      {
        q: 'How do I create a Tyler-inspired "Call Me If You Get Lost" travel pass?',
        a: 'Select the Permanent License of Travel template. It preloads the classic star-stamped border, vintage cream kraft palette (#f5edd6), monospaced license registration numbers, and travel clearance declaration. You can replace the text with your own name, travel coordinates, and issue date.',
      },
      {
        q: 'Can I print these aesthetic ID cards as physical cards or badges?',
        a: 'Yes. All cards export at 2x Retina resolution (2160x2160 or 2160x2700 pixels). You can print them on heavy cardstock or photo paper, laminate them, or place them inside clear lanyard badge holders.',
      },
      {
        q: 'Can I make a romantic Soulmate Pass for my partner?',
        a: 'Yes. The Soulmate Department Pass template comes styled with rich burgundy wine tones, delicate editorial serif typography, and clearance metadata fields (Role, Status, Valid Until: Eternity). Customize it with your partner\'s name and special anniversary date.',
      },
    ],
  },
];
