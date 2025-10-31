import { create } from 'zustand';
import type { Direction, SpreadPattern } from '../types';

interface GenerativeState {
  // State
  spreadProbability: number;
  spreadPattern: SpreadPattern;
  generativeColorIndices: number[];
  generativePalette: string[];
  pulseSpeed: number;
  pulseOvertakes: boolean;
  pulseDirection: Direction;
  directionalBias: 'none' | Direction;
  directionalBiasStrength: number;
  conwayRules: { born: number[]; survive: number[] };
  tendrilsRules: { born: number[]; survive: number[] };
  randomWalkSpreadCount: number;
  randomWalkMode: 'any' | 'cardinal';
  veinSeekStrength: number;
  veinBranchChance: number;
  crystallizeThreshold: number;
  erosionRate: number;
  erosionSolidity: number;
  flowDirection: Direction;
  flowChance: number;
  jitterChance: number;
  vortexCount: number;
  strobeExpandThreshold: number;
  strobeContractThreshold: number;
  scrambleSwaps: number;
  rippleChance: number;

  // Actions
  setSpreadProbability: (prob: number) => void;
  setSpreadPattern: (pattern: SpreadPattern) => void;
  setGenerativeColorIndices: (indices: number[] | ((prev: number[]) => number[])) => void;
  setGenerativePalette: (palette: string[] | ((prev: string[]) => string[])) => void;
  setPulseSpeed: (speed: number) => void;
  setPulseOvertakes: (overtakes: boolean) => void;
  setPulseDirection: (direction: Direction) => void;
  setDirectionalBias: (bias: 'none' | Direction) => void;
  setDirectionalBiasStrength: (strength: number) => void;
  setConwayRules: (rules: { born: number[]; survive: number[] }) => void;
  setTendrilsRules: (rules: { born: number[]; survive: number[] }) => void;
  setRandomWalkSpreadCount: (count: number) => void;
  setRandomWalkMode: (mode: 'any' | 'cardinal') => void;
  setVeinSeekStrength: (strength: number) => void;
  setVeinBranchChance: (chance: number) => void;
  setCrystallizeThreshold: (threshold: number) => void;
  setErosionRate: (rate: number) => void;
  setErosionSolidity: (solidity: number) => void;
  setFlowDirection: (direction: Direction) => void;
  setFlowChance: (chance: number) => void;
  setJitterChance: (chance: number) => void;
  setVortexCount: (count: number) => void;
  setStrobeExpandThreshold: (threshold: number) => void;
  setStrobeContractThreshold: (threshold: number) => void;
  setScrambleSwaps: (swaps: number) => void;
  setRippleChance: (chance: number) => void;
  handleGenerativeColorToggle: (colorIndex: number) => void;
  resetGenerativeSettings: () => void;
}

const defaults = {
  spreadProbability: 0.2,
  spreadPattern: 'random' as SpreadPattern,
  generativePalette: [
    '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
  ],
  pulseSpeed: 10,
  pulseOvertakes: true,
  pulseDirection: 'bottom-right' as Direction,
  directionalBias: 'down' as Direction,
  conwayRules: { born: [3], survive: [2, 3] },
  tendrilsRules: { born: [1], survive: [1, 2] },
  directionalBiasStrength: 0.8,
  randomWalkSpreadCount: 1,
  randomWalkMode: 'any' as const,
  veinSeekStrength: 0.5,
  veinBranchChance: 0.1,
  crystallizeThreshold: 2,
  erosionRate: 0.5,
  erosionSolidity: 3,
  flowDirection: 'down' as Direction,
  flowChance: 0.5,
  jitterChance: 0.3,
  vortexCount: 5,
  strobeExpandThreshold: 2,
  strobeContractThreshold: 3,
  scrambleSwaps: 10,
  rippleChance: 0.05,
};

