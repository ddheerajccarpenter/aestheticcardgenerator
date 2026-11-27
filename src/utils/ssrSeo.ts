import { BLOG_POSTS } from '../data/blog';
import { TEMPLATE_CATEGORIES } from '../data/categories';
import { GUIDE_ARTICLES } from '../data/guides';
import { PREMIUM_SIGNATURE_TEMPLATES } from '../data/premiumTemplates';
import { PRESET_TEMPLATES } from '../data/templates';
import { HOME_AEO_FAQ, PRODUCTION_DOMAIN, SITE_FAQ_ITEMS } from './seo';

export interface RouteFallbackLink {
  label: string;
  href: string;
}

export interface RouteSeoData {
  title: string;
  description: string;
  ogType: 'website' | 'article';
  robots: string;
  structuredData: Record<string, unknown> | Record<string, unknown>[];
  fallback: {
    eyebrow: string;
    heading: string;
    lead: string;
    paragraphs: string[];
    qaItems?: Array<{ q: string; a: string }>;
    links: RouteFallbackLink[];
  };
}

const STATIC_ROUTE_META: Record<
  string,
  { title: string; description: string; eyebrow: string; heading: string; paragraphs: string[] }
> = {
  '/create': {
    title: 'Quick Card Maker - Free Quote & Editorial Card Generator | ACG',
    description:
      'Compose custom quote cards, book excerpts, and minimalist posters in your browser. Choose archival paper palettes and export 2x PNG files for free.',
    eyebrow: 'Quick Card Maker',
    heading: 'Compose Editorial Quote Cards in Minutes',
    paragraphs: [
      'Write or paste quotes, select archival paper tones and serif or geometric fonts, adjust optical margins with film grain, and download 2x high-resolution PNG cards without watermarks.',
    ],
  },
  '/canvas': {
    title: 'Layered Canvas Studio - Free Online Card & ID Pass Editor | ACG',
    description:
      'Edit multi-layer card designs, photo ID badges, ticket stubs, and Signature posters directly in your browser with free PNG and WebP export.',
    eyebrow: 'Canvas Studio',
    heading: 'Multi-Layer Card, Poster & ID Pass Editor',
    paragraphs: [
      'Select and reorder text, vector badges, stickers, and cropped photos inside one workspace with undo/redo history, custom font uploads, zoom controls, and lossless 1x/2x/3x export.',
    ],
  },
  '/bingo': {
    title: 'Free Aesthetic Bingo Card Generator (5x5 Printable & PNG) | ACG',
    description:
      'Create, customize, stamp live, and download 4 styles of aesthetic 5x5 bingo cards in classic or editorial palettes for free.',
    eyebrow: 'Bingo Studio',
    heading: 'Interactive & Printable 5x5 Aesthetic Bingo Cards',
    paragraphs: [
      'Pick from 4 card formats, switch archival paper colorways, shuffle prompts or edit squares directly, stamp cells live, and download sharp PNG sheets with no watermark.',
    ],
  },
  '/premium': {
    title: 'Signature Free Editions (14 Flagship Card Templates) | ACG',
    description:
      'Browse all 14 Signature card editions: light-leak posters, Swiss glass passes, engraved medallions, and handwritten note cards, 100% free.',
    eyebrow: 'Signature Collection - 100% Free',
    heading: '14 Flagship Signature Card Designs, Free to Edit & Export',
    paragraphs: [
      'Every Signature Edition opens inside Canvas Studio with editable text, custom typography, and replaceable photography. Export lossless PNG, JPEG, or WebP files with zero paywalls.',
    ],
  },
  '/templates': {
    title: 'Aesthetic Card Template Library (90 Free Editable Designs) | ACG',
    description:
      'Browse and compare free editable card templates across editorial quotes, digital journals, minimalist posters, and retro ID passes.',
    eyebrow: 'Template Library',
    heading: 'Free Editable Card & ID Pass Templates',
    paragraphs: [
      'Compare dimensions and typography side by side across editorial quote cards, Swiss ID passes, music player cards, travel tickets, and Signature posters.',
    ],
  },
  '/guides': {
    title: 'Card Design Guides - Typography, Aspect Ratios & Export Specs | ACG',
    description:
      'Step-by-step guides on social card dimensions, quote hierarchy, paper palettes, and 2x Retina PNG export settings.',
    eyebrow: 'Design Guides',
    heading: 'Typography & Layout Guides for Card Creators',
    paragraphs: [
      'Match aspect ratios (1:1, 4:5, 9:16, 16:9), prevent social compression blur, balance quote citations, and export sharp graphics locally.',
    ],
  },
  '/blog': {
    title: 'Studio Journal & Design Notes - Aesthetic Card Generator',
    description:
      'Editorial articles on Bookstagram serif pairings, unbleached paper palettes, retro Swiss ID cards, and local-first software.',
    eyebrow: 'Studio Journal',
    heading: 'Notes on Editorial Typography & Card Design',
    paragraphs: [
      'Technical articles covering optical leading, highlighter swatches, archival paper tones, and browser-native design tools.',
    ],
  },
  '/faq': {
    title: 'Frequently Asked Questions - Aesthetic Card Generator',
    description:
      'Direct answers on free exports, zero watermarks, PNG/WebP print sizing, font licensing, and local browser storage.',
    eyebrow: 'Help & Answers',
    heading: 'Frequently Asked Questions',
    paragraphs: [
      'Answers covering pricing, browser storage, supported image resolutions, and commercial font licensing inside Aesthetic Card Generator.',
    ],
  },
  '/about': {
    title: 'About Aesthetic Card Generator - Client-Side Card Studio',
    description:
      'Independent, local-first web studio built for writers, readers, and designers to typeset cards without accounts or watermarks.',
    eyebrow: 'About ACG',
    heading: 'A Local-First Browser Studio for Expressive Cards',
    paragraphs: [
      'Aesthetic Card Generator runs inside your browser using localStorage and IndexedDB so templates, editing tools, and high-DPI exports stay free and private.',
    ],
  },
  '/contact': {
    title: 'Contact Aesthetic Card Generator',
    description: 'Reach the Aesthetic Card Generator maintainer for bug reports, accessibility feedback, or template requests.',
    eyebrow: 'Contact',
    heading: 'Contact the Studio Maintainer',
    paragraphs: [
      'Send bug reports, accessibility requests, template ideas, or licensing questions directly to ddheerajcarpenter@gmail.com.',
    ],
  },
  '/privacy': {
    title: 'Privacy Policy - Aesthetic Card Generator',
    description:
      'How Aesthetic Card Generator keeps drafts local in your browser and explains third-party font CDNs and future Google AdSense readiness.',
    eyebrow: 'Privacy & Data',
    heading: 'Privacy Policy',
    paragraphs: [
      'Design drafts, uploaded photos, and custom fonts are stored locally in your browser via localStorage, sessionStorage, and IndexedDB without server uploads.',
      'This source build keeps advertising scripts disabled by default. When Google AdSense is enabled with a verified publisher ID, third-party ad cookies and consent choices are governed transparently.',
    ],
  },
  '/cookies': {
    title: 'Cookies & Browser Storage Policy - Aesthetic Card Generator',
    description:
      'Details on localStorage, sessionStorage, IndexedDB, external typography CDNs, and future advertising cookie controls.',
    eyebrow: 'Storage Disclosure',
    heading: 'Cookies & Browser Storage Policy',
    paragraphs: [
      'Essential browser storage saves theme preference, local projects, and imported fonts locally. Future optional ad integration respects Google consent and opt-out controls.',
    ],
  },
  '/terms': {
    title: 'Terms of Use - Aesthetic Card Generator',
    description: 'Usage rights, open font licenses, and user responsibilities for Aesthetic Card Generator.',
    eyebrow: 'Terms',
    heading: 'Terms of Use',
    paragraphs: [
      'Templates and design tools are provided free for personal and creative publication. Users remain responsible for photos and text they supply.',
    ],
  },
  '/disclaimer': {
    title: 'Editorial, Parody & Copyright Disclaimer - Aesthetic Card Generator',
    description: 'Disclaimer regarding stylized novelty templates, literary excerpts, and DMCA contact procedures.',
    eyebrow: 'Disclaimer',
    heading: 'Editorial & Copyright Disclaimer',
    paragraphs: [
      'ID pass, boarding stub, and retro OS styles are creative editorial templates meant for personal expression and artistic satire rather than official identification.',
    ],
  },
  '/accessibility': {
    title: 'Accessibility Statement - Aesthetic Card Generator',
    description: 'Keyboard navigation, reduced-motion support, focus states, and touch-target commitments across desktop and mobile.',
    eyebrow: 'Accessibility',
    heading: 'Accessibility Commitment',
    paragraphs: [
      'All public navigation, modals, editor panels, and template cards are tested for keyboard accessibility, high-contrast focus outlines, and mobile touch targets.',
    ],
  },
  '/credits': {
    title: 'Credits & Open-Source Attributions - Aesthetic Card Generator',
    description: 'Credits for Astro, React, Tailwind CSS, html-to-image, Three.js, Lucide icons, and open-licensed typefaces.',
    eyebrow: 'Credits',
    heading: 'Typefaces & Open-Source Credits',
    paragraphs: [
      'Built on open web standards, SIL OFL Google Fonts, Astro, React, and client-side HTML5 canvas rendering.',
    ],
  },
};

