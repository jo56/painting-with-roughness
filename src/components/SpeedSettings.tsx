import React from 'react';
import { Theme } from '../types/ui';
import {
  LABEL_STYLE,
  VALUE_DISPLAY_STYLE,
  SLIDER_CONTAINER_STYLE,
  SLIDER_INPUT_STYLE,
  SETTINGS_ITEM_STYLE
} from '../constants/componentStyles';

interface SpeedSettingsProps {
  showSpeedSettings: boolean;
  setShowSpeedSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  autoSpreadSpeed: number;
  autoDotsSpeed: number;
  autoShapesSpeed: number;
  spreadProbability: number;
  setAutoSpreadSpeed: (value: number) => void;
  setAutoDotsSpeed: (value: number) => void;
  setAutoShapesSpeed: (value: number) => void;
  setSpreadProbability: (value: number) => void;
  panelTransparent: boolean;
  currentThemeConfig: Theme;
}

export function SpeedSettings({
  showSpeedSettings,
  setShowSpeedSettings,
  autoSpreadSpeed,
  autoDotsSpeed,
  autoShapesSpeed,
  spreadProbability,
  setAutoSpreadSpeed,
  setAutoDotsSpeed,
  setAutoShapesSpeed,
  setSpreadProbability,
  panelTransparent,
  currentThemeConfig,
}: SpeedSettingsProps) {
  const settings = [
    { label: 'Spread Rate', value: spreadProbability, min: 0, max: 1, step: 0.01, setter: setSpreadProbability, unit: '%', isRate: true },
    { label: 'Spread Speed', value: autoSpreadSpeed, min: 0.25, max: 100, step: 0.25, setter: setAutoSpreadSpeed, unit: '/s', isRate: false },
    { label: 'Dots Speed', value: autoDotsSpeed, min: 0.1, max: 100, step: 0.1, setter: setAutoDotsSpeed, unit: '/s', isRate: false },
    { label: 'Shapes Speed', value: autoShapesSpeed, min: 0.1, max: 100, step: 0.1, setter: setAutoShapesSpeed, unit: '/s', isRate: false }
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
        Speed Controls
      </label>
      {settings.map(({ label, value, min, max, step, setter, unit, isRate }) => (
        <div key={label} style={SETTINGS_ITEM_STYLE}>
          <div style={SLIDER_CONTAINER_STYLE}>
            <label style={LABEL_STYLE}>
              {label}:
            </label>
            <span style={VALUE_DISPLAY_STYLE}>
              {isRate ? `${Math.round(value * 100)}${unit}` : `${value}${unit}`}
            </span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setter(Number(e.target.value))}
            style={SLIDER_INPUT_STYLE}
          />
        </div>
      ))}
    </div>
  );
}
