export function createEmptyGrid(rows: number, cols: number): number[][] {
  const g: number[][] = [];
  for (let r = 0; r < rows; r++) {
    g[r] = new Array(cols).fill(0);
  }
  return g;
}

export function cloneGrid(grid: number[][]): number[][] {
  return grid.map(row => [...row]);
}