import React from 'react';

/**
 * Composants vectoriels SVG haute fidélité pour le jeu « Trouvez Charlie ! »
 * Fournit :
 * - Charlie en pied avec son pull marinier rayé rouge et blanc, son bonnet, lunettes et canne
 * - Ouaf le chien avec son bonnet rayé et ses lunettes
 * - Les objets récurrents (lunettes, canne, appareil photo, clé secrète, bonnet, boussole)
 * - Les décors panoramiques de fond immersifs (Plage, Fête Foraine, Carnaval, Marché Médiéval)
 * - Les personnages de foule (figurants variés)
 */

// --- 1. PERSONNAGE PRINCIPAL : CHARLIE ---
export function CharlieFigure({ size = 58, style = {} }) {
  return (
    <svg
      viewBox="0 0 60 76"
      width={size * 0.8}
      height={size}
      style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.35))', ...style }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pompon du bonnet */}
      <circle cx="30" cy="4" r="3.5" fill="#DC2626" />

      {/* Bonnet rayé rouge et blanc */}
      <path d="M21 16 Q30 6 39 16 Z" fill="#DC2626" />
      <path d="M23 13 Q30 7 37 13" stroke="#FFFFFF" strokeWidth="2.5" />
      {/* Revers du bonnet */}
      <rect x="20" y="15" width="20" height="3" rx="1.5" fill="#FFFFFF" stroke="#DC2626" strokeWidth="0.5" />

      {/* Visage */}
      <circle cx="30" cy="22" r="7" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.5" />
      {/* Cheveux bruns */}
      <path d="M23 20 Q24 16 30 16 Q36 16 37 20 Q35 18 30 18 Q25 18 23 20 Z" fill="#78350F" />

      {/* Lunettes rondes caractéristiques */}
      <circle cx="27" cy="22" r="2.8" stroke="#0F172A" strokeWidth="1.2" fill="rgba(255,255,255,0.7)" />
      <circle cx="33" cy="22" r="2.8" stroke="#0F172A" strokeWidth="1.2" fill="rgba(255,255,255,0.7)" />
      <line x1="29.8" y1="22" x2="30.2" y2="22" stroke="#0F172A" strokeWidth="1.2" />
      {/* Yeux souriants */}
      <circle cx="27" cy="22" r="0.8" fill="#0F172A" />
      <circle cx="33" cy="22" r="0.8" fill="#0F172A" />
      {/* Sourire */}
      <path d="M28 25 Q30 27 32 25" stroke="#991B1B" strokeWidth="0.8" strokeLinecap="round" />

      {/* Corps / Pull rayé rouge et blanc */}
      <rect x="22" y="29" width="16" height="22" rx="3" fill="#DC2626" />
      {/* Rayures blanches horizontales */}
      <line x1="22" y1="33" x2="38" y2="33" stroke="#FFFFFF" strokeWidth="2.5" />
      <line x1="22" y1="38" x2="38" y2="38" stroke="#FFFFFF" strokeWidth="2.5" />
      <line x1="22" y1="43" x2="38" y2="43" stroke="#FFFFFF" strokeWidth="2.5" />
      <line x1="22" y1="48" x2="38" y2="48" stroke="#FFFFFF" strokeWidth="2.5" />

      {/* Bras gauche et droit */}
      <path d="M22 31 L17 42" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
      <path d="M17 42 L17 44" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M38 31 L43 42" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
      <path d="M43 42 L43 44" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />

      {/* Canne en bois dans la main */}
      <path d="M43 43 L45 68" stroke="#854D0E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M43 43 Q46 39 44 37" stroke="#854D0E" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Pantalon bleu jean */}
      <path d="M23 50 L25 66 L29 66 L30 54 L31 66 L35 66 L37 50 Z" fill="#1D4ED8" />

      {/* Chaussures brunes */}
      <ellipse cx="26" cy="68" rx="3.5" ry="2" fill="#78350F" />
      <ellipse cx="34" cy="68" rx="3.5" ry="2" fill="#78350F" />
    </svg>
  );
}

// --- 2. COMPAGNON : OUAF LE CHIEN ---
export function DogFigure({ size = 52, style = {} }) {
  return (
    <svg
      viewBox="0 0 54 50"
      width={size * 1.08}
      height={size}
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))', ...style }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Queue dressée remuante */}
      <path d="M12 28 Q8 18 13 14" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />

      {/* Corps du chien roux/doré */}
      <ellipse cx="24" cy="30" rx="14" ry="10" fill="#F59E0B" />

      {/* Pattes */}
      <rect x="15" y="36" width="3.5" height="10" rx="1.5" fill="#D97706" />
      <rect x="22" y="36" width="3.5" height="10" rx="1.5" fill="#D97706" />
      <rect x="29" y="36" width="3.5" height="10" rx="1.5" fill="#D97706" />

      {/* Tête */}
      <circle cx="36" cy="22" r="9" fill="#FDE68A" stroke="#D97706" strokeWidth="0.5" />
      {/* Museau */}
      <ellipse cx="43" cy="24" rx="5" ry="3.5" fill="#FEF3C7" />
      <ellipse cx="46" cy="23" rx="1.8" ry="1.2" fill="#0F172A" />

      {/* Oreille tombante rousse */}
      <ellipse cx="30" cy="20" rx="3.5" ry="6" transform="rotate(-20 30 20)" fill="#B45309" />

      {/* Bonnet rayé Ouaf */}
      <path d="M33 15 Q38 8 43 15 Z" fill="#DC2626" />
      <line x1="34" y1="13" x2="42" y2="13" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="38" cy="7" r="2.5" fill="#DC2626" />

      {/* Petites lunettes rondes de Ouaf */}
      <circle cx="37" cy="20" r="2.8" stroke="#0F172A" strokeWidth="1" fill="rgba(255,255,255,0.7)" />
      <circle cx="42" cy="20" r="2.8" stroke="#0F172A" strokeWidth="1" fill="rgba(255,255,255,0.7)" />
      <line x1="39.8" y1="20" x2="40.2" y2="20" stroke="#0F172A" strokeWidth="1" />
    </svg>
  );
}

