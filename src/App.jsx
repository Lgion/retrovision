import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import MahjongZen from './games/MahjongZen';
import WaterSort from './games/WaterSort';
import BallSort from './games/BallSort';
import Grid2048 from './games/Grid2048';
import JigsawPuzzle from './games/JigsawPuzzle';
import UnblockMe from './games/UnblockMe';
import FreeCell from './games/FreeCell';
import Minesweeper from './games/Minesweeper';
import ArrowPuzzle from './games/ArrowPuzzle';
import Hangman from './games/Hangman';
import GameScaleWrapper from './components/GameScaleWrapper';
import { recordPlay, recordTime, recordScore } from './utils/stats';
import './App.css';

function App() {
  const [view, setView] = useState('dashboard');
  const [statsUpdated, setStatsUpdated] = useState(0);
  const gameStartRef = useRef(0);
  
  const [isIntermissionMode, setIsIntermissionMode] = useState(false);
  const [returnView, setReturnView] = useState(null);

  const intermissionGames = ['ball', 'water', 'mines', 'arrows'];
  const handleMahjongNextLevel = () => {
    const randomGame = intermissionGames[Math.floor(Math.random() * intermissionGames.length)];
    setReturnView('mahjong');
    setIsIntermissionMode(true);
    setView(randomGame);
  };

  const handleIntermissionComplete = () => {
    setView(returnView || 'dashboard');
    setIsIntermissionMode(false);
    setReturnView(null);
  };


  useEffect(() => {
    const currentView = view;
    if (currentView !== 'dashboard') {
      gameStartRef.current = Date.now();
      recordPlay(currentView);
      setStatsUpdated((prev) => prev + 1);
    }

    return () => {
      if (currentView !== 'dashboard' && gameStartRef.current > 0) {
        const duration = Date.now() - gameStartRef.current;
        recordTime(currentView, duration);
        gameStartRef.current = 0;
        setStatsUpdated((prev) => prev + 1);
      }
    };
  }, [view]);

  const handleScoreSave = (gameName, score) => {
    console.log(`Saved high score for ${gameName}: ${score}`);

    // Save in detailed stats
    recordScore(gameName, score);

    // Save to appropriate localStorage key to trigger Dashboard update
    if (gameName === 'Mahjong Zen') {
      localStorage.setItem('retrovision_mahjong_highscore', '1');
    } else if (gameName === 'Tri Eau') {
      localStorage.setItem('retrovision_water_highscore', '1');
    } else if (gameName === 'Tri Billes') {
      localStorage.setItem('retrovision_ball_highscore', '1');
    } else if (gameName === 'Puzzle Magique') {
      localStorage.setItem('retrovision_jigsaw_highscore', '1');
    } else if (gameName === 'Débloque-Moi') {
      localStorage.setItem('retrovision_unblock_highscore', '1');
    } else if (gameName === 'FreeCell') {
      localStorage.setItem('retrovision_freecell_highscore', '1');
    } else if (gameName === 'Démineur') {
      localStorage.setItem('retrovision_mines_highscore', '1');
    } else if (gameName === 'Flèches') {
      localStorage.setItem('retrovision_arrows_highscore', '1');
    } else if (gameName === 'Neon 2048') {
      localStorage.setItem('retrovision_2048_highscore', score.toString());
    } else if (gameName === 'Le Pendu') {
      localStorage.setItem('retrovision_hangman_highscore', score.toString());
    }

    setStatsUpdated((prev) => prev + 1);
  };

  const renderContent = () => {
    switch (view) {
      case 'mahjong':
        return (
          <div className="game-wrapper-fullscreen">
            <MahjongZen
              onBack={() => setView('dashboard')}
              onScoreSave={handleScoreSave}
              onIntermissionRequest={handleMahjongNextLevel}
            />
          </div>
        );
      case 'water':
        return (
          <div className="game-wrapper">
            <WaterSort
              onBack={() => setView('dashboard')}
              onScoreSave={handleScoreSave}
              isIntermission={isIntermissionMode}
              onIntermissionComplete={handleIntermissionComplete}
            />
          </div>
        );
      case 'ball':
        return (
          <div className="game-wrapper">
            <BallSort
              onBack={() => setView('dashboard')}
              onScoreSave={handleScoreSave}
              isIntermission={isIntermissionMode}
              onIntermissionComplete={handleIntermissionComplete}
            />
          </div>
        );
      case '2048':
        return (
          <div className="game-wrapper">
            <GameScaleWrapper designWidth={420} defaultHeight={700}>
              <Grid2048
                onBack={() => setView('dashboard')}
                onScoreSave={handleScoreSave}
              />
            </GameScaleWrapper>
          </div>
        );
      case 'jigsaw':
        return (
          <div className="game-wrapper">
            <GameScaleWrapper designWidth={600} defaultHeight={850}>
              <JigsawPuzzle
                onBack={() => setView('dashboard')}
                onScoreSave={handleScoreSave}
              />
            </GameScaleWrapper>
          </div>
        );
      case 'unblock':
        return (
          <div className="game-wrapper">
            <GameScaleWrapper designWidth={500} defaultHeight={850}>
              <UnblockMe
                onBack={() => setView('dashboard')}
                onScoreSave={handleScoreSave}
              />
            </GameScaleWrapper>
          </div>
        );
      case 'freecell':
        return (
          <div className="game-wrapper">
            <FreeCell
              onBack={() => setView('dashboard')}
              onScoreSave={handleScoreSave}
            />
          </div>
        );
      case 'mines':
        return (
          <div className="game-wrapper">
            <GameScaleWrapper designWidth={420} defaultHeight={750}>
              <Minesweeper
                onBack={() => setView('dashboard')}
                onScoreSave={handleScoreSave}
                isIntermission={isIntermissionMode}
                onIntermissionComplete={handleIntermissionComplete}
              />
            </GameScaleWrapper>
          </div>
        );
      case 'arrows':
        return (
          <div className="game-wrapper">
            <GameScaleWrapper designWidth={500} defaultHeight={850}>
              <ArrowPuzzle
                onBack={() => setView('dashboard')}
                onScoreSave={handleScoreSave}
                isIntermission={isIntermissionMode}
                onIntermissionComplete={handleIntermissionComplete}
              />
            </GameScaleWrapper>
          </div>
        );
      case 'hangman':
        return (
          <div className="game-wrapper">
            <GameScaleWrapper designWidth={430} defaultHeight={800}>
              <Hangman
                onBack={() => setView('dashboard')}
                onScoreSave={handleScoreSave}
              />
            </GameScaleWrapper>
          </div>
        );
      default:
        return (
          <Dashboard
            onSelectGame={(gameId) => setView(gameId)}
            statsUpdated={statsUpdated}
          />
        );
    }
  };

  return (
    <>
      {/* CRT Retro Screen Filter Overlay */}
      <div className="crt-overlay"></div>

      <header className="app-header">
        <h1 className="brand-logo">
          Retro<span>Vision</span>
        </h1>
        <div className="brand-subtitle">Espace Rééducation Cognitive & Zen</div>
      </header>

      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
      </main>

      <footer className="app-footer">
        RETROVISION © 2026 | CONÇU POUR LA RÉÉDUCATION COGNITIVE
      </footer>
    </>
  );
}

export default App;
