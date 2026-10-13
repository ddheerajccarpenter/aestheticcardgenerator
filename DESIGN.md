---
version: alpha
name: Unified-Airtable-Binance-Design-System
description: A unified design system merging Airtable's editorial workflow software interface and Binance's high-velocity financial trading platform. The system shares a common 4px spatial scale, flat color-block depth model, WCAG touch ergonomics, and strict default/active-only state discipline. It supports two deliberate operational dialects that can be used independently or combined within a product suite — (1) Airtable Editorial Mode, anchored on a clean white canvas, Haas Grotesk typography, 96px vertical section cadence, a near-black primary CTA, and full-bleed signature cards in coral, forest, cream, and pastels; and (2) Binance Financial/Trading Mode, anchored on deep near-black canvas with a light-mode transactional flip, BinanceNova/BinancePlex tabular typography, 80px dense cadence, iconic high-voltage Binance Yellow (#FCD535) primary CTAs, and semantic green/red trading indicators.

colors:
  # --- Common & Structural Foundations ---
  canvas: "#ffffff"
  canvas-light: "#ffffff"
  canvas-dark: "#0b0e11"
  surface-soft-light: "#fafafa"
  surface-strong-light: "#f5f5f5"
  surface-soft: "#f8fafc"
  surface-strong: "#e0e2e6"
  surface-card-dark: "#1e2329"
  surface-elevated-dark: "#2b3139"
  surface-dark: "#181d26"
  surface-dark-elevated: "#1d1f25"
  hairline: "#dddddd"
  hairline-on-light: "#eaecef"
  hairline-on-dark: "#2b3139"
  border-strong: "#cdd1d6"
  border-strong-airtable: "#9297a0"

  # --- Text & Contrast Tokens ---
  ink: "#181a20"
  ink-airtable: "#181d26"
  body: "#333840"
  body-on-dark: "#eaecef"
  body-on-light: "#181a20"
  muted: "#707a8a"
  muted-airtable: "#41454d"
  muted-strong: "#929aa5"
  on-primary: "#ffffff"
  on-primary-binance: "#181a20"
  on-dark: "#ffffff"

  # --- Airtable Dialect: Brand & Signature Cards ---
  primary: "#181d26"
  primary-active: "#0d1218"
  primary-airtable: "#181d26"
  primary-airtable-active: "#0d1218"
  signature-coral: "#aa2d00"
  signature-forest: "#0a2e0e"
  signature-cream: "#f5e9d4"
  signature-peach: "#fcab79"
  signature-mint: "#a8d8c4"
  signature-yellow: "#f4d35e"
  signature-mustard: "#d9a441"
  pricing-ink: "#1d1f25"
  link: "#1b61c9"
  link-active: "#1a3866"

  # --- Binance Dialect: Brand & Trading Semantics ---
  primary-binance: "#fcd535"
  primary-binance-active: "#f0b90b"
  primary-binance-disabled: "#3a3a1f"
  primary-disabled: "#3a3a1f"
  trading-up: "#0ecb81"
  trading-down: "#f6465d"
  accent-turquoise: "#2dbdb6"

  # --- Semantic Badges & Feedback ---
  info: "#3b82f6"
  info-airtable: "#254fad"
  info-border: "#458fff"
  info-ring: "#3b82f6"
  success: "#006400"
  success-border: "#39bf45"

typography:
  # --- Shared & Common Scales ---
  body-md:
    fontFamily: "BinanceNova, Haas, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: "BinanceNova, Haas, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0.16px
  button:
    fontFamily: "Haas, BinanceNova, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0

  # --- Airtable Dialect: Haas Grotesk & Inter Display ---
  display-xl:
    fontFamily: "Haas Groot Disp, Haas, sans-serif"
    fontSize: 48px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: 0
  display-lg:
    fontFamily: "Haas Groot Disp, Haas, sans-serif"
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0
  display-md:
    fontFamily: "Haas Groot Disp, Haas, sans-serif"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0
  title-lg:
    fontFamily: "Haas, sans-serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: 0.12px
  title-md:
    fontFamily: "Haas Groot Disp, Haas, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  title-sm:
    fontFamily: "Haas, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  label-md:
    fontFamily: "Haas, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  legal:
    fontFamily: "Haas, sans-serif"
    fontSize: 13.12px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  pricing-display:
    fontFamily: "Inter Display, system-ui, sans-serif"
    fontSize: 44.8px
    fontWeight: 475
    lineHeight: 1.1
    letterSpacing: 0
  pricing-section:
    fontFamily: "Inter Display, system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 475
    lineHeight: 1.2
    letterSpacing: 0
  pricing-card-title:
    fontFamily: "Inter Display, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 475
    lineHeight: 1.3
    letterSpacing: 0

  # --- Binance Dialect: BinanceNova & BinancePlex Tabular ---
  hero-display:
    fontFamily: "BinanceNova, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -1px
  binance-display-lg:
    fontFamily: "BinanceNova, sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.5px
  binance-display-md:
    fontFamily: "BinanceNova, sans-serif"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.3px
  binance-display-sm:
    fontFamily: "BinanceNova, sans-serif"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  binance-title-lg:
    fontFamily: "BinanceNova, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  binance-title-md:
    fontFamily: "BinanceNova, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0
  binance-title-sm:
    fontFamily: "BinanceNova, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  number-display:
    fontFamily: "BinancePlex, BinanceNova, monospace, sans-serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.3px
  number-md:
    fontFamily: "BinancePlex, BinanceNova, monospace, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  number-sm:
    fontFamily: "BinancePlex, BinanceNova, monospace, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  body-sm:
    fontFamily: "BinanceNova, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button-binance:
    fontFamily: "BinanceNova, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0
  nav-link:
    fontFamily: "BinanceNova, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  xs: 2px
  sm: 4px
  sm-airtable: 6px
  md: 6px
  md-airtable: 10px
  lg: 8px
  lg-airtable: 12px
  xl: 12px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px
  section-airtable: 96px
  section-binance: 80px

components:
  # ==========================================
  # BUTTONS
  # ==========================================
  # Airtable Button Suite
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.lg-airtable}"
    padding: 16px 24px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg-airtable}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.lg-airtable}"
    padding: 16px 24px
  button-secondary-on-dark:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.lg-airtable}"
    padding: 16px 24px
  button-legal:
    backgroundColor: "{colors.link}"
    textColor: "{colors.on-primary}"
    typography: "{typography.legal}"
    rounded: "{rounded.xs}"
    padding: 12px 10px
  button-icon-circular:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 40px
  button-pricing-pill:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.pricing-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 12px 24px

  # Binance Button Suite
  button-primary-binance:
    backgroundColor: "{colors.primary-binance}"
    textColor: "{colors.on-primary-binance}"
    typography: "{typography.button-binance}"
    rounded: "{rounded.md}"
    padding: 12px 24px
    height: 40px
  button-primary-binance-active:
    backgroundColor: "{colors.primary-binance-active}"
    textColor: "{colors.on-primary-binance}"
    rounded: "{rounded.md}"
  button-primary-binance-disabled:
    backgroundColor: "{colors.primary-binance-disabled}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
  button-primary-pill-binance:
    backgroundColor: "{colors.primary-binance}"
    textColor: "{colors.on-primary-binance}"
    typography: "{typography.button-binance}"
    rounded: "{rounded.pill}"
    padding: 14px 32px
  button-secondary-on-dark-binance:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-binance}"
    rounded: "{rounded.md}"
    padding: 12px 24px
  button-secondary-on-light-binance:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.button-binance}"
    rounded: "{rounded.md}"
    padding: 12px 24px
  button-tertiary-text:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.button-binance}"
  button-trading-up:
    backgroundColor: "{colors.trading-up}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-binance}"
    rounded: "{rounded.sm}"
    padding: 8px 20px
  button-trading-down:
    backgroundColor: "{colors.trading-down}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-binance}"
    rounded: "{rounded.sm}"
    padding: 8px 20px
  button-subscribe:
    backgroundColor: "{colors.primary-binance}"
    textColor: "{colors.on-primary-binance}"
    typography: "{typography.button-binance}"
    rounded: "{rounded.sm}"
    padding: 6px 16px
    height: 28px
  text-link:
    backgroundColor: transparent
    textColor: "{colors.link}"
    typography: "{typography.body-md}"
  text-link-binance:
    backgroundColor: transparent
    textColor: "{colors.primary-binance}"
    typography: "{typography.body-md}"

  # ==========================================
  # NAVIGATION
  # ==========================================
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    height: 64px
  top-nav-dark:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.nav-link}"
    height: 64px
  top-nav-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: 64px

  # ==========================================
  # HERO BANDS & SIGNATURE SURFACES
  # ==========================================
  hero-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-lg}"
    padding: 96px
  hero-band-dark:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.hero-display}"
    padding: 80px
  funds-safu-band:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.primary-binance}"
    typography: "{typography.binance-display-lg}"
    padding: 80px
  arena-hero-gradient:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.primary-binance}"
    typography: "{typography.binance-display-lg}"
    padding: 80px

  # Airtable Signature Color Cards
  signature-coral-card:
    backgroundColor: "{colors.signature-coral}"
    textColor: "{colors.on-primary}"
    typography: "{typography.display-md}"
    rounded: "{rounded.lg-airtable}"
    padding: 48px
  signature-forest-card:
    backgroundColor: "{colors.signature-forest}"
    textColor: "{colors.on-primary}"
    typography: "{typography.display-md}"
    rounded: "{rounded.lg-airtable}"
    padding: 48px
  hero-card-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-md}"
    rounded: "{rounded.lg-airtable}"
    padding: 48px
  cream-callout-card:
    backgroundColor: "{colors.signature-cream}"
    textColor: "{colors.ink}"
    typography: "{typography.title-lg}"
    rounded: "{rounded.md-airtable}"
    padding: 24px
  feature-card-tabbed:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.title-lg}"
    rounded: "{rounded.lg-airtable}"
    padding: 32px
  demo-grid-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md-airtable}"
    padding: 16px
  logo-strip:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted-airtable}"
    typography: "{typography.body-md}"
    padding: 32px
  article-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.title-sm}"
    rounded: "{rounded.md-airtable}"
    padding: 16px
  topic-filter-rail:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.body-md}"
    width: 240px

  # Binance Cards & Display Panels
  stat-callout-card:
    backgroundColor: transparent
    textColor: "{colors.primary-binance}"
    typography: "{typography.number-display}"
  trust-badge:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.binance-title-sm}"
    rounded: "{rounded.lg}"
    padding: 16px 20px
  markets-table-card:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 24px
  markets-row:
    backgroundColor: transparent
    textColor: "{colors.on-dark}"
    typography: "{typography.number-md}"
    padding: 12px 0
  price-up-cell:
    backgroundColor: transparent
    textColor: "{colors.trading-up}"
    typography: "{typography.number-md}"
  price-down-cell:
    backgroundColor: transparent
    textColor: "{colors.trading-down}"
    typography: "{typography.number-md}"
  feature-photo-card:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.xl}"
  qr-promo-card:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.binance-title-md}"
    rounded: "{rounded.xl}"
    padding: 32px
  faq-row:
    backgroundColor: transparent
    textColor: "{colors.on-dark}"
    typography: "{typography.binance-title-sm}"
    rounded: "{rounded.md}"
    padding: 20px 0
  cta-band-light:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    typography: "{typography.display-md}"
    rounded: "{rounded.lg-airtable}"
    padding: 48px
  cta-band-dark:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.binance-display-sm}"
    rounded: "{rounded.xl}"
    padding: 48px

  # ==========================================
  # TRANSACTIONAL & FINANCIAL COMPONENTS
  # ==========================================
  buy-crypto-amount-card:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.number-display}"
    rounded: "{rounded.lg}"
    padding: 24px
  steps-card:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.binance-title-sm}"
    rounded: "{rounded.lg}"
    padding: 24px
  price-chart-card:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  conversion-cell:
    backgroundColor: transparent
    textColor: "{colors.body-on-light}"
    typography: "{typography.body-md}"
  trader-row:
    backgroundColor: transparent
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    padding: 12px 0

  # ==========================================
  # INPUTS & FORMS
  # ==========================================
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm-airtable}"
    padding: 12px 16px
    height: 44px
  text-input-focus:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm-airtable}"
  text-input-on-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 16px
    height: 40px
  search-input-on-dark:
    backgroundColor: "{colors.surface-card-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 10px 16px
    height: 40px
  cookie-consent-card:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 16px

  # ==========================================
  # PRICING SUB-SYSTEM
  # ==========================================
  pricing-tier-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.pricing-ink}"
    typography: "{typography.pricing-card-title}"
    rounded: "{rounded.md-airtable}"
    padding: 32px
  pricing-tier-card-featured:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.pricing-ink}"
    typography: "{typography.pricing-card-title}"
    rounded: "{rounded.md-airtable}"
    padding: 32px
  pricing-comparison-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.body-md}"
    padding: 12px

  # ==========================================
  # FOOTERS
  # ==========================================
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.body-md}"
    padding: 64px
  footer-light:
    backgroundColor: "{colors.surface-soft-light}"
    textColor: "{colors.body-on-light}"
    typography: "{typography.body-md}"
    padding: 64px
