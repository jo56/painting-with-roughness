import { useEffect, useRef } from 'react';
import { usePaintStore } from '../stores/paintStore';
import { useAutomationStore } from '../stores/automationStore';
import { useUIStore } from '../stores/uiStore';

/**
 * Hook to handle global keyboard shortcuts
 * Reads from and updates paint and automation stores
 */
export function useGlobalKeyboardShortcuts(): void {
  const {
    brushType,
    setBrushSize,
    setDiagonalThickness,
    setSprayDensity,
    setTool,
    setBrushType,
    setSelectedColor,
  } = usePaintStore();

  const { toggleAutoSpread, toggleAutoDots, toggleAutoShapes, startAllEnabled, stopAll } = useAutomationStore();

  const {
    panelVisible,
    isMobile,
    setPanelVisible,
    setPanelMinimized,
    setPanelPos,
    setIsMobile,
    setPanelTransparent,
  } = useUIStore();

  // Track mouse position for panel positioning
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const trackMouse = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', trackMouse);
    return () => window.removeEventListener('mousemove', trackMouse);
  }, []);
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
        if (brushType === 'diagonal') {
          setDiagonalThickness(d => Math.max(1, d - 1));
        } else if (brushType === 'spray') {
          setSprayDensity(d => Math.max(0.01, parseFloat((d - 0.01).toFixed(2))));
        }
        return;
      }
      if (e.code === 'BracketRight') {
        e.preventDefault();
        if (brushType === 'diagonal') {
          setDiagonalThickness(d => Math.min(100, d + 1));
        } else if (brushType === 'spray') {
          setSprayDensity(d => Math.min(1, parseFloat((d + 0.01).toFixed(2))));
        }
        return;
      }

      // Panel visibility toggle (Shift key)
      if (e.key === 'Shift') {
        e.preventDefault();
        if (!panelVisible) {
          // Show panel at mouse position
          setIsMobile(false);
          setPanelVisible(true);
          setPanelMinimized(false);

          // Calculate position under mouse with margins
          const PANEL_WIDTH = 300;
          const MARGIN = 10;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          const newX = Math.max(MARGIN, Math.min(mousePos.current.x - PANEL_WIDTH / 2, windowWidth - PANEL_WIDTH - MARGIN));
          const newY = Math.max(MARGIN, Math.min(mousePos.current.y - 20, windowHeight - 200));

          setPanelPos({ x: newX, y: newY });
        } else {
          // Hide panel
          setPanelVisible(false);
        }
        return;
      }

      // Panel transparency toggle (T key)
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setPanelTransparent(prev => !prev);
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

      // Start/Stop All
      if (e.code === "KeyL") {
        e.preventDefault();
        const { autoSpreading, autoDots, autoShapes } = useAutomationStore.getState();
        const anyRunning = autoSpreading || autoDots || autoShapes;

        if (anyRunning) {
          stopAll();
        } else {
          startAllEnabled();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, [brushType, setBrushSize, setDiagonalThickness, setSprayDensity, setTool, setBrushType, setSelectedColor, toggleAutoSpread, toggleAutoDots, toggleAutoShapes, startAllEnabled, stopAll, panelVisible, isMobile, setPanelVisible, setPanelMinimized, setPanelPos, setIsMobile, setPanelTransparent]);
}
