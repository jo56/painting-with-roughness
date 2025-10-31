import type { FoodSource } from "../types";
import { cloneGrid } from "../utils/grid";

const MAX_WALKERS = 200;

interface Walker {
  r: number;
  c: number;
  color: number;
}

interface ConwayRules {
  born: number[];
  survive: number[];
}

export function conway(
  grid: number[][],
  rules: ConwayRules,
  generativeColorIndices: number[]
): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);
  const BORN = rules.born;
  const SURVIVE = rules.survive;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let liveNeighbors = 0;
      const neighborColors: number[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            grid[nr]?.[nc] > 0
          ) {
            liveNeighbors++;
            neighborColors.push(grid[nr][nc]);
          }
        }
      }

      const isAlive = grid[r]?.[c] > 0;
      if (isAlive && !SURVIVE.includes(liveNeighbors)) {
        ng[r][c] = 0;
      } else if (!isAlive && BORN.includes(liveNeighbors)) {
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
        ng[r][c] =
          dominantColor > 0
            ? dominantColor
            : generativeColorIndices[0] || 1;
      }
    }
  }

  return ng;
}

export function crystallize(
  grid: number[][],
  threshold: number
): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) {
        const neighbors: number[] = [];
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
              neighbors.push(grid[nr][nc]);
            }
          }
        }

        if (neighbors.length > 0) {
          const counts: { [key: number]: number } = {};
          neighbors.forEach((n) => {
            counts[n] = (counts[n] || 0) + 1;
          });

          for (const color in counts) {
            if (counts[color] >= threshold) {
              ng[r][c] = parseInt(color);
              break;
            }
          }
        }
      }
    }
  }

  return ng;
}

export function vein(
  grid: number[][],
  walkers: Walker[],
  seekStrength: number,
  branchChance: number
): { newGrid: number[][], newWalkers: Walker[] } {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);

  if (walkers.length === 0) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] > 0 && Math.random() < 0.1) {
          walkers.push({ r, c, color: grid[r][c] });
        }
      }
    }
    if (walkers.length === 0 && grid.flat().some((cell) => cell > 0)) {
      let r = 0,
        c = 0;
      while (grid[r][c] === 0) {
        r = Math.floor(Math.random() * rows);
        c = Math.floor(Math.random() * cols);
      }
      walkers.push({ r, c, color: grid[r][c] });
    }
  }

  const foodSources: FoodSource[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] > 0) foodSources.push({ row: r, col: c });
    }
  }

  walkers.forEach((walker) => {
    let bestDir = { dr: 0, dc: 0 };
    let bestDist = Infinity;

    if (foodSources.length > 0 && Math.random() < seekStrength) {
      foodSources.forEach((food) => {
        const dist = Math.hypot(walker.r - food.row, walker.c - food.col);
        if (dist < bestDist && dist > 1) {
          bestDist = dist;
          bestDir = {
            dr: Math.sign(food.row - walker.r),
            dc: Math.sign(food.col - walker.c),
          };
        }
      });
    } else {
      bestDir = {
        dr: Math.floor(Math.random() * 3) - 1,
        dc: Math.floor(Math.random() * 3) - 1,
      };
    }

    walker.r += bestDir.dr;
    walker.c += bestDir.dc;
    walker.r = Math.max(0, Math.min(rows - 1, walker.r));
    walker.c = Math.max(0, Math.min(cols - 1, walker.c));

    const r_int = Math.round(walker.r);
    const c_int = Math.round(walker.c);
    ng[r_int][c_int] = walker.color;

    if (Math.random() < branchChance) {
      walkers.push({ ...walker });
    }
  });

  const limitedWalkers = walkers.slice(0, MAX_WALKERS);

  return { newGrid: ng, newWalkers: limitedWalkers };
}
