import { useCallback, useEffect, useRef, useState } from 'react';
import * as movementAlgorithms from '../algorithms/movement';
import * as cellularAlgorithms from '../algorithms/cellular';
import * as chaosAlgorithms from '../algorithms/chaos';
import * as drawingUtils from '../utils/drawing';
import type { Direction, SpreadPattern } from '../types';

export interface UseAutomationReturn {
  autoSpreading: boolean;
  autoDots: boolean;
  autoShapes: boolean;
  autoSpreadSpeed: number;
  autoDotsSpeed: number;
  autoShapesSpeed: number;
  autoSpreadEnabled: boolean;
  autoDotsEnabled: boolean;
  autoShapesEnabled: boolean;
  rafRef: React.RefObject<number | null>;
  runningRef: React.RefObject<boolean>;
  autoDotsRef: React.RefObject<number | null>;
  autoShapesRef: React.RefObject<number | null>;
  dotsRunningRef: React.RefObject<boolean>;
  shapesRunningRef: React.RefObject<boolean>;
  walkers: React.RefObject<{r: number, c: number, color: number}[]>;
  strobeStateRef: React.RefObject<boolean>;
  ripplesRef: React.RefObject<{r: number, c: number, color: number, radius: number, maxRadius: number}[]>;
  autoSpreadEnabledRef: React.RefObject<boolean>;
  autoDotsEnabledRef: React.RefObject<boolean>;
  autoShapesEnabledRef: React.RefObject<boolean>;
  autoSpreadSpeedRef: React.RefObject<number>;
  autoDotsSpeedRef: React.RefObject<number>;
  autoShapesSpeedRef: React.RefObject<number>;
  setAutoSpreading: (spreading: boolean) => void;
  setAutoDots: (dots: boolean) => void;
  setAutoShapes: (shapes: boolean) => void;
  setAutoSpreadSpeed: (speed: number) => void;
  setAutoDotsSpeed: (speed: number) => void;
  setAutoShapesSpeed: (speed: number) => void;
  setAutoSpreadEnabled: (enabled: boolean) => void;
  setAutoDotsEnabled: (enabled: boolean) => void;
  setAutoShapesEnabled: (enabled: boolean) => void;
  colorSpread: () => void;
  addRandomDots: () => void;
  addRandomShapes: () => void;
  toggleAutoSpread: () => void;
  toggleAutoDots: () => void;
  toggleAutoShapes: () => void;
  startAllEnabled: () => void;
  stopAll: () => void;
}

interface AutomationDeps {
  grid: number[][];
  setGrid: React.Dispatch<React.SetStateAction<number[][]>>;
  palette: string[];
  generativeColorIndicesRef: React.RefObject<number[]>;
  spreadPatternRef: React.RefObject<SpreadPattern>;
  spreadProbabilityRef: React.RefObject<number>;
  pulseSpeedRef: React.RefObject<number>;
  pulseDirectionRef: React.RefObject<Direction>;
  pulseOvertakesRef: React.RefObject<boolean>;
  directionalBiasRef: React.RefObject<'none' | Direction>;
  directionalBiasStrengthRef: React.RefObject<number>;
  randomWalkModeRef: React.RefObject<'any' | 'cardinal'>;
  randomWalkSpreadCountRef: React.RefObject<number>;
  conwayRulesRef: React.RefObject<{ born: number[]; survive: number[] }>;
  tendrilsRulesRef: React.RefObject<{ born: number[]; survive: number[] }>;
  veinSeekStrengthRef: React.RefObject<number>;
  veinBranchChanceRef: React.RefObject<number>;
  crystallizeThresholdRef: React.RefObject<number>;
  erosionRateRef: React.RefObject<number>;
  erosionSolidityRef: React.RefObject<number>;
  flowDirectionRef: React.RefObject<Direction>;
  flowChanceRef: React.RefObject<number>;
  jitterChanceRef: React.RefObject<number>;
  vortexCountRef: React.RefObject<number>;
  strobeExpandThresholdRef: React.RefObject<number>;
  strobeContractThresholdRef: React.RefObject<number>;
  scrambleSwapsRef: React.RefObject<number>;
  rippleChanceRef: React.RefObject<number>;
}

