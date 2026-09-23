import { useState, useEffect, useRef, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import IntermissionIntroModal from './components/IntermissionIntroModal';
import IntermissionSettingsModal from './components/IntermissionSettingsModal';
import IntermissionVictory from './components/IntermissionVictory';
import {
  GAMES_CONFIG,
  INTERMISSION_GAME_KEYS,
  findGameConfig,
  getGameName,
  getGameIcon,
} from './utils/gamesConfig';
import { recordPlay, recordTime, recordScore } from './utils/stats';
import { storage } from './utils/storage';
import { randomChoice } from './utils/commonUtils';
import { ConfirmProvider } from './components/ConfirmContext';
import './App.css';

function App() {
  const [view, setView] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('game');
      return p || 'dashboard';
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
  const [showIntermissionIntro, setShowIntermissionIntro] = useState(false);
  const [intermissionResult, setIntermissionResult] = useState('success'); // 'success' | 'passed'
  const [sessionIntermissionDifficulty, setSessionIntermissionDifficulty] = useState('facile');
  const [replaySameIntermission, setReplaySameIntermission] = useState(false);

  // Configuration persistée des entractes (couvrant tous les 12 jeux d'entracte)
  const [intermissionConfig, setIntermissionConfig] = useState(() => {
    const defaultConfig = {
      showIntroModal: false,
    };
    INTERMISSION_GAME_KEYS.forEach((key) => {
      defaultConfig[key] = { enabled: true, frequency: 'medium', difficulty: 'facile' };
    });

    const parsed = storage.getJSON('retrovision_intermission_config', null);
    if (parsed) {
      const merged = { ...defaultConfig };
      if (typeof parsed.showIntroModal === 'boolean') {
        merged.showIntroModal = parsed.showIntroModal;
      }
      INTERMISSION_GAME_KEYS.forEach((key) => {
        if (parsed[key]) {
          merged[key] = {
            enabled: parsed[key].enabled !== false,
            frequency: parsed[key].frequency || 'medium',
            difficulty: parsed[key].difficulty || 'facile',
          };
        }
      });
      return merged;
    }
    return defaultConfig;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    setShowIntermissionIntro(false);
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
      }

      setReplaySameIntermission(false);

      const defaultDiff = intermissionConfig[chosenGame]?.difficulty || 'facile';
      setSessionIntermissionDifficulty(defaultDiff);
      setShowIntermissionIntro(!!intermissionConfig.showIntroModal);
      setView(chosenGame);

      const nextPlanned = pickRandomIntermissionGame(mainGame, chosenGame);
      setUpcomingIntermissionGame(nextPlanned);
    },
    [isIntermissionMode, returnView, view, pickRandomIntermissionGame, intermissionConfig]
  );


  const handleIntermissionComplete = useCallback((isSuccess = true) => {
    setIntermissionResult(isSuccess === false ? 'passed' : 'success');
    setShowIntermissionIntro(false);
    setView('intermission-victory');
    setSkipNextIntro(true);
  }, []);

  // Transition automatique après écran de victoire d'entracte vers le jeu hôte
  useEffect(() => {
    if (view === 'intermission-victory') {
      const timer = setTimeout(() => {
        setView(returnView || 'dashboard');
        setIsIntermissionMode(false);
        setReturnView(null);
        setShowIntermissionIntro(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [view, returnView]);

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

      {isIntermissionMode && showIntermissionIntro && (
        <IntermissionIntroModal
          gameKey={view}
          gameName={getGameName(view)}
          gameIcon={getGameIcon(view)}
          returnGameName={getGameName(returnView)}
          currentDifficulty={sessionIntermissionDifficulty}
          onDifficultyChange={(newDiff) => setSessionIntermissionDifficulty(newDiff)}
          onStart={() => setShowIntermissionIntro(false)}
          onSkip={() => handleIntermissionComplete(false)}
          onChangeRandomGame={() => handleIntermissionRequest(returnView)}
        />
      )}

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
    </ConfirmProvider>
  );
}

export default App;
