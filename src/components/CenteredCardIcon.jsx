import React from 'react';

/**
 * Emblèmes haute visibilité pour la gamme "Symbole Centré".
 * Conçus pour être grands, nets, très colorés avec fond 100% transparent,
 * afin que la texture de la carte (washi, bois, tatami...) reste visible tout autour.
 */
export default function CenteredCardIcon({ name, size = 60, color = '#0284c7' }) {
  const filterId = `shadow-${name}`;

  const renderIcon = () => {
    switch (name) {
      case 'fuji':
        return (
          <g>
            <defs>
              <linearGradient id="fuji-sun" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="fuji-snow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              <linearGradient id="fuji-rock" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Soleil levant d'arrière-plan */}
            <circle cx="40" cy="30" r="22" fill="url(#fuji-sun)" opacity="0.9" />
            {/* Montagne */}
            <polygon points="40,16 68,68 12,68" fill="url(#fuji-rock)" />
            {/* Calotte glaciaire enneigée détaillée */}
            <polygon points="40,16 48,34 44,38 40,32 36,38 32,34" fill="url(#fuji-snow)" />
            {/* Vaguelettes d'eau au pied */}
            <path d="M10,70 Q25,66 40,70 T70,70" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'pagoda':
        return (
          <g>
            <defs>
              <linearGradient id="pagoda-roof" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              <linearGradient id="pagoda-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            {/* Flèche d'or (Sorin) */}
            <line x1="40" y1="6" x2="40" y2="22" stroke="url(#pagoda-gold)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="40" cy="8" r="3.5" fill="url(#pagoda-gold)" />
            <circle cx="40" cy="14" r="2.5" fill="url(#pagoda-gold)" />
            {/* Toit supérieur */}
            <path d="M26,26 Q40,20 54,26 L50,22 Q40,18 30,22 Z" fill="url(#pagoda-roof)" />
            <rect x="35" y="26" width="10" height="8" fill="#451a03" />
            {/* Toit médian */}
            <path d="M20,38 Q40,30 60,38 L56,34 Q40,28 24,34 Z" fill="url(#pagoda-roof)" />
            <rect x="33" y="38" width="14" height="10" fill="#451a03" />
            <rect x="38" y="40" width="4" height="6" fill="url(#pagoda-gold)" />
            {/* Toit inférieur large */}
            <path d="M12,54 Q40,44 68,54 L62,49 Q40,41 18,49 Z" fill="url(#pagoda-roof)" />
            {/* Base / Piliers */}
            <rect x="28" y="54" width="24" height="18" fill="#451a03" />
            <rect x="36" y="58" width="8" height="14" fill="url(#pagoda-gold)" />
          </g>
        );

      case 'koi':
        return (
          <g>
            <defs>
              <linearGradient id="koi-body" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="60%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
              <linearGradient id="koi-red" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
            </defs>
            {/* Volute fluide de carpe koï */}
            <path
              d="M38,12 C48,16 58,28 56,44 C54,60 42,68 34,70 C38,62 38,52 32,46 C26,40 24,28 38,12 Z"
              fill="url(#koi-body)"
            />
            {/* Tache sacrée vermillon sur le dos */}
            <ellipse cx="44" cy="34" rx="7" ry="11" fill="url(#koi-red)" />
            {/* Nageoires pectorales délicates */}
            <path d="M54,34 Q66,32 64,44 Q56,42 52,38 Z" fill="#fdba74" opacity="0.85" />
            <path d="M28,40 Q18,44 22,54 Q28,48 30,44 Z" fill="#fdba74" opacity="0.85" />
            {/* Queue en voile ondoyant */}
            <path d="M34,70 Q40,78 46,74 Q38,68 34,70 Z" fill="#ea580c" />
            <path d="M34,70 Q28,78 22,74 Q30,68 34,70 Z" fill="#ea580c" />
            {/* Œil */}
            <circle cx="42" cy="18" r="2.2" fill="#0f172a" />
            <circle cx="43" cy="17.2" r="0.8" fill="#ffffff" />
          </g>
        );

      case 'torii':
        return (
          <g>
            <defs>
              <linearGradient id="torii-red" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
              <linearGradient id="torii-black" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Poutre courbée supérieure (Kasagi) */}
            <path d="M8,18 Q40,12 72,18 L70,24 Q40,18 10,24 Z" fill="url(#torii-black)" />
            {/* Deuxième linteau transversal (Shimaki / Nuki) */}
            <rect x="14" y="28" width="52" height="6.5" rx="1.5" fill="url(#torii-red)" />
            {/* Colonnes jumelles massives */}
            <rect x="22" y="22" width="7" height="50" rx="2" fill="url(#torii-red)" />
            <rect x="51" y="22" width="7" height="50" rx="2" fill="url(#torii-red)" />
            {/* Socles de pierre noire */}
            <rect x="19" y="66" width="13" height="6" rx="2" fill="url(#torii-black)" />
            <rect x="48" y="66" width="13" height="6" rx="2" fill="url(#torii-black)" />
            {/* Tablette sacrée d'or au centre (Gakuzuka) */}
            <rect x="36" y="24" width="8" height="11" rx="1" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          </g>
        );

      case 'bamboo':
        return (
          <g>
            <defs>
              <linearGradient id="bamboo-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>
            {/* Tige principale */}
            <rect x="34" y="10" width="12" height="16" rx="2" fill="url(#bamboo-grad)" />
            <rect x="33" y="28" width="14" height="18" rx="2" fill="url(#bamboo-grad)" />
            <rect x="33" y="48" width="14" height="24" rx="2" fill="url(#bamboo-grad)" />
            {/* Nœuds bagués */}
            <rect x="31" y="25" width="18" height="4" rx="1" fill="#14532d" />
            <rect x="31" y="45" width="18" height="4" rx="1" fill="#14532d" />
            {/* Feuilles élancées */}
            <path d="M48,26 Q64,18 70,26 Q60,32 48,27 Z" fill="#16a34a" />
            <path d="M48,28 Q66,32 68,42 Q58,38 48,30 Z" fill="#15803d" />
            <path d="M32,46 Q14,38 10,48 Q22,50 32,47 Z" fill="#16a34a" />
            <path d="M32,47 Q12,56 16,66 Q26,58 32,49 Z" fill="#15803d" />
          </g>
        );

      case 'crane':
        return (
          <g>
            <defs>
              <linearGradient id="crane-wing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            {/* Corps élancé */}
            <ellipse cx="40" cy="46" rx="16" ry="12" fill="url(#crane-wing)" />
            {/* Plumes noires de queue */}
            <path d="M52,44 C62,44 68,52 64,62 C58,60 52,54 50,48 Z" fill="#0f172a" />
            {/* Long cou gracieux en S */}
            <path d="M30,48 Q22,34 26,20 Q28,12 34,14 Q32,24 36,44 Z" fill="url(#crane-wing)" />
            {/* Tête fine */}
            <circle cx="34" cy="14" r="5" fill="#ffffff" />
            <circle cx="35" cy="11.5" r="2.2" fill="#ef4444" /> {/* Calotte rouge sacrée */}
            {/* Long bec droit */}
            <polygon points="38,14 54,16 38,17" fill="#f59e0b" />
            {/* Longues pattes fines */}
            <line x1="36" y1="56" x2="34" y2="74" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="44" y1="56" x2="46" y2="74" stroke="#0f172a" strokeWidth="2.5" />
          </g>
        );

      case 'kitsune':
        return (
          <g>
            <defs>
              <linearGradient id="fox-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="fox-white" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </linearGradient>
            </defs>
            {/* Queue vaporeuse enflammée */}
            <path d="M40,74 C60,72 74,56 68,36 C64,48 52,58 40,64 Z" fill="url(#fox-gold)" />
            <path d="M68,36 C66,42 58,48 54,44 Z" fill="#ffffff" />
            {/* Tête de renard mystique */}
            <polygon points="40,24 22,38 58,38" fill="url(#fox-white)" />
            <polygon points="40,48 22,38 58,38" fill="url(#fox-white)" />
            {/* Grandes oreilles dressées avec intérieur rouge */}
            <polygon points="26,34 16,12 34,26" fill="url(#fox-white)" />
            <polygon points="25,30 20,17 30,26" fill="#ef4444" />
            <polygon points="54,34 64,12 46,26" fill="url(#fox-white)" />
            <polygon points="55,30 60,17 50,26" fill="#ef4444" />
            {/* Marques cérémonielles rouges */}
            <path d="M30,36 Q34,42 32,46" stroke="#dc2626" strokeWidth="2" fill="none" />
            <path d="M50,36 Q46,42 48,46" stroke="#dc2626" strokeWidth="2" fill="none" />
            {/* Yeux en amande dorés */}
            <ellipse cx="33" cy="38" rx="3.5" ry="1.5" fill="#d97706" transform="rotate(-15 33 38)" />
            <ellipse cx="47" cy="38" rx="3.5" ry="1.5" fill="#d97706" transform="rotate(15 47 38)" />
            {/* Truffe */}
            <circle cx="40" cy="46" r="2" fill="#0f172a" />
          </g>
        );

      case 'waterfall':
        return (
          <g>
            <defs>
              <linearGradient id="water-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            {/* Falaises de roche sombre de chaque côté */}
            <path d="M10,14 L28,20 L24,70 L8,70 Z" fill="#334155" />
            <path d="M70,14 L52,20 L56,70 L72,70 Z" fill="#334155" />
            {/* Chute d'eau limpide */}
            <rect x="28" y="16" width="24" height="46" rx="4" fill="url(#water-grad)" />
            {/* Lignes d'écoulement rapides */}
            <line x1="34" y1="18" x2="34" y2="58" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6,4" />
            <line x1="42" y1="20" x2="42" y2="60" stroke="#bae6fd" strokeWidth="3" strokeDasharray="8,5" />
            <line x1="48" y1="18" x2="48" y2="56" stroke="#ffffff" strokeWidth="2" strokeDasharray="5,3" />
            {/* Écume bouillonnante au bassin */}
            <ellipse cx="40" cy="64" rx="26" ry="7" fill="#e0f2fe" opacity="0.9" />
            <ellipse cx="40" cy="63" rx="18" ry="4" fill="#ffffff" />
          </g>
        );

      case 'teahouse':
        return (
          <g>
            <defs>
              <linearGradient id="wood-house" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>
            {/* Toit traditionnel en chaume courbé */}
            <path d="M12,32 Q40,16 68,32 L62,26 Q40,12 18,26 Z" fill="#b45309" />
            {/* Structure en bois */}
            <rect x="22" y="32" width="36" height="30" rx="1" fill="url(#wood-house)" />
            {/* Cloisons coulissantes shoji en papier blanc */}
            <rect x="26" y="36" width="12" height="20" fill="#fef9c3" stroke="#451a03" strokeWidth="1.5" />
            <rect x="42" y="36" width="12" height="20" fill="#fef9c3" stroke="#451a03" strokeWidth="1.5" />
            {/* Croisillons fins des panneaux shoji */}
            <line x1="32" y1="36" x2="32" y2="56" stroke="#451a03" strokeWidth="1" />
            <line x1="26" y1="46" x2="38" y2="46" stroke="#451a03" strokeWidth="1" />
            <line x1="48" y1="36" x2="48" y2="56" stroke="#451a03" strokeWidth="1" />
            <line x1="42" y1="46" x2="54" y2="46" stroke="#451a03" strokeWidth="1" />
            {/* Balcon engawa sur pilotis */}
            <rect x="18" y="60" width="44" height="5" rx="1" fill="#451a03" />
            <rect x="24" y="65" width="4" height="6" fill="#451a03" />
            <rect x="52" y="65" width="4" height="6" fill="#451a03" />
          </g>
        );

      case 'moon_bridge':
      default:
        return (
          <g>
            <defs>
              <linearGradient id="moon-sphere" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>
              <linearGradient id="bridge-arch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>
            {/* Pleine lune dorée d'arrière-plan */}
            <circle cx="40" cy="28" r="20" fill="url(#moon-sphere)" opacity="0.95" />
            {/* Arche du pont japonais courbe rouge vermillon */}
            <path
              d="M10,64 Q40,30 70,64 L66,66 Q40,36 14,66 Z"
              fill="url(#bridge-arch)"
            />
            {/* Barustrade / Rampes du pont */}
            <path d="M12,56 Q40,24 68,56" stroke="#b91c1c" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Poteaux verticaux réguliers */}
            <line x1="24" y1="47" x2="24" y2="60" stroke="#7f1d1d" strokeWidth="2" />
            <line x1="40" y1="37" x2="40" y2="52" stroke="#7f1d1d" strokeWidth="2.5" />
            <line x1="56" y1="47" x2="56" y2="60" stroke="#7f1d1d" strokeWidth="2" />
            {/* Reflet de l'eau */}
            <ellipse cx="40" cy="68" rx="28" ry="4" fill="#38bdf8" opacity="0.6" />
          </g>
        );
    }
  };

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
        transition: 'transform 0.2s ease',
        userSelect: 'none'
      }}
    >
      <svg
        viewBox="0 0 80 80"
        width="100%"
        height="100%"
        style={{ overflow: 'visible', background: 'transparent' }}
      >
        {renderIcon()}
      </svg>
    </div>
  );
}