export function useAutomation(deps: AutomationDeps): UseAutomationReturn {
  const defaults = {
    autoSpreadSpeed: 3,
    autoDotsSpeed: 2,
    autoShapesSpeed: 1,
  };

  const [autoSpreadSpeed, setAutoSpreadSpeed] = useState(defaults.autoSpreadSpeed);
  const [autoDotsSpeed, setAutoDotsSpeed] = useState(defaults.autoDotsSpeed);
  const [autoShapesSpeed, setAutoShapesSpeed] = useState(defaults.autoShapesSpeed);
  const [autoSpreading, setAutoSpreading] = useState(false);
  const [autoDots, setAutoDots] = useState(false);
  const [autoShapes, setAutoShapes] = useState(false);
  const [autoSpreadEnabled, setAutoSpreadEnabled] = useState(true);
  const [autoDotsEnabled, setAutoDotsEnabled] = useState(true);
  const [autoShapesEnabled, setAutoShapesEnabled] = useState(true);

  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const autoDotsRef = useRef<number | null>(null);
  const autoShapesRef = useRef<number | null>(null);
  const dotsRunningRef = useRef(false);
  const shapesRunningRef = useRef(false);
  const walkers = useRef<{r: number, c: number, color: number}[]>([]);
  const strobeStateRef = useRef(true);
  const ripplesRef = useRef<{r: number, c: number, color: number, radius: number, maxRadius: number}[]>([]);
  const autoSpreadEnabledRef = useRef(autoSpreadEnabled);
  const autoDotsEnabledRef = useRef(autoDotsEnabled);
  const autoShapesEnabledRef = useRef(autoShapesEnabled);
  const autoSpreadSpeedRef = useRef(autoSpreadSpeed);
  const autoDotsSpeedRef = useRef(autoDotsSpeed);
  const autoShapesSpeedRef = useRef(autoShapesSpeed);

  useEffect(() => { autoSpreadEnabledRef.current = autoSpreadEnabled; }, [autoSpreadEnabled]);
  useEffect(() => { autoDotsEnabledRef.current = autoDotsEnabled; }, [autoDotsEnabled]);
  useEffect(() => { autoShapesEnabledRef.current = autoShapesEnabled; }, [autoShapesEnabled]);
  useEffect(() => { autoSpreadSpeedRef.current = autoSpreadSpeed; }, [autoSpreadSpeed]);
  useEffect(() => { autoDotsSpeedRef.current = autoDotsSpeed; }, [autoDotsSpeed]);
  useEffect(() => { autoShapesSpeedRef.current = autoShapesSpeed; }, [autoShapesSpeed]);

  const colorSpread = useCallback(() => {
    const pattern = deps.spreadPatternRef.current;

    deps.setGrid(g => {
      let ng = g;

      switch (pattern) {
        case 'ripple': {
          const result = movementAlgorithms.ripple(g, ripplesRef.current, deps.rippleChanceRef.current!);
          ng = result.newGrid;
          ripplesRef.current = result.newRipples;
          break;
        }
        case 'scramble': {
          ng = chaosAlgorithms.scramble(g, deps.scrambleSwapsRef.current!);
          break;
        }
        case 'vortex': {
          ng = movementAlgorithms.vortex(g, deps.vortexCountRef.current!);
          break;
        }
        case 'strobe': {
          strobeStateRef.current = !strobeStateRef.current;
          ng = chaosAlgorithms.strobe(
            g,
            strobeStateRef.current,
            deps.strobeExpandThresholdRef.current!,
            deps.strobeContractThresholdRef.current!
          );
          break;
        }
        case 'jitter': {
          ng = chaosAlgorithms.jitter(g, deps.jitterChanceRef.current!);
          break;
        }
        case 'flow': {
          ng = movementAlgorithms.flow(g, deps.flowDirectionRef.current!, deps.flowChanceRef.current!);
          break;
        }
        case 'vein': {
          const result = cellularAlgorithms.vein(
            g,
            walkers.current,
            deps.veinSeekStrengthRef.current!,
            deps.veinBranchChanceRef.current!
          );
          ng = result.newGrid;
          walkers.current = result.newWalkers;
          break;
        }
        case 'crystallize': {
          ng = cellularAlgorithms.crystallize(g, deps.crystallizeThresholdRef.current!);
          break;
        }
        case 'erosion': {
          ng = chaosAlgorithms.erosion(g, deps.erosionRateRef.current!, deps.erosionSolidityRef.current!);
          break;
        }
        case 'tendrils':
        case 'conway': {
          const rules = pattern === 'conway' ? deps.conwayRulesRef.current! : deps.tendrilsRulesRef.current!;
          ng = cellularAlgorithms.conway(g, rules, deps.generativeColorIndicesRef.current!);
          break;
        }
        case 'pulse': {
          ng = movementAlgorithms.pulse(g, deps.pulseDirectionRef.current!, deps.pulseOvertakesRef.current!);
          break;
        }
        case 'random': {
          ng = chaosAlgorithms.randomWalk(
            g,
            deps.spreadProbabilityRef.current!,
            deps.randomWalkModeRef.current!,
            deps.randomWalkSpreadCountRef.current!
          );
          break;
        }
        case 'directional': {
          ng = movementAlgorithms.directional(
            g,
            deps.spreadProbabilityRef.current!,
            deps.directionalBiasRef.current!,
            deps.directionalBiasStrengthRef.current!
          );
          break;
        }
      }
      return ng;
    });
  }, [deps]);

  const addRandomDots = useCallback(() => {
    deps.setGrid(g => {
      const availableColors = deps.generativeColorIndicesRef.current!.length > 0
        ? deps.generativeColorIndicesRef.current!
        : deps.palette.slice(1).map((_, i) => i + 1);
      return drawingUtils.addRandomDots({ grid: g, availableColors });
    });
  }, [deps]);

  const addRandomShapes = useCallback(() => {
    deps.setGrid(g => {
      const availableColors = deps.generativeColorIndicesRef.current!.length > 0
        ? deps.generativeColorIndicesRef.current!
        : deps.palette.slice(1).map((_, i) => i + 1);
      return drawingUtils.addRandomShapes({ grid: g, availableColors });
    });
  }, [deps]);

  const runAutoSpread = useCallback(() => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (!runningRef.current) return;

      const pattern = deps.spreadPatternRef.current!;
      const speed = pattern === 'pulse'
        ? deps.pulseSpeedRef.current!
        : autoSpreadSpeedRef.current;

      const interval = 1000 / Math.max(0.25, speed);

      if (time - lastTime >= interval) {
        colorSpread();
        lastTime = time;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [colorSpread, deps]);

  const runAutoDots = useCallback(() => {
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
  }, [addRandomDots]);

  const runAutoShapes = useCallback(() => {
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
  }, [addRandomShapes]);

  const toggleAutoSpread = useCallback(() => {
    runningRef.current = !runningRef.current;
    setAutoSpreading(runningRef.current);
    if (runningRef.current) {
      if (deps.spreadPatternRef.current === 'vein') walkers.current = [];
      if (deps.spreadPatternRef.current === 'strobe') strobeStateRef.current = true;
      if (deps.spreadPatternRef.current === 'ripple') ripplesRef.current = [];
      runAutoSpread();
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, [runAutoSpread, deps]);

  const toggleAutoDots = useCallback(() => {
    dotsRunningRef.current = !dotsRunningRef.current;
    setAutoDots(dotsRunningRef.current);
    if (dotsRunningRef.current) {
      runAutoDots();
    } else if (autoDotsRef.current) {
      cancelAnimationFrame(autoDotsRef.current);
    }
  }, [runAutoDots]);

  const toggleAutoShapes = useCallback(() => {
    shapesRunningRef.current = !shapesRunningRef.current;
    setAutoShapes(shapesRunningRef.current);
    if (shapesRunningRef.current) {
      runAutoShapes();
    } else if (autoShapesRef.current) {
      cancelAnimationFrame(autoShapesRef.current);
    }
  }, [runAutoShapes]);

  const startAllEnabled = useCallback(() => {
    if (autoSpreadEnabled && !autoSpreading) {
      runningRef.current = true;
      setAutoSpreading(true);
      runAutoSpread();
    }
    if (autoDotsEnabled && !autoDots) {
      dotsRunningRef.current = true;
      setAutoDots(true);
      runAutoDots();
    }
    if (autoShapesEnabled && !autoShapes) {
      shapesRunningRef.current = true;
      setAutoShapes(true);
      runAutoShapes();
    }
  }, [autoSpreadEnabled, autoDotsEnabled, autoShapesEnabled, autoSpreading, autoDots, autoShapes, runAutoSpread, runAutoDots, runAutoShapes]);

  const stopAll = useCallback(() => {
    if (autoSpreading) {
      runningRef.current = false;
      setAutoSpreading(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    }
    if (autoDots) {
      dotsRunningRef.current = false;
      setAutoDots(false);
      if (autoDotsRef.current) {
        cancelAnimationFrame(autoDotsRef.current);
      }
    }
    if (autoShapes) {
      shapesRunningRef.current = false;
      setAutoShapes(false);
      if (autoShapesRef.current) {
        cancelAnimationFrame(autoShapesRef.current);
      }
    }
  }, [autoSpreading, autoDots, autoShapes]);

  return {
    autoSpreading,
    autoDots,
    autoShapes,
    autoSpreadSpeed,
    autoDotsSpeed,
    autoShapesSpeed,
    autoSpreadEnabled,
    autoDotsEnabled,
    autoShapesEnabled,
    rafRef,
    runningRef,
    autoDotsRef,
    autoShapesRef,
    dotsRunningRef,
    shapesRunningRef,
    walkers,
    strobeStateRef,
    ripplesRef,
    autoSpreadEnabledRef,
    autoDotsEnabledRef,
    autoShapesEnabledRef,
    autoSpreadSpeedRef,
    autoDotsSpeedRef,
    autoShapesSpeedRef,
    setAutoSpreading,
    setAutoDots,
    setAutoShapes,
    setAutoSpreadSpeed,
    setAutoDotsSpeed,
    setAutoShapesSpeed,
    setAutoSpreadEnabled,
    setAutoDotsEnabled,
    setAutoShapesEnabled,
    colorSpread,
    addRandomDots,
    addRandomShapes,
    toggleAutoSpread,
    toggleAutoDots,
    toggleAutoShapes,
    startAllEnabled,
    stopAll,
  };
}