---

## Overview

### Visual Wireframe References & Product Scope Notice

> [!IMPORTANT]
> **Wireframe Reference Only (Not App Content)**:
> The two UI image files provided in the repository ([asthethiccardgenerator ui 2.png](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/asthethiccardgenerator%20ui%202.png) and [ui for astheticcardgenerateor.png](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/ui%20for%20astheticcardgenerateor.png)) are included **strictly as layout and wireframe references** (to guide UI arrangement, canvas positioning, property panel organization, and responsive layout hierarchy).
> - **DO NOT** use the images as static or hardcoded content, mock copy, or literal card graphics for the application.
> - The core web app is an **Aesthetic Text-to-Card Generator** where users input their own text, choose predesigned templates, edit design layers live on an interactive canvas, and export finished cards client-side.

### Mandatory GitHub Repo & Change Documentation Rule

> [!IMPORTANT]
> **All Web App Changes Must Be Documented in `README.md`**:
> Whenever any code, design token, UI component, feature, state management, or architecture changes are made anywhere in the web application, they **must be clearly explained and logged in [README.md](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/README.md)**.
> This guarantees that the project maintains a clean, professional, transparent, and high-quality GitHub repository with an accurate changelog, architectural decisions, and updated feature documentation.

This specification unifies two proven design systems into a single, cohesive framework: **Airtable's editorial workflow interface** and **Binance's high-velocity financial trading platform**. While each system addresses a distinct product category and emotional frequency, they share core engineering foundations that make them exceptionally complementary when merged.

