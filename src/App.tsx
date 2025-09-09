import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { useAutoAnimation } from './hooks/useAutoAnimation';
import { usePanelDrag } from './hooks/usePanelDrag';
import { createEmptyGrid } from './utils/grid';
import { createColorSpread, createRandomDots, createRandomShapes } from './utils/gridOperations';
import { defaults } from './constants';
import { Tool, BlendMode } from './types';

export default function InfinitePaintStudio(): JSX.Element {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // State
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
  const [blendMode, setBlendMode] = useState<BlendMode>(defaults.blendMode);
  const [tool, setTool] = useState<Tool>('brush');
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [panelPos, setPanelPos] = useState({ x: 20, y: 20 });
  const [isMobile, setIsMobile] = useState(false);

  // Refs for animation callbacks
  const spreadProbabilityRef = useRef(spreadProbability);
  const autoSpreadSpeedRef = useRef(autoSpreadSpeed);
  const autoDotsSpeedRef = useRef(autoDotsSpeed);
  const autoShapesSpeedRef = useRef(autoShapesSpeed);
  
  useEffect(() => { spreadProbabilityRef.current = spreadProbability; }, [spreadProbability]);
  useEffect(() => { autoSpreadSpeedRef.current = autoSpreadSpeed; }, [autoSpreadSpeed]);
  useEffect(() => { autoDotsSpeedRef.current = autoDotsSpeed; }, [autoDotsSpeed]);
  useEffect(() => { autoShapesSpeedRef.current = autoShapesSpeed; }, [autoShapesSpeed]);

  // Custom hooks
  const {
    runningRef,
    dotsRunningRef,
    shapesRunningRef,
    runAutoSpread,
    runAutoDots,
    runAutoShapes,
    stopAutoSpread,
    stopAutoDots,
    stopAutoShapes
  } = useAutoAnimation();

  const { handleHeaderMouseDown } = usePanelDrag(isMobile, panelPos, setPanelPos, setIsMobile);

  // Responsive handling
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

  // Grid operations
  const clear = () => {
    setGrid(createEmptyGrid(rows, cols));
  };

  const colorSpread = useCallback(() => {
    setGrid(g => createColorSpread(g, rows, cols, spreadProbabilityRef.current));
  }, [rows, cols]);

  const addRandomDots = useCallback(() => {
    setGrid(g => createRandomDots(g, rows, cols));
  }, [rows, cols]);

  const addRandomShapes = useCallback(() => {
    setGrid(g => createRandomShapes(g, rows, cols));
  }, [rows, cols]);

  // Animation controls
  const toggleAutoSpread = () => {
    runningRef.current = !runningRef.current;
    setAutoSpreading(runningRef.current);
    if (runningRef.current) {
      runAutoSpread(colorSpread, autoSpreadSpeedRef);
    } else {
      stopAutoSpread();
    }
  };

  const toggleAutoDots = () => {
    dotsRunningRef.current = !dotsRunningRef.current;
    setAutoDots(dotsRunningRef.current);
    if (dotsRunningRef.current) {
      runAutoDots(addRandomDots, autoDotsSpeedRef);
    } else {
      stopAutoDots();
    }
  };

  const toggleAutoShapes = () => {
    shapesRunningRef.current = !shapesRunningRef.current;
    setAutoShapes(shapesRunningRef.current);
    if (shapesRunningRef.current) {
      runAutoShapes(addRandomShapes, autoShapesSpeedRef);
    } else {
      stopAutoShapes();
    }
  };

  // Grid size handlers
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
        <Canvas
          grid={grid}
          setGrid={setGrid}
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          backgroundColor={backgroundColor}
          showGrid={showGrid}
          tool={tool}
          selectedColor={selectedColor}
          brushSize={brushSize}
          blendMode={blendMode}
        />
      </div>

      <ControlPanel
        isMobile={isMobile}
        panelPos={panelPos}
        panelMinimized={panelMinimized}
        setPanelMinimized={setPanelMinimized}
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        onHeaderMouseDown={handleHeaderMouseDown}
        tool={tool}
        setTool={setTool}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        autoSpreading={autoSpreading}
        autoDots={autoDots}
        autoShapes={autoShapes}
        toggleAutoSpread={toggleAutoSpread}
        toggleAutoDots={toggleAutoDots}
        toggleAutoShapes={toggleAutoShapes}
        colorSpread={colorSpread}
        addRandomDots={addRandomDots}
        addRandomShapes={addRandomShapes}
        clear={clear}
        spreadProbability={spreadProbability}
        setSpreadProbability={setSpreadProbability}
        autoSpreadSpeed={autoSpreadSpeed}
        setAutoSpreadSpeed={setAutoSpreadSpeed}
        autoDotsSpeed={autoDotsSpeed}
        setAutoDotsSpeed={setAutoDotsSpeed}
        autoShapesSpeed={autoShapesSpeed}
        setAutoShapesSpeed={setAutoShapesSpeed}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        cellSize={cellSize}
        setCellSize={setCellSize}
        rows={rows}
        handleRowsChange={handleRowsChange}
        cols={cols}
        handleColsChange={handleColsChange}
        blendMode={blendMode}
        setBlendMode={setBlendMode}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
      />
    </div>
  );
}