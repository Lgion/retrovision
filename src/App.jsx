import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import MahjongZen from './games/MahjongZen';
import WaterSort from './games/WaterSort';
import BallSort from './games/BallSort';
import Grid2048 from './games/Grid2048';
import './App.css';

function App() {
  const [view, setView] = useState('dashboard');
  const [statsUpdated, setStatsUpdated] = useState(0);

  const handleScoreSave = (gameName, score) => {
    console.log(`Saved high score for ${gameName}: ${score}`);

    // Save to appropriate localStorage key to trigger Dashboard update
    if (gameName === 'Mahjong Zen') {
      localStorage.setItem('retrovision_mahjong_highscore', '1');
    } else if (gameName === 'Tri Eau') {
      localStorage.setItem('retrovision_water_highscore', '1');
    } else if (gameName === 'Tri Billes') {
      localStorage.setItem('retrovision_ball_highscore', '1');
    }

    setStatsUpdated((prev) => prev + 1);
  };

  const renderContent = () => {
    switch (view) {
      case 'mahjong':
        return (
          <div className="game-wrapper">
            <MahjongZen
              onBack={() => setView('dashboard')}
              onScoreSave={handleScoreSave}
            />
          </div>
        );
      case 'water':
        return (
          <div className="game-wrapper">
            <WaterSort
              onBack={() => setView('dashboard')}
              onScoreSave={handleScoreSave}
            />
          </div>
        );
      case 'ball':
        return (
          <div className="game-wrapper">
            <BallSort
              onBack={() => setView('dashboard')}
              onScoreSave={handleScoreSave}
            />
          </div>
        );
      case '2048':
        return (
          <div className="game-wrapper">
            <Grid2048
              onBack={() => setView('dashboard')}
              onScoreSave={(name, val) => {
                localStorage.setItem('retrovision_2048_highscore', val.toString());
                setStatsUpdated((prev) => prev + 1);
              }}
            />
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
        {renderContent()}
      </main>

      <footer className="app-footer">
        RETROVISION © 2026 | CONÇU POUR LA RÉÉDUCATION COGNITIVE
      </footer>
    </>
  );
}

export default App;
