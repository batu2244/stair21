import "./WealthBanner.css";

// Dashboard footer banner: grainy blue gradient with a calm, rounded
// landscape of rolling hills.
// Pure SVG, so it stays sharp and needs no image hosting.
export default function WealthBanner() {
  return (
    <footer className="wealth-banner" aria-label="ClientHub">
      <svg className="wb-art" viewBox="0 0 1200 340" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="wb-sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0b2a6f" />
            <stop offset="0.55" stopColor="#1d4ed8" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
          <radialGradient id="wb-glow" cx="0.78" cy="0.15" r="0.6">
            <stop offset="0" stopColor="#bfdbfe" stopOpacity="0.55" />
            <stop offset="1" stopColor="#bfdbfe" stopOpacity="0" />
          </radialGradient>
          {/* Film grain */}
          <filter id="wb-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.55" />
            </feComponentTransfer>
          </filter>
        </defs>

        <rect width="1200" height="340" fill="url(#wb-sky)" />
        <rect width="1200" height="340" fill="url(#wb-glow)" />

        {/* Back hills */}
        <path d="M520 340 C 640 210, 760 200, 880 250 S 1100 190, 1200 220 L1200 340 Z" fill="#3b82f6" opacity="0.55" />
        {/* Mid hill */}
        <path d="M580 340 C 700 260, 820 250, 930 280 S 1120 250, 1200 270 L1200 340 Z" fill="#60a5fa" opacity="0.6" />

        {/* Front hill */}
        <path d="M600 340 C 720 300, 860 296, 980 318 S 1140 300, 1200 306 L1200 340 Z" fill="#93c5fd" />

        {/* Grain over everything */}
        <rect width="1200" height="340" filter="url(#wb-grain)" opacity="0.6" style={{ mixBlendMode: "overlay" }} />
        <rect width="1200" height="340" filter="url(#wb-grain)" opacity="0.12" />
      </svg>

      <div className="wb-copy">
        <div className="wb-eyebrow">ClientHub</div>
        <h2 className="wb-title">Wealth, made clear.</h2>
      </div>
    </footer>
  );
}

// Page wrapper that pins the banner to the bottom of the screen, full width.
// Usage: <WithBottomBanner><main className="page">…</main></WithBottomBanner>
export function WithBottomBanner({ children }) {
  return (
    <div className="home-layout">
      <div className="home-page-wrap">{children}</div>
      <WealthBanner />
    </div>
  );
}
