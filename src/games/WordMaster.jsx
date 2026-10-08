import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GameHeader from '../components/GameHeader';
import GameIntro from '../components/GameIntro';
import IntermissionHeader from '../components/IntermissionHeader';
import GameVictoryOverlay from '../components/GameVictoryOverlay';
import { sound } from '../utils/sound';
import { storage } from '../utils/storage';
import { shuffle, randomChoice } from '../utils/commonUtils';
import { haptic } from '../utils/haptics';
import { useConfirm } from '../components/ConfirmContext';
import { useGameCustomizations } from '../hooks/useGameCustomizations';
import { WORD_MASTER_DATA } from '../data/wordMasterData';
import WordMasterCollection from './WordMasterCollection';

const ENCOURAGING_QUOTES = [
  "La précision du mot affine la clarté de la pensée.",
  "Chaque nuance de vocabulaire enrichit votre mémoire.",
  "Une belle harmonie entre observation, logique et langage.",
  "Votre perspicacité linguistique fait des merveilles !",
  "Prenez le temps de savourer la beauté de notre langue."
];

// Clavier virtuel français pour l'exercice à trou
const KEYBOARD_ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
  ['U', 'V', 'W', 'X', 'Y', 'Z'],
  ['É', 'È', 'Ê', 'À', 'Ç', 'Û', '⌫']
];

