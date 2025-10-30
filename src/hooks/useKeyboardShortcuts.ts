import { useEffect, useRef } from 'react';
import type { BrushType, Direction } from '../types/patterns';

export interface KeyboardShortcutsCallbacks {
  // Recording
  startRecording: () => void;
  stopRecording: () => void;
  isRecording: boolean;
  recordEnabled: boolean;

  // Auto modes
  toggleAutoSpread: () => void;
  toggleAutoDots: () => void;
  toggleAutoShapes: () => void;

  // Panel
  setPanelVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  panelVisible: boolean;
  setPanelMinimized: (minimized: boolean | ((prev: boolean) => boolean)) => void;
  setPanelTransparent: (transparent: boolean | ((prev: boolean) => boolean)) => void;
  setPanelPos: (pos: { x: number; y: number }) => void;
  panelDimensions: React.MutableRefObject<{ width: number; height: number }>;
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
  setIsMobile: (isMobile: boolean) => void;

  // Drawing
  setTool: (tool: 'brush' | 'eraser' | 'fill') => void;
  setBrushType: (type: BrushType) => void;
  setBrushSize: (size: number | ((prev: number) => number)) => void;
  setDiagonalThickness: (thickness: number | ((prev: number) => number)) => void;
  setSprayDensity: (density: number | ((prev: number) => number)) => void;
  brushTypeRef: React.MutableRefObject<BrushType>;

  // Colors
  setSelectedColor: (color: number) => void;

  // Grid
  clearGrid: () => void;

  // Directional controls (for pulse, directional, flow patterns)
  setPulseDirection?: (dir: Direction) => void;
  setDirectionalBias?: (bias: 'none' | Direction) => void;
  setFlowDirection?: (dir: Direction) => void;
  showGenerativeSettings?: boolean;
  spreadPattern?: string;
  pressedKeys?: React.MutableRefObject<Set<string>>;
}