export const useGenerativeStore = create<GenerativeState>((set, get) => ({
  // Initial state
  spreadProbability: defaults.spreadProbability,
  spreadPattern: defaults.spreadPattern,
  generativeColorIndices: [1, 2, 3, 4, 5, 6, 7, 8], // Default to all colors except black
  generativePalette: defaults.generativePalette,
  pulseSpeed: defaults.pulseSpeed,
  pulseOvertakes: defaults.pulseOvertakes,
  pulseDirection: defaults.pulseDirection,
  directionalBias: defaults.directionalBias,
  directionalBiasStrength: defaults.directionalBiasStrength,
  conwayRules: defaults.conwayRules,
  tendrilsRules: defaults.tendrilsRules,
  randomWalkSpreadCount: defaults.randomWalkSpreadCount,
  randomWalkMode: defaults.randomWalkMode,
  veinSeekStrength: defaults.veinSeekStrength,
  veinBranchChance: defaults.veinBranchChance,
  crystallizeThreshold: defaults.crystallizeThreshold,
  erosionRate: defaults.erosionRate,
  erosionSolidity: defaults.erosionSolidity,
  flowDirection: defaults.flowDirection,
  flowChance: defaults.flowChance,
  jitterChance: defaults.jitterChance,
  vortexCount: defaults.vortexCount,
  strobeExpandThreshold: defaults.strobeExpandThreshold,
  strobeContractThreshold: defaults.strobeContractThreshold,
  scrambleSwaps: defaults.scrambleSwaps,
  rippleChance: defaults.rippleChance,

  // Actions
  setSpreadProbability: (spreadProbability) => set({ spreadProbability }),
  setSpreadPattern: (spreadPattern) => set({ spreadPattern }),
  setGenerativeColorIndices: (indices) =>
    set({ generativeColorIndices: typeof indices === 'function' ? indices(get().generativeColorIndices) : indices }),
  setGenerativePalette: (palette) =>
    set({ generativePalette: typeof palette === 'function' ? palette(get().generativePalette) : palette }),
  setPulseSpeed: (pulseSpeed) => set({ pulseSpeed }),
  setPulseOvertakes: (pulseOvertakes) => set({ pulseOvertakes }),
  setPulseDirection: (pulseDirection) => set({ pulseDirection }),
  setDirectionalBias: (directionalBias) => set({ directionalBias }),
  setDirectionalBiasStrength: (directionalBiasStrength) => set({ directionalBiasStrength }),
  setConwayRules: (conwayRules) => set({ conwayRules }),
  setTendrilsRules: (tendrilsRules) => set({ tendrilsRules }),
  setRandomWalkSpreadCount: (randomWalkSpreadCount) => set({ randomWalkSpreadCount }),
  setRandomWalkMode: (randomWalkMode) => set({ randomWalkMode }),
  setVeinSeekStrength: (veinSeekStrength) => set({ veinSeekStrength }),
  setVeinBranchChance: (veinBranchChance) => set({ veinBranchChance }),
  setCrystallizeThreshold: (crystallizeThreshold) => set({ crystallizeThreshold }),
  setErosionRate: (erosionRate) => set({ erosionRate }),
  setErosionSolidity: (erosionSolidity) => set({ erosionSolidity }),
  setFlowDirection: (flowDirection) => set({ flowDirection }),
  setFlowChance: (flowChance) => set({ flowChance }),
  setJitterChance: (jitterChance) => set({ jitterChance }),
  setVortexCount: (vortexCount) => set({ vortexCount }),
  setStrobeExpandThreshold: (strobeExpandThreshold) => set({ strobeExpandThreshold }),
  setStrobeContractThreshold: (strobeContractThreshold) => set({ strobeContractThreshold }),
  setScrambleSwaps: (scrambleSwaps) => set({ scrambleSwaps }),
  setRippleChance: (rippleChance) => set({ rippleChance }),

  handleGenerativeColorToggle: (colorIndex: number) => {
    const { generativeColorIndices } = get();
    if (generativeColorIndices.includes(colorIndex)) {
      set({ generativeColorIndices: generativeColorIndices.filter(i => i !== colorIndex) });
    } else {
      set({ generativeColorIndices: [...generativeColorIndices, colorIndex] });
    }
  },

  resetGenerativeSettings: () => set({
    spreadPattern: defaults.spreadPattern,
    pulseSpeed: defaults.pulseSpeed,
    directionalBias: defaults.directionalBias,
    conwayRules: defaults.conwayRules,
    tendrilsRules: defaults.tendrilsRules,
    directionalBiasStrength: defaults.directionalBiasStrength,
    pulseOvertakes: defaults.pulseOvertakes,
    pulseDirection: defaults.pulseDirection,
    randomWalkSpreadCount: defaults.randomWalkSpreadCount,
    randomWalkMode: defaults.randomWalkMode,
    veinSeekStrength: defaults.veinSeekStrength,
    veinBranchChance: defaults.veinBranchChance,
    crystallizeThreshold: defaults.crystallizeThreshold,
    erosionRate: defaults.erosionRate,
    erosionSolidity: defaults.erosionSolidity,
    flowDirection: defaults.flowDirection,
    flowChance: defaults.flowChance,
    jitterChance: defaults.jitterChance,
    vortexCount: defaults.vortexCount,
    strobeExpandThreshold: defaults.strobeExpandThreshold,
    strobeContractThreshold: defaults.strobeContractThreshold,
    scrambleSwaps: defaults.scrambleSwaps,
    rippleChance: defaults.rippleChance,
  }),
}));