// --- 3. LES OBJETS SECRETS ---

export function GlassesFigure({ size = 46, style = {} }) {
  return (
    <svg
      viewBox="0 0 50 30"
      width={size * 1.4}
      height={size * 0.85}
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))', ...style }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Monture cerclée noire */}
      <circle cx="16" cy="16" r="10" stroke="#0F172A" strokeWidth="2.5" fill="rgba(56, 189, 248, 0.25)" />
      <circle cx="34" cy="16" r="10" stroke="#0F172A" strokeWidth="2.5" fill="rgba(56, 189, 248, 0.25)" />
      {/* Pont nasal */}
      <path d="M25 15 Q25 12 26 15" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Branches fines */}
      <path d="M6 14 Q2 10 1 8" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 14 Q48 10 49 8" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      {/* Reflets de verre */}
      <path d="M12 12 Q18 12 19 18" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <path d="M30 12 Q36 12 37 18" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function CaneFigure({ size = 48, style = {} }) {
  return (
    <svg
      viewBox="0 0 36 60"
      width={size * 0.6}
      height={size}
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))', ...style }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Crosse courbée */}
      <path
        d="M26 18 Q26 6 16 6 Q6 6 6 18 L6 54"
        stroke="#854D0E"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bague en laiton poli */}
      <rect x="4" y="24" width="4" height="3" fill="#EAB308" />
      {/* Embout de protection */}
      <rect x="4" y="52" width="4" height="4" rx="1" fill="#1E293B" />
      {/* Liseré verni */}
      <path d="M16 8 Q23 8 23 16" stroke="#FEF08A" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}

export function CameraFigure({ size = 46, style = {} }) {
  return (
    <svg
      viewBox="0 0 54 44"
      width={size * 1.2}
      height={size}
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))', ...style }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sangle */}
      <path d="M8 12 Q27 -2 46 12" stroke="#78350F" strokeWidth="2.5" fill="none" />
      {/* Boîtier vintage */}
      <rect x="6" y="12" width="42" height="28" rx="5" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
      {/* Bande argentée supérieure */}
      <rect x="6" y="12" width="42" height="8" rx="2" fill="#CBD5E1" />
      {/* Flash / Déclencheur */}
      <rect x="10" y="8" width="8" height="4" rx="1" fill="#94A3B8" />
      <circle cx="40" cy="16" r="2.5" fill="#EF4444" />
      {/* Grand Objectif */}
      <circle cx="27" cy="27" r="11" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
      <circle cx="27" cy="27" r="7" fill="#1E293B" />
      <circle cx="27" cy="27" r="4" fill="#38BDF8" opacity="0.75" />
      <circle cx="25" cy="25" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

export function KeyFigure({ size = 46, style = {} }) {
  return (
    <svg
      viewBox="0 0 52 32"
      width={size * 1.35}
      height={size * 0.82}
      style={{ filter: 'drop-shadow(0 2px 5px rgba(234, 179, 8, 0.4))', ...style }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Anneau doré ouvragé */}
      <circle cx="14" cy="16" r="10" stroke="#EAB308" strokeWidth="3.5" fill="#FEF08A" />
      <circle cx="14" cy="16" r="4.5" fill="#0b1728" />
      {/* Tige de la clé */}
      <rect x="22" y="14" width="24" height="4" rx="1.5" fill="#EAB308" />
      {/* Panneton dentelé */}
      <rect x="38" y="18" width="3.5" height="7" rx="1" fill="#EAB308" />
      <rect x="43" y="18" width="3.5" height="5" rx="1" fill="#EAB308" />
      {/* Éclat étincelant */}
      <path d="M14 6 L15 10 L19 11 L15 12 L14 16 L13 12 L9 11 L13 10 Z" fill="#FFFFFF" />
    </svg>
  );
}

