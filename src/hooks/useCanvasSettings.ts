import { useState } from 'react';

export function useCanvasSettings(defaults: {
  rows: number;
  cols: number;
  cellSize: number;
  showGrid: boolean;
  backgroundColor: string;
}) {
  const [rows, setRows] = useState(defaults.rows);
  const [cols, setCols] = useState(defaults.cols);
  const [cellSize, setCellSize] = useState(defaults.cellSize);
  const [showGrid, setShowGrid] = useState(defaults.showGrid);
  const [backgroundColor, setBackgroundColor] = useState(defaults.backgroundColor);

  return {
    rows,
    cols,
    cellSize,
    showGrid,
    backgroundColor,
    setRows,
    setCols,
    setCellSize,
    setShowGrid,
    setBackgroundColor,
  };
}
