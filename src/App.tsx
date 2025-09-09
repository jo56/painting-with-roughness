import React, { useCallback, useEffect, useRef, useState } from 'react';

const GRID_COLOR = '#1f2937';

function createEmptyGrid(rows: number, cols: number): number[][] {
  const g: number[][] = [];
  for (let r = 0; r < rows; r++) {
    g[r] = new Array(cols).fill(0);
  }
  return g;
}

function cloneGrid(grid: number[][]): number[][] {
  return grid.map(row => [...row]);
}

function RuleEditor({ label, rules, onChange }: { label: string, rules: number[], onChange: (rules: number[]) => void }) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

    const handleToggle = (num: number) => {
        const newRules = rules.includes(num)
            ? rules.filter(r => r !== num)
            : [...rules, num];
        onChange(newRules.sort((a, b) => a - b));
    };

    return (
        <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>{label}:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {numbers.map(num => (
                    <label key={num} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: '#374151', padding: '4px 8px', borderRadius: '4px', userSelect: 'none' }}>
                        <input
                            type="checkbox"
                            checked={rules.includes(num)}
                            onChange={() => handleToggle(num)}
                            style={{ marginRight: '6px', cursor: 'pointer' }}
                        />
                        {num}
                    </label>
                ))}
            </div>
        </div>
    );
}

