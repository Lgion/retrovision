import { useState, useEffect, useCallback, useMemo } from 'react';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';
import { storage } from '../utils/storage';
import { randomChoice } from '../utils/commonUtils';
import GameHeader from '../components/GameHeader';
import GameIntro from '../components/GameIntro';
import IntermissionHeader from '../components/IntermissionHeader';
import IntermissionProposal from '../components/IntermissionProposal';
import { useConfirm } from '../components/ConfirmContext';

const WINNING_COMBOS = [
  // Lignes
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Colonnes
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonales
  [0, 4, 8],
  [2, 4, 6]
];

// Vérifie si un joueur a gagné
const checkWinner = (board) => {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: 'draw', line: null };
  }
  return null;
};

// Algorithme Minimax pour l'IA en difficulté difficile
const minimax = (newBoard, depth, isMaximizing) => {
  const result = checkWinner(newBoard);
  if (result) {
    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (result.winner === 'draw') return 0;
  }
  if (depth >= 5) return 0; // Profondeur maximale de réflexion

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === null) {
        newBoard[i] = 'O';
        const score = minimax(newBoard, depth + 1, false);
        newBoard[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === null) {
        newBoard[i] = 'X';
        const score = minimax(newBoard, depth + 1, true);
        newBoard[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

// Choix du coup de l'IA selon la difficulté
const getAIMove = (board, difficulty) => {
  const emptyIndices = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((v) => v !== null);

  if (emptyIndices.length === 0) return null;

  // 1. Difficulté Facile : 80% aléatoire, 20% coup intelligent
  if (difficulty === 'facile') {
    if (Math.random() < 0.8) {
      return randomChoice(emptyIndices);
    }
  }

  // 2. Coup gagnant immédiat ou blocage immédiat (Facile 20%, Moyen 100%, Difficile 100%)
  // A. IA peut-elle gagner ce tour ?
  for (const idx of emptyIndices) {
    const copy = [...board];
    copy[idx] = 'O';
    if (checkWinner(copy)?.winner === 'O') {
      return idx;
    }
  }

  // B. Bloquer le joueur s'il gagne au tour suivant
  for (const idx of emptyIndices) {
    const copy = [...board];
    copy[idx] = 'X';
    if (checkWinner(copy)?.winner === 'X') {
      return idx;
    }
  }

  // 3. Difficulté Moyenne : privilégier le centre, puis coins, puis aléatoire
  if (difficulty === 'moyen') {
    if (board[4] === null && Math.random() < 0.7) return 4;
    const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
    if (corners.length > 0 && Math.random() < 0.5) return randomChoice(corners);
    return randomChoice(emptyIndices);
  }

  // 4. Difficulté Difficile (Minimax optimal)
  let bestScore = -Infinity;
  let move = emptyIndices[0];
  for (const idx of emptyIndices) {
    const copy = [...board];
    copy[idx] = 'O';
    const score = minimax(copy, 0, false);
    if (score > bestScore) {
      bestScore = score;
      move = idx;
    }
  }
  return move;
};

export default function Morpion({
  onBack,
  onScoreSave,
  isIntermission = false,
  intermissionDifficulty = 'facile',
  onIntermissionComplete,
  onIntermissionRequest,
  replaySameIntermission,
  onToggleReplaySameIntermission,
  upcomingIntermission,
  onSelectUpcomingIntermission,
  onShuffleUpcomingIntermission,
  intermissionConfig,
  intermissionGames,
  skipIntro = false,
  onLaunchIntermission
}) {
  const confirm = useConfirm();

  // Écran d'intro avec animation et bouton "JOUER"
  const [showIntro, setShowIntro] = useState(!skipIntro && !isIntermission);

  // Mode de jeu : 'ai' (solo contre IA) ou 'pvp' (2 joueurs en local)
  const [gameMode, setGameMode] = useState(() => (isIntermission ? 'ai' : 'ai'));

  // Niveau d'IA
  const [difficulty, setDifficulty] = useState(() => {
    if (isIntermission) {
      return intermissionDifficulty || 'facile';
    }
    return storage.getItem('retrovision_morpion_diff', 'moyen') || 'moyen';
  });

  // Mode entracte : dynamique
  const targetIntermissionRounds = intermissionConfig?.morpion?.roundsCount || 5;
  const [intermissionRound, setIntermissionRound] = useState(1);
  const [intermissionWonRounds, setIntermissionWonRounds] = useState(0);

  // État du plateau : 9 cases
  const [board, setBoard] = useState(Array(9).fill(null));

  // Tour : 'X' commence toujours
  const [turn, setTurn] = useState('X');

  // Fin de partie
  const [result, setResult] = useState(null); // { winner: 'X'|'O'|'draw', line: number[]|null }
  // Tour de l'IA calculé automatiquement (sans setState dans l'effet)
  const isAiThinking = gameMode === 'ai' && turn === 'O' && !result;

  // Scores de session
  const [scores, setScores] = useState(() => {
    return storage.getJSON('retrovision_morpion_scores', { player: 0, ai: 0, draws: 0 });
  });

  // Réinitialiser la grille
  const resetRound = useCallback(() => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setResult(null);
  }, []);

  // Changement de difficulté (hors entracte)
  const handleSelectDifficulty = (newDiff) => {
    setDifficulty(newDiff);
    storage.setItem('retrovision_morpion_diff', newDiff);
    sound.playClick();
    resetRound();
  };

  // Changement de mode Solo / Duo
  const handleToggleGameMode = (newMode) => {
    setGameMode(newMode);
    sound.playClick();
    resetRound();
  };

  // Quitter avec confirmation
  const handleBackWithConfirm = async () => {
    const hasMoves = board.some((c) => c !== null);
    if (hasMoves && !result) {
      const ok = await confirm({
        title: 'Quitter le Morpion ?',
        message: 'Une partie est actuellement en cours. Voulez-vous vraiment revenir au menu ?',
        confirmText: 'Oui, quitter',
        cancelText: 'Continuer à jouer',
        confirmVariant: 'danger'
      });
      if (ok) {
        sound.stopBGM?.();
        onBack();
      }
    } else {
      sound.stopBGM?.();
      onBack();
    }
  };

  // Jouer un coup
  const makeMove = useCallback(
    (index, playerSymbol) => {
      if (board[index] !== null || result !== null) return;
      if (playerSymbol === 'X' && isAiThinking) return;

      const newBoard = [...board];
      newBoard[index] = playerSymbol;
      setBoard(newBoard);

      // Son et retour haptique
      const isLeft = index % 3 === 0;
      sound.playPentatonicNote(playerSymbol === 'X' ? (isLeft ? 4 : 2) : 1, isLeft);
      haptic.tap();

      const gameEnd = checkWinner(newBoard);
      if (gameEnd) {
        setResult(gameEnd);

        if (gameEnd.winner === 'X') {
          sound.playPowerup?.();
          haptic.success();
          setScores((prev) => {
            const next = { ...prev, player: prev.player + 1 };
            storage.setJSON('retrovision_morpion_scores', next);
            return next;
          });
          onScoreSave?.('morpion', 100);

          if (isIntermission) {
            const nextWon = intermissionWonRounds + 1;
            setIntermissionWonRounds(nextWon);
            if (intermissionRound >= targetIntermissionRounds) {
              if (onIntermissionComplete) {
                if (replaySameIntermission) {
                  if (onToggleReplaySameIntermission) onToggleReplaySameIntermission(false);
                  setTimeout(() => {
                    setIntermissionRound(1);
                    setIntermissionWonRounds(0);
                    resetRound();
                  }, 1200);
                  return;
                }
                setTimeout(() => onIntermissionComplete(true), 1200);
              }
            } else {
              setTimeout(() => {
                setIntermissionRound((r) => r + 1);
                resetRound();
              }, 1200);
            }
          }
        } else if (gameEnd.winner === 'O') {
          sound.playExplosion?.();
          setScores((prev) => {
            const next = { ...prev, ai: prev.ai + 1 };
            storage.setJSON('retrovision_morpion_scores', next);
            return next;
          });
          // Si en entracte et défaite de la manche, on passe à la manche suivante (ou fin de l'entracte si 5ème manche)
          if (isIntermission) {
            if (intermissionRound >= targetIntermissionRounds) {
              if (onIntermissionComplete) {
                setTimeout(() => onIntermissionComplete(true), 1500);
              }
            } else {
              setTimeout(() => {
                setIntermissionRound((r) => r + 1);
                resetRound();
              }, 1400);
            }
          }
        } else {
          // Égalité (Match nul)
          sound.playPop?.();
          setScores((prev) => {
            const next = { ...prev, draws: prev.draws + 1 };
            storage.setJSON('retrovision_morpion_scores', next);
            return next;
          });
          // En entracte : match nul compte comme manche jouée
          if (isIntermission) {
            if (intermissionRound >= targetIntermissionRounds) {
              if (onIntermissionComplete) {
                setTimeout(() => onIntermissionComplete(true), 1400);
              }
            } else {
              setTimeout(() => {
                setIntermissionRound((r) => r + 1);
                resetRound();
              }, 1400);
            }
          }
        }
      } else {
        // Changement de tour
        setTurn(playerSymbol === 'X' ? 'O' : 'X');
      }
    },
    [
      board,
      result,
      isAiThinking,
      isIntermission,
      intermissionRound,
      intermissionWonRounds,
      targetIntermissionRounds,
      onIntermissionComplete,
      onScoreSave,
      replaySameIntermission,
      onToggleReplaySameIntermission,
      resetRound
    ]
  );

  // Tour de l'IA (quand gameMode === 'ai' et turn === 'O')
  useEffect(() => {
    if (gameMode === 'ai' && turn === 'O' && !result) {
      const timer = setTimeout(() => {
        const move = getAIMove(board, difficulty);
        if (move !== null) {
          makeMove(move, 'O');
        }
      }, 450); // Pause naturelle et humaine de 450ms
      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, result, board, difficulty, makeMove]);

  // En entracte, progression = (manches terminées) / 5
  const intermissionProgress = useMemo(() => {
    const finishedRounds = result ? intermissionRound : intermissionRound - 1;
    return Math.min(1, finishedRounds / targetIntermissionRounds);
  }, [result, intermissionRound, targetIntermissionRounds]);

  return (
    <div
      className="morpion-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100%',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '12px 16px',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      <style>{`
        .morpion-cell {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.75);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          cursor: pointer;
          user-select: none;
          outline: none;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          aspect-ratio: 1 / 1;
        }
        .morpion-cell:active:not(:disabled) {
          transform: scale(0.94);
        }
        .morpion-cell-left {
          border-left: 3px solid rgba(0, 240, 255, 0.45);
        }
        .morpion-cell-winning {
          background: rgba(245, 158, 11, 0.25) !important;
          border-color: #f59e0b !important;
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35) !important;
          animation: win-pulse 0.9s ease-in-out infinite alternate;
        }
        @keyframes win-pulse {
          from { transform: scale(1); }
          to { transform: scale(1.04); }
        }
        @keyframes symbol-pop {
          0% { transform: scale(0.2) rotate(-15deg); opacity: 0; }
          70% { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .symbol-x {
          color: #38bdf8;
          animation: symbol-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-weight: 900;
          font-family: 'Orbitron', sans-serif;
          line-height: 1;
        }
        .symbol-o {
          color: #f43f5e;
          animation: symbol-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-weight: 900;
          font-family: 'Orbitron', sans-serif;
          line-height: 1;
        }
        .left-beacon {
          position: absolute;
          left: 4px;
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: 4px;
          background: linear-gradient(180deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 240, 255, 0.8) 50%, rgba(0, 240, 255, 0.1) 100%);
          pointer-events: none;
        }
      `}</style>

      {/* Animation d'Intro avec bouton "JOUER" */}
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="Morpion Néon"
          icon="❌⭕"
          colors={['#00f0ff', '#f43f5e', '#3b82f6']}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* En-tête : Entracte ou Standard */}
      {isIntermission ? (
        <div style={{ width: '100%', marginBottom: '10px' }}>
          <IntermissionHeader
            instructionText={`Disputez un match de ${targetIntermissionRounds} manches contre l'IA ! (Manche ${intermissionRound}/${targetIntermissionRounds})`}
            onRestart={() => {
              setIntermissionRound(1);
              setIntermissionWonRounds(0);
              resetRound();
            }}
            onOtherGame={onIntermissionRequest}
            onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
            replaySame={replaySameIntermission}
            onToggleReplaySame={onToggleReplaySameIntermission}
            progress={intermissionProgress}
          />
        </div>
      ) : (
        <div style={{ width: '100%', marginBottom: '10px' }}>
          <GameHeader
            title="MORPION NÉON"
            onBack={handleBackWithConfirm}
            onRestart={resetRound}
            showShop={false}
            onLaunchIntermission={onLaunchIntermission}
            centerContent={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    color: '#cbd5e1',
                    background: 'rgba(255,255,255,0.06)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {gameMode === 'ai' ? `IA • ${difficulty.toUpperCase()}` : '2 JOUEURS'}
                </span>
              </div>
            }
          />
        </div>
      )}

      {/* Panneau de configuration (Hors Entracte) */}
      {!isIntermission && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            width: '100%',
            marginBottom: '14px',
            background: 'rgba(15, 23, 42, 0.65)',
            padding: '8px 12px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Mode de Jeu */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => handleToggleGameMode('ai')}
              className="retro-btn"
              style={{
                minHeight: '44px',
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '10px',
                background: gameMode === 'ai' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                borderColor: gameMode === 'ai' ? '#00f0ff' : 'rgba(255,255,255,0.15)',
                color: gameMode === 'ai' ? '#00f0ff' : '#94a3b8'
              }}
            >
              🤖 Solo IA
            </button>
            <button
              onClick={() => handleToggleGameMode('pvp')}
              className="retro-btn"
              style={{
                minHeight: '44px',
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '10px',
                background: gameMode === 'pvp' ? 'rgba(255, 0, 127, 0.2)' : 'transparent',
                borderColor: gameMode === 'pvp' ? '#ff007f' : 'rgba(255,255,255,0.15)',
                color: gameMode === 'pvp' ? '#ff007f' : '#94a3b8'
              }}
            >
              👥 2 Joueurs
            </button>
          </div>

          {/* Difficulté IA (si mode solo) */}
          {gameMode === 'ai' && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {['facile', 'moyen', 'difficile'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleSelectDifficulty(lvl)}
                  className="retro-btn"
                  style={{
                    minHeight: '44px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    borderRadius: '8px',
                    textTransform: 'capitalize',
                    background: difficulty === lvl ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                    borderColor: difficulty === lvl ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                    color: difficulty === lvl ? '#f59e0b' : '#64748b'
                  }}
                >
                  {lvl === 'difficile' ? 'Expert' : lvl}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tableau des Scores */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '100%',
          padding: '10px 14px',
          marginBottom: '14px',
          background: 'rgba(15, 23, 42, 0.85)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#00f0ff', fontWeight: '700' }}>
            {gameMode === 'ai' ? 'Vous (✕)' : 'Joueur 1 (✕)'}
          </div>
          <div style={{ fontSize: '1.4rem', color: '#ffffff', fontWeight: '900', fontFamily: 'Orbitron, sans-serif' }}>
            {scores.player}
          </div>
        </div>

        <div style={{ textAlign: 'center', opacity: 0.7 }}>
          <div style={{ fontSize: '0.75rem', color: isIntermission ? '#38bdf8' : '#94a3b8', fontWeight: '600' }}>
            {isIntermission ? `Manche ${intermissionRound}/${targetIntermissionRounds}` : 'Nuls'}
          </div>
          <div style={{ fontSize: '1.1rem', color: '#cbd5e1', fontWeight: '800' }}>
            {isIntermission ? `${intermissionWonRounds} vic.` : scores.draws}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#ff007f', fontWeight: '700' }}>
            {gameMode === 'ai' ? 'IA (○)' : 'Joueur 2 (○)'}
          </div>
          <div style={{ fontSize: '1.4rem', color: '#ffffff', fontWeight: '900', fontFamily: 'Orbitron, sans-serif' }}>
            {scores.ai}
          </div>
        </div>
      </div>

      {/* Indicateur de Tour Actuel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: result
            ? 'rgba(245, 158, 11, 0.15)'
            : turn === 'X'
            ? 'rgba(0, 240, 255, 0.12)'
            : 'rgba(255, 0, 127, 0.12)',
          border: `1px solid ${
            result ? '#f59e0b' : turn === 'X' ? 'rgba(0,240,255,0.4)' : 'rgba(255,0,127,0.4)'
          }`
        }}
      >
        {result ? (
          <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#f59e0b' }}>
            {result.winner === 'X'
              ? '🎉 Victoire de ✕ !'
              : result.winner === 'O'
              ? '✨ Victoire de ○ !'
              : '🤝 Match Nul !'}
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: '700',
              color: turn === 'X' ? '#00f0ff' : '#ff007f'
            }}
          >
            {isAiThinking
              ? "L'IA réfléchit..."
              : turn === 'X'
              ? gameMode === 'ai'
                ? 'À vous de jouer (✕)'
                : 'Tour du Joueur 1 (✕)'
              : gameMode === 'ai'
              ? "Tour de l'IA (○)"
              : 'Tour du Joueur 2 (○)'}
          </span>
        )}
      </div>

      {/* Grille 3x3 */}
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '10px',
          width: '100%',
          maxWidth: '360px',
          padding: '12px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.85) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Balise lumineuse gauche (stimulation champ gauche) */}
        <div className="left-beacon" />

        {board.map((cellValue, idx) => {
          const isWinning = result?.line?.includes(idx);
          const isLeft = idx % 3 === 0;

          return (
            <button
              key={idx}
              disabled={cellValue !== null || result !== null || isAiThinking}
              onClick={() => makeMove(idx, turn)}
              className={`morpion-cell ${isLeft ? 'morpion-cell-left' : ''} ${
                isWinning ? 'morpion-cell-winning' : ''
              }`}
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 3.4rem)'
              }}
              aria-label={`Case ${idx + 1}`}
            >
              {cellValue === 'X' && <span className="symbol-x">✕</span>}
              {cellValue === 'O' && <span className="symbol-o">○</span>}
            </button>
          );
        })}
      </div>

      {/* Boutons d'Action au Bas */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px',
          width: '100%',
          maxWidth: '360px',
          justifyContent: 'center'
        }}
      >
        <button
          onClick={resetRound}
          className="retro-btn pulse-glow"
          style={{
            flex: 1,
            minHeight: '48px',
            padding: '12px 20px',
            borderRadius: '16px',
            fontSize: '15px',
            fontWeight: '800',
            borderColor: '#00f0ff',
            color: '#00f0ff',
            background: 'rgba(0, 240, 255, 0.1)'
          }}
        >
          🔄 Recommencer
        </button>

        {isIntermission && (
          <button
            onClick={() => onIntermissionComplete && onIntermissionComplete(false)}
            className="retro-btn"
            style={{
              minHeight: '48px',
              padding: '12px 18px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '700',
              borderColor: 'rgba(239, 68, 68, 0.5)',
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.1)'
            }}
          >
            Passer ⏭
          </button>
        )}
      </div>

      {/* Écran de Victoire Standard avec Proposition d'Entracte */}
      {!isIntermission && result?.winner === 'X' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 8, 19, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              border: '2px solid #00f0ff',
              borderRadius: '24px',
              padding: '28px 24px',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🏆</div>
            <h2 style={{ color: '#00f0ff', margin: '0 0 8px 0', fontSize: '1.6rem', fontWeight: '900' }}>
              VICTOIRE !
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: '0 0 20px 0' }}>
              Magnifique alignement ! Vous remportez la manche.
            </p>

            <IntermissionProposal
              onIntermissionRequest={onIntermissionRequest}
              upcomingIntermission={upcomingIntermission}
              onSelectUpcomingIntermission={onSelectUpcomingIntermission}
              onShuffleUpcomingIntermission={onShuffleUpcomingIntermission}
              intermissionConfig={intermissionConfig}
              intermissionGames={intermissionGames}
              excludeGameKey="morpion"
              onContinue={resetRound}
              continueText="Nouvelle Partie"
              showDirectContinue={true}
              customStyle={{ marginBottom: '14px' }}
            />

            <button
              onClick={resetRound}
              className="retro-btn"
              style={{
                width: '100%',
                minHeight: '48px',
                borderRadius: '14px',
                borderColor: '#00f0ff',
                color: '#00f0ff',
                fontSize: '15px',
                fontWeight: '800'
              }}
            >
              Rejouer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
