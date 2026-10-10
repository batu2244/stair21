import { navigate } from "@/lib/router";
import "./WealthBanner.css";

// Dashboard footer banner: grainy blue gradient with a friendly, rounded
// wealth-planning scene (hills, clouds, a rising path, coins, a shield, a plant).
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
          <linearGradient id="wb-coin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
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

        {/* Rising path to a flag */}
        <path d="M640 300 C 720 290, 760 250, 820 236 S 920 190, 1010 150"
          fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 12" opacity="0.95" />
        {[[640, 300], [820, 236], [930, 192], [1010, 150]].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="7" fill="#ffffff" stroke="#1d4ed8" strokeWidth="3" />
        ))}
        <line x1="1010" y1="150" x2="1010" y2="104" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M1010 104 L1046 114 L1010 124 Z" fill="#fbbf24" />

        {/* Front hill */}
        <path d="M600 340 C 720 300, 860 296, 980 318 S 1140 300, 1200 306 L1200 340 Z" fill="#93c5fd" />

        {/* Coin stack */}
        <g transform="translate(700 262)">
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(0 ${-i * 12})`}>
              <ellipse cx="0" cy="14" rx="30" ry="9" fill="#d97706" />
              <rect x="-30" y="5" width="60" height="9" fill="#f59e0b" />
              <ellipse cx="0" cy="5" rx="30" ry="9" fill="url(#wb-coin)" />
            </g>
          ))}
          <text x="0" y="-27" textAnchor="middle" fontSize="13" fontWeight="700" fill="#b45309" fontFamily="Inter, sans-serif">$</text>
        </g>

        {/* Shield with check */}
        <g transform="translate(870 236)">
          <path d="M0 -40 L30 -29 L30 -2 C30 20, 14 34, 0 40 C -14 34, -30 20, -30 -2 L -30 -29 Z" fill="#ffffff" />
          <path d="M0 -30 L21 -22 L21 -2 C21 14, 10 24, 0 29 C -10 24, -21 14, -21 -2 L -21 -22 Z" fill="#dbeafe" />
          <path d="M-10 0 L-2 9 L13 -8" fill="none" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Plant in a pot */}
        <g transform="translate(1110 262)">
          <path d="M0 0 C 0 -26, -4 -44, -2 -62" fill="none" stroke="#166534" strokeWidth="4" strokeLinecap="round" />
          <path d="M-2 -30 C -26 -36, -34 -56, -30 -64 C -12 -60, -4 -46, -2 -30 Z" fill="#22c55e" />
          <path d="M-1 -42 C 22 -50, 32 -70, 28 -78 C 10 -74, 0 -60, -1 -42 Z" fill="#4ade80" />
          <path d="M-2 -60 C -14 -72, -10 -86, -4 -90 C 4 -82, 4 -70, -2 -60 Z" fill="#86efac" />
          <path d="M-24 0 L24 0 L18 34 L-18 34 Z" fill="#ffffff" />
          <rect x="-27" y="-6" width="54" height="10" rx="4" fill="#e0e7ff" />
        </g>

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
