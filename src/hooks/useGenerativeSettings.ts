import { useCallback, useEffect, useRef, useState } from 'react';
import type { Direction, SpreadPattern } from '../types';

export interface UseGenerativeSettingsReturn {
  spreadProbability: number;
  spreadPattern: SpreadPattern;
  generativeColorIndices: number[];
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

  spreadProbabilityRef: React.RefObject<number>;
  spreadPatternRef: React.RefObject<SpreadPattern>;
  generativeColorIndicesRef: React.RefObject<number[]>;
  pulseSpeedRef: React.RefObject<number>;
  directionalBiasRef: React.RefObject<'none' | Direction>;
  conwayRulesRef: React.RefObject<{ born: number[]; survive: number[] }>;
  tendrilsRulesRef: React.RefObject<{ born: number[]; survive: number[] }>;
  directionalBiasStrengthRef: React.RefObject<number>;
  pulseOvertakesRef: React.RefObject<boolean>;
  pulseDirectionRef: React.RefObject<Direction>;
  randomWalkSpreadCountRef: React.RefObject<number>;
  randomWalkModeRef: React.RefObject<'any' | 'cardinal'>;
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

  setSpreadProbability: (prob: number) => void;
  setSpreadPattern: (pattern: SpreadPattern) => void;
  setGenerativeColorIndices: React.Dispatch<React.SetStateAction<number[]>>;
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

export function useGenerativeSettings(palette: string[]): UseGenerativeSettingsReturn {
  const defaults = {
    spreadProbability: 0.2,
    spreadPattern: 'random' as SpreadPattern,
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

  const [generativeColorIndices, setGenerativeColorIndices] = useState(() =>
    palette.slice(1).map((_, index) => index + 1)
  );
  const [spreadProbability, setSpreadProbability] = useState(defaults.spreadProbability);
  const [spreadPattern, setSpreadPattern] = useState<SpreadPattern>(defaults.spreadPattern);
  const [pulseSpeed, setPulseSpeed] = useState(defaults.pulseSpeed);
  const [pulseOvertakes, setPulseOvertakes] = useState(defaults.pulseOvertakes);
  const [pulseDirection, setPulseDirection] = useState<Direction>(defaults.pulseDirection);
  const [directionalBias, setDirectionalBias] = useState<'none' | Direction>(defaults.directionalBias);
  const [directionalBiasStrength, setDirectionalBiasStrength] = useState(defaults.directionalBiasStrength);
  const [conwayRules, setConwayRules] = useState(defaults.conwayRules);
  const [tendrilsRules, setTendrilsRules] = useState(defaults.tendrilsRules);
  const [randomWalkSpreadCount, setRandomWalkSpreadCount] = useState(defaults.randomWalkSpreadCount);
  const [randomWalkMode, setRandomWalkMode] = useState<'any' | 'cardinal'>(defaults.randomWalkMode);
  const [veinSeekStrength, setVeinSeekStrength] = useState(defaults.veinSeekStrength);
  const [veinBranchChance, setVeinBranchChance] = useState(defaults.veinBranchChance);
  const [crystallizeThreshold, setCrystallizeThreshold] = useState(defaults.crystallizeThreshold);
  const [erosionRate, setErosionRate] = useState(defaults.erosionRate);
  const [erosionSolidity, setErosionSolidity] = useState(defaults.erosionSolidity);
  const [flowDirection, setFlowDirection] = useState<Direction>(defaults.flowDirection);
  const [flowChance, setFlowChance] = useState(defaults.flowChance);
  const [jitterChance, setJitterChance] = useState(defaults.jitterChance);
  const [vortexCount, setVortexCount] = useState(defaults.vortexCount);
  const [strobeExpandThreshold, setStrobeExpandThreshold] = useState(defaults.strobeExpandThreshold);
  const [strobeContractThreshold, setStrobeContractThreshold] = useState(defaults.strobeContractThreshold);
  const [scrambleSwaps, setScrambleSwaps] = useState(defaults.scrambleSwaps);
  const [rippleChance, setRippleChance] = useState(defaults.rippleChance);

  const generativeColorIndicesRef = useRef(generativeColorIndices);
  const spreadProbabilityRef = useRef(spreadProbability);
  const spreadPatternRef = useRef(spreadPattern);
  const pulseSpeedRef = useRef(pulseSpeed);
  const directionalBiasRef = useRef(directionalBias);
  const conwayRulesRef = useRef(conwayRules);
  const tendrilsRulesRef = useRef(tendrilsRules);
  const directionalBiasStrengthRef = useRef(directionalBiasStrength);
  const pulseOvertakesRef = useRef(pulseOvertakes);
  const pulseDirectionRef = useRef(pulseDirection);
  const randomWalkSpreadCountRef = useRef(randomWalkSpreadCount);
  const randomWalkModeRef = useRef(randomWalkMode);
  const veinSeekStrengthRef = useRef(veinSeekStrength);
  const veinBranchChanceRef = useRef(veinBranchChance);
  const crystallizeThresholdRef = useRef(crystallizeThreshold);
  const erosionRateRef = useRef(erosionRate);
  const erosionSolidityRef = useRef(erosionSolidity);
  const flowDirectionRef = useRef(flowDirection);
  const flowChanceRef = useRef(flowChance);
  const jitterChanceRef = useRef(jitterChance);
  const vortexCountRef = useRef(vortexCount);
  const strobeExpandThresholdRef = useRef(strobeExpandThreshold);
  const strobeContractThresholdRef = useRef(strobeContractThreshold);
  const scrambleSwapsRef = useRef(scrambleSwaps);
  const rippleChanceRef = useRef(rippleChance);

  useEffect(() => { spreadProbabilityRef.current = spreadProbability; }, [spreadProbability]);
  useEffect(() => { generativeColorIndicesRef.current = generativeColorIndices; }, [generativeColorIndices]);
  useEffect(() => { spreadPatternRef.current = spreadPattern; }, [spreadPattern]);
  useEffect(() => { pulseSpeedRef.current = pulseSpeed; }, [pulseSpeed]);
  useEffect(() => { directionalBiasRef.current = directionalBias; }, [directionalBias]);
  useEffect(() => { conwayRulesRef.current = conwayRules; }, [conwayRules]);
  useEffect(() => { tendrilsRulesRef.current = tendrilsRules; }, [tendrilsRules]);
  useEffect(() => { directionalBiasStrengthRef.current = directionalBiasStrength; }, [directionalBiasStrength]);
  useEffect(() => { pulseOvertakesRef.current = pulseOvertakes; }, [pulseOvertakes]);
  useEffect(() => { pulseDirectionRef.current = pulseDirection; }, [pulseDirection]);
  useEffect(() => { randomWalkSpreadCountRef.current = randomWalkSpreadCount; }, [randomWalkSpreadCount]);
  useEffect(() => { randomWalkModeRef.current = randomWalkMode; }, [randomWalkMode]);
  useEffect(() => { veinSeekStrengthRef.current = veinSeekStrength; }, [veinSeekStrength]);
  useEffect(() => { veinBranchChanceRef.current = veinBranchChance; }, [veinBranchChance]);
  useEffect(() => { crystallizeThresholdRef.current = crystallizeThreshold; }, [crystallizeThreshold]);
  useEffect(() => { erosionRateRef.current = erosionRate; }, [erosionRate]);
  useEffect(() => { erosionSolidityRef.current = erosionSolidity; }, [erosionSolidity]);
  useEffect(() => { flowDirectionRef.current = flowDirection; }, [flowDirection]);
  useEffect(() => { flowChanceRef.current = flowChance; }, [flowChance]);
  useEffect(() => { jitterChanceRef.current = jitterChance; }, [jitterChance]);
  useEffect(() => { vortexCountRef.current = vortexCount; }, [vortexCount]);
  useEffect(() => { strobeExpandThresholdRef.current = strobeExpandThreshold; }, [strobeExpandThreshold]);
  useEffect(() => { strobeContractThresholdRef.current = strobeContractThreshold; }, [strobeContractThreshold]);
  useEffect(() => { scrambleSwapsRef.current = scrambleSwaps; }, [scrambleSwaps]);
  useEffect(() => { rippleChanceRef.current = rippleChance; }, [rippleChance]);

  const handleGenerativeColorToggle = useCallback((colorIndex: number) => {
    setGenerativeColorIndices(prev => {
      if (prev.includes(colorIndex)) {
        return prev.filter(i => i !== colorIndex);
      } else {
        return [...prev, colorIndex];
      }
    });
  }, []);

  const resetGenerativeSettings = useCallback(() => {
    setSpreadPattern(defaults.spreadPattern);
    setPulseSpeed(defaults.pulseSpeed);
    setDirectionalBias(defaults.directionalBias);
    setConwayRules(defaults.conwayRules);
    setTendrilsRules(defaults.tendrilsRules);
    setDirectionalBiasStrength(defaults.directionalBiasStrength);
    setPulseOvertakes(defaults.pulseOvertakes);
    setPulseDirection(defaults.pulseDirection);
    setRandomWalkSpreadCount(defaults.randomWalkSpreadCount);
    setRandomWalkMode(defaults.randomWalkMode);
    setVeinSeekStrength(defaults.veinSeekStrength);
    setVeinBranchChance(defaults.veinBranchChance);
    setCrystallizeThreshold(defaults.crystallizeThreshold);
    setErosionRate(defaults.erosionRate);
    setErosionSolidity(defaults.erosionSolidity);
    setFlowDirection(defaults.flowDirection);
    setFlowChance(defaults.flowChance);
    setJitterChance(defaults.jitterChance);
    setVortexCount(defaults.vortexCount);
    setStrobeExpandThreshold(defaults.strobeExpandThreshold);
    setStrobeContractThreshold(defaults.strobeContractThreshold);
    setScrambleSwaps(defaults.scrambleSwaps);
    setRippleChance(defaults.rippleChance);
  }, []);

  return {
    spreadProbability,
    spreadPattern,
    generativeColorIndices,
    pulseSpeed,
    pulseOvertakes,
    pulseDirection,
    directionalBias,
    directionalBiasStrength,
    conwayRules,
    tendrilsRules,
    randomWalkSpreadCount,
    randomWalkMode,
    veinSeekStrength,
    veinBranchChance,
    crystallizeThreshold,
    erosionRate,
    erosionSolidity,
    flowDirection,
    flowChance,
    jitterChance,
    vortexCount,
    strobeExpandThreshold,
    strobeContractThreshold,
    scrambleSwaps,
    rippleChance,

    spreadProbabilityRef,
    spreadPatternRef,
    generativeColorIndicesRef,
    pulseSpeedRef,
    directionalBiasRef,
    conwayRulesRef,
    tendrilsRulesRef,
    directionalBiasStrengthRef,
    pulseOvertakesRef,
    pulseDirectionRef,
    randomWalkSpreadCountRef,
    randomWalkModeRef,
    veinSeekStrengthRef,
    veinBranchChanceRef,
    crystallizeThresholdRef,
    erosionRateRef,
    erosionSolidityRef,
    flowDirectionRef,
    flowChanceRef,
    jitterChanceRef,
    vortexCountRef,
    strobeExpandThresholdRef,
    strobeContractThresholdRef,
    scrambleSwapsRef,
    rippleChanceRef,

    setSpreadProbability,
    setSpreadPattern,
    setGenerativeColorIndices,
    setPulseSpeed,
    setPulseOvertakes,
    setPulseDirection,
    setDirectionalBias,
    setDirectionalBiasStrength,
    setConwayRules,
    setTendrilsRules,
    setRandomWalkSpreadCount,
    setRandomWalkMode,
    setVeinSeekStrength,
    setVeinBranchChance,
    setCrystallizeThreshold,
    setErosionRate,
    setErosionSolidity,
    setFlowDirection,
    setFlowChance,
    setJitterChance,
    setVortexCount,
    setStrobeExpandThreshold,
    setStrobeContractThreshold,
    setScrambleSwaps,
    setRippleChance,
    handleGenerativeColorToggle,
    resetGenerativeSettings,
  };
}
