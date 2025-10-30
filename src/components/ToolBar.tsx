interface ToolBarProps {
  tool: string;
  setTool: (tool: string) => void;
  setIsSavingColor: (value: boolean) => void;
  showAutoControls: boolean;
  setShowAutoControls: (value: boolean | ((prev: boolean) => boolean)) => void;
  themeConfig: any;
}

export function ToolBar({
  tool,
  setTool,
  setIsSavingColor,
  showAutoControls,
  setShowAutoControls,
  themeConfig,
}: ToolBarProps) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { label: 'Brush', value: 'brush' },
          { label: 'Fill', value: 'fill' },
          { label: 'Eraser', value: 'eraser' }
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setTool(value); setIsSavingColor(false); }}
            style={{
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              minWidth: '60px',
              textAlign: 'center' as const,
              transition: 'all 0.2s ease',
              ...themeConfig.button(tool === value, value)
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
            ...themeConfig.button(showAutoControls, 'auto')
          }}
        >
          Auto
        </button>
      </div>
    </div>
  );
}
