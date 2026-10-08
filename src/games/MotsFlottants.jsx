import { useState, useEffect, useCallback } from 'react';
import GameHeader from '../components/GameHeader';
import GameIntro from '../components/GameIntro';
import IntermissionHeader from '../components/IntermissionHeader';
import GameVictoryOverlay from '../components/GameVictoryOverlay';
import { sound } from '../utils/sound';
import { storage } from '../utils/storage';
import { getGameConfig, updateGameConfig } from '../utils/config';
import { haptic } from '../utils/haptics';
import { randomChoice, shuffle } from '../utils/commonUtils';
import { useConfirm } from '../components/ConfirmContext';
import MotsFlottantsCollection from './MotsFlottantsCollection';

// Dictionnaire de mots réconfortants et apaisants
const VOCABULARY = [
  'ZEN', 'PAIX', 'CALME', 'FLEUR', 'LUNE', 'JOIE', 'VENT', 'EAU', 'DOUX',
  'SOLEIL', 'JARDIN', 'ETOILE', 'NATURE', 'SEREIN', 'LUMIERE', 'HARMONIE',
  'AUBE', 'AIR', 'ARBRE', 'BEAU', 'BIEN', 'BOIS', 'BRISE', 'CIEL', 'COEUR',
  'NUAGE', 'ONDE', 'OR', 'PUR', 'REPOS', 'ROSE', 'SAGE', 'SAIN', 'LENT',
  'LIRE', 'MER', 'MIEL', 'MUR', 'NID', 'NUIT', 'OISEAU', 'OMBRE', 'ORME',
  'PLUME', 'PONT', 'PORT', 'PRE', 'RAYON', 'RIVE', 'ROCHE', 'SABLE',
  'SAUGE', 'SOIE', 'SOURCE', 'SUD', 'TENDRE', 'TIEDE', 'TOIT', 'AILE',
  'ALOE', 'AMOUR', 'ANGE', 'AURA', 'AZUR', 'BAIN', 'BASE', 'BON', 'BRIN',
  'CIME', 'CLAIR', 'CHAUD', 'CHARME', 'CHANT', 'CYGNE', 'DEDANS', 'DORER',
  'ECLAT', 'ECUME', 'ELAN', 'EMBRUN', 'ESPRIT', 'ESSOR', 'FAUNE', 'FEE',
  'FLOT', 'FLUX', 'FORET', 'FRAIS', 'FRUIT', 'GRACE', 'GRAIN', 'HERBE',
  'HIVER', 'IODE', 'IRIS', 'JADE', 'JOUR', 'LAC', 'LAINE', 'LENTE',
  'LOIN', 'LOTUS', 'LOUP', 'MAGIE', 'MARE', 'MATIN', 'MENTHE', 'MIEUX',
  'MONT', 'MOUSSE', 'MUSE', 'NAGE', 'NEIGE', 'NOBLE', 'NORD', 'OASIS',
  'OCEAN', 'OEIL', 'OPALE', 'ORANGE', 'OUATE', 'OUEST', 'PARC', 'PHARE',
  'PIN', 'PLAGE', 'PLUIE', 'POEME', 'POESIE', 'POMME', 'POSER', 'PRIERE',
  'RADE', 'RAME', 'REVE', 'RIRE', 'ROSEAU', 'ROUGE', 'SAISON', 'SALON',
  'SAPIN', 'SAUT', 'SENS', 'SIESTE', 'SIGNE', 'SOIN', 'SON', 'SUCRE',
  'TEMPS', 'TERRE', 'THE', 'TOILE', 'TRONC', 'UNI', 'VAGUE', 'VAL',
  'VASTE', 'VERT', 'VIE', 'VIGNE', 'VOIE', 'VOILE', 'VOL', 'VOLER',
  'VRAI', 'VUE', 'AIMER', 'DOUCE', 'AMIS', 'SOURIRE', 'RIANT', 'LUEUR',
  'REVER', 'CHANTE', 'CALIN', 'BEAUTE', 'LOUER', 'VITAL', 'TISSU', 
  'CANDEUR', 'ASTRE', 'PERLE', 'RUBIS', 'ONDEE', 'GIVRE', 'GLACE', 'FLAMME', 'FEU'
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
  intermissionConfig,
  onIntermissionComplete,
  onIntermissionRequest,
  replaySameIntermission,
  onToggleReplaySameIntermission,
  upcomingIntermission,
  onSelectUpcomingIntermission,
  onShuffleUpcomingIntermission,
  intermissionGames,
  skipIntro = false
}) {
  const confirm = useConfirm();
  const [showIntro, setShowIntro] = useState(!skipIntro && !isIntermission);
  const [showCollection, setShowCollection] = useState(false);
  const [themeId, setThemeId] = useState(() => getGameConfig('motsflottants', 'theme', 'washi'));
  const [vocabCategory, setVocabCategory] = useState('tous');
  const [difficulty] = useState(() => {
    if (isIntermission) return intermissionDifficulty || 'facile';
    return storage.getItem('retrovision_mots_diff', 'moyen') || 'moyen';
  });

  const gridSize = difficulty === 'facile' ? 5 : 6;
  // En mode entracte (jeu à score), le nombre de mots cibles est configuré via intermissionConfig (défaut 2 mots)
  const configuredTarget = isIntermission
    ? Number(intermissionConfig?.motsflottants?.target) || (difficulty === 'facile' ? 2 : 3)
    : 3;
  const wordsCount = Math.max(1, Math.min(5, configuredTarget));

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

        if (isIntermission && replaySameIntermission) {
          if (onToggleReplaySameIntermission) onToggleReplaySameIntermission(false);
          setTimeout(() => initGame(), 1000);
        }
      }
    } else {
      sound.playClick();
    }
  };

  const handleBackWithConfirm = async () => {
    if (foundWords.length > 0) {
      if (confirm) {
        const ok = await confirm({
          title: 'Quitter Mots Flottants ?',
          message: 'Voulez-vous vraiment retourner à l\'accueil ?',
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
        {showCollection && (
          <MotsFlottantsCollection
            currentSelections={{
              theme: themeId,
              category: vocabCategory
            }}
            onSelect={(catKey, itemId) => {
              if (catKey === 'theme') {
                setThemeId(itemId);
                updateGameConfig('motsflottants', 'theme', itemId);
              } else if (catKey === 'category') {
                setVocabCategory(itemId);
                initGame();
              }
            }}
            onClose={() => setShowCollection(false)}
          />
        )}
        {/* En-tête : Intermission ou Standard */}
        {isIntermission ? (
          <IntermissionHeader
            instructionText={`Trouvez les ${boardData.placedWords.length} mots cibles pour réussir l'entracte ! (${foundWords.length}/${boardData.placedWords.length})`}
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
            onShop={() => setShowCollection(true)}
            showShop={true}
            onLaunchIntermission={onLaunchIntermission}
          />
        )}

        {/* Panneau des Mots Cibles (Stylisé, grand format, contrasté et hautement lisible) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '520px',
            margin: '14px 0 18px 0',
            padding: '16px 20px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f0fdfa 100%)',
            borderRadius: '20px',
            border: '2px solid #0d9488',
            boxShadow: '0 8px 24px rgba(13, 148, 136, 0.14), 0 2px 6px rgba(0,0,0,0.04)',
            boxSizing: 'border-box'
          }}
        >
          {/* En-tête du panneau d'objectifs avec titre et compteur */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(13, 148, 136, 0.18)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🎯</span>
              <span
                style={{
                  fontSize: '0.92rem',
                  fontWeight: '900',
                  letterSpacing: '0.08em',
                  color: '#0f766e',
                  textTransform: 'uppercase'
                }}
              >
                Mots à Découvrir
              </span>
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: '900',
                color: '#0d9488',
                background: '#ccfbf1',
                padding: '4px 12px',
                borderRadius: '12px',
                border: '1.5px solid #99f6e4',
                boxShadow: '0 2px 4px rgba(13,148,136,0.1)'
              }}
            >
              {foundWords.length} / {boardData.placedWords.length} trouvés
            </div>
          </div>

          {/* Badges des mots cibles : grands, ultra-lisibles et attrayants */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              width: '100%'
            }}
          >
            {boardData.placedWords.map((item) => {
              const isDiscovered = foundWords.includes(item.word);

              return (
                <div
                  key={item.word}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    borderRadius: '24px',
                    fontSize: '18px',
                    fontWeight: '900',
                    fontFamily: "'Outfit', system-ui, sans-serif",
                    letterSpacing: '0.12em',
                    background: isDiscovered
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
                    color: isDiscovered ? '#ffffff' : '#0f766e',
                    border: `2px solid ${isDiscovered ? '#34d399' : '#14b8a6'}`,
                    boxShadow: isDiscovered
                      ? '0 4px 14px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.4)'
                      : '0 4px 12px rgba(13, 148, 136, 0.12), inset 0 1px 0 #ffffff',
                    transform: isDiscovered ? 'scale(1.03)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    userSelect: 'none'
                  }}
                >
                  <span style={{ fontSize: '15px' }}>{isDiscovered ? '✓' : '🔍'}</span>
                  <span style={{ textDecoration: isDiscovered ? 'line-through' : 'none' }}>
                    {item.word}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Guide visuel d'aide rapide */}
          <div
            style={{
              marginTop: '10px',
              fontSize: '0.74rem',
              color: '#64748b',
              fontWeight: '600',
              textAlign: 'center'
            }}
          >
            💡 Cliquez sur la 1ère lettre puis sur la dernière lettre du mot dans la grille.
          </div>
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

        {/* Unified Victory Overlay */}
        <GameVictoryOverlay
          isOpen={isWon}
          gameKey="motsflottants"
          score={foundWords.length * 100}
          title="MOTS RETROUVÉS !"
          badgeIcon="🌸"
          subtitle={encouragement || "Bravo ! Tous les mots cachés ont été retrouvés avec sérénité."}
          stats={[
            { label: 'Mots trouvés', value: `${foundWords.length}/${boardData.placedWords.length}`, color: '#10b981' },
            { label: 'Score', value: foundWords.length * 100, color: '#38bdf8' }
          ]}
          onRestart={initGame}
          restartText="🔄 Rejouer"
          onContinue={initGame}
          continueText="Nouvelle Grille ➔"
          onBack={onBack}
          backText="← Retour au Hub"
          isIntermission={isIntermission}
          onIntermissionComplete={onIntermissionComplete}
          onIntermissionRequest={onIntermissionRequest}
          upcomingIntermission={upcomingIntermission}
          onSelectUpcomingIntermission={onSelectUpcomingIntermission}
          onShuffleUpcomingIntermission={onShuffleUpcomingIntermission}
          intermissionConfig={intermissionConfig}
          intermissionGames={intermissionGames}
        />

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
