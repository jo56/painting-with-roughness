import { BlendMode } from '../types';

export const GRID_COLOR = '#1f2937';

export const defaults = {
  cellSize: 20,
  rows: 30,
  cols: 40,
  showGrid: true,
  backgroundColor: '#0a0a0a',
  brushSize: 1,
  selectedColor: 1,
  spreadProbability: 0.2,
  autoSpreadSpeed: 3,
  autoDotsSpeed: 2,
  autoShapesSpeed: 1,
  blendMode: 'replace' as BlendMode
};

export const colorPalette = [
  '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
  '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
];