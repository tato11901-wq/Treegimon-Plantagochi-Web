import { useState, useEffect } from 'preact/hooks';

interface ScaleResult {
  scale: number;
  virtualWidth: number;
  virtualHeight: number;
}

export function useScale(baseHeight = 1080): ScaleResult {
  const [scaleState, setScaleState] = useState<ScaleResult>({
    scale: 1,
    virtualWidth: 1920,
    virtualHeight: baseHeight,
  });

  useEffect(() => {
    const calculateScale = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      // Detect mobile landscape: touch device with landscape orientation and small height
      const isMobileLandscape =
        ("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
        winW > winH &&
        winH < 500;

      if (isMobileLandscape) {
        // On mobile landscape, use a reduced base height so UI elements scale down
        // to fit the limited vertical space. Also constrain width.
        const mobileBaseHeight = baseHeight * 0.85;
        const heightScale = winH / mobileBaseHeight;
        const baseWidth = 1920;
        const widthScale = winW / baseWidth;

        // Use the smaller scale so everything fits in both dimensions
        const newScale = Math.min(heightScale, widthScale);
        const newVirtualWidth = winW / newScale;
        const newVirtualHeight = winH / newScale;

        setScaleState({
          scale: newScale,
          virtualWidth: newVirtualWidth,
          virtualHeight: newVirtualHeight,
        });
      } else {
        // Desktop / large-screen behavior (original logic)
        const newScale = winH / baseHeight;
        const newVirtualWidth = winW / newScale;

        setScaleState({
          scale: newScale,
          virtualWidth: newVirtualWidth,
          virtualHeight: baseHeight,
        });
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    window.addEventListener('orientationchange', () => {
      setTimeout(calculateScale, 150);
    });
    return () => {
      window.removeEventListener('resize', calculateScale);
      window.removeEventListener('orientationchange', calculateScale);
    };
  }, [baseHeight]);

  return scaleState;
}

