export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  robots?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const PRODUCTION_DOMAIN = 'https://aestheticcardgenerator.pages.dev';

export const HOME_AEO_FAQ = [
  {
    q: 'Is Aesthetic Card Generator free with no watermarks?',
    a: 'Yes. Every template across the Gallery, Library, Bingo Studio, Quick Creator, Canvas Studio, and Signature Editions exports watermark-free at zero cost.',
  },
  {
    q: 'What export formats and resolutions are supported?',
    a: 'Canvas Studio exports lossless PNG (1x, 2x Retina, 3x Print), JPEG, and WebP. Quick Card Maker outputs 2x PNG graphics across 1:1, 4:5, 9:16, and 16:9 ratios.',
  },
  {
    q: 'Are my photos and quote drafts uploaded to a server?',
    a: 'No. Editing and image rasterization run locally inside your browser. Drafts stay in localStorage and IndexedDB on your own device.',
  },
  {
    q: 'Which template should I start with for layered photo IDs or tickets?',
    a: 'Pick any card under ID Pass, Signature Editions, or Aesthetic ID Cards to edit portraits, dates, serial codes, and typography on separate layers.',
  },
];

export const SITE_FAQ_ITEMS = [
  {
    q: 'Is Aesthetic Card Generator completely free with no watermarks?',
    a: 'Yes. All 90 templates, all 14 Signature Editions, Bingo boards, Quick Creator cards, and Canvas Studio downloads are free with zero watermarks or login walls.',
  },
  {
    q: 'Does this app send my text or photos to any server?',
    a: 'No. All image compositing runs client-side in browser memory so your text, uploaded fonts, and exported images never leave your device.',
  },
  {
    q: 'Can I customize the typography, margins, and paper textures?',
    a: 'Yes. The Studio Editor lets you configure font stacks (Newsreader, Playfair, Inter, JetBrains Mono), type scale, line alignment, inset padding, corner radius, and paper-grain overlays.',
  },
  {
    q: 'What resolution are the downloaded cards?',
    a: 'Quick Creator exports 2x Retina graphics up to 2160x2160 or 2160x2700 pixels, and Canvas Studio supports up to 3x PNG, JPEG, or WebP exports for print and social feeds.',
  },
  {
    q: 'Can I export in different aspect ratios?',
    a: 'Yes, you can toggle between 1:1 Square, 4:5 Social Portrait, 9:16 Story/Reel, and 16:9 Landscape with a single click, and all typography reflows proportionally.',
  },
  {
    q: 'How does draft saving work if there is no database?',
    a: 'Your card state is stored locally in your browser storage (localStorage and IndexedDB). When you reload the page, your in-progress card restores locally without sending your work to a server.',
  },
  {
    q: 'Can I use these cards for commercial projects and book covers?',
    a: 'Yes. The cards you generate with your own text are yours to publish. All built-in Google and bundled typefaces use open licenses (such as SIL Open Font License).',
  },
  {
    q: 'Why does the exported image look sharper than my screen preview?',
    a: 'During export, the rendering engine rasterizes your card at high pixel density (pixelRatio 2x or 3x) to match high-DPI mobile screens so hairline borders and serifs stay sharp.',
  },
];

export function updatePageSEO({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  robots = 'index, follow, max-image-preview:large, max-snippet:-1',
  jsonLd,
}: SEOProps): void {
  // 1. Update Document Title
  document.title = title;

  // 2. Helper to set or create meta tags
  const setMetaTag = (nameAttr: 'name' | 'property', attrValue: string, content: string) => {
    let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(nameAttr, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // 3. Description & Robots
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'robots', robots);

  // 4. Canonical URL
  const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  const fullCanonicalUrl = `${PRODUCTION_DOMAIN}${cleanPath === '/' ? '' : cleanPath}`;

  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullCanonicalUrl);

  // 5. Open Graph Meta Tags
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', fullCanonicalUrl);
  setMetaTag('property', 'og:type', ogType);
  setMetaTag('property', 'og:site_name', 'Aesthetic Card Generator');

  // 6. Twitter Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);

  // 7. Structured Data (JSON-LD)
  if (jsonLd) {
    let scriptTag = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLd);
  }
}
