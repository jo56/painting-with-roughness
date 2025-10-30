import React from 'react';

interface StepControlsProps {
  showStepControls: boolean;
  setShowStepControls: (value: boolean | ((prev: boolean) => boolean)) => void;
  colorSpread: () => void;
  addRandomDots: () => void;
  addRandomShapes: () => void;
  setIsSavingColor: (value: boolean) => void;
  currentThemeConfig: any;
}

export function StepControls({
  showStepControls,
  setShowStepControls,
  colorSpread,
  addRandomDots,
  addRandomShapes,
  setIsSavingColor,
  currentThemeConfig,
}: StepControlsProps) {
  const actions = [
    { label: 'Spread Once', onClick: colorSpread },
    { label: 'Add Dots', onClick: addRandomDots },
    { label: 'Add Shapes', onClick: addRandomShapes }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      marginBottom: '6px',
      flexWrap: 'wrap'
    }}>
      {actions.map(({ label, onClick }) => (
        <button
          key={label}
          onClick={() => {
            setIsSavingColor(false);
            onClick();
          }}
          style={{
            padding: '4px 8px',
            borderRadius: '0',
            background: 'transparent',
            color: '#ffffff',
            fontFamily: 'monospace',
            letterSpacing: '0.3px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'normal',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
