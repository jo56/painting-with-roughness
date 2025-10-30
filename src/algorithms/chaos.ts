import { cloneGrid } from "../utils/grid";

export function scramble(grid: number[][], swapCount: number): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);

  const coloredCells: { r: number; c: number; color: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] > 0) {
        coloredCells.push({ r, c, color: grid[r][c] });
      }
    }
  }
  if (coloredCells.length < 2) return ng;

  const swaps = Math.min(swapCount, Math.floor(coloredCells.length / 2));
  for (let i = 0; i < swaps; i++) {
    const idx1 = Math.floor(Math.random() * coloredCells.length);
    let idx2 = Math.floor(Math.random() * coloredCells.length);
    while (idx1 === idx2) {
      idx2 = Math.floor(Math.random() * coloredCells.length);
    }
    const cell1 = coloredCells[idx1];
    const cell2 = coloredCells[idx2];

    if (cell1 && cell2) {
      const color1 = ng[cell1.r][cell1.c];
      const color2 = ng[cell2.r][cell2.c];
      ng[cell1.r][cell1.c] = color2;
      ng[cell2.r][cell2.c] = color1;
    }
  }

  return ng;
}

export function jitter(grid: number[][], jitterChance: number): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);
  const changes = new Map<string, number>();
  const empties = new Set<string>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = grid[r]?.[c];
      if (color > 0 && Math.random() < jitterChance) {
        const emptyNeighbors = [];
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr,
              nc = c + dc;
            if (
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              grid[nr][nc] === 0
            ) {
              emptyNeighbors.push({ nr, nc });
            }
          }
        }
        if (emptyNeighbors.length > 0) {
          const target =
            emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
          const key = `${target.nr},${target.nc}`;
          if (!changes.has(key) && !empties.has(`${r},${c}`)) {
            changes.set(key, color);
            empties.add(`${r},${c}`);
          }
        }
      }
    }
  }

  empties.forEach((key) => {
    const [r, c] = key.split(",").map(Number);
    if (!changes.has(key)) ng[r][c] = 0;
  });
  changes.forEach((color, key) => {
    const [r, c] = key.split(",").map(Number);
    ng[r][c] = color;
  });

  return ng;
}

export function strobe(
  grid: number[][],
  isExpanding: boolean,
  expandThreshold: number,
  contractThreshold: number
): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);

  if (isExpanding) {
    const locationsToColor = new Map<string, number>();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 0) {
          const neighborColors: number[] = [];
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr,
                nc = c + dc;
              if (
                nr >= 0 &&
                nr < rows &&
                nc >= 0 &&
                nc < cols &&
                grid[nr][nc] > 0
              ) {
                neighborColors.push(grid[nr][nc]);
              }
            }
          }

          if (neighborColors.length >= expandThreshold) {
            const colorCounts = neighborColors.reduce((acc, color) => {
              acc[color] = (acc[color] || 0) + 1;
              return acc;
            }, {} as Record<number, number>);

            let dominantColor = 0;
            let maxCount = 0;
            for (const color in colorCounts) {
              if (colorCounts[color] > maxCount) {
                maxCount = colorCounts[color];
                dominantColor = parseInt(color);
              }
            }
            if (dominantColor > 0) {
              locationsToColor.set(`${r},${c}`, dominantColor);
            }
          }
        }
      }
    }
    locationsToColor.forEach((color, key) => {
      const [r, c] = key.split(",").map(Number);
      ng[r][c] = color;
    });
  } else {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] > 0) {
          let emptyNeighbors = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr,
                nc = c + dc;
              if (
                nr < 0 ||
                nr >= rows ||
                nc < 0 ||
                nc >= cols ||
                grid[nr][nc] === 0
              ) {
                emptyNeighbors++;
              }
            }
          }
          if (emptyNeighbors >= contractThreshold) {
            ng[r][c] = 0;
          }
        }
      }
    }
  }

  return ng;
}

export function erosion(
  grid: number[][],
  erosionRate: number,
  solidity: number
): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] > 0 && Math.random() < erosionRate) {
        let emptyNeighbors = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr,
              nc = c + dc;
            if (
              nr < 0 ||
              nr >= rows ||
              nc < 0 ||
              nc >= cols ||
              grid[nr][nc] === 0
            ) {
              emptyNeighbors++;
            }
          }
        }
        if (emptyNeighbors >= solidity) {
          ng[r][c] = 0;
        }
      }
    }
  }

  return ng;
}

export function randomWalk(
  grid: number[][],
  spreadProbability: number,
  mode: "any" | "cardinal",
  spreadCount: number
): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const currentColor = grid[r]?.[c];
      if (currentColor === undefined || currentColor === 0) continue;

      if (Math.random() < spreadProbability) {
        let neighbors: { r: number; c: number }[] = [];

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            if (mode === "cardinal" && dr !== 0 && dc !== 0) continue;

            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              neighbors.push({ r: nr, c: nc });
            }
          }
        }

        if (neighbors.length > 0) {
          for (let i = neighbors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
          }

          const count = spreadCount;
          for (let i = 0; i < Math.min(count, neighbors.length); i++) {
            const randomNeighbor = neighbors[i];
            ng[randomNeighbor.r][randomNeighbor.c] = currentColor;
          }
        }
      }
    }
  }

  return ng;
}
