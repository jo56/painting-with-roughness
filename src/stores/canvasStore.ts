import { create } from 'zustand';
import { createEmptyGrid } from '../utils/grid';

interface CanvasState {
  // State
  cellSize: number;
  rows: number;
  cols: number;
  grid: number[][];
  showGrid: boolean;
  backgroundColor: string;
  clearButtonColor: string;

  // Actions
  setCellSize: (size: number) => void;
  setRows: (rows: number) => void;
  setCols: (cols: number) => void;
  setGrid: (grid: number[][] | ((prev: number[][]) => number[][])) => void;
  setShowGrid: (show: boolean) => void;
  setBackgroundColor: (color: string) => void;
  setClearButtonColor: (color: string) => void;
  handleRowsChange: (newRows: number) => void;
  handleColsChange: (newCols: number) => void;
  clear: () => void;
}

const defaults = {
  cellSize: 10,
  rows: 80,
  cols: 168,
  showGrid: false,
  backgroundColor: '#0a0a0a',
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Initial state
  cellSize: defaults.cellSize,
  rows: defaults.rows,
  cols: defaults.cols,
  grid: createEmptyGrid(defaults.rows, defaults.cols),
  showGrid: defaults.showGrid,
  backgroundColor: defaults.backgroundColor,
  clearButtonColor: '#ff6b6b',

  // Actions
  setCellSize: (cellSize) => set({ cellSize }),
  setRows: (rows) => set({ rows }),
  setCols: (cols) => set({ cols }),
  setGrid: (grid) =>
    set({ grid: typeof grid === 'function' ? grid(get().grid) : grid }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
  setClearButtonColor: (clearButtonColor) => set({ clearButtonColor }),

  handleRowsChange: (newRows: number) => {
    const { cols, grid: currentGrid } = get();
    const newGrid = createEmptyGrid(newRows, cols);
    const oldRows = currentGrid.length;

    for (let r = 0; r < Math.min(oldRows, newRows); r++) {
      const oldCols = currentGrid[r]?.length ?? 0;
      for (let c = 0; c < Math.min(oldCols, cols); c++) {
        newGrid[r][c] = currentGrid[r][c];
      }
    }

    set({ rows: newRows, grid: newGrid });
  },

  handleColsChange: (newCols: number) => {
    const { grid: currentGrid } = get();
    const newGrid = currentGrid.map(row => {
      const newRow = new Array(newCols).fill(0);
      const oldLength = row.length;
      for (let c = 0; c < Math.min(oldLength, newCols); c++) {
        newRow[c] = row[c];
      }
      return newRow;
    });

    set({ cols: newCols, grid: newGrid });
  },

  clear: () => {
    const { rows, cols } = get();
    set({ grid: createEmptyGrid(rows, cols) });
  },
}));
