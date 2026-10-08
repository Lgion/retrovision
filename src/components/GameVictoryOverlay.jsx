import React, { useEffect, useState, useRef } from 'react';
import { sound } from '../utils/sound';
import IntermissionProposal from './IntermissionProposal';

/**
 * GameVictoryOverlay
 * Composant unifié et standardisé de fin de partie pour TOUS les jeux de RetroVision.
 *
 * Déroulement conforme au modèle de référence Mahjong Zen :
 * 1. Jingle sonore de victoire immédiat (sound.playPowerup)
 * 2. Pluie de confettis plein écran qui commence immédiatement
 * 3. Temporisation (1.5s à 2.0s via delayFadeIn) : la grille résolue reste visible sous les confettis
 * 4. Apparition en fondu doux de la carte de victoire Néo-Arcade :
 *    - Fond sombre vitré cyan/teal (rgba(8, 60, 84, 0.95), blur)
 *    - Bordure néon cyan éclatante (#38bdf8, glow 40px)
 *    - Trophée d'or animé rebondissant 🏆
 *    - Titre éclatant 'FÉLICITATIONS !'
 *    - Score & statistiques harmonisées
 *    - Carrousel d'entracte <IntermissionProposal />
 *    - Boutons d'actions secondaires ergonomiques (Rejouer, Retour Hub)
 */
