import { useRef, useEffect } from 'react';
import { PanelPosition } from '../types';

export function usePanelDrag(
  isMobile: boolean,
  panelPos: PanelPosition,
  setPanelPos: (pos: PanelPosition) => void,
  setIsMobile: (mobile: boolean) => void
) {
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    isDragging.current = true;
    dragOffset.current = { x: e.clientX - panelPos.x, y: e.clientY - panelPos.y };
  };

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
        setIsMobile(false);
        const mouseX = mousePos.current.x || window.innerWidth / 2;
        const mouseY = mousePos.current.y || window.innerHeight / 2;
        const newX = Math.max(10, Math.min(mouseX - 200, window.innerWidth - 440));
        const newY = Math.max(10, Math.min(mouseY - 50, window.innerHeight - 400));
        setPanelPos({ x: newX, y: newY });
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
  }, [isMobile, panelPos, setPanelPos, setIsMobile]);

  return { handleHeaderMouseDown };
}