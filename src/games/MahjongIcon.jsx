import React from 'react';

// --- DIMENSIONS & THEME CONFIGURATION ---
export const MAHJONG_THEME = {
  icon: {
    size: 50,
    fontSize: '40px'
  },
  board: {
    cellWidth: 64,
    cellHeight: 67,
    tileWidth: 64,
    tileHeight: 67
  },
  fonts: {
    roundTitleSize: '19px',
    statLabelSize: '11px',
    statValueSize: '18px',
    helperBtnSize: '13px',
    hintBulbSize: '30px',
    badgeSize: '13px',
    descSize: '17px',
    restartBtnSize: '16px',
    footerHelpSize: '12px'
  }
};

const SPRITE_POSITIONS = {
  fa: { x: 0, y: 0 },
  xi: { x: 1, y: 0 },
  flower: { x: 2, y: 0 },
  leaf: { x: 3, y: 0 },
  circles: { x: 0, y: 1 },
  eight_dots: { x: 1, y: 1 },
  one_circle: { x: 2, y: 1 },
  six: { x: 3, y: 1 },
  two: { x: 0, y: 2 },
  bamboo_green_3: { x: 1, y: 2 },
  bamboo_red_3: { x: 2, y: 2 },
  bamboo_green_4: { x: 3, y: 2 }
};

// Helper for robust asset path resolution across local and GitHub Pages deployment
const getTileAssetUrl = (subpath) => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanSub = subpath.startsWith('/') ? subpath.slice(1) : subpath;
  return `${cleanBase}${cleanSub}`;
};

