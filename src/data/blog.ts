import type { BlogPost } from '../types/card';

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-build-a-90s-press-lanyard-id',
    path: '/blog/how-to-build-a-90s-press-lanyard-id',
    title: 'How to Build an Authentic 90s Press Lanyard ID & VIP Badge',
    subtitle:
      'From hole-punch geometry and barcode metadata to halftone photo treatments, craft a believable concert press pass.',
    description:
      'A hands-on visual recipe tutorial for constructing 90s backstage passes and media credentials in the Freeform Canvas Studio.',
    metaTitle: 'How to Build a 90s Press Lanyard ID — Visual Recipe Tutorial',
    metaDescription:
      'Step-by-step visual guide to designing authentic 90s press lanyards, VIP badges, barcode strips, and security seals in Aesthetic Card Studio.',
    category: 'Design Trends',
    readTime: '5 min read',
    publishedDate: 'October 14, 2026',
    author: 'Aesthetic Card Studio Team',
    featuredTemplateId: 'pass-creative-studio',
    sections: [
      {
        heading: '1. Establish the Lanyard Proportion & Slotted Punch Hole',
        body: 'Real event credentials are built with a tall vertical aspect ratio (2:3 or 4:5) to hang comfortably from a neck lanyard without flipping. The hallmark of an authentic pass is the centered punch-hole slot or metallic eyelet at the very top of the card.',
        bullets: [
          'Canvas Aspect Ratio: Set canvas to 4:5 or 2:3 vertical proportion.',
          'Header clearance: Keep at least 60px of breathing room at the top for the lanyard sleeve clip.',
          'Color palette: High-voltage acidic yellow (#e0e722) on obsidian ink (#111417) gives an unmistakable backstage vibe.',
        ],
        templateId: 'pass-creative-studio',
        actionPrompt: 'Load 90s Press Lanyard Preset in Canvas Studio →',
      },
      {
        heading: '2. Applying 1-Bit Dither or Halftone to the Photo Layer',
        body: 'Generic color photos look too polished for vintage credentials. High-pass thresholding, newspaper dot halftones, or 1-bit Atkinson dithering emulate the quick thermal ID card printers used by venues in the late 90s.',
        callout: {
          title: 'Photo Treatment Rule',
          text: 'Select your photo layer on /canvas and apply the "1-Bit Atkinson Dither" or "High-Contrast Photocopy" filter in the Right Inspector for immediate tactile texture.',
        },
        templateId: 'id-aesthetic-pretty',
        actionPrompt: 'Open Dithered Photo ID Style in Studio →',
      },
      {
        heading: '3. Serial Numbers & Code-128 Barcodes',
        body: 'Nothing sells an ID card faster than tabular monospaced metadata. Use JetBrains Mono or Space Mono for authorization tiers (e.g. "TIER 01 • ALL ACCESS") and bind a dynamic Code-128 barcode strip at the card bottom.',
        templateId: 'pass-tyler-travel',
        actionPrompt: 'Load Barcode Travel Pass in Studio →',
      },
    ],
  },
  {
    slug: 'pairing-serif-fonts-for-bookstagram-quote-cards',
    path: '/blog/pairing-serif-fonts-for-bookstagram-quote-cards',
    title: 'Pairing Serif Fonts for Bookstagram & Literary Quote Cards',
    subtitle:
      'Harmonizing Newsreader, Cormorant Garamond, and Instrument Serif with modern monospace citations.',
    description:
      'Learn the exact type scales, line heights, and margins bookish creators use to typeset viral quote cards on Instagram and Pinterest.',
    metaTitle: 'Pairing Serif Fonts for Bookstagram Quote Cards — Typography Studio Guide',
    metaDescription:
      'Master serif font pairings for book reflections and quotes. Step-by-step guidance on leading, tracking, and archival paper backgrounds.',
    category: 'Typography Craft',
    readTime: '6 min read',
    publishedDate: 'October 12, 2026',
    author: 'Aesthetic Card Studio Team',
    featuredTemplateId: 'st-germain-editorial',
    sections: [
      {
        heading: '1. The Right Serif for the Right Voice',
        body: 'Not all serifs convey the same acoustic tone. Newsreader feels scholarly and quiet; Cormorant Garamond conveys historical opulence; Instrument Serif delivers high-fashion editorial tension with razor-sharp terminal cuts.',
        bullets: [
          'Newsreader: Ideal for Marcus Aurelius, Albert Camus, and introspective reflections.',
          'Cormorant Garamond: Unmatched for classic French philosophy and poetry.',
          'Instrument Serif: Perfect for modern fiction, song lyrics, and minimalist design axioms.',
        ],
        templateId: 'st-germain-editorial',
        actionPrompt: 'Load Newsreader Editorial Card in Studio →',
      },
      {
        heading: '2. Granular Leading and Tracking Calibrations',
        body: 'Generators often default to cramped line heights that choke long quotes. In the Type tab, set Line Height between 1.45 and 1.65. For uppercase citations and tags, boost Letter Spacing to +0.08em to establish typographic dignity.',
        callout: {
          title: 'The 45-65 Rule',
          text: 'Aim for 45 to 65 characters per line. If a line stretches longer, increase canvas padding to tighten the reading measure.',
        },
        templateId: 'camus-summer',
        actionPrompt: 'Load Warm Kraft Book Page in Studio →',
      },
      {
        heading: '3. Tactile Highlighter Accents (==highlight==)',
        body: 'Direct quotes often contain a single phrase that carries the weight of the whole excerpt. Wrap that key fragment in ==double equal signs== inside the Words tab to render a soft, semi-transparent tactile highlighter swatch.',
        templateId: 'didion-notebook',
        actionPrompt: 'Test Tactile Highlighter on Joan Didion Preset →',
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
    author: 'Aesthetic Card Studio Team',
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
        templateId: 'st-germain-editorial',
        actionPrompt: 'Load St. Germain Palette in Studio →',
      },
      {
        heading: '3. Tactile Kraft Paper (#FCE7CF) and Nostalgia',
        body: 'Warm kraft paper evokes memories of vintage envelopes, handmade parcels, and leather-bound journals. Viewers perceive quotes rendered on kraft paper as significantly more authentic and heartfelt than identical words rendered on flat neutral backgrounds.',
        templateId: 'camus-summer',
        actionPrompt: 'Load Kraft Book Page in Studio →',
      },
      {
        heading: '4. Soft Celadon and Mindful Reflection',
        body: 'Derived from ancient pottery glazes, Celadon Mist (#e2ecf9 / #a8d8c4) combines soft pale blue with hints of herbal green. It activates calming responses, making it the ideal palette for morning journals, meditation mantras, and personal wellness notes.',
        templateId: 'marcus-aurelius-stoic',
        actionPrompt: 'Load Soft Celadon in Studio →',
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
    author: 'Aesthetic Card Studio Team',
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
        templateId: 'oxford-navy-journal',
        actionPrompt: 'Open 4:5 Social Portrait Template →',
      },
      {
        heading: '3. When to Choose 1:1 Classic Square (1080×1080 / 2160×2160)',
        body: '1:1 remains the gold standard for album cover aesthetics, Twitter/X image previews, carousel cover slides, and print postcards. Its symmetrical geometry creates balanced equilibrium that works exceptionally well for short aphorisms under 25 words.',
        templateId: 'dieter-rams-less',
        actionPrompt: 'Open 1:1 Square Studio Template →',
      },
      {
        heading: '4. 9:16 Full-Bleed Stories and Wallpapers (1080×1920 / 2160×3840)',
        body: 'Designed specifically for handheld smartphone viewports, 9:16 is ideal for daily lockscreens, habit trackers, and Instagram Stories. When designing for 9:16, keep the text vertically centered and leave generous top and bottom safety zones (at least 15% clearance) to avoid platform UI overlays.',
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
    author: 'Aesthetic Card Studio Team',
    featuredTemplateId: 'obsidian-monochrome',
    sections: [
      {
        heading: '1. The Creep of Mandatory Cloud Accounts',
        body: 'Over the last decade, creative software underwent radical centralization. Want to format a quick graphic? You are forced to create an account, verify an email, agree to 40 pages of data telemetry, and store your intimate personal drafts on remote cloud databases.',
      },
      {
        heading: '2. Protecting Private Writing and Journaling',
        body: 'When creators journal, draft vulnerable poems, or record deeply personal reflections, they should not have to wonder whether their unfinished thoughts are being ingested into training sets or indexed by third-party tracking scripts.',
        callout: {
          title: 'The Zero-Knowledge Standard',
          text: 'If an application does not have a database, it cannot leak your data. If it doesn’t have a backend server, your words physically never leave your laptop or phone.',
        },
        templateId: 'obsidian-monochrome',
        actionPrompt: 'Open Private Offline Studio Template →',
      },
      {
        heading: '3. Harnessing Modern Web Standards (HTML5 Canvas & localStorage)',
        body: 'Modern web browsers are computational powerhouses. With HTML5 Canvas, SVG filter matrices, and Web APIs, a browser can render high-resolution 2x Retina graphics instantly using local GPU acceleration, rendering remote server processing obsolete for typographic tasks.',
      },
    ],
  },
];
