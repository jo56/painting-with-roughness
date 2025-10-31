import type { Direction } from "../types";
import { cloneGrid } from "../utils/grid";

interface Ripple {
  r: number;
  c: number;
  color: number;
  radius: number;
  maxRadius: number;
}

export function ripple(
  grid: number[][],
  ripples: Ripple[],
  rippleChance: number
): { newGrid: number[][], newRipples: Ripple[] } {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);

  ripples.forEach((ripple) => {
    const r = Math.round(ripple.radius);
    for (let i = 0; i < 360; i += 5) {
      const angle = (i * Math.PI) / 180;
      const nr = Math.round(ripple.r + r * Math.sin(angle));
      const nc = Math.round(ripple.c + r * Math.cos(angle));
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        ng[nr][nc] === 0
      ) {
        ng[nr][nc] = ripple.color;
      }
    }
    ripple.radius += 0.5;
  });

  const filteredRipples = ripples.filter((r) => r.radius <= r.maxRadius);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] > 0 && Math.random() < rippleChance) {
        filteredRipples.push({
          r,
          c,
          color: grid[r][c],
          radius: 1,
          maxRadius: Math.max(rows, cols) / 3,
        });
      }
    }
  }

  return { newGrid: ng, newRipples: filteredRipples };
}

export function vortex(
  grid: number[][],
  vortexCount: number
): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);

  for (let i = 0; i < vortexCount; i++) {
    const r = 1 + Math.floor(Math.random() * (rows - 2));
    const c = 1 + Math.floor(Math.random() * (cols - 2));

    const neighborsCoords = [
      [r - 1, c - 1],
      [r - 1, c],
      [r - 1, c + 1],
      [r, c + 1],
      [r + 1, c + 1],
      [r + 1, c],
      [r + 1, c - 1],
      [r, c - 1],
    ];

    const originalColors = neighborsCoords.map(
      ([nr, nc]) => grid[nr][nc]
    );

    neighborsCoords.forEach(([nr, nc], idx) => {
      const sourceIndex = (idx + 7) % 8;
      ng[nr][nc] = originalColors[sourceIndex];
    });
  }

  return ng;
}

export function flow(
  grid: number[][],
  direction: Direction,
  flowChance: number
): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);
  const changes = new Map<string, number>();
  const empties = new Set<string>();

  let r_start = 0,
    r_end = rows,
    r_inc = 1;
  let c_start = 0,
    c_end = cols,
    c_inc = 1;

  if (direction.includes("down")) {
    r_start = rows - 1;
    r_end = -1;
    r_inc = -1;
  }
  if (direction.includes("right")) {
    c_start = cols - 1;
    c_end = -1;
    c_inc = -1;
  }

  for (let r = r_start; r !== r_end; r += r_inc) {
    for (let c = c_start; c !== c_end; c += c_inc) {
      const color = grid[r]?.[c];
      if (color > 0 && Math.random() < flowChance) {
        let dr = 0,
          dc = 0;
        if (direction.includes("up")) dr = -1;
        if (direction.includes("down")) dr = 1;
        if (direction.includes("left")) dc = -1;
        if (direction.includes("right")) dc = 1;

        const nr = r + dr;
        const nc = c + dc;

        if (
          nr >= 0 &&
          nr < rows &&
          nc >= 0 &&
          nc < cols &&
          grid[nr][nc] === 0
        ) {
          if (!changes.has(`${nr},${nc}`)) {
            changes.set(`${nr},${nc}`, color);
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

export function pulse(
  grid: number[][],
  direction: string,
  overtakes: boolean
): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const ng = cloneGrid(grid);
  const changes = new Map<string, number>();

  let r_start = 0,
    r_end = rows,
    r_inc = 1;
  let c_start = 0,
    c_end = cols,
    c_inc = 1;

  switch (direction) {
    case "up":
      r_start = rows - 1;
      r_end = -1;
      r_inc = -1;
      break;
    case "down":
      break;
    case "left":
      c_start = cols - 1;
      c_end = -1;
      c_inc = -1;
      break;
    case "right":
      break;
    case "top-left":
      r_start = rows - 1;
      r_end = -1;
      r_inc = -1;
      c_start = cols - 1;
      c_end = -1;
      c_inc = -1;
      break;
    case "top-right":
      r_start = rows - 1;
      r_end = -1;
      r_inc = -1;
      break;
    case "bottom-left":
      c_start = cols - 1;
      c_end = -1;
      c_inc = -1;
      break;
    case "bottom-right":
      break;
  }

  for (let r = r_start; r !== r_end; r += r_inc) {
    for (let c = c_start; c !== c_end; c += c_inc) {
      const currentColor = grid[r]?.[c];
      if (currentColor > 0) {
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
              (grid[nr]?.[nc] === 0 || overtakes)
            ) {
              const key = `${nr},${nc}`;
              changes.set(key, currentColor);
            }
          }
        }
      }
    }
  }

  changes.forEach((color, key) => {
    const [r, c] = key.split(",").map(Number);
    ng[r][c] = color;
  });

  return ng;
}

export function directional(
  grid: number[][],
  spreadProbability: number,
  bias: Direction | "none",
  biasStrength: number
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
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              neighbors.push({ r: nr, c: nc });
            }
          }
        }

        if (bias !== "none" && Math.random() < biasStrength) {
          let dr = 0,
            dc = 0;

          switch (bias) {
            case "up":
              dr = -1;
              dc = 0;
              break;
            case "down":
              dr = 1;
              dc = 0;
              break;
            case "left":
              dr = 0;
              dc = -1;
              break;
            case "right":
              dr = 0;
              dc = 1;
              break;
            case "top-left":
              dr = -1;
              dc = -1;
              break;
            case "top-right":
              dr = -1;
              dc = 1;
              break;
            case "bottom-left":
              dr = 1;
              dc = -1;
              break;
            case "bottom-right":
              dr = 1;
              dc = 1;
              break;
          }

          const biasedNeighbor = { r: r + dr, c: c + dc };

          if (
            biasedNeighbor.r >= 0 &&
            biasedNeighbor.r < rows &&
            biasedNeighbor.c >= 0 &&
            biasedNeighbor.c < cols
          ) {
            ng[biasedNeighbor.r][biasedNeighbor.c] = currentColor;
            continue;
          }
        }

        if (neighbors.length > 0) {
          const randomNeighbor =
            neighbors[Math.floor(Math.random() * neighbors.length)];
          ng[randomNeighbor.r][randomNeighbor.c] = currentColor;
        }
      }
    }
  }

  return ng;
}
