import React from 'react';
import { Tool } from '../types';

interface ToolSelectorProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
}

export function ToolSelector({ tool, setTool }: ToolSelectorProps) {
  const tools: { label: string; value: Tool }[] = [
    { label: 'Brush', value: 'brush' },
    { label: 'Fill', value: 'fill' },
    { label: 'Eraser', value: 'eraser' }
  ];

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>Tool:</label>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {tools.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setTool(value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: tool === value ? '#06b6d4' : '#374151',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'normal',
              fontSize: '0.95rem'
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}