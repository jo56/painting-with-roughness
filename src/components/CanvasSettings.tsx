import React from 'react';
import { Theme } from '../types/ui';

interface CanvasSettingsProps {
  showCanvasSettings: boolean;
  setShowCanvasSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  brushSize: number;
  cellSize: number;
  rows: number;
  cols: number;
  setBrushSize: (value: number) => void;
  setCellSize: (value: number) => void;
  handleRowsChange: (value: number) => void;
  handleColsChange: (value: number) => void;
  panelTransparent: boolean;
  currentThemeConfig: Theme;
}

export function CanvasSettings({
  showCanvasSettings,
  setShowCanvasSettings,
  brushSize,
  cellSize,
  rows,
  cols,
  setBrushSize,
  setCellSize,
  handleRowsChange,
  handleColsChange,
  panelTransparent,
  currentThemeConfig,
}: CanvasSettingsProps) {
  const settings = [
    { label: 'Brush Size', value: brushSize, min: 1, max: 100, step: 1, setter: setBrushSize, unit: '', isEditable: false },
    { label: 'Cell Size', value: cellSize, min: 1, max: 30, step: 1, setter: setCellSize, unit: ' px', isEditable: false },
    { label: 'Rows', value: rows, min: 10, max: 2000, step: 1, setter: handleRowsChange, unit: '', isEditable: true },
    { label: 'Cols', value: cols, min: 10, max: 2000, step: 1, setter: handleColsChange, unit: '', isEditable: true }
  ];

  return (
    <div style={{
      background: panelTransparent ? 'transparent' : 'rgba(10, 10, 10, 0.5)',
      border: 'none',
      borderRadius: '0',
      padding: '8px'
    }}>
      <label style={{
        fontWeight: '400',
        marginBottom: '8px',
        display: 'block',
        fontSize: '1rem',
        color: '#ffffff',
        fontFamily: 'monospace',
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
      }}>
        Canvas Settings
      </label>
      {settings.map(({ label, value, min, max, step, setter, unit, isEditable }) => (
        <div key={label} style={{ marginBottom: '8px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2px'
          }}>
            <label style={{
              fontSize: '0.85rem',
              fontWeight: '400',
              fontFamily: 'monospace',
              color: '#ffffff',
              letterSpacing: '0.3px'
            }}>
              {label}:
            </label>

            {isEditable ? (
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => {
                  let newValue = Number(e.target.value);
                  if (isNaN(newValue)) return;
                  if (newValue < min) newValue = min;
                  if (newValue > max) newValue = max;
                  setter(newValue);
                }}
                style={{
                  width: '60px',
                  fontSize: '0.8rem',
                  color: '#666666',
                  fontFamily: 'monospace',
                  textAlign: 'right',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  appearance: 'textfield',
                  MozAppearance: 'textfield'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = '#1f2937';
                  e.currentTarget.style.border = '1px solid #4b5563';
                  e.currentTarget.style.borderRadius = '4px';
                  e.currentTarget.style.padding = '2px 4px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.border = 'none';
                  e.currentTarget.style.padding = '0';
                }}
              />
            ) : (
              <span style={{
                fontSize: '0.8rem',
                color: '#666666',
                fontFamily: 'monospace'
              }}>
                {`${value}${unit}`}
              </span>
            )}
          </div>

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setter(Number(e.target.value))}
            style={{ width: '100%', height: '6px' }}
          />
        </div>
      ))}
    </div>
  );
}
