import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../utils/sound';

const INTERMISSION_GAMES = [
  { key: 'water', name: 'Water Sort', icon: '💧' },
  { key: 'ball', name: 'Ball Sort', icon: '🔮' },
  { key: 'bubblecool', name: 'Bubble Cool', icon: '🫧' },
  { key: 'sudoku', name: 'Sudoku', icon: '🔢' },
  { key: 'blockfantasy', name: 'Block Fantasy', icon: '🧱' },
  { key: '2048', name: '2048', icon: '🔢' },
  { key: 'mines', name: 'Démineur', icon: '💣' },
  { key: 'arrows', name: 'Flèches Zen', icon: '🏹' },
  { key: 'jigsaw', name: 'Puzzle', icon: '🧩' },
  { key: 'freecell', name: 'FreeCell', icon: '🃏' },
  { key: 'hangman', name: 'Pendu', icon: '🎈' },
  { key: 'impossible13', name: 'Impossible 13', icon: '1️⃣3️⃣' }
];

export default function IntermissionHeader({
  instructionText = "Relevez le défi pour retourner au jeu principal.",
  onRestart,
  onOtherGame,
  onSkip,
  replaySame = false,
  onToggleReplaySame,
  extraControls,
  progress = null, // ratio 0.0 to 1.0 (e.g. 0.85 = 85% complete)
  showCTA = false   // explicit force show CTA boolean
}) {
  const [reached80, setReached80] = useState(false);
  const [showGamePicker, setShowGamePicker] = useState(false);
  const pickerRef = useRef(null);
  const soundPlayedRef = useRef(false);

  const isCurrent80 = (progress !== null && progress >= 0.8) || showCTA === true || !!replaySame;

  useEffect(() => {
    if (isCurrent80 && !reached80) {
      setReached80(true);
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;
        sound.playPowerup?.();
      }
    }
  }, [isCurrent80, reached80]);

  // Close game picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowGamePicker(false);
      }
    };
    if (showGamePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showGamePicker]);

  const isCtaVisible = reached80 || isCurrent80;

  return (
    <>
      <style>{`
        .entract-header-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px 14px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid rgba(59, 130, 246, 0.35);
          border-radius: 14px;
          margin-bottom: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          width: 100%;
          box-sizing: border-box;
        }

        .entract-top-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .entract-badge {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.4);
          color: #60a5fa;
          padding: 3px 10px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .entract-instruction {
          font-size: 0.86rem;
          color: #e2e8f0;
          font-weight: 600;
          line-height: 1.3;
          flex: 1;
        }

        .entract-actions-row {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .entract-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 6px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          user-select: none;
          outline: none;
          box-sizing: border-box;
        }

        .entract-btn:active {
          transform: scale(0.96);
        }

        .entract-btn-restart {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
        }

        .entract-btn-restart:hover {
          background: rgba(16, 185, 129, 0.3);
        }

        .entract-btn-other {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.45);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.15);
        }

        .entract-btn-other:hover {
          background: rgba(59, 130, 246, 0.3);
        }

        .entract-btn-skip {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.45);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.15);
        }

        .entract-btn-skip:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .entract-game-picker-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          width: 250px;
          max-height: 280px;
          overflow-y: auto;
          background: #0f172a;
          border: 1px solid rgba(59, 130, 246, 0.5);
          border-radius: 12px;
          padding: 6px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .entract-picker-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: #e2e8f0;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: background 0.15s ease;
        }

        .entract-picker-item:hover {
          background: rgba(59, 130, 246, 0.2);
          color: #38bdf8;
        }

        .entract-footer-bar {
          position: fixed;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 6px 16px;
          border-radius: 20px;
          background: rgba(15, 23, 42, 0.94);
          border: 1px solid rgba(245, 158, 11, 0.6);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(245, 158, 11, 0.25);
          backdrop-filter: blur(10px);
          pointer-events: auto;
          animation: entractFooterFadeIn 0.3s ease-out;
        }

        @keyframes entractFooterFadeIn {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      {/* --- STANDARDIZED COMPACT HEADER (2 ROWS, IDENTICAL ACROSS ALL 12 GAMES) --- */}
      <div className="entract-header-container">
        {/* Row 1: Badge & Instruction text */}
        <div className="entract-top-row">
          <span className="entract-badge">🎬 ENTRACTE</span>
          <span className="entract-instruction">{instructionText}</span>
        </div>

        {/* Row 2: 3 Compact Actions (Relancer, Autre jeu, Passer l'entracte) */}
        <div className="entract-actions-row" style={{ position: 'relative' }} ref={pickerRef}>
          {onRestart && (
            <button
              onClick={() => {
                sound.playClick();
                onRestart();
              }}
              className="entract-btn entract-btn-restart"
              title="Relancer cette partie d'entracte"
            >
              <span>🔄</span> Relancer
            </button>
          )}

          {onOtherGame && (
            <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowGamePicker(!showGamePicker);
                }}
                className="entract-btn entract-btn-other"
                style={{ width: '100%' }}
                title="Changer de jeu d'entracte à la volée"
              >
                <span>🎲</span> Autre jeu ▾
              </button>

              {showGamePicker && (
                <div className="entract-game-picker-dropdown">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowGamePicker(false);
                      onOtherGame();
                    }}
                    className="entract-picker-item"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#F59E0B' }}
                  >
                    <span>🎲</span>
                    <span>Aléatoire</span>
                  </button>
                  {INTERMISSION_GAMES.map((g) => (
                    <button
                      key={g.key}
                      onClick={() => {
                        sound.playClick();
                        setShowGamePicker(false);
                        onOtherGame(g.key);
                      }}
                      className="entract-picker-item"
                    >
                      <span style={{ fontSize: '1rem' }}>{g.icon}</span>
                      <span>{g.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {onSkip && (
            <button
              onClick={() => {
                sound.playClick();
                onSkip();
              }}
              className="entract-btn entract-btn-skip"
              title="Passer cette entracte et reprendre le jeu principal"
            >
              <span>Passer</span> ⏭
            </button>
          )}

          {extraControls}
        </div>
      </div>

      {/* --- FOOTER OPTIONS (SPRINT FINAL 80% & REJOUER CETTE ENTRACTE) --- */}
      {/* Placed in the footer at bottom of viewport, non-intrusive without modifying header */}
      {isCtaVisible && (
        <div className="entract-footer-bar">
          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#FDE68A', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>⚡</span> SPRINT FINAL (80%+)
          </span>

          {onToggleReplaySame && (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                color: replaySame ? '#34d399' : '#e2e8f0',
                fontWeight: '700',
                userSelect: 'none'
              }}
              title="Activer pour relancer automatiquement ce jeu d'entracte une fois terminé"
            >
              <input
                type="checkbox"
                checked={!!replaySame}
                onChange={(e) => {
                  sound.playClick();
                  onToggleReplaySame(e.target.checked);
                }}
                style={{
                  width: '14px',
                  height: '14px',
                  accentColor: '#10B981',
                  cursor: 'pointer'
                }}
              />
              <span>{replaySame ? '🔄 Rejouer activé' : 'Rejouer cette entracte ?'}</span>
            </label>
          )}
        </div>
      )}
    </>
  );
}
