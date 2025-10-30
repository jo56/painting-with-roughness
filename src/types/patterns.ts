export type Direction =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type SpreadPattern =
  | 'random'
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

export type RandomWalkMode = 'any' | 'cardinal';

export type BrushType =
  | 'square'
  | 'circle'
  | 'diagonal'
  | 'spray';

export type Tool = 'brush' | 'fill' | 'eraser';

export type BlendMode = 'replace' | 'overlay';
