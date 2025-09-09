import { cloneGrid } from './grid';
import { colorPalette } from '../constants';

export function createColorSpread(
  grid: number[][],
  rows: number,
  cols: number,
  spreadProbability: number
): number[][] {
  const ng = cloneGrid(grid);
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const currentColor = grid[r][c];
      
      if (currentColor > 0) {
        if (Math.random() < spreadProbability) {
          const neighbors: { r: number, c: number }[] = [];
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                neighbors.push({ r: nr, c: nc });
              }
            }
          }
          
          if (neighbors.length > 0) {
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            ng[randomNeighbor.r][randomNeighbor.c] = currentColor;
          }
        }
      }
    }
  }
  
  return ng;
}

export function createRandomDots(
  grid: number[][],
  rows: number,
  cols: number
): number[][] {
  const ng = cloneGrid(grid);
  
  const numDots = Math.floor(Math.random() * 6) + 5;
  for (let i = 0; i < numDots; i++) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    const color = Math.floor(Math.random() * (colorPalette.length - 1)) + 1;
    ng[r][c] = color;
  }
  
  return ng;
}

export function createRandomShapes(
  grid: number[][],
  rows: number,
  cols: number
): number[][] {
  const ng = cloneGrid(grid);
  
  const numShapes = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < numShapes; i++) {
    const color = Math.floor(Math.random() * (colorPalette.length - 1)) + 1;
    const shapeType = Math.random() > 0.5 ? 'rect' : 'line';
    
    if (shapeType === 'rect') {
      const startR = Math.floor(Math.random() * (rows - 5));
      const startC = Math.floor(Math.random() * (cols - 5));
      const width = Math.floor(Math.random() * 6) + 3;
      const height = Math.floor(Math.random() * 6) + 3;
      
      for (let r = startR; r < Math.min(startR + height, rows); r++) {
        for (let c = startC; c < Math.min(startC + width, cols); c++) {
          ng[r][c] = color;
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
          ng[r][c] = color;
        }
      }
    }
  }
  
  return ng;
}