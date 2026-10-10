import { navigate } from "@/lib/router";
import "./WealthBanner.css";

// Dashboard footer banner: grainy blue gradient with a calm, rounded
// landscape (sun, clouds, rolling hills).
// Pure SVG, so it stays sharp and needs no image hosting.
export default function WealthBanner() {
  return (
    <section className="wealth-banner" aria-label="Client Hubs">
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

        {/* Sun */}
        <circle cx="955" cy="70" r="34" fill="#dbeafe" opacity="0.9" />
        <circle cx="955" cy="70" r="52" fill="#dbeafe" opacity="0.15" />

        {/* Clouds */}
        <g fill="#ffffff">
          <g opacity="0.85">
            <ellipse cx="720" cy="78" rx="46" ry="18" />
            <ellipse cx="748" cy="64" rx="30" ry="22" />
            <ellipse cx="776" cy="80" rx="34" ry="15" />
          </g>
          <g opacity="0.7">
            <ellipse cx="1090" cy="120" rx="40" ry="15" />
            <ellipse cx="1112" cy="106" rx="26" ry="18" />
            <ellipse cx="1136" cy="121" rx="28" ry="12" />
          </g>
        </g>

        {/* Back hills */}
        <path d="M520 340 C 640 210, 760 200, 880 250 S 1100 190, 1200 220 L1200 340 Z" fill="#3b82f6" opacity="0.55" />
        {/* Mid hill */}
        <path d="M580 340 C 700 260, 820 250, 930 280 S 1120 250, 1200 270 L1200 340 Z" fill="#60a5fa" opacity="0.6" />

        {/* Front hill */}
        <path d="M600 340 C 720 300, 860 296, 980 318 S 1140 300, 1200 306 L1200 340 Z" fill="#93c5fd" />

        {/* Grain over everything */}
        <rect width="1200" height="340" filter="url(#wb-grain)" opacity="0.35" style={{ mixBlendMode: "overlay" }} />
        <rect width="1200" height="340" filter="url(#wb-grain)" opacity="0.08" />
      </svg>

      <div className="wb-copy">
        <div className="wb-eyebrow">Client Hubs</div>
        <h2 className="wb-title">Wealth, made clear.</h2>
        <p className="wb-text">Every client gets one plan in plain words, approved by compliance and easy to come back to.</p>
        <button className="wb-link" onClick={() => navigate("/c/example")}>See what clients receive ›</button>
      </div>
    </section>
  );
}
