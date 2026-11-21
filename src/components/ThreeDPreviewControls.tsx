import { RotateCcw, ZoomIn, ZoomOut, X, Box } from 'lucide-react';
import type { ThreeCardPreviewController } from '../engines/threeCardStage';

interface ThreeDPreviewControlsProps {
  controllerRef: { current: ThreeCardPreviewController | null };
  onExit?: () => void;
}

export function ThreeDPreviewControls({ controllerRef, onExit }: ThreeDPreviewControlsProps) {
  const buttonClass =
    'grid h-8 w-8 place-items-center rounded-lg text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)] cursor-pointer';

  return (
    <>
      {/* Top Left: 3D Stage Status Badge */}
      <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-[var(--app-border-subtle)] bg-[var(--app-surface)]/90 backdrop-blur-md px-3 py-1 shadow-md text-xs font-semibold text-[var(--app-text-primary)] select-none">
        <Box className="w-3.5 h-3.5 text-[var(--app-accent)] animate-pulse" />
        <span>3D Stage</span>
        <span className="text-[10px] text-[var(--app-text-muted)] font-normal hidden sm:inline">• Drag to rotate</span>
      </div>

      {/* Top Right: Zoom & Reset Controls + Exit 3D Button */}
      <div
        aria-label="3D preview controls"
        className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface)]/95 backdrop-blur-md p-1 shadow-xl"
        role="toolbar"
      >
        <button
          aria-label="Zoom out"
          className={buttonClass}
          onClick={() => controllerRef.current?.zoomOut()}
          title="Zoom out"
          type="button"
        >
          <ZoomOut aria-hidden="true" className="h-4 w-4" />
        </button>
        <button
          aria-label="Zoom in"
          className={buttonClass}
          onClick={() => controllerRef.current?.zoomIn()}
          title="Zoom in"
          type="button"
        >
          <ZoomIn aria-hidden="true" className="h-4 w-4" />
        </button>
        <button
          aria-label="Reset 3D view"
          className={buttonClass}
          onClick={() => controllerRef.current?.resetView()}
          title="Reset 3D angle"
          type="button"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
        </button>

        {onExit && (
          <>
            <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-[var(--app-border-subtle)]" />
            <button
              onClick={onExit}
              className="flex items-center gap-1 h-8 px-2.5 rounded-lg bg-[var(--app-accent)]/15 text-[var(--app-accent)] hover:bg-[var(--app-accent)]/25 text-xs font-bold transition-colors cursor-pointer"
              title="Exit 3D mode"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit 3D</span>
            </button>
          </>
        )}
      </div>
    </>
  );
}