### Common Core Foundations

Both systems adhere to rigorous design principles that form the shared baseline of this merged system:
1. **Mathematical Spatial Scale**: Every layout dimension, margin, padding, and height is strictly aligned to a **4px base grid** (`{spacing.xxs}` 4px through `{spacing.xxl}` 48px).
2. **Flat Color-Block Elevation**: Neither system relies on heavy drop shadows, fuzzy atmospheric glows, skeuomorphic bevels, or glassmorphism. Visual depth is achieved through high-contrast boundary changes between layered background surfaces and clean 1px hairline dividers.
3. **Scarcity of Primary Actions**: Both systems treat the primary CTA as an authoritative, scarce resource. Viewports feature at most one prominent primary action; secondary options sit in subdued outline or surface-matched containers.
4. **State Discipline (No Hover Rule)**: In alignment with production design system linting standards, components document only **Default** and **Active / Pressed** states. Hover nuances are rejected in favor of robust, accessible touch and focus primitives.
5. **Ergonomic Touch Targets**: All interactive elements satisfy WCAG minimums (40px–48px effective target heights for primary actions, 44px minimum for text inputs).
6. **Functional Typographic Hierarchy**: Display headers rely on scale and letter-spacing contrast rather than arbitrary font-weight inflation.

---

### Distinct System Dialects

To respect the distinct product identities of Airtable and Binance without collision, the merged system organizes specialized behavior into two operational **Dialects**:

```
+---------------------------------------------------------------------------------------------------+
|                                 UNIFIED CORE ARCHITECTURE                                         |
|        4px Spatial Grid  *  Flat Elevation  *  1px Hairlines  *  WCAG AAA Touch Ergonomics        |
+-------------------------------------------------+-------------------------------------------------+
|                                                 |                                                 |
|          DIALECT A: AIRTABLE EDITORIAL          |           DIALECT B: BINANCE FINANCIAL          |
|                                                 |                                                 |
|  * Anchor: Clean White Canvas ({colors.canvas}) |  * Anchor: Deep Dark Canvas ({canvas-dark})     |
|  * Voltage: Full-Bleed Signature Cards          |    with Light Transactional Flip ({canvas-light})|
|    (Coral, Forest, Cream, Peach, Mint)          |  * Voltage: Iconic Binance Yellow (#FCD535)     |
|  * Primary CTA: Near-Black Pill ({primary})     |  * Primary CTA: Electric Yellow ({primary-bin}) |
|  * Typography: Haas Grotesk + Inter Display     |  * Typography: BinanceNova + BinancePlex Tabular|
|  * Section Cadence: 96px ({spacing.section})    |  * Section Cadence: 80px ({section-binance})    |
|  * Vibe: Calm, Magazine-Editorial, Spaced       |  * Vibe: Fast, Trustworthy, High-Density Data   |
+-------------------------------------------------+-------------------------------------------------+
```

