import { useRef, useCallback } from 'react';

export function useAutoAnimation() {
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const autoDotsRef = useRef<number | null>(null);
  const autoShapesRef = useRef<number | null>(null);
  const dotsRunningRef = useRef(false);
  const shapesRunningRef = useRef(false);

  const runAutoSpread = useCallback((
    colorSpread: () => void,
    autoSpreadSpeedRef: React.MutableRefObject<number>
  ) => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (!runningRef.current) return;
      const interval = 1000 / Math.max(0.25, autoSpreadSpeedRef.current);
      if (time - lastTime >= interval) {
        colorSpread();
        lastTime = time;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const runAutoDots = useCallback((
    addRandomDots: () => void,
    autoDotsSpeedRef: React.MutableRefObject<number>
  ) => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (!dotsRunningRef.current) return;
      const interval = 1000 / Math.max(0.1, autoDotsSpeedRef.current);
      if (time - lastTime >= interval) {
        addRandomDots();
        lastTime = time;
      }
      autoDotsRef.current = requestAnimationFrame(loop);
    };
    autoDotsRef.current = requestAnimationFrame(loop);
  }, []);

  const runAutoShapes = useCallback((
    addRandomShapes: () => void,
    autoShapesSpeedRef: React.MutableRefObject<number>
  ) => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (!shapesRunningRef.current) return;
      const interval = 1000 / Math.max(0.1, autoShapesSpeedRef.current);
      if (time - lastTime >= interval) {
        addRandomShapes();
        lastTime = time;
      }
      autoShapesRef.current = requestAnimationFrame(loop);
    };
    autoShapesRef.current = requestAnimationFrame(loop);
  }, []);

  const stopAutoSpread = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  const stopAutoDots = () => {
    if (autoDotsRef.current) {
      cancelAnimationFrame(autoDotsRef.current);
    }
  };

  const stopAutoShapes = () => {
    if (autoShapesRef.current) {
      cancelAnimationFrame(autoShapesRef.current);
    }
  };

  return {
    runningRef,
    dotsRunningRef,
    shapesRunningRef,
    runAutoSpread,
    runAutoDots,
    runAutoShapes,
    stopAutoSpread,
    stopAutoDots,
    stopAutoShapes
  };
}