export function BeanieFigure({ size = 46, style = {} }) {
  return (
    <svg
      viewBox="0 0 46 40"
      width={size * 1.15}
      height={size}
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))', ...style }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gros pompon rouge */}
      <circle cx="23" cy="7" r="6" fill="#DC2626" />
      <circle cx="21" cy="5" r="2" fill="#FCA5A5" opacity="0.6" />

      {/* Dôme du bonnet */}
      <path d="M8 32 C8 12 38 12 38 32 Z" fill="#DC2626" />
      {/* Rayures blanches */}
      <path d="M12 25 Q23 18 34 25" stroke="#FFFFFF" strokeWidth="3.5" fill="none" />
      <path d="M17 19 Q23 14 29 19" stroke="#FFFFFF" strokeWidth="3" fill="none" />

      {/* Revers tricoté avec côtes */}
      <rect x="6" y="30" width="34" height="7" rx="3" fill="#FFFFFF" stroke="#DC2626" strokeWidth="1" />
      <line x1="14" y1="30" x2="14" y2="37" stroke="#E2E8F0" strokeWidth="1.2" />
      <line x1="23" y1="30" x2="23" y2="37" stroke="#E2E8F0" strokeWidth="1.2" />
      <line x1="32" y1="30" x2="32" y2="37" stroke="#E2E8F0" strokeWidth="1.2" />
    </svg>
  );
}