export function resolveRouteSeo(rawPath: string): RouteSeoData {
  const path = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '') || '/';
  const canonicalUrl = `${PRODUCTION_DOMAIN}${path === '/' ? '' : path}`;

  const defaultLinks: RouteFallbackLink[] = [
    { label: 'Gallery', href: '/' },
    { label: 'Signature Editions (Free)', href: '/premium' },
    { label: 'Templates', href: '/templates' },
    { label: 'Canvas Studio', href: '/canvas' },
    { label: 'Quick Creator', href: '/create' },
    { label: 'Bingo Studio', href: '/bingo' },
    { label: 'Design Guides', href: '/guides' },
    { label: 'Journal', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Privacy', href: '/privacy' },
  ];

  if (path === '/') {
    const title = 'Aesthetic Card Generator - Free Quote Cards, ID Passes & Posters';
    const description = `Edit and export ${PRESET_TEMPLATES.length} aesthetic quote cards, Swiss ID passes, ticket stubs, and printable 5x5 bingo cards in your browser with zero watermarks.`;
    return {
      title,
      description,
      ogType: 'website',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1',
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${PRODUCTION_DOMAIN}/#organization`,
            name: 'Aesthetic Card Generator',
            alternateName: 'ACG Studio',
            url: PRODUCTION_DOMAIN,
            email: 'ddheerajcarpenter@gmail.com',
          },
          {
            '@type': 'WebSite',
            '@id': `${PRODUCTION_DOMAIN}/#website`,
            name: 'Aesthetic Card Generator',
            url: PRODUCTION_DOMAIN,
            description,
            publisher: { '@id': `${PRODUCTION_DOMAIN}/#organization` },
          },
          {
            '@type': 'WebApplication',
            '@id': `${PRODUCTION_DOMAIN}/#webapp`,
            name: 'Aesthetic Card Generator',
            url: PRODUCTION_DOMAIN,
            applicationCategory: 'DesignApplication',
            operatingSystem: 'Any',
            browserRequirements: 'Requires HTML5 and JavaScript enabled',
            isAccessibleForFree: true,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: [
              '90+ free editable aesthetic card and ID pass templates',
              'Multi-layer Canvas Studio with undo/redo, custom fonts, and photo replacement',
              'Lossless PNG (1x, 2x Retina, 3x Print), JPEG, and WebP downloads with no watermark',
              'Interactive 5x5 aesthetic Bingo Studio and 3D Quick Card Maker',
            ],
          },
          {
            '@type': 'FAQPage',
            mainEntity: HOME_AEO_FAQ.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          },
        ],
      },
      fallback: {
        eyebrow: 'Free Browser Card Studio',
        heading: 'Card and poster studio',
        lead: description,
        paragraphs: [
          'Browse 90 editorial quote cards, minimalist posters, Swiss modernist ID badges, vintage travel stubs, and 14 Signature Editions. Adjust fonts, paper colors, layout spacing, and uploaded photos right in your browser.',
          'Every card downloads watermark-free as high-DPI PNG, JPEG, or WebP with zero login required.',
        ],
        qaItems: HOME_AEO_FAQ,
        links: defaultLinks,
      },
    };
  }

  const category = TEMPLATE_CATEGORIES.find((item) => item.path === path);
  if (category) {
    return {
      title: category.metaTitle,
      description: category.metaDescription,
      ogType: 'website',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_DOMAIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Templates', item: `${PRODUCTION_DOMAIN}/templates` },
            { '@type': 'ListItem', position: 3, name: category.title, item: canonicalUrl },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: category.title,
          description: category.metaDescription,
          url: canonicalUrl,
        },
        ...(category.faq.length
          ? [
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: category.faq.map((q) => ({
                  '@type': 'Question',
                  name: q.q,
                  acceptedAnswer: { '@type': 'Answer', text: q.a },
                })),
              },
            ]
          : []),
      ],
      fallback: {
        eyebrow: 'Template Category',
        heading: category.title,
        lead: category.subtitle,
        paragraphs: [category.longDescription, category.useCase],
        qaItems: category.faq,
        links: [
          ...category.matchedTemplateIds.map((id) => ({ label: `Edit ${id}`, href: `/canvas?template=${id}` })),
          ...defaultLinks,
        ],
      },
    };
  }

  const guide = GUIDE_ARTICLES.find((item) => item.path === path);
  if (guide) {
    return {
      title: guide.metaTitle,
      description: guide.metaDescription,
      ogType: 'article',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_DOMAIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: `${PRODUCTION_DOMAIN}/guides` },
            { '@type': 'ListItem', position: 3, name: guide.title, item: canonicalUrl },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.description,
          mainEntityOfPage: canonicalUrl,
          datePublished: '2026-10-01',
          author: { '@type': 'Organization', name: 'Aesthetic Card Generator' },
          publisher: { '@type': 'Organization', name: 'Aesthetic Card Generator', url: `${PRODUCTION_DOMAIN}/` },
        },
      ],
      fallback: {
        eyebrow: `${guide.category} · ${guide.readTime}`,
        heading: guide.title,
        lead: guide.subtitle,
        paragraphs: guide.sections.flatMap((s) => [`${s.heading}: ${s.body}`, ...(s.bullets ?? [])]),
        links: defaultLinks,
      },
    };
  }

  const post = BLOG_POSTS.find((item) => item.path === path);
  if (post) {
    return {
      title: post.metaTitle,
      description: post.metaDescription,
      ogType: 'article',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_DOMAIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${PRODUCTION_DOMAIN}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          mainEntityOfPage: canonicalUrl,
          datePublished: '2026-10-12',
          author: { '@type': 'Organization', name: post.author },
          publisher: { '@type': 'Organization', name: 'Aesthetic Card Generator', url: `${PRODUCTION_DOMAIN}/` },
        },
      ],
      fallback: {
        eyebrow: `${post.category} · ${post.readTime}`,
        heading: post.title,
        lead: post.subtitle,
        paragraphs: post.sections.flatMap((s) => [`${s.heading}: ${s.body}`, ...(s.bullets ?? [])]),
        links: defaultLinks,
      },
    };
  }

  const meta = STATIC_ROUTE_META[path];
  if (meta) {
    const schemaGraph: Record<string, unknown>[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_DOMAIN}/` },
          { '@type': 'ListItem', position: 2, name: meta.heading, item: canonicalUrl },
        ],
      },
    ];
    let qaItems: Array<{ q: string; a: string }> | undefined;
    let routeLinks = defaultLinks;

    if (path === '/faq') {
      qaItems = SITE_FAQ_ITEMS;
      schemaGraph.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: SITE_FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      });
    } else if (path === '/premium') {
      schemaGraph.push({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Signature Free Editions',
        description: meta.description,
        url: canonicalUrl,
        isAccessibleForFree: true,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: PREMIUM_SIGNATURE_TEMPLATES.length,
          itemListElement: PREMIUM_SIGNATURE_TEMPLATES.map((t, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: t.title,
            url: `${PRODUCTION_DOMAIN}/canvas?template=${t.id}`,
          })),
        },
      });
      routeLinks = [
        ...PREMIUM_SIGNATURE_TEMPLATES.map((t) => ({ label: t.title, href: `/canvas?template=${t.id}` })),
        ...defaultLinks,
      ];
    } else if (path === '/guides') {
      routeLinks = [...GUIDE_ARTICLES.map((g) => ({ label: g.title, href: g.path })), ...defaultLinks];
    } else if (path === '/blog') {
      routeLinks = [...BLOG_POSTS.map((p) => ({ label: p.title, href: p.path })), ...defaultLinks];
    } else if (path === '/templates') {
      routeLinks = [...TEMPLATE_CATEGORIES.map((c) => ({ label: c.title, href: c.path })), ...defaultLinks];
    }

    return {
      title: meta.title,
      description: meta.description,
      ogType: 'website',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1',
      structuredData: schemaGraph,
      fallback: {
        eyebrow: meta.eyebrow,
        heading: meta.heading,
        lead: meta.description,
        paragraphs: meta.paragraphs,
        qaItems,
        links: routeLinks,
      },
    };
  }

  if (path.startsWith('/card/')) {
    const cardId = path.replace('/card/', '');
    const tmpl = PRESET_TEMPLATES.find((t) => t.id === cardId);
    if (tmpl) {
      const cardDesc = tmpl.description || `Edit "${tmpl.title}" in Canvas Studio and download free without watermarks.`;
      return {
        title: `${tmpl.title} - Free Editable Card Template | ACG`,
        description: cardDesc,
        ogType: 'website',
        robots: 'index, follow, max-image-preview:large, max-snippet:-1',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${PRODUCTION_DOMAIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Templates', item: `${PRODUCTION_DOMAIN}/templates` },
              { '@type': 'ListItem', position: 3, name: tmpl.title, item: canonicalUrl },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: tmpl.title,
            description: cardDesc,
            url: canonicalUrl,
            isAccessibleForFree: true,
          },
        ],
        fallback: {
          eyebrow: `${tmpl.categoryLabel} · Free Template`,
          heading: tmpl.title,
          lead: cardDesc,
          paragraphs: [
            `Customize "${tmpl.title}" directly in your browser and download high-resolution PNG, JPEG, or WebP files free of charge.`,
          ],
          links: [
            { label: `Customize ${tmpl.title}`, href: `/canvas?template=${tmpl.id}` },
            ...defaultLinks,
          ],
        },
      };
    }
  }

  return {
    title: 'Page Not Found - Aesthetic Card Generator',
    description: 'The requested page could not be found. Browse free templates and launch the editor.',
    ogType: 'website',
    robots: path === '/404' ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Aesthetic Card Generator',
      url: canonicalUrl,
    },
    fallback: {
      eyebrow: 'Aesthetic Card Generator',
      heading: 'Aesthetic Card Studio',
      lead: 'Return to the gallery or open any free template.',
      paragraphs: ['All card templates, Bingo cards, and Canvas Studio exports remain free and local to your browser.'],
      links: defaultLinks,
    },
  };
}
