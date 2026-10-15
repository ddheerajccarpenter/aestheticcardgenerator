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

export type ThreeCardPreviewController = (() => void) & {
  updateTexture: (newCanvas: HTMLCanvasElement, newSurfaceId?: string) => void;
  requestRender: () => void;
};

export function createThreeCardPreviewScene(
  mountEl: HTMLElement,
  sourceCardCanvas: HTMLCanvasElement,
  aspectRatioWidth: number,
  aspectRatioHeight: number,
  surfaceId: string = 'cotton-rag-300gsm'
): ThreeCardPreviewController {
  const width = mountEl.clientWidth || 360;
  const height = mountEl.clientHeight || 360;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  // Use low-power preference to avoid waking discrete GPUs, cap pixel ratio to 1.5
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
    stencil: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  mountEl.innerHTML = '';
  mountEl.appendChild(renderer.domElement);

  // Disable mipmaps to eliminate gl.generateMipmap overhead and memory bandwidth
  const cardTexture = new THREE.CanvasTexture(sourceCardCanvas);
  cardTexture.colorSpace = THREE.SRGBColorSpace;
  cardTexture.generateMipmaps = false;
  cardTexture.minFilter = THREE.LinearFilter;
  cardTexture.magFilter = THREE.LinearFilter;
  cardTexture.anisotropy = Math.min(2, renderer.capabilities.getMaxAnisotropy());
  cardTexture.needsUpdate = true;

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
  let isPointerOver = false;
  let isVisible = true;
  let isLoopRunning = false;
  let animId = 0;

  const renderFrame = () => {
    renderer.render(scene, camera);
  };

  // On-demand physics loop: sleeps at rest (0% GPU when stationary)
  const tick = () => {
    if (!isVisible) {
      isLoopRunning = false;
      animId = 0;
      return;
    }

    const deltaX = targetRotX - cardMesh.rotation.x;
    const deltaY = targetRotY - cardMesh.rotation.y;

    cardMesh.rotation.x += deltaX * 0.12;
    cardMesh.rotation.y += deltaY * 0.12;
    renderFrame();

    const isMoving = Math.abs(deltaX) > 0.0004 || Math.abs(deltaY) > 0.0004;
    if (isMoving || isPointerOver) {
      animId = requestAnimationFrame(tick);
    } else {
      cardMesh.rotation.x = targetRotX;
      cardMesh.rotation.y = targetRotY;
      renderFrame();
      isLoopRunning = false;
      animId = 0;
    }
  };

  const wakeRenderLoop = () => {
    if (!isLoopRunning && isVisible) {
      isLoopRunning = true;
      animId = requestAnimationFrame(tick);
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    isPointerOver = true;
    const rect = mountEl.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetRotY = nx * 0.32;
    targetRotX = -ny * 0.26;
    wakeRenderLoop();
  };

  const onPointerLeave = () => {
    isPointerOver = false;
    targetRotX = 0;
    targetRotY = 0;
    wakeRenderLoop();
  };

  mountEl.addEventListener('pointermove', onPointerMove);
  mountEl.addEventListener('pointerleave', onPointerLeave);

  // Pause rendering when scrolled off-screen or tab is backgrounded
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting && !document.hidden;
    if (isVisible) {
      wakeRenderLoop();
    } else if (animId) {
      cancelAnimationFrame(animId);
      animId = 0;
      isLoopRunning = false;
    }
  }, { threshold: 0.05 });
  observer.observe(mountEl);

  const onVisibilityChange = () => {
    if (document.hidden) {
      isVisible = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
        isLoopRunning = false;
      }
    } else {
      isVisible = true;
      wakeRenderLoop();
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Render initial static frame immediately
  renderFrame();

  const updateTexture = (newCanvas: HTMLCanvasElement, newSurfaceId?: string) => {
    cardTexture.image = newCanvas;
    cardTexture.needsUpdate = true;
    if (newSurfaceId) {
      const updatedProps = getThreeMaterialForSurface(newSurfaceId);
      Object.assign(frontMaterial, updatedProps);
      frontMaterial.needsUpdate = true;
    }
    renderFrame();
  };

  const cleanup: ThreeCardPreviewController = Object.assign(
    () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      mountEl.removeEventListener('pointermove', onPointerMove);
      mountEl.removeEventListener('pointerleave', onPointerLeave);
      if (animId) cancelAnimationFrame(animId);
      geometry.dispose();
      frontMaterial.dispose();
      edgeMaterial.dispose();
      cardTexture.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      mountEl.innerHTML = '';
    },
    {
      updateTexture,
      requestRender: wakeRenderLoop,
    }
  );

  return cleanup;
}