const MahjongIcon = React.memo(function MahjongIcon({ name, tileset }) {
  const size = MAHJONG_THEME.icon.size;

  // --- HIGH-RESOLUTION INDIVIDUAL PNG TILESETS (Anti-Pixelation) ---
  if (tileset === 'nature' || tileset === 'creatures_b') {
    return (
      <img
        src={getTileAssetUrl(`tales/mythic_cloisonne/${name}.png`)}
        alt={name}
        draggable={false}
        loading="eager"
        decoding="sync"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
          borderRadius: '6px',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45))'
        }}
      />
    );
  }

  if (tileset === 'cyber') {
    return (
      <img
        src={getTileAssetUrl(`tales/onyx_gold/${name}.png`)}
        alt={name}
        draggable={false}
        loading="eager"
        decoding="sync"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
          borderRadius: '6px',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45))'
        }}
      />
    );
  }

  if (tileset === 'mosaic') {
    return (
      <img
        src={getTileAssetUrl(`tales/botanical/${name}.png`)}
        alt={name}
        draggable={false}
        loading="eager"
        decoding="sync"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
          borderRadius: '4px',
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.18))'
        }}
      />
    );
  }

  if (tileset === 'luxury_marble_2') {
    return (
      <img
        src={getTileAssetUrl(`tales/luxury_marble_2/clean_${name}.png`)}
        alt={name}
        draggable={false}
        loading="eager"
        decoding="sync"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
          borderRadius: '6px',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25))'
        }}
      />
    );
  }

  if (tileset === 'modern') {
    // Classic Kanji for ALL numbers (1-5 classic, not Daiji honorifique)
    let kanjiChar = '一';
    let isOdd = true;
    let shadeIdx = 0; // 0-5 index for nuance within each parity group

    switch (name) {
      case 'fa': kanjiChar = '一'; isOdd = true; shadeIdx = 0; break; // 1 (Ichi)
      case 'xi': kanjiChar = '二'; isOdd = false; shadeIdx = 0; break; // 2 (Ni)
      case 'six': kanjiChar = '三'; isOdd = true; shadeIdx = 1; break; // 3 (San)
      case 'two': kanjiChar = '四'; isOdd = false; shadeIdx = 1; break; // 4 (Shi)
      case 'circles': kanjiChar = '五'; isOdd = true; shadeIdx = 2; break; // 5 (Go)
      case 'eight_dots': kanjiChar = '六'; isOdd = false; shadeIdx = 2; break; // 6 (Roku)
      case 'one_circle': kanjiChar = '七'; isOdd = true; shadeIdx = 3; break; // 7 (Nana)
      case 'bamboo_green_3': kanjiChar = '八'; isOdd = false; shadeIdx = 3; break; // 8 (Hachi)
      case 'bamboo_red_3': kanjiChar = '九'; isOdd = true; shadeIdx = 4; break; // 9 (Kyu)
      case 'bamboo_green_4': kanjiChar = '十'; isOdd = false; shadeIdx = 4; break; // 10 (Ju)
      case 'flower': kanjiChar = '百'; isOdd = false; shadeIdx = 5; break; // 100 (Hyaku) - even
      case 'leaf': kanjiChar = '千'; isOdd = true; shadeIdx = 5; break; // 1000 (Sen) - odd
      default: kanjiChar = '一'; isOdd = true; shadeIdx = 0; break;
    }

    // Odd = Warm Saturated Wood (rich mahogany/amber)
    // Even = Cool Desaturated Wood (ashen grey-brown)
    // Each shadeIdx gives a progressively lighter nuance within its parity
    const oddShades = [
      ['#4a1c14', '#330e0a', '#200604'], // 一 (1) deepest warm
      ['#552318', '#3c130c', '#280806'], // 三 (3)
      ['#602a1c', '#481810', '#300c08'], // 五 (5)
      ['#6b3120', '#501d14', '#38100a'], // 七 (7)
      ['#763824', '#582218', '#40140c'], // 九 (9)
      ['#813f28', '#60271c', '#48180e'], // 千 (1000) lightest warm
    ];
    const evenShades = [
      ['#2c2426', '#1e1718', '#120e10'], // 二 (2) deepest cool
      ['#342a2e', '#241c20', '#181214'], // 四 (4)
      ['#3c3036', '#2a2028', '#1e1618'], // 六 (6)
      ['#44363e', '#302430', '#24181c'], // 八 (8)
      ['#4c3c46', '#362838', '#2a1e20'], // 十 (10)
      ['#54424e', '#3c2c40', '#302224'], // 百 (100) lightest cool
    ];

    const shades = isOdd ? oddShades[shadeIdx] : evenShades[shadeIdx];
    const grainStroke = isOdd ? 'rgba(130, 50, 15, 0.35)' : 'rgba(90, 75, 90, 0.3)';
    const bevelStroke = isOdd ? 'rgba(245, 158, 11, 0.5)' : 'rgba(148, 163, 184, 0.4)';
    const pearlFill = isOdd ? '#f59e0b' : '#94a3b8';

    // Gold leaf (odd) vs Platinum leaf (even) gradient stops
    const gradStops = isOdd
      ? { a: '#fffeb3', b: '#f59e0b', c: '#d97706', d: '#78350f' }
      : { a: '#f1f5f9', b: '#cbd5e1', c: '#94a3b8', d: '#475569' };
    const glowColor = isOdd ? '#fef08a' : '#e2e8f0';

    return (
      <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none">
        <defs>
          {/* Parity-Specific Metallic Leaf Gradient */}
          <linearGradient id={`goldKanjiGrad_${name}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradStops.a} />
            <stop offset="35%" stopColor={gradStops.b} />
            <stop offset="75%" stopColor={gradStops.c} />
            <stop offset="100%" stopColor={gradStops.d} />
          </linearGradient>
          {/* Carved Inlay Shadow */}
          <filter id={`carvedFilter_${name}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="0.6" floodColor="#000000" floodOpacity="0.95" />
            <feDropShadow dx="0" dy="-0.5" stdDeviation="0.4" floodColor={glowColor} floodOpacity="0.4" />
          </filter>
          {/* Per-Tile Wood Background */}
          <linearGradient id={`woodBg_${name}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={shades[0]} />
            <stop offset="50%" stopColor={shades[1]} />
            <stop offset="100%" stopColor={shades[2]} />
          </linearGradient>
        </defs>

        {/* Wood Background (parity-nuanced) */}
        <rect x="0" y="0" width="48" height="48" rx="4" fill={`url(#woodBg_${name})`} />

        {/* Delicate Wood Grain Lines */}
        <path d="M 6 8 C 16 6, 32 10, 42 8 M 4 24 C 18 22, 30 26, 44 24 M 6 40 C 20 38, 34 42, 42 40" stroke={grainStroke} strokeWidth="0.8" fill="none" />

        {/* Outer Carved Bevel Line */}
        <rect x="4" y="4" width="40" height="40" rx="6" stroke={bevelStroke} strokeWidth="0.5" fill="none" />

        {/* Carved Metallic Leaf Kanji Calligraphy */}
        <text
          x="24"
          y="27"
          fontSize="26"
          fontWeight="900"
          fill={`url(#goldKanjiGrad_${name})`}
          filter={`url(#carvedFilter_${name})`}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily='"Kaiti SC", "STKaiti", "Yu Mincho", "Hiragino Mincho ProN", "Microsoft YaHei", "serif"'
          letterSpacing="-1"
        >
          {kanjiChar}
        </text>

        {/* Inlaid Pearl Dot Accent */}
        <circle cx="24" cy="41" r="1.5" fill={pearlFill} />
      </svg>
    );
  }


  switch (name) {
    case 'fa': // Green Dragon
      return (
        <svg width={size} height={size} viewBox="-2 -2 28 28" fill="none" style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            {/* Rich Emerald Gradient for the body */}
            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>

            {/* Shimmering Gold Gradient for the stroke */}
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a">
                <animate attributeName="stop-color" values="#fef08a;#ca8a04;#fef08a" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#fef08a">
                <animate attributeName="stop-color" values="#fef08a;#eab308;#fef08a" dur="2s" repeatCount="indefinite" />
              </stop>
            </linearGradient>

            {/* Glow Filter for magic effects */}
            <filter id="dragonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Intense Eye Glow */}
            <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="2.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <style>
            {`
              @keyframes dragonIdle {
                0%, 85%, 100% { transform: scale(1) translateY(0) rotate(0deg); filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.5)); }
                90% { transform: scale(1.12) translateY(-2px) rotate(4deg); filter: drop-shadow(0px 10px 15px rgba(250,204,21,0.5)); }
                95% { transform: scale(1.12) translateY(-2px) rotate(-4deg); filter: drop-shadow(0px 10px 15px rgba(250,204,21,0.5)); }
              }
              @keyframes dashAnim {
                from { stroke-dashoffset: 20; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes fierceEye {
                0%, 100% { fill: #fef08a; }
                50% { fill: #ffffff; }
              }
              @keyframes floatSparkle {
                0%, 100% { opacity: 0.2; transform: translateY(0) scale(1); }
                50% { opacity: 1; transform: translateY(-3px) scale(1.5); }
              }
              .dragon-expert {
                animation: dragonIdle 8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                transform-origin: 12px 12px;
              }
              .magic-contour {
                stroke-dasharray: 4 6;
                animation: dashAnim 2s linear infinite;
              }
              .dragon-eye-expert {
                animation: fierceEye 3.5s ease-in-out infinite;
                filter: url(#eyeGlow);
              }
              .sparkle {
                animation: floatSparkle 2s ease-in-out infinite;
              }
            `}
          </style>

          <g className="dragon-expert">
            {/* Ambient Aura */}
            <circle cx="12" cy="12" r="10" fill="url(#emeraldGrad)" opacity="0.2" filter="url(#dragonGlow)" />

            {/* Main Silhouette with Emerald Gradient */}
            <path id="dragon-path"
              d="M12 1 L14.5 5.5 L20 4 L17.5 9.5 L22 13 L16.5 15.5 L18 21 L12 18.5 L6 21 L7.5 15.5 L2 13 L6.5 9.5 L4 4 L9.5 5.5 Z"
              fill="url(#emeraldGrad)"
              stroke="#022c22"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />

            {/* Scintillating Golden Contour */}
            <path
              d="M12 1 L14.5 5.5 L20 4 L17.5 9.5 L22 13 L16.5 15.5 L18 21 L12 18.5 L6 21 L7.5 15.5 L2 13 L6.5 9.5 L4 4 L9.5 5.5 Z"
              fill="none"
              stroke="url(#goldGrad)"
              strokeWidth="1.2"
              strokeLinejoin="round"
              className="magic-contour"
              filter="url(#dragonGlow)"
            />

            {/* Inner Emerald Scales */}
            <path d="M12 4 L13 6 L12 7 L11 6 Z M12 8 L13.5 10 L12 11 L10.5 10 Z" fill="#86efac" opacity="0.6" />

            {/* Angry Fiery Eyes */}
            <path className="dragon-eye-expert" d="M7 11 L11 12.5 L7 14 Z" />
            <path className="dragon-eye-expert" d="M17 11 L13 12.5 L17 14 Z" />

            {/* Sharp Fangs */}
            <path d="M10 18.5 L10.5 20 L11 18.5 Z" fill="#ffffff" />
            <path d="M14 18.5 L13.5 20 L13 18.5 Z" fill="#ffffff" />

            {/* Glowing Nostrils */}
            <circle cx="10" cy="16.5" r="1.2" fill="#022c22" />
            <circle cx="14" cy="16.5" r="1.2" fill="#022c22" />

            {/* Glowing Traditional Character */}
            <text x="12" y="7.5" fontSize="4.8" fontWeight="900" fill="url(#goldGrad)" filter="url(#dragonGlow)" textAnchor="middle" dominantBaseline="middle" fontFamily='"Microsoft YaHei", "SimHei", sans-serif'>
              發
            </text>

            {/* Floating Magic Sparkles */}
            <circle cx="4" cy="4" r="0.6" fill="#fef08a" className="sparkle" style={{ animationDelay: '0s' }} />
            <circle cx="20" cy="20" r="0.8" fill="#4ade80" className="sparkle" style={{ animationDelay: '0.5s' }} />
            <circle cx="21" cy="5" r="0.5" fill="#fef08a" className="sparkle" style={{ animationDelay: '1s' }} />
            <circle cx="3" cy="18" r="0.7" fill="#4ade80" className="sparkle" style={{ animationDelay: '1.5s' }} />
          </g>
        </svg>
      );
    case 'xi': // West Wind
      return (
        <span style={{
          fontSize: MAHJONG_THEME.icon.fontSize,
          color: '#1f2937', // Very Dark Grey/Black
          fontWeight: '900',
          fontFamily: '"Microsoft YaHei", "SimHei", "Noto Sans TC", sans-serif',
          lineHeight: '1',
          textShadow: '1px 1px 0px rgba(0,0,0,0.1)'
        }}>
          西
        </span>
      );
    case 'six': // Six
      return (
        <span style={{
          fontSize: MAHJONG_THEME.icon.fontSize,
          color: '#1e3a8a', // Dark Navy Blue
          fontWeight: '900',
          fontFamily: '"Microsoft YaHei", "SimHei", "Noto Sans TC", sans-serif',
          lineHeight: '1',
          textShadow: '1px 1px 0px rgba(0,0,0,0.1)'
        }}>
          六
        </span>
      );
    case 'two': // Two
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
          <rect x="3" y="6" width="18" height="3" rx="1.5" fill="#1e3a8a" />
          <rect x="3" y="15" width="18" height="3" rx="1.5" fill="#1e3a8a" />
        </svg>
      );
    case 'circles': // 9 Dots (all blue like reference)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
          <circle cx="5" cy="5" r="3" fill="#1e3a8a" />
          <circle cx="5" cy="5" r="1" fill="#ffffff" />
          <circle cx="12" cy="5" r="3" fill="#1e3a8a" />
          <circle cx="12" cy="5" r="1" fill="#ffffff" />
          <circle cx="19" cy="5" r="3" fill="#1e3a8a" />
          <circle cx="19" cy="5" r="1" fill="#ffffff" />

          <circle cx="5" cy="12" r="3" fill="#1e3a8a" />
          <circle cx="5" cy="12" r="1" fill="#ffffff" />
          <circle cx="12" cy="12" r="3" fill="#1e3a8a" />
          <circle cx="12" cy="12" r="1" fill="#ffffff" />
          <circle cx="19" cy="12" r="3" fill="#1e3a8a" />
          <circle cx="19" cy="12" r="1" fill="#ffffff" />

          <circle cx="5" cy="19" r="3" fill="#1e3a8a" />
          <circle cx="5" cy="19" r="1" fill="#ffffff" />
          <circle cx="12" cy="19" r="3" fill="#1e3a8a" />
          <circle cx="12" cy="19" r="1" fill="#ffffff" />
          <circle cx="19" cy="19" r="3" fill="#1e3a8a" />
          <circle cx="19" cy="19" r="1" fill="#ffffff" />
        </svg>
      );
    case 'eight_dots': // 8 Dots (all blue like reference)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
          <circle cx="8" cy="3.5" r="2.8" fill="#1e3a8a" />
          <circle cx="8" cy="3.5" r="1" fill="#ffffff" />
          <circle cx="16" cy="3.5" r="2.8" fill="#1e3a8a" />
          <circle cx="16" cy="3.5" r="1" fill="#ffffff" />

          <circle cx="8" cy="9.1" r="2.8" fill="#1e3a8a" />
          <circle cx="8" cy="9.1" r="1" fill="#ffffff" />
          <circle cx="16" cy="9.1" r="2.8" fill="#1e3a8a" />
          <circle cx="16" cy="9.1" r="1" fill="#ffffff" />

          <circle cx="8" cy="14.8" r="2.8" fill="#1e3a8a" />
          <circle cx="8" cy="14.8" r="1" fill="#ffffff" />
          <circle cx="16" cy="14.8" r="2.8" fill="#1e3a8a" />
          <circle cx="16" cy="14.8" r="1" fill="#ffffff" />

          <circle cx="8" cy="20.5" r="2.8" fill="#1e3a8a" />
          <circle cx="8" cy="20.5" r="1" fill="#ffffff" />
          <circle cx="16" cy="20.5" r="2.8" fill="#1e3a8a" />
          <circle cx="16" cy="20.5" r="1" fill="#ffffff" />
        </svg>
      );
    case 'one_circle': // 1 Dot (Rosette)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
          <circle cx="12" cy="12" r="10" fill="#1e3a8a" />
          <circle cx="12" cy="12" r="7.5" fill="#16a34a" />
          <circle cx="12" cy="12" r="4.5" fill="#dc2626" />
          <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
        </svg>
      );
    case 'bamboo_green_3': // 3 green bamboos
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <rect x="4" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <rect x="10.25" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <rect x="16.5" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <line x1="4" y1="9" x2="7.5" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="4" y1="15" x2="7.5" y2="15" stroke="#ffffff" strokeWidth="1" />
          <line x1="10.25" y1="9" x2="13.75" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="10.25" y1="15" x2="13.75" y2="15" stroke="#ffffff" strokeWidth="1" />
          <line x1="16.5" y1="9" x2="20" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="16.5" y1="15" x2="20" y2="15" stroke="#ffffff" strokeWidth="1" />
        </svg>
      );
    case 'bamboo_green_4': // 2 bamboos with a red bar (like the reference's "2 bamboo")
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <rect x="7" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <rect x="13.5" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <line x1="7" y1="9" x2="10.5" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="7" y1="15" x2="10.5" y2="15" stroke="#ffffff" strokeWidth="1" />
          <line x1="13.5" y1="9" x2="17" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="13.5" y1="15" x2="17" y2="15" stroke="#ffffff" strokeWidth="1" />
          <rect x="9.5" y="10.5" width="5" height="3" rx="1" fill="#dc2626" />
        </svg>
      );
    case 'bamboo_red_3': // 3 bamboos with alternating colors
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <rect x="4" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <rect x="10.25" y="3" width="3.5" height="18" rx="1.5" fill="#dc2626" />
          <rect x="16.5" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <line x1="4" y1="9" x2="7.5" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="4" y1="15" x2="7.5" y2="15" stroke="#ffffff" strokeWidth="1" />
          <line x1="10.25" y1="9" x2="13.75" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="10.25" y1="15" x2="13.75" y2="15" stroke="#ffffff" strokeWidth="1" />
          <line x1="16.5" y1="9" x2="20" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="16.5" y1="15" x2="20" y2="15" stroke="#ffffff" strokeWidth="1" />
        </svg>
      );
    case 'flower': // Pink Sakura Blossom
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          {/* Leaves at bottom */}
          <path d="M7 17C4 17 2 13 4 11C6 9 9 14 7 17Z" fill="#16a34a" />
          <path d="M17 17C20 17 22 13 20 11C18 9 15 14 17 17Z" fill="#16a34a" />
          {/* Flower Petals */}
          <circle cx="12" cy="7" r="4.5" fill="#f472b6" />
          <circle cx="7" cy="11" r="4.5" fill="#f472b6" />
          <circle cx="17" cy="11" r="4.5" fill="#f472b6" />
          <circle cx="9.5" cy="16" r="4.5" fill="#f472b6" />
          <circle cx="14.5" cy="16" r="4.5" fill="#f472b6" />
          <circle cx="12" cy="11" r="5" fill="#fbcfe8" />
          {/* Yellow Center */}
          <circle cx="12" cy="11.5" r="2.5" fill="#eab308" />
        </svg>
      );
    case 'leaf': // Orange Maple Leaf on yellow plate
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <circle cx="12" cy="12" r="10" fill="#fde047" />
          <path d="M12 4L14.5 9H19L16 12L17.5 17L12 14L6.5 17L8 12L5 9H9.5L12 4Z" fill="#f97316" />
          <path d="M12 14V19" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
});
export default MahjongIcon;

