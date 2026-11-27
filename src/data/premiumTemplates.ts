import type { CanvasDocument, CanvasObject, CardTemplate, CardTheme } from '../types/card';
import { createImageObject, createShapeObject, createTextObject } from '../utils/canvasBuilder';

const svgUri = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;

const buildDoc = (
  id: string,
  title: string,
  width: number,
  height: number,
  background: string,
  objects: CanvasObject[]
): CanvasDocument => ({
  id: `premium_doc_${id}`,
  title,
  canvasWidth: width,
  canvasHeight: height,
  background,
  objects,
  createdAt: '2026-11-26T00:00:00.000Z',
  updatedAt: '2026-11-26T00:00:00.000Z',
});

const signatureTheme = (id: string, name: string, bg: string, ink: string, border?: string): CardTheme => ({
  id,
  name,
  category: 'editorial',
  bg,
  ink,
  border: border || ink,
});

export const PREMIUM_ART_ASSETS = {
  // 1. Actually I Can: grainy ember, terracotta, cobalt and lilac sparkle field
  auraSparkleBackdrop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 960" width="640" height="960">
      <defs>
        <filter id="blurAura" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="42" />
        </filter>
        <filter id="grainNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" seed="11" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
          <feComponentTransfer in="gray" result="alphaNoise">
            <feFuncA type="linear" slope="0.22" />
          </feComponentTransfer>
          <feBlend mode="overlay" in="SourceGraphic" in2="alphaNoise" />
        </filter>
      </defs>
      <rect width="640" height="960" fill="#2b2623" />
      <g filter="url(#blurAura)">
        <ellipse cx="470" cy="490" rx="230" ry="370" fill="#a83d20" opacity="0.95" />
        <ellipse cx="595" cy="360" rx="140" ry="260" fill="#f3c59f" opacity="0.9" />
        <ellipse cx="90" cy="700" rx="190" ry="310" fill="#cf6a3c" opacity="0.92" />
        <ellipse cx="35" cy="650" rx="115" ry="215" fill="#f6d8b8" opacity="0.92" />
        <ellipse cx="185" cy="780" rx="110" ry="200" fill="#99499c" opacity="0.88" />
        <ellipse cx="165" cy="830" rx="60" ry="120" fill="#5da9ad" opacity="0.82" />
        <ellipse cx="320" cy="210" rx="210" ry="180" fill="#464543" opacity="0.9" />
      </g>
      <rect width="640" height="960" fill="transparent" filter="url(#grainNoise)" />
      <rect width="640" height="960" fill="#d86c43" opacity="0.08" />
      <g fill="#ebd1ec" opacity="0.92">
        <path d="M320 42 L324 54 L336 58 L324 62 L320 74 L316 62 L304 58 L316 54 Z" />
        <path d="M144 114 L147 124 L157 127 L147 130 L144 140 L141 130 L131 127 L141 124 Z" />
        <path d="M542 148 L545 157 L554 160 L545 163 L542 172 L539 163 L530 160 L539 157 Z" />
        <path d="M400 188 L403 197 L412 200 L403 203 L400 212 L397 203 L388 200 L397 197 Z" />
        <path d="M594 276 L597 285 L606 288 L597 291 L594 300 L591 291 L582 288 L591 285 Z" />
        <path d="M84 294 L87 303 L96 306 L87 309 L84 318 L81 309 L72 306 L81 303 Z" />
        <path d="M518 524 L521 533 L530 536 L521 539 L518 548 L515 539 L506 536 L515 533 Z" />
        <path d="M62 612 L65 621 L74 624 L65 627 L62 636 L59 627 L50 624 L59 621 Z" />
        <path d="M514 688 L517 697 L526 700 L517 703 L514 712 L511 703 L502 700 L511 697 Z" />
        <path d="M114 812 L117 821 L126 824 L117 827 L114 836 L111 827 L102 824 L111 821 Z" />
        <path d="M580 854 L583 863 L592 866 L583 869 L580 878 L577 869 L568 866 L577 863 Z" />
        <path d="M326 912 L329 921 L338 924 L329 927 L326 936 L323 927 L314 924 L323 921 Z" />
      </g>
    </svg>
  `),

  // 2. Insan Devanagari Tapestry: crimson damask mandala textile
  insaanDamaskBackdrop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" width="960" height="600">
      <defs>
        <pattern id="damaskTile" width="160" height="160" patternUnits="userSpaceOnUse">
          <rect width="160" height="160" fill="#a91642" />
          <path d="M80 12 Q115 48 148 80 Q115 112 80 148 Q45 112 12 80 Q45 48 80 12 Z" fill="#820e31" opacity="0.72" />
          <circle cx="80" cy="80" r="34" fill="#c92355" opacity="0.45" />
          <circle cx="80" cy="80" r="18" fill="#6f0928" opacity="0.65" />
          <path d="M0 0 Q30 30 0 60 M160 0 Q130 30 160 60 M0 160 Q30 130 0 100 M160 160 Q130 130 160 100" stroke="#dc3b6b" stroke-width="2" fill="none" opacity="0.45" />
          <path d="M80 28 L92 68 L132 80 L92 92 L80 132 L68 92 L28 80 L68 68 Z" fill="#d92b5c" opacity="0.32" />
        </pattern>
        <pattern id="weaveGrid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4 H8 M4 0 V8" stroke="#000000" stroke-width="0.7" opacity="0.14" />
        </pattern>
      </defs>
      <rect width="960" height="600" fill="url(#damaskTile)" />
      <rect width="960" height="600" fill="url(#weaveGrid)" />
      <rect width="960" height="600" fill="none" stroke="#4c061b" stroke-width="18" opacity="0.25" />
    </svg>
  `),

  // 3. Do It For Yourself: smoky olive mist & luminous copper wave grain
  amberWaveNoirBackdrop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 960" width="640" height="960">
      <defs>
        <filter id="waveBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="42" />
        </filter>
        <filter id="waveGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="3" seed="7" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
          <feComponentTransfer in="gray" result="alphaNoise">
            <feFuncA type="linear" slope="0.18" />
          </feComponentTransfer>
          <feBlend mode="overlay" in="SourceGraphic" in2="alphaNoise" />
        </filter>
        <linearGradient id="copperSweep" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#615d52" />
          <stop offset="45%" stop-color="#8b4227" />
          <stop offset="72%" stop-color="#ce4616" />
          <stop offset="100%" stop-color="#190502" />
        </linearGradient>
      </defs>
      <rect width="640" height="960" fill="url(#copperSweep)" />
      <g filter="url(#waveBlur)">
        <ellipse cx="220" cy="190" rx="280" ry="260" fill="#716d5f" opacity="0.9" />
        <path d="M-40 580 Q150 690 290 830 Q430 960 680 710 L680 990 L-40 990 Z" fill="#0d0402" />
        <path d="M-40 560 Q140 675 280 820 Q425 945 680 680" fill="none" stroke="#ff9d52" stroke-width="60" opacity="0.94" />
        <path d="M-40 640 Q180 790 380 885 Q520 945 680 740" fill="none" stroke="#f03c0a" stroke-width="34" opacity="0.86" />
      </g>
      <rect width="640" height="960" fill="transparent" filter="url(#waveGrain)" />
    </svg>
  `),

  // 4. Easier Than You Think: cream background & fluid retro tangerine sunbursts
  retroSunburstBackdrop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 960" width="640" height="960">
      <rect width="640" height="960" fill="#faeed6" />
      <path d="M342 422 C370 300 455 245 452 0 L562 0 C535 200 415 285 352 422 Z" fill="#ff9900" />
      <path d="M356 426 C445 315 530 220 640 80 L640 235 C525 320 435 370 362 430 Z" fill="#ff9900" />
      <path d="M366 436 C485 375 565 440 640 345 L640 465 C555 510 455 465 362 442 Z" fill="#ff9900" />
      <path d="M292 528 C215 620 115 630 0 685 L0 805 C120 710 212 645 286 534 Z" fill="#ff9900" />
      <path d="M294 538 C210 695 140 770 0 885 L0 960 L118 960 C205 800 238 695 288 544 Z" fill="#ff9900" />
      <path d="M298 544 C268 715 232 835 186 960 L290 960 C298 820 296 695 294 546 Z" fill="#ff9900" />
    </svg>
  `),

  // 5. Something Beautiful: sage-olive gouache mottled paper
  oliveGouachePaper: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 960" width="640" height="960">
      <defs>
        <filter id="gouacheGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" result="blotch" />
          <feColorMatrix type="matrix" values="0.2 0 0 0 0.72  0.22 0 0 0 0.74  0.12 0 0 0 0.54  0 0 0 1 0" />
        </filter>
      </defs>
      <rect width="640" height="960" fill="#cfd09f" />
      <rect width="640" height="960" filter="url(#gouacheGrain)" opacity="0.35" />
      <ellipse cx="180" cy="240" rx="220" ry="280" fill="#bec08a" opacity="0.24" />
      <ellipse cx="480" cy="720" rx="240" ry="260" fill="#d9daa9" opacity="0.22" />
    </svg>
  `),

  // 6. CHILL Wave: archival bone paper with subtle kinetic crimson margin waves
  chillBoneWaveBackdrop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
      <rect width="800" height="1000" fill="#ede4d0" />
      <path d="M0 950 Q400 925 800 950 L800 1000 L0 1000 Z" fill="#e2d7bf" />
      <path d="M0 50 Q400 75 800 50 L800 0 L0 0 Z" fill="#e2d7bf" />
      <path d="M58 65 Q38 300 68 520 Q92 740 58 935" fill="none" stroke="#992020" stroke-width="2" opacity="0.22" />
      <path d="M742 65 Q722 300 752 520 Q776 740 742 935" fill="none" stroke="#992020" stroke-width="2" opacity="0.22" />
    </svg>
  `),

  // 7. Come Back Prism: dark charcoal film & chromatic light trails
  chromaticPrismBackdrop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
      <defs>
        <filter id="prismBlur" x="-30%" y="-10%" width="160%" height="120%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <linearGradient id="trailUp" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#f97316" stop-opacity="0.95" />
          <stop offset="35%" stop-color="#60a5fa" stop-opacity="0.85" />
          <stop offset="70%" stop-color="#6d28d9" stop-opacity="0.65" />
          <stop offset="100%" stop-color="#141416" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="trailDown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fb923c" stop-opacity="0.95" />
          <stop offset="35%" stop-color="#38bdf8" stop-opacity="0.85" />
          <stop offset="72%" stop-color="#7c3aed" stop-opacity="0.65" />
          <stop offset="100%" stop-color="#141416" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="#151517" />
      <g filter="url(#prismBlur)">
        <rect x="275" y="10" width="44" height="430" rx="22" fill="url(#trailUp)" />
        <rect x="335" y="60" width="46" height="390" rx="23" fill="url(#trailUp)" />
        <rect x="422" y="450" width="42" height="540" rx="21" fill="url(#trailDown)" />
        <rect x="482" y="475" width="38" height="515" rx="19" fill="url(#trailDown)" />
      </g>
      <g fill="#ffffff" opacity="0.22">
        <circle cx="110" cy="180" r="1.2" /><circle cx="670" cy="240" r="1.5" />
        <circle cx="205" cy="720" r="1.1" /><circle cx="715" cy="830" r="1.4" />
        <circle cx="610" cy="490" r="1.2" /><circle cx="145" cy="540" r="1" />
      </g>
    </svg>
  `),

  // 8. Golden Meadow: impressionist lavender & woodland motion study
  impressionistMeadowArt: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 960" width="640" height="960">
      <defs>
        <filter id="skyGlowBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="24" />
        </filter>
        <filter id="meadowBrushBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6.5" />
        </filter>
        <linearGradient id="skyHaze" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2c3323" />
          <stop offset="48%" stop-color="#c9ba9b" />
          <stop offset="100%" stop-color="#5a456b" />
        </linearGradient>
      </defs>
      <rect width="640" height="960" fill="url(#skyHaze)" />
      <g filter="url(#skyGlowBlur)">
        <circle cx="485" cy="175" r="195" fill="#f2ead2" opacity="0.9" />
        <ellipse cx="140" cy="160" rx="220" ry="180" fill="#232c1f" opacity="0.88" />
        <ellipse cx="320" cy="545" rx="340" ry="155" fill="#e5d7b3" opacity="0.78" />
        <ellipse cx="210" cy="785" rx="250" ry="220" fill="#8b6fb0" opacity="0.86" />
        <ellipse cx="470" cy="810" rx="220" ry="220" fill="#634d7d" opacity="0.82" />
      </g>
      <g filter="url(#meadowBrushBlur)">
        <!-- Distant woodland treeline -->
        <path d="M0 360 Q95 270 190 350 Q285 280 390 345 Q510 265 640 340 L640 430 L0 430 Z" fill="#4f5638" opacity="0.48" />
        <!-- Painterly strolling figures in golden mist -->
        <ellipse cx="226" cy="435" rx="22" ry="25" fill="#2b211c" opacity="0.88" />
        <path d="M188 605 C193 485 206 458 228 458 C250 458 264 488 270 612 Z" fill="#efe6cf" opacity="0.88" />
        <ellipse cx="390" cy="380" rx="20" ry="24" fill="#3b261d" opacity="0.88" />
        <rect x="358" y="408" width="64" height="140" rx="26" fill="#f3ebd6" opacity="0.9" />
        <rect x="372" y="534" width="42" height="106" rx="14" fill="#2e2b27" opacity="0.8" />
        <!-- Foreground Impressionist wildflower tufts -->
        <ellipse cx="120" cy="740" rx="68" ry="26" fill="#bfa3df" opacity="0.72" />
        <ellipse cx="315" cy="710" rx="90" ry="28" fill="#d9c69e" opacity="0.65" />
        <ellipse cx="515" cy="760" rx="75" ry="30" fill="#a887cc" opacity="0.72" />
        <circle cx="170" cy="690" r="14" fill="#f5e6ba" opacity="0.78" />
        <circle cx="445" cy="680" r="16" fill="#e9d2a1" opacity="0.78" />
        <circle cx="290" cy="825" r="18" fill="#c7aee8" opacity="0.68" />
      </g>
    </svg>
  `),

  // 9. MONEY Split: black backdrop with fine center currency engraving slit
  currencyApertureSlot: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 960" width="640" height="960">
      <rect width="640" height="960" fill="#050505" />
      <!-- Vertical center paper aperture window -->
      <rect x="288" y="180" width="64" height="600" fill="#e6e5d8" />
      <!-- Ornate banknote crosshatch & monochrome eye engraving inside slot -->
      <ellipse cx="320" cy="300" rx="24" ry="44" fill="none" stroke="#1c241d" stroke-width="2" />
      <ellipse cx="320" cy="300" rx="16" ry="30" fill="none" stroke="#1c241d" stroke-width="1" stroke-dasharray="2 2" />
      <rect x="296" y="400" width="48" height="150" rx="20" fill="#d0cfbe" stroke="#1f2922" stroke-width="1.5" />
      <circle cx="316" cy="452" r="9" fill="#171916" />
      <circle cx="316" cy="495" r="9" fill="#171916" />
      <circle cx="316" cy="452" r="3" fill="#ffffff" />
      <circle cx="316" cy="495" r="3" fill="#ffffff" />
      <circle cx="320" cy="655" r="24" fill="none" stroke="#2d6a4f" stroke-width="3" />
      <circle cx="320" cy="655" r="17" fill="none" stroke="#2d6a4f" stroke-width="1.5" stroke-dasharray="2 2" />
    </svg>
  `),

  // 11. Vitrium Opus: frost mint editorial sheet + vertical prismatic RGB lens refraction bands
  vitriumPrismGlass: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
      <defs>
        <filter id="prismSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <rect width="800" height="1000" fill="#e5ebdd" />
      <g filter="url(#prismSoft)" opacity="0.62">
        <rect x="95" y="290" width="110" height="515" rx="40" fill="#38bdf8" opacity="0.55" />
        <rect x="135" y="305" width="90" height="480" rx="35" fill="#f59e0b" opacity="0.48" />
        <rect x="330" y="340" width="145" height="440" rx="40" fill="#38bdf8" opacity="0.5" />
        <rect x="385" y="355" width="120" height="410" rx="35" fill="#f97316" opacity="0.5" />
        <rect x="570" y="310" width="120" height="475" rx="40" fill="#60a5fa" opacity="0.52" />
        <rect x="610" y="325" width="100" height="440" rx="35" fill="#ef4444" opacity="0.4" />
        <ellipse cx="400" cy="545" rx="360" ry="22" fill="#ffffff" opacity="0.65" />
        <ellipse cx="400" cy="740" rx="360" ry="18" fill="#ffffff" opacity="0.65" />
      </g>
    </svg>
  `),

  // 12. Gold Foil Engraving Plate: obsidian currency portrait plate + metallic gold brushstroke
  goldFoilEngravingPlate: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 960" width="640" height="960">
      <defs>
        <linearGradient id="goldLeafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f6e27a" />
          <stop offset="35%" stop-color="#d4af37" />
          <stop offset="70%" stop-color="#aa7c11" />
          <stop offset="100%" stop-color="#f0cb5e" />
        </linearGradient>
        <pattern id="etchLines" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3 H6" stroke="#d4c9ab" stroke-width="0.6" opacity="0.18" />
        </pattern>
      </defs>
      <rect width="640" height="960" fill="#171717" />
      <!-- Ornate vintage treasury frame -->
      <rect x="28" y="28" width="584" height="904" fill="none" stroke="url(#goldLeafGrad)" stroke-width="4" opacity="0.82" />
      <rect x="42" y="42" width="556" height="876" fill="none" stroke="#8a6e2f" stroke-width="1.5" stroke-dasharray="6 4" />
      <!-- Treasury rosettes -->
      <circle cx="320" cy="145" r="82" fill="none" stroke="url(#goldLeafGrad)" stroke-width="5" stroke-dasharray="4 3" opacity="0.88" />
      <circle cx="320" cy="145" r="65" fill="#232018" stroke="#d4af37" stroke-width="1.5" />
      <circle cx="320" cy="815" r="82" fill="none" stroke="url(#goldLeafGrad)" stroke-width="5" stroke-dasharray="4 3" opacity="0.88" />
      <circle cx="320" cy="815" r="65" fill="#232018" stroke="#d4af37" stroke-width="1.5" />
      <!-- Central dark oval currency portrait engraving -->
      <ellipse cx="320" cy="480" rx="220" ry="270" fill="#111111" stroke="#444038" stroke-width="4" />
      <ellipse cx="320" cy="480" rx="205" ry="255" fill="#21201d" />
      <ellipse cx="320" cy="480" rx="205" ry="255" fill="url(#etchLines)" />
      <!-- Engraved bust silhouette + classic line details -->
      <ellipse cx="320" cy="445" rx="95" ry="120" fill="#3a362e" />
      <path d="M190 700 C190 570 250 535 320 535 C390 535 450 570 450 700 Z" fill="#2e2b24" />
      <path d="M275 435 Q292 422 308 435 M332 435 Q348 422 365 435" stroke="#161513" stroke-width="4" fill="none" />
      <path d="M295 495 Q320 510 345 495" stroke="#161513" stroke-width="4" fill="none" />
      <!-- Bold tactile metallic gold brushstroke masking the portrait eyes -->
      <path d="M250 375 C270 355 380 358 395 378 C402 415 396 475 405 512 C370 532 285 530 242 508 C238 455 246 410 250 375 Z" fill="url(#goldLeafGrad)" opacity="0.96" />
      <path d="M258 392 C295 385 352 387 386 396 M252 440 C295 432 355 436 392 444 M254 484 C300 478 355 480 390 488" stroke="#805e10" stroke-width="3" fill="none" opacity="0.45" />
    </svg>
  `),

  // 13. Interesting Life Note: cotton sheet with subtle ghosted reverse-side typography wash
  cottonBleedPaperBackdrop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
      <defs>
        <filter id="paperFiber">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="2" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="linear" slope="0.06" /></feComponentTransfer>
        </filter>
      </defs>
      <rect width="800" height="1000" fill="#f3f2ee" />
      <rect width="800" height="1000" filter="url(#paperFiber)" />
      <!-- Subtle horizontal reverse-page ghost ink bars (mimics ink bleed without readable clutter) -->
      <g fill="#5b5952" opacity="0.045">
        <rect x="140" y="95" width="460" height="9" rx="4" />
        <rect x="140" y="122" width="510" height="9" rx="4" />
        <rect x="140" y="190" width="490" height="9" rx="4" />
        <rect x="140" y="218" width="440" height="9" rx="4" />
        <rect x="140" y="540" width="500" height="9" rx="4" />
        <rect x="140" y="570" width="420" height="9" rx="4" />
        <rect x="140" y="745" width="510" height="9" rx="4" />
        <rect x="140" y="775" width="470" height="9" rx="4" />
        <rect x="140" y="830" width="480" height="9" rx="4" />
      </g>
    </svg>
  `),

  // 14a. Sky Cumulus Backdrop
  skyCumulusBackdrop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 960" width="640" height="960">
      <defs>
        <linearGradient id="skyBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#225aa8" />
          <stop offset="55%" stop-color="#3c7ac8" />
          <stop offset="100%" stop-color="#76aee8" />
        </linearGradient>
        <filter id="cloudSoft"><feGaussianBlur stdDeviation="24" /></filter>
      </defs>
      <rect width="640" height="960" fill="url(#skyBlue)" />
      <g filter="url(#cloudSoft)" fill="#ffffff" opacity="0.55">
        <ellipse cx="140" cy="180" rx="180" ry="70" />
        <ellipse cx="520" cy="480" rx="200" ry="90" />
        <ellipse cx="220" cy="790" rx="230" ry="85" />
      </g>
    </svg>
  `),

  // 14b. Streetlamp foreground collage layer (curved brushed-steel poles overlapping lettering)
  skyStreetlampOverlay: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <linearGradient id="poleMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#3a424d" />
          <stop offset="45%" stop-color="#a7b3bf" />
          <stop offset="100%" stop-color="#4e5866" />
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="none" />
      <!-- Vertical center pole -->
      <rect x="255" y="140" width="16" height="360" fill="url(#poleMetal)" />
      <rect x="275" y="185" width="12" height="315" fill="url(#poleMetal)" />
      <!-- Left curved lamp arm -->
      <path d="M262 185 C230 95 140 95 65 135" fill="none" stroke="url(#poleMetal)" stroke-width="11" stroke-linecap="round" />
      <polygon points="42,145 78,125 90,142 54,158" fill="#1b2026" />
      <!-- Right curved lamp arm -->
      <path d="M281 420 C315 310 385 265 445 215" fill="none" stroke="url(#poleMetal)" stroke-width="11" stroke-linecap="round" />
      <polygon points="428,225 460,198 475,212 442,238" fill="#1b2026" />
    </svg>
  `),
};

