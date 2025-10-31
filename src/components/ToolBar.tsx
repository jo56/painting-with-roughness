import React from 'react';
import { Theme } from '../types/ui';

interface ToolBarProps {
  tool: string;
  setTool: (tool: string) => void;
  setIsSavingColor: (value: boolean) => void;
  showAutoControls: boolean;
  setShowAutoControls: (value: boolean | ((prev: boolean) => boolean)) => void;
  currentThemeConfig: Theme;
  clearButtonRef: React.RefObject<HTMLButtonElement | null>;
  clear: () => void;
  clearButtonColor: string;
}

export function ToolBar({
  tool,
  setTool,
  setIsSavingColor,
  showAutoControls,
  setShowAutoControls,
  currentThemeConfig,
  clearButtonRef,
  clear,
  clearButtonColor,
}: ToolBarProps) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        {[
          { label: 'Brush', value: 'brush' },
          { label: 'Fill', value: 'fill' },
          { label: 'Eraser', value: 'eraser' },
          { label: 'Eyedrop', value: 'eyedropper' }
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setTool(value); setIsSavingColor(false); }}
            style={{
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              minWidth: '60px',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              ...currentThemeConfig.button(tool === value, value)
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setShowAutoControls(prev => !prev)}
          style={{
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            minWidth: '50px',
            textAlign: 'center' as const,
            transition: 'all 0.2s ease',
            ...currentThemeConfig.button(showAutoControls, 'auto')
          }}
        >
          Auto
        </button>
        <button
          ref={clearButtonRef}
          onClick={() => { clear(); setIsSavingColor(false); }}
          style={{
            ...currentThemeConfig.clear,
            color: clearButtonColor,
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            minWidth: '50px',
            textAlign: 'center' as const,
            transition: 'all 0.2s ease',
            fontWeight: 'bold',
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
