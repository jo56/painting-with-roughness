// Pattern-related types - using exact naming from original working code

export type Direction =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'top-left'      // kebab-case, not camelCase
  | 'top-right'     // kebab-case, not camelCase
  | 'bottom-left'   // kebab-case, not camelCase
  | 'bottom-right'; // kebab-case, not camelCase

export type SpreadPattern =
  | 'random'        // NOT 'randomWalk' - this is critical
  | 'conway'
  | 'pulse'
  | 'directional'
  | 'tendrils'
  | 'vein'
  | 'crystallize'
  | 'erosion'
  | 'flow'
  | 'jitter'
  | 'vortex'
  | 'strobe'
  | 'scramble'
  | 'ripple';

export type RandomWalkMode = 'any' | 'cardinal'; // NOT 'all' - this is critical

export type BrushType =
  | 'square'
  | 'circle'
  | 'diagonal'
  | 'spray';

export type Tool = 'brush' | 'eraser';

export type BlendMode = 'replace' | 'add';
