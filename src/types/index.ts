// Central export file for all types
export * from './patterns';
export * from './grid';
export * from './ui';

// Legacy re-exports for backward compatibility (if needed)
export interface FoodSource {
  row: number;
  col: number;
}
