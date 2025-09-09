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

export default function PaintSpreadApp(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const isMouseDown = useRef(false);

  const defaults = {
    cellSize: 20,
    rows: 30,
    cols: 40,
    showGrid: true,
    backgroundColor: '#0a0a0a',
    brushSize: 1,
    selectedColor: 1,
    spreadProbability: 0.3,
    blendMode: 'replace'
  };

  // Color palette - index 0 is transparent/eraser, 1-8 are colors
  const colorPalette = [
    '#000000', // 0: transparent/eraser
    '#ff6b6b', // 1: red
    '#4ecdc4', // 2: teal
    '#45b7d1', // 3: blue
    '#96ceb4', // 4: green
    '#feca57', // 5: yellow
    '#ff9ff3', // 6: pink
    '#54a0ff', // 7: light blue
    '#5f27cd', // 8: purple
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
  const [blendMode, setBlendMode] = useState(defaults.blendMode);
  const [tool, setTool] = useState('brush');

  const [panelMinimized, setPanelMinimized] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const colorIndex = grid[r][c];
        if (colorIndex > 0) {
          ctx.fillStyle = colorPalette[colorIndex];
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }

    // Draw grid lines
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
      
      // Apply brush size
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

  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDown.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    const colorToUse = tool === 'eraser' ? 0 : selectedColor;
    paintCell(y, x, colorToUse);
  };

  const handleMouseUp = () => { 
    isMouseDown.current = false; 
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
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

  const colorSpread = () => {
    setGrid(g => {
      const ng = cloneGrid(g);
      
      // For each colored cell, give it a chance to flip one of its neighbors
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const currentColor = g[r][c];
          
          // Only colored cells can spread
          if (currentColor > 0) {
            // Check if this cell gets to spread (based on probability)
            if (Math.random() < spreadProbability) {
              
              // Find all 8 neighbors (including diagonals)
              const neighbors: { r: number, c: number }[] = [];
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  if (dr === 0 && dc === 0) continue; // Skip center cell
                  const nr = r + dr;
                  const nc = c + dc;
                  if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    neighbors.push({ r: nr, c: nc });
                  }
                }
              }
              
              // Pick a random neighbor to flip to this color
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
  };

  const addRandomDots = () => {
    setGrid(g => {
      const ng = cloneGrid(g);
      
      // Add 10-20 random colored dots
      const numDots = Math.floor(Math.random() * 10) + 10;
      for (let i = 0; i < numDots; i++) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        const color = Math.floor(Math.random() * (colorPalette.length - 1)) + 1;
        ng[r][c] = color;
      }
      
      return ng;
    });
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

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#111827',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'flex-start'
    }}>
      <div ref={canvasContainerRef} style={{ padding: '10px', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ display: 'block', cursor: 'crosshair', background: backgroundColor }}
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
        {/* Header */}
        <div
          onMouseDown={handleHeaderMouseDown}
          style={{
            fontWeight: 500,
            textAlign: 'center',
            marginBottom: '12px',
            cursor: 'move',
            padding: '1px 1px',
            background: 'rgba(55,65,81,0.8)',
            borderRadius: '6px',
            fontSize: '1rem',
            userSelect: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0px'
          }}
        >
          <span>Color Spread Studio</span>
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

        {/* Panel contents */}
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
            
            {/* Tool Selection */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>Tool:</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Brush', value: 'brush' },
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
              </div>
            </div>

            {/* Color Palette */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>Colors:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {colorPalette.slice(1).map((color, index) => (
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
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Spread', onClick: colorSpread, bg: '#9333ea' },
                { label: 'Random Dots', onClick: addRandomDots, bg: '#ea580c' },
                { label: 'Clear', onClick: clear, bg: '#dc2626' },
                { label: 'Adv.', onClick: () => setShowAdvanced(prev => !prev), bg: '#374151' },
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
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Basic Settings */}
            {[
              ['Brush Size', brushSize, 1, 10, setBrushSize, ''],
              ['Cell Size', cellSize, 5, 50, setCellSize, ' px'],
              ['Rows', rows, 10, 100, handleRowsChange, ''],
              ['Cols', cols, 10, 100, handleColsChange, '']
            ].map(([label, value, min, max, setter, unit], idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ width: '100px', fontWeight: 600 }}>{label}:</label>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min={min as number}
                    max={max as number}
                    value={value as number}
                    onChange={(e) => setter(Number(e.target.value))}
                    style={{ flex: 1, height: '8px', borderRadius: '4px' }}
                  />
                  <span style={{ minWidth: '50px', textAlign: 'right', fontSize: '0.95rem' }}>
                    {`${value}${unit}`}
                  </span>
                </div>
              </div>
            ))}

            {/* Spread Probability */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ width: '100px', fontWeight: 600 }}>Spread Rate:</label>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={spreadProbability}
                  onChange={(e) => setSpreadProbability(Number(e.target.value))}
                  style={{ flex: 1, height: '8px', borderRadius: '4px' }}
                />
                <span style={{ minWidth: '50px', textAlign: 'right', fontSize: '0.95rem' }}>
                  {`${Math.round(spreadProbability * 100)}%`}
                </span>
              </div>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
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