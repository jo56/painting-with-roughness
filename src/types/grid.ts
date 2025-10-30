// Grid-related types

export interface ConwayRules {
  born: number[];
  survive: number[];
}

export interface Defaults {
  cellSize: number;
  rows: number;
  cols: number;
  showGrid: boolean;
  backgroundColor: string;
  brushSize: number;
  selectedColor: number;
  spreadProbability: number;
  autoSpreadSpeed: number;
  autoDotsSpeed: number;
  autoShapesSpeed: number;
  blendMode: string;
  spreadPattern: string;
  pulseSpeed: number;
  pulseOvertakes: boolean;
  pulseDirection: string;
  directionalBias: string;
  conwayRules: ConwayRules;
  tendrilsRules: ConwayRules;
  directionalBiasStrength: number;
  randomWalkSpreadCount: number;
  randomWalkMode: 'any' | 'cardinal';
  veinSeekStrength: number;
  veinBranchChance: number;
  crystallizeThreshold: number;
  erosionRate: number;
  erosionSolidity: number;
  flowDirection: string;
  flowChance: number;
  jitterChance: number;
  vortexCount: number;
  strobeExpandThreshold: number;
  strobeContractThreshold: number;
  scrambleSwaps: number;
  rippleChance: number;
}

export interface Walker {
  r: number;
  c: number;
  color: number;
}

export interface Ripple {
  r: number;
  c: number;
  color: number;
  radius: number;
  maxRadius: number;
}
