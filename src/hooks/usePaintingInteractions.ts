import { useRef } from 'react';
import * as drawingUtils from '../utils/drawing';
import { useCanvasStore } from '../stores/canvasStore';
import { usePaintStore } from '../stores/paintStore';

export interface UsePaintingInteractionsReturn {
  isMouseDown: React.RefObject<boolean>;
  handleMouseDown: (e: React.MouseEvent, canvasRef: React.RefObject<HTMLCanvasElement | null>) => void;
  handleMouseUp: () => void;
  handleMouseMove: (e: React.MouseEvent, canvasRef: React.RefObject<HTMLCanvasElement | null>) => void;
}

/**
 * Hook to handle painting interactions on the canvas
 * Reads from paint and canvas stores
 */
export function usePaintingInteractions(): UsePaintingInteractionsReturn {
  const isMouseDown = useRef(false);

  const { cellSize, setGrid } = useCanvasStore();
  const {
    tool,
    selectedColor,
    brushSize,
    brushType,
    blendMode,
    diagonalThickness,
    sprayDensity,
    isSavingColor,
    setIsSavingColor,
  } = usePaintStore();

  const paintCell = (r: number, c: number, color: number) => {
    setGrid((g) =>
      drawingUtils.paintCell({
        grid: g,
        r,
        c,
        color,
        brushSize,
        brushType,
        blendMode,
        diagonalThickness,
        sprayDensity,
      })
    );
  };

  const floodFill = (startR: number, startC: number, newColor: number) => {
    setGrid((g) => drawingUtils.floodFill({ grid: g, startR, startC, newColor }));
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
    if (!isMouseDown.current || tool === 'fill') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    const colorToUse = tool === 'eraser' ? 0 : selectedColor;
    paintCell(y, x, colorToUse);
  };

  return {
    isMouseDown,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
  };
}
