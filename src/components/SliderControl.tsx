import React from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange
}: SliderControlProps) {
  const displayValue = label === 'Spread Rate' ? 
    `${Math.round(value * 100)}${unit}` : 
    `${value}${unit}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <label style={{ width: '100px', fontWeight: 600 }}>{label}:</label>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, height: '8px', borderRadius: '4px' }}
        />
        <span style={{ minWidth: '60px', textAlign: 'right', fontSize: '0.95rem' }}>
          {displayValue}
        </span>
      </div>
    </div>
  );
}