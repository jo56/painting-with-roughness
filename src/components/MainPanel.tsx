import React from 'react';
import { Theme } from '../types/ui';

interface MainPanelProps {
  panelRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  panelPos: { x: number; y: number };
  panelVisible: boolean;
  panelMinimized: boolean;
  setPanelMinimized: (minimized: boolean | ((prev: boolean) => boolean)) => void;
  currentThemeConfig: Theme;
  handleHeaderMouseDown: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export function MainPanel({
  panelRef,
  isMobile,
  panelPos,
  panelVisible,
  panelMinimized,
  setPanelMinimized,
  currentThemeConfig,
  handleHeaderMouseDown,
  children,
}: MainPanelProps) {
  return (
    <div
      ref={panelRef}
      style={{
        position: isMobile ? 'relative' : 'fixed',
        top: isMobile ? undefined : panelPos.y,
        left: isMobile ? undefined : panelPos.x,
        margin: isMobile ? '0 auto' : undefined,
        padding: '20px',
        width: isMobile ? 'calc(100% - 20px)' : 'auto',
        maxWidth: '480px',
        zIndex: 10,
        display: panelVisible ? 'block' : 'none',
        ...currentThemeConfig.panel,
      }}
    >
      <div
        onMouseDown={handleHeaderMouseDown}
        style={{
          ...currentThemeConfig.header,
          marginBottom: '16px',
          cursor: 'move',
          padding: '8px 12px',
          fontSize: '18px',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <span>painting-with-roughness</span>
        <button
          onClick={() => setPanelMinimized((prev) => !prev)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontFamily: 'monospace',
            letterSpacing: '0.3px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            marginLeft: '4px',
          }}
        >
          {panelMinimized ? '+' : '-'}
        </button>
      </div>

      <div
        style={{
          maxHeight: panelMinimized ? '0px' : '80vh',
          overflow: panelMinimized ? 'hidden' : 'auto',
          transition: 'max-height 0.3s ease',
        }}
        className="scrollable-settings"
      >
        <div
          style={{
            opacity: panelMinimized ? 0 : 1,
            transition: 'opacity 0.3s ease',
            pointerEvents: panelMinimized ? 'none' : 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
