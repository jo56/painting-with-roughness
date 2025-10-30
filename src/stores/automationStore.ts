import { create } from 'zustand';
import * as movementAlgorithms from '../algorithms/movement';
import * as cellularAlgorithms from '../algorithms/cellular';
import * as chaosAlgorithms from '../algorithms/chaos';
import * as drawingUtils from '../utils/drawing';
import { spreadAnimationService, dotsAnimationService, shapesAnimationService } from '../services/AnimationService';
import { useCanvasStore } from './canvasStore';
import { useGenerativeStore } from './generativeStore';
import { usePaintStore } from './paintStore';

interface AutomationState {
  // State
  autoSpreading: boolean;
  autoDots: boolean;
  autoShapes: boolean;
  autoSpreadSpeed: number;
  autoDotsSpeed: number;
  autoShapesSpeed: number;
  autoSpreadEnabled: boolean;
  autoDotsEnabled: boolean;
  autoShapesEnabled: boolean;

  // Animation state (not reactive, just stored)
  walkers: { r: number; c: number; color: number }[];
  strobeState: boolean;
  ripples: { r: number; c: number; color: number; radius: number; maxRadius: number }[];

  // Actions
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

const defaults = {
  autoSpreadSpeed: 3,
  autoDotsSpeed: 2,
  autoShapesSpeed: 1,
};

export const useAutomationStore = create<AutomationState>((set, get) => ({
  // Initial state
  autoSpreading: false,
  autoDots: false,
  autoShapes: false,
  autoSpreadSpeed: defaults.autoSpreadSpeed,
  autoDotsSpeed: defaults.autoDotsSpeed,
  autoShapesSpeed: defaults.autoShapesSpeed,
  autoSpreadEnabled: true,
  autoDotsEnabled: true,
  autoShapesEnabled: true,
  walkers: [],
  strobeState: true,
  ripples: [],

  // Actions
  setAutoSpreading: (autoSpreading) => set({ autoSpreading }),
  setAutoDots: (autoDots) => set({ autoDots }),
  setAutoShapes: (autoShapes) => set({ autoShapes }),
  setAutoSpreadSpeed: (autoSpreadSpeed) => set({ autoSpreadSpeed }),
  setAutoDotsSpeed: (autoDotsSpeed) => set({ autoDotsSpeed }),
  setAutoShapesSpeed: (autoShapesSpeed) => set({ autoShapesSpeed }),
  setAutoSpreadEnabled: (autoSpreadEnabled) => set({ autoSpreadEnabled }),
  setAutoDotsEnabled: (autoDotsEnabled) => set({ autoDotsEnabled }),
  setAutoShapesEnabled: (autoShapesEnabled) => set({ autoShapesEnabled }),

  colorSpread: () => {
    const state = get();
    const generativeState = useGenerativeStore.getState();
    const canvasState = useCanvasStore.getState();
    const pattern = generativeState.spreadPattern;

    canvasState.setGrid((g) => {
      let ng = g;

      switch (pattern) {
        case 'ripple': {
          const result = movementAlgorithms.ripple(g, state.ripples, generativeState.rippleChance);
          ng = result.newGrid;
          set({ ripples: result.newRipples });
          break;
        }
        case 'scramble': {
          ng = chaosAlgorithms.scramble(g, generativeState.scrambleSwaps);
          break;
        }
        case 'vortex': {
          ng = movementAlgorithms.vortex(g, generativeState.vortexCount);
          break;
        }
        case 'strobe': {
          const newStrobeState = !state.strobeState;
          set({ strobeState: newStrobeState });
          ng = chaosAlgorithms.strobe(
            g,
            newStrobeState,
            generativeState.strobeExpandThreshold,
            generativeState.strobeContractThreshold
          );
          break;
        }
        case 'jitter': {
          ng = chaosAlgorithms.jitter(g, generativeState.jitterChance);
          break;
        }
        case 'flow': {
          ng = movementAlgorithms.flow(g, generativeState.flowDirection, generativeState.flowChance);
          break;
        }
        case 'vein': {
          const result = cellularAlgorithms.vein(
            g,
            state.walkers,
            generativeState.veinSeekStrength,
            generativeState.veinBranchChance
          );
          ng = result.newGrid;
          set({ walkers: result.newWalkers });
          break;
        }
        case 'crystallize': {
          ng = cellularAlgorithms.crystallize(g, generativeState.crystallizeThreshold);
          break;
        }
        case 'erosion': {
          ng = chaosAlgorithms.erosion(g, generativeState.erosionRate, generativeState.erosionSolidity);
          break;
        }
        case 'tendrils':
        case 'conway': {
          const rules = pattern === 'conway' ? generativeState.conwayRules : generativeState.tendrilsRules;
          ng = cellularAlgorithms.conway(g, rules, generativeState.generativeColorIndices);
          break;
        }
        case 'pulse': {
          ng = movementAlgorithms.pulse(g, generativeState.pulseDirection, generativeState.pulseOvertakes);
          break;
        }
        case 'random': {
          ng = chaosAlgorithms.randomWalk(
            g,
            generativeState.spreadProbability,
            generativeState.randomWalkMode,
            generativeState.randomWalkSpreadCount
          );
          break;
        }
        case 'directional': {
          ng = movementAlgorithms.directional(
            g,
            generativeState.spreadProbability,
            generativeState.directionalBias,
            generativeState.directionalBiasStrength
          );
          break;
        }
      }
      return ng;
    });
  },

  addRandomDots: () => {
    const generativeState = useGenerativeStore.getState();
    const paintState = usePaintStore.getState();
    const canvasState = useCanvasStore.getState();

    canvasState.setGrid((g) => {
      const availableColors = generativeState.generativeColorIndices.length > 0
        ? generativeState.generativeColorIndices
        : paintState.palette.slice(1).map((_, i) => i + 1);
      return drawingUtils.addRandomDots({ grid: g, availableColors });
    });
  },

  addRandomShapes: () => {
    const generativeState = useGenerativeStore.getState();
    const paintState = usePaintStore.getState();
    const canvasState = useCanvasStore.getState();

    canvasState.setGrid((g) => {
      const availableColors = generativeState.generativeColorIndices.length > 0
        ? generativeState.generativeColorIndices
        : paintState.palette.slice(1).map((_, i) => i + 1);
      return drawingUtils.addRandomShapes({ grid: g, availableColors });
    });
  },

  toggleAutoSpread: () => {
    const state = get();
    const generativeState = useGenerativeStore.getState();

    if (!state.autoSpreading) {
      // Starting
      if (generativeState.spreadPattern === 'vein') set({ walkers: [] });
      if (generativeState.spreadPattern === 'strobe') set({ strobeState: true });
      if (generativeState.spreadPattern === 'ripple') set({ ripples: [] });

      // Pass getter function to read speed in real-time
      spreadAnimationService.start(() => {
        get().colorSpread();
      }, () => {
        const currentGenerativeState = useGenerativeStore.getState();
        const currentState = get();
        return currentGenerativeState.spreadPattern === 'pulse'
          ? currentGenerativeState.pulseSpeed
          : currentState.autoSpreadSpeed;
      });

      set({ autoSpreading: true });
    } else {
      // Stopping
      spreadAnimationService.stop();
      set({ autoSpreading: false });
    }
  },

  toggleAutoDots: () => {
    const state = get();

    if (!state.autoDots) {
      // Pass getter function to read speed in real-time
      dotsAnimationService.start(() => {
        get().addRandomDots();
      }, () => get().autoDotsSpeed);
      set({ autoDots: true });
    } else {
      dotsAnimationService.stop();
      set({ autoDots: false });
    }
  },

  toggleAutoShapes: () => {
    const state = get();

    if (!state.autoShapes) {
      // Pass getter function to read speed in real-time
      shapesAnimationService.start(() => {
        get().addRandomShapes();
      }, () => get().autoShapesSpeed);
      set({ autoShapes: true });
    } else {
      shapesAnimationService.stop();
      set({ autoShapes: false });
    }
  },

  startAllEnabled: () => {
    const state = get();

    if (state.autoSpreadEnabled && !state.autoSpreading) {
      get().toggleAutoSpread();
    }
    if (state.autoDotsEnabled && !state.autoDots) {
      get().toggleAutoDots();
    }
    if (state.autoShapesEnabled && !state.autoShapes) {
      get().toggleAutoShapes();
    }
  },

  stopAll: () => {
    const state = get();

    if (state.autoSpreading) {
      spreadAnimationService.stop();
      set({ autoSpreading: false });
    }
    if (state.autoDots) {
      dotsAnimationService.stop();
      set({ autoDots: false });
    }
    if (state.autoShapes) {
      shapesAnimationService.stop();
      set({ autoShapes: false });
    }
  },
}));
