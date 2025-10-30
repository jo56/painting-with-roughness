import { useRef } from 'react';
import * as drawingUtils from '../utils/drawing';
import type { BrushType } from '../types';

export interface UsePaintingInteractionsReturn {
  isMouseDown: React.RefObject<boolean>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseMove: (e: React.MouseEvent) => void;
}

interface PaintingInteractionsDeps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  cellSize: number;
  tool: string;
  selectedColor: number;
  brushSize: number;
  brushTypeRef: React.RefObject<BrushType>;
  blendMode: string;
  diagonalThicknessRef: React.RefObject<number>;
  sprayDensityRef: React.RefObject<number>;
  isSavingColor: boolean;
  setIsSavingColor: (saving: boolean) => void;
  setGrid: React.Dispatch<React.SetStateAction<number[][]>>;
}

export function usePaintingInteractions(deps: PaintingInteractionsDeps): UsePaintingInteractionsReturn {
  const isMouseDown = useRef(false);

  const paintCell = (r: number, c: number, color: number) => {
    deps.setGrid(g => drawingUtils.paintCell({
      grid: g,
      r,
      c,
      color,
      brushSize: deps.brushSize,
      brushType: deps.brushTypeRef.current!,
      blendMode: deps.blendMode,
      diagonalThickness: deps.diagonalThicknessRef.current!,
      sprayDensity: deps.sprayDensityRef.current!,
    }));
  };

  const floodFill = (startR: number, startC: number, newColor: number) => {
    deps.setGrid(g => drawingUtils.floodFill({ grid: g, startR, startC, newColor }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = deps.canvasRef.current;
    if (!canvas) return;

    if (deps.isSavingColor) {
      deps.setIsSavingColor(false);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / deps.cellSize);
    const y = Math.floor((e.clientY - rect.top) / deps.cellSize);

    if (deps.tool === 'fill') {
      floodFill(y, x, deps.selectedColor);
    } else {
      isMouseDown.current = true;
      const colorToUse = deps.tool === 'eraser' ? 0 : deps.selectedColor;
      paintCell(y, x, colorToUse);
    }
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || deps.tool === 'fill') return;
    const canvas = deps.canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / deps.cellSize);
    const y = Math.floor((e.clientY - rect.top) / deps.cellSize);

    const colorToUse = deps.tool === 'eraser' ? 0 : deps.selectedColor;
    paintCell(y, x, colorToUse);
  };

  return {
    isMouseDown,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
  };
}
