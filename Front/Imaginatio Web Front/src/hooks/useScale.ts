import { useState, useEffect } from 'preact/hooks';

interface ScaleResult {
  scale: number;
  virtualWidth: number;
  virtualHeight: number;
  /** Horizontal pixel offset to center the stage in the viewport */
  offsetX: number;
  /** Vertical pixel offset to center the stage in the viewport */
  offsetY: number;
  /** Whether the device is detected as mobile landscape */
  isMobile: boolean;
}

export function useScale(baseHeight = 1080): ScaleResult {
  const [scaleState, setScaleState] = useState<ScaleResult>({
    scale: 1,
    virtualWidth: 1920,
    virtualHeight: baseHeight,
    offsetX: 0,
    offsetY: 0,
    isMobile: false,
  });

  useEffect(() => {
    const calculateScale = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      // Detect mobile: touch device with small screen dimension
      const isMobile =
        ("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
        Math.min(window.screen.width, window.screen.height) < 900;

      if (isMobile && winW > winH) {
        // ── Mobile landscape ──
        // Use a fixed 16:9 virtual canvas that fits entirely within the viewport
        const baseWidth = 1920;
        const heightScale = winH / baseHeight;
        const widthScale = winW / baseWidth;

        // Pick the smaller scale so nothing overflows in either direction
        const newScale = Math.min(heightScale, widthScale);

        // Keep virtual size fixed so all internal layout logic works unchanged
        const newVirtualWidth = baseWidth;
        const newVirtualHeight = baseHeight;

        // Center the scaled stage within the viewport
        const renderedW = newVirtualWidth * newScale;
        const renderedH = newVirtualHeight * newScale;
        const offsetX = (winW - renderedW) / 2;
        const offsetY = (winH - renderedH) / 2;

        setScaleState({
          scale: newScale,
          virtualWidth: newVirtualWidth,
          virtualHeight: newVirtualHeight,
          offsetX,
          offsetY,
          isMobile: true,
        });
      } else {
        // ── Desktop / large-screen ──
        // Scale based on height; expand virtual width to fill horizontal space
        const newScale = winH / baseHeight;
        const newVirtualWidth = winW / newScale;

        setScaleState({
          scale: newScale,
          virtualWidth: newVirtualWidth,
          virtualHeight: baseHeight,
          offsetX: 0,
          offsetY: 0,
          isMobile: false,
        });
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);

    const onOrientationChange = () => setTimeout(calculateScale, 200);
    window.addEventListener('orientationchange', onOrientationChange);

    return () => {
      window.removeEventListener('resize', calculateScale);
      window.removeEventListener('orientationchange', onOrientationChange);
    };
  }, [baseHeight]);

  return scaleState;
}

