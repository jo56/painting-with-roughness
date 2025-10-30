import { useEffect, useRef, useState } from 'react';

export interface UseUIStateReturn {
  panelMinimized: boolean;
  panelVisible: boolean;
  panelTransparent: boolean;
  panelPos: { x: number; y: number };
  panelRef: React.RefObject<HTMLDivElement>;
  panelDimensions: React.RefObject<{ width: number; height: number }>;
  showSpeedSettings: boolean;
  showCanvasSettings: boolean;
  showVisualSettings: boolean;
  showGenerativeSettings: boolean;
  showStepControls: boolean;
  showAutoControls: boolean;
  showOptions: boolean;
  isMobile: boolean;
  currentTheme: number;
  currentThemeConfig: any;
  isDragging: React.RefObject<boolean>;
  dragOffset: React.RefObject<{ x: number; y: number }>;
  mousePos: React.RefObject<{ x: number; y: number }>;
  setPanelMinimized: (minimized: boolean) => void;
  setPanelVisible: (visible: boolean) => void;
  setPanelTransparent: (transparent: boolean) => void;
  setPanelPos: (pos: { x: number; y: number }) => void;
  setShowSpeedSettings: (show: boolean) => void;
  setShowCanvasSettings: (show: boolean) => void;
  setShowVisualSettings: (show: boolean) => void;
  setShowGenerativeSettings: (show: boolean) => void;
  setShowStepControls: (show: boolean) => void;
  setShowAutoControls: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowOptions: (show: boolean) => void;
  handleHeaderMouseDown: (e: React.MouseEvent) => void;
}

const LAUNCH_PANEL_POS = { x: 24, y: 20 };

export function useUIState(): UseUIStateReturn {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelDimensions = useRef({ width: 320, height: 400 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });

  const [panelMinimized, setPanelMinimized] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);
  const [panelTransparent, setPanelTransparent] = useState(false);
  const [panelPos, setPanelPos] = useState(() => {
    if (typeof window !== 'undefined') {
      return LAUNCH_PANEL_POS;
    }
    return { x: 20, y: 20 };
  });
  const [showSpeedSettings, setShowSpeedSettings] = useState(false);
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);
  const [showVisualSettings, setShowVisualSettings] = useState(false);
  const [showGenerativeSettings, setShowGenerativeSettings] = useState(false);
  const [showStepControls, setShowStepControls] = useState(false);
  const [showAutoControls, setShowAutoControls] = useState(true);
  const [showOptions, setShowOptions] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentTheme] = useState(0);

  const themes = {
    0: {
      name: 'Void',
      panel: {
        background: panelTransparent ? 'transparent' : '#0a0a0a',
        border: 'none',
        borderRadius: '0',
        boxShadow: 'none',
        backdropFilter: 'none'
      },
      header: {
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontWeight: '400',
        letterSpacing: '0.5px',
        textShadow: 'none',
        boxShadow: 'none',
        padding: '8px 0',
        marginBottom: '8px'
      },
      button: (active: boolean, type?: string) => ({
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: active ? '#ffffff' : '#666666',
        fontFamily: 'monospace',
        textTransform: 'none' as const,
        letterSpacing: '0.3px',
        fontWeight: active ? '500' : '400',
        textShadow: 'none',
        boxShadow: 'none',
        textDecoration: active ? 'underline' : 'none',
        textUnderlineOffset: active ? '4px' : '0',
        padding: '4px 8px',
        minHeight: 'auto',
        lineHeight: '1.2'
      }),
      clear: {
        background: 'transparent',
        color: '#ff6b6b',
        border: 'none',
        borderRadius: '0',
        fontFamily: 'monospace',
        textTransform: 'none',
        fontWeight: '400',
        textShadow: 'none',
        boxShadow: 'none',
        padding: '4px 8px',
        minHeight: 'auto',
        lineHeight: '1.2'
      },
      autoButton: (active: boolean, enabled: boolean) => ({
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: enabled ? (active ? '#ffffff' : '#666666') : '#333333',
        fontFamily: 'monospace',
        fontWeight: active ? '500' : '400',
        opacity: 1,
        cursor: enabled ? 'pointer' : 'not-allowed',
        textShadow: 'none',
        boxShadow: 'none',
        outline: 'none',
        textDecoration: active ? 'underline' : 'none',
        textUnderlineOffset: active ? '4px' : '0',
        padding: '4px 8px',
        minHeight: 'auto',
        lineHeight: '1.2'
      }),
      optionButton: (active: boolean) => ({
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: active ? '#ffffff' : '#666666',
        fontFamily: 'monospace',
        fontWeight: active ? '500' : '400',
        textTransform: 'none' as const,
        letterSpacing: '0.3px',
        textShadow: 'none',
        boxShadow: 'none',
        textDecoration: active ? 'underline' : 'none',
        textUnderlineOffset: active ? '4px' : '0',
        padding: '4px 8px',
        minHeight: 'auto',
        lineHeight: '1.2'
      })
    },
  };

  const currentThemeConfig = themes[currentTheme as keyof typeof themes];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 800;
      setIsMobile(mobile);
      if (!mobile) {
        setPanelPos(prev => ({ x: LAUNCH_PANEL_POS.x, y: prev.y }));
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (isDragging.current)
        setPanelPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const handleMouseUp = () => { isDragging.current = false; };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        e.preventDefault();

        if (!panelVisible) {
          setIsMobile(false);
          setPanelVisible(true);
          setPanelMinimized(false);

          const mouseX = mousePos.current.x || window.innerWidth / 2;
          const mouseY = mousePos.current.y || window.innerHeight / 2;

          const PANEL_WIDTH = panelDimensions.current.width;
          const PANEL_HEIGHT = panelDimensions.current.height;
          const MARGIN = 20;

          const newX = Math.max(
            MARGIN,
            Math.min(mouseX - PANEL_WIDTH / 2, window.innerWidth - PANEL_WIDTH - MARGIN)
          );
          const newY = Math.max(
            MARGIN,
            Math.min(mouseY - 20, window.innerHeight - PANEL_HEIGHT - MARGIN)
          );

          setPanelPos({ x: newX, y: newY });
        } else {
          setPanelVisible(false);
        }
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setPanelTransparent(prev => !prev);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [panelVisible]);

  useEffect(() => {
    if (panelVisible && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        panelDimensions.current = { width: rect.width, height: rect.height };
      }
    }
  }, [panelVisible, panelMinimized]);

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    isDragging.current = true;
    dragOffset.current = { x: e.clientX - panelPos.x, y: e.clientY - panelPos.y };
  };

  return {
    panelMinimized,
    panelVisible,
    panelTransparent,
    panelPos,
    panelRef,
    panelDimensions,
    showSpeedSettings,
    showCanvasSettings,
    showVisualSettings,
    showGenerativeSettings,
    showStepControls,
    showAutoControls,
    showOptions,
    isMobile,
    currentTheme,
    currentThemeConfig,
    isDragging,
    dragOffset,
    mousePos,
    setPanelMinimized,
    setPanelVisible,
    setPanelTransparent,
    setPanelPos,
    setShowSpeedSettings,
    setShowCanvasSettings,
    setShowVisualSettings,
    setShowGenerativeSettings,
    setShowStepControls,
    setShowAutoControls,
    setShowOptions,
    handleHeaderMouseDown,
  };
}
