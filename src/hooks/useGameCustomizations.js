import { useState, useEffect, useCallback, useMemo } from 'react';
import { getGameConfig, updateGameConfig } from '../utils/config';
import { 
  migrateTheme, 
  isRandomThemeEnabled, 
  getAllowedThemes, 
  GAME_THEME_DETAILS 
} from '../utils/themeManager';
import { randomChoice } from '../utils/commonUtils';

/**
 * Universal hook for game customizations (theme, difficulty, board options, etc.).
 * Handles single-source-of-truth themes, automatic migrations, and random theme shuffling.
 * 
 * @param {string} gameId - Canonical game identifier (e.g. '2048', 'memory', 'hangman')
 * @param {object} defaultCustom - Default customization values (e.g. { theme: 'japanese_paper', difficulty: 'moyen' })
 * @param {string|null} enforcedTheme - Theme forced by parent or intermission mode (optional)
 */
export function useGameCustomizations(gameId, defaultCustom = {}, enforcedTheme = null) {
  // Load saved config, applying any theme migration
  const loadSaved = useCallback(() => {
    let saved = getGameConfig(gameId, 'customizations', null);
    if (!saved) {
      const legacyTheme = getGameConfig(gameId, 'theme', null);
      saved = legacyTheme ? { ...defaultCustom, theme: legacyTheme } : { ...defaultCustom };
    } else {
      saved = { ...defaultCustom, ...saved };
    }

    if (saved.theme) {
      saved.theme = migrateTheme(gameId, saved.theme);
    }
    return saved;
  }, [gameId, defaultCustom]);

  const [custom, setCustomState] = useState(loadSaved);
  const [randomThemePick, setRandomThemePick] = useState(null);

  // Check random theme setting and pick one if active
  const evaluateRandomTheme = useCallback(() => {
    if (isRandomThemeEnabled(gameId)) {
      const allowed = getAllowedThemes(gameId);
      if (allowed && allowed.length > 0) {
        setRandomThemePick(randomChoice(allowed));
        return;
      }
    }
    setRandomThemePick(null);
  }, [gameId]);

  useEffect(() => {
    evaluateRandomTheme();
  }, [evaluateRandomTheme]);

  // Listen to random theme toggle events
  useEffect(() => {
    const handleToggle = (e) => {
      if (e.detail?.gameId === gameId) {
        evaluateRandomTheme();
      }
    };
    window.addEventListener('retrovision_random_theme_toggled', handleToggle);
    return () => window.removeEventListener('retrovision_random_theme_toggled', handleToggle);
  }, [gameId, evaluateRandomTheme]);

  // Computed active theme taking into account: 1. enforcedTheme, 2. random theme, 3. user custom theme, 4. default
  const activeTheme = useMemo(() => {
    if (enforcedTheme) {
      return migrateTheme(gameId, enforcedTheme);
    }
    if (randomThemePick) {
      return randomThemePick;
    }
    return custom.theme || defaultCustom.theme || 'default';
  }, [enforcedTheme, randomThemePick, custom.theme, defaultCustom.theme, gameId]);

  // Update a single key or multiple keys and persist
  const updateCustom = useCallback((keyOrPatch, value) => {
    setCustomState((prev) => {
      const next = typeof keyOrPatch === 'string' 
        ? { ...prev, [keyOrPatch]: value }
        : { ...prev, ...keyOrPatch };
      
      if (next.theme) {
        next.theme = migrateTheme(gameId, next.theme);
      }
      
      updateGameConfig(gameId, 'customizations', next);
      if (next.theme) {
        updateGameConfig(gameId, 'theme', next.theme);
      }
      return next;
    });
  }, [gameId]);

  // Helper to get available theme details from themeManager
  const availableThemes = useMemo(() => {
    return GAME_THEME_DETAILS[gameId] || [];
  }, [gameId]);

  return {
    custom,
    updateCustom,
    activeTheme,
    availableThemes,
    isRandomTheme: Boolean(randomThemePick)
  };
}
