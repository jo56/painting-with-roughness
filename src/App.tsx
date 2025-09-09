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
    blendMode: 'replace'
  };

  const colorPalette = [
    '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
  ];

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
  const [showAutoControls, setShowAutoControls] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [customColor, setCustomColor] = useState('#ffffff');

  const spreadProbabilityRef = useRef(spreadProbability);
  const autoSpreadSpeedRef = useRef(autoSpreadSpeed);
  const autoDotsSpeedRef = useRef(autoDotsSpeed);
  const autoShapesSpeedRef = useRef(autoShapesSpeed);
  
  useEffect(() => { spreadProbabilityRef.current = spreadProbability; }, [spreadProbability]);
  useEffect(() => { autoSpreadSpeedRef.current = autoSpreadSpeed; }, [autoSpreadSpeed]);
  useEffect(() => { autoDotsSpeedRef.current = autoDotsSpeed; }, [autoDotsSpeed]);
  useEffect(() => { autoShapesSpeedRef.current = autoShapesSpeed; }, [autoShapesSpeed]);

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
        const colorIndex = grid[r][c];
        if (colorIndex > 0) {
          ctx.fillStyle = colorPalette[colorIndex];
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
  }, [grid, rows, cols, cellSize, backgroundColor, showGrid, colorPalette]);

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
  };

  const colorSpread = useCallback(() => {
    setGrid(g => {
      const ng = cloneGrid(g);
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const currentColor = g[r][c];
          
          if (currentColor > 0) {
            if (Math.random() < spreadProbabilityRef.current) {
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
    });
  }, [rows, cols]);

  const addRandomDots = useCallback(() => {
    setGrid(g => {
      const ng = cloneGrid(g);
      
      const numDots = Math.floor(Math.random() * 6) + 5;
      for (let i = 0; i < numDots; i++) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        const color = Math.floor(Math.random() * (colorPalette.length - 1)) + 1;
        ng[r][c] = color;
      }
      
      return ng;
    });
  }, [rows, cols, colorPalette.length]);

  const addRandomShapes = useCallback(() => {
    setGrid(g => {
      const ng = cloneGrid(g);
      
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
    });
  }, [rows, cols, colorPalette.length]);

  const runAutoSpread = useCallback(() => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (!runningRef.current) return;
      const interval = 1000 / Math.max(0.25, autoSpreadSpeedRef.current);
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

  const handleRowsChange = (newRows: number) => {
    setRows(newRows);
    setGrid(g => {
      const newGrid = createEmptyGrid(newRows, cols);
      for (let r = 0; r < Math.min(g.length, newRows); r++) {
        for (let c = 0; c < cols; c++) {
          newGrid[r][c] = g[r][c];
        }
      }
      return newGrid;
    });
  };

  const handleColsChange = (newCols: number) => {
    setCols(newCols);
    setGrid(g => g.map(row => {
      const newRow = new Array(newCols).fill(0);
      for (let c = 0; c < Math.min(row.length, newCols); c++) {
        newRow[c] = row[c];
      }
      return newRow;
    }));
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
          marginTop: isMobile ? '10px' : undefined,
          background: 'rgba(17,24,39,0.95)',
          padding: '12px',
          borderRadius: '10px',
          maxWidth: '430px',
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
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Brush', value: 'brush' },
                  { label: 'Fill', value: 'fill' },
                  { label: 'Eraser', value: 'eraser' }
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setTool(value)}
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
              </div>
            </div>


            <div style={{ marginBottom: '12px' }}>
  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
    {[colorPalette.slice(1).map((color, index) => (
      <button
        key={index + 1}
        onClick={() => setSelectedColor(index + 1)}
        style={{
          width: '32px',
          height: '32px',
          background: color,
          border: selectedColor === index + 1 ? '3px solid #fff' : '1px solid #666',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      />
    ))]}

    {/* Custom Color Picker Button */}
    <input
      type="color"
      value={customColor}
      onChange={(e) => {
        setCustomColor(e.target.value);
        setSelectedColor(colorPalette.length); // last index reserved for custom color
      }}
      style={{
        width: '32px',
        height: '32px',
        padding: 0,
        border: selectedColor === colorPalette.length ? '3px solid #fff' : '1px solid #666',
        borderRadius: '6px',
        cursor: 'pointer',
        background: customColor
      }}
    />
  </div>
</div>

            {showAutoControls && (
              <>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {[
                    { 
                      label: autoSpreading ? 'Stop Spread' : 'Start Spread', 
                      onClick: toggleAutoSpread, 
                      bg: autoSpreading ? '#dc2626' : '#16a34a',
                      enabled: autoSpreadEnabled
                    },
                    { 
                      label: autoDots ? 'Stop Dots' : 'Start Dots', 
                      onClick: toggleAutoDots, 
                      bg: autoDots ? '#dc2626' : '#f59e0b',
                      enabled: autoDotsEnabled
                    },
                    { 
                      label: autoShapes ? 'Stop Shapes' : 'Start Shapes', 
                      onClick: toggleAutoShapes, 
                      bg: autoShapes ? '#dc2626' : '#8b5cf6',
                      enabled: autoShapesEnabled
                    }
                  ].map(({ label, onClick, bg, enabled }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      disabled={!enabled}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: enabled ? bg : '#6b7280',
                        color: '#fff',
                        border: 'none',
                        cursor: enabled ? 'pointer' : 'not-allowed',
                        fontWeight: 'normal',
                        fontSize: '0.95rem',
                        whiteSpace: 'nowrap',
                        opacity: enabled ? 1 : 0.6
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  
                  <button
                    onClick={isAnyRunning ? stopAll : startAllEnabled}
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
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Spread Once', onClick: colorSpread, bg: '#7c3aed' },
                { label: 'Add Dots', onClick: addRandomDots, bg: '#ea580c' },
                { label: 'Add Shapes', onClick: addRandomShapes, bg: '#f59e0b' },
                { label: 'Clear', onClick: clear, bg: '#991b1b' }
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

            {showOptions && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Speed', onClick: () => setShowSpeedSettings(prev => !prev), bg: showSpeedSettings ? '#059669' : '#374151' },
                  { label: 'Canvas', onClick: () => setShowCanvasSettings(prev => !prev), bg: showCanvasSettings ? '#059669' : '#374151' },
                  { label: 'Visual', onClick: () => setShowVisualSettings(prev => !prev), bg: showVisualSettings ? '#059669' : '#374151' }
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

            {/* Conditional Settings Display */}
            {showOptions && (showSpeedSettings || showCanvasSettings) && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: showSpeedSettings && showCanvasSettings ? 'repeat(2, 1fr)' : '1fr',
                gap: '12px', 
                marginBottom: '12px' 
              }}>
                {/* Speed Settings Column */}
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

                {/* Canvas Settings Column */}
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

                <div style={{ fontWeight: 600 }}>
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