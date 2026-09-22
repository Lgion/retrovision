import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';

const KIND_WORDS = [
  { icon: "🌸", text: "Prends tout ton temps, chaque seconde compte." },
  { icon: "🌿", text: "Bravo pour tes efforts, chaque jour est une victoire." },
  { icon: "☀️", text: "Respire doucement. Tu avances à ton rythme, et c'est parfait." },
  { icon: "🧠", text: "À chaque essai, ton cerveau crée de nouveaux chemins." },
  { icon: "🕊️", text: "La patience envers soi-même est la plus belle des forces." },
  { icon: "🌺", text: "Tu fais de ton mieux aujourd'hui, et c'est déjà immense." },
  { icon: "🌈", text: "Rien ne presse, la sérénité est ta meilleure alliée." },
  { icon: "✨", text: "Félicitations pour ta persévérance et ton courage." },
  { icon: "🍃", text: "Une pause, une respiration calme, et on continue à ton aise." },
  { icon: "🌻", text: "Chaque petit geste d'aujourd'hui construit demain." },
  { icon: "🌟", text: "Sois fier(ère) de tout le chemin parcouru pas à pas." },
  { icon: "🍵", text: "Détends tes épaules, prends l'air, savoure cet instant." }
];

export default function KindWordsBanner({ style = {} }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * KIND_WORDS.length));
  const [isFading, setIsFading] = useState(false);

  const current = KIND_WORDS[index];

  const nextWord = () => {
    haptic.gentle();
    sound.playClick();
    setIsFading(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % KIND_WORDS.length);
      setIsFading(false);
    }, 150);
  };

  return (
    <div
      onClick={nextWord}
      role="region"
      aria-label="Mot doux d'encouragement"
      className="kind-words-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 18px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1.5px solid rgba(56, 189, 248, 0.4)',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        userSelect: 'none',
        touchAction: 'manipulation',
        maxWidth: '720px',
        margin: '0 auto 16px auto',
        width: '100%',
        boxSizing: 'border-box',
        ...style
      }}
      title="Touchez pour un autre mot doux"
    >
      <style>{`
        .kind-words-banner:hover {
          border-color: rgba(56, 189, 248, 0.7);
          box-shadow: 0 6px 20px rgba(56, 189, 248, 0.2);
          transform: translateY(-1px);
        }
        .kind-words-banner:active {
          transform: scale(0.99);
        }
        .kw-text {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 1.02rem;
          font-weight: 600;
          color: #f1f5f9;
          line-height: 1.4;
          transition: opacity 0.15s ease;
        }
        .kw-hint {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          white-space: nowrap;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        @media (max-width: 480px) {
          .kind-words-banner {
            padding: 10px 14px;
            margin-bottom: 12px;
          }
          .kw-text {
            font-size: 0.95rem;
          }
          .kw-hint {
            display: none;
          }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <span
          style={{
            fontSize: '1.6rem',
            lineHeight: 1,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}
        >
          {current.icon}
        </span>
        <div
          className="kw-text"
          style={{
            opacity: isFading ? 0 : 1
          }}
        >
          {current.text}
        </div>
      </div>

      <div className="kw-hint">
        ✨ Mot doux ↻
      </div>
    </div>
  );
}