#### Dialect A: Airtable Editorial Mode
- **Atmosphere**: Calm, quiet, and magazine-editorial. Long-scroll pages breathe through generous whitespace anchored on a pure white canvas (`{colors.canvas}` #ffffff).
- **Brand Voltage**: Energy does not come from background washes or neon accents; it arrives in **full-bleed signature cards** (`{colors.signature-coral}`, `{colors.signature-forest}`, `{colors.signature-cream}`) that punctuate the scroll every 2 to 3 screens.
- **Action Hierarchy**: The primary CTA is near-black (`{colors.primary-airtable}` #181d26) with crisp white type and `{rounded.lg-airtable}` (12px) rounding, paired with a white outline secondary button.
- **Type Stack**: **Haas Grotesk Disp** (display sizes 32px–48px at modest weights 400–500) and **Haas Grotesk** for running copy. Display type is never bolded for its own sake.
- **Sub-System**: The **Pricing Sub-System** introduces **Inter Display** at unique variable mid-weights (475 / 575) and pill buttons (`{rounded.pill}`), signaling commercial precision.

#### Dialect B: Binance Financial & Trading Mode
- **Atmosphere**: Confident, data-dense financial infrastructure. Defaults to a near-black trading floor (`{colors.canvas-dark}` #0b0e11), with transactional user journeys (deposit, checkout, buy crypto) flipping to crisp light mode (`{colors.canvas-light}` #ffffff).
- **Brand Voltage**: A single, unmistakable brand accent — **Binance Yellow** (`{colors.primary-binance}` #FCD535) carrying every primary CTA, stat highlight, and brand claim ("FUNDS ARE SAFU").
- **Action Hierarchy**: Yellow primary buttons with black text (`{colors.on-primary-binance}` #181a20), supported by dedicated **Trading Green** (`{colors.trading-up}`) and **Trading Red** (`{colors.trading-down}`) buttons for explicit financial transactions.
- **Type Stack**: **BinanceNova** for marketing and UI copy, coupled with **BinancePlex** for all numerical and tabular data (tickers, volumes, balances, prices). Numbers never use standard proportional body type.
- **Page Termination**: Marketing pages feature an inverted light footer (`{colors.surface-soft-light}` #fafafa) beneath dark canvas sections to provide a grounding visual close.

---

### Comparative Feature Matrix

| Design Dimension | Common Foundation | Airtable Editorial Dialect | Binance Financial Dialect |
|---|---|---|---|
| **Primary Canvas** | Pure contrast floors | Pure white (`#ffffff`) | Deep near-black (`#0b0e11`) with light transactional mode |
| **Primary CTA** | High-contrast, single action per screen | Near-black pill (`#181d26`) with white text | Electric Yellow (`#FCD535`) with black text |
| **Accent Voltage** | Scarcely applied | Multi-hue signature cards (coral, forest, cream, pastels) | Monochromatic yellow voltage + green/red price signals |
| **Typography Display** | Modest weights, tight tracking | Haas Grotesk (weight 400–500) | BinanceNova (weight 600–700) for fast tabular recognition |
| **Numerical Data** | Tabular consistency | Standard Haas figures or Inter Display | Dedicated BinancePlex tabular numbers |
| **Section Cadence** | Multiples of 16px | Relaxed 96px (`{spacing.section}`) | Denser 80px (`{spacing.section-binance}`) |
| **Border Radii** | Geometric scale (2px to 9999px) | Standard 10px–12px (`{rounded.md-airtable}` / `{rounded.lg-airtable}`) | Compact 6px–8px (`{rounded.md}` / `{rounded.lg}`) |
| **Elevation** | Flat color blocks + 1px hairlines | Surface shifts (`{colors.surface-soft}`, `{colors.surface-strong}`) | Surface shifts (`{colors.surface-card-dark}`, `{colors.surface-elevated-dark}`) |
| **Footer Treatment** | 6-column comprehensive sitemap | White canvas matching page floor | Off-white (`#fafafa`) closing band resetting dark body |

---

## Colors

### Common & Surfacing Foundation

Both dialects build their environments on clean, flat surface tokens:

| Token | Hex Value | Common Usage |
|---|---|---|
| `{colors.canvas-light}` | `#ffffff` | Primary editorial floor; light-mode transactional surface. |
| `{colors.canvas-dark}` | `#0b0e11` | Primary financial dark floor; high-contrast night surface. |
| `{colors.surface-soft}` | `#f8fafc` | Tabbed feature cards, soft editorial panels, featured pricing tiers. |
| `{colors.surface-strong}` | `#e0e2e6` | Muted banner bands, pre-footer light CTA strips. |
| `{colors.surface-card-dark}` | `#1e2329` | Dark-mode cards, trading tables, elevated dark panels, dropdown menus. |
| `{colors.surface-elevated-dark}` | `#2b3139` | Secondary nested dark cards, hovered nav panels, dark hairline base. |
| `{colors.surface-soft-light}` | `#fafafa` | Binance light footer on dark pages, light secondary disabled floors. |
| `{colors.surface-strong-light}` | `#f5f5f5` | Muted form input backgrounds on light transactional dialogs. |
| `{colors.hairline-on-light}` | `#eaecef` | Standard 1px boundary on light surfaces (inputs, table dividers). |
| `{colors.hairline-on-dark}` | `#2b3139` | Standard 1px boundary on dark surfaces (cards, table rows). |
| `{colors.hairline}` | `#dddddd` | Airtable standard input and secondary button outline. |

### Text & Contrast Tokens

| Token | Hex Value | Role & Rules |
|---|---|---|
| `{colors.ink}` | `#181a20` | Highest contrast text on light surfaces; display headers on light canvas. |
| `{colors.body}` | `#333840` | Default running copy on light editorial canvas (Airtable body). |
| `{colors.body-on-light}` | `#181a20` | High-contrast transactional text on light surfaces (Binance body). |
| `{colors.body-on-dark}` | `#eaecef` | Running copy on dark canvas — cool off-white, never harsh pure white. |
| `{colors.muted}` | `#707a8a` | Captions, breadcrumbs, table column headers, secondary timestamps. |
| `{colors.muted-airtable}` | `#41454d` | Editorial footer links and muted metadata. |
| `{colors.muted-strong}` | `#929aa5` | Emphasized label text and secondary status indicators. |
| `{colors.on-dark}` | `#ffffff` | Pure white for headers and high-contrast labels on dark surfaces. |
| `{colors.on-primary}` | `#ffffff` | Text on near-black Airtable primary buttons and signature dark cards. |
| `{colors.on-primary-binance}` | `#181a20` | Jet-black text on yellow Binance primary buttons (crucial brand signature). |

---

### Airtable Dialect: Signature Color Palette

Airtable's visual energy relies exclusively on large-area signature surface cards. These colors are never applied to small icons or button accents; they exist to house full content sections:

- **Primary Action** (`{colors.primary-airtable}` — `#181d26`): The authoritative near-black used for primary CTAs and major headlines. Active press: `{colors.primary-airtable-active}` (`#0d1218`).
- **Signature Coral** (`{colors.signature-coral}` — `#aa2d00`): Dark oxide coral used for hero product callouts ("Production apps in prototype speed").
- **Signature Forest** (`{colors.signature-forest}` — `#0a2e0e`): Deep evergreen card surface carrying white typography and UI mockups.
- **Signature Cream** (`{colors.signature-cream}` — `#f5e9d4`): Warm beige callout band ("The path to 10× every person") holding dark ink copy.
- **Pastel Demo Surfaces**:
  - `{colors.signature-peach}` (`#fcab79`), `{colors.signature-mint}` (`#a8d8c4`), `{colors.signature-yellow}` (`#f4d35e`), `{colors.signature-mustard}` (`#d9a441`): Used as backgrounds for individual product feature cards inside multi-card grids.
- **Editorial Link** (`{colors.link}` — `#1b61c9`): Standard inline text link color. Darkens on press to `{colors.link-active}` (`#1a3866`).
- **Editorial Success & Info**: `{colors.success}` (`#006400`) with `{colors.success-border}` (`#39bf45`); `{colors.info-airtable}` (`#254fad`) with `{colors.info-border}` (`#458fff`).

---

### Binance Dialect: Brand & Trading Semantics

Binance uses a tightly focused brand palette optimized for immediate trading decisions:

- **Binance Yellow** (`{colors.primary-binance}` — `#FCD535`): The sole brand color. Governs primary CTAs, trust badges, stat highlights, and hero claims.
  - Active Press: `{colors.primary-binance-active}` (`#f0b90b`).
  - Disabled State: `{colors.primary-binance-disabled}` (`#3a3a1f`).
- **Trading Up** (`{colors.trading-up}` — `#0ecb81`): Semantic price-increase green. Applied to price tickers, candlestick charts, and Buy / Long action buttons. Never used as a generic card background.
- **Trading Down** (`{colors.trading-down}` — `#f6465d`): Semantic price-decrease red. Applied to negative percentage changes, falling candles, and Sell / Short action buttons.
- **Accent Turquoise** (`{colors.accent-turquoise}` — `#2dbdb6`): Specialized secondary accent reserved for Smart Money features.
- **Focus & Feedback**: `{colors.info}` (`#3b82f6`) with `{colors.info-ring}` (`#3b82f6`) for accessible focus rings.

---

## Typography

### Typographic Principles

1. **Dual Type Stack Architecture**:
   - **Editorial & UI Voice**: Powered by **Haas Grotesk** (Airtable) or **BinanceNova** (Binance). When custom licenses are absent, **Inter** serves as the universal drop-in replacement.
   - **Tabular & Financial Voice**: Powered by **BinancePlex** (or **Inter Display** for pricing). When absent, **IBM Plex Sans** or **JetBrains Mono** serves as the substitute.
2. **Weight Allocation Rule**:
   - Editorial headlines use **400 to 500** weight — letting large scale and generous spacing convey authority without visual aggression.
   - Financial headlines and stat numbers use **600 to 700** weight — ensuring critical figures and price claims remain instantly readable amidst data charts.
3. **Strict Number Discipline**: Any number conveying currency, percentage, account balance, volume, or tabular pricing MUST render in the tabular font stack (`BinancePlex` or `Inter Display`), never in humanist running-text type.

---

### Master Typographic Scale

| Token | Size | Weight | Line Ht | Spacing | Stack / Dialect | Primary Application |
|---|---|---|---|---|---|---|
| `{typography.hero-display}` | 64px | 700 | 1.1 | -1.0px | BinanceNova | Homepage primary hero headline ("316M USERS") |
| `{typography.display-xl}` | 48px | 500 | 1.1 | 0.0px | Haas Groot Disp | Airtable longform editorial h1 / articles headline |
| `{typography.binance-display-lg}` | 48px | 700 | 1.1 | -0.5px | BinanceNova | Financial claims ("FUNDS ARE SAFU"), arena hero |
| `{typography.pricing-display}` | 44.8px | 475 | 1.1 | 0.0px | Inter Display | Commercial pricing tier numerical rates ($20/mo) |
| `{typography.display-lg}` | 40px | 400 | 1.2 | 0.0px | Haas Groot Disp | Airtable homepage hero display headline |
| `{typography.binance-display-md}`| 40px | 600 | 1.15 | -0.3px | BinanceNova | Financial sub-section section headlines |
| `{typography.number-display}` | 40px | 700 | 1.1 | -0.3px | BinancePlex | High-impact stat counters ($429M, 15,000 BTC) |
| `{typography.display-md}` | 32px | 400 | 1.2 | 0.0px | Haas Groot Disp | Feature-section headlines, signature card h2 |
| `{typography.binance-display-sm}`| 32px | 600 | 1.2 | 0.0px | BinanceNova | Financial CTA band headers ("Secure Low-Fee") |
| `{typography.pricing-section}` | 28px | 475 | 1.2 | 0.0px | Inter Display | Pricing table category section headers |
| `{typography.title-lg}` | 24px | 400 | 1.35 | +0.12px | Haas | Editorial section titles, tabbed feature cards |
| `{typography.binance-title-lg}` | 24px | 600 | 1.3 | 0.0px | BinanceNova | Financial sub-section headers |
| `{typography.title-md}` | 20px | 400 | 1.5 | 0.0px | Haas Groot Disp | Tab titles, cream callout headings |
| `{typography.binance-title-md}` | 20px | 600 | 1.35 | 0.0px | BinanceNova | QR promotion cards, feature card headings |
| `{typography.pricing-card-title}`| 20px | 475 | 1.3 | 0.0px | Inter Display | Plan tier names ("Team", "Enterprise") |
| `{typography.title-sm}` | 18px | 500 | 1.4 | 0.0px | Haas | Article card headlines, blog story headers |
| `{typography.binance-title-sm}` | 16px | 600 | 1.4 | 0.0px | BinanceNova | Trust badge labels, FAQ questions, step titles |
| `{typography.label-md}` | 16px | 500 | 1.4 | 0.0px | Haas | Demo grid card headers, list titles |
| `{typography.number-md}` | 16px | 500 | 1.4 | 0.0px | BinancePlex | Markets table prices, asset row valuations |
| `{typography.button}` | 16px | 500 | 1.4 | 0.0px | Haas / Unified | Airtable standard primary/secondary button copy |
| `{typography.button-binance}` | 14px | 600 | 1.0 | 0.0px | BinanceNova | Binance standard button copy & CTA labels |
| `{typography.nav-link}` | 14px | 500 | 1.4 | 0.0px | BinanceNova | Top navigation horizontal menu items |
| `{typography.number-sm}` | 14px | 500 | 1.4 | 0.0px | BinancePlex | Inline price tickers, +/- percentage change tags |
| `{typography.body-md}` | 14px | 400 | 1.5 | 0.0px | Unified / Shared | Universal running copy, body paragraphs |
| `{typography.caption}` | 14px | 500 | 1.35 | +0.16px | Haas / Unified | Metadata lines, author tags, captions |
| `{typography.body-sm}` | 13px | 400 | 1.5 | 0.0px | BinanceNova | Cookie banner text, footer disclaimers |
| `{typography.legal}` | 13.12px| 600 | 1.2 | 0.0px | Haas | Regulatory buttons, legal notice controls |

---

## Layout & Spatial System

### Universal 4px Spacing Scale

Both systems build upon an identical 4px spacing rhythm:

| Token | Dimension | System Application |
|---|---|---|
| `{spacing.xxs}` | 4px | Micro-spacing, inline icon offsets, badge padding. |
| `{spacing.xs}` | 8px | Button vertical padding (dense), chip margins, table row gaps. |
| `{spacing.sm}` | 12px | Input vertical padding, list item gaps, compact gutters. |
| `{spacing.md}` | 16px | Standard card padding (compact), input horizontal padding, logo gaps. |
| `{spacing.lg}` | 24px | Standard card internal padding, 3-up grid gutters, modal padding. |
| `{spacing.xl}` | 32px | Feature card padding, QR card padding, tier card padding. |
| `{spacing.xxl}` | 48px | Large signature card padding, CTA band padding, container margins. |

### Section Rhythms: Cadence by Dialect

The spacing between major page sections defines the emotional tempo of each dialect:
- **Editorial Cadence** (`{spacing.section-airtable}` — `96px`): Universal vertical padding (top and bottom) for editorial sections, providing print-like visual serenity.
- **Financial Cadence** (`{spacing.section-binance}` — `80px`): Denser rhythm suited for high-information density, trading tickers, and data accordions.

### Container & Grid Architecture

- **Max Content Width**:
  - **Marketing & Editorial**: `1280px` max-width, horizontally centered with `{spacing.xxl}` (48px) responsive outer padding.
  - **Financial Data Surfaces**: `1440px` max-width on markets tables, trading terminal interfaces, and position dashboards where horizontal real estate is critical.
- **Grid Structures**:
  - **Editorial Body**: 8/12-column layout collapsing to single-column on mobile.
  - **Multi-Card Grids**: 3 or 4 columns on desktop, 2 on tablet, 1 on mobile. Airtable cards intentionally vary in height to avoid a rigid spec-sheet feel; Binance market cards stay strictly tabular.
  - **Logo Strips**: 6 monochrome partner logos in a single row at desktop, wrapping to 3-up on mobile.

---

## Elevation & Depth

### Flat Elevation Hierarchy

Both systems reject fuzzy blur effects, heavy elevation, and neumorphism. Depth is created through crisp surface transitions:

```
[Layer 0: Page Floor]     --> {colors.canvas-light} (#ffffff) OR {colors.canvas-dark} (#0b0e11)
                                      |
[Layer 1: Hairline Step]  --> 1px {colors.hairline-on-light} OR {colors.hairline-on-dark}
                                      |
[Layer 2: Card Container] --> {colors.surface-card-dark} (#1e2329) OR {colors.surface-soft} (#f8fafc)
                                      |
[Layer 3: Signature Card] --> Full-bleed {colors.signature-coral} / {colors.signature-forest}
                                      |
[Layer 4: Focus State]    --> 2px outer outline in {colors.info-ring} (#3b82f6) at 50% alpha
```

| Level | Treatment | Common Application |
|---|---|---|
| **Flat Floor** | Zero shadow, zero border | Canvas body, editorial hero bands, top navigation bar. |
| **Hairline Boundary**| 1px solid border | Text inputs, table dividers, secondary buttons, FAQ row separators. |
| **Surface Shift** | Distinct background tone, no shadow | All elevated cards (markets tables, tabbed cards, QR cards, trust badges). |
| **Button Glow** | Low-alpha subtle drop tint | Primary CTA active state (faint blue under dark, warm amber under yellow). |
| **Focus Ring** | 2px solid ring, 2px offset | Keyboard accessibility ring across inputs, links, and buttons. |

### Decorative Depth Exceptions
- **Airtable Vertical Rainbow Stripes**: Single-page treatment on the articles hero (`{colors.surface-dark-elevated}`). Multi-colored vertical bands framing white display type.
- **Binance Arena Hero Gradient**: Single-page event treatment (`{component.arena-hero-gradient}`) featuring a vertical fade from `{colors.primary-binance}` to `{colors.canvas-dark}`.

---

## Shapes & Geometry

### Unified Border Radius Scale

| Token | Value | Primary Role in System |
|---|---|---|
| `{rounded.xs}` | 2px | System-required legal and cookie buttons (`{component.button-legal}`). |
| `{rounded.sm}` | 4px | Binance trading buttons (`{component.button-trading-up}` / `down`), subscribe buttons. |
| `{rounded.sm-airtable}`| 6px | Airtable standard text inputs (`{component.text-input}`). |
| `{rounded.md}` | 6px | Binance primary CTA buttons and inputs (`{component.button-primary-binance}`). |
| `{rounded.md-airtable}`| 10px | Airtable content cards, article cards, cream callout cards. |
| `{rounded.lg}` | 8px | Binance search inputs, content cards, trust badges. |
| `{rounded.lg-airtable}`| 12px | Airtable primary CTAs (`{component.button-primary}`), signature cards. |
| `{rounded.xl}` | 12px | Binance elevated cards (`{component.markets-table-card}`, QR promo cards). |
| `{rounded.pill}` | 9999px | Airtable pricing CTA pill buttons; Binance top-of-funnel signup pills. |
| `{rounded.full}` | 9999px / 50% | Circular icon controls, user avatars, crypto coin icons. |

### Geometry Guidelines
- **Product UI Screenshots**: Render in native aspect ratios (4:3 or 16:10) cropped into `{rounded.md-airtable}` containers.
- **Coin Icons & Badges**: 24×24 or 32×32 circular badges (`{rounded.full}`) holding coin symbols.
- **Hero Illustrations**: Bleed full-width without rounding on mobile viewports.

---

## Components Library

### 1. Navigation Components

- **`top-nav`** (Airtable Light): 64px tall white bar (`{colors.canvas}`) pinned to viewport top. Wordmark at left; horizontal menu in `{typography.body-md}`; right-side cluster with "Book Demo" secondary button, "Sign up for free" `{component.button-primary}`, and "Log In" text link. Remains light even over dark page sections.
- **`top-nav-dark`** (Binance Dark): 64px tall dark bar (`{colors.canvas-dark}`). Yellow wordmark at left; navigation menu in `{typography.nav-link}`; right cluster with theme toggle, language picker, and yellow `{component.button-primary-binance}` ("Sign Up").
- **`top-nav-light`** (Binance Light): 64px transactional variant on `{colors.canvas-light}` with `{colors.ink}` menu items for deposit and checkout flows.

---

### 2. Buttons

#### Airtable Suite
- **`button-primary`**: Authoritative near-black CTA. Background `{colors.primary}`, text `{colors.on-primary}` (white), type `{typography.button}`, rounded `{rounded.lg-airtable}` (12px), padding 16px × 24px. Press state: `{colors.primary-active}` (#0d1218).
- **`button-secondary`**: White outline button. Background `{colors.canvas}`, text `{colors.ink}`, 1px `{colors.hairline}` border, rounded `{rounded.lg-airtable}` (12px), padding 16px × 24px.
- **`button-secondary-on-dark`**: Same structure as secondary, but used on signature coral/forest/dark cards. Stays white canvas (`{colors.canvas}`) with ink type — never translucent on-dark.
- **`button-pricing-pill`**: Dedicated pricing button. Background `{colors.canvas}`, text `{colors.pricing-ink}`, rounded `{rounded.pill}` (9999px), padding 12px × 24px.
- **`button-legal`**: System button. Background `{colors.link}`, text `{colors.on-primary}`, type `{typography.legal}` (13.12px / 600), rounded `{rounded.xs}` (2px), padding 12px × 10px.
- **`button-icon-circular`**: 40px × 40px circular button (`{rounded.full}`) with hairline outline and `{colors.ink}` glyph.

#### Binance Suite
- **`button-primary-binance`**: Signature yellow button. Background `{colors.primary-binance}` (#FCD535), text `{colors.on-primary-binance}` (#181a20), type `{typography.button-binance}`, rounded `{rounded.md}` (6px), padding 12px × 24px, height 40px. Press: `{colors.primary-binance-active}` (#f0b90b). Disabled: `{colors.primary-binance-disabled}` (#3a3a1f).
- **`button-primary-pill-binance`**: High-priority signup pill. Same yellow and black combination, rounded `{rounded.pill}` (9999px), padding 14px × 32px.
- **`button-secondary-on-dark-binance`**: Dark elevated button. Background `{colors.surface-card-dark}`, text `{colors.on-dark}`, rounded `{rounded.md}` (6px).
- **`button-secondary-on-light-binance`**: Light surface button. Background `{colors.canvas-light}`, 1px `{colors.hairline-on-light}` border, text `{colors.ink}`.
- **`button-trading-up`**: Buy / Long action. Background `{colors.trading-up}` (#0ecb81), text `{colors.on-dark}`, rounded `{rounded.sm}` (4px), padding 8px × 20px.
- **`button-trading-down`**: Sell / Short action. Background `{colors.trading-down}` (#f6465d), text `{colors.on-dark}`, rounded `{rounded.sm}` (4px), padding 8px × 20px.
- **`button-subscribe`**: Compact table CTA. Background `{colors.primary-binance}`, text `{colors.on-primary-binance}`, height 28px, padding 6px × 16px, rounded `{rounded.sm}` (4px).

#### Shared Links
- **`text-link`**: Inline link in `{colors.link}` (#1b61c9).
- **`text-link-binance`**: Inline link in `{colors.primary-binance}` (#FCD535).
- **`button-tertiary-text`**: Borderless text button in `{colors.body}` for "Log In" or "Read more".

---

### 3. Cards & Containers

#### Airtable Signature Surfaces
- **`signature-coral-card`**: Full-bleed card in `{colors.signature-coral}` (#aa2d00), text `{colors.on-primary}`, rounded `{rounded.lg-airtable}` (12px), padding `{spacing.xxl}` (48px). Houses `{typography.display-md}` headline and `{component.button-secondary-on-dark}`.
- **`signature-forest-card`**: Deep green card in `{colors.signature-forest}` (#0a2e0e), text `{colors.on-primary}`, rounded `{rounded.lg-airtable}`, padding 48px.
- **`hero-card-dark`**: Dark navy mid-page callout in `{colors.surface-dark}` (#181d26), rounded `{rounded.lg-airtable}`, padding 48px.
- **`cream-callout-card`**: Beige band in `{colors.signature-cream}` (#f5e9d4), text `{colors.ink}`, rounded `{rounded.md-airtable}` (10px), padding `{spacing.lg}` (24px).
- **`feature-card-tabbed`**: Card in `{colors.surface-soft}` (#f8fafc), rounded `{rounded.lg-airtable}` (12px), padding 32px. Left tab rail in `{typography.title-md}`; right pane shows active tab graphic and copy.
- **`demo-grid-card`**: Product screenshot container. Background `{colors.canvas}` or pastel tones (`{colors.signature-peach}`, `{colors.signature-mint}`), rounded `{rounded.md-airtable}` (10px), padding 16px.
- **`article-card`**: Story card on `{colors.canvas}`, rounded `{rounded.md-airtable}`, padding 16px. 16:9 thumbnail + `{typography.title-sm}` header.
- **`cta-band-light`**: Light gray pre-footer CTA band in `{colors.surface-strong}` (#e0e2e6), rounded `{rounded.lg-airtable}`, padding 48px.

#### Binance Financial Cards
- **`stat-callout-card`**: Flat counter block with transparent background and text in `{colors.primary-binance}` using `{typography.number-display}`.
- **`trust-badge`**: Dark badge in `{colors.surface-card-dark}`, rounded `{rounded.lg}` (8px), padding 16px × 20px. Yellow badge icon ("No.1") paired with `{typography.binance-title-sm}`.
- **`markets-table-card`**: Right-rail markets card in `{colors.surface-card-dark}`, rounded `{rounded.xl}` (12px), padding `{spacing.lg}` (24px). Houses tabbed coin pairs.
- **`markets-row`**: Table row inside markets card. 12px vertical padding, 1px `{colors.hairline-on-dark}` bottom divider. Left: coin icon + symbol; center: `{typography.number-md}` price; right: `{component.price-up-cell}` or `{component.price-down-cell}`.
- **`price-up-cell` / `price-down-cell`**: Directional text cell in `{colors.trading-up}` or `{colors.trading-down}` using `{typography.number-md}` in BinancePlex.
- **`qr-promo-card`**: App download card in `{colors.surface-card-dark}`, rounded `{rounded.xl}`, padding 32px. Displays store badges and QR code.
- **`funds-safu-band`**: Reserve security band in `{colors.canvas-dark}` with headline in `{colors.primary-binance}` and three `{component.stat-callout-card}` metrics.
- **`cta-band-dark`**: Dark CTA band in `{colors.surface-card-dark}`, rounded `{rounded.xl}`, padding 48px, holding `{typography.binance-display-sm}` and a yellow button.

---

### 4. Inputs & Forms

- **`text-input`** (Airtable Standard): Background `{colors.canvas}`, text `{colors.ink}`, 1px `{colors.hairline}` border, rounded `{rounded.sm-airtable}` (6px), padding 12px × 16px, height 44px.
- **`text-input-focus`**: Focus state with outline recolored to `{colors.info-border}`.
- **`text-input-on-light`** (Binance Light): Background `{colors.canvas-light}`, 1px `{colors.hairline-on-light}` border, rounded `{rounded.md}` (6px), padding 10px × 16px, height 40px.
- **`search-input-on-dark`** (Binance Dark): Dark search bar in `{colors.surface-card-dark}`, text `{colors.on-dark}`, rounded `{rounded.lg}` (8px), height 40px. Right side embeds `{component.button-primary-pill-binance}` ("Sign Up").
- **`cookie-consent-card`**: Floating white card (`{colors.canvas-light}`), rounded `{rounded.lg}` (8px), padding 16px, holding `{typography.body-sm}` and stacked decision buttons.

---

### 5. Specialized Sub-Systems

#### Airtable Pricing Sub-System
- **`pricing-tier-card`**: Standard plan card on `{colors.canvas}`, text `{colors.pricing-ink}`, rounded `{rounded.md-airtable}` (10px), padding 32px. Carries plan name in `{typography.pricing-card-title}`, rate in `{typography.pricing-display}` (44.8px / 475), feature checklist, and bottom `{component.button-pricing-pill}`.
- **`pricing-tier-card-featured`**: Featured tier card. Surface shifts to `{colors.surface-soft}` (#f8fafc) — no garish borders or ribbon badges.
- **`pricing-comparison-row`**: Row in the comprehensive plan matrix. 12px vertical padding, 1px `{colors.hairline}` divider.

#### Binance Trading & Smart Money Sub-System
- **`buy-crypto-amount-card`**: Transactional card on `{colors.canvas-light}`, rounded `{rounded.lg}`, padding 24px. Features editable amount in `{typography.number-display}` (BinancePlex), currency dropdown, and yellow `{component.button-primary-binance}`.
- **`price-chart-card`**: Trading chart card on `{colors.canvas-light}`, rounded `{rounded.lg}`, framing live candlestick line charts and 24H/1W/1M timeframe filters.
- **`trader-row`**: Copy-trading table row on `/smart-money`. Features trader avatar, ROI %, AUM metrics, and a yellow `{component.button-subscribe}`.

---

### 6. Footers

- **`footer`** (Airtable Editorial): Pure white canvas (`{colors.canvas}`), 6-column links in `{typography.body-md}`, 64px vertical padding.
- **`footer-light`** (Binance Inverted Dark Page Close): Light surface (`{colors.surface-soft-light}` #fafafa) positioned directly under dark canvas sections. 6 columns of links, 64px padding. Deliberately terminates dark pages with a clean marketing reset.

---

## Do's and Don'ts

### Universal System Rules

#### Do
- Strictly snap all spacing, padding, heights, and margins to the **4px base scale**.
- Anchor viewports with **exactly one primary CTA** (`{component.button-primary}` or `{component.button-primary-binance}`) to preserve action clarity.
- Render numbers and financial values in dedicated tabular stacks (`BinancePlex` or `Inter Display`) rather than humanist running type.
- Maintain flat color-block depth. Let contrast between canvas and surface cards establish elevation.
- Preserve 40px–48px touch target heights across all interactive controls.

#### Don't
- Don't add decorative drop shadows, glassmorphism, or atmospheric blur effects.
- Don't document hover-only styles; build robust Default and Active/Pressed states.
- Don't mix random primary colors. Use near-black for editorial CTAs and electric yellow for financial CTAs.
- Don't use small colored icons or border accents where full-bleed signature cards are required.

---

### Dialect A (Airtable Editorial) Specifics

#### Do
- Keep the hero floor pure white (`{colors.canvas}`). Let generous whitespace frame the message.
- Pair `{component.button-primary}` with `{component.button-secondary}` (white with hairline outline) to form Airtable's signature dual-action pair.
- Punctuate long scroll journeys with `{component.signature-coral-card}` and `{component.signature-forest-card}` every 2 to 3 screens.
- Keep editorial display headlines at weight 400 or 500.
- Restrict `{rounded.pill}` strictly to the Pricing Sub-System.

#### Don't
- Don't mistake the link color (`{colors.link}` #1b61c9) for the primary button color. The primary CTA is near-black.
- Don't add gradients, mesh backdrops, or spotlight glows behind hero headlines.
- Don't bold display type to 700. Scale conveys authority, not weight.
- Don't repeat identical surface colors across consecutive sections. Maintain alternating cadence: White -> Signature -> White -> Soft -> Footer.

---

### Dialect B (Binance Financial) Specifics

#### Do
- Reserve Binance Yellow (`{colors.primary-binance}`) strictly for focal CTAs, stat highlights, and brand claims.
- Render primary yellow buttons with jet-black text (`{colors.on-primary-binance}` #181a20).
- Restrict `{colors.trading-up}` (green) and `{colors.trading-down}` (red) to directional price signals and dedicated buy/sell triggers.
- Use `{colors.surface-soft-light}` to close dark marketing pages with a grounding light footer.
- Default marketing pages to dark mode; switch transactional dialogs to light mode.

#### Don't
- Don't use yellow as a general background fill for cards or body sections.
- Don't use trading green or red as general success/error notifications or card backgrounds.
- Don't invert yellow button text to white. Black on yellow is the non-negotiable brand signature.
- Don't soften financial display headlines to weight 400. Financial type requires 600–700 weight for high-speed scanning.

---

## Responsive Behavior

### Breakpoints Matrix

| Breakpoint | Viewport Range | Key Architectural Adjustments |
|---|---|---|
| **Mobile** | `< 768px` | Single-column body layout; top-nav collapses to full-screen drawer; demo grids drop to 1-up; signature cards remain full-bleed; markets table converts to horizontally scrollable card stream; footer collapses to stacked 2-column or 1-column list. |
| **Tablet** | `768px – 1024px` | 2-up card grids; top nav remains horizontal with secondary items collapsed under "More"; markets table renders 2-up; pricing comparison matrix becomes horizontally scrollable with sticky plan headers. |
| **Desktop** | `1024px – 1440px` | Full horizontal navigation with all top-level categories visible; 3-up demo grids; 5-column markets table; 4-column pricing tier cards; 8/4 split on trading dashboards. |
| **Wide** | `> 1440px` | Max content width locks at `1280px` (editorial) or `1440px` (financial data). Layout adds balanced outer margin rather than disproportionately inflating font sizes. |

### Touch Ergonomics & Collapsing Rules
- **Primary CTAs**: Guaranteed `48px × 48px` minimum effective hit box (including padding and line height).
- **Secondary & Table CTAs**: Compact table actions (e.g. `{component.button-subscribe}`) sit at 28px height within a 44px tappable row container.
- **Accordion Rows**: FAQ rows feature 20px vertical padding, ensuring the full row serves as a 44px+ hit area.
- **Stat Claim Conservation**: Big hero numbers ("316M USERS", "10× EVERY PERSON") scale down font size smoothly on mobile rather than breaking across multiple lines.

---

## Iteration Guide & Linting Protocol

When extending or building with this design system, follow this sequence:

1. **Dialect Selection**:
   - Building a calm editorial marketing page, CMS interface, or documentation hub? -> **Adopt Dialect A (Airtable)**.
   - Building a high-velocity dashboard, financial transaction flow, or crypto tool? -> **Adopt Dialect B (Binance)**.
   - Building a hybrid product? -> Use Dialect A for marketing explainer surfaces, flipping to Dialect B for account, wallet, and trading modules.
2. **Component Token Referencing**:
   - Always reference design tokens directly via `{token.refs}` (e.g., `{colors.primary-binance}`, `{typography.display-md}`, `{spacing.section-airtable}`, `{rounded.lg-airtable}`).
   - Never hardcode raw hex codes or ad-hoc pixel values into component specifications.
3. **State Separation**:
   - Never nest states inside a component definition. Represent states as explicit sibling tokens in the frontmatter (e.g. `button-primary`, `button-primary-active`, `button-primary-disabled`).
   - Strictly omit hover states; build Default and Active/Pressed states only.
4. **Validation**:
   - Validate YAML frontmatter integrity and verify all token references resolve against declared keys.
   - Run design linter to ensure zero broken token references or contrast violations.
5. **Mandatory README.md Documentation for Every Change**:
   - Any time modifications, new features, token updates, refactorings, or bug fixes are applied anywhere across the web application, they **must be documented and explained in [README.md](file:///Users/dheerajcarpenter/Coding%20Projects/The%20Buissness%20Folder/aestheticcardgenerator/README.md)**.
   - Maintain the Changelog and Architectural Decision Log in `README.md` with timestamps, description of changes, files affected, and user-facing impact to maintain an exemplary GitHub repository.

---

## Known Gaps & System Synthesis Notes

- **Hover States**: Excluded per global no-hover policy; all interactions rely on explicit default and active states.
- **Animation Choreography**: Micro-interaction timings, candlestick chart refresh flashes, and drawer transitions are implementation-specific and outside the scope of static design tokens.
- **Form Error States**: Extracted specs cover default and focus states (`text-input-focus`); comprehensive invalid/error field tokens should be formalized prior to complex form deployment.
- **CSS Variable Names vs Real Roles**: Note that Airtable's legacy CSS variable `--theme_button-background-primary` references blue `#1b61c9`, but production marketing uses near-black `#181d26` for primary CTAs. This merged system correctly maps `#181d26` to `{colors.primary-airtable}` and `#1b61c9` to `{colors.link}`.
- **Frequency vs Brand Voltage**: In Binance, light hairline `#eaecef` accounts for over 1,000 CSS occurrences, while brand yellow `#FCD535` appears fewer than 50 times. Yellow derives its power from scarcity.
