---
name: Art-Directed Studio
colors:
  surface: '#111417'
  surface-dim: '#111417'
  surface-bright: '#37393d'
  surface-container-lowest: '#0b0e11'
  surface-container-low: '#191c1f'
  surface-container: '#1d2023'
  surface-container-high: '#272a2e'
  surface-container-highest: '#323538'
  on-surface: '#e1e2e7'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e1e2e7'
  inverse-on-surface: '#2e3134'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#f5cf2e'
  on-secondary: '#3b2f00'
  secondary-container: '#d7b300'
  on-secondary-container: '#564600'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636565'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#ffe176'
  secondary-fixed-dim: '#e9c320'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#554500'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#111417'
  on-background: '#e1e2e7'
  surface-variant: '#323538'
  canvas: '#0b0e11'
  canvas-light: '#f9fafb'
  surface-soft: '#14171d'
  surface-soft-light: '#ffffff'
  surface-card: '#181d24'
  surface-card-light: '#f3f4f6'
  surface-elevated: '#222730'
  surface-elevated-light: '#ffffff'
  hairline: '#262c36'
  hairline-light: '#e5e7eb'
  border-subtle: '#1f242c'
  border-focus: '#3b82f6'
  ink: '#ffffff'
  ink-light: '#111827'
  body: '#9ca3af'
  body-light: '#4b5563'
  muted: '#6b7280'
  muted-light: '#9ca3af'
  accent: '#fcd535'
  accent-soft: '#2a2818'
  tag-highlight: '#e0e7ff'
  card-editorial-bg: '#f4ede4'
  card-editorial-ink: '#2c2825'
  card-minimal-bg: '#18191c'
  card-minimal-ink: '#f5f5f7'
  card-pastel-bg: '#e2ecf9'
  card-pastel-ink: '#1e293b'
  card-retro-bg: '#fce7cf'
  card-retro-ink: '#451a03'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 62px
    letterSpacing: -1.2px
  display-xl-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 42px
    letterSpacing: -0.8px
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 46px
    letterSpacing: -0.8px
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.4px
  display-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.5px
  title-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 31px
    letterSpacing: -0.2px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 25px
    letterSpacing: 0px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.2px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-xxl: 3rem
  space-section: 5.5rem
---

---
version: alpha
name: Aesthetic-Card-Generator-Design-System
description: Design system for Aesthetic Card Generator — an art-directed, client-side text-to-card tool. Features a dark-first aesthetic matching the reference's restrained, elegant atmosphere alongside a unified light mode. Strictly follows 4px spatial scale, flat color-block depth, restrained typography, and accessible touch ergonomics.

colors:
  # Base Canvas & Surfaces
  canvas: "#0b0e11"
  canvas-light: "#f9fafb"
  canvas-dark: "#0b0e11"
  surface-soft: "#14171d"
  surface-soft-light: "#ffffff"
  surface-card: "#181d24"
  surface-card-light: "#f3f4f6"
  surface-elevated: "#222730"
  surface-elevated-light: "#ffffff"
  
  # Hairlines and Borders
  hairline: "#262c36"
  hairline-light: "#e5e7eb"
  border-subtle: "#1f242c"
  border-focus: "#3b82f6"

  # Typography Colors
  ink: "#ffffff"
  ink-light: "#111827"
  body: "#9ca3af"
  body-light: "#4b5563"
  muted: "#6b7280"
  muted-light: "#9ca3af"
  
  # Brand & Actions
  primary: "#ffffff"
  primary-light: "#111827"
  on-primary: "#0b0e11"
  on-primary-light: "#ffffff"
  accent: "#fcd535"
  accent-soft: "#2a2818"
  tag-highlight: "#e0e7ff"
  
  # Card Palette Accents
  card-editorial-bg: "#f4ede4"
  card-editorial-ink: "#2c2825"
  card-minimal-bg: "#18191c"
  card-minimal-ink: "#f5f5f7"
  card-pastel-bg: "#e2ecf9"
  card-pastel-ink: "#1e293b"
  card-retro-bg: "#fce7cf"
  card-retro-ink: "#451a03"

typography:
  display-xl:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -1.2px
  display-lg:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.8px
  display-md:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.5px
  title-lg:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.2px
  title-md:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0

rounded:
  xs: 3px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 88px
