import React from 'react';

/**
 * Hand-crafted SVG Zen symbols for Quête des Symboles and Paires Mémoire.
 * High-contrast, clean silhouettes, matte styling without blinding neon glow.
 */
export default function SymbolIcon({
  name,
  size = 28,
  color,
  style = {},
  className = ''
}) {
  const symbolKey = (name || '').toLowerCase();

  const renderPath = () => {
    switch (symbolKey) {
      case 'lotus':
        return (
          // Blooming lotus with central bud and side petals
          <g fill="currentColor">
            {/* Center petal */}
            <path d="M16 4C14.5 9 14.5 17 16 23C17.5 17 17.5 9 16 4Z" opacity="0.95" />
            {/* Inner left & right petals */}
            <path d="M16 11C13 13 9.5 17 10 22C12.5 22.5 15.5 18 16 11Z" opacity="0.85" />
            <path d="M16 11C19 13 22.5 17 22 22C19.5 22.5 16.5 18 16 11Z" opacity="0.85" />
            {/* Outer left & right petals */}
            <path d="M15 15C10 16 5 21 6 24C9.5 25 14 20.5 15 15Z" opacity="0.75" />
            <path d="M17 15C22 16 27 21 26 24C22.5 25 18 20.5 17 15Z" opacity="0.75" />
            {/* Base water calyx */}
            <path d="M10 25C13 26.5 19 26.5 22 25C18 27 14 27 10 25Z" opacity="0.9" />
          </g>
        );

      case 'leaf':
        return (
          // Zen leaf with delicate stem and curved blade
          <g fill="currentColor">
            <path d="M26 6C16 6 8 13 8 23C18 23 26 16 26 6Z" opacity="0.9" />
            <path
              d="M8 23C13 19 18 14 24 8"
              stroke="#0f172a"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
            {/* Side veins */}
            <path
              d="M13 19C15 18 17 19 17 19M16 16C18 14 20 15 20 15M19 12C21 11 22 11.5 22 11.5"
              stroke="#0f172a"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.4"
            />
            {/* Stem */}
            <path
              d="M8 23C6 25 4 27 3 29"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );

      case 'moon':
        return (
          // Harmonious crescent moon with smooth inner arc
          <path
            d="M21 16.5C20.5 22.5 14.5 26.5 8.5 24.5C6.5 23.8 4.8 22.4 3.7 20.6C8.8 21.8 14.2 19.4 16.8 14.5C18.6 11 18.2 6.8 16 3.5C20.5 5.5 22.8 11 21 16.5Z"
            fill="currentColor"
          />
        );

      case 'crystal':
        return (
          // Faceted gem/crystal
          <g fill="currentColor">
            {/* Top crown */}
            <polygon points="10,6 22,6 27,12 5,12" opacity="0.85" />
            {/* Center pavilion triangle */}
            <polygon points="10,6 16,12 22,6" opacity="0.95" />
            {/* Bottom facets */}
            <polygon points="5,12 16,26 12,12" opacity="0.75" />
            <polygon points="27,12 16,26 20,12" opacity="0.75" />
            <polygon points="12,12 16,26 20,12" opacity="0.9" />
          </g>
        );

      case 'sakura':
        return (
          // 5-petal cherry blossom with notched tips
          <g fill="currentColor">
            {/* 5 Petals */}
            <path d="M16 12 C14 8, 12 4, 15 2 C16 3, 16 3, 17 2 C20 4, 18 8, 16 12Z" />
            <path d="M16 12 C19.5 9.5, 23.5 8, 25.5 10.5 C24.5 11.5, 24.5 11.5, 25 12.5 C24 15.5, 20 15, 16 12Z" />
            <path d="M16 12 C18 15.5, 20.5 19.5, 18.5 22 C17.5 21.5, 17.5 21.5, 16.5 22.5 C14 21, 14 17, 16 12Z" />
            <path d="M16 12 C13 15, 9.5 18, 7.5 16 C8 15, 8 15, 7 14 C7.5 11, 11.5 11, 16 12Z" />
            <path d="M16 12 C12.5 10, 8.5 7.5, 9 4.5 C10 5, 10 5, 11 4.5 C13 7, 14 9.5, 16 12Z" />
            {/* Pistil center */}
            <circle cx="16" cy="12" r="2.2" fill="#fff" opacity="0.8" />
            <circle cx="16" cy="12" r="1.2" fill="#f43f5e" />
          </g>
        );

      case 'star':
        return (
          // 4-point celestial compass star with elegant taper
          <path
            d="M16 2 C16.5 9 17.5 11.5 24.5 12 C17.5 12.5 16.5 15 16 22 C15.5 15 14.5 12.5 7.5 12 C14.5 11.5 15.5 9 16 2Z"
            fill="currentColor"
          />
        );

      case 'bamboo':
        return (
          // Japanese bamboo stalk with nodes and leaves
          <g fill="currentColor">
            {/* Stalk segments */}
            <rect x="14" y="3" width="4" height="7" rx="1" />
            <rect x="14" y="11" width="4" height="8" rx="1" />
            <rect x="14" y="20" width="4" height="9" rx="1" />
            {/* Node rings */}
            <rect x="13" y="9.5" width="6" height="2" rx="1" opacity="0.9" fill="#14532d" />
            <rect x="13" y="18.5" width="6" height="2" rx="1" opacity="0.9" fill="#14532d" />
            {/* Lateral leaves */}
            <path d="M14 10 C10 8 7 10 5 14 C8 14 11 12 14 10Z" opacity="0.85" />
            <path d="M18 10 C22 7 25 8 28 12 C25 12 22 11 18 10Z" opacity="0.85" />
            <path d="M18 19 C21 17 24 18 26 21 C23 21 21 20 18 19Z" opacity="0.8" />
          </g>
        );

      case 'stone':
        return (
          // Smooth zen stone balance (3 stones stacked)
          <g fill="currentColor">
            {/* Bottom stone */}
            <ellipse cx="16" cy="22" rx="10" ry="4.5" opacity="0.9" />
            {/* Middle stone */}
            <ellipse cx="16" cy="15" rx="7.5" ry="3.5" opacity="0.95" />
            {/* Top stone */}
            <ellipse cx="16" cy="8.5" rx="5" ry="2.8" />
            {/* Soft highlight */}
            <ellipse cx="15" cy="7.8" rx="3.5" ry="1.2" fill="#fff" opacity="0.35" />
            <ellipse cx="14.5" cy="14" rx="5" ry="1.4" fill="#fff" opacity="0.25" />
          </g>
        );

      default:
        return (
          <circle cx="16" cy="16" r="10" fill="currentColor" opacity="0.8" />
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        color: color || 'currentColor',
        ...style
      }}
    >
      {renderPath()}
    </svg>
  );
}
