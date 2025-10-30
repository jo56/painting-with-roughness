import { useEffect, useRef } from 'react';
import type { Direction, SpreadPattern } from '../types';

interface DirectionalControlsDeps {
  showGenerativeSettings: boolean;
  spreadPattern: SpreadPattern;
  setPulseDirection: (direction: Direction) => void;
  setDirectionalBias: (bias: 'none' | Direction) => void;
  setFlowDirection: (direction: Direction) => void;
}

export function useDirectionalControls(deps: DirectionalControlsDeps): void {
  const pressedKeys = useRef(new Set<string>());

  useEffect(() => {
    const updateDirection = () => {
      let newDirection: Direction | null = null;
      const keys = pressedKeys.current;

      if (keys.has('KeyW') && keys.has('KeyA')) newDirection = 'top-left';
      else if (keys.has('KeyW') && keys.has('KeyD')) newDirection = 'top-right';
      else if (keys.has('KeyS') && keys.has('KeyA')) newDirection = 'bottom-left';
      else if (keys.has('KeyS') && keys.has('KeyD')) newDirection = 'bottom-right';
      else if (keys.has('KeyW')) newDirection = 'up';
      else if (keys.has('KeyS')) newDirection = 'down';
      else if (keys.has('KeyA')) newDirection = 'left';
      else if (keys.has('KeyD')) newDirection = 'right';

      if (newDirection) {
        const isDiagonal = newDirection.includes('-');
        const isCardinal = !isDiagonal;

        if (deps.spreadPattern === 'pulse' && isDiagonal) {
          deps.setPulseDirection(newDirection);
        } else if (deps.spreadPattern === 'directional') {
          deps.setDirectionalBias(newDirection);
        } else if (deps.spreadPattern === 'flow' && isCardinal) {
          deps.setFlowDirection(newDirection);
        }
      }
    };

    const keyMap: { [key: string]: string } = {
      'ArrowUp': 'KeyW', 'ArrowDown': 'KeyS', 'ArrowLeft': 'KeyA', 'ArrowRight': 'KeyD'
    };
    const relevantCodes = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!deps.showGenerativeSettings || (deps.spreadPattern !== 'pulse' && deps.spreadPattern !== 'directional' && deps.spreadPattern !== 'flow')) {
        return;
      }

      const code = keyMap[e.code] || e.code;
      if (!relevantCodes.includes(code) || e.repeat) return;

      e.preventDefault();
      pressedKeys.current.add(code);
      updateDirection();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = keyMap[e.code] || e.code;
      if (relevantCodes.includes(code)) {
        pressedKeys.current.delete(code);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [deps]);
}
