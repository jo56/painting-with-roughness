import React from 'react';

interface ActionButtonsProps {
  colorSpread: () => void;
  addRandomDots: () => void;
  addRandomShapes: () => void;
  clear: () => void;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
}

export function ActionButtons({
  colorSpread,
  addRandomDots,
  addRandomShapes,
  clear,
  showAdvanced,
  setShowAdvanced
}: ActionButtonsProps) {
  const buttons = [
    { label: 'Spread Once', onClick: colorSpread, bg: '#7c3aed' },
    { label: 'Add Dots', onClick: addRandomDots, bg: '#ea580c' },
    { label: 'Add Shapes', onClick: addRandomShapes, bg: '#f59e0b' },
    { label: 'Clear', onClick: clear, bg: '#991b1b' },
    { label: 'Adv.', onClick: () => setShowAdvanced(!showAdvanced), bg: '#374151' }
  ];

  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
      {buttons.map(({ label, onClick, bg }) => (
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