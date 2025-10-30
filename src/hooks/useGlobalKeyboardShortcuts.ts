import { useEffect } from 'react';
import type { BrushType } from '../types';

interface GlobalKeyboardShortcutsDeps {
  setBrushSize: (size: number | ((prev: number) => number)) => void;
  setDiagonalThickness: (thickness: number | ((prev: number) => number)) => void;
  setSprayDensity: (density: number | ((prev: number) => number)) => void;
  setTool: (tool: string) => void;
  setBrushType: (type: BrushType) => void;
  setSelectedColor: (color: number) => void;
  toggleAutoSpread: () => void;
  toggleAutoDots: () => void;
  toggleAutoShapes: () => void;
  brushTypeRef: React.RefObject<BrushType>;
  runningRef: React.RefObject<boolean>;
  dotsRunningRef: React.RefObject<boolean>;
  shapesRunningRef: React.RefObject<boolean>;
  autoSpreadEnabledRef: React.RefObject<boolean>;
  autoDotsEnabledRef: React.RefObject<boolean>;
  autoShapesEnabledRef: React.RefObject<boolean>;
  rafRef: React.RefObject<number | null>;
  autoDotsRef: React.RefObject<number | null>;
  autoShapesRef: React.RefObject<number | null>;
  setAutoSpreading: (spreading: boolean) => void;
  setAutoDots: (dots: boolean) => void;
  setAutoShapes: (shapes: boolean) => void;
  runAutoSpread: () => void;
  runAutoDots: () => void;
  runAutoShapes: () => void;
  spreadPatternRef: React.RefObject<any>;
  walkers: React.RefObject<any[]>;
  strobeStateRef: React.RefObject<boolean>;
  ripplesRef: React.RefObject<any[]>;
}

export function useGlobalKeyboardShortcuts(deps: GlobalKeyboardShortcutsDeps): void {
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.isContentEditable) {
        return;
      }

      // Brush Size
      if (e.code === 'Digit9') {
        e.preventDefault();
        deps.setBrushSize(currentSize => Math.max(1, currentSize - 1));
        return;
      }
      if (e.code === 'Digit0') {
        e.preventDefault();
        deps.setBrushSize(currentSize => Math.min(100, currentSize + 1));
        return;
      }

      // Brush-Specific Controls
      if (e.code === 'BracketLeft') {
        e.preventDefault();
        if (deps.brushTypeRef.current === 'diagonal') {
          deps.setDiagonalThickness(d => Math.max(1, d - 1));
        } else if (deps.brushTypeRef.current === 'spray') {
          deps.setSprayDensity(d => Math.max(0.01, parseFloat((d - 0.01).toFixed(2))));
        }
        return;
      }
      if (e.code === 'BracketRight') {
        e.preventDefault();
        if (deps.brushTypeRef.current === 'diagonal') {
          deps.setDiagonalThickness(d => Math.min(100, d + 1));
        } else if (deps.brushTypeRef.current === 'spray') {
          deps.setSprayDensity(d => Math.min(1, parseFloat((d + 0.01).toFixed(2))));
        }
        return;
      }

      // Tool switching
      if (e.code === "KeyE") { e.preventDefault(); deps.setTool('eraser'); return; }
      if (e.code === "KeyF") { e.preventDefault(); deps.setTool('fill'); return; }
      if (e.code === "KeyB") { e.preventDefault(); deps.setTool('brush'); return; }

      // Brush type switching (also sets tool to brush)
      if (e.code === "KeyU") { e.preventDefault(); deps.setBrushType('square'); deps.setTool('brush'); return; }
      if (e.code === "KeyI") { e.preventDefault(); deps.setBrushType('circle'); deps.setTool('brush'); return; }
      if (e.code === "KeyO") { e.preventDefault(); deps.setBrushType('diagonal'); deps.setTool('brush'); return; }
      if (e.code === "KeyP") { e.preventDefault(); deps.setBrushType('spray'); deps.setTool('brush'); return; }

      // Palette color selection
      if (e.code === "Digit1") { e.preventDefault(); deps.setSelectedColor(1); return; }
      if (e.code === "Digit2") { e.preventDefault(); deps.setSelectedColor(2); return; }
      if (e.code === "Digit3") { e.preventDefault(); deps.setSelectedColor(3); return; }
      if (e.code === "Digit4") { e.preventDefault(); deps.setSelectedColor(4); return; }
      if (e.code === "Digit5") { e.preventDefault(); deps.setSelectedColor(5); return; }
      if (e.code === "Digit6") { e.preventDefault(); deps.setSelectedColor(6); return; }
      if (e.code === "Digit7") { e.preventDefault(); deps.setSelectedColor(7); return; }
      if (e.code === "Digit8") { e.preventDefault(); deps.setSelectedColor(8); return; }

      // Auto-mode toggles
      if (e.code === "Space") { e.preventDefault(); deps.toggleAutoSpread(); return; }
      if (e.code === "KeyJ") { e.preventDefault(); deps.toggleAutoDots(); return; }
      if (e.code === "KeyK") { e.preventDefault(); deps.toggleAutoShapes(); return; }

      // Start/Stop All
      if (e.code === "KeyL") {
        e.preventDefault();
        const anyRunning = deps.runningRef.current || deps.dotsRunningRef.current || deps.shapesRunningRef.current;
        if (anyRunning) {
          if (deps.runningRef.current) {
            deps.runningRef.current = false;
            deps.setAutoSpreading(false);
            if (deps.rafRef.current) cancelAnimationFrame(deps.rafRef.current);
          }
          if (deps.dotsRunningRef.current) {
            deps.dotsRunningRef.current = false;
            deps.setAutoDots(false);
            if (deps.autoDotsRef.current) cancelAnimationFrame(deps.autoDotsRef.current);
          }
          if (deps.shapesRunningRef.current) {
            deps.shapesRunningRef.current = false;
            deps.setAutoShapes(false);
            if (deps.autoShapesRef.current) cancelAnimationFrame(deps.autoShapesRef.current);
          }
        } else {
          if (deps.autoSpreadEnabledRef.current && !deps.runningRef.current) {
            deps.runningRef.current = true;
            deps.setAutoSpreading(true);
            if (deps.spreadPatternRef.current === 'vein') deps.walkers.current = [];
            if (deps.spreadPatternRef.current === 'strobe') deps.strobeStateRef.current = true;
            if (deps.spreadPatternRef.current === 'ripple') deps.ripplesRef.current = [];
            deps.runAutoSpread();
          }
          if (deps.autoDotsEnabledRef.current && !deps.dotsRunningRef.current) {
            deps.dotsRunningRef.current = true;
            deps.setAutoDots(true);
            deps.runAutoDots();
          }
          if (deps.autoShapesEnabledRef.current && !deps.shapesRunningRef.current) {
            deps.shapesRunningRef.current = true;
            deps.setAutoShapes(true);
            deps.runAutoShapes();
          }
        }
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, [deps]);
}
