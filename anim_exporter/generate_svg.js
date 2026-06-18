const fs = require('fs');

const title = "ARROW PUZZLE";
const colors = ['#f59e0b', '#3b82f6']; // Orange, Blue
const glows = ['#ef4444', '#10b981']; // Red, Green

let defsAndStyles = `
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&amp;display=swap');
      
      .text-group {
        font-family: 'Orbitron', sans-serif;
        font-size: 80px;
        font-weight: 900;
        text-transform: uppercase;
      }
      
      @keyframes popIn {
        0% { transform: translateY(80px) scale(0); opacity: 0; }
        60% { transform: translateY(-10px) scale(1.1); opacity: 1; }
        80% { transform: translateY(5px) scale(0.95); opacity: 1; }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
      }
      
      @keyframes flareExpand {
        0% { r: 0; opacity: 1; }
        100% { r: 800; opacity: 0; }
      }

      .flare {
        animation: flareExpand 1s ease-out forwards;
        animation-delay: 0.8s;
      }

      .letter {
        opacity: 0;
        transform-origin: 50% 50%;
        animation: popIn 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards, float 2s ease-in-out infinite alternate;
      }
`;

let lettersHTML = '';
let currentWordIndex = 0;
let xBase = 120; // Starting X coordinate

title.split('').forEach((char, i) => {
  if (char === ' ') {
    currentWordIndex++;
    xBase += 40; // Space width
    return;
  }
  
  const baseColor = colors[currentWordIndex];
  const glowColor = glows[currentWordIndex];
  
  // Add CSS rules for this specific letter's animation delays
  defsAndStyles += `
      .l-${i} {
        animation-delay: ${i * 0.08}s, ${1.5 + i * 0.1}s;
      }
  `;
  
  // Gradients and glow filters for each letter
  defsAndStyles += `
    <linearGradient id="grad-${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="${baseColor}" />
      <stop offset="100%" stop-color="#222222" />
    </linearGradient>
    <filter id="glow-${i}">
      <!-- Use standard SVG drop shadow technique -->
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="${glowColor}" flood-opacity="1"/>
      <feDropShadow dx="0" dy="15" stdDeviation="10" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  `;
  
  lettersHTML += `
    <text x="${xBase}" y="180" class="letter l-${i}" fill="url(#grad-${i})" filter="url(#glow-${i})">
      ${char}
    </text>
  `;
  
  xBase += 60; // Approximate advance per character
});

defsAndStyles += `
    </style>
    
    <radialGradient id="flare-grad">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="20%" stop-color="#a855f7" />
      <stop offset="70%" stop-color="#0A0E1A" stop-opacity="0" />
    </radialGradient>
  </defs>
`;

let svg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300" width="1000" height="300">
  ${defsAndStyles}
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="#0A0E1A" />
  
  <!-- Flare / Explosion -->
  <circle cx="500" cy="150" r="0" fill="url(#flare-grad)" class="flare" style="mix-blend-mode: screen;" />

  <!-- Animated Text -->
  <g class="text-group">
    ${lettersHTML}
  </g>
</svg>
`;

fs.writeFileSync('/home/nihongo/Bureau/CASCADE/retrovision/arrow_puzzle_anim.svg', svg);
console.log('Fichier SVG généré avec succès !');
