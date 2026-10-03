import { useState, useEffect, useCallback } from 'react';
import GameHeader from '../components/GameHeader';
import GameIntro from '../components/GameIntro';
import IntermissionHeader from '../components/IntermissionHeader';
import { sound } from '../utils/sound';
import { storage } from '../utils/storage';
import { haptic } from '../utils/haptics';
import { randomChoice, shuffle } from '../utils/commonUtils';
import { useConfirm } from '../components/ConfirmContext';

// Dictionnaire de mots réconfortants et apaisants
const VOCABULARY = [
  'ZEN', 'PAIX', 'CALME', 'FLEUR', 'LUNE', 'JOIE', 'VENT', 'EAU', 'DOUX',
  'SOLEIL', 'JARDIN', 'ETOILE', 'NATURE', 'SEREINE', 'LUMIERE', 'HARMONIE'
];

const ENCOURAGEMENTS = [
  "Votre regard balaie les lettres avec calme et fluidité.",
  "Chaque mot révélé stimule agréablement votre lecture.",
  "Votre esprit s'oriente avec précision de gauche à droite.",
  "Bravo pour cette belle recherche lexicale !"
];

// Générateur de grille avec insertion de mots horizontaux et verticaux
const generateWordGrid = (wordsToPlace, size = 6) => {
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const placedWords = [];

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  wordsToPlace.forEach((word) => {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      attempts++;
      const isHorizontal = Math.random() < 0.6; // Favorise l'orientation horizontale de lecture
      const wordLen = word.length;

      if (isHorizontal) {
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * (size - wordLen + 1));
        let canPlace = true;

        for (let i = 0; i < wordLen; i++) {
          if (grid[r][c + i] !== '' && grid[r][c + i] !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          const cells = [];
          for (let i = 0; i < wordLen; i++) {
            grid[r][c + i] = word[i];
            cells.push({ r, c: c + i });
          }
          placedWords.push({ word, cells, found: false });
          placed = true;
        }
      } else {
        const r = Math.floor(Math.random() * (size - wordLen + 1));
        const c = Math.floor(Math.random() * size);
        let canPlace = true;

        for (let i = 0; i < wordLen; i++) {
          if (grid[r + i][c] !== '' && grid[r + i][c] !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          const cells = [];
          for (let i = 0; i < wordLen; i++) {
            grid[r + i][c] = word[i];
            cells.push({ r: r + i, c });
          }
          placedWords.push({ word, cells, found: false });
          placed = true;
        }
      }
    }
  });

  // Remplissage des cases restantes avec des lettres aléatoires
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return { grid, placedWords };
};

