import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

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
  return { roughness: 0.86, metalness: 0.0, clearcoat: 0.0, clearcoatRoughness: 0.9, iridescence: 0.0 };
}

export type ThreeCardPreviewController = (() => void) & {
  updateTexture: (newCanvas: HTMLCanvasElement, newSurfaceId?: string) => void;
  requestRender: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
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
  const maxAspect = Math.max(aspectRatioWidth, aspectRatioHeight) || 1;
  const cardWidth = 1.8 * (aspectRatioWidth / maxAspect);
  const cardHeight = 1.8 * (aspectRatioHeight / maxAspect);
  const cardDepth = 0.045;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
    stencil: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D card preview. Drag to rotate, scroll or pinch to zoom.');
  mountEl.replaceChildren(renderer.domElement);

  const cardTexture = new THREE.CanvasTexture(sourceCardCanvas);
  cardTexture.colorSpace = THREE.SRGBColorSpace;
  cardTexture.minFilter = THREE.LinearMipmapLinearFilter;
  cardTexture.magFilter = THREE.LinearFilter;
  cardTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  cardTexture.needsUpdate = true;

  const geometry = new RoundedBoxGeometry(
    cardWidth,
    cardHeight,
    cardDepth,
    3,
    Math.min(cardDepth / 2, Math.min(cardWidth, cardHeight) * 0.018)
  );
  const frontMaterial = new THREE.MeshPhysicalMaterial({
    map: cardTexture,
    ...getThreeMaterialForSurface(surfaceId),
    toneMapped: false,
  });
  const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0xe5ded2, roughness: 0.72 });
  const card = new THREE.Mesh(geometry, [edgeMaterial, edgeMaterial, edgeMaterial, edgeMaterial, frontMaterial, edgeMaterial]);
  scene.add(card);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
  const keyLight = new THREE.DirectionalLight(0xfff6e9, 1.8);
  keyLight.position.set(2.5, 3.2, 4);
  const fillLight = new THREE.DirectionalLight(0xe3ddd3, 0.7);
  fillLight.position.set(-3, -2, 2);
  scene.add(ambientLight, keyLight, fillLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.enablePan = false;
  controls.zoomSpeed = 0.85;
  controls.minPolarAngle = 0.18;
  controls.maxPolarAngle = Math.PI - 0.18;
  controls.cursorStyle = 'grab';

  const getFitDistance = () => {
    const verticalFov = THREE.MathUtils.degToRad(camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
    const limitingFov = Math.min(verticalFov, horizontalFov);
    const cardRadius = Math.hypot(cardWidth, cardHeight, cardDepth) / 2;
    return cardRadius / Math.sin(limitingFov / 2) * 1.12;
  };

  let baseDistance = getFitDistance();
  camera.position.set(0, 0, baseDistance);
  controls.minDistance = baseDistance * 0.48;
  controls.maxDistance = baseDistance * 2.5;
  controls.update();

  let isVisible = !document.hidden;
  let isLoopRunning = false;
  let animId = 0;

  const renderFrame = () => renderer.render(scene, camera);

  const tick = () => {
    if (!isVisible) {
      isLoopRunning = false;
      animId = 0;
      return;
    }

    const isMoving = controls.update();
    renderFrame();
    if (isMoving) {
      animId = requestAnimationFrame(tick);
    } else {
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

  const resize = () => {
    const nextWidth = mountEl.clientWidth;
    const nextHeight = mountEl.clientHeight;
    if (!nextWidth || !nextHeight) return;

    const zoomRatio = controls.getDistance() / baseDistance;
    const viewDirection = camera.position.clone().sub(controls.target).normalize();
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    baseDistance = getFitDistance();
    controls.minDistance = baseDistance * 0.48;
    controls.maxDistance = baseDistance * 2.5;
    camera.position.copy(controls.target).addScaledVector(viewDirection, baseDistance * zoomRatio);
    renderer.setSize(nextWidth, nextHeight, false);
    controls.update();
    wakeRenderLoop();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mountEl);
  window.addEventListener('resize', resize);
  controls.addEventListener('change', wakeRenderLoop);

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
    isVisible = !document.hidden;
    if (isVisible) {
      wakeRenderLoop();
    } else if (animId) {
      cancelAnimationFrame(animId);
      animId = 0;
      isLoopRunning = false;
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  const updateTexture = (newCanvas: HTMLCanvasElement, newSurfaceId?: string) => {
    cardTexture.image = newCanvas;
    cardTexture.needsUpdate = true;
    if (newSurfaceId) {
      Object.assign(frontMaterial, getThreeMaterialForSurface(newSurfaceId));
      frontMaterial.needsUpdate = true;
    }
    wakeRenderLoop();
  };

  const zoomCamera = (distanceScale: number) => {
    const offset = camera.position.clone().sub(controls.target);
    const distance = THREE.MathUtils.clamp(
      offset.length() * distanceScale,
      controls.minDistance,
      controls.maxDistance
    );
    camera.position.copy(controls.target).addScaledVector(offset.normalize(), distance);
    controls.update();
    wakeRenderLoop();
  };

  const zoomIn = () => zoomCamera(1 / 1.18);
  const zoomOut = () => zoomCamera(1.18);

  const resetView = () => {
    controls.target.set(0, 0, 0);
    camera.position.set(0, 0, baseDistance);
    camera.up.set(0, 1, 0);
    controls.update();
    wakeRenderLoop();
  };

  renderFrame();

  const cleanup: ThreeCardPreviewController = Object.assign(
    () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      controls.removeEventListener('change', wakeRenderLoop);
      controls.dispose();
      if (animId) cancelAnimationFrame(animId);
      geometry.dispose();
      frontMaterial.dispose();
      edgeMaterial.dispose();
      cardTexture.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      renderer.domElement.remove();
    },
    { updateTexture, requestRender: wakeRenderLoop, zoomIn, zoomOut, resetView }
  );

  return cleanup;
}