export function CompassFigure({ size = 46, style = {} }) {
  return (
    <svg
      viewBox="0 0 46 46"
      width={size}
      height={size}
      style={{ filter: 'drop-shadow(0 2px 5px rgba(13, 148, 136, 0.4))', ...style }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bague d'attache supérieure */}
      <circle cx="23" cy="4" r="3.5" stroke="#D97706" strokeWidth="1.5" fill="none" />
      {/* Boîtier en laiton / cuivre */}
      <circle cx="23" cy="25" r="18" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
      <circle cx="23" cy="25" r="15" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />

      {/* Graduations N, S, E, O */}
      <text x="23" y="16" fill="#0F172A" fontSize="5" fontWeight="900" textAnchor="middle">N</text>
      <text x="23" y="38" fill="#0F172A" fontSize="5" fontWeight="900" textAnchor="middle">S</text>
      <text x="34" y="27" fill="#0F172A" fontSize="5" fontWeight="900" textAnchor="middle">E</text>
      <text x="12" y="27" fill="#0F172A" fontSize="5" fontWeight="900" textAnchor="middle">O</text>

      {/* Aiguille bicolore Nord Rouge / Sud Bleu */}
      <polygon points="23,14 25.5,25 20.5,25" fill="#DC2626" />
      <polygon points="23,36 25.5,25 20.5,25" fill="#2563EB" />
      <circle cx="23" cy="25" r="2.2" fill="#EAB308" stroke="#78350F" strokeWidth="0.8" />
    </svg>
  );
}

// Fonction utilitaire pour rendre n'importe quelle cible par clé
export function renderTargetIcon(targetKey, size = 48) {
  switch (targetKey) {
    case 'charlie':
      return <CharlieFigure size={size} />;
    case 'dog':
      return <DogFigure size={size} />;
    case 'glasses':
      return <GlassesFigure size={size} />;
    case 'cane':
      return <CaneFigure size={size} />;
    case 'camera':
      return <CameraFigure size={size} />;
    case 'key':
      return <KeyFigure size={size} />;
    case 'beanie':
      return <BeanieFigure size={size} />;
    case 'compass':
      return <CompassFigure size={size} />;
    default:
      return <span style={{ fontSize: `${size * 0.7}px` }}>🔍</span>;
  }
}

// --- 3.5 FIGURANTS ET LEURRES DE FOULE VECTORIELS SVG (ZÉRO ÉMOJI DE TÉLÉPHONE) ---

// 1. Promeneur rayé vert (leurre parfait pour Charlie)
export function DecoyPersonStripes({ size = 42, color = '#16a34a', style = {} }) {
  return (
    <svg viewBox="0 0 50 68" width={size * 0.75} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', ...style }}>
      {/* Tête & cheveux */}
      <circle cx="25" cy="14" r="7.5" fill="#fde047" stroke="#ca8a04" strokeWidth="0.5" />
      <path d="M18 13 Q25 7 32 13 Q31 9 25 9 Q19 9 18 13 Z" fill="#451a03" />
      <circle cx="23" cy="14" r="0.8" fill="#0f172a" />
      <circle cx="27" cy="14" r="0.8" fill="#0f172a" />
      {/* Pull rayé vert ou bleu */}
      <rect x="18" y="22" width="14" height="20" rx="3" fill={color} />
      <line x1="18" y1="26" x2="32" y2="26" stroke="#ffffff" strokeWidth="2.5" />
      <line x1="18" y1="31" x2="32" y2="31" stroke="#ffffff" strokeWidth="2.5" />
      <line x1="18" y1="36" x2="32" y2="36" stroke="#ffffff" strokeWidth="2.5" />
      {/* Bras */}
      <path d="M18 24 L13 34" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M32 24 L37 34" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Pantalon */}
      <path d="M19 41 L21 58 L24 58 L25 45 L26 58 L29 58 L31 41 Z" fill="#334155" />
      {/* Chaussures */}
      <ellipse cx="22" cy="60" rx="3" ry="1.5" fill="#1e293b" />
      <ellipse cx="28" cy="60" rx="3" ry="1.5" fill="#1e293b" />
    </svg>
  );
}

// 2. Promeneur t-shirt rouge uni avec casquette
export function DecoyPersonCasual({ size = 42, color = '#dc2626', style = {} }) {
  return (
    <svg viewBox="0 0 50 68" width={size * 0.75} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', ...style }}>
      {/* Casquette */}
      <path d="M17 12 Q25 5 33 12 Z" fill={color} />
      <line x1="15" y1="12" x2="26" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="25" cy="15" r="6.5" fill="#fed7aa" />
      {/* T-Shirt */}
      <rect x="18" y="22" width="14" height="20" rx="3" fill={color} />
      <path d="M18 24 L12 33" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M32 24 L38 33" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Jean */}
      <path d="M19 41 L20 58 L24 58 L25 45 L26 58 L30 58 L31 41 Z" fill="#2563eb" />
      <ellipse cx="21" cy="60" rx="3" ry="1.5" fill="#475569" />
      <ellipse cx="29" cy="60" rx="3" ry="1.5" fill="#475569" />
    </svg>
  );
}

// 3. Promeneuse en robe
export function DecoyPersonDress({ size = 42, color = '#eab308', style = {} }) {
  return (
    <svg viewBox="0 0 50 68" width={size * 0.75} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', ...style }}>
      {/* Chapeau de paille */}
      <ellipse cx="25" cy="11" rx="14" ry="4" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
      <circle cx="25" cy="10" r="5" fill="#facc15" />
      <circle cx="25" cy="16" r="6" fill="#fed7aa" />
      {/* Robe évasée */}
      <polygon points="21,23 29,23 35,46 15,46" fill={color} />
      <path d="M21 24 L14 34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M29 24 L36 34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Jambes */}
      <line x1="22" y1="46" x2="22" y2="58" stroke="#fed7aa" strokeWidth="2.5" />
      <line x1="28" y1="46" x2="28" y2="58" stroke="#fed7aa" strokeWidth="2.5" />
      <ellipse cx="22" cy="59" rx="2.5" ry="1.2" fill="#e11d48" />
      <ellipse cx="28" cy="59" rx="2.5" ry="1.2" fill="#e11d48" />
    </svg>
  );
}

// 4. Coureur athlétique
export function DecoyPersonRunner({ size = 42, color = '#f97316', style = {} }) {
  return (
    <svg viewBox="0 0 52 68" width={size * 0.8} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', ...style }}>
      <circle cx="28" cy="13" r="6" fill="#fde047" />
      {/* Torse penché en avant */}
      <path d="M20 22 L32 20 L28 40 L18 40 Z" fill={color} />
      {/* Bras en course */}
      <path d="M24 22 L38 28" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M20 24 L10 20" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Jambes en foulée */}
      <path d="M26 40 L38 52 L34 58" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M20 40 L10 50 L14 58" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="34" cy="59" rx="3" ry="1.5" fill="#ef4444" />
      <ellipse cx="15" cy="59" rx="3" ry="1.5" fill="#ef4444" />
    </svg>
  );
}

// 5. Chien leurre (brun, pas de lunettes ni bonnet)
export function DecoyDog({ size = 40, color = '#b45309', style = {} }) {
  return (
    <svg viewBox="0 0 50 44" width={size * 1.1} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', ...style }}>
      <path d="M10 24 Q6 14 12 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="22" cy="26" rx="13" ry="9" fill={color} />
      <rect x="14" y="32" width="3" height="8" rx="1.5" fill="#78350f" />
      <rect x="21" y="32" width="3" height="8" rx="1.5" fill="#78350f" />
      <rect x="28" y="32" width="3" height="8" rx="1.5" fill="#78350f" />
      <circle cx="34" cy="18" r="8" fill="#d97706" />
      <ellipse cx="40" cy="20" rx="4" ry="3" fill="#fde68a" />
      <ellipse cx="42" cy="19" rx="1.5" ry="1" fill="#0f172a" />
      <ellipse cx="28" cy="16" rx="3" ry="5" transform="rotate(-15 28 16)" fill="#78350f" />
      <circle cx="35" cy="16" r="1.2" fill="#0f172a" />
      {/* Collier bleu simple */}
      <path d="M28 22 Q32 25 36 22" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 6. Petit chat gris
export function DecoyCat({ size = 36, color = '#64748b', style = {} }) {
  return (
    <svg viewBox="0 0 42 42" width={size} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', ...style }}>
      <path d="M8 26 Q4 16 10 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="20" cy="28" rx="10" ry="8" fill={color} />
      <circle cx="28" cy="18" r="7" fill={color} />
      {/* Oreilles triangulaires */}
      <polygon points="24,13 22,8 26,11" fill={color} />
      <polygon points="30,11 34,8 32,13" fill={color} />
      <circle cx="27" cy="17" r="1" fill="#10b981" />
      <circle cx="31" cy="17" r="1" fill="#10b981" />
      <polygon points="29,19 28,18 30,18" fill="#f43f5e" />
    </svg>
  );
}

// 7. Parasol de plage ouvert
export function DecoyUmbrella({ size = 44, color = '#ef4444', style = {} }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.25))', ...style }}>
      <line x1="24" y1="18" x2="24" y2="44" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 24 C6 12 42 12 42 24 Z" fill={color} />
      {/* Bandes blanches alternées */}
      <path d="M15 15 Q24 24 18 24" stroke="#ffffff" strokeWidth="3" fill="none" />
      <path d="M33 15 Q24 24 30 24" stroke="#ffffff" strokeWidth="3" fill="none" />
      <circle cx="24" cy="11" r="2" fill="#fbbf24" />
    </svg>
  );
}