export default function GameVictoryOverlay({
  isOpen = false,
  gameKey = '',
  score = null,
  title = 'FÉLICITATIONS !',
  badgeIcon = '🏆',
  subtitle = null,
  stats = [],
  detailsNode = null,
  onRestart = null,
  restartText = '🔄 Rejouer',
  onContinue = null,
  continueText = 'Nouveau Niveau',
  onBack = null,
  backText = '← Retour au Hub',

  // Props Entracte
  isIntermission = false,
  onIntermissionComplete = null,
  onIntermissionRequest = null,
  upcomingIntermission = 'water',
  onSelectUpcomingIntermission = null,
  onShuffleUpcomingIntermission = null,
  intermissionConfig = {},
  intermissionGames = null
}) {
  const [confetti, setConfetti] = useState([]);
  const hasPlayedSoundRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      if (!hasPlayedSoundRef.current) {
        sound.playPowerup?.();
        hasPlayedSoundRef.current = true;
      }

      // Génération de 85 confettis plein écran avec couleurs festives
      const colors = ['#f59e0b', '#ef4444', '#10b981', '#38bdf8', '#8b5cf6', '#ec4899', '#facc15'];
      const newConfetti = [];
      for (let i = 0; i < 85; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          y: -10 - Math.random() * 25,
          size: 7 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 1.5,
          duration: 2.2 + Math.random() * 2.2,
          rotation: Math.random() * 360,
        });
      }
      setConfetti(newConfetti);
    } else {
      hasPlayedSoundRef.current = false;
      setConfetti([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const effectiveSubtitle = subtitle || (score !== null && score !== undefined ? (
    <>Plateau complété avec un score de <strong style={{ color: '#f59e0b' }}>{score}</strong> points !</>
  ) : (
    'Défi complété avec succès !'
  ));

  return (
    <div
      className="game-victory-root-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        pointerEvents: 'auto'
      }}
    >
      {/* 1. Pluie de confettis plein écran (Visible dès t=0s) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 1
        }}
      >
        {confetti.map((c) => (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              left: `${c.x}%`,
              top: `${c.y}vh`,
              width: `${c.size}px`,
              height: `${c.size * 1.5}px`,
              backgroundColor: c.color,
              borderRadius: '2px',
              animation: `confetti-fall ${c.duration}s linear ${c.delay}s infinite`,
              transform: `rotate(${c.rotation}deg)`,
              boxShadow: '0 0 6px rgba(0,0,0,0.3)'
            }}
          />
        ))}
      </div>

      {/* 2. Carte de Victoire Néo-Arcade (Fades in après 1.5s via delayFadeIn) */}
      <div
        className="game-victory-modal-card"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '460px',
          maxHeight: '94vh',
          overflowY: 'auto',
          animation: 'delayFadeIn 2s forwards',
          background: 'rgba(8, 60, 84, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '4px solid #38bdf8',
          boxShadow: '0 0 50px rgba(56, 189, 248, 0.6), inset 0 0 25px rgba(56, 189, 248, 0.3)',
          color: '#ffffff',
          borderRadius: '24px',
          padding: '24px 20px',
          textAlign: 'center',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Trophée rebondissant */}
        <div
          className="victory-crown"
          style={{
            fontSize: '48px',
            marginBottom: '6px',
            animation: 'victory-bounce 1s infinite alternate',
            lineHeight: 1,
            zIndex: 10
          }}
        >
          {badgeIcon}
        </div>

        {/* Titre vibrant cyan */}
        <div
          style={{
            fontFamily: 'var(--font-main, sans-serif)',
            fontSize: '26px',
            color: '#38bdf8',
            fontWeight: '900',
            textShadow: '0 0 15px rgba(56, 189, 248, 0.8)',
            marginBottom: '4px',
            letterSpacing: '1px',
            animation: 'victory-glow 1.5s ease-in-out infinite alternate',
            zIndex: 10
          }}
        >
          {title}
        </div>

        {/* Sous-titre / Message de félicitations */}
        <div
          style={{
            color: '#e0f2fe',
            fontSize: '13.5px',
            fontWeight: '600',
            marginBottom: stats && stats.length > 0 ? '10px' : '14px',
            maxWidth: '380px',
            lineHeight: '1.4',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            zIndex: 10
          }}
        >
          {effectiveSubtitle}
        </div>

        {/* Badges de statistiques optionnels (Temps, Erreurs, Coups, etc.) */}
        {stats && stats.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              marginBottom: '14px',
              maxWidth: '380px',
              zIndex: 10
            }}
          >
            {stats.map((s, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  fontSize: '12.5px',
                  color: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                <span style={{ color: '#94a3b8', fontWeight: '500' }}>{s.label} :</span>
                <strong style={{ color: s.color || '#38bdf8', fontWeight: '800' }}>{s.value}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Bloc personnalisé optionnel (ex: pédagogique pour WordMaster) */}
        {detailsNode && (
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              marginBottom: '14px',
              zIndex: 10
            }}
          >
            {detailsNode}
          </div>
        )}

        {/* 3. Section Entracte ou Validation d'Entracte */}
        {isIntermission ? (
          <div style={{ width: '100%', maxWidth: '380px', margin: '10px 0 16px 0', zIndex: 10 }}>
            <button
              type="button"
              onClick={() => onIntermissionComplete && onIntermissionComplete(true)}
              className="retro-btn pulse-glow"
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '14px',
                fontSize: '15.5px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: '2px solid #34d399',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              🏁 Terminer l'Entracte
            </button>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '380px', zIndex: 10 }}>
            <IntermissionProposal
              onIntermissionRequest={onIntermissionRequest}
              upcomingIntermission={upcomingIntermission}
              onSelectUpcomingIntermission={onSelectUpcomingIntermission}
              onShuffleUpcomingIntermission={onShuffleUpcomingIntermission}
              intermissionConfig={intermissionConfig}
              intermissionGames={intermissionGames}
              excludeGameKey={gameKey}
              onContinue={onContinue || onRestart}
              continueText={continueText}
              showDirectContinue={true}
              customStyle={{ marginBottom: '16px' }}
            />
          </div>
        )}

        {/* 4. Actions secondaires : Rejouer & Retour au Hub */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            width: '100%',
            maxWidth: '380px',
            zIndex: 10,
            marginTop: '2px'
          }}
        >
          <button
            type="button"
            onClick={onRestart || onContinue}
            className="retro-btn"
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#e0f2fe',
              fontWeight: '700',
              fontSize: '13px',
              padding: '10px 0',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.1s'
            }}
          >
            {restartText}
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="retro-btn"
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#e0f2fe',
                fontWeight: '700',
                fontSize: '13px',
                padding: '10px 0',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'background 0.2s, transform 0.1s'
              }}
            >
              {backText}
            </button>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes delayFadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          75% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes victory-bounce {
          0% { transform: translateY(0) scale(0.85); }
          100% { transform: translateY(-14px) scale(1.08); }
        }
        @keyframes victory-glow {
          from { text-shadow: 0 0 10px rgba(56, 189, 248, 0.8), 0 0 20px rgba(56, 189, 248, 0.4); }
          to { text-shadow: 0 0 22px rgba(56, 189, 248, 1), 0 0 35px rgba(56, 189, 248, 0.7); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(125vh) rotate(720deg); opacity: 0.9; }
        }
      `}} />
    </div>
  );
}
