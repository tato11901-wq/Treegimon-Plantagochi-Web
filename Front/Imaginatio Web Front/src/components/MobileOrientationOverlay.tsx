import { useState, useEffect } from "preact/hooks";

/**
 * Overlay that detects mobile devices in portrait orientation
 * and prompts the user to rotate their phone to landscape mode.
 */
export default function MobileOrientationOverlay() {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Detect if it's a mobile/tablet device (touch-capable with small screen)
      const isMobileDevice =
        ("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
        Math.min(window.screen.width, window.screen.height) < 900;

      // Check if the viewport is currently in portrait
      const isPortrait = window.innerHeight > window.innerWidth;

      setShowOverlay(isMobileDevice && isPortrait);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", () => {
      // Small delay to let the browser finish rotating
      setTimeout(checkOrientation, 150);
    });

    // Also listen for media query changes
    const mql = window.matchMedia("(orientation: portrait)");
    const handleMql = () => checkOrientation();
    mql.addEventListener("change", handleMql);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
      mql.removeEventListener("change", handleMql);
    };
  }, []);

  if (!showOverlay) return null;

  return (
    <div
      id="mobile-orientation-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a2e0e 0%, #2d4a1d 40%, #1b4332 100%)",
        color: "#f5e6c8",
        fontFamily: "'Segoe UI', 'Inter', system-ui, sans-serif",
        textAlign: "center",
        padding: "2rem",
        gap: "1.5rem",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Animated phone rotate icon */}
      <div
        style={{
          width: "120px",
          height: "120px",
          position: "relative",
        }}
      >
        {/* Phone SVG with rotation animation */}
        <svg
          viewBox="0 0 120 120"
          width="120"
          height="120"
          style={{
            animation: "rotatePhone 2.5s ease-in-out infinite",
          }}
        >
          {/* Phone body */}
          <rect
            x="35"
            y="15"
            width="50"
            height="90"
            rx="8"
            ry="8"
            fill="none"
            stroke="#f5e6c8"
            stroke-width="3"
          />
          {/* Screen */}
          <rect
            x="40"
            y="25"
            width="40"
            height="65"
            rx="3"
            ry="3"
            fill="#f5e6c8"
            opacity="0.15"
          />
          {/* Home button */}
          <circle cx="60" cy="100" r="4" fill="none" stroke="#f5e6c8" stroke-width="2" opacity="0.6" />
          {/* Camera */}
          <circle cx="60" cy="20" r="2" fill="#f5e6c8" opacity="0.4" />
        </svg>
      </div>

      {/* Curved arrow */}
      <div
        style={{
          position: "absolute",
          top: "calc(50% - 90px)",
          left: "calc(50% + 50px)",
          animation: "pulseArrow 2.5s ease-in-out infinite",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path
            d="M5 35 C5 15, 25 5, 35 5"
            fill="none"
            stroke="#86efac"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <polygon points="35,5 28,2 30,10" fill="#86efac" />
        </svg>
      </div>

      {/* Plant emoji */}
      <div
        style={{
          fontSize: "3rem",
          animation: "gentleBounce 2s ease-in-out infinite",
        }}
      >
        🌿
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 900,
          margin: 0,
          color: "#86efac",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          textShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        ¡Gira tu dispositivo!
      </h2>

      {/* Description */}
      <p
        style={{
          fontSize: "1rem",
          margin: 0,
          maxWidth: "300px",
          lineHeight: 1.6,
          color: "#f5e6c8",
          opacity: 0.85,
        }}
      >
        Para disfrutar de <strong>Plantagochi</strong> necesitas usar tu dispositivo en modo{" "}
        <strong style={{ color: "#86efac" }}>horizontal</strong>.
      </p>

      {/* Decorative border */}
      <div
        style={{
          position: "absolute",
          inset: "12px",
          border: "3px solid rgba(134, 239, 172, 0.15)",
          borderRadius: "24px",
          pointerEvents: "none",
        }}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes rotatePhone {
          0%, 15% { transform: rotate(0deg); }
          40%, 60% { transform: rotate(-90deg); }
          85%, 100% { transform: rotate(0deg); }
        }
        @keyframes pulseArrow {
          0%, 15% { opacity: 1; transform: scale(1); }
          40%, 60% { opacity: 0; transform: scale(0.8); }
          85%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
