import React from 'react';

interface AutoControlsProps {
  autoSpreading: boolean;
  autoDots: boolean;
  autoShapes: boolean;
  toggleAutoSpread: () => void;
  toggleAutoDots: () => void;
  toggleAutoShapes: () => void;
}

export function AutoControls({
  autoSpreading,
  autoDots,
  autoShapes,
  toggleAutoSpread,
  toggleAutoDots,
  toggleAutoShapes
}: AutoControlsProps) {
  const autoButtons = [
    { 
      label: autoSpreading ? 'Stop Spread' : 'Auto Spread', 
      onClick: toggleAutoSpread, 
      bg: autoSpreading ? '#dc2626' : '#16a34a' 
    },
    { 
      label: autoDots ? 'Stop Dots' : 'Auto Dots', 
      onClick: toggleAutoDots, 
      bg: autoDots ? '#dc2626' : '#f59e0b' 
    },
    { 
      label: autoShapes ? 'Stop Shapes' : 'Auto Shapes', 
      onClick: toggleAutoShapes, 
      bg: autoShapes ? '#dc2626' : '#8b5cf6' 
    }
  ];

  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
      {autoButtons.map(({ label, onClick, bg }) => (
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
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}