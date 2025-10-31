import React from 'react';
import { Theme } from '../types/ui';

interface OptionsToggleProps {
  showOptions: boolean;
  setShowOptions: (value: boolean | ((prev: boolean) => boolean)) => void;
  showSpeedSettings: boolean;
  showCanvasSettings: boolean;
  showVisualSettings: boolean;
  showGenerativeSettings: boolean;
  showStepControls: boolean;
  setShowSpeedSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowCanvasSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowVisualSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowGenerativeSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowStepControls: (value: boolean | ((prev: boolean) => boolean)) => void;
  currentThemeConfig: Theme;
}

export function OptionsToggle({
  showOptions,
  setShowOptions,
  showSpeedSettings,
  showCanvasSettings,
  showVisualSettings,
  showGenerativeSettings,
  showStepControls,
  setShowSpeedSettings,
  setShowCanvasSettings,
  setShowVisualSettings,
  setShowGenerativeSettings,
  setShowStepControls,
  currentThemeConfig,
}: OptionsToggleProps) {
  const sectionToggles = [
    { label: 'Speed', onClick: () => setShowSpeedSettings(prev => !prev), active: showSpeedSettings },
    { label: 'Canvas', onClick: () => setShowCanvasSettings(prev => !prev), active: showCanvasSettings },
    { label: 'Visual', onClick: () => setShowVisualSettings(prev => !prev), active: showVisualSettings },
    { label: 'Generative', onClick: () => setShowGenerativeSettings(prev => !prev), active: showGenerativeSettings },
    { label: 'Steps', onClick: () => setShowStepControls(prev => !prev), active: showStepControls }
  ];

  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-start' }}>
      {sectionToggles.map(({ label, onClick, active }) => (
        <button
          key={label}
          onClick={onClick}
          style={{
            padding: '4px 8px',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            minWidth: '70px',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            ...currentThemeConfig.optionButton(active)
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
