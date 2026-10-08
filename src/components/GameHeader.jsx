import React from 'react';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';
import { isRandomThemeEnabled } from '../utils/themeManager';

export default function GameHeader({
  title,
  subtitle,
  onBack,
  backText = "← Retour",
  onRestart,
  restartTitle = "Rejouer",
  onUndo,
  undoDisabled = false,
  onHint,
  hintDisabled = false,
  hintsLeft,
  onShuffle,
  shuffleDisabled = false,
  onShop,
  onOpenShop,
  showShop = false,
  showBgmToggle = false,
  bgmOn,
  onBgmToggle,
  centerContent,
  extraControls,
  style = {},
  gameId,
  onChangeTheme,
  onLaunchIntermission,
  onIntermissionRequest
}) {
  const handleShop = onShop || onOpenShop;
  const triggerIntermission = onLaunchIntermission || (onIntermissionRequest ? () => onIntermissionRequest() : null);

  return (
    <>
      <style>{`
        .btn-theme-rand {
          background: radial-gradient(circle at 30% 30%, #38bdf8, #6366f1);
          border-bottom: 4px solid #4338ca;
          box-shadow: 0 8px 15px rgba(56, 189, 248, 0.35), inset 0 6px 8px rgba(255,255,255,0.6);
        }
        .btn-theme-rand:hover {
          filter: brightness(1.2);
          box-shadow: 0 8px 20px rgba(56, 189, 248, 0.6), inset 0 6px 8px rgba(255,255,255,0.8);
        }
        .candy-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          font-size: 1.4rem;
          color: white;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 6px 14px rgba(0,0,0,0.3), inset 0 4px 6px rgba(255,255,255,0.6), inset 0 -3px 5px rgba(0,0,0,0.4);
          user-select: none;
          touch-action: manipulation;
          flex-shrink: 0;
        }
        .candy-btn:active:not(:disabled) {
          transform: scale(0.92) translateY(3px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4);
          border-bottom-width: 0px;
        }
        .candy-btn:disabled {
          background: radial-gradient(circle at 30% 30%, #6b7280, #374151) !important;
          border-bottom: 3px solid #1f2937 !important;
          color: #9ca3af;
          cursor: not-allowed;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1), inset 0 4px 6px rgba(255,255,255,0.1);
          transform: scale(0.95);
          opacity: 0.6;
        }
        .btn-restart {
          background: radial-gradient(circle at 30% 30%, #38bdf8, #0284c7);
          border-bottom: 4px solid #0369a1;
        }
        .btn-undo {
          background: radial-gradient(circle at 30% 30%, #ec4899, #be185d);
          border-bottom: 4px solid #831843;
        }
        .btn-hint {
          background: radial-gradient(circle at 30% 30%, #fef08a, #eab308);
          border-bottom: 4px solid #a16207;
          animation: hint-pulse 2s infinite;
        }
        .btn-shuffle {
          background: radial-gradient(circle at 30% 30%, #fb923c, #ea580c);
          border-bottom: 4px solid #c2410c;
        }
        @keyframes hint-pulse {
          0%, 100% { box-shadow: 0 8px 15px rgba(234, 179, 8, 0.4), inset 0 6px 8px rgba(255,255,255,0.6); }
          50% { box-shadow: 0 8px 25px rgba(234, 179, 8, 0.8), inset 0 6px 8px rgba(255,255,255,0.8); filter: brightness(1.1); }
        }
        .btn-shop {
          background: radial-gradient(circle at 30% 30%, #fb923c, #ea580c);
          border-bottom: 4px solid #c2410c;
          width: auto;
          padding: 0 16px;
          border-radius: 24px;
          font-weight: 800;
          font-size: 1rem;
          letter-spacing: 0.5px;
        }
        .btn-music {
          background: radial-gradient(circle at 30% 30%, #a78bfa, #7c3aed);
          border-bottom: 4px solid #5b21b6;
        }
        .btn-music.off {
          background: radial-gradient(circle at 30% 30%, #9ca3af, #4b5563);
          border-bottom: 4px solid #374151;
        }
        
        /* Bouton d'entracte instantané ☕ (chaleureux et distinctif) */
        .btn-quick-intermission {
          background: radial-gradient(circle at 30% 30%, #f59e0b, #d97706) !important;
          border-bottom: 4px solid #92400e !important;
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.45), inset 0 4px 6px rgba(255,255,255,0.6) !important;
          font-size: 1.45rem !important;
          flex-shrink: 0 !important;
          z-index: 25;
        }
        .btn-quick-intermission:hover {
          filter: brightness(1.15) !important;
          transform: translateY(-2px) scale(1.08) !important;
          box-shadow: 0 8px 22px rgba(245, 158, 11, 0.65), inset 0 4px 6px rgba(255,255,255,0.8) !important;
        }
        .btn-quick-intermission:active {
          transform: translateY(2px) scale(0.94) !important;
          box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4) !important;
        }

        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 1.1rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .btn-icon {
          width: 22px;
          height: 22px;
          fill: currentColor;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
        }

        /* Layout & Responsiveness */
        .gh-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          padding: 10px 16px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
          z-index: 100;
          box-sizing: border-box;
          position: relative;
        }
        .gh-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 12px;
        }
        .gh-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .gh-center {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 0;
        }
        .gh-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          margin-left: auto;
        }
        .gh-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .gh-back-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 44px;
          min-width: 44px;
          padding: 8px 16px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.3));
          border: 2px solid #38bdf8;
          color: #ffffff;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);
          touch-action: manipulation;
          user-select: none;
        }
        .gh-back-btn:hover {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(99, 102, 241, 0.45));
          border-color: #7dd3fc;
          box-shadow: 0 6px 18px rgba(56, 189, 248, 0.5);
          transform: translateY(-1px);
        }
        .gh-back-btn:active {
          transform: scale(0.96);
          background: rgba(56, 189, 248, 0.4);
        }

        @media (max-width: 640px) {
          .gh-container {
            padding: 8px 10px !important;
            gap: 6px !important;
          }
          .gh-top-row {
            flex-wrap: wrap !important;
            gap: 6px !important;
          }
          .gh-left {
            order: 1;
          }
          .gh-center {
            order: 2;
            flex-grow: 1;
          }
          .btn-quick-intermission {
            order: 3;
            margin-left: auto;
          }
          .gh-right {
            display: contents !important;
          }
          .gh-controls {
            order: 4;
            width: 100% !important;
            justify-content: center !important;
            margin-top: 4px !important;
            gap: 8px !important;
          }
          .gh-title {
            font-size: 1rem !important;
          }
          .gh-subtitle {
            display: none !important;
          }
          .btn-shop-text {
            display: none !important;
          }
          .candy-btn.btn-shop {
            padding: 0 12px !important;
          }
        }
      `}</style>

      <div className="gh-container" style={style}>
        <div className="gh-top-row">
          {/* Left Area: Back Button & Title */}
          <div className="gh-left">
            <button
              onClick={() => {
                sound.playClick();
                haptic.tap(20);
                if (onBack) onBack();
              }}
              className="gh-back-btn"
              title="Retour au menu"
            >
              {backText}
            </button>
            {title && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <div
                  className="gh-title"
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '1.15rem',
                    color: '#fff',
                    letterSpacing: '1px',
                    fontWeight: 'bold',
                    lineHeight: '1.2'
                  }}
                >
                  {title}
                </div>
                {subtitle && (
                  <div
                    className="gh-subtitle"
                    style={{
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                      fontWeight: '500'
                    }}
                  >
                    {subtitle}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center Area: Score, Timer, Level, info */}
          {centerContent && (
            <div className="gh-center">
              {centerContent}
            </div>
          )}

          {/* Right Area: Controls + Intermission Button (Pinned on top-right) */}
          <div className="gh-right">
            <div className="gh-controls">
              {onRestart && (
                <button
                  onClick={onRestart}
                  className="candy-btn btn-restart"
                  title={restartTitle}
                  aria-label={restartTitle}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                  </svg>
                </button>
              )}

              {onUndo && (
                <button
                  onClick={onUndo}
                  disabled={undoDisabled}
                  className="candy-btn btn-undo"
                  title="Annuler le dernier coup"
                  aria-label="Annuler"
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" style={{ color: "white" }}>
                    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
                  </svg>
                </button>
              )}

              {onHint && (
                <button
                  onClick={onHint}
                  disabled={hintDisabled}
                  className="candy-btn btn-hint"
                  title="Obtenir un indice"
                  aria-label="Indice"
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" style={{ color: "black" }}>
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                  </svg>
                  {hintsLeft !== undefined && <span className="badge">{hintsLeft}</span>}
                </button>
              )}

              {onChangeTheme && isRandomThemeEnabled(gameId || title) && (
                <button
                  onClick={() => {
                    sound.playClick();
                    haptic.tap(25);
                    onChangeTheme();
                  }}
                  className="candy-btn btn-theme-rand"
                  title="Changer de thème (Thème aléatoire actif)"
                  aria-label="Changer de thème"
                >
                  🎨
                </button>
              )}

              {onShuffle && (
                <button
                  onClick={onShuffle}
                  disabled={shuffleDisabled}
                  className="candy-btn btn-shuffle"
                  title="Mélanger"
                  aria-label="Mélanger"
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" style={{ color: "white" }}>
                    <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                  </svg>
                </button>
              )}

              {showBgmToggle && onBgmToggle && (
                <button
                  onClick={onBgmToggle}
                  className={`candy-btn btn-music ${!bgmOn ? 'off' : ''}`}
                  title={bgmOn ? "Couper la musique" : "Activer la musique"}
                  aria-label="Musique"
                >
                  {bgmOn ? '🎵' : '🔇'}
                </button>
              )}

              {(showShop || handleShop) && (
                <button
                  onClick={() => {
                    if (handleShop) {
                      handleShop();
                    } else {
                      alert("Boutique bientôt disponible pour ce jeu !");
                    }
                  }}
                  className="candy-btn btn-shop"
                  title="Boutique"
                  aria-label="Boutique"
                >
                  🛍️<span className="btn-shop-text"> Boutique</span>
                </button>
              )}

              {extraControls}
            </div>

            {/* BOUTON ENTRACTE INSTANTANÉ ☕ (COLLÉ EN HAUT À DROITE) */}
            {triggerIntermission && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  haptic.tap(35);
                  triggerIntermission();
                }}
                className="candy-btn btn-quick-intermission"
                title="Lancer un entracte sans plus attendre ☕"
                aria-label="Lancer un entracte"
              >
                ☕
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
