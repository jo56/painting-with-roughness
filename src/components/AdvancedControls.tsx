import React from 'react';
import { BlendMode } from '../types';

interface AdvancedControlsProps {
  blendMode: BlendMode;
  setBlendMode: (mode: BlendMode) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
}

export function AdvancedControls({
  blendMode,
  setBlendMode,
  backgroundColor,
  setBackgroundColor,
  showGrid,
  setShowGrid
}: AdvancedControlsProps) {
  return (
    <>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>Blend Mode:</label>
        <select
          value={blendMode}
          onChange={(e) => setBlendMode(e.target.value as BlendMode)}
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
  );
}