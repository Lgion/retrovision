import React from 'react';
import Boutique from '../components/Boutique';

const themeItems = [
  { id: 'parchment', name: 'Parchemin Doré', icon: '📜', description: 'Papier ancien velouté & dorures raffinées' },
  { id: 'library', name: 'Bibliothèque Royale', icon: '🏛️', description: 'Boiseries nobles & velours vert sauge' },
  { id: 'ink_night', name: 'Nuit d’Encre', icon: '🌌', description: 'Bleu nuit profond & plumes d’or étincelantes' },
  { id: 'minimal_ivory', name: 'Ivoire Épuré', icon: '🕊️', description: 'Style contemporain sobre & haute clarté' },
  { id: 'velvet_lounge', name: 'Salon Littéraire', icon: '🛋️', description: 'Velours bordeaux impérial & lueurs tamisées' },
  { id: 'botanical', name: 'Herbier Poétique', icon: '🌿', description: 'Papier kraft végétal, flore délicate & vert sauge' },
  { id: 'cafe_poetes', name: 'Café des Auteurs', icon: '☕', description: 'Boiseries bistrot parisien, tons noisette & zinc' },
  { id: 'aurore', name: 'Aurore d’Écrivain', icon: '🌅', description: 'Teintes poudrées pêche & douce clarté matinale' }
];

const typographyItems = [
  { id: 'serif_classic', name: 'Plume Calligraphique', icon: '✒️', description: 'Élégance des manuscrits et typographie littéraire (Merriweather / Georgia)' },
  { id: 'sans_modern', name: 'Moderne Épurée', icon: '🔤', description: 'Typographie contemporaine nette pour une lecture rapide (Inter / Plus Jakarta)' },
  { id: 'humanist', name: 'Lettres d’Or Célestes', icon: '✨', description: 'Courbes douces et grand confort visuel pour les yeux (Outfit)' },
  { id: 'gazette', name: 'Presse & Gazettes', icon: '📰', description: 'Caractères romanesques d’imprimerie d’art (Playfair Display)' },
  { id: 'dys_comfort', name: 'Confort de Lecture Dys', icon: '📖', description: 'Espacements généreux et contours distincts pour une lecture sans fatigue' }
];

const cardStyleItems = [
  { id: 'gold_seal', name: 'Liseré d’Or & Sceau', icon: '⚜️', description: 'Bordures dorées délicates et cachet de cire pourpre' },
  { id: 'mineral_slate', name: 'Ardoise & Galet', icon: '🪨', description: 'Angles adoucis, texture minérale et contraste reposant' },
  { id: 'embossed_paper', name: 'Papier Gaufré', icon: '📜', description: 'Effet gaufré en relief doux et ombres délicates' },
  { id: 'bevelled', name: 'Parchemin Biseauté', icon: '🪶', description: 'Coins biseautés vintage et filigrane d’écriture manuscrite' },
  { id: 'frosted_glass', name: 'Verre Givré Translucide', icon: '🧊', description: 'Effet glassmorphism contemporain et reflets soyeux' }
];

const assistanceItems = [
  { id: 'standard', name: 'Parcours Équilibré', icon: '⚖️', description: 'Difficulté classique : 2 lettres clés masquées' },
  { id: 'first_letter_hint', name: 'Indice Première Lettre', icon: '💡', description: 'Affiche un indice discret sur la première lettre manquante' },
  { id: 'serenity', name: 'Mode Sérénité Zen', icon: '🧘', description: 'Zéro pénalité en cas d’hésitation, plaisir d’apprendre sans pression' },
  { id: 'expert_challenge', name: 'Défi Maître des Mots', icon: '🎓', description: 'Masque davantage de lettres pour stimuler activement la mémoire' }
];

const soundScapeItems = [
  { id: 'feather', name: 'Plume & Papier Velouté', icon: '🪶', description: 'Bruissements délicats d’une plume d’oie sur parchemin' },
  { id: 'typewriter', name: 'Machine à Écrire Vintage', icon: '⌨️', description: 'Cliquetis mécaniques rétro feutrés et clochette d’époque' },
  { id: 'celestial', name: 'Carillons Cristallins', icon: '🔔', description: 'Harmoniques zen cristallines à chaque lettre découverte' },
  { id: 'subtle', name: 'Mode Feutré Discret', icon: '🤫', description: 'Retours sonores atténués très doux' }
];

const celebrationItems = [
  { id: 'gold_feathers', name: 'Pluie de Plumes d’Or', icon: '✨', description: 'Éclats scintillants dorés et plumes tourbillonnantes' },
  { id: 'sakura', name: 'Pétales de Cerisier', icon: '🌸', description: 'Douce envolée poétique de pétales rose poudré' },
  { id: 'autumn', name: 'Feuilles d’Automne', icon: '🍂', description: 'Valse automnale chaleureuse et apaisante' },
  { id: 'stars', name: 'Constellation Céleste', icon: '⭐', description: 'Gerbe d’étoiles filantes scintillantes' }
];

const categories = [
  {
    id: 'theme',
    name: 'Ambiance Visuelle',
    icon: '🎨',
    items: themeItems
  },
  {
    id: 'typography',
    name: 'Style Typographique',
    icon: '✒️',
    items: typographyItems
  },
  {
    id: 'cardStyle',
    name: 'Style des Cartes',
    icon: '🃏',
    items: cardStyleItems
  },
  {
    id: 'assistance',
    name: 'Accompagnement & Défi',
    icon: '🧭',
    items: assistanceItems
  },
  {
    id: 'soundScape',
    name: 'Ambiance Sonore',
    icon: '🎵',
    items: soundScapeItems
  },
  {
    id: 'celebration',
    name: 'Effets de Célébration',
    icon: '🎉',
    items: celebrationItems
  }
];

export default function WordMasterCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE DE L'ATELIER"
      icon="✍️"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
