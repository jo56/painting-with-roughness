/**
 * AnimationService - Manages requestAnimationFrame loops
 * Encapsulates animation timing logic outside of React hooks
 */
class AnimationService {
  private rafId: number | null = null;

  start(callback: () => void, fpsGetter: number | (() => number)) {
    let lastTime = performance.now();

    const loop = (time: number) => {
      // Get current fps value (either static number or from getter function)
      const fps = typeof fpsGetter === 'function' ? fpsGetter() : fpsGetter;
      const interval = 1000 / Math.max(0.1, fps);

      if (time - lastTime >= interval) {
        callback();
        lastTime = time;
      }
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  isRunning(): boolean {
    return this.rafId !== null;
  }
}

// Export singleton instances for different animation types
export const spreadAnimationService = new AnimationService();
export const dotsAnimationService = new AnimationService();
export const shapesAnimationService = new AnimationService();
