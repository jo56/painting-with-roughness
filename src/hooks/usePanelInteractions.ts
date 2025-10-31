import { useEffect, useRef } from 'react';
import { useUIStore } from '../stores/uiStore';

const LAUNCH_PANEL_POS = { x: 24, y: 20 };

/**
 * Hook to handle panel dragging, visibility, and keyboard shortcuts
 */
export function usePanelInteractions() {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelDimensions = useRef({ width: 320, height: 400 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });

  const {
    panelVisible,
    panelMinimized,
    isMobile,
    setPanelVisible,
    setPanelMinimized,
    setPanelPos,
    setPanelTransparent,
    setIsMobile,
  } = useUIStore();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 800;
      setIsMobile(mobile);
      if (!mobile) {
        setPanelPos((prev) => ({ x: LAUNCH_PANEL_POS.x, y: prev.y }));
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile, setPanelPos]);

  // Handle mouse and keyboard events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (isDragging.current) {
        setPanelPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

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
        setPanelTransparent((prev) => !prev);
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
  }, [panelVisible, setPanelVisible, setPanelMinimized, setPanelPos, setPanelTransparent, setIsMobile]);

  // Update panel dimensions when visible/minimized changes
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
    const panelPos = useUIStore.getState().panelPos;
    dragOffset.current = { x: e.clientX - panelPos.x, y: e.clientY - panelPos.y };
  };

  return {
    panelRef,
    panelDimensions,
    isDragging,
    dragOffset,
    mousePos,
    handleHeaderMouseDown,
  };
}
