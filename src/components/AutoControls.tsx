import React from 'react';
import { Theme } from '../types/ui';

interface AutoControlsProps {
  showAutoControls: boolean;
  setShowAutoControls: (value: boolean | ((prev: boolean) => boolean)) => void;
  autoSpreading: boolean;
  autoDots: boolean;
  autoShapes: boolean;
  autoSpreadEnabled: boolean;
  autoDotsEnabled: boolean;
  autoShapesEnabled: boolean;
  toggleAutoSpread: () => void;
  toggleAutoDots: () => void;
  toggleAutoShapes: () => void;
  setAutoSpreadEnabled: (value: boolean) => void;
  setAutoDotsEnabled: (value: boolean) => void;
  setAutoShapesEnabled: (value: boolean) => void;
  setIsSavingColor: (value: boolean) => void;
  currentThemeConfig: Theme;
}

export function AutoControls({
  showAutoControls,
  setShowAutoControls,
  autoSpreading,
  autoDots,
  autoShapes,
  autoSpreadEnabled,
  autoDotsEnabled,
  autoShapesEnabled,
  toggleAutoSpread,
  toggleAutoDots,
  toggleAutoShapes,
  setAutoSpreadEnabled,
  setAutoDotsEnabled,
  setAutoShapesEnabled,
  setIsSavingColor,
  currentThemeConfig,
}: AutoControlsProps) {
  // Compute derived values
  const isAnyRunning = autoSpreading || autoDots || autoShapes;
  const anyEnabled = autoSpreadEnabled || autoDotsEnabled || autoShapesEnabled;

  const startAllEnabled = () => {
    if (autoSpreadEnabled && !autoSpreading) toggleAutoSpread();
    if (autoDotsEnabled && !autoDots) toggleAutoDots();
    if (autoShapesEnabled && !autoShapes) toggleAutoShapes();
  };

  const stopAll = () => {
    if (autoSpreading) toggleAutoSpread();
    if (autoDots) toggleAutoDots();
    if (autoShapes) toggleAutoShapes();
  };

  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
      <button
        onClick={() => {
          setIsSavingColor(false);
          toggleAutoSpread();
        }}
        disabled={!autoSpreadEnabled}
        style={{
          padding: '4px 8px',
          fontSize: '0.9rem',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
          minWidth: '80px',
          textAlign: 'center',
          ...currentThemeConfig.autoButton(autoSpreading, autoSpreadEnabled)
        }}
      >
        {autoSpreading ? 'Stop Spread' : 'Start Spread'}
      </button>
      {[
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
          onClick={() => {
            setIsSavingColor(false);
            onClick();
          }}
          disabled={!enabled}
          style={{
            padding: '4px 8px',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            minWidth: '80px',
            textAlign: 'center',
            ...currentThemeConfig.autoButton(active, enabled)
          }}
        >
          {label}
        </button>
      ))}
      <button
        onClick={() => {
          setIsSavingColor(false);
          isAnyRunning ? stopAll() : startAllEnabled();
        }}
        disabled={!anyEnabled && !isAnyRunning}
        style={{
          padding: '4px 8px',
          fontSize: '0.9rem',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
          minWidth: '80px',
          textAlign: 'center',
          ...currentThemeConfig.autoButton(isAnyRunning, anyEnabled || isAnyRunning)
        }}
      >
        {isAnyRunning ? 'Stop All' : 'Start All'}
      </button>
    </div>
  );
}
