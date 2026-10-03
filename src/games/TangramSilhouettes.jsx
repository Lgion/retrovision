import { useState, useCallback } from 'react';
import GameHeader from '../components/GameHeader';
import GameIntro from '../components/GameIntro';
import IntermissionHeader from '../components/IntermissionHeader';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';
import { randomChoice } from '../utils/commonUtils';
import { useConfirm } from '../components/ConfirmContext';

// Silhouettes géométriques adaptées à la rééducation constructive
const SILHOUETTES = [
  {
    id: 'maison',
    name: 'Maison Zen',
    icon: '🏡',
    description: 'Toit protecteur et base solide',
    slots: [
      { id: 'roof_left', type: 'triangle', color: '#c2410c', label: 'Toit Gauche', path: 'M 40 100 L 150 10 L 150 100 Z', isLeft: true },
      { id: 'roof_right', type: 'triangle', color: '#d97706', label: 'Toit Droit', path: 'M 150 10 L 260 100 L 150 100 Z', isLeft: false },
      { id: 'wall_left', type: 'square', color: '#0284c7', label: 'Façade Gauche', path: 'M 40 100 L 150 100 L 150 210 L 40 210 Z', isLeft: true },
      { id: 'wall_right', type: 'square', color: '#166534', label: 'Façade Droite', path: 'M 150 100 L 260 100 L 260 210 L 150 210 Z', isLeft: false }
    ]
  },
  {
    id: 'bateau',
    name: 'Bateau Paisible',
    icon: '⛵',
    description: 'Voilure au gré du vent',
    slots: [
      { id: 'sail_left', type: 'triangle', color: '#0284c7', label: 'Grande Voile', path: 'M 60 140 L 150 20 L 150 140 Z', isLeft: true },
      { id: 'sail_right', type: 'triangle', color: '#7c3aed', label: 'Petite Voile', path: 'M 150 50 L 230 140 L 150 140 Z', isLeft: false },
      { id: 'hull_left', type: 'triangle', color: '#c2410c', label: 'Proue Gauche', path: 'M 20 160 L 90 220 L 90 160 Z', isLeft: true },
      { id: 'hull_center', type: 'square', color: '#166534', label: 'Coque Centrale', path: 'M 90 160 L 210 160 L 210 220 L 90 220 Z', isLeft: false }
    ]
  },
  {
    id: 'sapin',
    name: 'Sapin des Monts',
    icon: '🌲',
    description: 'Symétrie et élévation',
    slots: [
      { id: 'branch_top', type: 'triangle', color: '#166534', label: 'Cime', path: 'M 70 80 L 150 15 L 230 80 Z', isLeft: false },
      { id: 'branch_mid', type: 'triangle', color: '#15803d', label: 'Rameau', path: 'M 50 145 L 150 75 L 250 145 Z', isLeft: false },
      { id: 'branch_base', type: 'triangle', color: '#047857', label: 'Base des Aiguilles', path: 'M 30 205 L 150 135 L 270 205 Z', isLeft: true },
      { id: 'trunk', type: 'square', color: '#854d0e', label: 'Tronc', path: 'M 125 205 L 175 205 L 175 245 L 125 245 Z', isLeft: false }
    ]
  }
];

const ENCOURAGEMENTS = [
  "Vos mains et vos repères spatiaux s'harmonisent admirablement.",
  "Chaque forme imbriquée redonne vie à la silhouette avec élégance.",
  "Votre perception de l'espace et des volumes est remarquable.",
  "Bravo pour cette belle recomposition architecturale !"
];

