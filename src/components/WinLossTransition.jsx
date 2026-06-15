import React, { useEffect, useState } from 'react';
import { sound } from '../utils/sound';

export default function WinLossTransition({ type, message }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (type === 'win') {
      sound.playPowerup();
      const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
      const newParticles = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.4,
        duration: 0.8 + Math.random() * 1.2,
        rotation: Math.random() * 360,
      }));
      setParticles(newParticles);
    } else if (type === 'lose') {
      sound.playExplosion();
    }
  }, [type]);

  if (!type) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: type === 'lose' ? 'rgba(255, 0, 0, 0.2)' : 'transparent'
    }}>
      {type === 'win' && particles.map(c => (
        <div
          key={c.id}
          style={{
            position: 'absolute',
            left: `${c.x}%`,
            top: `${c.y}vh`,
            width: `${c.size}px`,
            height: `${c.size * 1.5}px`,
            backgroundColor: c.color,
            borderRadius: '2px',
            animation: `transition-confetti-fall ${c.duration}s linear ${c.delay}s forwards`,
            transform: `rotate(${c.rotation}deg)`,
          }}
        />
      ))}
      
      {type === 'lose' && (
        <div style={{
          fontFamily: '"Orbitron", sans-serif',
          fontSize: '4rem',
          color: '#ff3333',
          fontWeight: '900',
          textShadow: '0 4px 15px rgba(0,0,0,0.8), 2px 2px 0px #fff',
          animation: 'transition-pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          textAlign: 'center',
          lineHeight: '1.2'
        }}>
          {message || "YOU LOSE"}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes transition-confetti-fall {
          to { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        @keyframes transition-pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