export function useKeyboardShortcuts(callbacks: KeyboardShortcutsCallbacks) {
  const {
    startRecording,
    stopRecording,
    isRecording,
    recordEnabled,
    toggleAutoSpread,
    toggleAutoDots,
    toggleAutoShapes,
    setPanelVisible,
    panelVisible,
    setPanelMinimized,
    setPanelTransparent,
    setPanelPos,
    panelDimensions,
    mousePos,
    setIsMobile,
    setTool,
    setBrushType,
    setBrushSize,
    setDiagonalThickness,
    setSprayDensity,
    brushTypeRef,
    setSelectedColor,
    clearGrid,
    setPulseDirection,
    setDirectionalBias,
    setFlowDirection,
    showGenerativeSettings,
    spreadPattern,
    pressedKeys
  } = callbacks;

  // Recording shortcut (r key) - CRITICAL FIX
  useEffect(() => {
    const handleRecordingShortcut = (e: KeyboardEvent) => {
      if (e.key && e.key.toLowerCase() === "r" && recordEnabled) {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    };
    window.addEventListener("keydown", handleRecordingShortcut);
    return () => window.removeEventListener("keydown", handleRecordingShortcut);
  }, [isRecording, recordEnabled, startRecording, stopRecording]);

  // Panel visibility and transparency shortcuts (Shift for visibility, T for transparency)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        e.preventDefault();
        if (!panelVisible) {
          // If panel is invisible, show it at mouse position
          setIsMobile(false);
          setPanelVisible(true);
          setPanelMinimized(false);

          // Use mouse position if available, else center
          const mouseX = mousePos.current.x || window.innerWidth / 2;
          const mouseY = mousePos.current.y || window.innerHeight / 2;

          // Use stored panel dimensions
          const PANEL_WIDTH = panelDimensions.current.width;
          const PANEL_HEIGHT = panelDimensions.current.height;
          const MARGIN = 20;

          // Calculate new position with header center under the mouse
          const newX = Math.max(
            MARGIN,
            Math.min(mouseX - PANEL_WIDTH / 2, window.innerWidth - PANEL_WIDTH - MARGIN)
          );
          const newY = Math.max(
            MARGIN,
            Math.min(mouseY - 20, window.innerHeight - PANEL_HEIGHT - MARGIN)
          );

          setPanelPos({ x: newX, y: newY });
        } else {
          // If panel is visible, make it invisible
          setPanelVisible(false);
        }
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setPanelTransparent(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelVisible, setPanelVisible, setPanelMinimized, setPanelTransparent, setPanelPos, panelDimensions, mousePos, setIsMobile]);

  // Global shortcuts for tools, colors, auto-modes
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.isContentEditable) {
        return;
      }

      // Brush Size
      if (e.code === 'Digit9') {
        e.preventDefault();
        setBrushSize(currentSize => Math.max(1, currentSize - 1));
        return;
      }
      if (e.code === 'Digit0') {
        e.preventDefault();
        setBrushSize(currentSize => Math.min(100, currentSize + 1));
        return;
      }

      // Brush-Specific Controls
      if (e.code === 'BracketLeft') {
        e.preventDefault();
        if (brushTypeRef.current === 'diagonal') {
          setDiagonalThickness(d => Math.max(1, d - 1));
        } else if (brushTypeRef.current === 'spray') {
          setSprayDensity(d => Math.max(0.01, parseFloat((d - 0.01).toFixed(2))));
        }
        return;
      }
      if (e.code === 'BracketRight') {
        e.preventDefault();
        if (brushTypeRef.current === 'diagonal') {
          setDiagonalThickness(d => Math.min(100, d + 1));
        } else if (brushTypeRef.current === 'spray') {
          setSprayDensity(d => Math.min(1, parseFloat((d + 0.01).toFixed(2))));
        }
        return;
      }

      // Tool switching
      if (e.code === "KeyE") { e.preventDefault(); setTool('eraser'); return; }
      if (e.code === "KeyF") { e.preventDefault(); setTool('fill'); return; }
      if (e.code === "KeyB") { e.preventDefault(); setTool('brush'); return; }

      // Brush type switching (also sets tool to brush)
      if (e.code === "KeyU") { e.preventDefault(); setBrushType('square'); setTool('brush'); return; }
      if (e.code === "KeyI") { e.preventDefault(); setBrushType('circle'); setTool('brush'); return; }
      if (e.code === "KeyO") { e.preventDefault(); setBrushType('diagonal'); setTool('brush'); return; }
      if (e.code === "KeyP") { e.preventDefault(); setBrushType('spray'); setTool('brush'); return; }

      // Palette color selection
      if (e.code === "Digit1") { e.preventDefault(); setSelectedColor(1); return; }
      if (e.code === "Digit2") { e.preventDefault(); setSelectedColor(2); return; }
      if (e.code === "Digit3") { e.preventDefault(); setSelectedColor(3); return; }
      if (e.code === "Digit4") { e.preventDefault(); setSelectedColor(4); return; }
      if (e.code === "Digit5") { e.preventDefault(); setSelectedColor(5); return; }
      if (e.code === "Digit6") { e.preventDefault(); setSelectedColor(6); return; }
      if (e.code === "Digit7") { e.preventDefault(); setSelectedColor(7); return; }
      if (e.code === "Digit8") { e.preventDefault(); setSelectedColor(8); return; }

      // Auto-mode toggles
      if (e.code === "Space") { e.preventDefault(); toggleAutoSpread(); return; }
      if (e.code === "KeyJ") { e.preventDefault(); toggleAutoDots(); return; }
      if (e.code === "KeyK") { e.preventDefault(); toggleAutoShapes(); return; }

      // Clear grid
      if (e.code === "KeyC") { e.preventDefault(); clearGrid(); return; }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, [toggleAutoSpread, toggleAutoDots, toggleAutoShapes, setTool, setBrushType, setBrushSize, setDiagonalThickness, setSprayDensity, brushTypeRef, setSelectedColor, clearGrid]);

  // Directional controls for patterns (WASD keys)
  useEffect(() => {
    if (!setPulseDirection || !setDirectionalBias || !setFlowDirection || !pressedKeys) {
      return;
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code) {
        pressedKeys.current.delete(code);
      }
    };

    const relevantCodes = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showGenerativeSettings || (spreadPattern !== 'pulse' && spreadPattern !== 'directional' && spreadPattern !== 'flow')) {
        return;
      }

      const code = e.code;
      if (!code || !relevantCodes.includes(code)) {
        return;
      }

      e.preventDefault();
      pressedKeys.current.add(code);

      const keys = pressedKeys.current;
      const hasW = keys.has('KeyW');
      const hasA = keys.has('KeyA');
      const hasS = keys.has('KeyS');
      const hasD = keys.has('KeyD');

      let direction: Direction;
      if (hasW && hasA) direction = 'top-left';
      else if (hasW && hasD) direction = 'top-right';
      else if (hasS && hasA) direction = 'bottom-left';
      else if (hasS && hasD) direction = 'bottom-right';
      else if (hasW) direction = 'up';
      else if (hasS) direction = 'down';
      else if (hasA) direction = 'left';
      else if (hasD) direction = 'right';
      else return;

      if (spreadPattern === 'pulse') {
        setPulseDirection(direction);
      } else if (spreadPattern === 'directional') {
        setDirectionalBias(direction);
      } else if (spreadPattern === 'flow') {
        setFlowDirection(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showGenerativeSettings, spreadPattern, setPulseDirection, setDirectionalBias, setFlowDirection, pressedKeys]);
}