export default function TangramSilhouettes({
  onBack,
  onScoreSave,
  onLaunchIntermission,
  isIntermission = false,
  onIntermissionComplete,
  onIntermissionRequest,
  replaySameIntermission,
  onToggleReplaySameIntermission,
  skipIntro = false
}) {
  const confirm = useConfirm();
  const [showIntro, setShowIntro] = useState(!skipIntro && !isIntermission);
  const [currentSilhouetteIndex, setCurrentSilhouetteIndex] = useState(() => {
    return Math.floor(Math.random() * SILHOUETTES.length);
  });

  const activeSilhouette = SILHOUETTES[currentSilhouetteIndex] || SILHOUETTES[0];
  const [placedSlotIds, setPlacedSlotIds] = useState([]);
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [isWon, setIsWon] = useState(false);
  const [encouragement, setEncouragement] = useState('');

  // Pièces disponibles dans la réserve (celles qui ne sont pas encore posées)
  const remainingPieces = activeSilhouette.slots.filter((s) => !placedSlotIds.includes(s.id));

  // Initialisation d'une nouvelle silhouette
  const initGame = useCallback((newIndex = null) => {
    if (newIndex !== null) {
      setCurrentSilhouetteIndex(newIndex);
    } else {
      setCurrentSilhouetteIndex((prev) => (prev + 1) % SILHOUETTES.length);
    }
    setPlacedSlotIds([]);
    setSelectedPieceId(null);
    setIsWon(false);
    setEncouragement('');
  }, []);

  // Clic sur une pièce de la réserve (1er tap)
  const handlePieceSelect = (pieceId) => {
    if (isWon) return;
    haptic.tap();
    sound.playClick();
    setSelectedPieceId((prev) => (prev === pieceId ? null : pieceId));
  };

  // Clic sur un emplacement de la silhouette (2ème tap)
  const handleSlotClick = (slot) => {
    if (isWon || placedSlotIds.includes(slot.id)) return;

    if (!selectedPieceId) {
      // Si aucune pièce n'était présélectionnée, sélectionne automatiquement la pièce correspondante si elle est libre
      setSelectedPieceId(slot.id);
      sound.playClick();
      return;
    }

    if (selectedPieceId === slot.id) {
      // Emplacement valide !
      haptic.tap();
      sound.playScore();
      const updated = [...placedSlotIds, slot.id];
      setPlacedSlotIds(updated);
      setSelectedPieceId(null);

      if (updated.length >= activeSilhouette.slots.length) {
        // Silhouette complète !
        setIsWon(true);
        sound.playSudokuSuccess();
        setEncouragement(randomChoice(ENCOURAGEMENTS));
        if (onScoreSave) onScoreSave('tangram', 100);

        if (isIntermission && onIntermissionComplete) {
          if (replaySameIntermission) {
            if (onToggleReplaySameIntermission) onToggleReplaySameIntermission(false);
            setTimeout(() => initGame(currentSilhouetteIndex), 1500);
          } else {
            setTimeout(() => onIntermissionComplete(true), 1200);
          }
        }
      }
    } else {
      // Mauvais emplacement : petit retour haptique
      sound.playClick();
      setSelectedPieceId(null);
    }
  };

  const handleBackWithConfirm = async () => {
    if (placedSlotIds.length > 0 && !isWon) {
      if (confirm) {
        const ok = await confirm({
          title: 'Quitter le Tangram ?',
          message: 'Voulez-vous vraiment quitter la figure en cours ?',
          confirmText: 'Oui, quitter',
          cancelText: 'Continuer à jouer',
          confirmVariant: 'danger'
        });
        if (ok) onBack();
      } else {
        onBack();
      }
    } else {
      onBack();
    }
  };

  const progressRatio = Math.min(1, placedSlotIds.length / (activeSilhouette.slots.length || 1));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        padding: '16px',
        color: '#0f172a',
        background: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative'
      }}
    >
      {/* Intro Animation avec bouton JOUER */}
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="Tangram des Silhouettes"
          icon="🧩"
          colors={['#0284c7', '#c2410c', '#166534']}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Repère d'ancrage visuel gauche - Ligne solide sobre bleu médical */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '5px',
          background: '#0284c7',
          zIndex: 40,
          pointerEvents: 'none'
        }}
      />

      <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* En-tête : Intermission ou Standard */}
        {isIntermission ? (
          <IntermissionHeader
            instructionText={`Assemblez les formes de ${activeSilhouette.name} !`}
            onRestart={() => initGame(currentSilhouetteIndex)}
            onOtherGame={onIntermissionRequest}
            onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
            replaySame={replaySameIntermission}
            onToggleReplaySame={onToggleReplaySameIntermission}
            progress={progressRatio}
          />
        ) : (
          <GameHeader
            title="TANGRAM DES SILHOUETTES"
            subtitle="Assemblage spatial & motricité zen"
            onBack={handleBackWithConfirm}
            onRestart={() => initGame(currentSilhouetteIndex)}
            showShop={false}
            onLaunchIntermission={onLaunchIntermission}
          />
        )}

        {/* Barre d'indication de silhouette */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: '12px',
            margin: '12px 0 16px 0',
            padding: '12px 16px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>{activeSilhouette.icon}</span>
            <div>
              <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                {activeSilhouette.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {activeSilhouette.description}
              </div>
            </div>
          </div>

          <div style={{ fontWeight: '800', fontSize: '14px', color: '#0284c7' }}>
            {placedSlotIds.length} / {activeSilhouette.slots.length} pièces
          </div>
        </div>

        {/* Espace de la Silhouette (SVG interactif avec ancre gauche renforcée) */}
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '2px solid #cbd5e1',
            borderLeft: '6px solid #0284c7', // Ancrage gauche renforcé pour héminégligence
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            boxSizing: 'border-box',
            marginBottom: '20px'
          }}
        >
          <svg
            viewBox="0 0 300 260"
            style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
          >
            {/* Emplacements de la silhouette */}
            {activeSilhouette.slots.map((slot) => {
              const isPlaced = placedSlotIds.includes(slot.id);
              const isTargeted = selectedPieceId === slot.id;

              return (
                <path
                  key={slot.id}
                  d={slot.path}
                  fill={isPlaced ? slot.color : isTargeted ? '#e0f2fe' : '#f8fafc'}
                  stroke={isPlaced ? '#1e293b' : isTargeted ? '#0284c7' : '#94a3b8'}
                  strokeWidth={isTargeted ? '3' : isPlaced ? '2' : '1.5'}
                  strokeDasharray={isPlaced ? 'none' : '4 4'}
                  onClick={() => handleSlotClick(slot)}
                  style={{
                    cursor: isPlaced ? 'default' : 'pointer',
                    transition: 'fill 0.2s ease, stroke 0.2s ease'
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Réserve des pièces à placer (style Tuiles claires) */}
        <div style={{ width: '100%', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textAlign: 'center' }}>
            {remainingPieces.length > 0
              ? 'Touchez une pièce ci-dessous, puis touchez son emplacement sur le dessin :'
              : 'Toutes les pièces sont posées !'}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              width: '100%'
            }}
          >
            {remainingPieces.map((piece) => {
              const isSelected = selectedPieceId === piece.id;

              return (
                <button
                  key={piece.id}
                  type="button"
                  onClick={() => handlePieceSelect(piece.id)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: `2px solid ${isSelected ? '#0284c7' : '#cbd5e1'}`,
                    borderLeft: piece.isLeft ? '4px solid #0284c7' : `2px solid ${isSelected ? '#0284c7' : '#cbd5e1'}`,
                    background: isSelected ? '#e0f2fe' : '#ffffff',
                    color: '#0f172a',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: isSelected
                      ? '0 0 10px rgba(2, 132, 199, 0.4)'
                      : '0 1px 0 #cbd5e1, 0 2px 0 #94a3b8',
                    transition: 'transform 0.1s ease, box-shadow 0.15s ease',
                    transform: isSelected ? 'scale(1.05)' : 'none'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      borderRadius: piece.type === 'square' ? '2px' : '50%',
                      background: piece.color,
                      marginRight: '8px'
                    }}
                  />
                  {piece.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message de victoire bienveillant */}
        {isWon && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '2px solid #86efac',
              color: '#166534',
              fontSize: '15px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '20px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            🌸 {encouragement || "Félicitations ! Vous avez reconstruit la silhouette avec une belle précision."}
          </div>
        )}

        {/* Bouton de changement de silhouette */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%' }}>
          <button
            type="button"
            onClick={() => initGame()}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            🎲 Autre silhouette
          </button>
        </div>
      </div>
    </div>
  );
}
