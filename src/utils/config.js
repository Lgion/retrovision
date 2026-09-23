import { storage } from './storage';

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
    arrows: { mode: 'dense' },
    blockfantasy: { theme: 'fantasy', mode: 'classic', gridSize: 10 },
    impossible13: { customizations: { theme: 'neon' } }
  }
};

const STORAGE_KEY = 'retrovision_game_configs';

export function getConfigs() {
  const parsed = storage.getJSON(STORAGE_KEY, null);
  if (parsed) {
    return {
      global: parsed.global || { ...DEFAULT_CONFIGS.global },
      games: parsed.games || { ...DEFAULT_CONFIGS.games }
    };
  }
  // Try to migrate legacy keys if present
  const configs = JSON.parse(JSON.stringify(DEFAULT_CONFIGS));
  
  const legacyMahjongMode = storage.getItem('retrovision_mahjong_mode');
  if (legacyMahjongMode) configs.games.mahjong.mode = legacyMahjongMode;

  const legacyMahjongSize = storage.getItem('retrovision_mahjong_size');
  if (legacyMahjongSize) configs.games.mahjong.boardSize = legacyMahjongSize;

  const legacyArrowMode = storage.getItem('retrovision_arrow_mode');
  if (legacyArrowMode) configs.games.arrows.mode = legacyArrowMode;

  const legacyUnblockProgress = storage.getItem('retrovision_unblock_progress');
  if (legacyUnblockProgress) configs.games.unblock.levelProgress = parseInt(legacyUnblockProgress, 10);

  saveConfigs(configs);
  return configs;
}

export function saveConfigs(configs) {
  storage.setJSON(STORAGE_KEY, configs);
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
  storage.removeItem(STORAGE_KEY);
  storage.removeItem('retrovision_mahjong_mode');
  storage.removeItem('retrovision_mahjong_size');
  storage.removeItem('retrovision_arrow_mode');
  storage.removeItem('retrovision_unblock_progress');
}

