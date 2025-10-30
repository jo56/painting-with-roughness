import { useCallback, useEffect, useRef, useState } from 'react';
import { createEmptyGrid } from '../utils/grid';
import { rgbToHex } from '../utils/color';

const GRID_COLOR = '#27272a';

export interface UseCanvasStateReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  clearButtonRef: React.RefObject<HTMLButtonElement>;
  cellSize: number;
  rows: number;
  cols: number;
  grid: number[][];
  showGrid: boolean;
  backgroundColor: string;
  clearButtonColor: string;
  setCellSize: (size: number) => void;
  setRows: (rows: number) => void;
  setCols: (cols: number) => void;
  setGrid: React.Dispatch<React.SetStateAction<number[][]>>;
  setShowGrid: (show: boolean) => void;
  setBackgroundColor: (color: string) => void;
  handleRowsChange: (newRows: number) => void;
  handleColsChange: (newCols: number) => void;
  clear: () => void;
  draw: () => void;
  updateClearButtonColor: () => void;
}

export function useCanvasState(
  palette: string[],
  customColor: string,
  panelVisible: boolean,
  currentThemeConfig: any
): UseCanvasStateReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const clearButtonRef = useRef<HTMLButtonElement | null>(null);

  const defaults = {
    cellSize: 10,
    rows: 100,
    cols: 165,
    showGrid: false,
    backgroundColor: '#0a0a0a',
  };

  const [cellSize, setCellSize] = useState(defaults.cellSize);
  const [rows, setRows] = useState(defaults.rows);
  const [cols, setCols] = useState(defaults.cols);
  const [grid, setGrid] = useState<number[][]>(() => createEmptyGrid(defaults.rows, defaults.cols));
  const [showGrid, setShowGrid] = useState(defaults.showGrid);
  const [backgroundColor, setBackgroundColor] = useState(defaults.backgroundColor);
  const [clearButtonColor, setClearButtonColor] = useState('#ff6b6b');

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
  }, [panelVisible, currentThemeConfig]);

  const handleRowsChange = useCallback((newRows: number) => {
    setRows(newRows);
    setGrid(currentGrid => {
      const newGrid = createEmptyGrid(newRows, cols);
      const oldRows = currentGrid.length;
      for (let r = 0; r < Math.min(oldRows, newRows); r++) {
        const oldCols = currentGrid[r]?.length ?? 0;
        for (let c = 0; c < Math.min(oldCols, cols); c++) {
          newGrid[r][c] = currentGrid[r][c];
        }
      }
      return newGrid;
    });
  }, [cols]);

  const handleColsChange = useCallback((newCols: number) => {
    setCols(newCols);
    setGrid(currentGrid =>
      currentGrid.map(row => {
        const newRow = new Array(newCols).fill(0);
        const oldLength = row.length;
        for (let c = 0; c < Math.min(oldLength, newCols); c++) {
          newRow[c] = row[c];
        }
        return newRow;
      })
    );
  }, []);

  const clear = useCallback(() => {
    setGrid(createEmptyGrid(rows, cols));
  }, [rows, cols]);

  useEffect(() => draw(), [draw]);

  return {
    canvasRef,
    canvasContainerRef,
    clearButtonRef,
    cellSize,
    rows,
    cols,
    grid,
    showGrid,
    backgroundColor,
    clearButtonColor,
    setCellSize,
    setRows,
    setCols,
    setGrid,
    setShowGrid,
    setBackgroundColor,
    handleRowsChange,
    handleColsChange,
    clear,
    draw,
    updateClearButtonColor,
  };
}
