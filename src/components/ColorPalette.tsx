import React from 'react';
import { colorPalette } from '../constants';

interface ColorPaletteProps {
  selectedColor: number;
  setSelectedColor: (color: number) => void;
}

export function ColorPalette({ selectedColor, setSelectedColor }: ColorPaletteProps) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>Colors:</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
        {colorPalette.slice(1).map((color, index) => (
          <button
            key={index + 1}
            onClick={() => setSelectedColor(index + 1)}
            style={{
              width: '32px',
              height: '32px',
              background: color,
              border: selectedColor === index + 1 ? '3px solid #fff' : '1px solid #666',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          />
        ))}
      </div>
    </div>
  );
}