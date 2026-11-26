// src/engines/brandedExportAndThreePng.ts
import * as THREE from 'three';
import type { StoredCustomFont } from '../services/customFontManager';

export type ExportFormat = 'png' | 'webp' | 'svg' | '3d-png';
export type ExportTier = '4K' | '8K' | '12K' | '16K';

const fontDataUrlCache = new Map<string, string>();

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function fetchFontAsDataUri(url: string): Promise<string | null> {
  if (url.startsWith('data:')) return url;
  const cached = fontDataUrlCache.get(url);
  if (cached) return cached;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type')?.split(';')[0]?.trim();
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
    const mime =
      contentType ||
      (ext === 'woff2' ? 'font/woff2' : ext === 'woff' ? 'font/woff' : ext === 'otf' ? 'font/otf' : 'font/ttf');
    const dataUri = `data:${mime};base64,${arrayBufferToBase64(buffer)}`;
    fontDataUrlCache.set(url, dataUri);
    return dataUri;
  } catch {
    return null;
  }
}

function normalizeFontFamilyName(raw: string): string {
  return raw.replace(/['"]/g, '').trim().toLowerCase();
}

function extractCssFamilyName(cssText: string): string {
  const m = cssText.match(/font-family:\s*([^;]+)/i);
  return m ? normalizeFontFamilyName(m[1]) : '';
}

async function inlineCssFontUrls(cssText: string, baseHref?: string): Promise<string> {
  const matches = Array.from(cssText.matchAll(/url\((['"]?)([^)'"]+)\1\)/g));
  let output = cssText;
  for (const match of matches) {
    const rawUrl = match[2];
    if (!rawUrl || rawUrl.startsWith('data:')) continue;
    let resolvedUrl = rawUrl;
    try {
      resolvedUrl = new URL(rawUrl, baseHref || window.location.href).href;
    } catch {
      continue;
    }
    const dataUri = await fetchFontAsDataUri(resolvedUrl);
    if (dataUri) {
      output = output.replace(match[0], `url("${dataUri}")`);
    }
  }
  return output;
}

/**
 * Safely collects @font-face CSS from accessible stylesheets + IndexedDB custom fonts
 * without failing when third-party CDN stylesheets restrict CSSOM access or offline mode blocks fetches.
 */
export async function buildSafeFontEmbedCSS(
  customFonts: StoredCustomFont[] = [],
  preferredFamilies?: Iterable<string>
): Promise<string> {
  if (typeof document === 'undefined') return '';
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const familyFilter = preferredFamilies
    ? new Set(
        Array.from(preferredFamilies)
          .flatMap((entry) => entry.split(','))
          .map(normalizeFontFamilyName)
          .filter(Boolean)
      )
    : null;

  const fontFaceBlocks: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    const baseHref = sheet.href || undefined;
    try {
      const rules = Array.from(sheet.cssRules || []);
      for (const rule of rules) {
        if (rule.type !== CSSRule.FONT_FACE_RULE) continue;
        const family = extractCssFamilyName(rule.cssText);
        if (familyFilter && family && !familyFilter.has(family) && family !== 'starborn') continue;
        fontFaceBlocks.push(await inlineCssFontUrls(rule.cssText, baseHref));
      }
    } catch {
      if (baseHref && baseHref.startsWith('https://fonts.googleapis.com')) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 1800);
          const resp = await fetch(baseHref, { signal: controller.signal });
          clearTimeout(timer);
          if (resp.ok) {
            const css = await resp.text();
            const blocks = css.match(/@font-face\s*\{[^}]+\}/g) || [];
            for (const block of blocks) {
              const family = extractCssFamilyName(block);
              if (familyFilter && family && !familyFilter.has(family)) continue;
              fontFaceBlocks.push(await inlineCssFontUrls(block, baseHref));
            }
          }
        } catch {
          // Skip external stylesheet if offline or blocked
        }
      }
    }
  }

  for (const font of customFonts) {
    const family = normalizeFontFamilyName(font.familyName);
    if (familyFilter && !familyFilter.has(family)) continue;
    const ext = font.fileName.split('.').pop()?.toLowerCase();
    const mime =
      ext === 'woff2' ? 'font/woff2' : ext === 'woff' ? 'font/woff' : ext === 'otf' ? 'font/otf' : 'font/ttf';
    const dataUri = `data:${mime};base64,${arrayBufferToBase64(font.buffer)}`;
    fontFaceBlocks.push(
      `@font-face { font-family: '${font.familyName}'; src: url("${dataUri}"); font-weight: 100 900; font-style: normal; }`
    );
  }

  return fontFaceBlocks.join('\n');
}

/**
 * MANDATORY FILENAME RULE (Part VI & Part IX.1):
 * Always names downloaded files after the website: "aestheticcardgenerator.com.png"
 * (or with optional tier suffix if requested, never random template slugs).
 */
export function getBrandedExportFilename(
  ext: 'png' | 'jpeg' | 'webp' | 'svg' = 'png',
  mode: '2d' | '3d' = '2d',
  includeTier?: ExportTier
): string {
  if (mode === '3d') {
    return `aestheticcardgenerator.com-3D.${ext}`;
  }
  if (includeTier && includeTier !== '4K') {
    return `aestheticcardgenerator.com-${includeTier}.${ext}`;
  }
  return `aestheticcardgenerator.com.${ext}`;
}

export function triggerBrandedBlobDownload(blob: Blob, filename = 'aestheticcardgenerator.com.png'): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

/**
 * Renders the user's card in Three.js 3D perspective with PBR surface materiality
 * (paper grain, PVC gloss, or holographic foil) and exports a high-res TRANSPARENT PNG.
 */
export async function exportThreeDimensionalCardPNG(
  source2DCanvas: HTMLCanvasElement,
  aspectWidth: number,
  aspectHeight: number,
  surfaceId: string,
  tiltAngles = { rotX: -0.14, rotY: 0.24, rotZ: -0.02 },
  resolutionPx = 3840
): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const offscreenContainer = document.createElement('div');
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'default',
  });

  const aspect = aspectWidth / aspectHeight;
  const outW = aspect >= 1 ? resolutionPx : Math.round(resolutionPx * Math.max(0.8, aspect));
  const outH = aspect >= 1 ? Math.round(resolutionPx / Math.min(1.25, aspect)) : resolutionPx;

  renderer.setSize(outW, outH, false);
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0); // 100% transparent background
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.background = null; // Pure alpha transparency

  const camera = new THREE.PerspectiveCamera(30, outW / outH, 0.1, 100);
  camera.position.set(0, 0, 4.0);

  const cardTex = new THREE.CanvasTexture(source2DCanvas);
  cardTex.colorSpace = THREE.SRGBColorSpace;
  cardTex.generateMipmaps = false;
  cardTex.minFilter = THREE.LinearFilter;
  cardTex.magFilter = THREE.LinearFilter;
  cardTex.anisotropy = Math.min(2, renderer.capabilities.getMaxAnisotropy());
  cardTex.needsUpdate = true;

  const maxDim = Math.max(aspectWidth, aspectHeight);
  const meshW = 1.75 * (aspectWidth / maxDim);
  const meshH = 1.75 * (aspectHeight / maxDim);

  const geom = new THREE.BoxGeometry(meshW, meshH, 0.022);
  const isHolo = surfaceId.includes('holo') || surfaceId.includes('rainbow') || surfaceId.includes('prismatic');
  const isGloss = surfaceId.includes('pvc') || surfaceId.includes('glossy') || surfaceId.includes('lanyard');

  const frontMat = new THREE.MeshPhysicalMaterial({
    map: cardTex,
    roughness: isGloss ? 0.08 : isHolo ? 0.16 : 0.84,
    metalness: isHolo ? 0.35 : 0.02,
    clearcoat: isGloss || isHolo ? 1.0 : 0.0,
    clearcoatRoughness: 0.06,
    iridescence: isHolo ? 1.0 : 0.0,
    iridescenceIOR: 1.35,
  });

  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xf0e9dc, roughness: 0.85 });
  const cardMesh = new THREE.Mesh(geom, [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, edgeMat]);
  cardMesh.rotation.set(tiltAngles.rotX, tiltAngles.rotY, tiltAngles.rotZ);
  scene.add(cardMesh);

  // Studio 3-point lighting for realistic card edge bevels and surface sheen
  scene.add(new THREE.AmbientLight(0xffffff, 1.4));
  const keyLight = new THREE.DirectionalLight(0xfff9ee, 1.9);
  keyLight.position.set(2.8, 3.4, 4.2);
  const fillLight = new THREE.DirectionalLight(0xe5b84b, 0.6);
  fillLight.position.set(-2.8, -1.8, 2.5);
  scene.add(keyLight, fillLight);

  renderer.render(scene, camera);

  const blob = await new Promise<Blob>((resolve, reject) => {
    renderer.domElement.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('3D PNG export failed'))),
      'image/png',
      1.0
    );
  });

  // Thoroughly release all WebGL resources and GPU memory buffers
  geom.dispose();
  frontMat.dispose();
  edgeMat.dispose();
  cardTex.dispose();
  renderer.forceContextLoss();
  renderer.dispose();
  offscreenContainer.remove();
  triggerBrandedBlobDownload(blob, getBrandedExportFilename('png', '3d'));
}
