// src/engines/threeCardStage.ts
import * as THREE from 'three';

export interface ThreeCardMaterialPreset {
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  iridescence: number;
}

export function getThreeMaterialForSurface(surfaceId: string): ThreeCardMaterialPreset {
  const s = surfaceId.toLowerCase();
  if (s.includes('holo') || s.includes('rainbow') || s.includes('prismatic') || s.includes('starburst')) {
    return { roughness: 0.18, metalness: 0.35, clearcoat: 0.9, clearcoatRoughness: 0.1, iridescence: 1.0 };
  }
  if (s.includes('pvc') || s.includes('glossy') || s.includes('lanyard') || s.includes('polycarbonate')) {
    return { roughness: 0.1, metalness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.05, iridescence: 0.15 };
  }
  if (s.includes('titanium') || s.includes('chrome') || s.includes('gold') || s.includes('metal')) {
    return { roughness: 0.25, metalness: 0.82, clearcoat: 0.4, clearcoatRoughness: 0.2, iridescence: 0.0 };
  }
  // Default: Tactile Archival / Nano-Textured Paper
  return { roughness: 0.86, metalness: 0.0, clearcoat: 0.0, clearcoatRoughness: 0.9, iridescence: 0.0 };
}

export function createThreeCardPreviewScene(
  mountEl: HTMLElement,
  sourceCardCanvas: HTMLCanvasElement,
  aspectRatioWidth: number,
  aspectRatioHeight: number,
  surfaceId: string = 'cotton-rag-300gsm'
): () => void {
  const width = mountEl.clientWidth || 360;
  const height = mountEl.clientHeight || 360;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  mountEl.innerHTML = '';
  mountEl.appendChild(renderer.domElement);

  const cardTexture = new THREE.CanvasTexture(sourceCardCanvas);
  cardTexture.colorSpace = THREE.SRGBColorSpace;
  cardTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const maxAspect = Math.max(aspectRatioWidth, aspectRatioHeight) || 1;
  const normW = 1.8 * (aspectRatioWidth / maxAspect);
  const normH = 1.8 * (aspectRatioHeight / maxAspect);

  const geometry = new THREE.BoxGeometry(normW, normH, 0.02);
  const matProps = getThreeMaterialForSurface(surfaceId);

  const frontMaterial = new THREE.MeshPhysicalMaterial({
    map: cardTexture,
    ...matProps,
  });

  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0xeae2d3,
    roughness: 0.9,
  });

  const cardMesh = new THREE.Mesh(geometry, [
    edgeMaterial, // right
    edgeMaterial, // left
    edgeMaterial, // top
    edgeMaterial, // bottom
    frontMaterial, // front face
    edgeMaterial, // back face
  ]);
  scene.add(cardMesh);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
  const keyLight = new THREE.DirectionalLight(0xfff8eb, 1.8);
  keyLight.position.set(2.5, 3.2, 4.0);
  const rimLight = new THREE.DirectionalLight(0xe5b84b, 0.65);
  rimLight.position.set(-3.0, -2.0, 2.0);
  scene.add(ambientLight, keyLight, rimLight);

  let targetRotX = 0;
  let targetRotY = 0;

  const onPointerMove = (e: PointerEvent) => {
    const rect = mountEl.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetRotY = nx * 0.32;
    targetRotX = -ny * 0.26;
  };

  const onPointerLeave = () => {
    targetRotX = 0;
    targetRotY = 0;
  };

  mountEl.addEventListener('pointermove', onPointerMove);
  mountEl.addEventListener('pointerleave', onPointerLeave);

  let animId = 0;
  const animate = () => {
    animId = requestAnimationFrame(animate);
    cardMesh.rotation.x += (targetRotX - cardMesh.rotation.x) * 0.1;
    cardMesh.rotation.y += (targetRotY - cardMesh.rotation.y) * 0.1;
    cardTexture.needsUpdate = true;
    renderer.render(scene, camera);
  };
  animate();

  return () => {
    cancelAnimationFrame(animId);
    mountEl.removeEventListener('pointermove', onPointerMove);
    mountEl.removeEventListener('pointerleave', onPointerLeave);
    geometry.dispose();
    frontMaterial.dispose();
    edgeMaterial.dispose();
    cardTexture.dispose();
    renderer.dispose();
    mountEl.innerHTML = '';
  };
}