export const PREMIUM_SIGNATURE_TEMPLATES: CardTemplate[] = [
  {
    id: 'premium-actually-aura',
    title: 'Actually, I Can',
    category: 'poster',
    categoryLabel: 'Signature Editorial',
    description: 'Grainy thermal aura gradient with lilac four-point sparkles and tight centered display typography.',
    isSignature: true,
    tags: ['signature', 'free', 'aura', 'grain', 'poster'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'actually, I can.',
    author: 'Signature Aura Series',
    tag: 'SIGNATURE 01 // FREE',
    badge: 'FREE',
    theme: signatureTheme('aura-sparkle', 'Aura Sparkle', '#2b2623', '#f2c4ec'),
    font: 'sans',
    fontSize: 58,
    align: 'center',
    padding: 40,
    borderRadius: 0,
    showGrain: true,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('actually_aura', 'Actually, I Can', 640, 960, '#2b2623', [
      createImageObject(PREMIUM_ART_ASSETS.auraSparkleBackdrop, { name: 'Aura Sparkle Backdrop', x: 0, y: 0, width: 640, height: 960, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Aura Statement', text: 'actually,\nI can.', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 62, fontWeight: '800', lineHeight: 0.94, letterSpacing: -2.5, color: '#f2c4ec', align: 'center', x: 60, y: 395, width: 520, height: 150, zIndex: 10 }),
    ]),
  },
  {
    id: 'premium-insaan-tapestry',
    title: 'Insaan Textile Print',
    category: 'poster',
    categoryLabel: 'Signature Typography',
    description: 'Bold saffron Devanagari geometric display lettering set over crimson woven damask textile art.',
    isSignature: true,
    tags: ['signature', 'free', 'typography', 'devanagari', 'textile'],
    layoutHint: 'horizontal',
    hasPhotoArea: false,
    quote: 'इंसान',
    author: 'Signature Display Series',
    tag: 'SIGNATURE 02 // FREE',
    badge: 'FREE',
    theme: signatureTheme('insaan-tapestry', 'Crimson Damask', '#a91642', '#ffcf00'),
    font: 'sans',
    fontSize: 165,
    align: 'center',
    padding: 36,
    borderRadius: 0,
    showGrain: true,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('insaan_tapestry', 'Insaan Textile Print', 960, 600, '#a91642', [
      createImageObject(PREMIUM_ART_ASSETS.insaanDamaskBackdrop, { name: 'Crimson Damask Weave', x: 0, y: 0, width: 960, height: 600, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Display Headline', text: 'इंसान', fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: 190, fontWeight: '900', lineHeight: 1.05, color: '#ffcf00', align: 'center', x: 60, y: 120, width: 840, height: 290, zIndex: 10 }),
      createTextObject({ name: 'Edition Caption', text: 'HUMANITY // WOVEN TAPESTRY EDITION', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: '700', letterSpacing: 4, color: '#ffe5a3', align: 'center', x: 180, y: 495, width: 600, height: 30, zIndex: 10 }),
    ]),
  },
  {
    id: 'premium-do-it-yourself',
    title: 'Do It For Yourself',
    category: 'quote',
    categoryLabel: 'Signature Light-Leak',
    description: 'Smoky olive mist cascading into molten amber and obsidian film grain with classic serif type.',
    isSignature: true,
    tags: ['signature', 'free', 'light-leak', 'gradient', 'noir'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'do it for yourself.',
    author: 'Noir Wave Series',
    tag: 'SIGNATURE 03 // FREE',
    badge: 'FREE',
    theme: signatureTheme('amber-wave', 'Copper Noir', '#6b675b', '#110a07'),
    font: 'serif',
    fontSize: 34,
    align: 'center',
    padding: 40,
    borderRadius: 0,
    showGrain: true,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('do_it_yourself', 'Do It For Yourself', 640, 960, '#6b675b', [
      createImageObject(PREMIUM_ART_ASSETS.amberWaveNoirBackdrop, { name: 'Copper Light-Leak Grain', x: 0, y: 0, width: 640, height: 960, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Serif Mantra', text: 'do it for yourself.', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 38, fontWeight: '600', letterSpacing: -0.8, color: '#110a07', align: 'center', x: 60, y: 444, width: 520, height: 68, zIndex: 10 }),
    ]),
  },
  {
    id: 'premium-easier-than-think',
    title: 'Easier Than You Think',
    category: 'poster',
    categoryLabel: 'Signature Typography',
    description: 'Retro 70s optical sunburst curves paired with rounded bubble lettering in warm tangerine.',
    isSignature: true,
    tags: ['signature', 'free', 'retro', 'sunburst', 'groove'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'MAYBE IT IS EASIER THAN You think',
    author: 'Groovy Optical Print',
    tag: 'SIGNATURE 04 // FREE',
    badge: 'FREE',
    theme: signatureTheme('retro-sunburst', 'Tangerine Cream', '#faeed6', '#ff9900'),
    font: 'sans',
    fontSize: 66,
    align: 'left',
    padding: 36,
    borderRadius: 0,
    showGrain: false,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('easier_than_think', 'Easier Than You Think', 640, 960, '#faeed6', [
      createImageObject(PREMIUM_ART_ASSETS.retroSunburstBackdrop, { name: 'Optical Sunburst Backdrop', x: 0, y: 0, width: 640, height: 960, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Upper Stack', text: 'MAYBE\nIT IS\nEASIER\nTHAN', fontFamily: "'Fredoka', sans-serif", fontSize: 66, fontWeight: '700', lineHeight: 1.0, letterSpacing: -1, color: '#ff9900', align: 'left', x: 36, y: 44, width: 345, height: 390, zIndex: 10 }),
      createTextObject({ name: 'Lower Punchline', text: 'You\nthink', fontFamily: "'Fredoka', sans-serif", fontSize: 90, fontWeight: '700', lineHeight: 0.96, letterSpacing: -2, color: '#ff9900', align: 'left', x: 314, y: 472, width: 302, height: 360, zIndex: 10 }),
    ]),
  },
  {
    id: 'premium-something-beautiful',
    title: 'Something Beautiful',
    category: 'poster',
    categoryLabel: 'Signature Typography',
    description: 'Heavy olive-moss balloon typography brushed across mottled sage botanical parchment.',
    isSignature: true,
    tags: ['signature', 'free', 'olive', 'gouache', 'poster'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'MAKE TODAY SOMETHING BEAUTIFUL.',
    author: 'Gouache Studio Study',
    tag: 'SIGNATURE 05 // FREE',
    badge: 'FREE',
    theme: signatureTheme('olive-gouache', 'Moss Gouache', '#cfd09f', '#52601e'),
    font: 'sans',
    fontSize: 82,
    align: 'left',
    padding: 32,
    borderRadius: 0,
    showGrain: true,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('something_beautiful', 'Something Beautiful', 640, 960, '#cfd09f', [
      createImageObject(PREMIUM_ART_ASSETS.oliveGouachePaper, { name: 'Gouache Sage Paper', x: 0, y: 0, width: 640, height: 960, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Bubble Manifesto', text: 'MAKE\nTODAY\nSOME-\nTHING\nBEAUTI-\nFUL.', fontFamily: "'Fredoka', sans-serif", fontSize: 96, fontWeight: '700', lineHeight: 0.9, letterSpacing: -2, color: '#52601e', align: 'left', x: 42, y: 52, width: 556, height: 856, zIndex: 10 }),
    ]),
  },
  {
    id: 'premium-chill-wave',
    title: 'CHILL Condensed Pillar',
    category: 'poster',
    categoryLabel: 'Signature Typography',
    description: 'Towering oxblood condensed wordmark framed inside subtle cream contour curves.',
    isSignature: true,
    tags: ['signature', 'free', 'condensed', 'oxblood', 'minimal'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'CHILL',
    author: 'Condensed Type Study',
    tag: 'SIGNATURE 06 // FREE',
    badge: 'FREE',
    theme: signatureTheme('chill-bone', 'Oxblood Bone', '#ede4d0', '#992020'),
    font: 'sans',
    fontSize: 280,
    align: 'center',
    padding: 36,
    borderRadius: 0,
    showGrain: false,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('chill_wave', 'CHILL Condensed Pillar', 800, 1000, '#ede4d0', [
      createImageObject(PREMIUM_ART_ASSETS.chillBoneWaveBackdrop, { name: 'Archival Bone Sheet', x: 0, y: 0, width: 800, height: 1000, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Towering Title', text: 'CHILL', fontFamily: "'Anton', sans-serif", fontSize: 270, fontWeight: '400', lineHeight: 0.88, letterSpacing: 4, color: '#992020', align: 'center', x: 30, y: 120, width: 740, height: 740, zIndex: 10 }),
      createTextObject({ name: 'Margin Stamp', text: 'SPECIMEN 06 // OXBLOOD ARCHIVE', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: '700', letterSpacing: 3, color: '#992020', align: 'center', x: 140, y: 928, width: 520, height: 24, zIndex: 10 }),
    ]),
  },
  {
    id: 'premium-dont-come-back',
    title: 'Come Back // Prism Streak',
    category: 'poster',
    categoryLabel: 'Signature Light-Leak',
    description: 'Chromatic light trails radiating through scratched charcoal film with sharp technical credits.',
    isSignature: true,
    tags: ['signature', 'free', 'chromatic', 'dark', 'prism'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'I HOPE YOU DON’T come back',
    author: 'Night Series 271',
    tag: 'SIGNATURE 07 // FREE',
    badge: 'FREE',
    theme: signatureTheme('prism-streak', 'Prism Charcoal', '#151517', '#ffffff'),
    font: 'sans',
    fontSize: 96,
    align: 'center',
    padding: 36,
    borderRadius: 0,
    showGrain: true,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('dont_come_back', 'Come Back // Prism Streak', 800, 1000, '#151517', [
      createImageObject(PREMIUM_ART_ASSETS.chromaticPrismBackdrop, { name: 'Chromatic Prism Backdrop', x: 0, y: 0, width: 800, height: 1000, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Lead Caption', text: 'I HOPE YOU DON’T', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: '700', letterSpacing: 1.5, color: '#f5f5f5', align: 'center', x: 200, y: 180, width: 400, height: 28, zIndex: 10 }),
      createTextObject({ name: 'Main Chromatic Title', text: 'come\nback', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 98, fontWeight: '800', lineHeight: 0.86, letterSpacing: -3, color: '#ffffff', align: 'center', x: 120, y: 360, width: 560, height: 195, zIndex: 10 }),
      createTextObject({ name: 'Archive Colophon', text: 'STUDIO ARCHIVE\nNIGHT SERIES NO. 271\n26/11/2026', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: '700', lineHeight: 1.35, color: '#e5e5e5', align: 'left', x: 34, y: 902, width: 320, height: 64, zIndex: 10 }),
    ]),
  },
  {
    id: 'premium-golden-meadow',
    title: 'Golden Meadow Blur',
    category: 'poster',
    categoryLabel: 'Signature Light-Leak',
    description: 'Impressionist motion-blurred lavender meadow study with diffused golden canopy light.',
    isSignature: true,
    tags: ['signature', 'free', 'impressionist', 'blur', 'painterly'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'golden hour in bloom // still memory',
    author: 'Soft Focus Folio',
    tag: 'SIGNATURE 08 // FREE',
    badge: 'FREE',
    theme: signatureTheme('golden-meadow', 'Amethyst Meadow', '#4e4057', '#fdf4ff'),
    font: 'editorial',
    fontSize: 18,
    align: 'center',
    padding: 32,
    borderRadius: 0,
    showGrain: true,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('golden_meadow', 'Golden Meadow Blur', 640, 960, '#4e4057', [
      createImageObject(PREMIUM_ART_ASSETS.impressionistMeadowArt, { name: 'Painterly Meadow Haze', x: 0, y: 0, width: 640, height: 960, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Field Caption', text: 'golden hour in bloom // still memory', fontFamily: "'Newsreader', Georgia, serif", fontSize: 18, fontStyle: 'italic', color: '#fdf4ff', align: 'center', x: 60, y: 882, width: 520, height: 34, zIndex: 10 }),
    ]),
  },
  {
    id: 'premium-money-split',
    title: 'MONEY // Currency Slit',
    category: 'poster',
    categoryLabel: 'Signature Collage',
    description: 'Monolithic black aperture split revealing crisp antique treasury engraving down the spine.',
    isSignature: true,
    tags: ['signature', 'free', 'split', 'engraving', 'collage'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'MONEY',
    author: 'Aperture Currency Study',
    tag: 'SIGNATURE 09 // FREE',
    badge: 'FREE',
    theme: signatureTheme('money-split', 'Obsidian Ivory', '#050505', '#f3f1e6'),
    font: 'sans',
    fontSize: 100,
    align: 'center',
    padding: 32,
    borderRadius: 0,
    showGrain: false,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('money_split', 'MONEY // Currency Slit', 640, 960, '#050505', [
      createImageObject(PREMIUM_ART_ASSETS.currencyApertureSlot, { name: 'Currency Aperture Slit', x: 0, y: 0, width: 640, height: 960, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Split Left Stack', text: 'M\nO\nN\nE\nY', fontFamily: "'Anton', sans-serif", fontSize: 102, lineHeight: 1.06, color: '#f3f1e6', align: 'right', x: 118, y: 175, width: 156, height: 610, zIndex: 10 }),
      createTextObject({ name: 'Split Right Stack', text: 'M\nO\nN\nE\nY', fontFamily: "'Anton', sans-serif", fontSize: 102, lineHeight: 1.06, color: '#f3f1e6', align: 'left', x: 366, y: 175, width: 156, height: 610, zIndex: 10 }),
      createTextObject({ name: 'Aperture Tag', text: 'B2 SERIES // ARCHIVAL APERTURE', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: '700', letterSpacing: 2.5, color: '#a3a39b', align: 'center', x: 90, y: 862, width: 460, height: 24, zIndex: 10 }),
    ]),
  },
  {
    id: 'premium-make-art-cobalt',
    title: 'Goal: Make Art',
    category: 'poster',
    categoryLabel: 'Signature Editorial',
    description: 'Vibrant International Klein blue poster with staggered asymmetric grotesque statement rows.',
    isSignature: true,
    tags: ['signature', 'free', 'cobalt', 'minimal', 'swiss'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'goal: make art, be hot.',
    author: 'Klein Cobalt Studio',
    tag: 'SIGNATURE 10 // FREE',
    badge: 'FREE',
    theme: signatureTheme('klein-cobalt', 'Klein Cobalt', '#1e17d8', '#f5f5f7'),
    font: 'sans',
    fontSize: 92,
    align: 'left',
    padding: 40,
    borderRadius: 0,
    showGrain: false,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('make_art_cobalt', 'Goal: Make Art', 800, 1000, '#1e17d8', [
      createShapeObject('rect', { name: 'Klein Blue Field', x: 0, y: 0, width: 800, height: 1000, fill: '#1e17d8', zIndex: 1, locked: true }),
      createTextObject({ name: 'Stagger Line 1', text: 'goal:', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 94, fontWeight: '500', lineHeight: 1.0, letterSpacing: -3, color: '#f5f5f7', x: 88, y: 240, width: 320, height: 115, zIndex: 10 }),
      createTextObject({ name: 'Stagger Line 2', text: 'make   art,', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 94, fontWeight: '500', lineHeight: 1.0, letterSpacing: -3, color: '#f5f5f7', x: 160, y: 440, width: 600, height: 112, zIndex: 10 }),
      createTextObject({ name: 'Stagger Line 3', text: 'be     hot.', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 94, fontWeight: '500', lineHeight: 1.0, letterSpacing: -3, color: '#f5f5f7', x: 68, y: 564, width: 560, height: 112, zIndex: 10 }),
    ]),
  },
  {
    id: 'premium-vitrium-opus',
    title: 'Vitrium Opus // Glass Study',
    category: 'poster',
    categoryLabel: 'Signature Editorial',
    description: 'Swiss modular poster header above frosted chromatic glass bands and crisp serif headline.',
    isSignature: true,
    tags: ['signature', 'free', 'swiss', 'glass', 'refraction'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'forget me not',
    author: 'Vitrium Series 03',
    tag: 'SIGNATURE 11 // FREE',
    badge: 'FREE',
    theme: signatureTheme('vitrium-sage', 'Frost Sage Glass', '#e5ebdd', '#111111'),
    font: 'serif',
    fontSize: 148,
    align: 'left',
    padding: 40,
    borderRadius: 0,
    showGrain: false,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('vitrium_opus', 'Vitrium Opus // Glass Study', 800, 1000, '#e5ebdd', [
      createImageObject(PREMIUM_ART_ASSETS.vitriumPrismGlass, { name: 'Prismatic Glass Backdrop', x: 0, y: 0, width: 800, height: 1000, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Header Brand', text: 'Vitrium\nOpus', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: '800', lineHeight: 1.05, color: '#111111', x: 40, y: 24, width: 180, height: 55, zIndex: 10 }),
      createTextObject({ name: 'Series Label', text: 'Posters\nSeries\n03', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: '700', lineHeight: 1.15, color: '#111111', x: 400, y: 24, width: 120, height: 55, zIndex: 10 }),
      createTextObject({ name: 'Side Epigram', text: 'Refractive prism study.\nSwiss grid archive 2026.', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fontWeight: '600', lineHeight: 1.3, color: '#262626', x: 590, y: 24, width: 170, height: 55, zIndex: 10 }),
      createShapeObject('line', { name: 'Rule Top', x: 40, y: 100, width: 720, height: 1.5, fill: '#111111', zIndex: 5 }),
      createTextObject({ name: 'Poster Subtitle', text: 'Forget me not', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: '700', letterSpacing: -0.5, color: '#111111', x: 40, y: 112, width: 320, height: 42, zIndex: 10 }),
      createTextObject({ name: 'Credit Middle', text: 'designed for canvas\nopen edition 2026', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: '500', lineHeight: 1.25, color: '#111111', x: 400, y: 116, width: 165, height: 40, zIndex: 10 }),
      createTextObject({ name: 'Site URL', text: 'aestheticcardgenerator', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: '500', color: '#111111', x: 590, y: 126, width: 175, height: 22, zIndex: 10 }),
      createShapeObject('line', { name: 'Rule Subheader', x: 40, y: 166, width: 720, height: 1.5, fill: '#111111', zIndex: 5 }),
      createTextObject({ name: 'Explore Meta Left', text: '3D Glass\nExplorations', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: '700', lineHeight: 1.15, color: '#111111', x: 40, y: 180, width: 160, height: 38, zIndex: 10 }),
      createTextObject({ name: 'Handle Mid', text: '@studio_edition', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: '600', color: '#111111', x: 400, y: 186, width: 140, height: 24, zIndex: 10 }),
      createTextObject({ name: 'City Tag', text: 'NYC', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: '700', color: '#111111', x: 590, y: 186, width: 80, height: 24, zIndex: 10 }),
      createTextObject({ name: 'Hero Serif Wordmark', text: 'forget\nme\nnot', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 152, fontWeight: '700', lineHeight: 0.84, letterSpacing: -4, color: '#0d0d0d', align: 'left', x: 40, y: 318, width: 720, height: 470, zIndex: 10 }),
      createShapeObject('line', { name: 'Rule Bottom', x: 40, y: 964, width: 720, height: 1.5, fill: '#111111', zIndex: 5 }),
    ]),
  },
  {
    id: 'premium-gold-foil-plate',
    title: 'Gold Foil Currency Plate',
    category: 'vintage',
    categoryLabel: 'Signature Foil',
    description: 'Etched charcoal currency plate accented by metallic gold-leaf brushstroke and gilt serials.',
    isSignature: true,
    tags: ['signature', 'free', 'gold-foil', 'engraving', 'vintage'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'KB 51467758',
    author: 'Federal Gold Plate',
    tag: 'SIGNATURE 12 // FREE',
    badge: 'FREE',
    theme: signatureTheme('gold-foil', 'Gold Charcoal', '#171717', '#d4af37'),
    font: 'mono',
    fontSize: 16,
    align: 'center',
    padding: 32,
    borderRadius: 0,
    showGrain: true,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('gold_foil_plate', 'Gold Foil Currency Plate', 640, 960, '#171717', [
      createImageObject(PREMIUM_ART_ASSETS.goldFoilEngravingPlate, { name: 'Engraved Gold Leaf Plate', x: 0, y: 0, width: 640, height: 960, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Top Serial', text: 'KB 51467758', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: '#d4af37', align: 'center', x: 245, y: 135, width: 150, height: 22, zIndex: 10 }),
      createTextObject({ name: 'Bottom Serial', text: 'KB 51467758\nARCHIVE', fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: '800', letterSpacing: 1.5, lineHeight: 1.25, color: '#d4af37', align: 'center', x: 245, y: 800, width: 150, height: 32, zIndex: 10 }),
    ]),
  },
  {
    id: 'premium-interesting-life',
    title: 'Interesting Life Note',
    category: 'notes',
    categoryLabel: 'Signature Handwritten',
    description: 'Cobalt felt-tip handwritten note on archival letterpress cotton paper with faint reverse bleed.',
    isSignature: true,
    tags: ['signature', 'free', 'handwritten', 'letterpress', 'minimal'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'I hope you build a life so interesting that you forget to check your phone',
    author: 'Archival Cotton Sheet',
    tag: 'SIGNATURE 13 // FREE',
    badge: 'FREE',
    theme: signatureTheme('cobalt-letterpress', 'Cobalt Cotton', '#f3f2ee', '#1d4ed8'),
    font: 'caveat',
    fontSize: 58,
    align: 'center',
    padding: 40,
    borderRadius: 0,
    showGrain: true,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('interesting_life', 'Interesting Life Note', 800, 1000, '#f3f2ee', [
      createImageObject(PREMIUM_ART_ASSETS.cottonBleedPaperBackdrop, { name: 'Cotton Letterpress Paper', x: 0, y: 0, width: 800, height: 1000, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Handwritten Verse', text: 'I hope you\nbuild a life so\ninteresting\nthat you forget to\ncheck your phone', fontFamily: "'Caveat', cursive", fontSize: 64, fontWeight: '700', lineHeight: 1.15, color: '#1d4ed8', align: 'center', x: 70, y: 245, width: 660, height: 470, zIndex: 10 }),
      createTextObject({ name: 'Footer Bracket', text: '[@STUDIOARCHIVE]', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: '700', letterSpacing: 1.5, color: '#1d4ed8', align: 'center', x: 240, y: 940, width: 320, height: 24, zIndex: 10 }),
    ]),
  },
  {
    id: 'premium-sky-collage',
    title: 'All Things Possible',
    category: 'poster',
    categoryLabel: 'Signature Collage',
    description: 'Daytime cerulean cloud sky interleaved with curved streetlamp collage art and hand-cut type.',
    isSignature: true,
    tags: ['signature', 'free', 'collage', 'sky', 'editorial'],
    layoutHint: 'vertical',
    hasPhotoArea: false,
    quote: 'WITH GOD ALL THINGS ARE POSSIBLE',
    author: 'Skyline Collage Series',
    tag: 'SIGNATURE 14 // FREE',
    badge: 'FREE',
    theme: signatureTheme('cerulean-sky', 'Cerulean Cloud', '#2b65b0', '#ffffff'),
    font: 'sans',
    fontSize: 96,
    align: 'center',
    padding: 32,
    borderRadius: 0,
    showGrain: false,
    showBorder: false,
    showIcon: false,
    iconName: 'sparkles',
    canvasDoc: buildDoc('sky_collage', 'All Things Possible', 640, 960, '#2b65b0', [
      createImageObject(PREMIUM_ART_ASSETS.skyCumulusBackdrop, { name: 'Cerulean Cloud Sky', x: 0, y: 0, width: 640, height: 960, borderRadius: 0, zIndex: 1, locked: true }),
      createTextObject({ name: 'Cutout Sky Headline', text: 'WITH\nGOD\nALL\nTHINGS\nARE\nPOSSIBLE', fontFamily: "'Fredoka', sans-serif", fontSize: 94, fontWeight: '700', lineHeight: 0.9, letterSpacing: -2, color: '#ffffff', align: 'center', x: 50, y: 112, width: 540, height: 670, zIndex: 6 }),
      createImageObject(PREMIUM_ART_ASSETS.skyStreetlampOverlay, { name: 'Streetlamp Collage Poles', x: 100, y: 460, width: 500, height: 500, objectFit: 'contain', borderRadius: 0, zIndex: 8 }),
      createTextObject({ name: 'Marker Accent Top', text: '° o °', fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: '700', color: '#f97316', align: 'center', x: 170, y: 66, width: 300, height: 42, zIndex: 10 }),
    ]),
  },
];
