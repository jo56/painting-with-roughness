import React from 'react';

interface PaletteSectionProps {
  palette: string[];
  selectedColor: number;
  customColor: string;
  isSavingColor: boolean;
  panelRef: React.RefObject<HTMLDivElement | null>;
  handlePaletteClick: (index: number) => void;
  setCustomColor: (value: string) => void;
  setSelectedColor: (value: number) => void;
  setIsSavingColor: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function PaletteSection({
  palette,
  selectedColor,
  customColor,
  isSavingColor,
  panelRef,
  handlePaletteClick,
  setCustomColor,
  setSelectedColor,
  setIsSavingColor,
}: PaletteSectionProps) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
        {palette.slice(1).map((color, index) => (
          <button
            key={index + 1}
            onClick={() => handlePaletteClick(index + 1)}
            title={isSavingColor ? `Save ${customColor} to this slot` : `Select ${color}`}
            style={{
              width: '32px',
              height: '32px',
              background: color,
              border: selectedColor === index + 1 ? '2px solid #fff' : '1px solid #666',
              borderRadius: '0',
              cursor: 'pointer',
              outline: isSavingColor ? '2px dashed #54a0ff' : 'none',
              outlineOffset: '2px',
              transition: 'outline 0.2s'
            }}
          />
        ))}

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <div
            style={{
              position: 'relative',
              width: '32px',
              height: '32px',
              borderRadius: '0',
              border: selectedColor === palette.length ? '2px solid #fff' : '1px solid #666',
              background: `linear-gradient(135deg, ${customColor} 25%, transparent 25%, transparent 50%, ${customColor} 50%, ${customColor} 75%, transparent 75%)`,
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => {
              const colorInput = panelRef.current?.querySelector('input[type="color"]') as HTMLInputElement;
              if (colorInput) {
                colorInput.click();
              }
              setSelectedColor(palette.length);
              setIsSavingColor(false);
            }}
          >
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              style={{
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                width: '52px',
                height: '52px',
                border: 'none',
                cursor: 'pointer',
                opacity: 0,
                pointerEvents: 'none'
              }}
            />
          </div>
          <button
            onClick={() => setIsSavingColor(prev => !prev)}
            title={isSavingColor ? "Cancel saving" : "Save this color to a slot"}
            style={{
              visibility: selectedColor === palette.length ? 'visible' : 'hidden',
              padding: '4px 8px',
              height: '32px',
              borderRadius: '0',
              background: 'transparent',
              color: isSavingColor ? '#ffffff' : '#666666',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontFamily: 'monospace',
              fontWeight: 'normal',
              whiteSpace: 'nowrap',
              minWidth: '75px',
              textAlign: 'center',
              outline: 'none',
              textDecoration: isSavingColor ? 'underline' : 'none',
              textUnderlineOffset: isSavingColor ? '4px' : '0'
            }}
          >
            {isSavingColor ? 'Cancel' : 'Save'}
          </button>
        </div>
      </div>
      {isSavingColor && (
        <div style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'monospace', marginTop: '6px' }}>
          Select a palette or generative color slot to replace it.
        </div>
      )}
    </div>
  );
}
