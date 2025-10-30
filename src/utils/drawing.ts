import type { BrushType } from "../types";
import { cloneGrid } from "./grid";

export interface PaintCellParams {
  grid: number[][];
  r: number;
  c: number;
  color: number;
  brushSize: number;
  brushType: BrushType;
  blendMode: "replace" | "overlay";
  diagonalThickness: number;
  sprayDensity: number;
}

export function paintCell({
  grid,
  r,
  c,
  color,
  brushSize,
  brushType,
  blendMode,
  diagonalThickness,
  sprayDensity,
}: PaintCellParams): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  if (r < 0 || r >= rows || c < 0 || c >= cols) return grid;

  const ng = cloneGrid(grid);
  for (
    let dr = -Math.floor(brushSize / 2);
    dr <= Math.floor(brushSize / 2);
    dr++
  ) {
    for (
      let dc = -Math.floor(brushSize / 2);
      dc <= Math.floor(brushSize / 2);
      dc++
    ) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        let shouldPaint = false;
        switch (brushType) {
          case "square":
            shouldPaint = true;
            break;
          case "circle": {
            const radius = Math.floor(brushSize / 2);
            shouldPaint = dr * dr + dc * dc <= radius * radius;
            break;
          }
          case "diagonal":
            shouldPaint =
              Math.abs(dr) === Math.abs(dc) &&
              Math.abs(dr) <= diagonalThickness;
            break;
          case "spray":
            shouldPaint = Math.random() < sprayDensity;
            break;
        }
        if (!shouldPaint) continue;

        if (blendMode === "replace" || ng[nr][nc] === 0) {
          ng[nr][nc] = color;
        } else if (blendMode === "overlay" && color > 0) {
          ng[nr][nc] = color;
        }
      }
    }
  }
  return ng;
}

export interface FloodFillParams {
  grid: number[][];
  startR: number;
  startC: number;
  newColor: number;
}

export function floodFill({
  grid,
  startR,
  startC,
  newColor,
}: FloodFillParams): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);
  const originalColor = grid[startR][startC];

  if (originalColor === newColor) return ng;

  const queue: [number, number][] = [[startR, startC]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const key = `${r},${c}`;

    if (r < 0 || r >= rows || c < 0 || c >= cols || visited.has(key)) {
      continue;
    }

    if (ng[r][c] !== originalColor) {
      continue;
    }

    ng[r][c] = newColor;
    visited.add(key);

    queue.push([r - 1, c]);
    queue.push([r + 1, c]);
    queue.push([r, c - 1]);
    queue.push([r, c + 1]);
  }

  return ng;
}

export interface AddRandomDotsParams {
  grid: number[][];
  availableColors: number[];
}

export function addRandomDots({
  grid,
  availableColors,
}: AddRandomDotsParams): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);

  if (availableColors.length === 0) return ng;

  const numDots = Math.floor(Math.random() * 6) + 5;
  for (let i = 0; i < numDots; i++) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    const color =
      availableColors[Math.floor(Math.random() * availableColors.length)];
    if (ng[r]) ng[r][c] = color;
  }

  return ng;
}

export interface AddRandomShapesParams {
  grid: number[][];
  availableColors: number[];
}

export function addRandomShapes({
  grid,
  availableColors,
}: AddRandomShapesParams): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);

  if (availableColors.length === 0) return ng;

  const numShapes = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < numShapes; i++) {
    const color =
      availableColors[Math.floor(Math.random() * availableColors.length)];
    const shapeType = Math.random() > 0.5 ? "rect" : "line";

    if (shapeType === "rect") {
      const startR = Math.floor(Math.random() * (rows - 5));
      const startC = Math.floor(Math.random() * (cols - 5));
      const width = Math.floor(Math.random() * 6) + 3;
      const height = Math.floor(Math.random() * 6) + 3;

      for (let r = startR; r < Math.min(startR + height, rows); r++) {
        for (let c = startC; c < Math.min(startC + width, cols); c++) {
          if (ng[r]) ng[r][c] = color;
        }
      }
    } else {
      const startR = Math.floor(Math.random() * rows);
      const startC = Math.floor(Math.random() * cols);
      const isHorizontal = Math.random() > 0.5;
      const length = Math.floor(Math.random() * 10) + 5;

      for (let i = 0; i < length; i++) {
        let r = startR;
        let c = startC;

        if (isHorizontal) {
          c += i;
        } else {
          r += i;
        }

        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          if (ng[r]) ng[r][c] = color;
        }
      }
    }
  }

  return ng;
}
