
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Image-to-Grid Generative Painter (Upload → Convert → Spread)
 * - Upload an image
 * - Convert it to a discrete grid using a palette (with optional dithering)
 * - Run spread patterns over the grid (no drawing tools)
 *
 * Layout:
 *   [ Settings (fixed left) ]   [ Centered Canvas ]
 *
 * Notes:
 * - Color index 0 means "empty".
 * - Indices 1..palette.length-1 map to palette colors.
 * - Index == palette.length means the "customColor".
 */

// -------- Types --------
type Direction =
  | "up"
  | "down"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

type SpreadPattern =
  | "random"
  | "conway"
  | "pulse"
  | "directional"
  | "tendrils"
  | "vein"
  | "crystallize"
  | "erosion"
  | "flow"
  | "jitter"
  | "vortex"
  | "strobe"
  | "scramble"
  | "ripple";

// -------- Helpers --------
const GRID_LINE = "#27272a";

function createEmptyGrid(rows: number, cols: number): number[][] {
  const g: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) g[r] = new Array(cols).fill(0);
  return g;
}
function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => row.slice());
}
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
function nearestPaletteIndex(
  r: number,
  g: number,
  b: number,
  palette: string[]
): number {
  // palette[0] is not used for fill (index 0 == empty). We compare against 1..N-1
  let bestIdx = 1;
  let bestDist = Infinity;
  for (let i = 1; i < palette.length; i++) {
    const hex = palette[i].replace("#", "");
    const pr = parseInt(hex.slice(0, 2), 16);
    const pg = parseInt(hex.slice(2, 4), 16);
    const pb = parseInt(hex.slice(4, 6), 16);
    const d =
      (pr - r) * (pr - r) + (pg - g) * (pg - g) + (pb - b) * (pb - b);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}
function parseHexColor(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function luma(R: number, G: number, B: number) {
  // Perceived brightness (simple NTSC weights). Range ~0..255
  return 0.299 * R + 0.587 * G + 0.114 * B;
}

// -------- Component --------
export default function App(): JSX.Element {
  // ----- Canvas / grid state -----
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [grid, setGrid] = useState<number[][]>(() => createEmptyGrid(60, 100));
  const [rows, setRows] = useState(60);
  const [cols, setCols] = useState(100);
  const [cellSize, setCellSize] = useState(8);
  const [showGridLines, setShowGridLines] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#0a0a0a");

  // ----- Palette -----
  const [palette, setPalette] = useState<string[]>([
    "#000000", // index 0 (reserved as empty)
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#feca57",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
  ]);
  const [customColor, setCustomColor] = useState("#ffffff");
  const [selectedColor, setSelectedColor] = useState(1); // used by some patterns as seed color
  const [generativeColorIndices, setGenerativeColorIndices] = useState<number[]>(
    () => palette.slice(1).map((_, i) => i + 1)
  );

  // ----- Image upload / conversion -----
  const [sourceImgUrl, setSourceImgUrl] = useState<string | null>(null);
  const [targetRows, setTargetRows] = useState(160);
  const [alphaThreshold, setAlphaThreshold] = useState(20); // 0-255: below => empty cell
  const [brightnessThreshold, setBrightnessThreshold] = useState(0); // 0-255: below => empty cell
  const [keepAspect, setKeepAspect] = useState(true);
  const [useDither, setUseDither] = useState(false);
  const [convertedBaseline, setConvertedBaseline] = useState<number[][] | null>(
    null
  ); // for reset

  // ----- Generative spread settings -----
  const [spreadPattern, setSpreadPattern] = useState<SpreadPattern>("random");
  const [spreadProbability, setSpreadProbability] = useState(0.2);
  const [autoSpreadSpeed, setAutoSpreadSpeed] = useState(3); // steps per second (most patterns)
  const [pulseSpeed, setPulseSpeed] = useState(10); // steps/sec only for "pulse"
  const [autoSpreading, setAutoSpreading] = useState(false);

  // Pattern-specific controls
  const [directionalBias, setDirectionalBias] = useState<Direction | "none">(
    "down"
  );
  const [directionalBiasStrength, setDirectionalBiasStrength] = useState(0.8);
  const [pulseOvertakes, setPulseOvertakes] = useState(true);
  const [pulseDirection, setPulseDirection] =
    useState<Direction>("bottom-right");
  const [randomWalkSpreadCount, setRandomWalkSpreadCount] = useState(1);
  const [randomWalkMode, setRandomWalkMode] = useState<"any" | "cardinal">(
    "any"
  );
  const [conwayRules, setConwayRules] = useState({ born: [3], survive: [2, 3] });
  const [tendrilsRules, setTendrilsRules] = useState({
    born: [1],
    survive: [1, 2],
  });
  const [veinSeekStrength, setVeinSeekStrength] = useState(0.5);
  const [veinBranchChance, setVeinBranchChance] = useState(0.1);
  const [crystallizeThreshold, setCrystallizeThreshold] = useState(2);
  const [erosionRate, setErosionRate] = useState(0.5);
  const [erosionSolidity, setErosionSolidity] = useState(3);
  const [flowDirection, setFlowDirection] = useState<Direction>("down");
  const [flowChance, setFlowChance] = useState(0.5);
  const [jitterChance, setJitterChance] = useState(0.3);
  const [vortexCount, setVortexCount] = useState(5);
  const [strobeExpandThreshold, setStrobeExpandThreshold] = useState(2);
  const [strobeContractThreshold, setStrobeContractThreshold] = useState(3);
  const [scrambleSwaps, setScrambleSwaps] = useState(10);
  const [rippleChance, setRippleChance] = useState(0.05);

  // ----- Refs to avoid stale closures -----
  const rowsRef = useRef(rows);
  const colsRef = useRef(cols);
  const spreadPatternRef = useRef(spreadPattern);
  const pulseSpeedRef = useRef(pulseSpeed);
  const directionalBiasRef = useRef(directionalBias);
  const conwayRulesRef = useRef(conwayRules);
  const tendrilsRulesRef = useRef(tendrilsRules);
  const directionalBiasStrengthRef = useRef(directionalBiasStrength);
  const pulseOvertakesRef = useRef(pulseOvertakes);
  const pulseDirectionRef = useRef(pulseDirection);
  const randomWalkSpreadCountRef = useRef(randomWalkSpreadCount);
  const randomWalkModeRef = useRef(randomWalkMode);
  const veinSeekStrengthRef = useRef(veinSeekStrength);
  const veinBranchChanceRef = useRef(veinBranchChance);
  const crystallizeThresholdRef = useRef(crystallizeThreshold);
  const erosionRateRef = useRef(erosionRate);
  const erosionSolidityRef = useRef(erosionSolidity);
  const flowDirectionRef = useRef(flowDirection);
  const flowChanceRef = useRef(flowChance);
  const jitterChanceRef = useRef(jitterChance);
  const vortexCountRef = useRef(vortexCount);
  const strobeExpandThresholdRef = useRef(strobeExpandThreshold);
  const strobeContractThresholdRef = useRef(strobeContractThreshold);
  const scrambleSwapsRef = useRef(scrambleSwaps);
  const rippleChanceRef = useRef(rippleChance);
  const spreadProbabilityRef = useRef(spreadProbability);
  const autoSpreadSpeedRef = useRef(autoSpreadSpeed);
  const runningRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Additional pattern state
  const walkersRef = useRef<{ r: number; c: number; color: number }[]>([]);
  const strobeStateRef = useRef(true);
  const ripplesRef = useRef<
    { r: number; c: number; color: number; radius: number; maxRadius: number }[]
  >([]);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);
  useEffect(() => {
    colsRef.current = cols;
  }, [cols]);
  useEffect(() => {
    spreadPatternRef.current = spreadPattern;
  }, [spreadPattern]);
  useEffect(() => {
    pulseSpeedRef.current = pulseSpeed;
  }, [pulseSpeed]);
  useEffect(() => {
    directionalBiasRef.current = directionalBias;
  }, [directionalBias]);
  useEffect(() => {
    conwayRulesRef.current = conwayRules;
  }, [conwayRules]);
  useEffect(() => {
    tendrilsRulesRef.current = tendrilsRules;
  }, [tendrilsRules]);
  useEffect(() => {
    directionalBiasStrengthRef.current = directionalBiasStrength;
  }, [directionalBiasStrength]);
  useEffect(() => {
    pulseOvertakesRef.current = pulseOvertakes;
  }, [pulseOvertakes]);
  useEffect(() => {
    pulseDirectionRef.current = pulseDirection;
  }, [pulseDirection]);
  useEffect(() => {
    randomWalkSpreadCountRef.current = randomWalkSpreadCount;
  }, [randomWalkSpreadCount]);
  useEffect(() => {
    randomWalkModeRef.current = randomWalkMode;
  }, [randomWalkMode]);
  useEffect(() => {
    veinSeekStrengthRef.current = veinSeekStrength;
  }, [veinSeekStrength]);
  useEffect(() => {
    veinBranchChanceRef.current = veinBranchChance;
  }, [veinBranchChance]);
  useEffect(() => {
    crystallizeThresholdRef.current = crystallizeThreshold;
  }, [crystallizeThreshold]);
  useEffect(() => {
    erosionRateRef.current = erosionRate;
  }, [erosionRate]);
  useEffect(() => {
    erosionSolidityRef.current = erosionSolidity;
  }, [erosionSolidity]);
  useEffect(() => {
    flowDirectionRef.current = flowDirection;
  }, [flowDirection]);
  useEffect(() => {
    flowChanceRef.current = flowChance;
  }, [flowChance]);
  useEffect(() => {
    jitterChanceRef.current = jitterChance;
  }, [jitterChance]);
  useEffect(() => {
    vortexCountRef.current = vortexCount;
  }, [vortexCount]);
  useEffect(() => {
    strobeExpandThresholdRef.current = strobeExpandThreshold;
  }, [strobeExpandThreshold]);
  useEffect(() => {
    strobeContractThresholdRef.current = strobeContractThreshold;
  }, [strobeContractThreshold]);
  useEffect(() => {
    scrambleSwapsRef.current = scrambleSwaps;
  }, [scrambleSwaps]);
  useEffect(() => {
    rippleChanceRef.current = rippleChance;
  }, [rippleChance]);
  useEffect(() => {
    spreadProbabilityRef.current = spreadProbability;
  }, [spreadProbability]);
  useEffect(() => {
    autoSpreadSpeedRef.current = autoSpreadSpeed;
  }, [autoSpreadSpeed]);

  // ----- Draw -----
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = grid[r]?.[c] ?? 0;
        if (idx > 0) {
          ctx.fillStyle = idx === palette.length ? customColor : palette[idx];
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }

    if (showGridLines) {
      ctx.strokeStyle = GRID_LINE;
      ctx.lineWidth = 0.5;
      // Vertical
      for (let x = 0; x <= cols * cellSize; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x + 0.25, 0);
        ctx.lineTo(x + 0.25, rows * cellSize);
        ctx.stroke();
      }
      // Horizontal
      for (let y = 0; y <= rows * cellSize; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.25);
        ctx.lineTo(cols * cellSize, y + 0.25);
        ctx.stroke();
      }
    }
  }, [grid, rows, cols, cellSize, backgroundColor, showGridLines, palette, customColor]);

  useEffect(() => {
    draw();
  }, [draw]);

  // ----- Image -> grid conversion -----
  const convertImageToGrid = useCallback(
    async (imgUrl: string) => {
      // Load the image
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = imgUrl;
      });

      const srcW = img.width;
      const srcH = img.height;
      const targetR = clamp(Math.floor(targetRows), 4, 2000);
      const targetC = keepAspect
        ? Math.max(1, Math.round((targetR * srcW) / srcH))
        : cols;

      // Prepare source pixels
      const off = document.createElement("canvas");
      off.width = srcW;
      off.height = srcH;
      const octx = off.getContext("2d")!;
      octx.drawImage(img, 0, 0);
      const data = octx.getImageData(0, 0, srcW, srcH).data;

      // Helper to sample a source pixel at target cell center
      const sampleAt = (r: number, c: number) => {
        const sy = Math.floor(((r + 0.5) / targetR) * srcH);
        const sx = Math.floor(((c + 0.5) / targetC) * srcW);
        const idx = (sy * srcW + sx) * 4;
        const R = data[idx + 0];
        const G = data[idx + 1];
        const B = data[idx + 2];
        const A = data[idx + 3];
        return { R, G, B, A };
      };

      const newGrid = createEmptyGrid(targetR, targetC);

      // Build the quantization palette (1..N-1 plus custom color at N)
      const paletteRGB = palette.slice(1).map(parseHexColor);
      const customRGB = parseHexColor(customColor);
      paletteRGB.push(customRGB); // will map to index == palette.length

      const nearestIndexWithCustom = (r: number, g: number, b: number) => {
        let bestIdx = 1;
        let bestDist = Infinity;
        // indices 1..palette.length-1 correspond to paletteRGB[0..N-2]
        for (let i = 0; i < paletteRGB.length; i++) {
          const pr = paletteRGB[i].r;
          const pg = paletteRGB[i].g;
          const pb = paletteRGB[i].b;
          const d = (pr - r) * (pr - r) + (pg - g) * (pg - g) + (pb - b) * (pb - b);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i + 1; // shift by 1
          }
        }
        return bestIdx; // 1..palette.length
      };

      if (!useDither) {
        // Simple center sampling + nearest palette mapping + thresholds
        for (let r = 0; r < targetR; r++) {
          for (let c = 0; c < targetC; c++) {
            const { R, G, B, A } = sampleAt(r, c);
            const bright = luma(R, G, B);
            if (A <= alphaThreshold || bright <= brightnessThreshold) {
              newGrid[r][c] = 0;
            } else {
              newGrid[r][c] = nearestIndexWithCustom(R, G, B);
            }
          }
        }
      } else {
        // Floyd–Steinberg error diffusion dithering across the target grid
        // We diffuse error in target grid space (cell-by-cell) using the
        // center-sampled color as a base.
        const w = targetC;
        const h = targetR;

        // +2 for safe indexing (we use cc=c+1 trick)
        let errR = new Float32Array(w + 2).fill(0);
        let errG = new Float32Array(w + 2).fill(0);
        let errB = new Float32Array(w + 2).fill(0);
        let nextR = new Float32Array(w + 2).fill(0);
        let nextG = new Float32Array(w + 2).fill(0);
        let nextB = new Float32Array(w + 2).fill(0);

        for (let r = 0; r < h; r++) {
          // clear next-row error buffers
          nextR.fill(0);
          nextG.fill(0);
          nextB.fill(0);

          for (let c = 0; c < w; c++) {
            const cc = c + 1; // shifted index to allow cc-1
            const { R, G, B, A } = sampleAt(r, c);

            // Decide empty (alpha/brightness) based on original sample
            const bright = luma(R, G, B);
            if (A <= alphaThreshold || bright <= brightnessThreshold) {
              newGrid[r][c] = 0;
              // We do not diffuse error for empty cells to avoid smearing
              continue;
            }

            // Apply carried error to the sample
            let rC = clamp(Math.round(R + errR[cc]), 0, 255);
            let gC = clamp(Math.round(G + errG[cc]), 0, 255);
            let bC = clamp(Math.round(B + errB[cc]), 0, 255);

            // Quantize to nearest palette (including custom color)
            const idx = nearestIndexWithCustom(rC, gC, bC);
            newGrid[r][c] = idx;

            const q = idx === palette.length ? customRGB : paletteRGB[idx - 1];
            const eR = rC - q.r;
            const eG = gC - q.g;
            const eB = bC - q.b;

            // Distribute error:
            //   right        : 7/16
            //   down-left    : 3/16
            //   down         : 5/16
            //   down-right   : 1/16
            errR[cc + 1] += eR * (7 / 16);
            errG[cc + 1] += eG * (7 / 16);
            errB[cc + 1] += eB * (7 / 16);

            nextR[cc - 1] += eR * (3 / 16);
            nextG[cc - 1] += eG * (3 / 16);
            nextB[cc - 1] += eB * (3 / 16);

            nextR[cc] += eR * (5 / 16);
            nextG[cc] += eG * (5 / 16);
            nextB[cc] += eB * (5 / 16);

            nextR[cc + 1] += eR * (1 / 16);
            nextG[cc + 1] += eG * (1 / 16);
            nextB[cc + 1] += eB * (1 / 16);
          }

          // move to next row
          errR = nextR.slice();
          errG = nextG.slice();
          errB = nextB.slice();
        }
      }

      setRows(targetR);
      setCols(targetC);
      setGrid(newGrid);
      setConvertedBaseline(cloneGrid(newGrid));
    },
    [alphaThreshold, brightnessThreshold, keepAspect, palette, customColor, cols, targetRows, useDither]
  );

  // ----- Spread logic (ported & adapted) -----
  const colorSpread = useCallback(() => {
    const currentRows = rowsRef.current;
    const currentCols = colsRef.current;
    const pattern = spreadPatternRef.current;

    setGrid((g) => {
      let ng = cloneGrid(g);

      switch (pattern) {
        case "ripple": {
          // advance existing ripples
          ripplesRef.current.forEach((rpl) => {
            const rad = Math.round(rpl.radius);
            for (let i = 0; i < 360; i += 5) {
              const ang = (i * Math.PI) / 180;
              const nr = Math.round(rpl.r + rad * Math.sin(ang));
              const nc = Math.round(rpl.c + rad * Math.cos(ang));
              if (
                nr >= 0 &&
                nr < currentRows &&
                nc >= 0 &&
                nc < currentCols &&
                ng[nr][nc] === 0
              ) {
                ng[nr][nc] = rpl.color;
              }
            }
            rpl.radius += 0.5;
          });
          ripplesRef.current = ripplesRef.current.filter(
            (r) => r.radius <= Math.max(currentRows, currentCols) / 3
          );

          const chance = rippleChanceRef.current;
          for (let r = 0; r < currentRows; r++) {
            for (let c = 0; c < currentCols; c++) {
              if (g[r][c] > 0 && Math.random() < chance) {
                ripplesRef.current.push({
                  r,
                  c,
                  color: g[r][c],
                  radius: 1,
                  maxRadius: Math.max(currentRows, currentCols) / 3,
                });
              }
            }
          }
          break;
        }
        case "scramble": {
          const colored: { r: number; c: number; color: number }[] = [];
          for (let r = 0; r < currentRows; r++) {
            for (let c = 0; c < currentCols; c++) {
              const val = g[r][c];
              if (val > 0) colored.push({ r, c, color: val });
            }
          }
          if (colored.length >= 2) {
            const swaps = Math.min(
              scrambleSwapsRef.current,
              Math.floor(colored.length / 2)
            );
            for (let i = 0; i < swaps; i++) {
              const i1 = Math.floor(Math.random() * colored.length);
              let i2 = Math.floor(Math.random() * colored.length);
              while (i2 === i1) i2 = Math.floor(Math.random() * colored.length);
              const a = colored[i1];
              const b = colored[i2];
              const tmp = ng[a.r][a.c];
              ng[a.r][a.c] = ng[b.r][b.c];
              ng[b.r][b.c] = tmp;
            }
          }
          break;
        }
        case "vortex": {
          const count = vortexCountRef.current;
          for (let i = 0; i < count; i++) {
            const r = 1 + Math.floor(Math.random() * (currentRows - 2));
            const c = 1 + Math.floor(Math.random() * (currentCols - 2));
            const nb = [
              [r - 1, c - 1],
              [r - 1, c],
              [r - 1, c + 1],
              [r, c + 1],
              [r + 1, c + 1],
              [r + 1, c],
              [r + 1, c - 1],
              [r, c - 1],
            ] as const;
            const originals = nb.map(([nr, nc]) => g[nr][nc]);
            nb.forEach(([nr, nc], idx) => {
              const source = (idx + 7) % 8;
              ng[nr][nc] = originals[source];
            });
          }
          break;
        }
        case "strobe": {
          strobeStateRef.current = !strobeStateRef.current;
          if (strobeStateRef.current) {
            // EXPAND
            const th = strobeExpandThresholdRef.current;
            const toColor = new Map<string, number>();
            for (let r = 0; r < currentRows; r++) {
              for (let c = 0; c < currentCols; c++) {
                if (g[r][c] === 0) {
                  const neighborColors: number[] = [];
                  for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                      if (dr === 0 && dc === 0) continue;
                      const nr = r + dr;
                      const nc = c + dc;
                      if (
                        nr >= 0 &&
                        nr < currentRows &&
                        nc >= 0 &&
                        nc < currentCols &&
                        g[nr][nc] > 0
                      ) {
                        neighborColors.push(g[nr][nc]);
                      }
                    }
                  }
                  if (neighborColors.length >= th) {
                    const counts: Record<number, number> = {};
                    neighborColors.forEach((n) => (counts[n] = (counts[n] || 0) + 1));
                    let dom = 0;
                    let max = 0;
                    for (const color in counts) {
                      const k = parseInt(color);
                      if (counts[k] > max) {
                        max = counts[k];
                        dom = k;
                      }
                    }
                    if (dom > 0) toColor.set(`${r},${c}`, dom);
                  }
                }
              }
            }
            toColor.forEach((color, key) => {
              const [r, c] = key.split(",").map(Number);
              ng[r][c] = color;
            });
          } else {
            // CONTRACT
            const th = strobeContractThresholdRef.current;
            for (let r = 0; r < currentRows; r++) {
              for (let c = 0; c < currentCols; c++) {
                if (g[r][c] > 0) {
                  let emptyN = 0;
                  for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                      if (dr === 0 && dc === 0) continue;
                      const nr = r + dr;
                      const nc = c + dc;
                      if (
                        nr < 0 ||
                        nr >= currentRows ||
                        nc < 0 ||
                        nc >= currentCols ||
                        g[nr][nc] === 0
                      ) {
                        emptyN++;
                      }
                    }
                  }
                  if (emptyN >= th) ng[r][c] = 0;
                }
              }
            }
          }
          break;
        }
        case "jitter": {
          const changes = new Map<string, number>();
          const empties = new Set<string>();
          const chance = jitterChanceRef.current;
          for (let r = 0; r < currentRows; r++) {
            for (let c = 0; c < currentCols; c++) {
              const color = g[r]?.[c];
              if (color > 0 && Math.random() < chance) {
                const emptyNeighbors: { nr: number; nc: number }[] = [];
                for (let dr = -1; dr <= 1; dr++) {
                  for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (
                      nr >= 0 &&
                      nr < currentRows &&
                      nc >= 0 &&
                      nc < currentCols &&
                      g[nr][nc] === 0
                    ) {
                      emptyNeighbors.push({ nr, nc });
                    }
                  }
                }
                if (emptyNeighbors.length > 0) {
                  const t = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
                  const key = `${t.nr},${t.nc}`;
                  if (!changes.has(key) && !empties.has(`${r},${c}`)) {
                    changes.set(key, color);
                    empties.add(`${r},${c}`);
                  }
                }
              }
            }
          }
          // apply
          empties.forEach((key) => {
            const [r, c] = key.split(",").map(Number);
            if (!changes.has(key)) ng[r][c] = 0;
          });
          changes.forEach((color, key) => {
            const [r, c] = key.split(",").map(Number);
            ng[r][c] = color;
          });
          break;
        }
        case "flow": {
          const changes = new Map<string, number>();
          const empties = new Set<string>();
          const dir = flowDirectionRef.current;
          const chance = flowChanceRef.current;
          let rStart = 0,
            rEnd = currentRows,
            rInc = 1;
          let cStart = 0,
            cEnd = currentCols,
            cInc = 1;

          if (dir.includes("down")) {
            rStart = currentRows - 1;
            rEnd = -1;
            rInc = -1;
          }
          if (dir.includes("right")) {
            cStart = currentCols - 1;
            cEnd = -1;
            cInc = -1;
          }

          for (let r = rStart; r !== rEnd; r += rInc) {
            for (let c = cStart; c !== cEnd; c += cInc) {
              const color = g[r]?.[c];
              if (color > 0 && Math.random() < chance) {
                let dr = 0,
                  dc = 0;
                if (dir.includes("up")) dr = -1;
                if (dir.includes("down")) dr = 1;
                if (dir.includes("left")) dc = -1;
                if (dir.includes("right")) dc = 1;
                const nr = r + dr;
                const nc = c + dc;
                if (
                  nr >= 0 &&
                  nr < currentRows &&
                  nc >= 0 &&
                  nc < currentCols &&
                  g[nr][nc] === 0
                ) {
                  if (!changes.has(`${nr},${nc}`)) {
                    changes.set(`${nr},${nc}`, color);
                    empties.add(`${r},${c}`);
                  }
                }
              }
            }
          }
          // apply
          empties.forEach((key) => {
            const [r, c] = key.split(",").map(Number);
            if (!changes.has(key)) ng[r][c] = 0;
          });
          changes.forEach((color, key) => {
            const [r, c] = key.split(",").map(Number);
            ng[r][c] = color;
          });
          break;
        }
        case "vein": {
          if (walkersRef.current.length === 0) {
            for (let r = 0; r < currentRows; r++) {
              for (let c = 0; c < currentCols; c++) {
                if (g[r][c] > 0 && Math.random() < 0.1) {
                  walkersRef.current.push({ r, c, color: g[r][c] });
                }
              }
            }
            if (
              walkersRef.current.length === 0 &&
              g.flat().some((cell) => cell > 0)
            ) {
              let r = 0,
                c = 0;
              while (g[r][c] === 0) {
                r = Math.floor(Math.random() * currentRows);
                c = Math.floor(Math.random() * currentCols);
              }
              walkersRef.current.push({ r, c, color: g[r][c] });
            }
          }

          const food: { r: number; c: number }[] = [];
          for (let r = 0; r < currentRows; r++) {
            for (let c = 0; c < currentCols; c++) {
              if (g[r][c] > 0) food.push({ r, c });
            }
          }

          walkersRef.current.forEach((w) => {
            let best = { dr: 0, dc: 0 };
            let bestDist = Infinity;
            if (food.length > 0 && Math.random() < veinSeekStrengthRef.current) {
              food.forEach((f) => {
                const d = Math.hypot(w.r - f.r, w.c - f.c);
                if (d < bestDist && d > 1) {
                  bestDist = d;
                  best = { dr: Math.sign(f.r - w.r), dc: Math.sign(f.c - w.c) };
                }
              });
            } else {
              best = {
                dr: Math.floor(Math.random() * 3) - 1,
                dc: Math.floor(Math.random() * 3) - 1,
              };
            }
            w.r = clamp(w.r + best.dr, 0, currentRows - 1);
            w.c = clamp(w.c + best.dc, 0, currentCols - 1);
            ng[Math.round(w.r)][Math.round(w.c)] = w.color;
            if (Math.random() < veinBranchChanceRef.current) {
              walkersRef.current.push({ ...w });
            }
          });
          walkersRef.current = walkersRef.current.slice(0, 200);
          break;
        }
        case "crystallize": {
          for (let r = 0; r < currentRows; r++) {
            for (let c = 0; c < currentCols; c++) {
              if (g[r][c] === 0) {
                const neighbors: number[] = [];
                for (let dr = -1; dr <= 1; dr++) {
                  for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (
                      nr >= 0 &&
                      nr < currentRows &&
                      nc >= 0 &&
                      nc < currentCols &&
                      g[nr][nc] > 0
                    ) {
                      neighbors.push(g[nr][nc]);
                    }
                  }
                }
                if (neighbors.length > 0) {
                  const counts: Record<number, number> = {};
                  neighbors.forEach((n) => (counts[n] = (counts[n] || 0) + 1));
                  for (const color in counts) {
                    const k = parseInt(color);
                    if (counts[k] >= crystallizeThresholdRef.current) {
                      ng[r][c] = k;
                      break;
                    }
                  }
                }
              }
            }
          }
          break;
        }
        case "erosion": {
          for (let r = 0; r < currentRows; r++) {
            for (let c = 0; c < currentCols; c++) {
              if (g[r][c] > 0 && Math.random() < erosionRateRef.current) {
                let emptyN = 0;
                for (let dr = -1; dr <= 1; dr++) {
                  for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (
                      nr < 0 ||
                      nr >= currentRows ||
                      nc < 0 ||
                      nc >= currentCols ||
                      g[nr][nc] === 0
                    ) {
                      emptyN++;
                    }
                  }
                }
                if (emptyN >= erosionSolidityRef.current) ng[r][c] = 0;
              }
            }
          }
          break;
        }
        case "tendrils":
        case "conway": {
          const rules =
            pattern === "conway" ? conwayRulesRef.current : tendrilsRulesRef.current;
          const B = rules.born;
          const S = rules.survive;
          for (let r = 0; r < currentRows; r++) {
            for (let c = 0; c < currentCols; c++) {
              let live = 0;
              const colors: number[] = [];
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  if (dr === 0 && dc === 0) continue;
                  const nr = r + dr;
                  const nc = c + dc;
                  if (
                    nr >= 0 &&
                    nr < currentRows &&
                    nc >= 0 &&
                    nc < currentCols &&
                    g[nr]?.[nc] > 0
                  ) {
                    live++;
                    colors.push(g[nr][nc]);
                  }
                }
              }
              const alive = g[r]?.[c] > 0;
              if (alive && !S.includes(live)) {
                ng[r][c] = 0;
              } else if (!alive && B.includes(live)) {
                const counts: Record<number, number> = {};
                colors.forEach((n) => (counts[n] = (counts[n] || 0) + 1));
                let dom = 0;
                let max = 0;
                for (const color in counts) {
                  const k = parseInt(color);
                  if (counts[k] > max) {
                    max = counts[k];
                    dom = k;
                  }
                }
                ng[r][c] = dom > 0 ? dom : (generativeColorIndices[0] ?? selectedColor);
              }
            }
          }
          break;
        }
        case "pulse": {
          const changes = new Map<string, number>();
          const dir = pulseDirectionRef.current;
          let rStart = 0,
            rEnd = currentRows,
            rInc = 1;
          let cStart = 0,
            cEnd = currentCols,
            cInc = 1;

          switch (dir) {
            case "up":
              rStart = currentRows - 1;
              rEnd = -1;
              rInc = -1;
              break;
            case "left":
              cStart = currentCols - 1;
              cEnd = -1;
              cInc = -1;
              break;
            case "top-left":
              rStart = currentRows - 1;
              rEnd = -1;
              rInc = -1;
              cStart = currentCols - 1;
              cEnd = -1;
              cInc = -1;
              break;
            case "top-right":
              rStart = currentRows - 1;
              rEnd = -1;
              rInc = -1;
              break;
            case "bottom-left":
              cStart = currentCols - 1;
              cEnd = -1;
              cInc = -1;
              break;
            // down/right/bottom-right use defaults
          }

          for (let r = rStart; r !== rEnd; r += rInc) {
            for (let c = cStart; c !== cEnd; c += cInc) {
              const currentColor = g[r]?.[c];
              if (currentColor > 0) {
                for (let dr = -1; dr <= 1; dr++) {
                  for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (
                      nr >= 0 &&
                      nr < currentRows &&
                      nc >= 0 &&
                      nc < currentCols &&
                      (g[nr]?.[nc] === 0 || pulseOvertakesRef.current)
                    ) {
                      changes.set(`${nr},${nc}`, currentColor);
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
          break;
        }
        case "random": {
          // random walk spread
          for (let r = 0; r < currentRows; r++) {
            for (let c = 0; c < currentCols; c++) {
              const val = g[r]?.[c];
              if (!val) continue;
              if (Math.random() < spreadProbabilityRef.current) {
                const mode = randomWalkModeRef.current;
                const neighbors: { r: number; c: number }[] = [];
                for (let dr = -1; dr <= 1; dr++) {
                  for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    if (mode === "cardinal" && dr !== 0 && dc !== 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (
                      nr >= 0 &&
                      nr < currentRows &&
                      nc >= 0 &&
                      nc < currentCols
                    ) {
                      neighbors.push({ r: nr, c: nc });
                    }
                  }
                }
                // shuffle & paint N neighbors
                for (let i = neighbors.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  const tmp = neighbors[i];
                  neighbors[i] = neighbors[j];
                  neighbors[j] = tmp;
                }
                const count = randomWalkSpreadCountRef.current;
                for (let i = 0; i < Math.min(count, neighbors.length); i++) {
                  const n = neighbors[i];
                  ng[n.r][n.c] = val;
                }
              }
            }
          }
          break;
        }
        case "directional": {
          for (let r = 0; r < currentRows; r++) {
            for (let c = 0; c < currentCols; c++) {
              const val = g[r]?.[c];
              if (!val) continue;
              if (Math.random() < spreadProbabilityRef.current) {
                const neighbors: { r: number; c: number }[] = [];
                for (let dr = -1; dr <= 1; dr++) {
                  for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (
                      nr >= 0 &&
                      nr < currentRows &&
                      nc >= 0 &&
                      nc < currentCols
                    ) {
                      neighbors.push({ r: nr, c: nc });
                    }
                  }
                }
                if (
                  directionalBiasRef.current !== "none" &&
                  Math.random() < directionalBiasStrengthRef.current
                ) {
                  const bias = directionalBiasRef.current;
                  let dr = 0,
                    dc = 0;
                  switch (bias) {
                    case "up":
                      dr = -1;
                      break;
                    case "down":
                      dr = 1;
                      break;
                    case "left":
                      dc = -1;
                      break;
                    case "right":
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
                  const nr = r + dr;
                  const nc = c + dc;
                  if (
                    nr >= 0 &&
                    nr < currentRows &&
                    nc >= 0 &&
                    nc < currentCols
                  ) {
                    ng[nr][nc] = val;
                    continue;
                  }
                }
                if (neighbors.length) {
                  const n = neighbors[Math.floor(Math.random() * neighbors.length)];
                  ng[n.r][n.c] = val;
                }
              }
            }
          }
          break;
        }
      }

      return ng;
    });
  }, [generativeColorIndices, selectedColor]);

  // ----- Auto spread loop -----
  const runAutoSpread = useCallback(() => {
    runningRef.current = true;
    setAutoSpreading(true);
    let last = performance.now();
    const loop = (t: number) => {
      if (!runningRef.current) return;
      const speed =
        spreadPatternRef.current === "pulse"
          ? pulseSpeedRef.current
          : autoSpreadSpeedRef.current;
      const interval = 1000 / Math.max(0.25, speed);
      if (t - last >= interval) {
        colorSpread();
        last = t;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [colorSpread]);

  const stopAutoSpread = useCallback(() => {
    runningRef.current = false;
    setAutoSpreading(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  // ----- UI actions -----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setSourceImgUrl(url);
  };
  const handleConvert = async () => {
    if (sourceImgUrl) await convertImageToGrid(sourceImgUrl);
  };
  const handleResetToImage = () => {
    if (convertedBaseline) setGrid(cloneGrid(convertedBaseline));
  };
  const handleStep = () => {
    colorSpread();
  };
  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "grid-art.png";
    a.click();
  };

  // ----- Layout -----
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#000",
        display: "flex",
        flexDirection: "row",
        color: "#fff",
      }}
    >
      {/* Settings Panel (fixed width on the left) */}
      <aside
        style={{
          width: 360,
          maxWidth: "42vw",
          padding: 16,
          boxSizing: "border-box",
          background: "rgba(39,39,42,0.95)",
          borderRight: "1px solid #1f2937",
          overflowY: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 12px 0", fontWeight: 600, fontSize: 18 }}>
          Image → Grid Painter
        </h2>

        {/* Upload */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: "block", marginBottom: 6, fontSize: 14, opacity: 0.9 }}
          >
            Upload image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <button
              onClick={handleConvert}
              disabled={!sourceImgUrl}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                background: sourceImgUrl ? "#3a3a3c" : "#52525b",
                border: "none",
                color: "#fff",
                cursor: sourceImgUrl ? "pointer" : "not-allowed",
              }}
            >
              Convert to grid
            </button>
            <button
              onClick={handleResetToImage}
              disabled={!convertedBaseline}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                background: convertedBaseline ? "#3a3a3c" : "#52525b",
                border: "none",
                color: "#fff",
                cursor: convertedBaseline ? "pointer" : "not-allowed",
              }}
            >
              Reset to image
            </button>
            <button
              onClick={handleExportPng}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                background: "#3a3a3c",
                border: "none",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Export PNG
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 60px",
              gap: 8,
              marginTop: 10,
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: 13, opacity: 0.9 }}>Target rows</label>
            <input
              type="number"
              value={targetRows}
              min={4}
              max={2000}
              onChange={(e) => setTargetRows(parseInt(e.target.value || "0", 10))}
              style={{ width: 60, padding: "4px 6px", borderRadius: 6, border: "1px solid #555", background: "#222", color: "#fff" }}
            />
            <input
              type="range"
              min={4}
              max={2000}
              value={targetRows}
              onChange={(e) => setTargetRows(parseInt(e.target.value, 10))}
              style={{ gridColumn: "1 / span 2" }}
            />

            <label style={{ fontSize: 13, opacity: 0.9 }}>Alpha threshold</label>
            <input
              type="number"
              value={alphaThreshold}
              min={0}
              max={255}
              onChange={(e) =>
                setAlphaThreshold(clamp(parseInt(e.target.value || "0", 10), 0, 255))
              }
              style={{ width: 60, padding: "4px 6px", borderRadius: 6, border: "1px solid #555", background: "#222", color: "#fff" }}
            />
            <input
              type="range"
              min={0}
              max={255}
              value={alphaThreshold}
              onChange={(e) => setAlphaThreshold(parseInt(e.target.value, 10))}
              style={{ gridColumn: "1 / span 2" }}
            />

            <label style={{ fontSize: 13, opacity: 0.9 }}>Brightness threshold</label>
            <input
              type="number"
              value={brightnessThreshold}
              min={0}
              max={255}
              onChange={(e) =>
                setBrightnessThreshold(clamp(parseInt(e.target.value || "0", 10), 0, 255))
              }
              style={{ width: 60, padding: "4px 6px", borderRadius: 6, border: "1px solid #555", background: "#222", color: "#fff" }}
            />
            <input
              type="range"
              min={0}
              max={255}
              value={brightnessThreshold}
              onChange={(e) => setBrightnessThreshold(parseInt(e.target.value, 10))}
              style={{ gridColumn: "1 / span 2" }}
            />

            <label style={{ fontSize: 13, opacity: 0.9 }}>Keep aspect ratio</label>
            <input
              type="checkbox"
              checked={keepAspect}
              onChange={(e) => setKeepAspect(e.target.checked)}
            />

            <label style={{ fontSize: 13, opacity: 0.9 }}>Dither on convert</label>
            <input
              type="checkbox"
              checked={useDither}
              onChange={(e) => setUseDither(e.target.checked)}
            />
          </div>
        </div>

        {/* Canvas display settings */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px", gap: 8 }}>
            <label style={{ fontSize: 13, opacity: 0.9 }}>Cell size (px)</label>
            <input
              type="number"
              value={cellSize}
              min={2}
              max={40}
              onChange={(e) =>
                setCellSize(clamp(parseInt(e.target.value || "0", 10), 2, 40))
              }
              style={{ width: 60, padding: "4px 6px", borderRadius: 6, border: "1px solid #555", background: "#222", color: "#fff" }}
            />
            <input
              type="range"
              min={2}
              max={40}
              value={cellSize}
              onChange={(e) => setCellSize(parseInt(e.target.value, 10))}
              style={{ gridColumn: "1 / span 2" }}
            />

            <label style={{ fontSize: 13, opacity: 0.9 }}>Show grid lines</label>
            <input
              type="checkbox"
              checked={showGridLines}
              onChange={(e) => setShowGridLines(e.target.checked)}
            />
          </div>
        </div>

        {/* Palette editor (simple) */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {palette.slice(1).map((color, i) => (
              <button
                key={i + 1}
                title={`Select ${color}`}
                onClick={() => setSelectedColor(i + 1)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: selectedColor === i + 1 ? "2px solid #fff" : "1px solid #666",
                  background: color,
                  cursor: "pointer",
                }}
              />
            ))}
            <div
              title="Custom color"
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: selectedColor === palette.length ? "2px solid #fff" : "1px solid #666",
                overflow: "hidden",
                position: "relative",
              }}
              onClick={() => setSelectedColor(palette.length)}
            >
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                style={{ width: 40, height: 40, position: "absolute", top: -6, left: -6, border: "none", padding: 0, background: "transparent", cursor: "pointer" }}
              />
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
            Selected color index: {selectedColor}
          </div>
        </div>

        {/* Spread controls */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
            Spread settings
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select
              value={spreadPattern}
              onChange={(e) => setSpreadPattern(e.target.value as SpreadPattern)}
              style={{ gridColumn: "1 / span 2", padding: "6px 8px", borderRadius: 8, background: "#222", color: "#fff", border: "1px solid #555" }}
            >
              {[
                "random",
                "conway",
                "pulse",
                "directional",
                "tendrils",
                "vein",
                "crystallize",
                "erosion",
                "flow",
                "jitter",
                "vortex",
                "strobe",
                "scramble",
                "ripple",
              ].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <div style={{ gridColumn: "1 / span 2" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 60px", gap: 8, alignItems: "center" }}>
                <label style={{ fontSize: 13, opacity: 0.9 }}>
                  {spreadPattern === "pulse" ? "Pulse speed" : "Spread speed"} (steps/s)
                </label>
                <input
                  type="number"
                  min={0.25}
                  step={0.25}
                  value={spreadPattern === "pulse" ? pulseSpeed : autoSpreadSpeed}
                  onChange={(e) =>
                    spreadPattern === "pulse"
                      ? setPulseSpeed(parseFloat(e.target.value || "0"))
                      : setAutoSpreadSpeed(parseFloat(e.target.value || "0"))
                  }
                  style={{ width: 60, padding: "4px 6px", borderRadius: 6, border: "1px solid #555", background: "#222", color: "#fff" }}
                />
                <input
                  type="range"
                  min={0.25}
                  max={30}
                  step={0.25}
                  value={spreadPattern === "pulse" ? pulseSpeed : autoSpreadSpeed}
                  onChange={(e) =>
                    spreadPattern === "pulse"
                      ? setPulseSpeed(parseFloat(e.target.value))
                      : setAutoSpreadSpeed(parseFloat(e.target.value))
                  }
                  style={{ gridColumn: "1 / span 2" }}
                />

                {spreadPattern === "random" || spreadPattern === "directional" ? (
                  <>
                    <label style={{ fontSize: 13, opacity: 0.9 }}>Spread probability</label>
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={spreadProbability}
                      onChange={(e) =>
                        setSpreadProbability(clamp(parseFloat(e.target.value || "0"), 0, 1))
                      }
                      style={{ width: 60, padding: "4px 6px", borderRadius: 6, border: "1px solid #555", background: "#222", color: "#fff" }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={spreadProbability}
                      onChange={(e) => setSpreadProbability(parseFloat(e.target.value))}
                      style={{ gridColumn: "1 / span 2" }}
                    />
                  </>
                ) : null}

                {spreadPattern === "directional" ? (
                  <>
                    <label style={{ fontSize: 13, opacity: 0.9 }}>Bias</label>
                    <select
                      value={directionalBias}
                      onChange={(e) =>
                        setDirectionalBias(e.target.value as Direction | "none")
                      }
                      style={{ padding: "6px 8px", borderRadius: 8, background: "#222", color: "#fff", border: "1px solid #555" }}
                    >
                      {["none","up","down","left","right","top-left","top-right","bottom-left","bottom-right"].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <label style={{ fontSize: 13, opacity: 0.9 }}>Bias strength</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={directionalBiasStrength}
                      onChange={(e) => setDirectionalBiasStrength(parseFloat(e.target.value))}
                    />
                  </>
                ) : null}

                {spreadPattern === "pulse" ? (
                  <>
                    <label style={{ fontSize: 13, opacity: 0.9 }}>Direction</label>
                    <select
                      value={pulseDirection}
                      onChange={(e) => setPulseDirection(e.target.value as Direction)}
                      style={{ padding: "6px 8px", borderRadius: 8, background: "#222", color: "#fff", border: "1px solid #555" }}
                    >
                      {["up","down","left","right","top-left","top-right","bottom-left","bottom-right"].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <label style={{ fontSize: 13, opacity: 0.9 }}>Overtake existing</label>
                    <input
                      type="checkbox"
                      checked={pulseOvertakes}
                      onChange={(e) => setPulseOvertakes(e.target.checked)}
                    />
                  </>
                ) : null}

                {spreadPattern === "random" ? (
                  <>
                    <label style={{ fontSize: 13, opacity: 0.9 }}>Neighbors per step</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={randomWalkSpreadCount}
                      onChange={(e) =>
                        setRandomWalkSpreadCount(
                          clamp(parseInt(e.target.value || "1", 10), 1, 8)
                        )
                      }
                      style={{ width: 60, padding: "4px 6px", borderRadius: 6, border: "1px solid #555", background: "#222", color: "#fff" }}
                    />
                    <label style={{ fontSize: 13, opacity: 0.9 }}>Mode</label>
                    <select
                      value={randomWalkMode}
                      onChange={(e) =>
                        setRandomWalkMode(e.target.value as "any" | "cardinal")
                      }
                      style={{ padding: "6px 8px", borderRadius: 8, background: "#222", color: "#fff", border: "1px solid #555" }}
                    >
                      <option value="any">any</option>
                      <option value="cardinal">cardinal</option>
                    </select>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {!autoSpreading ? (
              <button
                onClick={runAutoSpread}
                style={{ padding: "6px 12px", borderRadius: 8, background: "#3a3a3c", border: "none", color: "#fff", cursor: "pointer" }}
              >
                Start
              </button>
            ) : (
              <button
                onClick={stopAutoSpread}
                style={{ padding: "6px 12px", borderRadius: 8, background: "#3a3a3c", border: "none", color: "#fff", cursor: "pointer" }}
              >
                Stop
              </button>
            )}
            <button
              onClick={handleStep}
              style={{ padding: "6px 12px", borderRadius: 8, background: "#3a3a3c", border: "none", color: "#fff", cursor: "pointer" }}
            >
              Step once
            </button>
            <button
              onClick={() => setGrid(createEmptyGrid(rows, cols))}
              style={{ padding: "6px 12px", borderRadius: 8, background: "#3a3a3c", border: "none", color: "#fff", cursor: "pointer" }}
            >
              Clear grid
            </button>
          </div>
        </div>
      </aside>

      {/* Canvas region (centered) */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          minWidth: 0,
        }}
      >
        <div
          style={{
            padding: 10,
            background: "#0b0b0b",
            borderRadius: 12,
            boxShadow: "0 8px 22px rgba(0,0,0,0.35)",
            overflow: "auto",
            maxWidth: "100%",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              background: backgroundColor,
            }}
          />
          {/* Info about current grid */}
          <div
            style={{
              color: "#9ca3af",
              fontSize: 12,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {rows}×{cols} cells • Canvas {cols * cellSize}×{rows * cellSize}px
          </div>
        </div>
      </main>
    </div>
  );
}
