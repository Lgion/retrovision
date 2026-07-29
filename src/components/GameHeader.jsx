import React from 'react';
import { sound } from '../utils/sound';

export default function GameHeader({
  title,
  onBack,
  backText = "← Retour",
  onRestart,
  onUndo,
  undoDisabled = false,
  onHint,
  hintDisabled = false,
  hintsLeft,
  onShop,
  showBgmToggle = true,
  bgmOn,
  onBgmToggle,
  centerContent,
  extraControls,
  style = {}
}) {
  return (
    <>
      <style>{`
        .candy-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          font-size: 1.5rem;
          color: white;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 8px 15px rgba(0,0,0,0.3), inset 0 6px 8px rgba(255,255,255,0.6), inset 0 -4px 6px rgba(0,0,0,0.4);
          user-select: none;
        }
        .candy-btn:active:not(:disabled) {
          transform: scale(0.9) translateY(4px);
          box-shadow: 0 2px 5px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2);
          border-bottom-width: 0px;
        }
        .candy-btn:disabled {
          background: radial-gradient(circle at 30% 30%, #6b7280, #374151) !important;
          border-bottom: 4px solid #1f2937 !important;
          color: #9ca3af;
          cursor: not-allowed;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1), inset 0 4px 6px rgba(255,255,255,0.1);
          transform: scale(0.95);
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
        .btn-hint{left:30%;}
        .btn-shuffle {right:30%;}
        .btn-hint, .btn-shuffle {
          position: absolute;
          z-index: 10;
          width: 100px;
        }
        @keyframes hint-pulse {
          0%, 100% { box-shadow: 0 8px 15px rgba(234, 179, 8, 0.4), inset 0 6px 8px rgba(255,255,255,0.6), inset 0 -4px 6px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 8px 25px rgba(234, 179, 8, 0.8), inset 0 6px 8px rgba(255,255,255,0.8), inset 0 -4px 6px rgba(0,0,0,0.4); filter: brightness(1.1); }
        }
        .btn-shop {
          background: radial-gradient(circle at 30% 30%, #fb923c, #ea580c);
          border-bottom: 4px solid #c2410c;
          width: auto;
          padding: 0 20px;
          border-radius: 24px;
          font-weight: 900;
          font-size: 1.1rem;
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
        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          font-size: 1.2rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .btn-icon {
          width: 24px;
          height: 24px;
          fill: currentColor;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
        }

        /* Mobile Responsiveness */
        .gh-container {
          padding: 15px 20px;
          gap: 10px;
        }
        .gh-title {
          display: block;
        }
        .btn-shop-text {
          display: inline;
        }
        
        @media (max-width: 600px) {
          .gh-container {
            padding: 8px 10px !important;
            gap: 5px !important;
          }
          .candy-btn {
            width: 40px !important;
            height: 40px !important;
          }
          .candy-btn.btn-shop {
            padding: 0 10px !important;
          }
          .btn-icon {
            width: 20px;
            height: 20px;
          }
          .gh-title {
            display: none !important;
          }
          .btn-shop-text {
            display: none !important;
          }
        }
      `}</style>
      <div className="gh-container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(100px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 10,
        flexWrap: 'wrap',
        ...style
      }}>
        {/* Left Area: Back Button & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            {backText}
          </button>
          {title && (
            <div className="gh-title" style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '1.2rem',
              color: '#fff',
              letterSpacing: '1px',
              fontWeight: 'bold'
            }}>
              {title}
            </div>
          )}
        </div>

        {/* Center Area: Custom content like Score, Timer, Lives */}
        {centerContent && (
          <div className="gh-center" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {centerContent}
          </div>
        )}

        {/* Right Area: Controls */}
        <div style={{ display: 'flex', gap: '2em', width: "100%", alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>

          {onRestart && (
            <button
              onClick={onRestart}
              className="candy-btn btn-restart"
              title="Rejouer"
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
              title="Annuler"
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
              title="Indice"
            >
              <svg className="btn-icon" viewBox="0 0 24 24" style={{ color: "black" }}>
                <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
              </svg>
              {hintsLeft !== undefined && <span className="badge">{hintsLeft}</span>}
            </button>
          )}

          {showBgmToggle && onBgmToggle && (
            <button
              onClick={onBgmToggle}
              className={`candy-btn btn-music ${!bgmOn ? 'off' : ''}`}
              title="Musique"
            >
              {bgmOn ? '🎵' : '🔇'}
            </button>
          )}

          {/* ALWAYS SHOW SHOP */}
          <button
            onClick={() => {
              if (onShop) {
                onShop();
              } else {
                alert("Boutique bientôt disponible pour ce jeu ! Préparez vos pièces !");
              }
            }}
            className="candy-btn btn-shop"
            title="Boutique"
          >
            🛍️<span className="btn-shop-text"> Boutique</span>
          </button>

          {extraControls}
        </div>
      </div>
    </>
  );
}
