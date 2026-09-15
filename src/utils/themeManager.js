// Utility for managing random theme preferences and selecting random themes across RetroVision games

export const GAME_THEMES = {
  mahjong: ['classic', 'nature', 'cyber', 'modern', 'mosaic', 'luxury_marble_2'],
  bubblecool: ['candy', 'neon', 'gemstone'],
  water: ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8', 'bg9'],
  ball: ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8', 'bg9'],
  sudoku: ['classic', 'paper', 'neon', 'cyber', 'forest', 'sunset'],
  mines: ['classic', 'retro_green', 'neon_blue', 'cyberpunk', 'glassmorphism'],
  arrows: ['classic', 'neon', 'cyberpunk', 'nature'],
  '2048': ['neon', 'classic', 'cyberpunk', 'pastel'],
  jigsaw: ['forest', 'cat', 'sunset'],
  freecell: ['classic', 'dark', 'emerald', 'royal'],
  hangman: ['classic', 'neon', 'vintage', 'chalkboard'],
  blockfantasy: ['fantasy', 'cyber', 'sunset'],
  impossible13: ['neon', 'pastel', 'gold'],
  brickbreaker: ['neon', 'synthwave', 'space'],
  snakewave: ['neon', 'matrix', 'sunset'],
  flappyneon: ['neon', 'cyber', 'vaporwave'],
  unblock: ['wood', 'marble', 'neon']
};

export const normalizeGameId = (nameOrId) => {
  if (!nameOrId) return 'generic';
  const n = nameOrId.toLowerCase();
  if (n.includes('mahjong')) return 'mahjong';
  if (n.includes('bubble')) return 'bubblecool';
  if (n.includes('water') || n.includes('eau')) return 'water';
  if (n.includes('ball') || n.includes('bille')) return 'ball';
  if (n.includes('sudoku')) return 'sudoku';
  if (n.includes('freecell')) return 'freecell';
  if (n.includes('mine') || n.includes('demineur')) return 'mines';
  if (n.includes('arrow') || n.includes('fleche')) return 'arrows';
  if (n.includes('2048')) return '2048';
  if (n.includes('jigsaw') || n.includes('puzzle')) return 'jigsaw';
  if (n.includes('hangman') || n.includes('pendu')) return 'hangman';
  if (n.includes('block')) return 'blockfantasy';
  if (n.includes('brick') || n.includes('casse')) return 'brickbreaker';
  if (n.includes('snake')) return 'snakewave';
  if (n.includes('flappy')) return 'flappyneon';
  if (n.includes('unblock')) return 'unblock';
  if (n.includes('impossible')) return 'impossible13';
  return n.replace(/[^a-z0-9]/g, '');
};

export const isRandomThemeEnabled = (gameIdOrName) => {
  const gameId = normalizeGameId(gameIdOrName);
  try {
    return localStorage.getItem(`retrovision_random_theme_${gameId}`) === 'true';
  } catch (e) {
    return false;
  }
};

export const setRandomThemeEnabled = (gameIdOrName, enabled) => {
  const gameId = normalizeGameId(gameIdOrName);
  try {
    localStorage.setItem(`retrovision_random_theme_${gameId}`, enabled ? 'true' : 'false');
  } catch (e) {
    // ignore
  }
};

export const pickRandomTheme = (gameIdOrName, currentTheme = null) => {
  const gameId = normalizeGameId(gameIdOrName);
  const themes = GAME_THEMES[gameId];
  if (!themes || themes.length <= 1) return currentTheme || (themes ? themes[0] : null);

  const available = currentTheme ? themes.filter(t => t !== currentTheme) : themes;
  const pool = available.length > 0 ? available : themes;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return chosen;
};
