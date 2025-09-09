import React from 'react';
import { ToolSelector } from './ToolSelector';
import { ColorPalette } from './ColorPalette';
import { AutoControls } from './AutoControls';
import { ActionButtons } from './ActionButtons';
import { SliderControl } from './SliderControl';
import { AdvancedControls } from './AdvancedControls';
import { Tool, BlendMode, PanelPosition } from '../types';

interface ControlPanelProps {
  // Panel state
  isMobile: boolean;
  panelPos: PanelPosition;
  panelMinimized: boolean;
  setPanelMinimized: (minimized: boolean) => void;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  onHeaderMouseDown: (e: React.MouseEvent) => void;

  // Tool state
  tool: Tool;
  setTool: (tool: Tool) => void;
  selectedColor: number;
  setSelectedColor: (color: number) => void;

  // Animation state
  autoSpreading: boolean;
  autoDots: boolean;
  autoShapes: boolean;
  toggleAutoSpread: () => void;
  toggleAutoDots: () => void;
  toggleAutoShapes: () => void;

  // Actions
  colorSpread: () => void;
  addRandomDots: () => void;
  addRandomShapes: () => void;
  clear: () => void;

  // Settings
  spreadProbability: number;
  setSpreadProbability: (value: number) => void;
  autoSpreadSpeed: number;
  setAutoSpreadSpeed: (value: number) => void;
  autoDotsSpeed: number;
  setAutoDotsSpeed: (value: number) => void;
  autoShapesSpeed: number;
  setAutoShapesSpeed: (value: number) => void;
  brushSize: number;
  setBrushSize: (value: number) => void;
  cellSize: number;
  setCellSize: (value: number) => void;
  rows: number;
  handleRowsChange: (value: number) => void;
  cols: number;
  handleColsChange: (value: number) => void;

  // Advanced settings
  blendMode: BlendMode;
  setBlendMode: (mode: BlendMode) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
}

export function ControlPanel({
  isMobile,
  panelPos,
  panelMinimized,
  setPanelMinimized,
  showAdvanced,
  setShowAdvanced,
  onHeaderMouseDown,
  tool,
  setTool,
  selectedColor,
  setSelectedColor,
  autoSpreading,
  autoDots,
  autoShapes,
  toggleAutoSpread,
  toggleAutoDots,
  toggleAutoShapes,
  colorSpread,
  addRandomDots,
  addRandomShapes,
  clear,
  spreadProbability,
  setSpreadProbability,
  autoSpreadSpeed,
  setAutoSpreadSpeed,
  autoDotsSpeed,
  setAutoDotsSpeed,
  autoShapesSpeed,
  setAutoShapesSpeed,
  brushSize,
  setBrushSize,
  cellSize,
  setCellSize,
  rows,
  handleRowsChange,
  cols,
  handleColsChange,
  blendMode,
  setBlendMode,
  backgroundColor,
  setBackgroundColor,
  showGrid,
  setShowGrid
}: ControlPanelProps) {
  const sliderConfigs = [
    { label: 'Spread Rate', value: spreadProbability, min: 0, max: 1, step: 0.01, setter: setSpreadProbability, unit: '%' },
    { label: 'Spread Speed', value: autoSpreadSpeed, min: 0.25, max: 20, step: 0.25, setter: setAutoSpreadSpeed, unit: '/s' },
    { label: 'Dots Speed', value: autoDotsSpeed, min: 0.1, max: 10, step: 0.1, setter: setAutoDotsSpeed, unit: '/s' },
    { label: 'Shapes Speed', value: autoShapesSpeed, min: 0.1, max: 5, step: 0.1, setter: setAutoShapesSpeed, unit: '/s' },
    { label: 'Brush Size', value: brushSize, min: 1, max: 10, step: 1, setter: setBrushSize, unit: '' },
    { label: 'Cell Size', value: cellSize, min: 5, max: 50, step: 1, setter: setCellSize, unit: ' px' },
    { label: 'Rows', value: rows, min: 10, max: 100, step: 1, setter: handleRowsChange, unit: '' },
    { label: 'Cols', value: cols, min: 10, max: 100, step: 1, setter: handleColsChange, unit: '' }
  ];

  return (
    <div
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
        onMouseDown={onHeaderMouseDown}
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
        <span>Infinite Paint Studio</span>
        <button
          onClick={() => setPanelMinimized(!panelMinimized)}
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
          
          <ToolSelector tool={tool} setTool={setTool} />
          
          <ColorPalette selectedColor={selectedColor} setSelectedColor={setSelectedColor} />

          <AutoControls
            autoSpreading={autoSpreading}
            autoDots={autoDots}
            autoShapes={autoShapes}
            toggleAutoSpread={toggleAutoSpread}
            toggleAutoDots={toggleAutoDots}
            toggleAutoShapes={toggleAutoShapes}
          />

          <ActionButtons
            colorSpread={colorSpread}
            addRandomDots={addRandomDots}
            addRandomShapes={addRandomShapes}
            clear={clear}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
          />

          {sliderConfigs.map((config) => (
            <SliderControl
              key={config.label}
              label={config.label}
              value={config.value}
              min={config.min}
              max={config.max}
              step={config.step}
              unit={config.unit}
              onChange={config.setter}
            />
          ))}

          {showAdvanced && (
            <AdvancedControls
              blendMode={blendMode}
              setBlendMode={setBlendMode}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              showGrid={showGrid}
              setShowGrid={setShowGrid}
            />
          )}
        </div>
      </div>
    </div>
  );
}