// 8. Ballon rouge volant avec ficelle
export function DecoyBalloon({ size = 42, color = '#dc2626', style = {} }) {
  return (
    <svg viewBox="0 0 40 54" width={size * 0.74} height={size} fill="none" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))', ...style }}>
      <ellipse cx="20" cy="18" rx="14" ry="17" fill={color} />
      <ellipse cx="16" cy="13" rx="4" ry="7" fill="#fca5a5" opacity="0.6" />
      <polygon points="18,34 22,34 20,37" fill={color} />
      <path d="M20 37 Q24 43 18 47 Q22 51 20 54" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 9. Ballon de plage bicolore
export function DecoyBeachBall({ size = 38, style = {} }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', ...style }}>
      <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
      <path d="M20 2 C12 10 12 30 20 38" fill="#ef4444" />
      <path d="M20 2 C28 10 28 30 20 38" fill="#facc15" />
      <ellipse cx="20" cy="20" rx="3" ry="3" fill="#ffffff" />
    </svg>
  );
}

// 10. Cornet de glace
export function DecoyIceCream({ size = 38, style = {} }) {
  return (
    <svg viewBox="0 0 36 50" width={size * 0.72} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', ...style }}>
      {/* Gaufre */}
      <polygon points="8,24 28,24 18,48" fill="#d97706" stroke="#b45309" strokeWidth="1" />
      <line x1="12" y1="28" x2="22" y2="40" stroke="#b45309" strokeWidth="1" />
      <line x1="24" y1="28" x2="14" y2="40" stroke="#b45309" strokeWidth="1" />
      {/* Boule 1 Fraise */}
      <circle cx="18" cy="20" r="9" fill="#f43f5e" />
      {/* Boule 2 Pistache */}
      <circle cx="18" cy="11" r="7.5" fill="#10b981" />
      {/* Cerise */}
      <circle cx="18" cy="3" r="3" fill="#991b1b" />
    </svg>
  );
}

// 11. Petite tente foraine rayée
export function DecoyTent({ size = 44, color = '#dc2626', style = {} }) {
  return (
    <svg viewBox="0 0 54 44" width={size * 1.2} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', ...style }}>
      <polygon points="6,38 27,8 48,38" fill={color} />
      <polygon points="16,38 27,8 38,38" fill="#ffffff" />
      <polygon points="23,38 27,8 31,38" fill={color} />
      <line x1="27" y1="8" x2="27" y2="2" stroke="#d97706" strokeWidth="1.5" />
      <polygon points="27,2 32,4 27,6" fill="#facc15" />
    </svg>
  );
}

// 12. Cerf-volant losange
export function DecoyKite({ size = 42, color = '#a855f7', style = {} }) {
  return (
    <svg viewBox="0 0 46 54" width={size * 0.85} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', ...style }}>
      <polygon points="23,4 38,22 23,40 8,22" fill={color} stroke="#6b21a8" strokeWidth="1.5" />
      <line x1="23" y1="4" x2="23" y2="40" stroke="#ffffff" strokeWidth="1.5" />
      <line x1="8" y1="22" x2="38" y2="22" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M23 40 Q28 46 22 50 Q26 53 24 56" stroke="#facc15" strokeWidth="1.5" fill="none" />
      <circle cx="26" cy="46" r="2" fill="#ef4444" />
      <circle cx="23" cy="52" r="2" fill="#3b82f6" />
    </svg>
  );
}

// 13. Valise rétro marron
export function DecoySuitcase({ size = 40, color = '#854d0e', style = {} }) {
  return (
    <svg viewBox="0 0 46 38" width={size * 1.2} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', ...style }}>
      <rect x="6" y="12" width="34" height="24" rx="4" fill={color} stroke="#713f12" strokeWidth="1.5" />
      <rect x="18" y="6" width="10" height="6" rx="2" stroke="#eab308" strokeWidth="2" fill="none" />
      <line x1="16" y1="12" x2="16" y2="36" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="30" y1="12" x2="30" y2="36" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="16" cy="20" r="1.5" fill="#fef08a" />
      <circle cx="30" cy="20" r="1.5" fill="#fef08a" />
    </svg>
  );
}

