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

const MahjongIcon = React.memo(function MahjongIcon({ name, tileset }) {
  const size = MAHJONG_THEME.icon.size;

  if (tileset === 'nature') {
    switch (name) {
      case 'fa': // Qilin (Sacred Jade Unicorn/Deer - Green & Gold)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
            {/* Horns & Mane */}
            <path d="M 22 13 L 26 5 L 29 11" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M 26 5 L 30 3" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M 20 16 C 16 12, 12 16, 14 20" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
            {/* Qilin Body */}
            <path d="M 14 24 C 12 18, 20 14, 25 18 C 29 16, 34 20, 32 26 C 30 32, 26 34, 20 34 C 15 34, 14 30, 14 24 Z" fill="#059669" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Legs */}
            <path d="M 17 34 L 16 42 M 22 34 L 23 42 M 27 34 L 28 42 M 31 32 L 34 40" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="16" cy="42" r="1.2" fill="#fbbf24" />
            <circle cx="23" cy="42" r="1.2" fill="#fbbf24" />
            <circle cx="28" cy="42" r="1.2" fill="#fbbf24" />
            <circle cx="34" cy="40" r="1.2" fill="#fbbf24" />
            {/* Tail Flame */}
            <path d="M 32 26 C 38 24, 42 28, 38 34 C 35 32, 34 28, 32 26 Z" fill="#f59e0b" stroke="#dc2626" strokeWidth="1" />
            {/* Eye & Details */}
            <circle cx="22" cy="18" r="1" fill="#fef08a" />
          </svg>
        );
      case 'xi': // Fenghuang (Golden & Blue Phoenix)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
            {/* Flowing Tail Feathers */}
            <path d="M 24 28 C 18 34, 12 42, 8 44 C 14 42, 20 36, 24 30 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <path d="M 24 28 C 28 34, 34 42, 38 44 C 32 42, 26 36, 24 30 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <path d="M 24 30 C 24 37, 24 44, 23 46 C 25 44, 25 37, 24 30 Z" fill="#ea580c" stroke="#f59e0b" strokeWidth="0.8" />
            {/* Wings Spread */}
            <path d="M 24 20 C 18 12, 10 14, 6 20 C 12 22, 18 22, 24 24 Z" fill="#0284c7" stroke="#f59e0b" strokeWidth="1.5" />
            <path d="M 24 20 C 30 12, 38 14, 42 20 C 36 22, 30 22, 24 24 Z" fill="#0284c7" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Body & Head */}
            <path d="M 24 10 C 22 14, 22 22, 24 28 C 26 22, 26 14, 24 10 Z" fill="#ea580c" stroke="#f59e0b" strokeWidth="1.2" />
            {/* Crown Crest */}
            <path d="M 24 10 L 22 4 M 24 10 L 24 3 M 24 10 L 26 4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="24" cy="3" r="1.2" fill="#ef4444" />
          </svg>
        );
      case 'six': // Qinglong (Azure Dragon - Blue & Gold)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
            {/* Coiled Dragon Body */}
            <path d="M 20 8 C 30 6, 40 14, 34 24 C 28 32, 14 30, 14 20 C 14 14, 20 18, 26 22 C 30 26, 28 36, 18 42" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 20 8 C 30 6, 40 14, 34 24 C 28 32, 14 30, 14 20 C 14 14, 20 18, 26 22 C 30 26, 28 36, 18 42" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Dragon Head */}
            <path d="M 18 10 L 12 7 L 16 13 Z" fill="#38bdf8" stroke="#f59e0b" strokeWidth="1.2" />
            <path d="M 16 6 L 20 9 L 14 12" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
            {/* Flame Claws */}
            <circle cx="34" cy="24" r="2" fill="#ef4444" stroke="#fbbf24" strokeWidth="1" />
            <circle cx="16" cy="32" r="2" fill="#ef4444" stroke="#fbbf24" strokeWidth="1" />
          </svg>
        );
      case 'two': // Xuanwu (Black Tortoise & Serpent - Green & Gold)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
            {/* Turtle Shell */}
            <ellipse cx="24" cy="30" rx="13" ry="10" fill="#047857" stroke="#f59e0b" strokeWidth="1.8" />
            <path d="M 18 25 L 24 22 L 30 25 L 30 32 L 24 35 L 18 32 Z" fill="#065f46" stroke="#fbbf24" strokeWidth="1" />
            {/* Turtle Feet & Tail */}
            <rect x="13" y="36" width="4" height="6" rx="2" fill="#047857" stroke="#f59e0b" strokeWidth="1" />
            <rect x="31" y="36" width="4" height="6" rx="2" fill="#047857" stroke="#f59e0b" strokeWidth="1" />
            {/* Serpent Coiled Above */}
            <path d="M 24 30 C 14 26, 12 16, 20 12 C 28 8, 34 16, 24 20" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 24 30 C 14 26, 12 16, 20 12 C 28 8, 34 16, 24 20" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M 20 12 L 18 8 M 20 12 L 23 8" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="20" cy="11" r="1" fill="#ef4444" />
          </svg>
        );
      case 'circles': // Zhuque (Vermilion Fire Phoenix)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
            {/* Flaming Wings Symmetrical */}
            <path d="M 24 26 C 16 20, 8 10, 4 16 C 10 24, 18 28, 24 30 Z" fill="#dc2626" stroke="#fbbf24" strokeWidth="1.5" />
            <path d="M 24 26 C 32 20, 40 10, 44 16 C 38 24, 30 28, 24 30 Z" fill="#dc2626" stroke="#fbbf24" strokeWidth="1.5" />
            <path d="M 24 24 C 18 16, 12 8, 9 12 C 14 18, 20 22, 24 24 Z" fill="#ea580c" stroke="#fef08a" strokeWidth="1" />
            <path d="M 24 24 C 30 16, 36 8, 39 12 C 34 18, 28 22, 24 24 Z" fill="#ea580c" stroke="#fef08a" strokeWidth="1" />
            {/* Flaming Tail */}
            <path d="M 24 30 L 20 44 L 24 40 L 28 44 Z" fill="#f59e0b" stroke="#dc2626" strokeWidth="1.2" />
            {/* Head Crest */}
            <circle cx="24" cy="14" r="3.5" fill="#f59e0b" stroke="#dc2626" strokeWidth="1.2" />
            <path d="M 24 10.5 L 24 4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="24" cy="4" r="1.5" fill="#ef4444" />
          </svg>
        );
      case 'eight_dots': // Baihu (White Tiger - White, Gold & Navy)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
            {/* Body */}
            <path d="M 14 26 C 14 18, 22 14, 30 16 C 36 18, 38 24, 34 32 C 30 36, 18 36, 14 30 Z" fill="#f8fafc" stroke="#d97706" strokeWidth="1.8" />
            {/* Legs */}
            <path d="M 16 30 L 15 42 M 22 32 L 22 42 M 29 32 L 30 42 M 34 30 L 36 40" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            {/* Stripes */}
            <path d="M 20 18 L 22 24 M 26 17 L 27 23 M 31 20 L 30 25" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
            {/* Tail Curved Up */}
            <path d="M 34 20 C 38 14, 42 16, 40 10" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
            <path d="M 34 20 C 38 14, 42 16, 40 10" stroke="#d97706" strokeWidth="1" strokeLinecap="round" fill="none" />
            {/* Head & Eyes */}
            <circle cx="16" cy="18" r="4.5" fill="#f8fafc" stroke="#d97706" strokeWidth="1.5" />
            <circle cx="15" cy="17" r="1" fill="#0284c7" />
          </svg>
        );
      case 'one_circle': // Feilong (Winged Dragon - Azure & Gold Wings)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
            {/* Large Gold Wings */}
            <path d="M 24 22 C 16 12, 6 12, 4 20 C 10 24, 18 24, 24 26 Z" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1.5" />
            <path d="M 24 22 C 32 12, 42 12, 44 20 C 38 24, 30 24, 24 26 Z" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1.5" />
            {/* Dragon Body */}
            <path d="M 24 10 C 22 16, 20 28, 24 40 C 26 34, 26 20, 24 10 Z" fill="#0284c7" stroke="#fbbf24" strokeWidth="1.5" />
            {/* Dragon Head & Horns */}
            <path d="M 24 10 L 19 4 M 24 10 L 29 4" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="24" cy="11" r="2" fill="#ef4444" />
          </svg>
        );
      case 'bamboo_green_3': // HuLu (Golden Gourd of Longevity)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
            {/* Top Bulb */}
            <circle cx="24" cy="16" r="7" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.8" />
            {/* Bottom Bulb */}
            <circle cx="24" cy="30" r="11" fill="#d97706" stroke="#fef08a" strokeWidth="1.8" />
            {/* Inner Gold Relief Lines */}
            <path d="M 24 20 L 24 25" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
            <path d="M 18 30 C 18 36, 30 36, 30 30" stroke="#fef08a" strokeWidth="1.5" fill="none" />
            {/* Vines & Stem */}
            <path d="M 24 9 C 24 5, 20 4, 17 6 M 24 9 C 24 5, 28 4, 31 6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <circle cx="24" cy="9" r="1.5" fill="#fef08a" />
          </svg>
        );
      case 'bamboo_red_3': // Pixiu (Guardian Foo Dog - Green & Gold)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
            {/* Sturdy Body */}
            <path d="M 14 24 C 14 16, 24 14, 32 18 C 36 22, 34 32, 28 36 C 20 38, 14 32, 14 24 Z" fill="#059669" stroke="#fbbf24" strokeWidth="1.8" />
            {/* Swirling Mane & Flame Tail */}
            <path d="M 32 18 C 38 12, 42 16, 38 22" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 28 36 C 34 42, 38 38, 36 32" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Head & Fangs */}
            <circle cx="16" cy="18" r="5" fill="#047857" stroke="#fbbf24" strokeWidth="1.5" />
            <circle cx="14.5" cy="17" r="1" fill="#fef08a" />
            <path d="M 13 21 L 15 21" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case 'bamboo_green_4': // Bai Ze (Celestial Lion - Ice Blue & Gold)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
            {/* Body */}
            <path d="M 16 26 C 14 18, 22 14, 30 16 C 36 20, 34 32, 28 36 C 20 38, 16 32, 16 26 Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.8" />
            {/* Horns */}
            <path d="M 18 12 L 14 5 M 22 12 L 26 5" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
            {/* Eyes on Head & Body (Bai Ze feature) */}
            <circle cx="18" cy="16" r="1.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx="24" cy="22" r="1.2" fill="#f59e0b" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx="28" cy="26" r="1.2" fill="#f59e0b" stroke="#0f172a" strokeWidth="0.8" />
            {/* Mane */}
            <path d="M 14 18 C 10 22, 10 28, 14 30" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'flower': // Taotie (Enamel Ritual Mask - Red, Gold, Teal & Ivory)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
            {/* Outer Mask Contour */}
            <path d="M 10 12 L 24 6 L 38 12 L 36 32 L 24 42 L 12 32 Z" fill="#991b1b" stroke="#fbbf24" strokeWidth="2" />
            {/* Horns */}
            <path d="M 14 10 L 8 4 L 14 6 Z" fill="#f59e0b" stroke="#fbbf24" opacity="0.9" />
            <path d="M 34 10 L 40 4 L 34 6 Z" fill="#f59e0b" stroke="#fbbf24" opacity="0.9" />
            {/* Teal Brow Inlay */}
            <path d="M 14 16 L 24 12 L 34 16 L 24 20 Z" fill="#0d9488" stroke="#fbbf24" strokeWidth="1.2" />
            {/* Eyes */}
            <ellipse cx="18" cy="24" rx="3.5" ry="2.5" fill="#f59e0b" stroke="#000" strokeWidth="1" />
            <ellipse cx="30" cy="24" rx="3.5" ry="2.5" fill="#f59e0b" stroke="#000" strokeWidth="1" />
            <circle cx="18" cy="24" r="1.2" fill="#000" />
            <circle cx="30" cy="24" r="1.2" fill="#000" />
            {/* Fangs & Mouth */}
            <path d="M 18 32 L 20 36 L 22 32 L 24 36 L 26 32 L 28 36 L 30 32" stroke="#fffbebe6" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'leaf': // Yutu (Moon Rabbit & Crescent Moon - Ivory & Gold)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
            {/* Crescent Moon */}
            <path d="M 14 6 C 8 12, 8 22, 14 28 C 10 24, 10 14, 14 6 Z" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1.2" />
            {/* Seated Ivory Rabbit */}
            <path d="M 22 36 C 18 36, 18 28, 24 24 C 22 20, 26 16, 30 18 C 34 20, 36 26, 32 32 C 30 36, 26 36, 22 36 Z" fill="#fffbebe6" stroke="#d97706" strokeWidth="1.8" />
            {/* Long Ears */}
            <path d="M 28 17 C 26 10, 29 6, 31 8 C 30 12, 29 15, 28 17 Z" fill="#fffbebe6" stroke="#d97706" strokeWidth="1.2" />
            <path d="M 31 18 C 32 11, 35 7, 37 9 C 35 13, 33 16, 31 18 Z" fill="#fffbebe6" stroke="#d97706" strokeWidth="1.2" />
            {/* Eye & Nose */}
            <circle cx="28" cy="20" r="1" fill="#dc2626" />
            {/* Laurel Branch */}
            <path d="M 16 38 C 20 40, 26 42, 32 40" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <circle cx="20" cy="39" r="1.2" fill="#fbbf24" />
            <circle cx="26" cy="41" r="1.2" fill="#fbbf24" />
          </svg>
        );
      default:
        return null;
    }
  }

  if (tileset === 'cyber') {
    switch (name) {
      case 'fa': // Minimal Electric Bolt (Vibrant Yellow & Cyan)
        return (
          <svg className="anim-cyber-neon" width="100%" height="100%" viewBox="0 0 48 48" fill="none">
            {/* Bold Neon Bolt */}
            <path d="M 28 4 L 11 25 H 25 L 19 44 L 37 21 H 23 L 28 4 Z" fill="#ffe600" stroke="#00f0ff" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Minimal Face */}
            <circle cx="21" cy="22" r="1.5" fill="#0d111d" />
            <circle cx="27" cy="22" r="1.5" fill="#0d111d" />
            <path d="M 22.5 24.5 C 23.5 25.5, 24.5 25.5, 25.5 24.5" stroke="#0d111d" strokeWidth="1" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'xi': // Minimal 8-Bit Invader (Vibrant Magenta & Cyan)
        return (
          <svg className="anim-cyber-bob" width="100%" height="100%" viewBox="0 0 48 48" fill="none">
            {/* Invader Body */}
            <path d="M 14 12 H 34 V 16 H 38 V 28 H 34 V 32 H 30 V 28 H 18 V 32 H 14 V 28 H 10 V 16 H 14 V 12 Z" fill="#ff007f" stroke="#00f0ff" strokeWidth="1.5" />
            {/* Antennas */}
            <path d="M 12 12 L 8 6 M 36 12 L 40 6" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" />
            {/* Bright Cyan Eyes */}
            <rect x="16" y="18" width="5" height="5" rx="1" fill="#00f0ff" />
            <rect x="27" y="18" width="5" height="5" rx="1" fill="#00f0ff" />
            <rect x="18" y="20" width="2" height="2" fill="#ffffff" />
            <rect x="29" y="20" width="2" height="2" fill="#ffffff" />
          </svg>
        );
      case 'six': // Minimal Cyber Bot Head (Vibrant Cyan & Pink)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none">
            {/* Head Contour */}
            <rect x="10" y="10" width="28" height="26" rx="6" fill="#151b2c" stroke="#00f0ff" strokeWidth="2" />
            {/* Earpieces */}
            <rect x="5" y="18" width="5" height="10" rx="2" fill="#ff007f" />
            <rect x="38" y="18" width="5" height="10" rx="2" fill="#ff007f" />
            {/* Visor */}
            <rect x="14" y="15" width="20" height="10" rx="3" fill="#00f0ff" stroke="#ffffff" strokeWidth="1" />
            {/* Visor Eyes */}
            <circle cx="19" cy="20" r="2.2" fill="#0d111d" />
            <circle cx="29" cy="20" r="2.2" fill="#0d111d" />
            <circle cx="18.3" cy="19.3" r="0.8" fill="#00f0ff" />
            <circle cx="28.3" cy="19.3" r="0.8" fill="#00f0ff" />
            {/* Smile */}
            <path d="M 21.5 29 C 22.5 30.5, 25.5 30.5, 26.5 29" stroke="#ff007f" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'two': // Minimal Floppy Disk (Vibrant Neon Purple & Cyan)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none">
            {/* Disk Body */}
            <rect x="9" y="8" width="30" height="32" rx="4" fill="#a855f7" stroke="#00f0ff" strokeWidth="1.8" />
            {/* Shutter */}
            <rect x="15" y="8" width="18" height="12" fill="#ffffff" rx="1" />
            <rect x="19" y="10" width="5" height="8" rx="1" fill="#0d111d" />
            {/* Label Window */}
            <rect x="14" y="24" width="20" height="12" rx="2" fill="#0d111d" stroke="#00f0ff" strokeWidth="1" />
            {/* Cute Face on Label */}
            <circle cx="19" cy="29" r="1.5" fill="#00f0ff" />
            <circle cx="29" cy="29" r="1.5" fill="#00f0ff" />
            <path d="M 22 31.5 C 23 32.5, 25 32.5, 26 31.5" stroke="#ff007f" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'circles': // Minimal Plasma Orb (Vibrant Cyan Sphere & Pink Orbital Ring)
        return (
          <svg className="anim-cyber-neon" width="100%" height="100%" viewBox="0 0 48 48" fill="none">
            {/* Orbital Ring */}
            <ellipse cx="24" cy="24" rx="19" ry="7" stroke="#ff007f" strokeWidth="2.5" transform="rotate(-20 24 24)" />
            {/* Core Sphere */}
            <circle cx="24" cy="24" r="12" fill="#00f0ff" stroke="#ffffff" strokeWidth="1.5" />
            {/* Face in Core */}
            <circle cx="20" cy="23" r="1.5" fill="#0d111d" />
            <circle cx="28" cy="23" r="1.5" fill="#0d111d" />
            <path d="M 22 26 C 23 27, 25 27, 26 26" stroke="#0d111d" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'eight_dots': // Minimal Neon Matrix Diamond (Cyan & Yellow)
        return (
          <svg className="anim-cyber-bob" width="100%" height="100%" viewBox="0 0 48 48" fill="none">
            {/* Center Diamond */}
            <path d="M 24 6 L 38 24 L 24 42 L 10 24 Z" fill="#00f0ff" stroke="#ffffff" strokeWidth="1.5" />
            {/* Inner Diamond Face */}
            <path d="M 24 14 L 31 24 L 24 34 L 17 24 Z" fill="#0d111d" />
            <circle cx="21" cy="23" r="1.2" fill="#ffe600" />
            <circle cx="27" cy="23" r="1.2" fill="#ffe600" />
            <path d="M 22.5 25.5 C 23.5 26.5, 24.5 26.5, 25.5 25.5" stroke="#ffe600" strokeWidth="1" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'one_circle': // Minimal Laser Ring / CD (Vibrant Rainbow Concentric Rings)
        return (
          <svg className="anim-cyber-spin" width="100%" height="100%" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="18" fill="#ff007f" stroke="#00f0ff" strokeWidth="2" />
            <circle cx="24" cy="24" r="12" fill="#ffe600" />
            <circle cx="24" cy="24" r="6" fill="#00f0ff" />
            <circle cx="24" cy="24" r="3" fill="#0d111d" />
          </svg>
        );
      case 'bamboo_green_3': // Minimal Neon DNA Helix (Vibrant Neon Green & Cyan)
        return (
          <svg className="anim-cyber-bob" width="100%" height="100%" viewBox="0 0 48 48" fill="none">
            {/* DNA Waves */}
            <path d="M 14 8 C 14 18, 34 22, 34 32 C 34 38, 14 40, 14 40" stroke="#00ff66" strokeWidth="3" strokeLinecap="round" />
            <path d="M 34 8 C 34 18, 14 22, 14 32 C 14 38, 34 40, 34 40" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" />
            {/* Nodes */}
            <circle cx="24" cy="20" r="4.5" fill="#ff007f" stroke="#ffffff" strokeWidth="1" />
            <circle cx="22.5" cy="19.5" r="0.8" fill="#ffffff" />
            <circle cx="25.5" cy="19.5" r="0.8" fill="#ffffff" />
          </svg>
        );
      case 'bamboo_red_3': // Minimal Terminal Laptop (Vibrant Pink & Cyan)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none">
            {/* Screen */}
            <rect x="10" y="8" width="28" height="20" rx="4" fill="#ff007f" stroke="#00f0ff" strokeWidth="1.8" />
            <rect x="14" y="11" width="20" height="14" rx="2" fill="#0d111d" />
            {/* Screen Face <◕‿◕> */}
            <text x="24" y="21" fontSize="9" fontWeight="900" fill="#00f0ff" textAnchor="middle" fontFamily="sans-serif">&lt;◕‿◕&gt;</text>
            {/* Keyboard Base */}
            <path d="M 6 34 L 11 28 H 37 L 42 34 H 6 Z" fill="#00f0ff" />
          </svg>
        );
      case 'bamboo_green_4': // Minimal Neon Battery (Vibrant Green & Yellow)
        return (
          <svg className="anim-cyber-neon" width="100%" height="100%" viewBox="0 0 48 48" fill="none">
            {/* Battery Cap */}
            <rect x="20" y="5" width="8" height="4" rx="1.5" fill="#00ff66" />
            {/* Battery Body */}
            <rect x="12" y="9" width="24" height="32" rx="5" fill="#0d111d" stroke="#00ff66" strokeWidth="2" />
            {/* Energy Bars */}
            <rect x="16" y="29" width="16" height="8" rx="2" fill="#00ff66" />
            <rect x="16" y="19" width="16" height="8" rx="2" fill="#00ff66" />
            <rect x="16" y="13" width="16" height="4" rx="1" fill="#ffe600" />
          </svg>
        );
      case 'flower': // Minimal Neon Spiral Vortex (Vibrant Pink & Cyan Spin)
        return (
          <svg className="anim-cyber-spin" width="100%" height="100%" viewBox="0 0 48 48" fill="none">
            <path d="M 24 24 C 32 12, 44 24, 24 40 C 4 24, 16 12, 24 24 Z" fill="#ff007f" stroke="#00f0ff" strokeWidth="2" />
            <path d="M 24 24 C 16 36, 4 24, 24 8 C 44 24, 32 36, 24 24 Z" fill="#00f0ff" opacity="0.8" />
            <circle cx="24" cy="24" r="4" fill="#ffe600" />
          </svg>
        );
      case 'leaf': // Minimal Neon Gear (Vibrant Electric Yellow & Cyan)
        return (
          <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="13" fill="#ffe600" stroke="#00f0ff" strokeWidth="2" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <rect key={i} x="22.5" y="6" width="3" height="6" rx="1.5" fill="#ffe600" stroke="#00f0ff" strokeWidth="1" transform={`rotate(${angle} 24 24)`} />
            ))}
            <circle cx="24" cy="24" r="6" fill="#0d111d" stroke="#00f0ff" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="2" fill="#ff007f" />
          </svg>
        );
      default:
        return null;
    }
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

  if (tileset === 'luxury_marble_2' || tileset === 'mosaic' || tileset === 'creatures_b') {
    const pos = SPRITE_POSITIONS[name] || { x: 0, y: 0 };
    const bgX = (pos.x / 3) * 100;
    const bgY = (pos.y / 2) * 100;
    const spriteUrl = tileset === 'luxury_marble_2'
      ? './tales/luxury_marble_2/sprite_sheet.png'
      : tileset === 'creatures_b'
        ? './tales/creatures_b/sprite_sheet.png'
        : '/tales/mosaics/tiles/sprite_sheet.png';
    const filter = tileset === 'luxury_marble_2'
      ? 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4))'
      : tileset === 'creatures_b'
        ? 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.6))'
        : 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.7))';
    const borderRadius = tileset === 'luxury_marble_2' || tileset === 'creatures_b' ? '6px' : '4px';

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: '400% 300%',
          backgroundPosition: `${bgX}% ${bgY}%`,
          backgroundRepeat: 'no-repeat',
          filter: filter,
          borderRadius: borderRadius
        }}
      />
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

