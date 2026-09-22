import { useState, useMemo } from 'react';
import { sound } from '../utils/sound';
import GameMiniature from './GameMiniature';

const FALLBACK_INTERMISSION_GAMES = [
  { key: 'water', name: "Tri de l'Eau", icon: '💧', subtitle: 'Tri de couleurs' },
  { key: 'ball', name: 'Tri de Billes', icon: '🔮', subtitle: 'Tri chromatique' },
  { key: '2048', name: 'Neon 2048', icon: '🔢', subtitle: 'Fusion numérique' },
  { key: 'jigsaw', name: 'Puzzle Magique', icon: '🧩', subtitle: 'Reconstitution' },
  { key: 'freecell', name: 'FreeCell', icon: '🃏', subtitle: 'Cartes & patience' },
  { key: 'mines', name: 'Démineur', icon: '💣', subtitle: 'Déminage tactique' },
  { key: 'arrows', name: 'Flèches', icon: '🏹', subtitle: 'Labyrinthe' },
  { key: 'hangman', name: 'Le Pendu', icon: '🎈', subtitle: 'Mots & déduction' },
  { key: 'sudoku', name: 'Sudoku', icon: '🔢', subtitle: 'Logique & chiffres' },
  { key: 'blockfantasy', name: 'Block Fantasy', icon: '🧱', subtitle: 'Lignes de blocs' },
  { key: 'impossible13', name: 'Impossible 13', icon: '1️⃣3️⃣', subtitle: 'Addition' },
  { key: 'bubblecool', name: 'Bubble Cool', icon: '🫧', subtitle: 'Tir de bulles' },
  { key: 'fireflies', name: 'Jardin Lucioles', icon: '✨', subtitle: 'Lumière zen' },
  { key: 'zenflow', name: 'Flux Zen', icon: '🌊', subtitle: 'Lignes & harmonie' },
  { key: 'symbolquest', name: 'Quête Symboles', icon: '🔍', subtitle: 'Symboles zen' },
];

/**
 * Composant standardisé d'entracte affiché sur les écrans de fin de niveau/victoire.
 * Offre la sélection tactile des mini-jeux d'entracte avec prévisualisation,
 * un CTA principal émeraude, un CTA aléatoire bleu et un bouton de continuation.
 */
