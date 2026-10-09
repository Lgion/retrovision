import React from 'react';
import Boutique from '../components/Boutique';

const sceneItems = [
  { id: 'countryside', name: 'La Vallée Champêtre (HD)', icon: '🌄', description: 'Prairies verdoyantes, route sinueuse, animaux & sentier' },
  { id: 'city', name: 'L’Avenue Urbaine (HD)', icon: '🏙️', description: 'Grand boulevard, piste cyclable rouge & terrasses' },
  { id: 'beach', name: 'La Grande Plage', icon: '🏖️', description: 'Parasols, châteaux de sable & baigneurs joyeux' },
  { id: 'fair', name: 'La Fête Foraine', icon: '🎡', description: 'Grande roue, stands de tir & gourmandises' },
  { id: 'carnival', name: 'Le Carnaval de Rue', icon: '🎭', description: 'Confettis, masques festifs & défilé animé' },
  { id: 'market', name: 'Le Marché Médiéval', icon: '🏰', description: 'Échoppes d’antan, chevaliers & saltimbanques' },
  { id: 'park', name: 'Le Parc Champêtre', icon: '🌿', description: 'Pelouse verdoyante, étang paisible & allées fleuries' },
  { id: 'winter', name: 'La Station Enneigée', icon: '❄️', description: 'Chalets en bois, sapins givrés & blancheur hivernale' }
];

const timerItems = [
  { id: 'relax', name: 'Chrono Relax (75s)', icon: '🟢', description: 'Plus de temps pour observer chaque détail' },
  { id: 'standard', name: 'Chrono Standard (55s)', icon: '🟡', description: 'Le parfait équilibre entre défi et détente' },
  { id: 'express', name: 'Chrono Express (35s)', icon: '🔴', description: 'Pour les yeux d’aigle et réflexes vifs' }
];

const sizeItems = [
  { id: 'standard', name: 'Taille Confortable (Grande)', icon: '👁️', description: 'Objets vectoriels nets et bien lisibles' },
  { id: 'large', name: 'Format Très Grand (+20%)', icon: '🔍', description: 'Confort visuel renforcé pour repérer les détails' },
  { id: 'giant', name: 'Format Géant (+40%)', icon: '🔎', description: 'Grossissement maximal pour une visibilité absolue' }
];

const categories = [
  {
    id: 'scene',
    name: 'Scène & Décor de Fond',
    icon: '🗺️',
    items: sceneItems
  },
  {
    id: 'timerMode',
    name: 'Rythme du Chronomètre',
    icon: '⏱️',
    items: timerItems
  },
  {
    id: 'elementSize',
    name: 'Taille des Personnages & Objets',
    icon: '📏',
    items: sizeItems
  }
];

export default function FindCharlieCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE TROUVEZ CHARLIE"
      icon="🕵️‍♂️"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