export default function WordMaster({
  onBack,
  onScoreSave,
  onLaunchIntermission,
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
  skipIntro = false
}) {
  const confirm = useConfirm();

  // Customisations visuelles et options de boutique
  const { custom, updateCustom, activeTheme } = useGameCustomizations('wordmaster', {
    theme: 'parchment',
    typography: 'serif_classic',
    cardStyle: 'gold_seal',
    assistance: 'standard',
    soundScape: 'feather',
    celebration: 'gold_feathers'
  });

  const activeTypography = custom?.typography || 'serif_classic';
  const activeCardStyle = custom?.cardStyle || 'gold_seal';
  const activeAssistance = custom?.assistance || 'standard';
  const activeSoundScape = custom?.soundScape || 'feather';
  const activeCelebration = custom?.celebration || 'gold_feathers';

  const [showCollection, setShowCollection] = useState(false);
  const [showIntro, setShowIntro] = useState(!skipIntro && !isIntermission);

  // Deck de mots mélangé
  const [wordList, setWordList] = useState(() => shuffle([...WORD_MASTER_DATA]));
  const [wordIndex, setWordIndex] = useState(0);

  // Fiche active
  const currentWordEntry = wordList[wordIndex % wordList.length];

  // Étape en cours dans le mot : 1 (Orthographe à trou), 2 (Synonyme 1 par 1), 3 (Antonyme 1 par 1), 4 (Phrase), 5 (Bilan)
  const [step, setStep] = useState(1);

  // Score
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => storage.getNumber('retrovision_wordmaster_highscore', 0));
  const [encouragement, setEncouragement] = useState('');

  // Mode Entracte (score cible)
  const targetScore = isIntermission
    ? (Number(intermissionConfig?.wordmaster?.target) || 200)
    : 300;

  // --- ÉTAPE 1 : ÉTAT DE L'EXERCICE À TROU ---
  const missingIndices = useMemo(() => {
    return currentWordEntry.orthography.missingIndices || [1, 3];
  }, [currentWordEntry]);

  const [clozeInputs, setClozeInputs] = useState(() => {
    const initial = {};
    (currentWordEntry.orthography.missingIndices || [1, 3]).forEach((idx) => {
      initial[idx] = '';
    });
    return initial;
  });

  const [activeSlotIndex, setActiveSlotIndex] = useState(() => {
    const list = currentWordEntry.orthography.missingIndices || [1, 3];
    return list[0] ?? 0;
  });

  const [clozeStatus, setClozeStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [clozeErrorSlots, setClozeErrorSlots] = useState([]);

  // --- ÉTAPE 2 & 3 : PROPOSITIONS SÉQUENTIELLES (1 PAR 1) ---
  const [synonymOptions, setSynonymOptions] = useState(() => shuffle([...currentWordEntry.synonyms.options]));
  const [synonymIndex, setSynonymIndex] = useState(0);
  const [synonymEvalStatus, setSynonymEvalStatus] = useState('idle'); // 'idle' | 'correct' | 'wrong'
  const [synonymFeedback, setSynonymFeedback] = useState('');

  const [antonymOptions, setAntonymOptions] = useState(() => shuffle([...currentWordEntry.antonyms.options]));
  const [antonymIndex, setAntonymIndex] = useState(0);
  const [antonymEvalStatus, setAntonymEvalStatus] = useState('idle'); // 'idle' | 'correct' | 'wrong'
  const [antonymFeedback, setAntonymFeedback] = useState('');

  // --- ÉTAPE 4 : PHRASE EN GLISSER-DÉPOSER ---
  const [placedWords, setPlacedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState(() =>
    shuffle(currentWordEntry.sentencePuzzle.words.map((w, idx) => ({ id: `${w}_${idx}`, text: w })))
  );
  const [sentenceValidated, setSentenceValidated] = useState(false);
  const [sentenceError, setSentenceError] = useState(false);

  // Reconnaissance vocale (dictée au micro pour le défi construction de phrase)
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechFeedback, setSpeechFeedback] = useState('');
  const recognitionRef = useRef(null);

  // Normalisation douce des caractères (enlève les accents pour comparaison bienveillante)
  const normalizeChar = (c) => (c ? c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase() : '');

  // Réinitialiser les états lorsqu'on change de mot
  const initWordStep = useCallback((entry) => {
    setStep(1);

    // Étape 1 reset
    const newMissing = entry.orthography.missingIndices || [1, 3];
    const initialInputs = {};
    newMissing.forEach((idx) => {
      initialInputs[idx] = '';
    });
    setClozeInputs(initialInputs);
    setActiveSlotIndex(newMissing[0] ?? 0);
    setClozeStatus('idle');
    setClozeErrorSlots([]);

    // Étape 2 reset
    setSynonymOptions(shuffle([...entry.synonyms.options]));
    setSynonymIndex(0);
    setSynonymEvalStatus('idle');
    setSynonymFeedback('');

    // Étape 3 reset
    setAntonymOptions(shuffle([...entry.antonyms.options]));
    setAntonymIndex(0);
    setAntonymEvalStatus('idle');
    setAntonymFeedback('');

    // Étape 4 reset
    setSentenceValidated(false);
    setSentenceError(false);
    setPlacedWords([]);
    setAvailableWords(
      shuffle(entry.sentencePuzzle.words.map((w, idx) => ({ id: `${w}_${idx}`, text: w })))
    );
    setIsListening(false);
    setSpeechTranscript('');
    setSpeechFeedback('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
  }, []);

  // --- GESTION DU CLAVIER POUR L'EXERCICE À TROU (ÉTAPE 1) ---
  const verifyCloze = useCallback(
    (inputsToTest) => {
      const isAllFilled = missingIndices.every((idx) => Boolean(inputsToTest[idx]));
      if (!isAllFilled) return;

      const badSlots = [];
      missingIndices.forEach((idx) => {
        const expected = currentWordEntry.word[idx];
        const actual = inputsToTest[idx];
        const isMatch =
          actual.toUpperCase() === expected.toUpperCase() ||
          normalizeChar(actual) === normalizeChar(expected);
        if (!isMatch) {
          badSlots.push(idx);
        }
      });

      if (badSlots.length === 0) {
        // Orthographe parfaite !
        setClozeStatus('success');
        setClozeErrorSlots([]);
        sound.playScore();
        haptic.success();

        // Réinjecter les vraies lettres avec casse/accent exacts
        const formatted = { ...inputsToTest };
        missingIndices.forEach((idx) => {
          formatted[idx] = currentWordEntry.word[idx];
        });
        setClozeInputs(formatted);

        const nextScore = score + 25;
        setScore(nextScore);
        checkIntermissionTarget(nextScore);

        setTimeout(() => {
          setStep(2);
        }, 850);
      } else {
        // Erreur détectée
        setClozeStatus('error');
        setClozeErrorSlots(badSlots);
        sound.playClick();
        haptic.warning();

        // Effacer les lettres fausses après un bref moment pour correction immédiate
        setTimeout(() => {
          setClozeInputs((prev) => {
            const cleaned = { ...prev };
            badSlots.forEach((idx) => {
              cleaned[idx] = '';
            });
            return cleaned;
          });
          setClozeStatus('idle');
          setClozeErrorSlots([]);
          // Placer le focus sur le premier trou erroné
          if (badSlots.length > 0) {
            setActiveSlotIndex(badSlots[0]);
          }
        }, 750);
      }
    },
    [missingIndices, currentWordEntry, score]
  );

  const handleInputLetter = useCallback(
    (char) => {
      if (step !== 1 || clozeStatus === 'success') return;
      sound.playClick();
      haptic.tap();

      const letter = char.toUpperCase();
      const nextInputs = { ...clozeInputs, [activeSlotIndex]: letter };
      setClozeInputs(nextInputs);
      setClozeStatus('idle');
      setClozeErrorSlots([]);

      // Chercher le trou vide suivant
      const remainingEmptyHoles = missingIndices.filter(
        (idx) => idx !== activeSlotIndex && !nextInputs[idx]
      );

      if (remainingEmptyHoles.length > 0) {
        const nextSlot =
          missingIndices.find((idx) => idx > activeSlotIndex && !nextInputs[idx]) ||
          remainingEmptyHoles[0];
        setActiveSlotIndex(nextSlot);
      } else {
        // Tous les trous sont complétés, vérification immédiate
        verifyCloze(nextInputs);
      }
    },
    [step, clozeStatus, clozeInputs, activeSlotIndex, missingIndices, verifyCloze]
  );

  const handleBackspace = useCallback(() => {
    if (step !== 1 || clozeStatus === 'success') return;
    sound.playClick();
    haptic.tap();

    if (clozeInputs[activeSlotIndex]) {
      setClozeInputs((prev) => ({ ...prev, [activeSlotIndex]: '' }));
      setClozeStatus('idle');
      setClozeErrorSlots([]);
    } else {
      const prevIndices = missingIndices.filter((idx) => idx < activeSlotIndex);
      if (prevIndices.length > 0) {
        const prevSlot = prevIndices[prevIndices.length - 1];
        setActiveSlotIndex(prevSlot);
        setClozeInputs((prev) => ({ ...prev, [prevSlot]: '' }));
        setClozeStatus('idle');
        setClozeErrorSlots([]);
      }
    }
  }, [step, clozeStatus, clozeInputs, activeSlotIndex, missingIndices]);

  // Support du clavier physique d'ordinateur pour l'étape 1
  useEffect(() => {
    if (step !== 1 || clozeStatus === 'success') return;

    const handleKeyDown = (e) => {
      if (showCollection || showIntro) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndices = missingIndices.filter((idx) => idx < activeSlotIndex);
        if (prevIndices.length > 0) {
          setActiveSlotIndex(prevIndices[prevIndices.length - 1]);
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndices = missingIndices.filter((idx) => idx > activeSlotIndex);
        if (nextIndices.length > 0) {
          setActiveSlotIndex(nextIndices[0]);
        }
        return;
      }

      if (/^[a-zA-ZàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]$/i.test(e.key)) {
        e.preventDefault();
        handleInputLetter(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    step,
    clozeStatus,
    activeSlotIndex,
    missingIndices,
    showCollection,
    showIntro,
    handleInputLetter,
    handleBackspace
  ]);

  // --- GESTION DU DÉFI SYNONYME (ÉTAPE 2 SÉQUENTIELLE) ---
  const currentSynonymCandidate = synonymOptions[synonymIndex % synonymOptions.length];

  const handleConfirmSynonym = () => {
    if (synonymEvalStatus !== 'idle') return;

    const isCorrect = currentSynonymCandidate === currentWordEntry.synonyms.correct;
    if (isCorrect) {
      setSynonymEvalStatus('correct');
      setSynonymFeedback('✓ Exactement ! C’est le bon synonyme.');
      sound.playScore();
      haptic.success();
      const nextScore = score + 25;
      setScore(nextScore);
      checkIntermissionTarget(nextScore);

      setTimeout(() => {
        setStep(3);
        setSynonymEvalStatus('idle');
        setSynonymFeedback('');
      }, 750);
    } else {
      setSynonymEvalStatus('wrong');
      setSynonymFeedback(`❌ « ${currentSynonymCandidate} » n’est pas un synonyme.`);
      sound.playClick();
      haptic.warning();

      setTimeout(() => {
        setSynonymEvalStatus('idle');
        setSynonymFeedback('');
        if (synonymIndex + 1 < synonymOptions.length) {
          setSynonymIndex((prev) => prev + 1);
        } else {
          setStep(3);
        }
      }, 750);
    }
  };

  const handleRejectSynonym = () => {
    if (synonymEvalStatus !== 'idle') return;

    const isActuallyCorrect = currentSynonymCandidate === currentWordEntry.synonyms.correct;
    if (isActuallyCorrect) {
      // L'utilisateur rejette la BONNE réponse : on accepte son erreur et on passe à la suite !
      setSynonymEvalStatus('wrong');
      setSynonymFeedback(`❌ Erreur enregistrée : « ${currentSynonymCandidate} » était pourtant le bon synonyme.`);
      sound.playClick();
      haptic.warning();

      setTimeout(() => {
        setStep(3);
        setSynonymEvalStatus('idle');
        setSynonymFeedback('');
      }, 1050);
    } else {
      // Choix judicieux : ce n'était pas le synonyme, on passe à la proposition suivante
      sound.playClick();
      haptic.tap();
      if (synonymIndex + 1 < synonymOptions.length) {
        setSynonymIndex((prev) => prev + 1);
      } else {
        // Tous les candidats ont été rejetés
        setSynonymEvalStatus('wrong');
        setSynonymFeedback(`❌ Fin des options. Le synonyme était « ${currentWordEntry.synonyms.correct} ».`);
        setTimeout(() => {
          setStep(3);
          setSynonymEvalStatus('idle');
          setSynonymFeedback('');
        }, 1150);
      }
    }
  };

  // --- GESTION DU DÉFI ANTONYME (ÉTAPE 3 SÉQUENTIELLE) ---
  const currentAntonymCandidate = antonymOptions[antonymIndex % antonymOptions.length];

  const handleConfirmAntonym = () => {
    if (antonymEvalStatus !== 'idle') return;

    const isCorrect = currentAntonymCandidate === currentWordEntry.antonyms.correct;
    if (isCorrect) {
      setAntonymEvalStatus('correct');
      setAntonymFeedback('✓ Parfait ! C’est bien le mot de sens contraire.');
      sound.playScore();
      haptic.success();
      const nextScore = score + 25;
      setScore(nextScore);
      checkIntermissionTarget(nextScore);

      setTimeout(() => {
        setStep(4);
        setAntonymEvalStatus('idle');
        setAntonymFeedback('');
      }, 750);
    } else {
      // Erreur : confirmation d'un mauvais candidat
      setAntonymEvalStatus('wrong');
      setAntonymFeedback(`❌ « ${currentAntonymCandidate} » n’est pas le contraire.`);
      sound.playClick();
      haptic.warning();

      setTimeout(() => {
        setAntonymEvalStatus('idle');
        setAntonymFeedback('');
        if (antonymIndex + 1 < antonymOptions.length) {
          setAntonymIndex((prev) => prev + 1);
        } else {
          setStep(4);
        }
      }, 750);
    }
  };

  const handleRejectAntonym = () => {
    if (antonymEvalStatus !== 'idle') return;

    const isActuallyCorrect = currentAntonymCandidate === currentWordEntry.antonyms.correct;
    if (isActuallyCorrect) {
      // L'utilisateur rejette la BONNE réponse : on accepte son erreur et on passe à la suite !
      setAntonymEvalStatus('wrong');
      setAntonymFeedback(`❌ Erreur enregistrée : « ${currentAntonymCandidate} » était pourtant l’antonyme.`);
      sound.playClick();
      haptic.warning();

      setTimeout(() => {
        setStep(4);
        setAntonymEvalStatus('idle');
        setAntonymFeedback('');
      }, 1050);
    } else {
      sound.playClick();
      haptic.tap();
      if (antonymIndex + 1 < antonymOptions.length) {
        setAntonymIndex((prev) => prev + 1);
      } else {
        // Tous les candidats ont été rejetés
        setAntonymEvalStatus('wrong');
        setAntonymFeedback(`❌ Fin des options. L’antonyme était « ${currentWordEntry.antonyms.correct} ».`);
        setTimeout(() => {
          setStep(4);
          setAntonymEvalStatus('idle');
          setAntonymFeedback('');
        }, 1150);
      }
    }
  };

  // --- ÉTAPE 4 : GESTION DES MOTS ÉTIQUETTES (GLISSER-DÉPOSER + CLIC ACCESSIBLE) ---
  const handleWordClickToAdd = (wordItem) => {
    if (sentenceValidated) return;
    sound.playClick();
    haptic.tap();
    setAvailableWords((prev) => prev.filter((w) => w.id !== wordItem.id));
    setPlacedWords((prev) => [...prev, wordItem]);
    setSentenceError(false);
  };

  const handleWordClickToRemove = (wordItem) => {
    if (sentenceValidated) return;
    sound.playClick();
    haptic.tap();
    setPlacedWords((prev) => prev.filter((w) => w.id !== wordItem.id));
    setAvailableWords((prev) => [...prev, wordItem]);
    setSentenceError(false);
  };

  // Drag & Drop HTML5
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, item, source) => {
    setDraggedItem({ item, source });
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDropOnPlaced = (e) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.source === 'placed' || sentenceValidated) return;
    handleWordClickToAdd(draggedItem.item);
    setDraggedItem(null);
  };

  const handleDropOnAvailable = (e) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.source === 'available' || sentenceValidated) return;
    handleWordClickToRemove(draggedItem.item);
    setDraggedItem(null);
  };

  // Réinitialiser la zone de phrase (remettre tous les mots dans le bac)
  const handleResetSentence = useCallback(() => {
    if (sentenceValidated) return;
    sound.playClick();
    haptic.tap();
    setPlacedWords([]);
    setAvailableWords(
      shuffle(currentWordEntry.sentencePuzzle.words.map((w, idx) => ({ id: `${w}_${idx}`, text: w })))
    );
    setSentenceError(false);
    setSpeechTranscript('');
    setSpeechFeedback('');
  }, [currentWordEntry, sentenceValidated]);

  // Nettoyer et normaliser un mot pour matching phonétique et orthographique souple
  const cleanWordForMatch = useCallback((w) => {
    return (w || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,!?;:«»()—–]/g, '')
      .replace(/['’]/g, "'")
      .trim();
  }, []);

  // Traiter la transcription vocale et placer les mots étiquettes automatiquement
  const processDictatedTranscript = useCallback(
    (spokenText) => {
      if (!spokenText || sentenceValidated) return;

      const spokenTokens = spokenText
        .split(/\s+/)
        .map(cleanWordForMatch)
        .filter(Boolean);

      if (spokenTokens.length === 0) return;

      // Pool de tous les mots du puzzle disponibles
      const allTokens = currentWordEntry.sentencePuzzle.words.map((w, idx) => ({
        id: `${w}_${idx}`,
        text: w
      }));

      const newPlaced = [];
      const remainingPool = [...allTokens];

      // Parcourir chaque mot prononcé et chercher la correspondance dans le puzzle
      spokenTokens.forEach((tokenWord) => {
        const foundIdx = remainingPool.findIndex((item) => {
          const itemClean = cleanWordForMatch(item.text);
          return (
            itemClean === tokenWord ||
            itemClean.replace(/'/g, '') === tokenWord.replace(/'/g, '')
          );
        });

        if (foundIdx !== -1) {
          const matchedItem = remainingPool.splice(foundIdx, 1)[0];
          newPlaced.push(matchedItem);
        }
      });

      if (newPlaced.length > 0) {
        setPlacedWords(newPlaced);
        setAvailableWords(remainingPool);
        setSentenceError(false);
        sound.playClick();
        haptic.tap();

        const constructedSentence = newPlaced.map((w) => w.text).join(' ');
        if (constructedSentence === currentWordEntry.sentencePuzzle.fullSentence) {
          setSpeechFeedback(`✓ Phrase complète reconnue avec succès !`);
        } else {
          setSpeechFeedback(`🎙️ ${newPlaced.length} mot(s) assemblé(s) d’après votre dictée.`);
        }
      } else {
        setSpeechFeedback(`⚠️ Aucun mot du puzzle reconnu dans : « ${spokenText} »`);
      }
    },
    [currentWordEntry, sentenceValidated, cleanWordForMatch]
  );

  // Démarrer ou arrêter la reconnaissance vocale au micro
  const handleToggleSpeechRecognition = useCallback(() => {
    if (sentenceValidated) return;

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setSpeechFeedback(
        "La reconnaissance vocale n'est pas disponible sur ce navigateur. Vous pouvez utiliser le glisser-déposer ou le clic."
      );
      sound.playClick();
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript('');
        setSpeechFeedback('🎙️ Écoute en cours... Dictez la phrase à voix haute.');
        sound.playClick();
        haptic.tap();
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        const currentSpoken = (finalText || interimText).trim();
        setSpeechTranscript(currentSpoken);

        if (finalText) {
          processDictatedTranscript(finalText.trim());
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechFeedback('❌ Accès au micro refusé. Autorisez le micro dans vos paramètres de navigateur.');
        } else if (event.error === 'no-speech') {
          setSpeechFeedback('⚠️ Aucun son détecté. Réessayez en parlant un peu plus fort.');
        } else {
          setSpeechFeedback(`⚠️ Dictée vocale interrompue (${event.error}).`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setSpeechFeedback('Impossible de démarrer la reconnaissance vocale.');
    }
  }, [isListening, sentenceValidated, processDictatedTranscript]);

  // Arrêter proprement le micro au démontage
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Validation 100% locale et instantanée de la phrase (ZÉRO appel IA)
  const handleValidateSentence = () => {
    if (sentenceValidated) return;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setIsListening(false);

    const constructedSentence = placedWords.map((w) => w.text).join(' ');
    const expectedSentence = currentWordEntry.sentencePuzzle.fullSentence;

    if (constructedSentence === expectedSentence) {
      setSentenceValidated(true);
      setSentenceError(false);
      sound.playChapterVictory?.() || sound.playSudokuSuccess?.();
      haptic.success();

      const nextScore = score + 50;
      setScore(nextScore);

      if (nextScore > highScore) {
        setHighScore(nextScore);
        storage.setItem('retrovision_wordmaster_highscore', nextScore.toString());
      }
      if (onScoreSave) onScoreSave('wordmaster', nextScore);

      setEncouragement(randomChoice(ENCOURAGING_QUOTES));

      setTimeout(() => {
        setStep(5);
        checkIntermissionTarget(nextScore);
      }, 900);
    } else {
      setSentenceError(true);
      sound.playClick();
      haptic.warning();
    }
  };

  // Vérifier si l'objectif d'entracte est atteint
  const checkIntermissionTarget = (currentScore) => {
    if (isIntermission && currentScore >= targetScore) {
      sound.playChapterVictory?.();
      setStep(5);
    }
  };

  // Passer au mot suivant
  const handleNextWord = () => {
    const nextIdx = wordIndex + 1;
    setWordIndex(nextIdx);
    const nextEntry = wordList[nextIdx % wordList.length];
    initWordStep(nextEntry);
  };

  // Quitter avec confirmation
  const handleBackWithConfirm = async () => {
    if (score > 0 && !isIntermission) {
      const ok = await confirm({
        title: 'Quitter L’Atelier des Mots ?',
        message: 'Vos points de cette session sont déjà enregistrés dans vos statistiques.',
        confirmText: 'Quitter',
        cancelText: 'Continuer',
        confirmVariant: 'danger'
      });
      if (!ok) return;
    }
    onBack();
  };

  // Thème graphique de fond
  const themeStyles = useMemo(() => {
    let baseTheme;
    switch (activeTheme) {
      case 'velvet_lounge':
        baseTheme = {
          bg: 'linear-gradient(135deg, #450a0a 0%, #1c0303 60%, #0c0101 100%)',
          cardBg: 'rgba(69, 10, 10, 0.90)',
          cardBorder: '#e11d48',
          textColor: '#fff1f2',
          accentColor: '#fb7185',
          defBoxBg: 'rgba(225, 29, 72, 0.15)',
          defBoxBorder: 'rgba(251, 113, 133, 0.40)'
        };
        break;
      case 'botanical':
        baseTheme = {
          bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
          cardBg: 'rgba(255, 255, 255, 0.94)',
          cardBorder: '#16a34a',
          textColor: '#14532d',
          accentColor: '#15803d',
          defBoxBg: 'rgba(22, 163, 74, 0.10)',
          defBoxBorder: 'rgba(22, 163, 74, 0.30)'
        };
        break;
      case 'library':
        baseTheme = {
          bg: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
          cardBg: 'rgba(6, 78, 59, 0.92)',
          cardBorder: '#10b981',
          textColor: '#f0fdf4',
          accentColor: '#34d399',
          defBoxBg: 'rgba(16, 185, 129, 0.12)',
          defBoxBorder: 'rgba(52, 211, 153, 0.35)'
        };
        break;
      case 'ink_night':
        baseTheme = {
          bg: 'radial-gradient(ellipse at 50% 20%, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
          cardBg: 'rgba(15, 23, 42, 0.92)',
          cardBorder: '#818cf8',
          textColor: '#f8fafc',
          accentColor: '#a78bfa',
          defBoxBg: 'rgba(129, 140, 248, 0.12)',
          defBoxBorder: 'rgba(167, 139, 250, 0.35)'
        };
        break;
      case 'minimal_ivory':
        baseTheme = {
          bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          cardBg: '#ffffff',
          cardBorder: '#cbd5e1',
          textColor: '#0f172a',
          accentColor: '#0284c7',
          defBoxBg: 'rgba(2, 132, 199, 0.08)',
          defBoxBorder: 'rgba(2, 132, 199, 0.25)'
        };
        break;
      case 'cafe_poetes':
        baseTheme = {
          bg: 'linear-gradient(135deg, #3e2723 0%, #271714 50%, #1a0e0b 100%)',
          cardBg: 'rgba(62, 39, 35, 0.94)',
          cardBorder: '#d7ccc8',
          textColor: '#fbe9e7',
          accentColor: '#ffcc80',
          defBoxBg: 'rgba(255, 204, 128, 0.12)',
          defBoxBorder: 'rgba(255, 204, 128, 0.35)'
        };
        break;
      case 'aurore':
        baseTheme = {
          bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
          cardBg: 'rgba(255, 255, 255, 0.95)',
          cardBorder: '#fb923c',
          textColor: '#431407',
          accentColor: '#ea580c',
          defBoxBg: 'rgba(251, 146, 60, 0.12)',
          defBoxBorder: 'rgba(251, 146, 60, 0.35)'
        };
        break;
      case 'parchment':
      default:
        baseTheme = {
          bg: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #fde68a 100%)',
          cardBg: 'rgba(255, 255, 255, 0.94)',
          cardBorder: '#f59e0b',
          textColor: '#451a03',
          accentColor: '#b45309',
          defBoxBg: 'rgba(245, 158, 11, 0.10)',
          defBoxBorder: 'rgba(245, 158, 11, 0.30)'
        };
        break;
    }

    let fontFamily;
    switch (activeTypography) {
      case 'sans_modern':
        fontFamily = "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif";
        break;
      case 'humanist':
        fontFamily = "'Outfit', system-ui, -apple-system, sans-serif";
        break;
      case 'gazette':
        fontFamily = "'Playfair Display', 'Didot', 'Georgia', serif";
        break;
      case 'dys_comfort':
        fontFamily = "'Lexend', 'Verdana', system-ui, sans-serif";
        break;
      case 'serif_classic':
      default:
        fontFamily = "'Merriweather', 'Playfair Display', 'Georgia', serif";
        break;
    }

    let cardBorderRadius = '20px';
    let cardShadow = '0 8px 30px rgba(0,0,0,0.08)';
    if (activeCardStyle === 'mineral_slate') {
      cardBorderRadius = '26px';
      cardShadow = '0 10px 24px rgba(0,0,0,0.12)';
    } else if (activeCardStyle === 'embossed_paper') {
      cardBorderRadius = '16px';
      cardShadow = 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 16px rgba(0,0,0,0.06)';
    } else if (activeCardStyle === 'bevelled') {
      cardBorderRadius = '8px';
      cardShadow = '0 6px 0 #b45309, 0 12px 24px rgba(0,0,0,0.15)';
    } else if (activeCardStyle === 'frosted_glass') {
      cardBorderRadius = '22px';
      cardShadow = '0 8px 32px rgba(31, 38, 135, 0.15)';
    }

    return {
      ...baseTheme,
      fontFamily,
      cardBorderRadius,
      cardShadow
    };
  }, [activeTheme, activeTypography, activeCardStyle]);

  const progressRatio = isIntermission
    ? Math.min(1, score / targetScore)
    : (wordIndex % 10) / 10;

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
        color: themeStyles.textColor,
        background: themeStyles.bg,
        fontFamily: themeStyles.fontFamily,
        position: 'relative'
      }}
    >
      {/* Intro Animation */}
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="L’Atelier des Mots"
          icon="✍️"
          colors={['#8b5cf6', '#f59e0b', '#10b981']}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Repère d'ancrage visuel gauche */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '5px',
          background: '#8b5cf6',
          zIndex: 40,
          pointerEvents: 'none'
        }}
      />

      {/* En-tête : Intermission ou Standard */}
      {isIntermission ? (
        <IntermissionHeader
          instructionText={`Objectif Entracte : Atteignez ${targetScore} points avec vos mots ! (${score} / ${targetScore} pts)`}
          onRestart={() => initWordStep(currentWordEntry)}
          onOtherGame={onIntermissionRequest}
          onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
          replaySame={replaySameIntermission}
          onToggleReplaySame={onToggleReplaySameIntermission}
          progress={progressRatio}
        />
      ) : (
        <GameHeader
          title="L’ATELIER DES MOTS"
          subtitle="Exercices à trou, synonymes & syntaxe"
          onBack={handleBackWithConfirm}
          onRestart={() => initWordStep(currentWordEntry)}
          showShop={true}
          onShop={() => setShowCollection(true)}
          onOpenShop={() => setShowCollection(true)}
          onLaunchIntermission={onLaunchIntermission}
        />
      )}

      {/* Barre de statut supérieure (HUD) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '720px',
          flexWrap: 'wrap',
          gap: '12px',
          margin: '12px 0 16px 0',
          padding: '12px 18px',
          background: themeStyles.cardBg,
          borderRadius: '16px',
          border: `1.5px solid ${themeStyles.cardBorder}`,
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#ede9fe',
              color: '#6d28d9',
              fontWeight: '800',
              fontSize: '13px'
            }}
          >
            Mot {wordIndex + 1}
          </span>
          <span style={{ fontSize: '13px', fontWeight: '700', opacity: 0.85 }}>
            {step === 1 && '📝 Étape 1/4 : Mot à trou'}
            {step === 2 && '🔗 Étape 2/4 : Synonyme'}
            {step === 3 && '⚡ Étape 3/4 : Antonyme'}
            {step === 4 && '🧩 Étape 4/4 : Phrase'}
            {step === 5 && '🌟 Mot Complété !'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontWeight: '700', fontSize: '14px' }}>
          <div>
            <span style={{ opacity: 0.7, marginRight: '6px' }}>Score :</span>
            <span style={{ color: '#d97706', fontSize: '16px' }}>{score} pts</span>
          </div>
          {isIntermission && (
            <div>
              <span style={{ opacity: 0.7, marginRight: '6px' }}>Objectif :</span>
              <span style={{ color: '#16a34a', fontSize: '16px' }}>{targetScore} pts</span>
            </div>
          )}
        </div>
      </div>

      {/* Plateau principal de jeu */}
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          background: themeStyles.cardBg,
          borderRadius: '20px',
          border: `2px solid ${themeStyles.cardBorder}`,
          padding: '28px 24px',
          boxSizing: 'border-box',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'all 0.25s ease'
        }}
      >
        {/* ============================================================== */}
        {/* ÉTAPE 1 : EXERCICE À TROU AVEC CLAVIER & DÉFINITION AGRANDIE    */}
        {/* ============================================================== */}
        {step === 1 && (
          <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: themeStyles.accentColor,
                fontWeight: '800',
                marginBottom: '10px'
              }}
            >
              Défi Orthographe · Mot à trou
            </span>

            {/* Définition en plus grand dans un cadre valorisé */}
            <div
              style={{
                fontSize: '1.22rem',
                fontWeight: '600',
                lineHeight: '1.5',
                padding: '18px 22px',
                borderRadius: '16px',
                background: themeStyles.defBoxBg,
                border: `1.5px solid ${themeStyles.defBoxBorder}`,
                color: themeStyles.textColor,
                marginBottom: '28px',
                fontStyle: 'italic',
                maxWidth: '640px',
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              « {currentWordEntry.definition} »
            </div>

            {/* Assistance cognitive : Indice première lettre ou Mode sérénité */}
            {activeAssistance === 'first_letter_hint' && missingIndices.length > 0 && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 16px',
                  borderRadius: '12px',
                  background: 'rgba(234, 179, 8, 0.16)',
                  border: '1px solid #eab308',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  color: themeStyles.textColor,
                  marginBottom: '20px'
                }}
              >
                <span>💡</span>
                <span>
                  Indice 1ère lettre masquée : <strong>« {currentWordEntry.word[missingIndices[0]]?.toUpperCase()} »</strong>
                </span>
              </div>
            )}
            {activeAssistance === 'serenity' && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 16px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.14)',
                  border: '1px solid #10b981',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  color: themeStyles.textColor,
                  marginBottom: '20px'
                }}
              >
                <span>🧘</span>
                <span>Mode Sérénité Zen actif : découvrez le mot à votre rythme sans pression</span>
              </div>
            )}

            {/* Affichage des cases du mot à trou */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '24px',
                maxWidth: '100%'
              }}
            >
              {currentWordEntry.word.split('').map((char, idx) => {
                const isHole = missingIndices.includes(idx);
                const isActive = isHole && activeSlotIndex === idx;
                const value = isHole ? clozeInputs[idx] : char;
                const isError = clozeErrorSlots.includes(idx);
                const isSuccess = clozeStatus === 'success';

                let slotBg = '#f1f5f9';
                let slotBorder = '#cbd5e1';
                let slotColor = '#334155';

                if (isHole) {
                  slotBg = '#ffffff';
                  slotBorder = '#94a3b8';
                  slotColor = '#0f172a';

                  if (isActive) {
                    slotBorder = '#0284c7';
                    slotBg = '#f0f9ff';
                  }
                  if (isError) {
                    slotBorder = '#ef4444';
                    slotBg = '#fee2e2';
                    slotColor = '#b91c1c';
                  }
                  if (isSuccess) {
                    slotBorder = '#22c55e';
                    slotBg = '#dcfce7';
                    slotColor = '#15803d';
                  }
                }

                return (
                  <button
                    key={`slot_${idx}`}
                    type="button"
                    onClick={() => {
                      if (isHole && clozeStatus !== 'success') {
                        sound.playClick();
                        setActiveSlotIndex(idx);
                      }
                    }}
                    style={{
                      width: '44px',
                      height: '52px',
                      borderRadius: '10px',
                      border: `2px solid ${slotBorder}`,
                      background: slotBg,
                      color: slotColor,
                      fontSize: '22px',
                      fontWeight: '900',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isHole ? 'pointer' : 'default',
                      boxShadow: isActive ? '0 0 0 3px rgba(2, 132, 199, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                      userSelect: 'none'
                    }}
                  >
                    {value || (isHole ? '_' : char)}
                  </button>
                );
              })}
            </div>

            {/* Clavier Virtuel Accessible */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
                maxWidth: '560px',
                padding: '14px',
                background: 'rgba(0,0,0,0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              {KEYBOARD_ROWS.map((row, rIdx) => (
                <div key={`row_${rIdx}`} style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                  {row.map((k) => {
                    const isBackspace = k === '⌫';
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          if (isBackspace) {
                            handleBackspace();
                          } else {
                            handleInputLetter(k);
                          }
                        }}
                        style={{
                          flex: isBackspace ? 1.6 : 1,
                          minWidth: isBackspace ? '58px' : '36px',
                          height: '42px',
                          borderRadius: '8px',
                          background: isBackspace ? '#fee2e2' : '#ffffff',
                          color: isBackspace ? '#b91c1c' : '#1e293b',
                          border: isBackspace ? '1.5px solid #fca5a5' : '1.5px solid #cbd5e1',
                          fontWeight: '800',
                          fontSize: isBackspace ? '15px' : '16px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                          transition: 'all 0.1s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          touchAction: 'manipulation'
                        }}
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {clozeStatus === 'success' && (
              <div style={{ marginTop: '14px', color: '#16a34a', fontWeight: '800', fontSize: '15px' }}>
                ✓ Orthographe trouvée ! (+25 pts)
              </div>
            )}
            {clozeStatus === 'error' && (
              <div style={{ marginTop: '14px', color: '#dc2626', fontWeight: '800', fontSize: '14px' }}>
                Vérifiez les lettres en rouge et réessayez...
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ÉTAPE 2 : DÉFI SYNONYME SÉQUENTIEL (1 PAR 1)                   */}
        {/* ============================================================== */}
        {step === 2 && (
          <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: themeStyles.accentColor,
                fontWeight: '800',
                marginBottom: '8px'
              }}
            >
              Défi Synonyme
            </span>

            {/* Titre conservé sans le sous-titre */}
            <h2 style={{ fontSize: '1.45rem', margin: '4px 0 20px 0', fontWeight: '900' }}>
              Quel est le synonyme de <span style={{ color: '#0284c7' }}>« {currentWordEntry.word} »</span> ?
            </h2>

            {/* Indicateur de progression (1 à 6) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              {synonymOptions.map((_, dotIdx) => (
                <div
                  key={`dot_syn_${dotIdx}`}
                  style={{
                    width: dotIdx === synonymIndex ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: dotIdx === synonymIndex ? '#0284c7' : 'rgba(0,0,0,0.15)',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
              <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '6px', fontWeight: '700' }}>
                {synonymIndex + 1} / 6
              </span>
            </div>

            {/* Grande carte présentant la proposition courante */}
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                padding: '28px 20px',
                borderRadius: '16px',
                background:
                  synonymEvalStatus === 'correct'
                    ? '#dcfce7'
                    : synonymEvalStatus === 'wrong'
                    ? '#fee2e2'
                    : '#ffffff',
                border:
                  synonymEvalStatus === 'correct'
                    ? '2.5px solid #22c55e'
                    : synonymEvalStatus === 'wrong'
                    ? '2.5px solid #ef4444'
                    : '2px solid #cbd5e1',
                boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                marginBottom: '24px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.6, fontWeight: '800', marginBottom: '6px' }}>
                Proposition
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color:
                    synonymEvalStatus === 'correct'
                      ? '#15803d'
                      : synonymEvalStatus === 'wrong'
                      ? '#b91c1c'
                      : '#0f172a'
                }}
              >
                {currentSynonymCandidate}
              </div>

              {synonymFeedback && (
                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '14px',
                    fontWeight: '800',
                    color: synonymEvalStatus === 'correct' ? '#15803d' : '#b91c1c'
                  }}
                >
                  {synonymFeedback}
                </div>
              )}
            </div>

            {/* Deux boutons d'évaluation : ❌ et [Synonyme] */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', width: '100%', maxWidth: '440px' }}>
              <button
                type="button"
                onClick={handleRejectSynonym}
                disabled={synonymEvalStatus !== 'idle'}
                style={{
                  flex: 1,
                  minHeight: '52px',
                  borderRadius: '14px',
                  fontSize: '18px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: '#fee2e2',
                  border: '2px solid #ef4444',
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 3px 8px rgba(239, 68, 68, 0.15)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>❌</span>
                <span>Non</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmSynonym}
                disabled={synonymEvalStatus !== 'idle'}
                style={{
                  flex: 1.4,
                  minHeight: '52px',
                  borderRadius: '14px',
                  fontSize: '18px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: '#dcfce7',
                  border: '2px solid #22c55e',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 3px 8px rgba(34, 197, 94, 0.15)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>✓</span>
                <span>Synonyme</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ÉTAPE 3 : DÉFI ANTONYME SÉQUENTIEL (1 PAR 1)                   */}
        {/* ============================================================== */}
        {step === 3 && (
          <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: themeStyles.accentColor,
                fontWeight: '800',
                marginBottom: '8px'
              }}
            >
              Défi Antonyme (Contraire)
            </span>

            {/* Titre conservé sans le sous-titre */}
            <h2 style={{ fontSize: '1.45rem', margin: '4px 0 20px 0', fontWeight: '900' }}>
              Quel est l’antonyme de <span style={{ color: '#dc2626' }}>« {currentWordEntry.word} »</span> ?
            </h2>

            {/* Indicateur de progression (1 à 6) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              {antonymOptions.map((_, dotIdx) => (
                <div
                  key={`dot_ant_${dotIdx}`}
                  style={{
                    width: dotIdx === antonymIndex ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: dotIdx === antonymIndex ? '#dc2626' : 'rgba(0,0,0,0.15)',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
              <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '6px', fontWeight: '700' }}>
                {antonymIndex + 1} / 6
              </span>
            </div>

            {/* Grande carte présentant la proposition courante */}
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                padding: '28px 20px',
                borderRadius: '16px',
                background:
                  antonymEvalStatus === 'correct'
                    ? '#dcfce7'
                    : antonymEvalStatus === 'wrong'
                    ? '#fee2e2'
                    : '#ffffff',
                border:
                  antonymEvalStatus === 'correct'
                    ? '2.5px solid #22c55e'
                    : antonymEvalStatus === 'wrong'
                    ? '2.5px solid #ef4444'
                    : '2px solid #cbd5e1',
                boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                marginBottom: '24px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.6, fontWeight: '800', marginBottom: '6px' }}>
                Proposition
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color:
                    antonymEvalStatus === 'correct'
                      ? '#15803d'
                      : antonymEvalStatus === 'wrong'
                      ? '#b91c1c'
                      : '#0f172a'
                }}
              >
                {currentAntonymCandidate}
              </div>

              {antonymFeedback && (
                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '14px',
                    fontWeight: '800',
                    color: antonymEvalStatus === 'correct' ? '#15803d' : '#b91c1c'
                  }}
                >
                  {antonymFeedback}
                </div>
              )}
            </div>

            {/* Deux boutons d'évaluation : ❌ et [Antonyme] */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', width: '100%', maxWidth: '440px' }}>
              <button
                type="button"
                onClick={handleRejectAntonym}
                disabled={antonymEvalStatus !== 'idle'}
                style={{
                  flex: 1,
                  minHeight: '52px',
                  borderRadius: '14px',
                  fontSize: '18px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: '#fee2e2',
                  border: '2px solid #ef4444',
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 3px 8px rgba(239, 68, 68, 0.15)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>❌</span>
                <span>Non</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAntonym}
                disabled={antonymEvalStatus !== 'idle'}
                style={{
                  flex: 1.4,
                  minHeight: '52px',
                  borderRadius: '14px',
                  fontSize: '18px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: '#dcfce7',
                  border: '2px solid #22c55e',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 3px 8px rgba(34, 197, 94, 0.15)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>✓</span>
                <span>Antonyme</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ÉTAPE 4 : PHRASE EN GLISSER-DÉPOSER (VALIDATION 100% LOCALE)    */}
        {/* ============================================================== */}
        {step === 4 && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: themeStyles.accentColor, fontWeight: '800' }}>
              Défi Construction de Phrase
            </span>
            <h2 style={{ fontSize: '1.45rem', margin: '8px 0 10px 0', fontWeight: '900' }}>
              Reconstituez la phrase dans le bon ordre
            </h2>
            <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '16px' }}>
              Glissez ou cliquez sur les mots pour assembler la phrase (ou utilisez la dictée vocale) :
            </p>

            {/* Barre de dictée vocale au micro */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleToggleSpeechRecognition}
                  disabled={sentenceValidated}
                  title="Dicter la phrase au microphone"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 22px',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: '800',
                    cursor: sentenceValidated ? 'default' : 'pointer',
                    background: isListening
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: isListening ? '2.5px solid #b91c1c' : '2px solid #16a34a',
                    color: isListening ? '#ffffff' : '#15803d',
                    boxShadow: isListening
                      ? '0 0 20px rgba(239, 68, 68, 0.6), 0 4px 12px rgba(0,0,0,0.2)'
                      : '0 4px 12px rgba(22, 163, 74, 0.15)',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isListening ? 'scale(1.03)' : 'scale(1)'
                  }}
                >
                  <span style={{ fontSize: '22px' }}>{isListening ? '🛑' : '🎙️'}</span>
                  <span>
                    {isListening
                      ? 'Écoute en cours... (Cliquez pour arrêter)'
                      : 'Dicter la phrase au micro'}
                  </span>
                </button>

                {placedWords.length > 0 && !sentenceValidated && (
                  <button
                    type="button"
                    onClick={handleResetSentence}
                    title="Remettre tous les mots dans le bac"
                    style={{
                      minHeight: '44px',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '14px',
                      background: '#f8fafc',
                      color: '#64748b',
                      border: '1.5px solid #cbd5e1',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>↺</span>
                    <span>Réinitialiser</span>
                  </button>
                )}
              </div>

              {/* Retour d'état ou texte transcrit en direct */}
              {(isListening || speechFeedback || speechTranscript) && (
                <div
                  style={{
                    padding: '8px 18px',
                    borderRadius: '12px',
                    background: isListening ? '#fee2e2' : 'rgba(2, 132, 199, 0.10)',
                    border: isListening ? '1.5px solid #f87171' : '1px solid rgba(2, 132, 199, 0.25)',
                    color: isListening ? '#991b1b' : '#0369a1',
                    fontSize: '13px',
                    fontWeight: '700',
                    maxWidth: '560px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{isListening ? '🔊' : '💬'}</span>
                  <span>{speechTranscript ? `« ${speechTranscript} »` : speechFeedback}</span>
                </div>
              )}
            </div>

            {/* Zone réceptrice de phrase */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnPlaced}
              style={{
                minHeight: '75px',
                padding: '14px 16px',
                borderRadius: '14px',
                background: sentenceValidated ? '#f0fdf4' : sentenceError ? '#fff1f2' : '#f8fafc',
                border: sentenceValidated ? '2px solid #22c55e' : sentenceError ? '2px dashed #f43f5e' : '2px dashed #94a3b8',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                transition: 'all 0.2s ease'
              }}
            >
              {placedWords.length === 0 ? (
                <span style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>
                  Glissez ou cliquez sur les mots ci-dessous pour former la phrase...
                </span>
              ) : (
                placedWords.map((wordItem) => (
                  <span
                    key={wordItem.id}
                    draggable={!sentenceValidated}
                    onDragStart={(e) => handleDragStart(e, wordItem, 'placed')}
                    onClick={() => handleWordClickToRemove(wordItem)}
                    title="Cliquer pour retirer ce mot"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: sentenceValidated ? '#16a34a' : '#0284c7',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '15px',
                      cursor: sentenceValidated ? 'default' : 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      userSelect: 'none'
                    }}
                  >
                    {wordItem.text} ✕
                  </span>
                ))
              )}
            </div>

            {/* Bac des mots disponibles */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnAvailable}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center',
                marginBottom: '24px',
                minHeight: '48px',
                padding: '10px',
                background: 'rgba(0,0,0,0.02)',
                borderRadius: '12px'
              }}
            >
              {availableWords.map((wordItem) => (
                <button
                  key={wordItem.id}
                  type="button"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, wordItem, 'available')}
                  onClick={() => handleWordClickToAdd(wordItem)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#1e293b',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {wordItem.text}
                </button>
              ))}
            </div>

            {/* Boutons d'action pour la phrase (Validation locale instantanée) */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleValidateSentence}
                disabled={placedWords.length === 0 || sentenceValidated}
                style={{
                  minHeight: '46px',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '15px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  cursor: placedWords.length === 0 || sentenceValidated ? 'not-allowed' : 'pointer',
                  opacity: placedWords.length === 0 || sentenceValidated ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>✓</span>
                <span>Valider la phrase</span>
              </button>
              {placedWords.length > 0 && !sentenceValidated && (
                <button
                  type="button"
                  onClick={handleResetSentence}
                  style={{
                    minHeight: '46px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '14px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1.5px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  Effacer
                </button>
              )}
            </div>

            {sentenceError && (
              <div style={{ color: '#e11d48', fontWeight: '700', fontSize: '13px', marginTop: '12px' }}>
                L’ordre de la phrase n’est pas tout à fait exact. Réessayez !
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ÉTAPE 5 : BILAN DU MOT COMPLET (GameVictoryOverlay)             */}
        {/* ============================================================== */}
        <GameVictoryOverlay
          isOpen={step === 5}
          gameKey="wordmaster"
          score={score}
          title="MOT MAÎTRISÉ !"
          badgeIcon="🌟"
          subtitle={`« ${currentWordEntry.word} »`}
          stats={[
            { label: 'Score Session', value: `${score} pts`, color: '#f59e0b' }
          ]}
          detailsNode={(
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '14px 18px',
                textAlign: 'left',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px',
                color: '#e0f2fe'
              }}
            >
              <div>
                <strong style={{ color: '#38bdf8' }}>📖 Définition :</strong> {currentWordEntry.definition}
              </div>
              <div>
                <strong style={{ color: '#38bdf8' }}>🔗 Synonyme :</strong>{' '}
                <span style={{ color: '#34d399', fontWeight: '800' }}>{currentWordEntry.synonyms.correct}</span>
              </div>
              <div>
                <strong style={{ color: '#38bdf8' }}>⚡ Antonyme :</strong>{' '}
                <span style={{ color: '#f87171', fontWeight: '800' }}>{currentWordEntry.antonyms.correct}</span>
              </div>
              <div>
                <strong style={{ color: '#38bdf8' }}>✍️ Phrase modèle :</strong>{' '}
                <em>« {currentWordEntry.sentencePuzzle.fullSentence} »</em>
              </div>
            </div>
          )}
          onRestart={handleNextWord}
          restartText="Nouveau Mot 🎲"
          onContinue={handleNextWord}
          continueText="Mot Suivant ➡️"
          onBack={handleBackWithConfirm}
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
      </div>

      {/* Boutique L'Atelier des Mots */}
      {showCollection && (
        <WordMasterCollection
          currentSelections={{
            theme: activeTheme,
            typography: activeTypography,
            cardStyle: activeCardStyle,
            assistance: activeAssistance,
            soundScape: activeSoundScape,
            celebration: activeCelebration
          }}
          onSelect={(catKey, itemId) => {
            updateCustom(catKey, itemId);
          }}
          onClose={() => setShowCollection(false)}
        />
      )}
    </div>
  );
}
