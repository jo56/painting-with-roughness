import { useEffect, useRef, useCallback } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { usePaintStore } from '../stores/paintStore';
import { useUIStore } from '../stores/uiStore';
import { rgbToHex } from '../utils/color';
import { THEMES } from '../utils/themes';

const GRID_COLOR = '#27272a';
const CLEAR_BUTTON_UPDATE_DELAY = 100;

export function useCanvasRendering() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const clearButtonRef = useRef<HTMLButtonElement | null>(null);

  const { grid, rows, cols, cellSize, backgroundColor, showGrid } = useCanvasStore();
  const { palette, customColor } = usePaintStore();
  const { panelVisible, currentTheme, panelTransparent } = useUIStore();
  const setClearButtonColor = useCanvasStore((state) => state.setClearButtonColor);

  const currentThemeConfig = THEMES[currentTheme as keyof typeof THEMES](panelTransparent);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const colorIndex = grid[r]?.[c];
        if (colorIndex > 0) {
          if (colorIndex === palette.length) {
            ctx.fillStyle = customColor;
          } else {
            ctx.fillStyle = palette[colorIndex];
          }
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }

    if (showGrid) {
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= cols * cellSize; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x + 0.25, 0);
        ctx.lineTo(x + 0.25, rows * cellSize);
        ctx.stroke();
      }
      for (let y = 0; y <= rows * cellSize; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.25);
        ctx.lineTo(cols * cellSize, y + 0.25);
        ctx.stroke();
      }
    }
  }, [grid, rows, cols, cellSize, backgroundColor, showGrid, palette, customColor]);

  const updateClearButtonColor = useCallback(() => {
    if (!clearButtonRef.current || !canvasRef.current || !panelVisible) {
      return;
    }

    const btnRect = clearButtonRef.current.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const checkX = btnRect.left + btnRect.width / 2;
    const checkY = btnRect.top + btnRect.height / 2;

    const defaultClearColor = currentThemeConfig.clear.color;

    if (checkX < canvasRect.left || checkX > canvasRect.right || checkY < canvasRect.top || checkY > canvasRect.bottom) {
      setClearButtonColor(defaultClearColor);
      return;
    }

    const xOnCanvas = checkX - canvasRect.left;
    const yOnCanvas = checkY - canvasRect.top;

    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
      const pixelData = ctx.getImageData(xOnCanvas, yOnCanvas, 1, 1).data;
      const pixelHex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);

      if (pixelHex.toLowerCase() === defaultClearColor.toLowerCase()) {
        setClearButtonColor('#ffffff');
      } else {
        setClearButtonColor(defaultClearColor);
      }
    } catch (e) {
      console.error("Could not get image data from canvas:", e);
      setClearButtonColor(defaultClearColor);
    }
  }, [panelVisible, currentThemeConfig, setClearButtonColor]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const timeoutId = setTimeout(updateClearButtonColor, CLEAR_BUTTON_UPDATE_DELAY);
    return () => clearTimeout(timeoutId);
  }, [grid, updateClearButtonColor]);

  return {
    canvasRef,
    canvasContainerRef,
    clearButtonRef,
    updateClearButtonColor,
  };
}
