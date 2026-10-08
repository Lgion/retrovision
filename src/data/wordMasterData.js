/**
 * Banque de données pédagogique et littéraire pour « L'Atelier des Mots ».
 * Chaque fiche contient :
 * - Le mot cible et sa définition
 * - L'étape 1 : Exercice à trou (indices des lettres manquantes à saisir au clavier)
 * - L'étape 2 : Le synonyme parmi 6 propositions (présentation séquentielle 1 par 1)
 * - L'étape 3 : L'antonyme parmi 6 propositions (présentation séquentielle 1 par 1)
 * - L'étape 4 : La phrase modèle découpée pour le glisser-déposer / clic
 */

export const WORD_MASTER_DATA = [
  {
    id: 'bienveillance',
    word: 'Bienveillance',
    definition: 'Disposition d’esprit favorable et généreuse envers autrui.',
    orthography: {
      correct: 'Bienveillance',
      missingIndices: [4, 7, 8], // v, l, l
      options: ['Bienveillance', 'Bienveillence', 'Bienveuillance', 'Bienveillanse']
    },
    synonyms: {
      correct: 'Bonté',
      options: ['Bonté', 'Sévérité', 'Audace', 'Rancœur', 'Prudence', 'Tromperie']
    },
    antonyms: {
      correct: 'Malveillance',
      options: ['Malveillance', 'Douceur', 'Générosité', 'Clémence', 'Compassion', 'Patience']
    },
    sentencePuzzle: {
      fullSentence: 'La bienveillance illumine chaque rencontre humaine.',
      words: ['La', 'bienveillance', 'illumine', 'chaque', 'rencontre', 'humaine.']
    }
  },
  {
    id: 'dilemme',
    word: 'Dilemme',
    definition: 'Situation contraignante obligeant à choisir entre deux options difficiles.',
    orthography: {
      correct: 'Dilemme',
      missingIndices: [2, 4, 5], // l, m, m
      options: ['Dilemme', 'Dilemne', 'Dileme', 'Dylemme']
    },
    synonyms: {
      correct: 'Alternative',
      options: ['Alternative', 'Solution', 'Certitude', 'Plaisir', 'Refuge', 'Promesse']
    },
    antonyms: {
      correct: 'Évidence',
      options: ['Évidence', 'Hésitation', 'Impasse', 'Conflit', 'Tiraillement', 'Doute']
    },
    sentencePuzzle: {
      fullSentence: 'Face à ce dilemme, le sage écoute son cœur.',
      words: ['Face', 'à', 'ce', 'dilemme,', 'le', 'sage', 'écoute', 'son', 'cœur.']
    }
  },
  {
    id: 'ephemere',
    word: 'Éphémère',
    definition: 'Qui ne dure que très peu de temps, passager et précieux.',
    orthography: {
      correct: 'Éphémère',
      missingIndices: [2, 3, 5], // h, é, è
      options: ['Éphémère', 'Éfémère', 'Éphémére', 'Ephemére']
    },
    synonyms: {
      correct: 'Fugace',
      options: ['Fugace', 'Éternel', 'Immuable', 'Pesant', 'Rugueux', 'Constant']
    },
    antonyms: {
      correct: 'Durable',
      options: ['Durable', 'Bref', 'Passager', 'Instable', 'Temporaire', 'Aigu']
    },
    sentencePuzzle: {
      fullSentence: 'La beauté éphémère d’une fleur touche notre âme.',
      words: ['La', 'beauté', 'éphémère', 'd’une', 'fleur', 'touche', 'notre', 'âme.']
    }
  },
  {
    id: 'apaiser',
    word: 'Apaiser',
    definition: 'Ramener au calme, adoucir une douleur ou une émotion vive.',
    orthography: {
      correct: 'Apaiser',
      missingIndices: [1, 2, 4], // p, a, s
      options: ['Apaiser', 'Appaiser', 'Apaisser', 'Appaisser']
    },
    synonyms: {
      correct: 'Calmer',
      options: ['Calmer', 'Énerver', 'Aggraver', 'Attiser', 'Surprendre', 'Secouer']
    },
    antonyms: {
      correct: 'Irriter',
      options: ['Irriter', 'Soulager', 'Tranquilliser', 'Modérer', 'Rassurer', 'Consoler']
    },
    sentencePuzzle: {
      fullSentence: 'Le chant des oiseaux aide à apaiser l’esprit.',
      words: ['Le', 'chant', 'des', 'oiseaux', 'aide', 'à', 'apaiser', 'l’esprit.']
    }
  },
  {
    id: 'accueil',
    word: 'Accueil',
    definition: 'Manière chaleureuse de recevoir une personne ou une nouvelle.',
    orthography: {
      correct: 'Accueil',
      missingIndices: [2, 3, 4], // c, u, e
      options: ['Accueil', 'Acceuil', 'Acueil', 'Aceul']
    },
    synonyms: {
      correct: 'Bienvenue',
      options: ['Bienvenue', 'Rejet', 'Distance', 'Départ', 'Refus', 'Silence']
    },
    antonyms: {
      correct: 'Rejet',
      options: ['Rejet', 'Hospitalité', 'Réception', 'Ouverture', 'Générosité', 'Chaleur']
    },
    sentencePuzzle: {
      fullSentence: 'Un accueil chaleureux ouvre les portes du dialogue.',
      words: ['Un', 'accueil', 'chaleureux', 'ouvre', 'les', 'portes', 'du', 'dialogue.']
    }
  },
  {
    id: 'audacieux',
    word: 'Audacieux',
    definition: 'Qui fait preuve de courage et ne recule pas devant les obstacles.',
    orthography: {
      correct: 'Audacieux',
      missingIndices: [1, 6, 8], // u, e, x
      options: ['Audacieux', 'Odacieux', 'Audacieu', 'Hodacieux']
    },
    synonyms: {
      correct: 'Courageux',
      options: ['Courageux', 'Craintif', 'Hésitant', 'Passif', 'Fragile', 'Discret']
    },
    antonyms: {
      correct: 'Timoré',
      options: ['Timoré', 'Intrépide', 'Brave', 'Vaillant', 'Héroïque', 'Téméraire']
    },
    sentencePuzzle: {
      fullSentence: 'Un projet audacieux demande une grande persévérance.',
      words: ['Un', 'projet', 'audacieux', 'demande', 'une', 'grande', 'persévérance.']
    }
  },
  {
    id: 'harmonie',
    word: 'Harmonie',
    definition: 'Accord parfait entre différents éléments produisant un équilibre agréable.',
    orthography: {
      correct: 'Harmonie',
      missingIndices: [0, 6, 7], // H, i, e
      options: ['Harmonie', 'Armonie', 'Harmonye', 'Harmoni']
    },
    synonyms: {
      correct: 'Concorde',
      options: ['Concorde', 'Désaccord', 'Chaos', 'Rupture', 'Conflit', 'Friction']
    },
    antonyms: {
      correct: 'Discorde',
      options: ['Discorde', 'Entente', 'Cohérence', 'Sérénité', 'Unité', 'Symbiose']
    },
    sentencePuzzle: {
      fullSentence: 'Vivre en harmonie avec la nature apporte la paix.',
      words: ['Vivre', 'en', 'harmonie', 'avec', 'la', 'nature', 'apporte', 'la', 'paix.']
    }
  },
  {
    id: 'sublime',
    word: 'Sublime',
    definition: 'D’une beauté ou d’une grandeur qui élève l’esprit et inspire l’admiration.',
    orthography: {
      correct: 'Sublime',
      missingIndices: [2, 3, 5], // b, l, m
      options: ['Sublime', 'Subblime', 'Sublyme', 'Sublimesse']
    },
    synonyms: {
      correct: 'Magnifique',
      options: ['Magnifique', 'Médiocre', 'Ordinaire', 'Sombre', 'Ternissant', 'Pauvre']
    },
    antonyms: {
      correct: 'Abject',
      options: ['Abject', 'Grandiose', 'Splendide', 'Admirable', 'Éblouissant', 'Merveilleux']
    },
    sentencePuzzle: {
      fullSentence: 'Ce tableau révèle un paysage d’un éclat sublime.',
      words: ['Ce', 'tableau', 'révèle', 'un', 'paysage', 'd’un', 'éclat', 'sublime.']
    }
  },
  {
    id: 'perseverance',
    word: 'Persévérance',
    definition: 'Qualité d’une personne qui poursuit avec ténacité ses efforts.',
    orthography: {
      correct: 'Persévérance',
      missingIndices: [1, 4, 8], // e, é, a
      options: ['Persévérance', 'Persévérence', 'Perseverance', 'Perséveranse']
    },
    synonyms: {
      correct: 'Ténacité',
      options: ['Ténacité', 'Abandon', 'Faiblesse', 'Lassitude', 'Négligence', 'Inconstance']
    },
    antonyms: {
      correct: 'Renoncement',
      options: ['Renoncement', 'Constance', 'Assiduité', 'Volonté', 'Obstination', 'Fidélité']
    },
    sentencePuzzle: {
      fullSentence: 'La persévérance transforme les petits pas en victoires.',
      words: ['La', 'persévérance', 'transforme', 'les', 'petits', 'pas', 'en', 'victoires.']
    }
  },
  {
    id: 'serenite',
    word: 'Sérénité',
    definition: 'État de calme profond et de tranquillité de l’esprit.',
    orthography: {
      correct: 'Sérénité',
      missingIndices: [1, 3, 7], // é, é, é
      options: ['Sérénité', 'Serénité', 'Séréneté', 'Séréniter']
    },
    synonyms: {
      correct: 'Quiétude',
      options: ['Quiétude', 'Angoisse', 'Tourment', 'Tempête', 'Agitation', 'Colère']
    },
    antonyms: {
      correct: 'Agitation',
      options: ['Agitation', 'Plénitude', 'Paix', 'Tranquillité', 'Repos', 'Douceur']
    },
    sentencePuzzle: {
      fullSentence: 'Une profonde sérénité rayonne dans ce jardin silencieux.',
      words: ['Une', 'profonde', 'sérénité', 'rayonne', 'dans', 'ce', 'jardin', 'silencieux.']
    }
  },
  {
    id: 'eloquence',
    word: 'Éloquence',
    definition: 'Art de s’exprimer avec aisance, persuasion et élégance.',
    orthography: {
      correct: 'Éloquence',
      missingIndices: [0, 3, 4], // É, q, u
      options: ['Éloquence', 'Éloquanse', 'Eloquence', 'Élocuence']
    },
    synonyms: {
      correct: 'Rhétorique',
      options: ['Rhétorique', 'Bafouillage', 'Mutisme', 'Hésitation', 'Confusion', 'Régression']
    },
    antonyms: {
      correct: 'Balbutiement',
      options: ['Balbutiement', 'Béloquence', 'Verbe', 'Aisance', 'Persuasion', 'Talent']
    },
    sentencePuzzle: {
      fullSentence: 'Son éloquence captive l’auditoire du premier mot.',
      words: ['Son', 'éloquence', 'captive', 'l’auditoire', 'du', 'premier', 'mot.']
    }
  },
  {
    id: 'sincere',
    word: 'Sincère',
    definition: 'Qui exprime avec franchise et fidélité ses sentiments véritables.',
    orthography: {
      correct: 'Sincère',
      missingIndices: [0, 3, 4], // S, c, è
      options: ['Sincère', 'Sinscère', 'Sinsère', 'Sincer']
    },
    synonyms: {
      correct: 'Franc',
      options: ['Franc', 'Hypocrite', 'Fourbe', 'Trompeur', 'Masqué', 'Faux']
    },
    antonyms: {
      correct: 'Fourbe',
      options: ['Fourbe', 'Loyal', 'Authentique', 'Vrai', 'Droit', 'Honnête']
    },
    sentencePuzzle: {
      fullSentence: 'Un sourire sincère réchauffe les cœurs les plus froids.',
      words: ['Un', 'sourire', 'sincère', 'réchauffe', 'les', 'cœurs', 'les', 'plus', 'froids.']
    }
  }
];