export default function MotsFlottants({
  onBack,
  onScoreSave,
  onLaunchIntermission,
  isIntermission = false,
  intermissionDifficulty = 'facile',
  onIntermissionComplete,
  onIntermissionRequest,
  replaySameIntermission,
  onToggleReplaySameIntermission,
  skipIntro = false
}) {
  const confirm = useConfirm();
  const [showIntro, setShowIntro] = useState(!skipIntro && !isIntermission);
  const [difficulty] = useState(() => {
    if (isIntermission) return intermissionDifficulty || 'facile';
    return storage.getItem('retrovision_mots_diff', 'moyen') || 'moyen';
  });

  const gridSize = difficulty === 'facile' ? 5 : 6;
  const wordsCount = isIntermission ? (difficulty === 'facile' ? 1 : 2) : 3;

  const [boardData, setBoardData] = useState(() => {
    const selected = shuffle(VOCABULARY.filter((w) => w.length <= gridSize)).slice(0, wordsCount);
    return generateWordGrid(selected, gridSize);
  });

  const [selectedStart, setSelectedStart] = useState(null); // { r, c }
  const [foundWords, setFoundWords] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [encouragement, setEncouragement] = useState('');

  // Initialisation d'une nouvelle grille
  const initGame = useCallback(() => {
    const selected = shuffle(VOCABULARY.filter((w) => w.length <= gridSize)).slice(0, wordsCount);
    setBoardData(generateWordGrid(selected, gridSize));
    setSelectedStart(null);
    setFoundWords([]);
    setIsWon(false);
    setEncouragement('');
  }, [gridSize, wordsCount]);

  useEffect(() => {
    if (!showIntro) {
      const timer = setTimeout(() => {
        initGame();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showIntro, initGame]);

  // Clic sur une case (sélection en 2 taps : premier tap = début, second tap = fin)
  const handleCellClick = (r, c) => {
    if (isWon) return;

    haptic.tap();

    if (!selectedStart) {
      // 1er tap : point de départ
      setSelectedStart({ r, c });
      sound.playClick();
      return;
    }

    // 2ème tap : vérification de la sélection linéaire
    const start = selectedStart;
    setSelectedStart(null);

    // Vérifier si le mot sélectionné correspond à l'un des mots placés
    const matchedWord = boardData.placedWords.find((item) => {
      if (foundWords.includes(item.word)) return false;
      const firstCell = item.cells[0];
      const lastCell = item.cells[item.cells.length - 1];

      // Vérification dans les deux sens (début->fin ou fin->début)
      const forwardMatch =
        start.r === firstCell.r && start.c === firstCell.c && r === lastCell.r && c === lastCell.c;
      const backwardMatch =
        start.r === lastCell.r && start.c === lastCell.c && r === firstCell.r && c === firstCell.c;

      return forwardMatch || backwardMatch;
    });

    if (matchedWord) {
      // Mot trouvé !
      sound.playScore();
      const updatedFound = [...foundWords, matchedWord.word];
      setFoundWords(updatedFound);

      if (updatedFound.length >= boardData.placedWords.length) {
        // Victoire finale !
        setIsWon(true);
        sound.playSudokuSuccess();
        setEncouragement(randomChoice(ENCOURAGEMENTS));
        if (onScoreSave) onScoreSave('motsflottants', updatedFound.length * 100);

        if (isIntermission && onIntermissionComplete) {
          if (replaySameIntermission) {
            if (onToggleReplaySameIntermission) onToggleReplaySameIntermission(false);
            setTimeout(() => initGame(), 1500);
          } else {
            setTimeout(() => onIntermissionComplete(true), 1200);
          }
        }
      }
    } else {
      sound.playClick();
    }
  };

  const handleBackWithConfirm = () => {
    if (confirm) {
      confirm('Voulez-vous retourner à l\'accueil ?', () => onBack());
    } else {
      onBack();
    }
  };

  // Cellules appartenant à des mots trouvés
  const isCellFound = (r, c) => {
    return boardData.placedWords.some(
      (item) => foundWords.includes(item.word) && item.cells.some((cell) => cell.r === r && cell.c === c)
    );
  };

  const progressRatio = Math.min(1, foundWords.length / (boardData.placedWords.length || 1));

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
      {/* Animation d'Intro avec bouton "JOUER" */}
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="Mots Flottants"
          icon="📖"
          colors={['#0284c7', '#0d9488', '#16a34a']}
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
            instructionText={`Trouvez ${boardData.placedWords.length} mot(s) apaisant(s) pour réussir l'entracte !`}
            onRestart={initGame}
            onOtherGame={onIntermissionRequest}
            onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
            replaySame={replaySameIntermission}
            onToggleReplaySame={onToggleReplaySameIntermission}
            progress={progressRatio}
          />
        ) : (
          <GameHeader
            title="MOTS FLOTTANTS"
            subtitle="Exploration visuelle & mots doux"
            onBack={handleBackWithConfirm}
            onRestart={initGame}
            showShop={false}
            onLaunchIntermission={onLaunchIntermission}
          />
        )}

        {/* Liste des mots à chercher (avec encadrement zen) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            width: '100%',
            margin: '12px 0 16px 0',
            padding: '12px 16px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}
        >
          {boardData.placedWords.map((item) => {
            const isDiscovered = foundWords.includes(item.word);

            return (
              <span
                key={item.word}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  background: isDiscovered ? '#dcfce7' : '#f1f5f9',
                  color: isDiscovered ? '#15803d' : '#334155',
                  border: `1.5px solid ${isDiscovered ? '#86efac' : '#cbd5e1'}`,
                  textDecoration: isDiscovered ? 'line-through' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {isDiscovered ? `✓ ${item.word}` : item.word}
              </span>
            );
          })}
        </div>

        {/* Grille de lettres (Style Tuiles claires avec bordure gauche renforcée) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gap: '8px',
            width: '100%',
            maxWidth: '460px',
            margin: '0 auto 20px auto',
            padding: '12px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '2px solid #cbd5e1',
            borderLeft: '6px solid #0284c7', // Ancrage gauche renforcé
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            boxSizing: 'border-box'
          }}
        >
          {boardData.grid.map((row, r) =>
            row.map((letter, c) => {
              const isStart = selectedStart && selectedStart.r === r && selectedStart.c === c;
              const isDiscovered = isCellFound(r, c);

              let cellBg = '#ffffff';
              let cellBorder = '#cbd5e1';
              let cellColor = '#0f172a';
              let cellShadow = '0 1px 0 #cbd5e1, 0 2px 0 #94a3b8';

              if (isDiscovered) {
                cellBg = '#dcfce7';
                cellBorder = '#86efac';
                cellColor = '#15803d';
                cellShadow = 'none';
              } else if (isStart) {
                cellBg = '#e0f2fe';
                cellBorder = '#0284c7';
                cellColor = '#0369a1';
                cellShadow = '0 0 10px rgba(2, 132, 199, 0.4)';
              } else if (c === 0) {
                cellBg = '#fafaf9';
              }

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  disabled={isWon}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    aspectRatio: '1 / 1',
                    minHeight: '52px',
                    borderRadius: '8px',
                    border: `1.5px solid ${cellBorder}`,
                    background: cellBg,
                    color: cellColor,
                    fontSize: '20px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: cellShadow,
                    transition: 'transform 0.1s ease, background 0.15s ease',
                    outline: 'none',
                    userSelect: 'none'
                  }}
                  aria-label={`Lettre ${letter}, ligne ${r + 1}, colonne ${c + 1}`}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>

        {/* Message d'aide au geste simple */}
        <div style={{ fontSize: '12.5px', color: '#64748b', textAlign: 'center', marginBottom: '16px' }}>
          💡 Touchez la première lettre du mot, puis la dernière lettre pour le valider.
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
            🌸 {encouragement || "Bravo ! Tous les mots ont été retrouvés avec sérénité."}
          </div>
        )}

        {/* Bouton de réinitialisation */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button
            type="button"
            onClick={initGame}
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
            🔄 Nouvelle grille
          </button>
        </div>
      </div>
    </div>
  );
}
