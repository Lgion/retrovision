import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const themeItems = (GAME_THEME_DETAILS.carillon || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const roundsItems = [
  { id: 3, name: 'Mélodie Courte (3 notes)', icon: '🟢', description: 'Victoire dès une mélodie de 3 notes mémorisée' },
  { id: 5, name: 'Harmonie (5 notes)', icon: '🟡', description: 'Progression classique : victoire après 5 notes consécutives' },
  { id: 7, name: 'Grande Symphonie (7 notes)', icon: '🔴', description: 'Défi expert : mémoriser jusqu’à 7 notes consécutives' }
];

const categories = [
  {
    id: 'theme',
    name: 'Ambiance Sonore',
    icon: '🔔',
    items: themeItems
  },
  {
    id: 'rounds',
    name: 'Objectif de Victoire (Notes Max)',
    icon: '🎶',
    items: roundsItems
  }
];

export default function CarillonCelesteCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE CARILLON"
      icon="🔔"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
