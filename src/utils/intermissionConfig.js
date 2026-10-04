import { storage } from './storage';
import { GAMES_CONFIG, INTERMISSION_GAME_KEYS } from './gamesConfig';

export const INTERMISSION_STORAGE_KEY = 'retrovision_intermission_config';
export const INTERMISSION_EVENT_KEY = 'retrovision_intermission_config_updated';

/**
 * Returns default config object for intermission.
 */
export function getDefaultIntermissionConfig() {
  const cfg = {
    sessionGames: 1, // Number of games per intermission session (legacy alias: roundsCount)
    roundsCount: 1,
    enabled: true,
  };

  INTERMISSION_GAME_KEYS.forEach((key) => {
    const gameDef = GAMES_CONFIG[key];
    const category = gameDef?.intermission?.category || 'oneshot';
    cfg[key] = {
      enabled: true,
      difficulty: 'facile',
      frequency: 'medium',
      roundsCount: gameDef?.intermission?.defaultRounds || 5,
      target: gameDef?.intermission?.defaultTarget || (gameDef?.intermission?.targetOptions ? gameDef.intermission.targetOptions[1] : null),
      category
    };
  });

  return cfg;
}

/**
 * Retrieve saved intermission config merged with defaults.
 */
export function getIntermissionConfig() {
  const defaults = getDefaultIntermissionConfig();
  const saved = storage.getJSON(INTERMISSION_STORAGE_KEY, null);
  if (!saved || typeof saved !== 'object') {
    return defaults;
  }

  const merged = { ...defaults, ...saved };
  // Keep sessionGames and roundsCount synchronized
  if (saved.sessionGames !== undefined) {
    merged.sessionGames = Number(saved.sessionGames) || 1;
    merged.roundsCount = merged.sessionGames;
  } else if (saved.roundsCount !== undefined) {
    merged.sessionGames = Number(saved.roundsCount) || 1;
    merged.roundsCount = merged.sessionGames;
  }

  INTERMISSION_GAME_KEYS.forEach((key) => {
    const gameDef = GAMES_CONFIG[key];
    const category = gameDef?.intermission?.category || 'oneshot';
    merged[key] = {
      ...defaults[key],
      ...(saved[key] || {}),
      category
    };
  });

  return merged;
}

/**
 * Persist intermission config and notify listeners.
 */
export function saveIntermissionConfig(config) {
  const sessionGames = Number(config.sessionGames || config.roundsCount) || 1;
  const toSave = {
    ...config,
    sessionGames,
    roundsCount: sessionGames
  };
  storage.setJSON(INTERMISSION_STORAGE_KEY, toSave);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(INTERMISSION_EVENT_KEY, { detail: toSave }));
  }
}

/**
 * Update a single game config in intermission.
 */
export function updateIntermissionGame(gameKey, updates) {
  const current = getIntermissionConfig();
  current[gameKey] = {
    ...(current[gameKey] || {}),
    ...updates
  };
  saveIntermissionConfig(current);
  return current;
}

/**
 * Check if intermission mode is globally enabled.
 */
export function isIntermissionEnabled() {
  return storage.getItem('retrovision_intermission_enabled') !== 'false';
}
