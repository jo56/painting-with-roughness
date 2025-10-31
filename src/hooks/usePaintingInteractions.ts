import { useRef } from 'react';
import * as drawingUtils from '../utils/drawing';
import { useCanvasStore } from '../stores/canvasStore';
import { usePaintStore } from '../stores/paintStore';
import { rgbToHex } from '../utils/color';

export interface UsePaintingInteractionsReturn {
  handleMouseDown: (e: React.MouseEvent, canvasRef: React.RefObject<HTMLCanvasElement | null>) => void;
  handleMouseUp: () => void;
  handleMouseMove: (e: React.MouseEvent, canvasRef: React.RefObject<HTMLCanvasElement | null>) => void;
}

export function usePaintingInteractions(): UsePaintingInteractionsReturn {
  const isMouseDown = useRef(false);

  const { cellSize, setGrid, getOrCreateCustomColorIndex } = useCanvasStore();
  const {
    tool,
    selectedColor,
    brushSize,
    brushType,
    blendMode,
    diagonalThickness,
    sprayDensity,
    isSavingColor,
    palette,
    customColor,
    setIsSavingColor,
    setSelectedColor,
    setCustomColor,
  } = usePaintStore();

  const paintCell = (r: number, c: number, color: number) => {
    // Convert custom color slot to unique index
    let actualColor = color;
    if (color === palette.length) {
      actualColor = getOrCreateCustomColorIndex(customColor);
    }

    setGrid((g) =>
      drawingUtils.paintCell({
        grid: g,
        r,
        c,
        color: actualColor,
        brushSize,
        brushType,
        blendMode,
        diagonalThickness,
        sprayDensity,
      })
    );
  };

  const floodFill = (startR: number, startC: number, newColor: number) => {
    // Convert custom color slot to unique index
    let actualColor = newColor;
    if (newColor === palette.length) {
      actualColor = getOrCreateCustomColorIndex(customColor);
    }

    setGrid((g) => drawingUtils.floodFill({ grid: g, startR, startC, newColor: actualColor }));
  };

  const handleMouseDown = (e: React.MouseEvent, canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isSavingColor) {
      setIsSavingColor(false);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (tool === 'fill') {
      floodFill(y, x, selectedColor);
    } else if (tool === 'eyedropper') {
      // Sample color from canvas
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Get pixel coordinates (center of cell)
      const pixelX = x * cellSize + cellSize / 2;
      const pixelY = y * cellSize + cellSize / 2;

      try {
        const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data;
        const sampledHex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);

        setCustomColor(sampledHex);
        setSelectedColor(palette.length);
      } catch (error) {
        console.error('Failed to sample color:', error);
      }
    } else {
      isMouseDown.current = true;
      const colorToUse = tool === 'eraser' ? 0 : selectedColor;
      paintCell(y, x, colorToUse);
    }
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent, canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
    if (!isMouseDown.current || tool === 'fill' || tool === 'eyedropper') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    const colorToUse = tool === 'eraser' ? 0 : selectedColor;
    paintCell(y, x, colorToUse);
  };

  return {
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
  };
}
