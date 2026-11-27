import type { CategoryMeta } from '../types/card';

export const TEMPLATE_CATEGORIES: CategoryMeta[] = [
  {
    id: 'aesthetic-text-cards',
    slug: 'aesthetic-text-cards',
    path: '/templates/aesthetic-text-cards',
    title: 'Aesthetic Text Cards',
    subtitle: 'Tactile, archival paper cards for evocative words and fragments.',
    description:
      'Typeset poetic lines, aphorisms, and short essays into digital cards with subtle paper grain and serif typography.',
    longDescription:
      'Aesthetic text cards pair short-form writing with the feel of printed stationery. Instead of posting raw notes app screenshots, this format treats text as ink pressed onto archival linen, soft parchment, or cream cardstock with wide margins, hanging quotation marks, and warm earth palettes.',
    useCase:
      'Built for poets, designers posting typographic axioms, quote feeds on Instagram and Threads, and newsletters highlighting key passages.',
    designTips: [
      'Keep quote lengths between 15 and 45 words to allow comfortable 36px margins on all four sides.',
      'Use Newsreader or Playfair serif styles for literary and contemplative text.',
      'Pair soft cream or St. Germain backgrounds with deep espresso ink (#2c2825) rather than pure harsh black.',
      'Enable analog film grain at 30-40% opacity to introduce tactile micro-texture.',
    ],
    bestAspectRatios: ['1:1', '4:5'],
    matchedTemplateIds: ['st-germain-editorial', 'camus-summer', 'rilke-torso'],
    metaTitle: 'Aesthetic Text Cards: Typography & Archival Presets',
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
        q: 'What separates an editorial text card from a plain notes screenshot?',
        a: 'Typography hierarchy and margin discipline make the difference: deliberate line measures (45-65 characters), generous borders (36-44px), unbleached cream or linen paper tones, and warm dark inks.',
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
    subtitle: 'Literary, architectural, and philosophical quote presets with structured citations.',
    description:
      'Format memorable thoughts, historical speeches, and philosophical passages with precise citation blocks and folio headers.',
    longDescription:
      'Memorable quotes need stronger hierarchy than default sans-serif text boxes. These templates draw from mid-century architectural manifests and classic monograph covers, pairing structured citation rules and folio header tags with scaled author lines.',
    useCase:
      'Useful for book clubs, literature teachers, philosophy podcasts, and readers sharing book passages.',
    designTips: [
      'Ensure the citation line is styled at 40-50% the font size of the primary quote to maintain clear reading hierarchy.',
      'Use folio taglines (e.g. "ESSAY NO. 12 • RETURN TO TIPASA") to anchor historical context.',
      'Left-align quotes with more than three lines for natural eye tracking; reserve center alignment for brief 1-2 line axioms.',
    ],
    bestAspectRatios: ['1:1', '4:5'],
    matchedTemplateIds: ['oxford-navy-journal', 'st-germain-editorial', 'coral-statement'],
    metaTitle: 'Editorial Quote Card Generator: Typography & Citations',
    metaDescription:
      'Typeset literary and philosophical quotes into structured editorial cards. Features folio metadata, custom typography, and lossless export.',
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
    subtitle: 'Morning notes, gratitude prompts, and dated daily log fragments.',
    description:
      'Record insights, habit notes, and morning journal entries with date badges, low-glare paper palettes, and generous spacing.',
    longDescription:
      'Journaling benefits from low visual noise. Digital journal cards pair muted celadon, soft peach, and antique parchment tones with date stamps, volume numbers, and legible humanist sans-serif type so the written entry stays central.',
    useCase:
      'Used by bullet journal keepers, coaches, and writers logging weekly notes and daily intentions.',
    designTips: [
      'Use the corner badge to denote date, journal day count (e.g. "DAY 42"), or volume number.',
      'Select soothing colorways like Celadon Mist or Tuscan Peach to soften screen glare.',
      'Opt for clean humanist sans-serifs like Inter for an approachable, modern notebook feel.',
    ],
    bestAspectRatios: ['4:5', '9:16'],
    matchedTemplateIds: ['rubin-morning', 'camus-summer'],
    metaTitle: 'Digital Journal Card Templates: Daily Reflection Cards',
    metaDescription:
      'Create digital journal cards with date badges, soft paper tones, and clean typography. Designed for personal notes and habit tracking.',
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
      'Book reviewers and reading communities need an organized alternative to busy book-cover collages. Book review cards provide a structured typographic grid: a header tag for author and publication year, a central passage, and an archival footer for the rating or edition.',
    useCase:
      'Designed for Bookstagram readers, Goodreads reviewers, essayists, and podcast hosts sharing reading notes.',
    designTips: [
      'Structure the header with book title and publication date (e.g. "MEDITATIONS • BOOK IV").',
      'Highlight a single sentence that captures the core philosophical thesis of the chapter.',
      'Use the corner badge to represent book edition numbers or rating scores.',
    ],
    bestAspectRatios: ['4:5', '1:1'],
    matchedTemplateIds: ['cambridge-notes', 'vignelli-canon', 'aurelius-meditations'],
    metaTitle: 'Book Review Card Generator: Literary Notes & Bookstagram Cards',
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
        a: 'You can use the author field to include both original author and translator (e.g. "Marcus Aurelius (Gregory Hays trans.)") for bibliographic clarity.',
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
      'Retaining complex knowledge requires distilling large volumes of text into atomic, memorable concepts. Study note cards utilize high-contrast layouts, monospaced metadata, and clear typographic anchors to produce legible flashcards for engineering principles, historical milestones, and mental models.',
    useCase:
      'Created for students, software engineers, medical professionals, and researchers publishing visual summaries and flashcards.',
    designTips: [
      'Employ JetBrains Mono for technical codes, formula axioms, and tabular terminology.',
      'Keep definitions concise: focus on one mental model per card.',
      'Use sharp border boundaries and clear category taglines (e.g. "SYS.COGNITION • REF 04").',
    ],
    bestAspectRatios: ['1:1', '16:9'],
    matchedTemplateIds: ['obsidian-monochrome', 'cambridge-notes', 'dieter-rams-minimal'],
    metaTitle: 'Study Note Cards: Mental Models & Revision Flashcard Generator',
    metaDescription:
      'Typeset study notes, revision cards, and technical mental models into high-contrast digital flashcards with monospace and serif fonts.',
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
    subtitle: 'Warm kraft paper, vintage ephemera, and tactile collage styles.',
    description:
      'Recreate the nostalgic warmth of physical scrapbooking with fiber paper textures, antique stamps, and weathered print tones.',
    longDescription:
      'Scrapbook text cards bring the feel of physical paper ephemera to the browser. Combining warm linen, weathered kraft cardstock, and vintage botanical stamps with classical serif fonts, each template mirrors the weight of an archival keepsake.',
    useCase:
      'Used by scrapbook hobbyists, vintage collectors, heritage archives, and memory-keepers printing keepsake notes.',
    designTips: [
      'Choose the Warm Kraft (#fce7cf) or Antique Parchment (#efe6d5) colorways.',
      'Turn on Analog Film Grain to emulate physical unbleached paper fibers.',
      'Select the botanical or bookmark glyph in the corner ornament options.',
    ],
    bestAspectRatios: ['1:1', '4:5'],
    matchedTemplateIds: ['camus-summer', 'aurelius-meditations', 'emily-dickinson-mint'],
    metaTitle: 'Scrapbook Text Cards: Vintage Kraft Paper & Ephemera Typography',
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
      'Embrace the discipline of Dieter Rams and Massimo Vignelli with sparse, razor-sharp typography and clear layout geometry.',
    longDescription:
      'Minimalist monochrome cards remove extra ornamental distractions so line weight, letter-spacing, and stark contrast carry the statement. Based on Swiss International Typographic Style and Braun functionalism, these templates keep layouts structured and legible.',
    useCase:
      'Used by product designers, architects, and essayists.',
    designTips: [
      'Use Gallery White (#ffffff) or Obsidian Dark (#18191c) with zero background noise.',
      'Select Inter Clean Sans or JetBrains Tabular Mono with generous padding (40px+).',
      'Let whitespace occupy at least 60% of the card area.',
    ],
    bestAspectRatios: ['1:1', '16:9'],
    matchedTemplateIds: ['obsidian-monochrome', 'dieter-rams-minimal', 'vignelli-canon'],
    metaTitle: 'Minimalist Monochrome Cards: Modern Swiss Typography Templates',
    metaDescription:
      'Create minimalist cards with stark monochrome palettes and Swiss modernist typography. Fast, free, and browser-based.',
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
        a: 'Stark black and white contrasts eliminate emotional bias, focusing reader attention directly on the structural clarity of the statement.',
      },
    ],
  },
  {
    id: 'social-text-cards',
    slug: 'social-text-cards',
    path: '/templates/social-text-cards',
    title: 'Social Text Cards',
    subtitle: 'Standard aspect ratios sized for Instagram, Stories, Twitter, and Threads.',
    description:
      'Format text posts with exact dimensions for social feeds (1:1, 4:5, 9:16) with sharp 2x Retina rendering.',
    longDescription:
      'Social media feeds compress standard images aggressively, causing blurry text and awkward cropping. Social text cards export at 2160px Retina resolution in 1:1 Square, 4:5 Portrait, or 9:16 Story formats so type stays sharp on mobile screens.',
    useCase:
      'Built for newsletter authors, educators, and writers publishing text carousel slides and feed posts.',
    designTips: [
      'Choose 4:5 Social Portrait to maximize vertical screen real estate in mobile feeds.',
      'Use 9:16 for Instagram Stories and TikTok text overlays.',
      'Keep your core thesis above the fold with 26px font size so readers stop scrolling immediately.',
    ],
    bestAspectRatios: ['4:5', '1:1', '9:16'],
    matchedTemplateIds: ['coral-statement', 'oxford-navy-journal', 'vignelli-canon'],
    metaTitle: 'Social Text Card Generator: 4:5 & 1:1 High-Res Post Creator',
    metaDescription:
      'Generate aesthetic text cards formatted for Instagram 4:5, 1:1, and 9:16 Stories. Export 2x Retina PNGs without watermarks.',
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
        a: 'The 4:5 portrait ratio occupies roughly 25% more vertical viewport space on mobile devices than a 1:1 square, improving reading legibility.',
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
      'Format nostalgic travel licenses, soulmate clearance passes, cyberpunk studio badges, and student credentials with custom metadata and star borders.',
    longDescription:
      'Aesthetic ID cards turn everyday notes into tactile passbooks, concert badges, and archival permits. Customize Tyler-inspired "Call Me If You Get Lost" travel licenses, romantic Soulmate Clearance Passes, Y2K creative studio badges, and kawaii pastel member IDs directly in your browser.',
    useCase:
      'Used by couples making personalized Soulmate Passes, travelers styling Tyler-inspired passport badges, designers building studio credentials, and students designing campus IDs.',
    designTips: [
      'Use monospaced typography (JetBrains Mono) for official registration numbers, authorization stamps, and clearance codes.',
      'Frame your card with star borders (★ ★ ★ ★ ★) or double hairline strokes to match vintage passbooks and official permits.',
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
    metaTitle: 'Aesthetic ID Card Generator: Passport Passes, Soulmate Badges & Y2K IDs',
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