export default function ModularSettingsPaintStudio(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const isMouseDown = useRef(false);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const autoDotsRef = useRef<number | null>(null);
  const autoShapesRef = useRef<number | null>(null);
  const dotsRunningRef = useRef(false);
  const shapesRunningRef = useRef(false);

  const defaults = {
    cellSize: 20,
    rows: 30,
    cols: 40,
    showGrid: true,
    backgroundColor: '#0a0a0a',
    brushSize: 1,
    selectedColor: 1,
    spreadProbability: 0.2,
    autoSpreadSpeed: 3,
    autoDotsSpeed: 2,
    autoShapesSpeed: 1,
    blendMode: 'replace',
    spreadPattern: 'random',
    pulseSpeed: 10,
    directionalBias: 'right',
    conwayRules: { born: [3], survive: [2,3] },
    tendrilsRules: { born: [1], survive: [1,2] },
    directionalBiasStrength: 0.8,
  };

  const [palette, setPalette] = useState([
    '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
  ]);

  const [cellSize, setCellSize] = useState(defaults.cellSize);
  const [rows, setRows] = useState(defaults.rows);
  const [cols, setCols] = useState(defaults.cols);
  const [grid, setGrid] = useState<number[][]>(() => createEmptyGrid(defaults.rows, defaults.cols));
  const [showGrid, setShowGrid] = useState(defaults.showGrid);
  const [backgroundColor, setBackgroundColor] = useState(defaults.backgroundColor);
  const [brushSize, setBrushSize] = useState(defaults.brushSize);
  const [selectedColor, setSelectedColor] = useState(defaults.selectedColor);
  const [spreadProbability, setSpreadProbability] = useState(defaults.spreadProbability);
  const [autoSpreadSpeed, setAutoSpreadSpeed] = useState(defaults.autoSpreadSpeed);
  const [autoDotsSpeed, setAutoDotsSpeed] = useState(defaults.autoDotsSpeed);
  const [autoShapesSpeed, setAutoShapesSpeed] = useState(defaults.autoShapesSpeed);
  const [autoSpreading, setAutoSpreading] = useState(false);
  const [autoDots, setAutoDots] = useState(false);
  const [autoShapes, setAutoShapes] = useState(false);
  const [autoSpreadEnabled, setAutoSpreadEnabled] = useState(true);
  const [autoDotsEnabled, setAutoDotsEnabled] = useState(true);
  const [autoShapesEnabled, setAutoShapesEnabled] = useState(true);
  const [blendMode, setBlendMode] = useState(defaults.blendMode);
  const [tool, setTool] = useState('brush');
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [showSpeedSettings, setShowSpeedSettings] = useState(false);
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);
  const [showVisualSettings, setShowVisualSettings] = useState(false);
  const [showGenerativeSettings, setShowGenerativeSettings] = useState(false);
  const [showStepControls, setShowStepControls] = useState(false);
  const [showAutoControls, setShowAutoControls] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [customColor, setCustomColor] = useState('#ffffff');
  const [isSavingColor, setIsSavingColor] = useState(false);
  const [generativeColorIndices, setGenerativeColorIndices] = useState(() => palette.slice(1).map((_, index) => index + 1));
  const [spreadPattern, setSpreadPattern] = useState<'random' | 'conway' | 'pulse' | 'directional' | 'tendrils'>(defaults.spreadPattern);
  const [pulseSpeed, setPulseSpeed] = useState(defaults.pulseSpeed);
  const [directionalBias, setDirectionalBias] = useState<'none' | 'up' | 'down' | 'left' | 'right'>(defaults.directionalBias);
  const [conwayRules, setConwayRules] = useState(defaults.conwayRules);
  const [tendrilsRules, setTendrilsRules] = useState(defaults.tendrilsRules);
  const [directionalBiasStrength, setDirectionalBiasStrength] = useState(defaults.directionalBiasStrength);


  const generativeColorIndicesRef = useRef(generativeColorIndices);
  const spreadProbabilityRef = useRef(spreadProbability);
  const autoSpreadSpeedRef = useRef(autoSpreadSpeed);
  const autoDotsSpeedRef = useRef(autoDotsSpeed);
  const autoShapesSpeedRef = useRef(autoShapesSpeed);
  const rowsRef = useRef(rows);
  const colsRef = useRef(cols);
  const spreadPatternRef = useRef(spreadPattern);
  const pulseSpeedRef = useRef(pulseSpeed);
  const directionalBiasRef = useRef(directionalBias);
  const conwayRulesRef = useRef(conwayRules);
  const tendrilsRulesRef = useRef(tendrilsRules);
  const directionalBiasStrengthRef = useRef(directionalBiasStrength);
  
  useEffect(() => { spreadProbabilityRef.current = spreadProbability; }, [spreadProbability]);
  useEffect(() => { autoSpreadSpeedRef.current = autoSpreadSpeed; }, [autoSpreadSpeed]);
  useEffect(() => { autoDotsSpeedRef.current = autoDotsSpeed; }, [autoDotsSpeed]);
  useEffect(() => { autoShapesSpeedRef.current = autoShapesSpeed; }, [autoShapesSpeed]);
  useEffect(() => { generativeColorIndicesRef.current = generativeColorIndices; }, [generativeColorIndices]);
  useEffect(() => { rowsRef.current = rows; }, [rows]);
  useEffect(() => { colsRef.current = cols; }, [cols]);
  useEffect(() => { spreadPatternRef.current = spreadPattern; }, [spreadPattern]);
  useEffect(() => { pulseSpeedRef.current = pulseSpeed; }, [pulseSpeed]);
  useEffect(() => { directionalBiasRef.current = directionalBias; }, [directionalBias]);
  useEffect(() => { conwayRulesRef.current = conwayRules; }, [conwayRules]);
  useEffect(() => { tendrilsRulesRef.current = tendrilsRules; }, [tendrilsRules]);
  useEffect(() => { directionalBiasStrengthRef.current = directionalBiasStrength; }, [directionalBiasStrength]);


  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [panelPos, setPanelPos] = useState({ x: 20, y: 20 });
  const mousePos = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 800;
      setIsMobile(mobile);
      if (!mobile && canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        setPanelPos({ x: rect.right + 10, y: rect.top });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  useEffect(() => draw(), [draw]);

  const paintCell = (r: number, c: number, color: number) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    
    setGrid(g => {
      const ng = cloneGrid(g);
      for (let dr = -Math.floor(brushSize/2); dr <= Math.floor(brushSize/2); dr++) {
        for (let dc = -Math.floor(brushSize/2); dc <= Math.floor(brushSize/2); dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (blendMode === 'replace' || ng[nr][nc] === 0) {
              ng[nr][nc] = color;
            } else if (blendMode === 'overlay' && color > 0) {
              ng[nr][nc] = color;
            }
          }
        }
      }
      return ng;
    });
  };

  const floodFill = (startR: number, startC: number, newColor: number) => {
    setGrid(g => {
      const ng = cloneGrid(g);
      const originalColor = g[startR][startC];
      
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
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isSavingColor) {
      setIsSavingColor(false);
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    if (tool === 'fill') {
      floodFill(y, x, selectedColor);
    } else {
      isMouseDown.current = true;
      const colorToUse = tool === 'eraser' ? 0 : selectedColor;
      paintCell(y, x, colorToUse);
    }
  };

  const handleMouseUp = () => { 
    isMouseDown.current = false; 
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || tool === 'fill') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    const colorToUse = tool === 'eraser' ? 0 : selectedColor;
    paintCell(y, x, colorToUse);
  };

  const clear = () => {
    setGrid(createEmptyGrid(rows, cols));
    setIsSavingColor(false);
  };

  const colorSpread = useCallback(() => {
    const pattern = spreadPatternRef.current;
    const currentRows = rowsRef.current;
    const currentCols = colsRef.current;

    setGrid(g => {
        let ng = cloneGrid(g);

        switch (pattern) {
            case 'tendrils':
            case 'conway': {
                const rules = pattern === 'conway' ? conwayRulesRef.current : tendrilsRulesRef.current;
                const BORN = rules.born;
                const SURVIVE = rules.survive;
                
                for (let r = 0; r < currentRows; r++) {
                    for (let c = 0; c < currentCols; c++) {
                        let liveNeighbors = 0;
                        const neighborColors: number[] = [];
                        for (let dr = -1; dr <= 1; dr++) {
                            for (let dc = -1; dc <= 1; dc++) {
                                if (dr === 0 && dc === 0) continue;
                                const nr = r + dr;
                                const nc = c + dc;
                                if (nr >= 0 && nr < currentRows && nc >= 0 && nc < currentCols && g[nr]?.[nc] > 0) {
                                    liveNeighbors++;
                                    neighborColors.push(g[nr][nc]);
                                }
                            }
                        }

                        const isAlive = g[r]?.[c] > 0;
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
                            ng[r][c] = dominantColor > 0 ? dominantColor : (generativeColorIndicesRef.current[0] || 1);
                        }
                    }
                }
                break;
            }
            case 'pulse': {
                const changes = new Map<string, number>();

                for (let r = 0; r < currentRows; r++) {
                    for (let c = 0; c < currentCols; c++) {
                        const currentColor = g[r]?.[c];
                        if (currentColor > 0) {
                            for (let dr = -1; dr <= 1; dr++) {
                                for (let dc = -1; dc <= 1; dc++) {
                                    if (dr === 0 && dc === 0) continue;
                                    const nr = r + dr;
                                    const nc = c + dc;
                                    if (nr >= 0 && nr < currentRows && nc >= 0 && nc < currentCols && g[nr]?.[nc] === 0) {
                                        const key = `${nr},${nc}`;
                                        if (!changes.has(key)) {
                                            changes.set(key, currentColor);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                changes.forEach((color, key) => {
                    const [r, c] = key.split(',').map(Number);
                    ng[r][c] = color;
                });

                return ng;
            }
            case 'random':
            case 'directional': {
                for (let r = 0; r < currentRows; r++) {
                    for (let c = 0; c < currentCols; c++) {
                        const currentColor = g[r]?.[c];
                        if (currentColor === undefined || currentColor === 0) continue;

                        if (Math.random() < spreadProbabilityRef.current) {
                            let neighbors: { r: number, c: number }[] = [];
                            for (let dr = -1; dr <= 1; dr++) {
                                for (let dc = -1; dc <= 1; dc++) {
                                    if (dr === 0 && dc === 0) continue;
                                    const nr = r + dr;
                                    const nc = c + dc;
                                    if (nr >= 0 && nr < currentRows && nc >= 0 && nc < currentCols) {
                                        neighbors.push({ r: nr, c: nc });
                                    }
                                }
                            }

                            if (pattern === 'directional' && directionalBiasRef.current !== 'none' && Math.random() < directionalBiasStrengthRef.current) {
                                const bias = directionalBiasRef.current;
                                const biasedNeighbor = {
                                    r: r + (bias === 'down' ? 1 : bias === 'up' ? -1 : 0),
                                    c: c + (bias === 'right' ? 1 : bias === 'left' ? -1 : 0),
                                };
                                if (biasedNeighbor.r >= 0 && biasedNeighbor.r < currentRows && biasedNeighbor.c >= 0 && biasedNeighbor.c < currentCols) {
                                    ng[biasedNeighbor.r][biasedNeighbor.c] = currentColor;
                                    continue;
                                }
                            }

                            if (neighbors.length > 0) {
                                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                                ng[randomNeighbor.r][randomNeighbor.c] = currentColor;
                            }
                        }
                    }
                }
                break;
            }
        }
        return ng;
    });
  }, []);

  const addRandomDots = useCallback(() => {
    setGrid(g => {
        const ng = cloneGrid(g);
        const availableColors = generativeColorIndicesRef.current.length > 0 ? generativeColorIndicesRef.current : palette.slice(1).map((_, i) => i + 1);
        if (availableColors.length === 0) return ng;

        const numDots = Math.floor(Math.random() * 6) + 5;
        for (let i = 0; i < numDots; i++) {
            const r = Math.floor(Math.random() * rowsRef.current);
            const c = Math.floor(Math.random() * colsRef.current);
            const color = availableColors[Math.floor(Math.random() * availableColors.length)];
            if(ng[r]) ng[r][c] = color;
        }
        
        return ng;
    });
  }, [palette]);

  const addRandomShapes = useCallback(() => {
    setGrid(g => {
        const ng = cloneGrid(g);
        const availableColors = generativeColorIndicesRef.current.length > 0 ? generativeColorIndicesRef.current : palette.slice(1).map((_, i) => i + 1);
        if (availableColors.length === 0) return ng;

        const currentRows = rowsRef.current;
        const currentCols = colsRef.current;

        const numShapes = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numShapes; i++) {
            const color = availableColors[Math.floor(Math.random() * availableColors.length)];
            const shapeType = Math.random() > 0.5 ? 'rect' : 'line';
            
            if (shapeType === 'rect') {
                const startR = Math.floor(Math.random() * (currentRows - 5));
                const startC = Math.floor(Math.random() * (currentCols - 5));
                const width = Math.floor(Math.random() * 6) + 3;
                const height = Math.floor(Math.random() * 6) + 3;
                
                for (let r = startR; r < Math.min(startR + height, currentRows); r++) {
                    for (let c = startC; c < Math.min(startC + width, currentCols); c++) {
                        if(ng[r]) ng[r][c] = color;
                    }
                }
            } else {
                const startR = Math.floor(Math.random() * currentRows);
                const startC = Math.floor(Math.random() * currentCols);
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
                    
                    if (r >= 0 && r < currentRows && c >= 0 && c < currentCols) {
                        if(ng[r]) ng[r][c] = color;
                    }
                }
            }
        }
        
        return ng;
    });
  }, [palette]);

  const runAutoSpread = useCallback(() => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (!runningRef.current) return;

      const pattern = spreadPatternRef.current;
      const speed = pattern === 'pulse' 
        ? pulseSpeedRef.current 
        : autoSpreadSpeedRef.current;
      
      const interval = 1000 / Math.max(0.25, speed);

      if (time - lastTime >= interval) {
        colorSpread();
        lastTime = time;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [colorSpread]);

  const runAutoDots = useCallback(() => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (!dotsRunningRef.current) return;
      const interval = 1000 / Math.max(0.1, autoDotsSpeedRef.current);
      if (time - lastTime >= interval) {
        addRandomDots();
        lastTime = time;
      }
      autoDotsRef.current = requestAnimationFrame(loop);
    };
    autoDotsRef.current = requestAnimationFrame(loop);
  }, [addRandomDots]);

  const runAutoShapes = useCallback(() => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (!shapesRunningRef.current) return;
      const interval = 1000 / Math.max(0.1, autoShapesSpeedRef.current);
      if (time - lastTime >= interval) {
        addRandomShapes();
        lastTime = time;
      }
      autoShapesRef.current = requestAnimationFrame(loop);
    };
    autoShapesRef.current = requestAnimationFrame(loop);
  }, [addRandomShapes]);

  const toggleAutoSpread = () => {
    runningRef.current = !runningRef.current;
    setAutoSpreading(runningRef.current);
    if (runningRef.current) {
      runAutoSpread();
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  const toggleAutoDots = () => {
    dotsRunningRef.current = !dotsRunningRef.current;
    setAutoDots(dotsRunningRef.current);
    if (dotsRunningRef.current) {
      runAutoDots();
    } else if (autoDotsRef.current) {
      cancelAnimationFrame(autoDotsRef.current);
    }
  };

  const toggleAutoShapes = () => {
    shapesRunningRef.current = !shapesRunningRef.current;
    setAutoShapes(shapesRunningRef.current);
    if (shapesRunningRef.current) {
      runAutoShapes();
    } else if (autoShapesRef.current) {
      cancelAnimationFrame(autoShapesRef.current);
    }
  };

  const startAllEnabled = () => {
    if (autoSpreadEnabled && !autoSpreading) {
      runningRef.current = true;
      setAutoSpreading(true);
      runAutoSpread();
    }
    if (autoDotsEnabled && !autoDots) {
      dotsRunningRef.current = true;
      setAutoDots(true);
      runAutoDots();
    }
    if (autoShapesEnabled && !autoShapes) {
      shapesRunningRef.current = true;
      setAutoShapes(true);
      runAutoShapes();
    }
  };

  const stopAll = () => {
    if (autoSpreading) {
      runningRef.current = false;
      setAutoSpreading(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    }
    if (autoDots) {
      dotsRunningRef.current = false;
      setAutoDots(false);
      if (autoDotsRef.current) {
        cancelAnimationFrame(autoDotsRef.current);
      }
    }
    if (autoShapes) {
      shapesRunningRef.current = false;
      setAutoShapes(false);
      if (autoShapesRef.current) {
        cancelAnimationFrame(autoShapesRef.current);
      }
    }
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    isDragging.current = true;
    dragOffset.current = { x: e.clientX - panelPos.x, y: e.clientY - panelPos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (isDragging.current)
        setPanelPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const handleMouseUp = () => { isDragging.current = false; };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        e.preventDefault();
        setIsMobile(false);
        const mouseX = mousePos.current.x || window.innerWidth / 2;
        const mouseY = mousePos.current.y || window.innerHeight / 2;
        const newX = Math.max(10, Math.min(mouseX - 200, window.innerWidth - 440));
        const newY = Math.max(10, Math.min(mouseY - 50, window.innerHeight - 400));
        setPanelPos({ x: newX, y: newY });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobile, panelPos]);

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

  const handlePaletteClick = (index: number) => {
    if (isSavingColor) {
      setPalette(p => {
        const newPalette = [...p];
        newPalette[index] = customColor;
        return newPalette;
      });
      setIsSavingColor(false);
      setSelectedColor(index);
    } else {
      setSelectedColor(index);
    }
  };
  
  const handleGenerativeColorToggle = (colorIndex: number) => {
    setGenerativeColorIndices(prev => {
        if (prev.includes(colorIndex)) {
            return prev.filter(i => i !== colorIndex);
        } else {
            return [...prev, colorIndex];
        }
    });
  };

  const resetGenerativeSettings = () => {
    setSpreadPattern(defaults.spreadPattern);
    setPulseSpeed(defaults.pulseSpeed);
    setDirectionalBias(defaults.directionalBias);
    setConwayRules(defaults.conwayRules);
    setTendrilsRules(defaults.tendrilsRules);
    setDirectionalBiasStrength(defaults.directionalBiasStrength);
  };

  const isAnyRunning = autoSpreading || autoDots || autoShapes;
  const anyEnabled = autoSpreadEnabled || autoDotsEnabled || autoShapesEnabled;

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#111827',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'flex-start',
      color: '#fff'
    }}>
      <div ref={canvasContainerRef} style={{ padding: '10px', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
          style={{ 
            display: 'block', 
            cursor: tool === 'fill' ? 'pointer' : 'crosshair', 
            background: backgroundColor 
          }}
        />
      </div>

      <div
        ref={panelRef}
        style={{
          position: isMobile ? 'relative' : 'fixed',
          top: isMobile ? undefined : panelPos.y,
          left: isMobile ? undefined : panelPos.x,
          margin: isMobile ? '0 auto' : undefined,
          background: 'rgba(17,24,39,0.95)',
          padding: '12px',
          borderRadius: '10px',
          width: isMobile ? 'calc(100% - 20px)': 'auto',
          maxWidth: '480px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        <div
          onMouseDown={handleHeaderMouseDown}
          style={{
            fontWeight: 500,
            textAlign: 'center',
            marginBottom: '12px',
            cursor: 'move',
            padding: '4px',
            background: 'rgba(55,65,81,0.8)',
            borderRadius: '6px',
            fontSize: '1rem',
            userSelect: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>Modular Paint Studio</span>
          <button
            onClick={() => setPanelMinimized(prev => !prev)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
              width: '20px',
              textAlign: 'center'
            }}
          >
            {panelMinimized ? '+' : '-'}
          </button>
        </div>

        <div style={{
          maxHeight: panelMinimized ? '0px' : '2000px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease'
        }}>
          <div style={{
            opacity: panelMinimized ? 0 : 1,
            transition: 'opacity 0.3s ease',
            pointerEvents: panelMinimized ? 'none' : 'auto'
          }}>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { label: 'Brush', value: 'brush' },
                  { label: 'Fill', value: 'fill' },
                  { label: 'Eraser', value: 'eraser' }
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => { setTool(value); setIsSavingColor(false); }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: tool === value ? '#06b6d4' : '#374151',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'normal',
                      fontSize: '0.95rem'
                    }}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => setShowAutoControls(prev => !prev)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: showAutoControls ? '#059669' : '#374151',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'normal',
                    fontSize: '0.95rem'
                  }}
                >
                  Auto
                </button>
                <button
                  onClick={() => setShowOptions(prev => !prev)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: showOptions ? '#059669' : '#374151',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'normal',
                    fontSize: '0.95rem'
                  }}
                >
                  Options
                </button>
                <button
                  onClick={() => { clear(); setIsSavingColor(false); }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#374151',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'normal',
                    fontSize: '0.95rem'
                  }}
                >
                  Clear
                </button>
              </div>
            </div>


            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {palette.slice(1).map((color, index) => (
                  <button
                      key={index + 1}
                      onClick={() => handlePaletteClick(index + 1)}
                      title={isSavingColor ? `Save ${customColor} to this slot` : `Select ${color}`}
                      style={{
                      width: '32px',
                      height: '32px',
                      background: color,
                      border: selectedColor === index + 1 ? '3px solid #fff' : '1px solid #666',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      outline: isSavingColor ? '2px dashed #059669' : 'none',
                      outlineOffset: '2px',
                      transition: 'outline 0.2s'
                      }}
                  />
                ))}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {selectedColor === palette.length && (
                    <button
                      onClick={() => setIsSavingColor(prev => !prev)}
                      title={isSavingColor ? "Cancel saving" : "Save this color to a slot"}
                      style={{
                          padding: '6px 0',
                          height: '32px',
                          borderRadius: '6px',
                          background: isSavingColor ? '#f59e0b' : '#374151',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          fontWeight: 'normal',
                          whiteSpace: 'nowrap',
                          minWidth: '75px',
                          textAlign: 'center'
                      }}
                    >
                      {isSavingColor ? 'Cancel' : 'Save'}
                    </button>
                  )}
                  <div
                    style={{
                      position: 'relative',
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: selectedColor === palette.length ? '3px solid #fff' : '1px solid #666',
                      background: customColor,
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                    onClick={() => {
                        const colorInput = panelRef.current?.querySelector('input[type="color"]') as HTMLInputElement;
                        if (colorInput) {
                            colorInput.click();
                        }
                        setSelectedColor(palette.length);
                        setIsSavingColor(false);
                    }}
                  >
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '-10px',
                        width: '52px',
                        height: '52px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                </div>
              </div>
              {isSavingColor && <div style={{fontSize: '0.8rem', color: '#9ca3af', marginTop: '6px'}}>Select a color slot to replace it.</div>}
            </div>

            {showAutoControls && (
              <>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { isAnyRunning ? stopAll() : startAllEnabled(); setIsSavingColor(false); }}
                    disabled={!anyEnabled && !isAnyRunning}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: isAnyRunning 
                        ? '#dc2626' 
                        : anyEnabled 
                          ? '#16a34a' 
                          : '#6b7280',
                      color: '#fff',
                      border: 'none',
                      cursor: anyEnabled || isAnyRunning ? 'pointer' : 'not-allowed',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      whiteSpace: 'nowrap',
                      opacity: anyEnabled || isAnyRunning ? 1 : 0.6
                    }}
                  >
                    {isAnyRunning ? 'Stop All' : 'Start All'}
                  </button>
                  {[
                    { 
                      label: autoSpreading ? 'Stop Spread' : 'Start Spread', 
                      onClick: toggleAutoSpread, 
                      active: autoSpreading,
                      enabled: autoSpreadEnabled
                    },
                    { 
                      label: autoDots ? 'Stop Dots' : 'Start Dots', 
                      onClick: toggleAutoDots, 
                      active: autoDots,
                      enabled: autoDotsEnabled
                    },
                    { 
                      label: autoShapes ? 'Stop Shapes' : 'Start Shapes', 
                      onClick: toggleAutoShapes, 
                      active: autoShapes,
                      enabled: autoShapesEnabled
                    }
                  ].map(({ label, onClick, active, enabled }) => (
                    <button
                      key={label}
                      onClick={() => { onClick(); setIsSavingColor(false); }}
                      disabled={!enabled}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: enabled ? '#374151' : '#6b7280',
                        color: '#fff',
                        border: 'none',
                        cursor: enabled ? 'pointer' : 'not-allowed',
                        fontWeight: 'normal',
                        fontSize: '0.95rem',
                        whiteSpace: 'nowrap',
                        opacity: enabled ? 1 : 0.6,
                        boxShadow: active ? '0 0 8px rgba(78, 205, 196, 0.7)' : 'none',
                        transition: 'box-shadow 0.2s ease-in-out'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {showOptions && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Speed', onClick: () => setShowSpeedSettings(prev => !prev), bg: showSpeedSettings ? '#059669' : '#374151' },
                  { label: 'Canvas', onClick: () => setShowCanvasSettings(prev => !prev), bg: showCanvasSettings ? '#059669' : '#374151' },
                  { label: 'Visual', onClick: () => setShowVisualSettings(prev => !prev), bg: showVisualSettings ? '#059669' : '#374151' },
                  { label: 'Generative', onClick: () => setShowGenerativeSettings(prev => !prev), bg: showGenerativeSettings ? '#059669' : '#374151' },
                  { label: 'Steps', onClick: () => setShowStepControls(prev => !prev), bg: showStepControls ? '#059669' : '#374151' }
                ].map(({ label, onClick, bg }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: bg,
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'normal',
                      fontSize: '0.95rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            
            {showOptions && showStepControls && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Spread Once', onClick: colorSpread },
                  { label: 'Add Dots', onClick: addRandomDots },
                  { label: 'Add Shapes', onClick: addRandomShapes }
                ].map(({ label, onClick }) => (
                  <button
                    key={label}
                    onClick={() => { onClick(); setIsSavingColor(false); }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: '#374151',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'normal',
                      fontSize: '0.95rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {showOptions && (showSpeedSettings || showCanvasSettings) && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: showSpeedSettings && showCanvasSettings ? 'repeat(2, 1fr)' : '1fr',
                gap: '12px', 
                marginBottom: '12px' 
              }}>
                {showSpeedSettings && (
                  <div>
                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', fontSize: '0.9rem', color: '#e5e7eb' }}>
                      Speed Controls
                    </label>
                    {[
                      ['Spread Rate', spreadProbability, 0, 1, 0.01, setSpreadProbability, '%'],
                      ['Spread Speed', autoSpreadSpeed, 0.25, 20, 0.25, setAutoSpreadSpeed, '/s'],
                      ['Dots Speed', autoDotsSpeed, 0.1, 10, 0.1, setAutoDotsSpeed, '/s'],
                      ['Shapes Speed', autoShapesSpeed, 0.1, 5, 0.1, setAutoShapesSpeed, '/s']
                    ].map(([label, value, min, max, step, setter, unit], idx) => (
                      <div key={idx} style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>{label}:</label>
                          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                            {label === 'Spread Rate' ? `${Math.round((value as number) * 100)}${unit}` : `${value}${unit}`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={min as number}
                          max={max as number}
                          step={step as number}
                          value={value as number}
                          onChange={(e) => (setter as any)(Number(e.target.value))}
                          style={{ width: '100%', height: '6px' }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {showCanvasSettings && (
                  <div>
                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', fontSize: '0.9rem', color: '#e5e7eb' }}>
                      Canvas Settings
                    </label>
                    {[
                      ['Brush Size', brushSize, 1, 10, 1, setBrushSize, ''],
                      ['Cell Size', cellSize, 5, 50, 1, setCellSize, ' px'],
                      ['Rows', rows, 10, 100, 1, handleRowsChange, ''],
                      ['Cols', cols, 10, 100, 1, handleColsChange, '']
                    ].map(([label, value, min, max, step, setter, unit], idx) => (
                      <div key={idx} style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>{label}:</label>
                          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                            {`${value}${unit}`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={min as number}
                          max={max as number}
                          step={step as number}
                          value={value as number}
                          onChange={(e) => (setter as any)(Number(e.target.value))}
                          style={{ width: '100%', height: '6px' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {showOptions && showGenerativeSettings && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ flexGrow: 1}}>
                    <label style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>Spread Pattern:</label>
                    <select
                      value={spreadPattern}
                      onChange={(e) => setSpreadPattern(e.target.value as any)}
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        background: '#374151', 
                        color: '#fff', 
                        border: 'none',
                        width: '100%'
                      }}
                    >
                      <option value="random">Random Walk</option>
                      <option value="conway">Game of Life</option>
                      <option value="tendrils">Tendrils</option>
                      <option value="pulse">Pulsing</option>
                      <option value="directional">Directional</option>
                    </select>
                  </div>
                   <button
                    onClick={resetGenerativeSettings}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: '#374151',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      alignSelf: 'flex-end',
                      height: '29px'
                    }}
                    title="Reset generative settings to default"
                  >
                    Reset
                  </button>
                </div>

                {spreadPattern === 'conway' && (
                  <div style={{background: '#1f2937', padding: '8px', borderRadius: '6px'}}>
                    <RuleEditor label="Survive Counts" rules={conwayRules.survive} onChange={(newSurvive) => setConwayRules(r => ({ ...r, survive: newSurvive }))} />

                    <RuleEditor label="Birth Counts" rules={conwayRules.born} onChange={(newBorn) => setConwayRules(r => ({ ...r, born: newBorn }))} />
                  </div>
                )}
                
                {spreadPattern === 'tendrils' && (
                  <div style={{background: '#1f2937', padding: '8px', borderRadius: '6px'}}>
                     <RuleEditor label="Survive Counts" rules={tendrilsRules.survive} onChange={(newSurvive) => setTendrilsRules(r => ({ ...r, survive: newSurvive }))} />

                     <RuleEditor label="Birth Counts" rules={tendrilsRules.born} onChange={(newBorn) => setTendrilsRules(r => ({ ...r, born: newBorn }))} />
                  </div>
                )}
                
                {spreadPattern === 'pulse' && (
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Pulse Speed:</label>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{pulseSpeed}</span>
                        </div>
                        <input
                        type="range" min={1} max={50} value={pulseSpeed}
                        onChange={(e) => setPulseSpeed(Number(e.target.value))}
                        style={{ width: '100%', height: '6px' }}
                        />
                    </div>
                )}

                {spreadPattern === 'directional' && (
                    <>
                      <div style={{ marginBottom: '10px' }}>
                          <label style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>Bias:</label>
                          <select
                              value={directionalBias}
                              onChange={(e) => setDirectionalBias(e.target.value as any)}
                              style={{ padding: '4px 8px', borderRadius: '6px', background: '#374151', color: '#fff', border: 'none', width: '100%' }}
                          >
                              <option value="right">Right</option>
                              <option value="left">Left</option>
                              <option value="up">Up</option>
                              <option value="down">Down</option>
                          </select>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Bias Strength:</label>
                          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{Math.round(directionalBiasStrength * 100)}%</span>
                          </div>
                          <input
                          type="range" min={0} max={1} step={0.05} value={directionalBiasStrength}
                          onChange={(e) => setDirectionalBiasStrength(Number(e.target.value))}
                          style={{ width: '100%', height: '6px' }}
                          />
                      </div>
                    </>
                )}

                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', fontSize: '0.9rem', color: '#e5e7eb', marginTop: '12px' }}>
                    Allowed Generative Colors
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {palette.slice(1).map((color, index) => {
                        const colorIndex = index + 1;
                        return (
                            <label 
                                key={colorIndex} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '4px', 
                                    cursor: 'pointer',
                                    padding: '2px',
                                    borderRadius: '6px',
                                    outline: isSavingColor ? '2px dashed #059669' : 'none',
                                    outlineOffset: '2px',
                                    transition: 'outline 0.2s',
                                }}
                                title={isSavingColor ? `Save ${customColor} to this slot` : `Toggle color for generation`}
                                onClick={(e) => {
                                    if (isSavingColor) {
                                        e.preventDefault();
                                        setPalette(p => {
                                            const newPalette = [...p];
                                            newPalette[colorIndex] = customColor;
                                            return newPalette;
                                        });
                                        setIsSavingColor(false);
                                        setSelectedColor(colorIndex);
                                    }
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={generativeColorIndices.includes(colorIndex)}
                                    onChange={() => handleGenerativeColorToggle(colorIndex)}
                                    style={{ pointerEvents: isSavingColor ? 'none' : 'auto' }}
                                />
                                <div style={{ width: '20px', height: '20px', background: color, borderRadius: '4px' }} />
                            </label>
                        );
                    })}
                </div>
              </div>
            )}

            {showOptions && showVisualSettings && (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>Blend Mode:</label>
                  <select
                    value={blendMode}
                    onChange={(e) => setBlendMode(e.target.value)}
                    style={{ 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      background: '#374151', 
                      color: '#fff', 
                      border: 'none',
                      width: '100%'
                    }}
                  >
                    <option value="replace">Replace</option>
                    <option value="overlay">Overlay</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontWeight: 600 }}>Background:</label>
                  <input 
                    type="color" 
                    value={backgroundColor} 
                    onChange={e => setBackgroundColor(e.target.value)}
                    style={{ marginLeft: '8px' }}
                  />
                </div>

                <div style={{ fontWeight: 600, marginBottom: '10px' }}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={showGrid} 
                      onChange={e => setShowGrid(e.target.checked)} 
                    /> 
                    Show Grid
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

