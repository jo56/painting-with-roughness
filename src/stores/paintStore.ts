import { create } from 'zustand';
import type { BrushType } from '../types';

interface PaintState {
  // State
  palette: string[];
  selectedColor: number;
  brushSize: number;
  tool: string;
  brushType: BrushType;
  sprayDensity: number;
  diagonalThickness: number;
  blendMode: 'replace' | 'overlay';
  customColor: string;
  isSavingColor: boolean;

  // Actions
  setPalette: (palette: string[] | ((prev: string[]) => string[])) => void;
  setSelectedColor: (color: number | ((prev: number) => number)) => void;
  setBrushSize: (size: number | ((prev: number) => number)) => void;
  setTool: (tool: string | ((prev: string) => string)) => void;
  setBrushType: (type: BrushType | ((prev: BrushType) => BrushType)) => void;
  setSprayDensity: (density: number | ((prev: number) => number)) => void;
  setDiagonalThickness: (thickness: number | ((prev: number) => number)) => void;
  setBlendMode: (mode: 'replace' | 'overlay') => void;
  setCustomColor: (color: string | ((prev: string) => string)) => void;
  setIsSavingColor: (saving: boolean | ((prev: boolean) => boolean)) => void;
  handlePaletteClick: (index: number) => void;
}

export const usePaintStore = create<PaintState>((set, get) => ({
  // Initial state
  palette: [
    '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
  ],
  selectedColor: 1,
  brushSize: 2,
  tool: 'brush',
  brushType: 'square',
  sprayDensity: 0.2,
  diagonalThickness: 5,
  blendMode: 'replace',
  customColor: '#ffffff',
  isSavingColor: false,

  // Actions
  setPalette: (palette) => set({ palette: typeof palette === 'function' ? palette(get().palette) : palette }),
  setSelectedColor: (selectedColor) => set({ selectedColor: typeof selectedColor === 'function' ? selectedColor(get().selectedColor) : selectedColor }),
  setBrushSize: (brushSize) => set({ brushSize: typeof brushSize === 'function' ? brushSize(get().brushSize) : brushSize }),
  setTool: (tool) => set({ tool: typeof tool === 'function' ? tool(get().tool) : tool }),
  setBrushType: (brushType) => set({ brushType: typeof brushType === 'function' ? brushType(get().brushType) : brushType }),
  setSprayDensity: (sprayDensity) => set({ sprayDensity: typeof sprayDensity === 'function' ? sprayDensity(get().sprayDensity) : sprayDensity }),
  setDiagonalThickness: (diagonalThickness) => set({ diagonalThickness: typeof diagonalThickness === 'function' ? diagonalThickness(get().diagonalThickness) : diagonalThickness }),
  setBlendMode: (blendMode) => set({ blendMode }),
  setCustomColor: (customColor) => set({ customColor: typeof customColor === 'function' ? customColor(get().customColor) : customColor }),
  setIsSavingColor: (isSavingColor) => set({ isSavingColor: typeof isSavingColor === 'function' ? isSavingColor(get().isSavingColor) : isSavingColor }),

  handlePaletteClick: (index: number) => {
    const { isSavingColor, customColor, palette } = get();

    if (isSavingColor) {
      const newPalette = [...palette];
      newPalette[index] = customColor;
      set({ palette: newPalette, isSavingColor: false, selectedColor: index });
    } else {
      set({ selectedColor: index });
    }
  },
}));
