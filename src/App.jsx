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
import Sudoku from './games/Sudoku';
import GameScaleWrapper from './components/GameScaleWrapper';
import { recordPlay, recordTime, recordScore } from './utils/stats';
import './App.css';

function App() {
  const [view, setView] = useState('dashboard');
  const [statsUpdated, setStatsUpdated] = useState(0);
  const gameStartRef = useRef(0);
  
  const [isIntermissionMode, setIsIntermissionMode] = useState(false);
  const [returnView, setReturnView] = useState(null);
  const [skipNextIntro, setSkipNextIntro] = useState(false);

  const [intermissionConfig, setIntermissionConfig] = useState(() => {
    const defaultConfig = {
      ball: { enabled: true, frequency: 'medium' },
      water: { enabled: true, frequency: 'medium' },
      mines: { enabled: true, frequency: 'medium' },
      arrows: { enabled: true, frequency: 'medium' },
      sudoku: { enabled: true, frequency: 'medium' }
    };
    const saved = localStorage.getItem('retrovision_intermission_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultConfig, ...parsed };
      } catch (e) {
        // ignore
      }
    }
    return defaultConfig;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastIntermissionGame, setLastIntermissionGame] = useState(() => {
    return localStorage.getItem('retrovision_last_intermission_game') || null;
  });

  const handleMahjongNextLevel = () => {
    const enabledGames = Object.keys(intermissionConfig).filter(
      key => intermissionConfig[key].enabled
    );
    const gamesToChooseFrom = enabledGames.length > 0 ? enabledGames : ['ball', 'water', 'mines', 'arrows', 'sudoku'];
    
    let filteredGames = gamesToChooseFrom;
    if (gamesToChooseFrom.length > 1 && lastIntermissionGame) {
      filteredGames = gamesToChooseFrom.filter(g => g !== lastIntermissionGame);
    }
    
    const weightMap = { low: 1, medium: 3, high: 5 };
    const weightedList = [];
    filteredGames.forEach(gameKey => {
      const configEntry = intermissionConfig[gameKey] || { frequency: 'medium' };
      const weight = weightMap[configEntry.frequency] || 3;
      for (let i = 0; i < weight; i++) {
        weightedList.push(gameKey);
      }
    });
    
    const chosenGame = weightedList.length > 0 
      ? weightedList[Math.floor(Math.random() * weightedList.length)]
      : filteredGames[Math.floor(Math.random() * filteredGames.length)];
      
    setLastIntermissionGame(chosenGame);
    localStorage.setItem('retrovision_last_intermission_game', chosenGame);
    
    setReturnView('mahjong');
    setIsIntermissionMode(true);
    setView(chosenGame);
  };

  const handleIntermissionComplete = () => {
    setView('intermission-victory');
    setSkipNextIntro(true);
  };

  useEffect(() => {
    if (view === 'dashboard') {
      setSkipNextIntro(false);
    } else if (view === 'intermission-victory') {
      const timer = setTimeout(() => {
        setView(returnView || 'dashboard');
        setIsIntermissionMode(false);
        setReturnView(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [view, returnView]);


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
    } else if (gameName === 'Sudoku') {
      localStorage.setItem('retrovision_sudoku_highscore', score.toString());
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
              skipIntro={skipNextIntro}
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
      case 'sudoku':
        return (
          <div className="game-wrapper">
            <GameScaleWrapper designWidth={500} defaultHeight={850}>
              <Sudoku
                onBack={() => setView('dashboard')}
                onScoreSave={handleScoreSave}
                isIntermission={isIntermissionMode}
                onIntermissionComplete={handleIntermissionComplete}
              />
            </GameScaleWrapper>
          </div>
        );
      case 'intermission-victory':
        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'radial-gradient(circle at center, #0f172a, #020617)',
            zIndex: 9999,
            animation: 'fadeInVictory 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards, fadeOutVictory 0.6s cubic-bezier(0.16, 1, 0.3, 1) 2.4s forwards',
            opacity: 0,
            fontFamily: "'Outfit', 'Inter', sans-serif"
          }}>
            {/* Glow effect in background */}
            <div style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              background: 'rgba(59, 130, 246, 0.15)',
              borderRadius: '50%',
              filter: 'blur(80px)',
              pointerEvents: 'none',
              animation: 'pulseGlow 2s infinite alternate'
            }} />
            
            {/* Trophy emblem */}
            <div style={{ 
              fontSize: '80px', 
              marginBottom: '24px',
              filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))',
              animation: 'victoryScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
            }}>
              🏆
            </div>
            
            {/* Sleek Text */}
            <h1 style={{ 
              fontSize: '2.8rem', 
              fontWeight: '800',
              letterSpacing: '2px',
              background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 12px 0',
              textAlign: 'center',
              textTransform: 'uppercase',
              animation: 'victorySlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both'
            }}>
              Entracte Réussi
            </h1>
            
            <div style={{
              width: '80px',
              height: '4px',
              background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
              marginBottom: '20px',
              borderRadius: '2px',
              animation: 'victorySlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both'
            }} />
            
            <p style={{ 
              fontSize: '1.2rem', 
              color: '#94a3b8', 
              margin: 0,
              fontWeight: '500',
              letterSpacing: '0.5px',
              textAlign: 'center',
              animation: 'victorySlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both'
            }}>
              Retour au Mahjong Zen...
            </p>

            {/* Minimalist sleek progress bar loader */}
            <div style={{
              width: '160px',
              height: '3px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '2px',
              marginTop: '32px',
              overflow: 'hidden',
              animation: 'victorySlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                borderRadius: '2px',
                animation: 'victoryProgressBar 2.2s linear forwards'
              }} />
            </div>

            <style>{`
              @keyframes fadeInVictory {
                0% { opacity: 0; backdrop-filter: blur(0px); }
                100% { opacity: 1; backdrop-filter: blur(12px); }
              }
              @keyframes fadeOutVictory {
                0% { opacity: 1; }
                100% { opacity: 0; }
              }
              @keyframes victoryScale {
                0% { transform: scale(0.5); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes victorySlideUp {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
              }
              @keyframes victoryProgressBar {
                0% { width: 0%; }
                100% { width: 100%; }
              }
              @keyframes pulseGlow {
                0% { transform: scale(0.9); opacity: 0.12; }
                100% { transform: scale(1.1); opacity: 0.2; }
              }
            `}</style>
          </div>
        );
      default:
        return (
          <Dashboard
            onSelectGame={(gameId) => setView(gameId)}
            statsUpdated={statsUpdated}
            onOpenIntermissionSettings={() => setIsSettingsOpen(true)}
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

function IntermissionSettingsModal({ config, onClose, onSave }) {
  const [tempConfig, setTempConfig] = useState(() => JSON.parse(JSON.stringify(config)));
  const [errorMsg, setErrorMsg] = useState('');

  const handleToggle = (gameKey) => {
    setTempConfig(prev => {
      const next = { ...prev };
      const current = next[gameKey] || { enabled: false, frequency: 'medium' };
      next[gameKey] = {
        ...current,
        enabled: !current.enabled
      };
      return next;
    });
    setErrorMsg('');
  };

  const handleFrequency = (gameKey, freq) => {
    setTempConfig(prev => {
      const next = { ...prev };
      const current = next[gameKey] || { enabled: true, frequency: 'medium' };
      next[gameKey] = {
        ...current,
        frequency: freq
      };
      return next;
    });
  };

  const handleSave = () => {
    const anyEnabled = Object.values(tempConfig).some(g => g.enabled);
    if (!anyEnabled) {
      setErrorMsg('Veuillez activer au moins un jeu pour les entractes.');
      return;
    }
    onSave(tempConfig);
  };

  const gameNames = {
    ball: { name: 'Tri de Billes', icon: '🔮', color: '#ff007f' },
    water: { name: 'Tri de l\'Eau', icon: '🧪', color: '#00ff7f' },
    mines: { name: 'Démineur', icon: '💣', color: '#ef4444' },
    arrows: { name: 'Arrow Puzzle', icon: '⬆️', color: '#3b82f6' },
    sudoku: { name: 'Sudoku', icon: '🔢', color: '#8b5cf6' }
  };

  return (
    <div style={modalBackdropStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
            ⚙️ PARAMÈTRES DES ENTRACTES
          </h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.4' }}>
          Sélectionnez les jeux qui apparaîtront en entracte après vos parties de Mahjong, et ajustez leur fréquence d'apparition.
        </p>

        {errorMsg && (
          <div style={{ color: '#ef4444', background: '#fee2e2', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold', fontSize: '0.85rem' }}>
            ⚠ {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {Object.keys(gameNames).map(gameKey => {
            const gameInfo = gameNames[gameKey];
            const gameConf = tempConfig[gameKey] || { enabled: false, frequency: 'medium' };

            return (
              <div 
                key={gameKey} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  border: `1px solid ${gameConf.enabled ? 'rgba(59, 130, 246, 0.2)' : '#e2e8f0'}`,
                  background: gameConf.enabled ? 'rgba(59, 130, 246, 0.03)' : '#f8fafc',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => handleToggle(gameKey)}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: `2px solid ${gameConf.enabled ? gameInfo.color : '#94a3b8'}`,
                    background: gameConf.enabled ? gameInfo.color : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    transition: 'all 0.15s ease'
                  }}>
                    {gameConf.enabled && '✓'}
                  </div>
                  <span style={{ fontSize: '20px' }}>{gameInfo.icon}</span>
                  <span style={{
                    fontWeight: '700',
                    color: gameConf.enabled ? 'var(--text-main)' : '#64748b',
                    fontSize: '0.95rem'
                  }}>
                    {gameInfo.name}
                  </span>
                </div>

                {gameConf.enabled ? (
                  <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
                    {['low', 'medium', 'high'].map(freq => {
                      const label = freq === 'low' ? 'Rare' : freq === 'medium' ? 'Normal' : 'Fréquent';
                      const isSelected = gameConf.frequency === freq;
                      return (
                        <button
                          key={freq}
                          onClick={() => handleFrequency(gameKey, freq)}
                          style={{
                            border: 'none',
                            background: isSelected ? '#ffffff' : 'transparent',
                            color: isSelected ? gameInfo.color : '#64748b',
                            boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', paddingRight: '12px' }}>Désactivé</span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose} 
            className="retro-btn"
            style={{
              padding: '10px 20px',
              borderColor: '#cbd5e1',
              color: '#64748b',
              background: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Annuler
          </button>
          <button 
            onClick={handleSave} 
            className="retro-btn"
            style={{
              padding: '10px 24px',
              borderColor: 'var(--primary)',
              color: '#ffffff',
              background: 'var(--primary)',
              fontSize: '0.9rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.2)'
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

const modalBackdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(8px)',
  zIndex: 10000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '16px'
};

const modalContentStyle = {
  width: '520px',
  maxWidth: '100%',
  background: '#ffffff',
  borderRadius: '24px',
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  padding: '28px',
  fontFamily: "'Outfit', 'Inter', sans-serif",
  boxSizing: 'border-box',
  position: 'relative',
  animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px'
};

const closeBtnStyle = {
  border: 'none',
  background: 'transparent',
  fontSize: '18px',
  cursor: 'pointer',
  color: '#94a3b8',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.15s ease'
};

export default App;
