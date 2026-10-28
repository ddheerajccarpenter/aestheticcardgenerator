import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { ThreeCardPreviewController } from '../engines/threeCardStage';

interface ThreeDPreviewControlsProps {
  controllerRef: { current: ThreeCardPreviewController | null };
}

export function ThreeDPreviewControls({ controllerRef }: ThreeDPreviewControlsProps) {
  const buttonClass = 'grid h-9 w-9 place-items-center rounded-lg text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]';

  return (
    <div
      aria-label="3D preview controls"
      className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-1.5 shadow-lg"
      role="toolbar"
    >
      <button aria-label="Zoom out" className={buttonClass} onClick={() => controllerRef.current?.zoomOut()} title="Zoom out" type="button">
        <ZoomOut aria-hidden="true" className="h-4 w-4" />
      </button>
      <button aria-label="Zoom in" className={buttonClass} onClick={() => controllerRef.current?.zoomIn()} title="Zoom in" type="button">
        <ZoomIn aria-hidden="true" className="h-4 w-4" />
      </button>
      <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-[var(--app-border-subtle)]" />
      <button aria-label="Reset 3D view" className={buttonClass} onClick={() => controllerRef.current?.resetView()} title="Reset view" type="button">
        <RotateCcw aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
