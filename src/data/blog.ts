import type { BlogPost } from '../types/card';

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'the-rise-of-aesthetic-id-cards-and-y2k-passes',
    path: '/blog/the-rise-of-aesthetic-id-cards-and-y2k-passes',
    title: 'The Rise of Aesthetic ID Cards, Passport Passes & Y2K Credentials',
    subtitle:
      'Why Gen-Z, creative studios, and internet couples are obsessed with turning personal identity into physical ephemera.',
    description:
      'An in-depth exploration of the aesthetic ID card phenomenon on Pinterest and TikTok. Discover the history behind Tyler-inspired travel licenses, romantic soulmate passes, and how to craft authentic badge typography.',
    metaTitle: 'The Rise of Aesthetic ID Cards & Y2K Passes — Design Trends & Typography',
    metaDescription:
      'Explore why aesthetic ID cards, Tyler the Creator travel passes, and soulmate badges went viral on Pinterest. Learn the typography rules behind badge aesthetics.',
    category: 'Design Trends',
    readTime: '6 min read',
    publishedDate: 'October 12, 2026',
    author: 'Elena Rostova — Editorial Typographer',
    featuredTemplateId: 'travel-license-pass',
    sections: [
      {
        heading: '1. The Ephemera Renaissance: When Documents Become Art',
        body: 'Over the past two years, visual search platforms like Pinterest and moodboard communities across TikTok and Instagram have witnessed an extraordinary surge in aesthetic ID cards, passport credentials, and fictional travel licenses. In an age dominated by frictionless, ephemeral digital interfaces, the tactile rigidity of an identification document carries unexpected emotional gravity.',
        bullets: [
          'Physical bureaucracy transformed into whimsical self-expression.',
          'Nostalgia for paper passports, embossed laminate badges, and ink rubber stamps.',
          'The desire for tangible tokens in an era where music, tickets, and memories live exclusively in the cloud.',
        ],
      },
      {
        heading: '2. Deconstructing the Tyler "Call Me If You Get Lost" Aesthetic',
        body: 'Much of the contemporary aesthetic ID movement traces its DNA to Tyler, the Creator’s critically acclaimed 2021 roll-out for "Call Me If You Get Lost". The album artwork featured an unlaminated 1970s sun-bleached passport license, complete with star-stamped borders, vintage typewriter monospaced type, and a formal clearance declaration.',
        callout: {
          title: 'The Core Anatomy of a Travel Pass',
          text: 'Authentic travel licenses pair unbleached cream or kraft paper (#f5edd6) with deep petrol ink (#183c48), an official document serial number (e.g., NO. TTC6253021), and a playful statement of unrestricted movement.',
        },
      },
      {
        heading: '3. The Romantic Soulmate Pass: Bureaucracy Made Tender',
        body: 'Simultaneously, a heartwarming romantic branch of this trend has taken over couples’ scrapbooking. Known as "Soulmate Clearance Passes" or "Love Department Credentials", these cards appropriate official administrative language to express romantic commitment. Fields like "Role: Beloved", "Status: Forever Taken", and "Valid Until: Eternity" transform solemn legal forms into humorous, deeply touching anniversary mementos.',
      },
      {
        heading: '4. Y2K Cyber Passes & Festival Lanyards',
        body: 'For digital creatives and music fans, the aesthetic branches out into acid neon palettes, pixel art glyphs, and backstage lanyard passes. Drawing inspiration from late-90s techno flyers and VIP artist wristbands, these cards feature QR codes, barcode strips, high-contrast monospace metadata, and badges like "Pixel Pusher" or "Executive Crew".',
      },
      {
        heading: '5. Four Typography Rules for Designing Believable Aesthetic Badges',
        body: 'To create an ID card that looks genuinely authentic rather than sloppy, keep these four fundamental typesetting principles in mind:',
        bullets: [
          'Anchor with Monospace: Use clean tabular fonts like JetBrains Mono for serial numbers, date codes, and authorization stamps.',
          'Frame with Deliberate Borders: Add star lines (★ ★ ★ ★ ★) or double hairline strokes to emulate passport watermark perimeters.',
          'Structured Field Labels: Use capitalized micro-tags (NAME, ROLE, ISSUED, EXPIRES) at 10-12px size to create bureaucratic rhythm.',
          'High-Resolution Rasterization: Always export at 2x Retina dimensions so the fine rules and stamp boundaries print crisply without blur.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-typeset-evocative-quote-cards',
    path: '/blog/how-to-typeset-evocative-quote-cards',
    title: 'The Typography of Memory: How to Typeset Literary Excerpts & Quotations',
    subtitle:
      'From negative space and optical margins to hanging quotes, master the subtle rules of editorial typography.',
    description:
      'Learn how master book designers format literary excerpts into memorable digital quote cards. Step-by-step guidance on font pairings, measure, and contrast.',
    metaTitle: 'How to Typeset Evocative Quote Cards — Editorial Typography Guide',
    metaDescription:
      'Master the craft of literary quote cards. Learn optical hierarchy, font pairings, negative space, and margin balance for Instagram and editorial publishing.',
    category: 'Typography Craft',
    readTime: '7 min read',
    publishedDate: 'October 10, 2026',
    author: 'Julian Vance — Type Specimen Curator',
    featuredTemplateId: 'st-germain-editorial',
    sections: [
      {
        heading: '1. Why Most Digital Quotes Fail to Resonate',
        body: 'We encounter hundreds of quote graphics every week on social feeds, yet 99% of them are immediately scrolled past and forgotten. Why? Because most generators slap oversized text on an over-saturated background with cramped margins. Typography is not merely about making words legible; it is about providing the acoustic environment in which words can be heard.',
      },
      {
        heading: '2. The Sacred Principle of Negative Space',
        body: 'In classic European book publishing, margins are never viewed as empty wasted paper. They are the frame that allows the eye to rest and contemplate. When typesetting a card, ensure padding never drops below 36px. The words should occupy no more than 40-50% of the total canvas surface area.',
        callout: {
          title: 'The 45-65 Rule',
          text: 'Optimal reading cadence occurs when line lengths measure between 45 and 65 characters. Anything longer causes eye fatigue; anything shorter creates awkward hyphenation.',
        },
      },
      {
        heading: '3. Selecting the Right Voice: Newsreader vs. Playfair vs. Inter',
        body: 'Every typeface has a distinct emotional temperature. Pairing the wrong tone with a quote creates cognitive dissonance:',
        bullets: [
          'Newsreader (Editorial Serif): Contemplative, scholarly, and intimate. Perfect for Marcus Aurelius, Albert Camus, and reflective literary essays.',
          'Playfair Display: Dramatic, romantic, and lyrical. Ideal for short poetic fragments by Emily Dickinson or Rainer Maria Rilke.',
          'Inter (Clean Sans): Direct, functional, and modern. Unbeatable for product design axioms, software rules, and Dieter Rams principles.',
          'JetBrains Mono: Precise, technical, and objective. Excellent for study notes, mental models, and code commentary.',
        ],
      },
      {
        heading: '4. Citations and Folio Metadata',
        body: 'A common mistake is making the author citation nearly as large as the quote itself. Maintain a 1:2.5 ratio: if your quote is set at 26px, your citation should sit comfortably between 10px and 12px with generous letter-spacing (+0.05em to +0.1em). This establishes a dignified, effortless reading hierarchy.',
      },
    ],
  },
  {
    slug: 'color-psychology-of-archival-paper-palettes',
    path: '/blog/color-psychology-of-archival-paper-palettes',
    title: 'Archival Paper Tones: The Color Psychology of Cream, Kraft, and Celadon',
    subtitle:
      'Why pure white feels sterile and how tactile, unbleached tones build emotional resonance.',
    description:
      'An analysis of tactile paper colorways in digital graphic design. Explore how unbleached linen, warm kraft, and celadon mist calm reader anxiety.',
    metaTitle: 'Archival Paper Color Psychology — Cream, Kraft, and Celadon Palettes',
    metaDescription:
      'Discover why cream, kraft, and vintage paper tones outperform pure white backgrounds in digital reading retention and emotional warmth.',
    category: 'Color Theory',
    readTime: '5 min read',
    publishedDate: 'October 8, 2026',
    author: 'Amara Chen — Color Systems Specialist',
    featuredTemplateId: 'camus-summer',
    sections: [
      {
        heading: '1. The Glare of Digital Pure White (#FFFFFF)',
        body: 'Standard computer monitors and smartphone screens emit bright blue-spectrum light. When text is set against pure #FFFFFF white, the stark contrast causes retinal strain and induces a subconscious feeling of clinical sterility. Traditional bookmakers discovered centuries ago that unbleached, warm off-whites create a vastly more inviting reading experience.',
      },
      {
        heading: '2. Deconstructing St. Germain Cream & Oxford Navy',
        body: 'In Aesthetic Card Studio, our flagship palette "St. Germain" pairs a subtle French paper background (#f4ede4) with warm roasted espresso ink (#2c2825). The minute reduction in contrast softens the harsh edges of digital rendering, mimicking the gentle light absorption of high-grade cotton rag paper.',
        callout: {
          title: 'Color Temperature Harmony',
          text: 'Warm backgrounds require warm ink. Never pair a warm cream (#f4ede4) with cold pitch-black (#000000); use deep charcoal, bronze-black, or espresso brown.',
        },
      },
      {
        heading: '3. Tactile Kraft Paper (#FCE7CF) and Nostalgia',
        body: 'Warm kraft paper evokes memories of vintage envelopes, handmade parcels, and leather-bound journals. In cognitive testing, viewers perceive quotes rendered on kraft paper as 34% more authentic and heartfelt than identical words rendered on flat neutral backgrounds.',
      },
      {
        heading: '4. Soft Celadon and Mindful Reflection',
        body: 'Derived from ancient Chinese pottery glazes, Celadon Mist (#e2ecf9 / #a8d8c4) combines soft pale blue with hints of herbal green. It activates parasympathetic calming responses, making it the ideal palette for morning journals, meditation mantras, and personal wellness notes.',
      },
    ],
  },
  {
    slug: 'aspect-ratios-unpacked-choosing-canvas-dimensions',
    path: '/blog/aspect-ratios-unpacked-choosing-canvas-dimensions',
    title: 'Aspect Ratios Unpacked: Choosing Between 1:1, 4:5, 9:16, and 16:9',
    subtitle:
      'How platform aspect ratios affect visual pacing, mobile viewport saturation, and readability.',
    description:
      'A complete technical guide to choosing aspect ratios for digital cards. Understand Instagram feed algorithms, Story overlays, and desktop presentation modes.',
    metaTitle: 'Card Aspect Ratios Guide — 1:1, 4:5, 9:16 & 16:9 Dimensions Compared',
    metaDescription:
      'Understand which aspect ratio works best for your cards: 1:1 Square, 4:5 Social Portrait, 9:16 Story, or 16:9 Landscape. High-res Retina dimensions explained.',
    category: 'Social Formats',
    readTime: '6 min read',
    publishedDate: 'October 5, 2026',
    author: 'Julian Vance — Type Specimen Curator',
    featuredTemplateId: 'oxford-navy-journal',
    sections: [
      {
        heading: '1. Why Canvas Dimensions Matter More Than You Think',
        body: 'The aspect ratio is not just a container; it dictates the reader’s physical scanning path. A square card invites slow, centered meditation, while a tall vertical card commands immediate scroll-stopping presence on a vertical smartphone display.',
      },
      {
        heading: '2. The Power of 4:5 Social Portrait (1080×1350 / 2160×2700)',
        body: 'On mobile feeds (Instagram and Threads), the 4:5 vertical portrait aspect ratio is the undisputed king. It claims 25% more screen height than a traditional 1:1 square. This extra space prevents surrounding posts from distracting your reader and allows ample vertical room for longer multi-line philosophical passages without shrinking font size.',
        callout: {
          title: 'Retina Export Spec',
          text: 'Always export at 2160×2700 pixels (2x pixel density). When social media platforms compress your upload, the high base resolution ensures your serif hairlines remain razor-sharp.',
        },
      },
      {
        heading: '3. When to Choose 1:1 Classic Square (1080×1080 / 2160×2160)',
        body: '1:1 remains the gold standard for album cover aesthetics, Twitter/X image previews, carousel cover slides, and print postcards. Its symmetrical geometry creates balanced equilibrium that works exceptionally well for short aphorisms under 25 words.',
      },
      {
        heading: '4. 9:16 Full-Bleed Stories and Wallpapers (1080×1920 / 2160×3840)',
        body: 'Designed specifically for handheld smartphone viewports, 9:16 is ideal for daily lockscreens, habit trackers, and Instagram Stories. When designing for 9:16, keep the text vertically centered and leave generous top and bottom safety zones (at least 15% clearance) to avoid platform UI overlays.',
      },
      {
        heading: '5. 16:9 Widescreen for Slides and Desktop (1920×1080 / 3840×2160)',
        body: 'For presentation keynotes, YouTube community posts, and widescreen desktop wallpapers, 16:9 provides expansive horizontal breathing room. Left-align your typography and let the negative space extend majestically to the right.',
      },
    ],
  },
  {
    slug: 'why-browser-native-tools-are-the-future-of-creative-privacy',
    path: '/blog/why-browser-native-tools-are-the-future-of-creative-privacy',
    title: 'Why Browser-Native Architecture is the Future of Creative Privacy',
    subtitle:
      'The quiet revolution of zero-server tools that protect your private writing, drafts, and creative fragments.',
    description:
      'Why cloud-first design software compromises user privacy, and how modern web standards like HTML5 Canvas and local client memory offer a superior alternative.',
    metaTitle: 'Creative Privacy & Client-Side Design Tools — The Zero-Server Revolution',
    metaDescription:
      'Why zero-backend browser tools are reshaping creative software. Keep your private journaling, quotes, and writing 100% secure in local browser memory.',
    category: 'Philosophy & Tech',
    readTime: '5 min read',
    publishedDate: 'October 2, 2026',
    author: 'Elena Rostova — Editorial Typographer',
    featuredTemplateId: 'obsidian-monochrome',
    sections: [
      {
        heading: '1. The Creep of Mandatory Cloud Accounts',
        body: 'Over the last decade, creative software underwent a radical centralization. Want to format a quick graphic? You are forced to create an account, verify an email, agree to 40 pages of data telemetry, and store your intimate personal drafts on remote cloud databases.',
      },
      {
        heading: '2. The Danger to Private Writing and Journaling',
        body: 'When creators journal, draft vulnerable poems, or record deeply personal reflections, they should not have to wonder whether their unfinished thoughts are being ingested into AI training sets or indexed by third-party tracking scripts.',
        callout: {
          title: 'The Zero-Knowledge Standard',
          text: 'If an application does not have a database, it cannot leak your data. If it doesn’t have a backend server, your words physically never leave your laptop or phone.',
        },
      },
      {
        heading: '3. Harnessing Modern Web Standards (HTML5 Canvas & localStorage)',
        body: 'Modern web browsers are computational powerhouses. With HTML5 Canvas, SVG filter matrices, and Web APIs, a browser can render high-resolution 2x Retina graphics instantly using local GPU acceleration, rendering remote server processing obsolete for typographic tasks.',
      },
      {
        heading: '4. Aesthetic Card Studio’s Client-Side Guarantee',
        body: 'Our studio is built entirely around client-side independence. Your draft resides in your browser’s local storage. When you click download, your card is compiled and delivered directly from memory to your download folder. Fast, elegant, private, and forever free.',
      },
    ],
  },
];
