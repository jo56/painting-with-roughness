import React from 'react';
import type { BrushType } from '../types';
import { Theme } from '../types/ui';

interface VisualSettingsProps {
  showVisualSettings: boolean;
  setShowVisualSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  backgroundColor: string;
  showGrid: boolean;
  brushType: BrushType;
  blendMode: 'replace' | 'overlay';
  diagonalThickness: number;
  sprayDensity: number;
  palette: string[];
  recordEnabled: boolean;
  recordingFilename: string;
  panelTransparent: boolean;
  setBackgroundColor: (value: string) => void;
  setShowGrid: (value: boolean) => void;
  setBrushType: (value: BrushType) => void;
  setBlendMode: (value: 'replace' | 'overlay') => void;
  setDiagonalThickness: (value: number) => void;
  setSprayDensity: (value: number) => void;
  setPalette: (value: string[] | ((prev: string[]) => string[])) => void;
  setRecordEnabled: (value: boolean) => void;
  setRecordingFilename: (value: string) => void;
  setPanelTransparent: (value: boolean) => void;
  currentThemeConfig: Theme;
}

export function VisualSettings({
  showVisualSettings,
  setShowVisualSettings,
  backgroundColor,
  showGrid,
  brushType,
  blendMode,
  diagonalThickness,
  sprayDensity,
  palette,
  recordEnabled,
  recordingFilename,
  panelTransparent,
  setBackgroundColor,
  setShowGrid,
  setBrushType,
  setBlendMode,
  setDiagonalThickness,
  setSprayDensity,
  setPalette,
  setRecordEnabled,
  setRecordingFilename,
  setPanelTransparent,
  currentThemeConfig,
}: VisualSettingsProps) {
  return (
    <div className="scrollable-settings" style={{
      maxHeight: '400px',
      overflowY: 'auto',
      background: panelTransparent ? 'transparent' : 'rgba(10, 10, 10, 0.3)',
      border: 'none',
      borderRadius: '0',
      padding: '8px',
      marginBottom: '12px'
    }}>
      <div style={{ marginBottom: '10px' }}>
        {/* Brush Type */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            fontSize: '0.95rem',
            fontWeight: '400',
            display: 'block',
            marginBottom: '6px',
            fontFamily: 'monospace',
            color: '#ffffff',
            letterSpacing: '0.4px'
          }}>
            Brush Type
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['square', 'circle', 'diagonal', 'spray'] as BrushType[]).map((type) => (
              <button
                key={type}
                onClick={() => setBrushType(type)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '0',
                  background: 'transparent',
                  color: brushType === type ? '#ffffff' : '#666666',
                  border: 'none',
                  fontFamily: 'monospace',
                  letterSpacing: '0.3px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textDecoration: brushType === type ? 'underline' : 'none',
                  textUnderlineOffset: brushType === type ? '4px' : '0'
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Spray Density */}
        {brushType === 'spray' && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{
              fontWeight: '400',
              marginBottom: '6px',
              display: 'block',
              fontFamily: 'monospace',
              color: '#ffffff',
              letterSpacing: '0.3px',
              fontSize: '0.9rem'
            }}>
              Spray Density: {sprayDensity.toFixed(2)}
            </label>
            <input
              type="range"
              step={0.05}
              min={0.01}
              max={1}
              value={sprayDensity}
              onChange={e => setSprayDensity(Number(e.target.value))}
            />
          </div>
        )}

        {/* Diagonal Thickness */}
        {brushType === 'diagonal' && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{
              fontWeight: '400',
              marginBottom: '6px',
              display: 'block',
              fontFamily: 'monospace',
              color: '#ffffff',
              letterSpacing: '0.3px',
              fontSize: '0.9rem'
            }}>
              Diagonal Thickness: {diagonalThickness}
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={diagonalThickness}
              onChange={e => setDiagonalThickness(Number(e.target.value))}
            />
          </div>
        )}

        {/* Blend Mode */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{
            fontWeight: '400',
            marginBottom: '6px',
            display: 'block',
            fontFamily: 'monospace',
            color: '#ffffff',
            letterSpacing: '0.3px',
            fontSize: '0.9rem'
          }}>
            Blend Mode:
          </label>
          <select
            value={blendMode}
            onChange={(e) => setBlendMode(e.target.value as 'replace' | 'overlay')}
            style={{
              padding: '4px 8px',
              borderRadius: '0',
              background: 'transparent',
              color: '#ffffff',
              fontFamily: 'monospace',
              letterSpacing: '0.3px',
              border: 'none',
              width: '100%'
            }}
          >
            <option value="replace">Replace</option>
            <option value="overlay">Overlay</option>
          </select>
        </div>

        {/* Background Color */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.3px' }}>Background:</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={e => setBackgroundColor(e.target.value)}
            style={{ marginLeft: '8px' }}
          />
        </div>

        {/* Show Grid */}
        <div style={{ fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.4px', marginBottom: '10px', fontSize: '0.9rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ minWidth: '90px' }}>Show Grid</span>
          </label>
        </div>

        {/* Transparent Toolbox */}
        <div style={{ fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.4px', marginBottom: '10px', fontSize: '0.9rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={panelTransparent}
              onChange={(e) => setPanelTransparent(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ minWidth: '90px' }}>Transparent Toolbox</span>
          </label>
        </div>

        {/* Recording Controls */}
        <div style={{ fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.4px', marginBottom: '10px', fontSize: '0.9rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={recordEnabled}
              onChange={(e) => setRecordEnabled(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ minWidth: '90px' }}>Recording</span>
          </label>
        </div>

        {recordEnabled && (
          <div style={{ marginBottom: '10px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                color: '#d1d5db',
                marginBottom: '6px',
              }}
            >
              Filename:
            </label>
            <input
              type="text"
              value={recordingFilename}
              onChange={(e) => setRecordingFilename(e.target.value)}
              placeholder="Enter filename (no extension)"
              style={{
                width: '100%',
                padding: '4px 8px',
                borderRadius: '0',
                border: '1px solid #333333',
                background: '#1a1a1a',
                color: '#ffffff',
                fontFamily: 'monospace',
                letterSpacing: '0.3px',
                fontSize: '0.9rem',
              }}
            />
            <div style={{ fontSize: '0.75rem', color: '#666666', fontFamily: 'monospace', marginTop: '4px' }}>
              Press <strong>R</strong> to start/stop recording
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
