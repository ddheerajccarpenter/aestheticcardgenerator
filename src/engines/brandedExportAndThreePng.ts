// src/engines/brandedExportAndThreePng.ts
import * as THREE from 'three';

export type ExportFormat = 'png' | 'webp' | 'svg' | '3d-png';
export type ExportTier = '4K' | '8K' | '12K' | '16K';

/**
 * MANDATORY FILENAME RULE (Part VI & Part IX.1):
 * Always names downloaded files after the website: "aestheticcardgenerator.com.png"
 * (or with optional tier suffix if requested, never random template slugs).
 */
export function getBrandedExportFilename(
  ext: 'png' | 'webp' | 'svg' = 'png',
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
    powerPreference: 'high-performance',
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
  cardTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
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

  renderer.dispose();
  offscreenContainer.remove();
  triggerBrandedBlobDownload(blob, getBrandedExportFilename('png', '3d'));
}