export default function IntermissionProposal({
  onIntermissionRequest,
  upcomingIntermission = 'water',
  onSelectUpcomingIntermission,
  onShuffleUpcomingIntermission,
  intermissionConfig = {},
  intermissionGames = null,
  excludeGameKey = null,
  onContinue = null,
  continueText = 'Nouveau Niveau',
  showDirectContinue = false,
  customStyle = {}
}) {
  const [userSelectedUpcoming, setUserSelectedUpcoming] = useState(null);

  const isIntermissionEnabled = useMemo(() => {
    try {
      return localStorage.getItem('retrovision_intermission_enabled') !== 'false';
    } catch {
      return true;
    }
  }, []);

  const gamesPool = useMemo(() => {
    const pool = (intermissionGames && intermissionGames.length > 0)
      ? intermissionGames
      : FALLBACK_INTERMISSION_GAMES;
    if (!excludeGameKey) return pool;
    return pool.filter((g) => g.key !== excludeGameKey);
  }, [intermissionGames, excludeGameKey]);

  const availableIntermissionGames = useMemo(() => {
    const enabled = gamesPool.filter((g) => {
      const conf = intermissionConfig[g.key];
      if (conf && typeof conf.enabled === 'boolean') {
        return conf.enabled;
      }
      return true;
    });
    return enabled.length > 0 ? enabled : gamesPool;
  }, [gamesPool, intermissionConfig]);

  const currentUpcomingKey = userSelectedUpcoming || upcomingIntermission;
  const isCurrentUpcomingAvail = availableIntermissionGames.some(
    (g) => g.key === currentUpcomingKey
  );
  const effectiveSelectedUpcoming = isCurrentUpcomingAvail
    ? currentUpcomingKey
    : (availableIntermissionGames[0]?.key || 'water');

  const activeIntermissionGame = useMemo(() => {
    return (
      availableIntermissionGames.find((g) => g.key === effectiveSelectedUpcoming) ||
      availableIntermissionGames[0] ||
      gamesPool[0] ||
      FALLBACK_INTERMISSION_GAMES[0]
    );
  }, [availableIntermissionGames, effectiveSelectedUpcoming, gamesPool]);

  const handleLaunch = (key) => {
    sound.playClick();
    if (onIntermissionRequest) {
      onIntermissionRequest(key);
    }
  };

  const handleShuffle = () => {
    sound.playClick();
    const nextKey = onShuffleUpcomingIntermission
      ? onShuffleUpcomingIntermission()
      : (() => {
          const others = availableIntermissionGames.filter((g) => g.key !== effectiveSelectedUpcoming);
          const pool = others.length > 0 ? others : availableIntermissionGames;
          const key = pool[Math.floor(Math.random() * pool.length)]?.key || 'water';
          setUserSelectedUpcoming(key);
          if (onSelectUpcomingIntermission) onSelectUpcomingIntermission(key);
          return key;
        })();

    if (onIntermissionRequest && nextKey) {
      onIntermissionRequest(nextKey);
    }
  };

  return (
    <>
      <style>{`
        .intermission-strip-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .intermission-strip-scroll::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 4px;
        }
        .intermission-strip-scroll::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.4);
          border-radius: 4px;
        }
        .intermission-strip-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        @keyframes playIconBounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        .primary-play-icon {
          display: inline-flex;
          align-items: center;
          animation: playIconBounce 1.2s infinite ease-in-out;
        }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        margin: '0 auto',
        zIndex: 10,
        boxSizing: 'border-box',
        ...customStyle
      }}>
        {isIntermissionEnabled && availableIntermissionGames.length > 0 ? (
          <>
            {/* Label du strip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px',
              color: '#93C5FD',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.6px',
              textTransform: 'uppercase'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎮</span>
                <span>Mini-jeux d'entracte au choix :</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                {availableIntermissionGames.length} jeu{availableIntermissionGames.length > 1 ? 'x' : ''} {availableIntermissionGames.length > 3 ? '(défilement ↔)' : ''}
              </span>
            </div>

            {/* Strip horizontal avec vignettes */}
            <div
              className="intermission-strip-scroll"
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                padding: '8px 4px 12px 4px',
                width: '100%',
                boxSizing: 'border-box',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                background: 'rgba(15, 23, 42, 0.65)',
                borderRadius: '16px',
                border: '1.5px solid rgba(59, 130, 246, 0.3)',
                boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.4)'
              }}
            >
              {availableIntermissionGames.map((g) => {
                const isSelected = g.key === effectiveSelectedUpcoming;
                const gameConf = intermissionConfig[g.key] || {};
                const diff = gameConf.difficulty || 'facile';
                const diffColor = diff === 'facile' ? '#10B981' : diff === 'moyen' ? '#F59E0B' : '#EF4444';

                return (
                  <div
                    key={g.key}
                    onClick={() => {
                      sound.playClick();
                      setUserSelectedUpcoming(g.key);
                      if (onSelectUpcomingIntermission) onSelectUpcomingIntermission(g.key);
                    }}
                    onDoubleClick={() => {
                      sound.playClick();
                      setUserSelectedUpcoming(g.key);
                      if (onSelectUpcomingIntermission) onSelectUpcomingIntermission(g.key);
                      handleLaunch(g.key);
                    }}
                    style={{
                      flex: '0 0 135px',
                      height: '144px',
                      position: 'relative',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: isSelected
                        ? 'linear-gradient(145deg, rgba(14, 116, 144, 0.5), rgba(15, 23, 42, 0.96))'
                        : 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.92))',
                      border: isSelected ? '2.5px solid #38BDF8' : '1.5px solid rgba(255, 255, 255, 0.12)',
                      boxShadow: isSelected
                        ? '0 0 18px rgba(56, 189, 248, 0.6), inset 0 0 12px rgba(56, 189, 248, 0.2)'
                        : '0 4px 10px rgba(0, 0, 0, 0.3)',
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '6px 8px 8px 8px',
                      boxSizing: 'border-box',
                      scrollSnapAlign: 'start',
                      userSelect: 'none'
                    }}
                    title={`${g.name} - ${g.subtitle} (Difficulté : ${diff}) - Cliquez pour sélectionner`}
                  >
                    {/* Barre supérieure : Icône & Badge difficulté */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '3px' }}>
                      <span style={{ fontSize: '15px' }}>{g.icon}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          fontSize: '8px',
                          fontWeight: '800',
                          color: diffColor,
                          background: `${diffColor}22`,
                          border: `1px solid ${diffColor}55`,
                          borderRadius: '4px',
                          padding: '1px 4px',
                          textTransform: 'capitalize'
                        }}>
                          {diff}
                        </span>
                        {isSelected ? (
                          <span style={{
                            fontSize: '8px',
                            fontWeight: '900',
                            color: '#fff',
                            background: '#0284C7',
                            borderRadius: '4px',
                            padding: '1px 5px',
                            boxShadow: '0 0 8px #38BDF8'
                          }}>
                            ACTIF
                          </span>
                        ) : (
                          <span style={{ fontSize: '9px', color: '#64748B', fontWeight: '700' }}>
                            ▶
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Miniature du jeu */}
                    <div style={{
                      width: '100%',
                      height: '84px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: 'rgba(15, 23, 42, 0.5)',
                      border: isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <GameMiniature gameKey={g.key} width="100%" height="100%" />
                    </div>

                    {/* Titre du jeu */}
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: isSelected ? '#38BDF8' : '#F1F5F9',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '4px'
                    }}>
                      {g.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 1. CTA PRINCIPAL : Bouton émeraude éclatant */}
            <button
              onClick={() => handleLaunch(effectiveSelectedUpcoming)}
              className="retro-btn pulse-glow"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                border: '2.5px solid #6EE7B7',
                color: '#FFFFFF',
                width: '100%',
                fontWeight: '900',
                fontSize: '16px',
                padding: '13px 18px',
                borderRadius: '16px',
                boxShadow: '0 0 24px rgba(16, 185, 129, 0.65), 0 4px 16px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer',
                letterSpacing: '0.4px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontWeight: '900' }}>
                <span className="primary-play-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span>Aller vers l'Entracte</span>
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '1px'
              }}>
                <span style={{ color: '#D1FAE5', opacity: 0.95 }}>Jouer :</span>
                <span style={{
                  color: '#FDE047',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '2px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid rgba(253, 224, 71, 0.5)',
                  fontSize: '15px',
                  fontWeight: '900',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}>
                  <span>{activeIntermissionGame.icon}</span>
                  <span>{activeIntermissionGame.name}</span>
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#6EE7B7',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  fontWeight: '800',
                  textTransform: 'capitalize'
                }}>
                  ({intermissionConfig[activeIntermissionGame.key]?.difficulty || 'facile'})
                </span>
              </div>
            </button>

            {/* 2. CTA SECONDAIRE : Lancer un jeu aléatoire */}
            <button
              onClick={handleShuffle}
              className="retro-btn"
              style={{
                background: 'rgba(30, 41, 59, 0.75)',
                border: '1.5px solid rgba(96, 165, 250, 0.45)',
                color: '#93C5FD',
                width: '100%',
                fontWeight: '700',
                fontSize: '13.5px',
                padding: '9px 16px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.22)';
                e.currentTarget.style.borderColor = '#60A5FA';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.75)';
                e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.45)';
                e.currentTarget.style.color = '#93C5FD';
              }}
            >
              <span style={{ fontSize: '1.15rem' }}>🎲</span>
              <span>Lancer un jeu aléatoire</span>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>(Surprise)</span>
            </button>

            {/* 3. OPTION : Continuer sans entracte si souhaité */}
            {showDirectContinue && onContinue && (
              <button
                onClick={() => {
                  sound.playClick();
                  onContinue();
                }}
                className="retro-btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  width: '100%',
                  fontWeight: '600',
                  fontSize: '13px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Passer l'entracte & {continueText} ⏭
              </button>
            )}
          </>
        ) : (
          /* Si l'entracte est désactivée : Bouton principal de continuation classique */
          onContinue && (
            <button
              onClick={() => {
                sound.playClick();
                onContinue();
              }}
              className="retro-btn pulse-glow"
              style={{
                background: '#10b981',
                borderColor: '#10b981',
                color: '#ffffff',
                width: '100%',
                fontWeight: '800',
                fontSize: '15px',
                padding: '12px 14px',
                borderRadius: '12px',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              🔄 {continueText}
            </button>
          )
        )}
      </div>
    </>
  );
}
