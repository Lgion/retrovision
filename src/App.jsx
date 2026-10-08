import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Dashboard from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import IntermissionSettingsModal from './components/IntermissionSettingsModal';
import IntermissionVictory from './components/IntermissionVictory';
import {
  GAMES_CONFIG,
  INTERMISSION_GAME_KEYS,
  findGameConfig,
  getGameName,
  getGameIcon,
  resolveGameId,
} from './utils/gamesConfig';
import { recordPlay, recordTime, recordScore } from './utils/stats';
import { storage } from './utils/storage';
import { sound } from './utils/sound';
import { randomChoice } from './utils/commonUtils';
import { ConfirmProvider } from './components/ConfirmContext';
import { IntermissionContext } from './contexts/IntermissionContext';
import {
  getIntermissionConfig,
  saveIntermissionConfig,
  INTERMISSION_EVENT_KEY
} from './utils/intermissionConfig';
import './App.css';

function App() {
  const [view, setView] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('game');
      return resolveGameId(p) || p || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [statsUpdated, setStatsUpdated] = useState(0);
  const gameStartRef = useRef(0);

  // État du mode entracte
  const [isIntermissionMode, setIsIntermissionMode] = useState(false);
  const [returnView, setReturnView] = useState(null);
  const [skipNextIntro, setSkipNextIntro] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('skipIntro') === 'true';
    } catch {
      return false;
    }
  });
  const [intermissionResult, setIntermissionResult] = useState('success'); // 'success' | 'passed'
  const [sessionIntermissionDifficulty, setSessionIntermissionDifficulty] = useState('facile');
  const [replaySameIntermission, setReplaySameIntermission] = useState(false);

  // Configuration persistée des entractes
  const [intermissionConfig, setIntermissionConfig] = useState(() => getIntermissionConfig());

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [intermissionRound, setIntermissionRound] = useState(1);
  const [intermissionTotalRounds, setIntermissionTotalRounds] = useState(1);
  const [lastIntermissionGame, setLastIntermissionGame] = useState(() => {
    return storage.getItem('retrovision_last_intermission_game', null);
  });

  // Sélection aléatoire pondérée d'un jeu d'entracte (exclusivement parmi les jeux activés)
  const pickRandomIntermissionGame = useCallback(
    (fromMainGame, excludedGame = null) => {
      const allEnabledGames = INTERMISSION_GAME_KEYS.filter(
        (key) => intermissionConfig[key]?.enabled !== false && key !== fromMainGame
      );

      const basePool =
        allEnabledGames.length > 0
          ? allEnabledGames
          : INTERMISSION_GAME_KEYS.filter((g) => g !== fromMainGame);

      let candidates = basePool.filter((g) => g !== excludedGame);
      if (candidates.length === 0) {
        candidates = basePool;
      }

      if (candidates.length > 1 && lastIntermissionGame) {
        const withoutLast = candidates.filter((g) => g !== lastIntermissionGame);
        if (withoutLast.length > 0) {
          candidates = withoutLast;
        }
      }

      const weightMap = { low: 1, medium: 3, high: 5 };
      const weightedList = [];
      candidates.forEach((gameKey) => {
        const configEntry = intermissionConfig[gameKey] || { frequency: 'medium' };
        const weight = weightMap[configEntry.frequency] || 3;
        for (let i = 0; i < weight; i++) {
          weightedList.push(gameKey);
        }
      });

      return weightedList.length > 0
        ? randomChoice(weightedList)
        : candidates[0] || 'water';
    },
    [intermissionConfig, lastIntermissionGame]
  );

  const [upcomingIntermissionGame, setUpcomingIntermissionGame] = useState(() => {
    const enabled = INTERMISSION_GAME_KEYS.filter(
      (k) => intermissionConfig[k]?.enabled !== false
    );
    return enabled.length > 0 ? enabled[0] : 'water';
  });

  // Calcul dérivé du jeu d'entracte prévu, garantissant qu'il est toujours activé
  const activeUpcomingIntermissionGame =
    intermissionConfig[upcomingIntermissionGame]?.enabled !== false
      ? upcomingIntermissionGame
      : pickRandomIntermissionGame('mahjong');

  const shuffleUpcomingIntermissionGame = useCallback(() => {
    const nextGame = pickRandomIntermissionGame('mahjong', upcomingIntermissionGame);
    setUpcomingIntermissionGame(nextGame);
    return nextGame;
  }, [pickRandomIntermissionGame, upcomingIntermissionGame]);

  // Retour sécurisé au dashboard en réinitialisant les états d'intro/entracte
  const handleBackToDashboard = useCallback(() => {
    setSkipNextIntro(false);
    setIsIntermissionMode(false);
    setReturnView(null);
    setView('dashboard');
  }, []);

  // Gestion du déclenchement d'un entracte
  const handleIntermissionRequest = useCallback(
    (fromGameKey, targetGameKey = null) => {
      const mainGame = isIntermissionMode ? returnView || 'mahjong' : fromGameKey;
      const currentGame = isIntermissionMode ? view : null;
      const chosenGame = targetGameKey || pickRandomIntermissionGame(mainGame, currentGame);

      setLastIntermissionGame(chosenGame);
      storage.setItem('retrovision_last_intermission_game', chosenGame);

      if (!isIntermissionMode) {
        setReturnView(fromGameKey);
        setIsIntermissionMode(true);
        const total = Number(intermissionConfig.roundsCount) || 1;
        setIntermissionRound(1);
        setIntermissionTotalRounds(total);
      }

      setReplaySameIntermission(false);

      const defaultDiff = intermissionConfig[chosenGame]?.difficulty || 'facile';
      setSessionIntermissionDifficulty(defaultDiff);
      setView(chosenGame);

      const nextPlanned = pickRandomIntermissionGame(mainGame, chosenGame);
      setUpcomingIntermissionGame(nextPlanned);
    },
    [isIntermissionMode, returnView, view, pickRandomIntermissionGame, intermissionConfig]
  );


  const handleIntermissionComplete = useCallback(
    (isSuccess = true) => {
      if (isSuccess !== false && intermissionRound < intermissionTotalRounds) {
        // Avancer au défi suivant de la série (Multi-défis 1 à 3)
        const nextRound = intermissionRound + 1;
        setIntermissionRound(nextRound);
        const mainGame = returnView || 'mahjong';
        const nextGame = pickRandomIntermissionGame(mainGame, view);
        setLastIntermissionGame(nextGame);
        storage.setItem('retrovision_last_intermission_game', nextGame);
        const defaultDiff = intermissionConfig[nextGame]?.difficulty || 'facile';
        setSessionIntermissionDifficulty(defaultDiff);
        setView(nextGame);
        sound.playPowerup?.();
        return;
      }

      setIntermissionResult(isSuccess === false ? 'passed' : 'success');
      setView('intermission-victory');
      setSkipNextIntro(true);
    },
    [intermissionRound, intermissionTotalRounds, pickRandomIntermissionGame, returnView, view, intermissionConfig]
  );



  useEffect(() => {
    const handleConfigUpdate = (e) => {
      setIntermissionConfig(e.detail);
    };
    window.addEventListener(INTERMISSION_EVENT_KEY, handleConfigUpdate);
    window.addEventListener('retrovision_config_update', handleConfigUpdate);
    return () => {
      window.removeEventListener(INTERMISSION_EVENT_KEY, handleConfigUpdate);
      window.removeEventListener('retrovision_config_update', handleConfigUpdate);
    };
  }, []);

  const intermissionContextValue = useMemo(() => ({
    isIntermissionMode,
    sessionIntermissionDifficulty,
    intermissionRound,
    intermissionTotalRounds,
    replaySameIntermission,
    setReplaySameIntermission,
    upcomingIntermissionGame: activeUpcomingIntermissionGame,
    setUpcomingIntermissionGame,
    shuffleUpcomingIntermissionGame,
    intermissionConfig,
    handleIntermissionRequest,
    handleIntermissionComplete,
    intermissionGames: Object.values(GAMES_CONFIG)
      .filter((g) => g.supportsIntermission && g.id !== view)
      .map((g) => ({
        key: g.id,
        name: g.name,
        icon: g.settingsIcon || g.icon,
        subtitle: g.subtitle || "Mini-jeu d'entracte",
        intermission: g.intermission
      }))
  }), [
    isIntermissionMode,
    sessionIntermissionDifficulty,
    intermissionRound,
    intermissionTotalRounds,
    replaySameIntermission,
    activeUpcomingIntermissionGame,
    shuffleUpcomingIntermissionGame,
    intermissionConfig,
    handleIntermissionRequest,
    handleIntermissionComplete,
    view
  ]);

  // Suivi du temps passé sur chaque jeu
  useEffect(() => {
    const currentView = view;
    if (currentView !== 'dashboard' && currentView !== 'intermission-victory') {
      gameStartRef.current = Date.now();
      recordPlay(currentView);
    }

    return () => {
      if (
        currentView !== 'dashboard' &&
        currentView !== 'intermission-victory' &&
        gameStartRef.current > 0
      ) {
        const duration = Date.now() - gameStartRef.current;
        recordTime(currentView, duration);
        gameStartRef.current = 0;
      }
    };
  }, [view]);

  // Sauvegarde centralisée et factorisée des scores
  const handleScoreSave = useCallback((gameNameOrData, rawScore) => {
    let gameKey = gameNameOrData;
    let score = rawScore;
    if (gameNameOrData && typeof gameNameOrData === 'object') {
      gameKey = gameNameOrData.game || gameNameOrData.gameId || gameNameOrData.id;
      score = gameNameOrData.score;
    }
    recordScore(gameKey, score);

    const conf = findGameConfig(gameKey);
    if (conf?.storageKey) {
      storage.setItem(conf.storageKey, conf.binaryScore ? '1' : (score !== undefined ? score.toString() : '1'));
    }

    setStatsUpdated((prev) => prev + 1);
  }, []);

  /**
   * Rendu standardisé et factorisé d'un jeu, assurant l'injection homogène des props
   * communes pour le mode normal comme pour le mode entracte.
   */
  const renderGame = (gameKey) => {
    const gameDef = GAMES_CONFIG[gameKey];
    if (!gameDef) return null;

    const GameComponent = gameDef.component;

    // Parties communes partagées par tous les jeux (mode normal ET mode entracte)
    const commonProps = {
      onBack: handleBackToDashboard,
      onScoreSave: handleScoreSave,
      onIntermissionRequest: (targetKey) => handleIntermissionRequest(gameKey, targetKey),
      onLaunchIntermission: () => handleIntermissionRequest(gameKey),
      intermissionConfig, // passé à tous les jeux
      ...(gameDef.supportsIntro ? { skipIntro: skipNextIntro } : {}),
    };

    // Parties spécifiques au mode entracte
    const intermissionProps = isIntermissionMode
      ? {
          isIntermission: true,
          intermissionDifficulty:
            sessionIntermissionDifficulty || intermissionConfig[gameKey]?.difficulty || 'facile',
          onIntermissionComplete: handleIntermissionComplete,
          onIntermissionRequest: () => handleIntermissionRequest(returnView || 'mahjong'),
          replaySameIntermission,
          onToggleReplaySameIntermission: setReplaySameIntermission,
          intermissionRound,
          intermissionTotalRounds,
        }
      : {
          isIntermission: false,
        };

    // Spécificités pour l'hôte d'entracte (disponible pour tout jeu joué en mode normal)
    const hostProps = !isIntermissionMode
      ? {
          onIntermissionRequest: (targetKey) => handleIntermissionRequest(gameKey, targetKey),
          upcomingIntermission: activeUpcomingIntermissionGame,
          onSelectUpcomingIntermission: setUpcomingIntermissionGame,
          onShuffleUpcomingIntermission: shuffleUpcomingIntermissionGame,
          intermissionConfig,
          intermissionGames: Object.values(GAMES_CONFIG)
            .filter((g) => g.supportsIntermission && g.id !== gameKey)
            .map((g) => ({
              key: g.id,
              name: g.name,
              icon: g.settingsIcon || g.icon,
              subtitle: g.subtitle || "Mini-jeu d'entracte",
            })),
        }
      : {};

    const wrapperClass = gameDef.fullscreen ? 'game-wrapper-fullscreen' : 'game-wrapper';

    return (
      <div className={wrapperClass}>
        <GameComponent
          {...commonProps}
          {...intermissionProps}
          {...hostProps}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (view === 'intermission-victory') {
      return (
        <IntermissionVictory
          isPassed={intermissionResult === 'passed'}
          returnGameName={getGameName(returnView)}
          totalRounds={intermissionTotalRounds}
          onReturnToMain={() => {
            setView(returnView || 'dashboard');
            setIsIntermissionMode(false);
            setReturnView(null);
            setIntermissionRound(1);
            setIntermissionTotalRounds(1);
          }}
          onReplayCurrent={() => {
            setView(lastIntermissionGame || 'morpion');
            setIsIntermissionMode(true);
            setIntermissionRound(1);
          }}
          onNextIntermission={() => {
            setIntermissionRound(1);
            handleIntermissionRequest(returnView || 'mahjong');
          }}
        />
      );
    }

    if (view in GAMES_CONFIG) {
      return renderGame(view);
    }

    return (
      <Dashboard
        onSelectGame={(gameId) => setView(gameId)}
        statsUpdated={statsUpdated}
        onOpenIntermissionSettings={() => setIsSettingsOpen(true)}
      />
    );
  };

  return (
    <ConfirmProvider>
      <IntermissionContext.Provider value={intermissionContextValue}>
        {/* Filtre d'ambiance écran rétro CRT */}
        <div className="crt-overlay"></div>

        <header className="app-header">
          <h1 className="brand-logo">
            Retro<span>Vision</span>
          </h1>
          <div className="brand-subtitle">Espace Rééducation Cognitive & Zen</div>
        </header>

        <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <ErrorBoundary>{renderContent()}</ErrorBoundary>
        </main>

        <footer className="app-footer">
          RETROVISION © 2026 | CONÇU POUR LA RÉÉDUCATION COGNITIVE
        </footer>

        {isSettingsOpen && (
          <IntermissionSettingsModal
            config={intermissionConfig}
            onClose={() => setIsSettingsOpen(false)}
            onChange={(newConfig) => {
              setIntermissionConfig(newConfig);
              storage.setJSON('retrovision_intermission_config', newConfig);
            }}
            onSave={(newConfig) => {
              setIntermissionConfig(newConfig);
              storage.setJSON('retrovision_intermission_config', newConfig);
              setIsSettingsOpen(false);
            }}
          />
        )}
      </IntermissionContext.Provider>
    </ConfirmProvider>
  );
}

export default App;
