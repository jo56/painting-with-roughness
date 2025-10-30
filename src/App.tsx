import React from 'react';
import { PaintStudioUI } from './components/PaintStudioUI';
import { useCanvasRendering } from './hooks/useCanvasRendering';
import { usePaintingInteractions } from './hooks/usePaintingInteractions';
import { usePanelInteractions } from './hooks/usePanelInteractions';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';
import { useDirectionalControls } from './hooks/useDirectionalControls';
import { useRecording } from './hooks/useRecording';

/**
 * Main App Component - Refactored with Zustand
 *
 * This component is now dramatically simpler:
 * - No state management (handled by stores)
 * - No prop drilling (components access stores directly)
 * - Clean separation of concerns
 */
export default function ModularSettingsPaintStudio() {
  // Canvas rendering and refs
  const { canvasRef, canvasContainerRef, clearButtonRef } = useCanvasRendering();

  // Painting interactions
  const paintingInteractions = usePaintingInteractions();

  // Panel interactions and refs
  const { panelRef, handleHeaderMouseDown } = usePanelInteractions();

  // Recording
  const recording = useRecording(canvasRef);

  // Keyboard shortcuts (self-contained, access stores directly)
  useGlobalKeyboardShortcuts();
  useDirectionalControls();

  return (
    <PaintStudioUI
      // Refs
      canvasRef={canvasRef}
      canvasContainerRef={canvasContainerRef}
      panelRef={panelRef}
      clearButtonRef={clearButtonRef}

      // Mouse handlers
      handleMouseDown={(e) => paintingInteractions.handleMouseDown(e, canvasRef)}
      handleMouseUp={paintingInteractions.handleMouseUp}
      handleMouseMove={(e) => paintingInteractions.handleMouseMove(e, canvasRef)}
      handleHeaderMouseDown={handleHeaderMouseDown}

      // Recording
      recordingToast={recording.recordingToast}
    />
  );
}
