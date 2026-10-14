// src/data/elementsCatalog.ts

export interface CardElementItem {
  id: string;
  name: string;
  category: 'editorial' | 'aesthetic' | 'security' | 'technical' | 'stamps';
  categoryLabel: string;
  glyph?: string;
  svgIcon?: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const ELEMENT_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'editorial', name: 'Editorial' },
  { id: 'aesthetic', name: 'Aesthetic' },
  { id: 'security', name: 'Security' },
  { id: 'technical', name: 'Technical' },
  { id: 'stamps', name: 'Stamps' },
];

export function getElementById(id: string): CardElementItem | undefined {
  return ELEMENTS_55_CATALOG.find((e) => e.id === id);
}

export const ELEMENTS_55_CATALOG: CardElementItem[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Editorial & Literary Marks (11)
  // ──────────────────────────────────────────────────────────────────────────
  { id: 'double-serif-quotes', name: 'Double Serif Quotes', category: 'editorial', categoryLabel: 'Editorial & Literary', glyph: '“ ”' },
  { id: 'french-guillemets', name: 'French Guillemets', category: 'editorial', categoryLabel: 'Editorial & Literary', glyph: '« »' },
  { id: 'fleuron-hedera', name: 'Fleuron Hedera Leaf', category: 'editorial', categoryLabel: 'Editorial & Literary', glyph: '❧' },
  { id: 'asterism-triad', name: 'Asterism Triad', category: 'editorial', categoryLabel: 'Editorial & Literary', glyph: '⁂' },
  { id: 'pilcrow-mark', name: 'Classic Pilcrow', category: 'editorial', categoryLabel: 'Editorial & Literary', glyph: '¶' },
  { id: 'section-silcrow', name: 'Section Silcrow', category: 'editorial', categoryLabel: 'Editorial & Literary', glyph: '§' },
  { id: 'typographic-dagger', name: 'Typographic Dagger', category: 'editorial', categoryLabel: 'Editorial & Literary', glyph: '†' },
  { id: 'interrobang', name: 'Interrobang', category: 'editorial', categoryLabel: 'Editorial & Literary', glyph: '‽' },
  { id: 'manicule-hand', name: 'Manicule Pointing Hand', category: 'editorial', categoryLabel: 'Editorial & Literary', glyph: '☞' },
  { id: 'ex-libris-frame', name: 'Ex-Libris Bookplate Frame', category: 'editorial', categoryLabel: 'Editorial & Literary', glyph: '✦ EX LIBRIS ✦' },
  { id: 'colophon-press', name: 'Colophon Press Mark', category: 'editorial', categoryLabel: 'Editorial & Literary', glyph: '❖ PRESS' },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Y2K, Cyber & Aesthetic Icons (11)
  // ──────────────────────────────────────────────────────────────────────────
  { id: 'sparkle-cluster', name: '4-Point Sparkle Cluster', category: 'aesthetic', categoryLabel: 'Y2K & Aesthetic', glyph: '✦ ✧ ✦' },
  { id: 'cyber-crosshair', name: 'Cyber Crosshair', category: 'aesthetic', categoryLabel: 'Y2K & Aesthetic', glyph: '┼' },
  { id: 'tribal-chrome-star', name: 'Tribal Chrome Star', category: 'aesthetic', categoryLabel: 'Y2K & Aesthetic', glyph: '★' },
  { id: 'pixel-heart-8bit', name: '8-Bit Pixel Heart', category: 'aesthetic', categoryLabel: 'Y2K & Aesthetic', glyph: '♥' },
  { id: 'planet-saturn-ring', name: 'Planet Saturn Ring', category: 'aesthetic', categoryLabel: 'Y2K & Aesthetic', glyph: '🪐' },
  { id: 'crescent-moon-star', name: 'Crescent Moon & Star', category: 'aesthetic', categoryLabel: 'Y2K & Aesthetic', glyph: '☽ ⋆' },
  { id: 'barbed-wire-divider', name: 'Barbed Wire Divider', category: 'aesthetic', categoryLabel: 'Y2K & Aesthetic', glyph: '—x—x—x—' },
  { id: 'flame-badge', name: 'Flame Badge', category: 'aesthetic', categoryLabel: 'Y2K & Aesthetic', glyph: '♨' },
  { id: 'butterfly-motif', name: 'Butterfly Motif', category: 'aesthetic', categoryLabel: 'Y2K & Aesthetic', glyph: 'Ƹ̵̡Ӝ̵̨̄Ʒ' },
  { id: 'minidisc-icon', name: 'MiniDisc / CD Icon', category: 'aesthetic', categoryLabel: 'Y2K & Aesthetic', glyph: '💿' },
  { id: 'portable-cassette', name: 'Portable Cassette Tape', category: 'aesthetic', categoryLabel: 'Y2K & Aesthetic', glyph: '📼' },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ID Credential & Security Badges (11)
  // ──────────────────────────────────────────────────────────────────────────
  { id: 'smartchip-gold-pad', name: 'Smartchip Contact Pad (EMV)', category: 'security', categoryLabel: 'ID & Security Badges', glyph: '[ ▤ SIM CHIP ]' },
  { id: 'holo-globe-seal', name: 'Holographic Globe Seal', category: 'security', categoryLabel: 'ID & Security Badges', glyph: '🌐 VERIFIED' },
  { id: 'vip-crown-pass', name: 'VIP Crown Pass Emblem', category: 'security', categoryLabel: 'ID & Security Badges', glyph: '👑 ALL ACCESS' },
  { id: 'press-credential', name: 'Press Credential Badge', category: 'security', categoryLabel: 'ID & Security Badges', glyph: '📷 PRESS 2026' },
  { id: 'academy-crest', name: 'Academy Crest Shield', category: 'security', categoryLabel: 'ID & Security Badges', glyph: '🛡️ ACADEMIA' },
  { id: 'barcode-code128', name: 'Barcode Code-128 Strip', category: 'security', categoryLabel: 'ID & Security Badges', glyph: '||||| |||| |||||||' },
  { id: 'micro-qr-matrix', name: 'Micro-QR Matrix', category: 'security', categoryLabel: 'ID & Security Badges', glyph: '⚁ QR SECURE' },
  { id: 'magnetic-stripe-bar', name: 'Magnetic Stripe Bar', category: 'security', categoryLabel: 'ID & Security Badges', glyph: '▀▀▀▀▀▀▀▀▀▀▀▀' },
  { id: 'lanyard-slot-punch', name: 'Lanyard Slot Punch Mark', category: 'security', categoryLabel: 'ID & Security Badges', glyph: '⬭ SLOT PUNCH' },
  { id: 'guilloche-rosette', name: 'Security Guilloche Rosette', category: 'security', categoryLabel: 'ID & Security Badges', glyph: '❂ GUILLOCHE' },
  { id: 'verified-shield', name: 'Verified Check Shield', category: 'security', categoryLabel: 'ID & Security Badges', glyph: '✓ VERIFIED' },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Technical & Registration Marks (11)
  // ──────────────────────────────────────────────────────────────────────────
  { id: 'crop-bleed-marks', name: 'Printer Crop & Bleed Marks', category: 'technical', categoryLabel: 'Technical & Registration', glyph: '⌜    ⌝\n⌞    ⌟' },
  { id: 'cmyk-calibration-bars', name: 'CMYK Calibration Bars', category: 'technical', categoryLabel: 'Technical & Registration', glyph: '■ ■ ■ ■ CMYK' },
  { id: 'center-crosshair', name: 'Center Target Crosshair', category: 'technical', categoryLabel: 'Technical & Registration', glyph: '⊕ 0.00' },
  { id: 'scale-ruler-mm', name: 'Scale Ruler (mm/px)', category: 'technical', categoryLabel: 'Technical & Registration', glyph: '|.|.|.|.|.|.|' },
  { id: 'timecode-frame-stamp', name: 'Timecode Frame Stamp', category: 'technical', categoryLabel: 'Technical & Registration', glyph: '00:04:23:19' },
  { id: 'rec-battery-indicator', name: 'REC Battery Indicator', category: 'technical', categoryLabel: 'Technical & Registration', glyph: '● REC [98%]' },
  { id: 'film-sprocket-holes', name: '35mm Film Sprockets', category: 'technical', categoryLabel: 'Technical & Registration', glyph: '□ □ □ □ □' },
  { id: 'audio-waveform-bar', name: 'Audio Waveform Bar', category: 'technical', categoryLabel: 'Technical & Registration', glyph: ' ▂▃▅▆▇▆▅▃ ' },
  { id: 'fold-here-scissors', name: 'Fold Here Scissors Line', category: 'technical', categoryLabel: 'Technical & Registration', glyph: '✂ - - - - - -' },
  { id: 'serial-counter', name: 'Serial Number Counter', category: 'technical', categoryLabel: 'Technical & Registration', glyph: 'NO. 000421' },
  { id: 'barcode-isbn-block', name: 'ISBN Barcode Block', category: 'technical', categoryLabel: 'Technical & Registration', glyph: 'ISBN 978-0-1' },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Rubber Stamps & Seals (11)
  // ──────────────────────────────────────────────────────────────────────────
  { id: 'approved-box-stamp', name: 'APPROVED Box Stamp', category: 'stamps', categoryLabel: 'Rubber Stamps & Seals', glyph: '[ APPROVED ]' },
  { id: 'confidential-stamp', name: 'CONFIDENTIAL Angled Stamp', category: 'stamps', categoryLabel: 'Rubber Stamps & Seals', glyph: '/ CONFIDENTIAL /' },
  { id: 'first-edition-seal', name: 'FIRST EDITION Circular Seal', category: 'stamps', categoryLabel: 'Rubber Stamps & Seals', glyph: '◎ 1ST EDITION' },
  { id: 'archive-copy-stamp', name: 'ARCHIVE COPY Stamp', category: 'stamps', categoryLabel: 'Rubber Stamps & Seals', glyph: '【 ARCHIVE COPY 】' },
  { id: 'vip-access-badge', name: 'VIP ACCESS Badge', category: 'stamps', categoryLabel: 'Rubber Stamps & Seals', glyph: '★ VIP ACCESS ★' },
  { id: 'five-star-rating', name: '5-Star Rating Row', category: 'stamps', categoryLabel: 'Rubber Stamps & Seals', glyph: '★★★★★' },
  { id: 'par-avion-airmail', name: 'PAR AVION / AIRMAIL', category: 'stamps', categoryLabel: 'Rubber Stamps & Seals', glyph: '✈ PAR AVION' },
  { id: 'postal-cancellation', name: 'Postal Cancellation Waves', category: 'stamps', categoryLabel: 'Rubber Stamps & Seals', glyph: '≈≈≈≈≈≈' },
  { id: 'wax-seal-silhouette', name: 'Wax Seal Silhouette', category: 'stamps', categoryLabel: 'Rubber Stamps & Seals', glyph: '⦿ SEAL' },
  { id: 'fragile-handle-care', name: 'FRAGILE / HANDLE WITH CARE', category: 'stamps', categoryLabel: 'Rubber Stamps & Seals', glyph: '▲ FRAGILE ▲' },
  { id: 'circular-custom-stamp', name: 'Circular Studio Stamp', category: 'stamps', categoryLabel: 'Rubber Stamps & Seals', glyph: '◯ AESTHETIC STUDIO ◯' },
];
