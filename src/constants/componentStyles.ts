import { CSSProperties } from 'react';

export const LABEL_STYLE: CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: '400',
  fontFamily: 'monospace',
  color: '#ffffff',
  letterSpacing: '0.3px'
};

export const VALUE_DISPLAY_STYLE: CSSProperties = {
  fontSize: '0.8rem',
  color: '#666666',
  fontFamily: 'monospace'
};

export const SLIDER_CONTAINER_STYLE: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2px'
};

export const SLIDER_INPUT_STYLE: CSSProperties = {
  width: '100%',
  height: '6px'
};

export const SETTINGS_SECTION_STYLE: CSSProperties = {
  background: 'transparent',
  padding: '8px',
  borderRadius: '0',
  border: 'none'
};

export const SETTINGS_ITEM_STYLE: CSSProperties = {
  marginBottom: '8px'
};
