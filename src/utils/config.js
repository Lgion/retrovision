const DEFAULT_CONFIGS = {
  global: {
    soundMuted: false
  },
  games: {
    mahjong: { mode: 'slide', boardSize: 'large' },
    water: { difficulty: 'medium' },
    ball: { difficulty: 'medium' },
    '2048': { theme: 'neon' },
    jigsaw: { difficulty: 'easy' },
    unblock: { levelProgress: 0 },
    freecell: { layout: 'standard' },
    mines: { boardSize: 9, numMines: 10, flagModeDefault: false },
    arrows: { mode: 'dense' }
  }
};

export function getConfigs() {
  const stored = localStorage.getItem('retrovision_game_configs');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure structure is correct
      return {
        global: parsed.global || DEFAULT_CONFIGS.global,
        games: parsed.games || DEFAULT_CONFIGS.games
      };
    } catch (e) {
      console.error('Error parsing configs:', e);
    }
  }
  // Try to migrate legacy keys if present
  const configs = JSON.parse(JSON.stringify(DEFAULT_CONFIGS));
  
  const legacyMahjongMode = localStorage.getItem('retrovision_mahjong_mode');
  if (legacyMahjongMode) configs.games.mahjong.mode = legacyMahjongMode;

  const legacyMahjongSize = localStorage.getItem('retrovision_mahjong_size');
  if (legacyMahjongSize) configs.games.mahjong.boardSize = legacyMahjongSize;

  const legacyArrowMode = localStorage.getItem('retrovision_arrow_mode');
  if (legacyArrowMode) configs.games.arrows.mode = legacyArrowMode;

  const legacyUnblockProgress = localStorage.getItem('retrovision_unblock_progress');
  if (legacyUnblockProgress) configs.games.unblock.levelProgress = parseInt(legacyUnblockProgress, 10);

  saveConfigs(configs);
  return configs;
}

export function saveConfigs(configs) {
  localStorage.setItem('retrovision_game_configs', JSON.stringify(configs));
}

export function getGameConfig(gameId, key, defaultValue) {
  const configs = getConfigs();
  if (configs.games && configs.games[gameId] && configs.games[gameId][key] !== undefined) {
    return configs.games[gameId][key];
  }
  return defaultValue;
}

export function updateGameConfig(gameId, key, value) {
  const configs = getConfigs();
  if (!configs.games) configs.games = {};
  if (!configs.games[gameId]) configs.games[gameId] = {};
  configs.games[gameId][key] = value;
  saveConfigs(configs);
}

export function getGlobalConfig(key, defaultValue) {
  const configs = getConfigs();
  if (configs.global && configs.global[key] !== undefined) {
    return configs.global[key];
  }
  return defaultValue;
}

export function updateGlobalConfig(key, value) {
  const configs = getConfigs();
  if (!configs.global) configs.global = {};
  configs.global[key] = value;
  saveConfigs(configs);
}

export function resetAllConfigs() {
  localStorage.removeItem('retrovision_game_configs');
  localStorage.removeItem('retrovision_mahjong_mode');
  localStorage.removeItem('retrovision_mahjong_size');
  localStorage.removeItem('retrovision_arrow_mode');
  localStorage.removeItem('retrovision_unblock_progress');
}
