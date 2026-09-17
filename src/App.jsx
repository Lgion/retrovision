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

  // Configuration persistée des entractes
  const [intermissionConfig, setIntermissionConfig] = useState(() => {
    const defaultConfig = {
      showIntroModal: false,
      ball: { enabled: true, frequency: 'medium' },
      water: { enabled: true, frequency: 'medium' },
      mines: { enabled: true, frequency: 'medium' },
      arrows: { enabled: true, frequency: 'medium' },
      sudoku: { enabled: true, frequency: 'medium' },
      blockfantasy: { enabled: true, frequency: 'medium' },
    };
    const saved = localStorage.getItem('retrovision_intermission_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultConfig, ...parsed };
      } catch {
        // ignore
      }
    }
    return defaultConfig;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastIntermissionGame, setLastIntermissionGame] = useState(() => {
    return localStorage.getItem('retrovision_last_intermission_game') || null;
  });

  // Sélection aléatoire pondérée d'un jeu d'entracte
  const pickRandomIntermissionGame = useCallback(
    (fromMainGame, excludedGame = null) => {
      const enabledGames = Object.keys(intermissionConfig).filter(
        (key) =>
          intermissionConfig[key]?.enabled &&
          key !== fromMainGame &&
          key !== excludedGame &&
          INTERMISSION_GAME_KEYS.includes(key)
      );

      const gamesToChooseFrom =
        enabledGames.length > 0
          ? enabledGames
          : INTERMISSION_GAME_KEYS.filter((g) => g !== fromMainGame && g !== excludedGame);

      let filteredGames = gamesToChooseFrom;
      if (gamesToChooseFrom.length > 1 && (lastIntermissionGame || excludedGame)) {
        filteredGames = gamesToChooseFrom.filter(
          (g) => g !== lastIntermissionGame && g !== excludedGame
        );
        if (filteredGames.length === 0) filteredGames = gamesToChooseFrom;
      }

      const weightMap = { low: 1, medium: 3, high: 5 };
      const weightedList = [];
      filteredGames.forEach((gameKey) => {
        const configEntry = intermissionConfig[gameKey] || { frequency: 'medium' };
        const weight = weightMap[configEntry.frequency] || 3;
        for (let i = 0; i < weight; i++) {
          weightedList.push(gameKey);
        }
      });

      return weightedList.length > 0
        ? weightedList[Math.floor(Math.random() * weightedList.length)]
        : filteredGames[Math.floor(Math.random() * filteredGames.length)] || 'water';
    },
    [intermissionConfig, lastIntermissionGame]
  );

  const [upcomingIntermissionGame, setUpcomingIntermissionGame] = useState(() => 'water');

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
      localStorage.setItem('retrovision_last_intermission_game', chosenGame);

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

  const handleMahjongNextLevel = useCallback(
    (forcedGameKey = null) => handleIntermissionRequest('mahjong', forcedGameKey),
    [handleIntermissionRequest]
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
  const handleScoreSave = useCallback((gameName, score) => {
    recordScore(gameName, score);

    const conf = findGameConfig(gameName);
    if (conf?.storageKey) {
      localStorage.setItem(conf.storageKey, conf.binaryScore ? '1' : score.toString());
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
          replaySameIntermission,
          onToggleReplaySameIntermission: setReplaySameIntermission,
        }
      : {
          isIntermission: false,
        };

    // Spécificités pour l'hôte d'entracte (Mahjong)
    const hostProps =
      gameKey === 'mahjong'
        ? {
            onIntermissionRequest: handleMahjongNextLevel,
            upcomingIntermission: upcomingIntermissionGame,
            onSelectUpcomingIntermission: setUpcomingIntermissionGame,
            onShuffleUpcomingIntermission: shuffleUpcomingIntermissionGame,
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
    <>
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
          onSave={(newConfig) => {
            setIntermissionConfig(newConfig);
            localStorage.setItem('retrovision_intermission_config', JSON.stringify(newConfig));
            setIsSettingsOpen(false);
          }}
        />
      )}
    </>
  );
}

export default App;
