import { useCallback } from 'react';
import { useIntermissionContext } from '../contexts/IntermissionContext';
import { GAMES_CONFIG } from '../utils/gamesConfig';

/**
 * Hook to consume intermission context within any game or component (DRY).
 * Automatically resolves difficulty, category, targets, rounds, and handles the replay-same logic.
 */
export function useIntermission(gameKey) {
  const ctx = useIntermissionContext();

  const isIntermission = Boolean(ctx?.isIntermissionMode);
  const gameDef = gameKey ? GAMES_CONFIG[gameKey] : null;
  const gameIntermissionMeta = gameDef?.intermission || { category: 'oneshot' };
  const gameConf = ctx?.intermissionConfig?.[gameKey] || {};

  const difficulty = ctx?.sessionIntermissionDifficulty || gameConf.difficulty || 'facile';
  const category = gameIntermissionMeta.category || 'oneshot';
  const rounds = Number(gameConf.roundsCount || gameIntermissionMeta.defaultRounds || 5);
  const target = gameConf.target || gameIntermissionMeta.defaultTarget || (gameIntermissionMeta.targetOptions ? gameIntermissionMeta.targetOptions[1] : null);

  const finish = useCallback(({ isSuccess = true, onReplay = null, delay = 1000 } = {}) => {
    if (!ctx) return;
    if (ctx.replaySameIntermission) {
      if (ctx.setReplaySameIntermission) {
        ctx.setReplaySameIntermission(false);
      }
      if (onReplay) {
        setTimeout(() => onReplay(), delay);
      }
      return;
    }

    if (ctx.handleIntermissionComplete) {
      setTimeout(() => ctx.handleIntermissionComplete(isSuccess), delay);
    }
  }, [ctx]);

  const skip = useCallback(() => {
    if (ctx?.handleIntermissionComplete) {
      ctx.handleIntermissionComplete(false);
    }
  }, [ctx]);

  const requestOther = useCallback((targetKey) => {
    if (ctx?.handleIntermissionRequest) {
      ctx.handleIntermissionRequest(targetKey);
    }
  }, [ctx]);

  return {
    isIntermission,
    difficulty,
    category,
    rounds,
    target,
    intermissionRound: ctx?.intermissionRound || 1,
    intermissionTotalRounds: ctx?.intermissionTotalRounds || 1,
    replaySame: Boolean(ctx?.replaySameIntermission),
    toggleReplaySame: ctx?.setReplaySameIntermission || (() => {}),
    finish,
    skip,
    requestOther,
    upcomingIntermission: ctx?.upcomingIntermissionGame,
    onSelectUpcomingIntermission: ctx?.setUpcomingIntermissionGame,
    onShuffleUpcomingIntermission: ctx?.shuffleUpcomingIntermissionGame,
    intermissionConfig: ctx?.intermissionConfig || {},
    intermissionGames: ctx?.intermissionGames || []
  };
}