// 14. Bicyclette rétro stylisée
export function DecoyBicycle({ size = 44, color = '#0d9488', style = {} }) {
  return (
    <svg viewBox="0 0 54 36" width={size * 1.5} height={size} fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', ...style }}>
      <circle cx="12" cy="24" r="9" stroke="#334155" strokeWidth="2.5" fill="none" />
      <circle cx="42" cy="24" r="9" stroke="#334155" strokeWidth="2.5" fill="none" />
      <line x1="12" y1="24" x2="26" y2="24" stroke={color} strokeWidth="2.5" />
      <line x1="26" y1="24" x2="38" y2="12" stroke={color} strokeWidth="2.5" />
      <line x1="12" y1="24" x2="22" y2="12" stroke={color} strokeWidth="2.5" />
      <line x1="22" y1="12" x2="34" y2="12" stroke={color} strokeWidth="2.5" />
      <line x1="38" y1="12" x2="42" y2="24" stroke={color} strokeWidth="2.5" />
      {/* Selle & guidon */}
      <line x1="19" y1="10" x2="25" y2="10" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
      <path d="M35 8 L39 8 L41 12" stroke="#64748b" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Rendu universel des leurres de foule vectoriels
export function renderCrowdDecoy(decoyKey = 'decoy_stripes_green', size = 42, color) {
  switch (decoyKey) {
    case 'decoy_stripes_green':
      return <DecoyPersonStripes size={size} color={color || '#16a34a'} />;
    case 'decoy_stripes_blue':
      return <DecoyPersonStripes size={size} color={color || '#2563eb'} />;
    case 'decoy_casual_red':
      return <DecoyPersonCasual size={size} color={color || '#dc2626'} />;
    case 'decoy_casual_purple':
      return <DecoyPersonCasual size={size} color={color || '#9333ea'} />;
    case 'decoy_dress_yellow':
      return <DecoyPersonDress size={size} color={color || '#eab308'} />;
    case 'decoy_runner_orange':
      return <DecoyPersonRunner size={size} color={color || '#f97316'} />;
    case 'decoy_dog':
      return <DecoyDog size={size} color={color || '#b45309'} />;
    case 'decoy_cat':
      return <DecoyCat size={size} color={color || '#64748b'} />;
    case 'decoy_umbrella':
      return <DecoyUmbrella size={size} color={color || '#ef4444'} />;
    case 'decoy_balloon':
      return <DecoyBalloon size={size} color={color || '#dc2626'} />;
    case 'decoy_beach_ball':
      return <DecoyBeachBall size={size} />;
    case 'decoy_icecream':
      return <DecoyIceCream size={size} />;
    case 'decoy_tent':
      return <DecoyTent size={size} color={color || '#dc2626'} />;
    case 'decoy_kite':
      return <DecoyKite size={size} color={color || '#a855f7'} />;
    case 'decoy_suitcase':
      return <DecoySuitcase size={size} color={color || '#854d0e'} />;
    case 'decoy_bicycle':
      return <DecoyBicycle size={size} color={color || '#0d9488'} />;
    default:
      return <DecoyPersonCasual size={size} color={color || '#3b82f6'} />;
  }
}

// --- 4. ARRIÈRE-PLANS PANORAMIQUES IMMERSIFS POUR LA GRILLE ---

export function BeachBackground() {
  return (
    <svg
      viewBox="0 0 1000 650"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
      </defs>

      {/* Ciel bleu d'été */}
      <rect x="0" y="0" width="1000" height="180" fill="url(#skyGrad)" />
      {/* Soleil radieux */}
      <circle cx="880" cy="60" r="35" fill="#fef08a" opacity="0.8" />
      {/* Nuages doux */}
      <ellipse cx="200" cy="50" rx="55" ry="18" fill="#ffffff" opacity="0.7" />
      <ellipse cx="240" cy="42" rx="40" ry="22" fill="#ffffff" opacity="0.75" />
      <ellipse cx="620" cy="70" rx="60" ry="16" fill="#ffffff" opacity="0.65" />

      {/* Mer turquoise avec vagues */}
      <rect x="0" y="160" width="1000" height="150" fill="url(#seaGrad)" />
      {/* Voilier au loin */}
      <polygon points="140,150 152,130 152,150" fill="#ffffff" opacity="0.85" />
      <polygon points="154,150 162,136 154,150" fill="#fca5a5" opacity="0.85" />
      <rect x="138" y="150" width="28" height="4" rx="2" fill="#78350f" opacity="0.8" />

      {/* Écume des vagues */}
      <path
        d="M0 290 Q120 280 250 295 Q380 305 520 290 Q660 275 800 295 Q900 305 1000 290 L1000 310 L0 310 Z"
        fill="#ffffff"
        opacity="0.6"
      />

      {/* Grande plage de sable fin doré */}
      <rect x="0" y="300" width="1000" height="350" fill="url(#sandGrad)" />

      {/* Serviettes de plage géométriques posées sur le sable */}
      <rect x="80" y="360" width="55" height="35" rx="3" fill="#f43f5e" transform="rotate(-6 80 360)" opacity="0.7" />
      <rect x="320" y="420" width="60" height="35" rx="3" fill="#3b82f6" transform="rotate(8 320 420)" opacity="0.7" />
      <rect x="740" y="350" width="55" height="35" rx="3" fill="#10b981" transform="rotate(-12 740 350)" opacity="0.7" />
      <rect x="540" y="520" width="65" height="35" rx="3" fill="#a855f7" transform="rotate(4 540 520)" opacity="0.65" />

      {/* Châteaux de sable décoratifs */}
      <path d="M220 540 L240 500 L260 540 Z" fill="#ca8a04" opacity="0.6" />
      <path d="M840 480 L855 450 L870 480 Z" fill="#ca8a04" opacity="0.6" />

      {/* Parasols rayés plantés dans le décor */}
      <circle cx="160" cy="450" r="32" fill="#ef4444" opacity="0.55" />
      <circle cx="160" cy="450" r="22" fill="#ffffff" opacity="0.55" />
      <circle cx="680" cy="460" r="34" fill="#0284c7" opacity="0.55" />
      <circle cx="680" cy="460" r="24" fill="#ffffff" opacity="0.55" />
    </svg>
  );
}

export function FairBackground() {
  return (
    <svg
      viewBox="0 0 1000 650"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="fairSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="60%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>

      {/* Ciel crépusculaire forain */}
      <rect x="0" y="0" width="1000" height="320" fill="url(#fairSky)" />

      {/* Silhouette de la Grande Roue illuminée */}
      <circle cx="820" cy="180" r="110" stroke="#fde047" strokeWidth="4" fill="none" opacity="0.6" />
      <line x1="820" y1="70" x2="820" y2="290" stroke="#fde047" strokeWidth="2.5" opacity="0.5" />
      <line x1="710" y1="180" x2="930" y2="180" stroke="#fde047" strokeWidth="2.5" opacity="0.5" />
      <line x1="742" y1="102" x2="898" y2="258" stroke="#fde047" strokeWidth="2.5" opacity="0.5" />
      <line x1="898" y1="102" x2="742" y2="258" stroke="#fde047" strokeWidth="2.5" opacity="0.5" />
      <polygon points="780,290 820,180 860,290" fill="#b91c1c" opacity="0.7" />

      {/* Chapiteaux forains à rayures rouges et blanches */}
      <polygon points="120,300 210,170 300,300" fill="#dc2626" opacity="0.85" />
      <polygon points="150,300 210,170 270,300" fill="#ffffff" opacity="0.85" />
      <polygon points="180,300 210,170 240,300" fill="#dc2626" opacity="0.85" />

      {/* Guirlandes d'ampoules suspendues festives */}
      <path d="M0 80 Q250 140 500 80 Q750 140 1000 80" stroke="#fef08a" strokeWidth="2" fill="none" opacity="0.6" />
      {[60, 160, 260, 360, 460, 560, 660, 760, 860, 960].map((cx, i) => (
        <circle key={i} cx={cx} cy={100 + (i % 2) * 12} r="4" fill={i % 2 === 0 ? '#fde047' : '#ec4899'} opacity="0.8" />
      ))}

      {/* Sol de la place foraine pavée */}
      <rect x="0" y="300" width="1000" height="350" fill="#334155" />
      {/* Pavés légers */}
      <line x1="0" y1="360" x2="1000" y2="360" stroke="#475569" strokeWidth="1" strokeDasharray="10 8" />
      <line x1="0" y1="440" x2="1000" y2="440" stroke="#475569" strokeWidth="1" strokeDasharray="10 8" />
      <line x1="0" y1="520" x2="1000" y2="520" stroke="#475569" strokeWidth="1" strokeDasharray="10 8" />
      <line x1="0" y1="600" x2="1000" y2="600" stroke="#475569" strokeWidth="1" strokeDasharray="10 8" />
    </svg>
  );
}

export function CarnivalBackground() {
  return (
    <svg
      viewBox="0 0 1000 650"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="carnivalSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>

      {/* Ciel nocturne de fête */}
      <rect x="0" y="0" width="1000" height="260" fill="url(#carnivalSky)" />

      {/* Façades vénitiennes colorées en fond */}
      <rect x="40" y="100" width="160" height="240" fill="#fb923c" opacity="0.75" />
      <rect x="220" y="80" width="180" height="260" fill="#38bdf8" opacity="0.75" />
      <rect x="420" y="120" width="170" height="220" fill="#f43f5e" opacity="0.75" />
      <rect x="610" y="90" width="190" height="250" fill="#a855f7" opacity="0.75" />
      <rect x="820" y="110" width="160" height="230" fill="#4ade80" opacity="0.75" />

      {/* Banderoles et fanions de carnaval */}
      <path d="M0 60 Q500 130 1000 60" stroke="#fbbf24" strokeWidth="2.5" fill="none" opacity="0.8" />
      {[100, 220, 340, 460, 580, 700, 820, 940].map((x, i) => (
        <polygon
          key={i}
          points={`${x},${80 + (i % 2) * 10} ${x + 18},${80 + (i % 2) * 10} ${x + 9},${102 + (i % 2) * 10}`}
          fill={['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'][i % 5]}
        />
      ))}

      {/* Nuée de confettis festifs */}
      {[
        [150, 180, '#ef4444'], [280, 140, '#f59e0b'], [430, 200, '#3b82f6'],
        [640, 160, '#10b981'], [780, 220, '#ec4899'], [880, 140, '#fde047'],
        [200, 260, '#8b5cf6'], [520, 280, '#f97316'], [720, 290, '#06b6d4']
      ].map(([cx, cy, col], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill={col} opacity="0.75" />
      ))}

      {/* Chaussée pavée de carnaval */}
      <rect x="0" y="320" width="1000" height="330" fill="#1e293b" />
    </svg>
  );
}

export function MarketBackground() {
  return (
    <svg
      viewBox="0 0 1000 650"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="marketSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
      </defs>

      {/* Ciel médiéval ocre et chaud */}
      <rect x="0" y="0" width="1000" height="240" fill="url(#marketSky)" />

      {/* Remparts et tours de pierre médiévales */}
      <rect x="80" y="80" width="120" height="200" fill="#57534e" opacity="0.85" />
      <polygon points="60,80 140,20 220,80" fill="#991b1b" opacity="0.85" />
      <rect x="800" y="80" width="120" height="200" fill="#57534e" opacity="0.85" />
      <polygon points="780,80 860,20 940,80" fill="#991b1b" opacity="0.85" />

      {/* Échoppes d'antan avec auvents rayés */}
      <polygon points="260,270 360,180 460,270" fill="#ca8a04" opacity="0.8" />
      <rect x="270" y="270" width="180" height="70" fill="#78350f" opacity="0.8" />

      <polygon points="560,270 660,180 760,270" fill="#b91c1c" opacity="0.8" />
      <rect x="570" y="270" width="180" height="70" fill="#78350f" opacity="0.8" />

      {/* Pavés de la place du marché */}
      <rect x="0" y="320" width="1000" height="330" fill="#44403c" />
    </svg>
  );
}

export function ParkBackground() {
  return (
    <svg
      viewBox="0 0 1000 650"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="parkSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="200" fill="url(#parkSky)" />
      {/* Soleil doux et nuages */}
      <circle cx="850" cy="60" r="30" fill="#fef08a" opacity="0.8" />
      <ellipse cx="250" cy="50" rx="60" ry="18" fill="#ffffff" opacity="0.75" />
      {/* Pelouse vallonnée */}
      <path d="M0 180 Q250 140 500 170 Q750 200 1000 160 L1000 650 L0 650 Z" fill="url(#grassGrad)" />
      {/* Étang aux reflets bleus */}
      <ellipse cx="500" cy="420" rx="220" ry="85" fill="#38bdf8" opacity="0.7" />
      <ellipse cx="500" cy="420" rx="190" ry="70" fill="#0284c7" opacity="0.5" />
      {/* Pont en bois */}
      <path d="M380 410 Q500 370 620 410" stroke="#78350f" strokeWidth="8" fill="none" />
      {/* Grands arbres d'ombrage */}
      <circle cx="120" cy="220" r="50" fill="#15803d" opacity="0.85" />
      <rect x="115" y="260" width="10" height="60" fill="#78350f" />
      <circle cx="880" cy="240" r="55" fill="#166534" opacity="0.85" />
      <rect x="875" y="280" width="12" height="60" fill="#78350f" />
      {/* Allées de gravier clair */}
      <path d="M0 500 Q300 480 500 580 Q700 680 1000 560" stroke="#fde68a" strokeWidth="35" fill="none" opacity="0.6" />
    </svg>
  );
}

export function WinterBackground() {
  return (
    <svg
      viewBox="0 0 1000 650"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="winterSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="220" fill="url(#winterSky)" />
      {/* Montagnes blanches aux sommets enneigés */}
      <polygon points="100,220 300,60 500,220" fill="#e2e8f0" />
      <polygon points="260,100 300,60 340,100" fill="#ffffff" />
      <polygon points="450,220 680,80 900,220" fill="#cbd5e1" />
      <polygon points="630,120 680,80 730,120" fill="#ffffff" />
      {/* Pente de neige immaculée */}
      <rect x="0" y="210" width="1000" height="440" fill="#f1f5f9" />
      {/* Sapins sous la neige */}
      {[80, 220, 780, 920].map((x, i) => (
        <g key={i}>
          <polygon points={`${x - 20},340 ${x},280 ${x + 20},340`} fill="#15803d" />
          <polygon points={`${x - 25},380 ${x},320 ${x + 25},380`} fill="#166534" />
          <rect x={x - 4} y="380" width="8" height="25" fill="#78350f" />
        </g>
      ))}
      {/* Chalet de montagne en bois */}
      <rect x="420" y="320" width="160" height="90" fill="#78350f" />
      <polygon points="400,320 500,260 600,320" fill="#e2e8f0" />
      <rect x="480" y="360" width="25" height="50" fill="#d97706" />
      <circle cx="500" cy="300" r="4" fill="#fbbf24" />
    </svg>
  );
}

export function renderSceneBackground(sceneType = 'beach') {
  switch (sceneType) {
    case 'fair':
      return <FairBackground />;
    case 'carnival':
      return <CarnivalBackground />;
    case 'market':
      return <MarketBackground />;
    case 'park':
      return <ParkBackground />;
    case 'winter':
      return <WinterBackground />;
    case 'beach':
    default:
      return <BeachBackground />;
  }
}

