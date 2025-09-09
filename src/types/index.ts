export interface GridPosition {
  x: number;
  y: number;
}

export interface PanelPosition {
  x: number;
  y: number;
}

export type Tool = 'brush' | 'fill' | 'eraser';
export type BlendMode = 'replace' | 'overlay';

export interface AppState {
  cellSize: number;
  rows: number;
  cols: number;
  grid: number[][];
  showGrid: boolean;
  backgroundColor: string;
  brushSize: number;
  selectedColor: number;
  spreadProbability: number;
  autoSpreadSpeed: number;
  autoDotsSpeed: number;
  autoShapesSpeed: number;
  autoSpreading: boolean;
  autoDots: boolean;
  autoShapes: boolean;
  blendMode: BlendMode;
  tool: Tool;
  panelMinimized: boolean;
  showAdvanced: boolean;
  panelPos: PanelPosition;
  isMobile: boolean;
}