import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  isRandomThemeEnabled, 
  setRandomThemeEnabled, 
  normalizeGameId,
  GAME_THEME_DETAILS,
  getAllowedThemes,
  toggleAllowedTheme,
  selectAllThemes
} from '../utils/themeManager';
import ThemeMiniature from './ThemeMiniature';
import { sound } from '../utils/sound';

export default function GameIntro({ 
    gameName, 
    icon, 
    colors = ['#8A2BE2', '#4B0082', '#DC143C'], 
    particleType = 'default', 
    onComplete 
}) {
  const canvasRef = useRef(null);
  const [intermissionEnabled, setIntermissionEnabled] = useState(() => {
    return localStorage.getItem('retrovision_intermission_enabled') !== 'false';
  });
  const [randomThemeEnabled, setRandomThemeEnabledState] = useState(() => {
    return isRandomThemeEnabled(gameName);
  });

  const gameId = normalizeGameId(gameName);
  const availableThemes = GAME_THEME_DETAILS[gameId] || [];
  const hasThemes = availableThemes.length > 0;

  const [allowedThemes, setAllowedThemesState] = useState(() => {
    return getAllowedThemes(gameName);
  });

  const toggleIntermission = (e) => {
    if (e) e.stopPropagation();
    sound.playClick();
    const nextVal = !intermissionEnabled;
    setIntermissionEnabled(nextVal);
    localStorage.setItem('retrovision_intermission_enabled', nextVal ? 'true' : 'false');
  };

  const toggleRandomTheme = (e) => {
    if (e) e.stopPropagation();
    sound.playClick();
    const nextVal = !randomThemeEnabled;
    setRandomThemeEnabled(gameName, nextVal);
    setRandomThemeEnabledState(nextVal);
  };

  const handleToggleTheme = (themeId, e) => {
    if (e) e.stopPropagation();
    sound.playClick();
    const next = toggleAllowedTheme(gameName, themeId);
    setAllowedThemesState([...next]);
  };

  const handleSelectAll = (e) => {
    if (e) e.stopPropagation();
    sound.playClick();
    const next = selectAllThemes(gameName);
    setAllowedThemesState([...next]);
  };

  useEffect(() => {
    const tl = gsap.timeline();

    // Background spheres
    gsap.to(".intro-bg-sphere", {
        y: -50,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 1
    });

    // 1. Initial State
    gsap.set(".letter-v2", { scale: 0, opacity: 0, y: 150, rotationX: -90, rotationY: (i) => i % 2 === 0 ? -30 : 30 });
    gsap.set(".intro-flare", { width: 0, height: 0, opacity: 1 });
    gsap.set(".intro-sweep", { left: '-100%' });
    gsap.set(".intro-logo-container", { visibility: "visible", opacity: 1 });
    gsap.set(".intro-icon", { scale: 0, opacity: 0 });
    gsap.set(".intro-bottom-controls", { visibility: "visible", y: 40, opacity: 0 });

    // 2. Animate letters (Anticipation + Squash/Stretch)
    tl.to(".letter-v2", {
      duration: 1.5,
      scale: 1,
      opacity: 1,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      stagger: 0.08,
      ease: "elastic.out(1, 0.3)",
    })
    // 3. Exaggeration: Flare explosion
    .to(".intro-flare", {
      duration: 0.8,
      width: window.innerWidth * 1.5,
      height: window.innerWidth * 1.5,
      opacity: 0,
      ease: "power3.out"
    }, 0.6)
    // 4. Staging: Shine sweep over the text
    .to(".intro-sweep", {
      duration: 1.5,
      left: '200%',
      ease: "power2.inOut"
    }, 1.2)
    // 5. Background Vortex keeps spinning
    .to(".intro-vortex-green", { duration: 20, rotation: 360, repeat: -1, ease: "none" }, 0)
    // 6. Icon and Button pop in
    .to(".intro-icon", {
      duration: 0.8,
      scale: 1,
      opacity: 1,
      ease: "back.out(1.7)"
    }, 1.5)
    .to(".intro-bottom-controls", {
      duration: 0.8,
      y: 0,
      opacity: 1,
      ease: "back.out(1.5)"
    }, 1.7)
    // 7. Secondary Action: Floating letters
    .to(".letter-v2", {
      duration: 1.2,
      y: -15,
      yoyo: true,
      repeat: -1,
      stagger: {
        each: 0.1,
        from: "start"
      },
      ease: "sine.inOut"
    }, 2.0)
    .call(() => {
        startParticles();
        gsap.to(".intro-btn-play", {
            scale: 1.05,
            duration: 0.8,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    });

    let particles = [];
    let isRunning = false;
    let animationFrameId;
    let spawnInterval;
    let resizeHandler;

    const startParticles = () => {
      if (isRunning) return;
      isRunning = true;
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      resizeHandler = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resizeHandler);
      resizeHandler();

      const spawnParticle = () => {
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;

        let p = {
            x: startX,
            y: startY,
            startX: startX,
            startY: startY,
            controlX: startX + (Math.random() - 0.5) * 400,
            controlY: startY - 200 - Math.random() * 300,
            endX: startX + (Math.random() - 0.5) * window.innerWidth,
            endY: window.innerHeight + 100,
            t: 0,
            speed: 0.005 + Math.random() * 0.01,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)] || '#00FF00',
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2
        };
        
        if (particleType === 'water') {
            p.endY = startY - 400 - Math.random() * 300;
            p.color = ['#00BFFF', '#87CEFA', '#4169E1', '#E0FFFF'][Math.floor(Math.random()*4)];
            p.size = Math.random() * 8 + 3;
        } else if (particleType === 'neon') {
            p.endX = startX + (Math.random() - 0.5) * 800;
            p.endY = startY + (Math.random() - 0.5) * 800;
        } else if (particleType === 'snake') {
            p.controlX = startX + (Math.random() - 0.5) * 800;
            p.controlY = startY + (Math.random() - 0.5) * 800;
            p.speed = 0.003 + Math.random() * 0.005;
        }

        particles.push(p);
      };

      spawnInterval = setInterval(spawnParticle, 80);

      const ctx = canvas.getContext('2d');
      
      const drawParticle = (p, life) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = life;
          ctx.fillStyle = p.color;

          if (particleType === 'arrows') {
              ctx.beginPath();
              ctx.moveTo(0, -p.size);
              ctx.lineTo(p.size, p.size);
              ctx.lineTo(-p.size, p.size);
              ctx.fill();
          } else if (particleType === 'bricks' || particleType === 'blocks' || particleType === 'tiles') {
              ctx.fillRect(-p.size, -p.size/2, p.size*2, p.size);
              if(particleType === 'tiles' || particleType === 'blocks') {
                  ctx.strokeStyle = '#FFFFFF';
                  ctx.lineWidth = 1;
                  ctx.strokeRect(-p.size, -p.size/2, p.size*2, p.size);
              }
          } else if (particleType === 'bubbles') {
              ctx.beginPath();
              ctx.arc(0, 0, p.size, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = 'rgba(255,255,255,0.6)';
              ctx.lineWidth = 1.5;
              ctx.stroke();
          } else {
              ctx.beginPath();
              ctx.arc(0, 0, p.size, 0, Math.PI * 2);
              ctx.fill();
          }
          ctx.restore();
      };

      const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          for (let i = particles.length - 1; i >= 0; i--) {
              let p = particles[i];
              p.t += p.speed;
              
              p.x = (1 - p.t) * (1 - p.t) * p.startX + 2 * (1 - p.t) * p.t * p.controlX + p.t * p.t * p.endX;
              p.y = (1 - p.t) * (1 - p.t) * p.startY + 2 * (1 - p.t) * p.t * p.controlY + p.t * p.t * p.endY;
              p.rot += p.rotSpeed;

              let life = 1;
              if (p.t > 0.8) {
                  life = (1 - p.t) / 0.2;
              }

              drawParticle(p, life);

              if (p.t >= 1) {
                  particles.splice(i, 1);
              }
          }
          animationFrameId = requestAnimationFrame(animate);
      };

      animate();
    };

    return () => {
      tl.kill();
      clearInterval(spawnInterval);
      cancelAnimationFrame(animationFrameId);
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    };
  }, [colors, particleType]);

  const mainColor = colors[0] || '#8A2BE2';
  const secColor = colors[1] || '#4B0082';
  const bgImageName = gameName.toLowerCase().replace(" collection", "").split(' ').join('_') + "_bg.webp";
  
  const longestWord = Math.max(...gameName.split(' ').map(w => w.length));
  const titleFontSize = longestWord > 7 ? 'min(4rem, 10vw)' : 'min(6rem, 15vw)';

  const baseUrl = import.meta.env.BASE_URL || '/';
  const safeBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(circle at center, #0A0E1A 0%, #000000 100%)',
      zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
      overflow: 'hidden', fontFamily: '"Arial", sans-serif', perspective: 1000
    }}>
      <style>{`
        .intro-bg-sphere { position: absolute; border-radius: 50%; filter: blur(20px); opacity: 0.6; z-index: 1; }
        .intro-sphere-1 { width: 150px; height: 150px; background: ${mainColor}; bottom: -50px; left: 20%; }
        .intro-sphere-2 { width: 200px; height: 200px; background: ${secColor}; bottom: -100px; right: 15%; }
        .intro-sphere-3 { width: 120px; height: 120px; background: ${colors[2] || '#DC143C'}; bottom: -30px; left: 60%; }
        .intro-vortex-container { position: absolute; width: 400px; height: 400px; z-index: 5; display: flex; justify-content: center; align-items: center; }
        .intro-vortex-disk { position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, ${mainColor}4D 0%, rgba(0,0,0,0) 70%); border: 2px dashed ${mainColor}80; animation: intro-spin 4s linear infinite; }
        @keyframes intro-spin { 100% { transform: rotate(360deg); } }
        .intro-vortex-green { position: absolute; width: 350px; height: 350px; border-radius: 50%; left: 50%; top: 50%; transform: translate(-50%, -50%); }
        .intro-orb { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); width: 20px; height: 20px; background: #FFF; border-radius: 50%; box-shadow: 0 0 20px #FFF, 0 0 40px ${mainColor}; }
        .intro-lightning { position: absolute; width: 100%; height: 100%; z-index: 6; background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><path d="M200,200 L150,100 L180,90 L120,20" stroke="%23FFFFFF" stroke-width="3" fill="none" filter="drop-shadow(0 0 5px %23FFFFFF)"/><path d="M200,200 L250,300 L220,310 L280,380" stroke="%23FFFFFF" stroke-width="3" fill="none" filter="drop-shadow(0 0 5px %23FFFFFF)"/><path d="M200,200 L300,150 L290,120 L380,80" stroke="%23FFFFFF" stroke-width="3" fill="none" filter="drop-shadow(0 0 5px %23FFFFFF)"/></svg>') center/contain no-repeat; opacity: 0; animation: intro-flash 0.15s infinite alternate; }
        @keyframes intro-flash { 0%, 50% { filter: brightness(1); } 100% { filter: brightness(2) drop-shadow(0 0 10px white); } }
        @keyframes intro-light { 
            0% { filter: drop-shadow(0 0 10px ${mainColor}) drop-shadow(0 10px 10px rgba(0,0,0,0.8)); } 
            50% { filter: drop-shadow(0 0 30px ${secColor}) drop-shadow(0 0 50px ${mainColor}) drop-shadow(0 10px 10px rgba(0,0,0,0.8)); } 
            100% { filter: drop-shadow(0 0 10px ${mainColor}) drop-shadow(0 10px 10px rgba(0,0,0,0.8)); } 
        }
        .intro-flare { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 0; height: 0; background: radial-gradient(circle, #ffffff 0%, ${colors[1] || '#a855f7'} 30%, transparent 70%); border-radius: 50%; mix-blend-mode: screen; pointer-events: none; z-index: 10; }
        .intro-sweep { position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(120deg, transparent, rgba(255,255,255,0.9), transparent); transform: skewX(-20deg); mix-blend-mode: overlay; pointer-events: none; z-index: 5; }
        
        .intro-logo-container { 
          position: absolute; 
          top: 25%; 
          font-family: '"Orbitron", sans-serif'; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 16px; 
          z-index: 20; 
          opacity: 0; 
          visibility: hidden; 
          text-align: center;
          transition: top 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .intro-logo-container.with-ribbon {
          top: 22%;
        }

        .intro-icon { font-size: 5.5rem; filter: drop-shadow(0 15px 15px rgba(0,0,0,0.6)); margin-bottom: -10px; }

        /* --- TOP THEMES RIBBON --- */
        .intro-themes-ribbon {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.97) 0%, rgba(15, 23, 42, 0.90) 100%);
          border-bottom: 1px solid rgba(56, 189, 248, 0.35);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          padding: 8px 14px 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: slideDownRibbon 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideDownRibbon {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .intro-ribbon-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px;
          flex-wrap: wrap;
          gap: 6px;
        }

        .intro-ribbon-badge {
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #38bdf8;
          font-size: 11px;
          font-weight: 800;
          border-radius: 6px;
          padding: 2px 8px;
        }

        .intro-select-all-btn {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
          font-size: 11px;
          font-weight: 800;
          border-radius: 6px;
          padding: 2px 10px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .intro-select-all-btn:hover {
          background: rgba(16, 185, 129, 0.35);
        }

        .intro-themes-strip {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 4px 4px 6px 4px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .intro-themes-strip::-webkit-scrollbar {
          height: 4px;
        }
        .intro-themes-strip::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.5);
          border-radius: 2px;
        }

        .intro-theme-card {
          flex: 0 0 100px;
          height: 98px;
          border-radius: 12px;
          padding: 5px 6px 6px 6px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          scroll-snap-align: start;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .intro-theme-card.active {
          background: linear-gradient(135deg, rgba(14, 116, 144, 0.4), rgba(15, 23, 42, 0.95));
          border: 2px solid #38BDF8;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.45), inset 0 0 8px rgba(56, 189, 248, 0.2);
          transform: translateY(-1px);
        }

        .intro-theme-card.inactive {
          background: rgba(30, 41, 59, 0.55);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          opacity: 0.55;
          filter: grayscale(0.5);
        }
        .intro-theme-card.inactive:hover {
          opacity: 0.85;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .intro-theme-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .intro-theme-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #38BDF8;
          cursor: pointer;
        }

        .intro-theme-preview-box {
          width: 100%;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.45);
          border-radius: 6px;
          overflow: hidden;
        }

        .intro-theme-name {
          font-size: 9.5px;
          font-weight: 800;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        /* --- UNIFIED BOTTOM CONTROLS (PLAY BUTTON + OPTIONS ROW) --- */
        .intro-bottom-controls {
          position: absolute;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          z-index: 30;
          width: 100%;
          max-width: 95vw;
          visibility: hidden;
          opacity: 0;
          pointer-events: auto;
        }

        .intro-btn-play {
          position: relative;
          background: linear-gradient(to bottom, ${mainColor}, ${secColor});
          border: 2px solid #FFF;
          border-radius: 50px;
          padding: 13px 44px;
          font-size: 1.8rem;
          color: white;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(0,0,0,0.6), 0 0 20px ${mainColor}60, inset 0 3px 6px rgba(255,255,255,0.5);
          z-index: 31;
          text-transform: uppercase;
          font-family: 'Orbitron', sans-serif;
          letter-spacing: 3px;
          transition: transform 0.2s, filter 0.2s, box-shadow 0.2s;
          flex-shrink: 0;
        }
        .intro-btn-play:hover {
          filter: brightness(1.25);
          box-shadow: 0 10px 30px rgba(0,0,0,0.7), 0 0 30px ${mainColor};
        }

        .intro-switches-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .intro-switch-chip {
          display: flex;
          align-items: center;
          gap: 9px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 7px 14px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          color: white;
          font-family: 'Orbitron', sans-serif;
          cursor: pointer;
          user-select: none;
          transition: all 0.25s ease;
        }
        .intro-switch-chip:hover {
          border-color: ${mainColor};
          box-shadow: 0 0 12px ${mainColor}80;
        }

        .intro-switch-label {
          font-size: 11.5px;
          color: #cbd5e1;
        }

        .retro-switch-val {
          font-weight: 800;
          min-width: 42px;
          font-size: 11px;
        }
        .val-green { color: #10b981; }
        .val-red { color: #ef4444; }
        .val-cyan { color: #38bdf8; }
        .val-gray { color: #94a3b8; }

        .retro-switch {
          position: relative;
          width: 44px;
          height: 22px;
          background: #334155;
          border-radius: 11px;
          transition: background 0.3s;
        }
        .retro-switch.active {
          background: #10b981;
          box-shadow: 0 0 10px #10b98180;
        }
        .retro-switch.active-cyan {
          background: #0284c7;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.7);
        }
        .retro-switch-handle {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }
        .retro-switch.active .retro-switch-handle,
        .retro-switch.active-cyan .retro-switch-handle {
          transform: translateX(22px);
        }
      `}</style>

      {/* --- TOP THEMES SELECTOR RIBBON (PINNED TO TOP, VISIBLE ONLY IF RANDOM THEME IS ON & HAS THEMES) --- */}
      {randomThemeEnabled && hasThemes && (
        <div className="intro-themes-ribbon">
          <div className="intro-ribbon-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#38BDF8', letterSpacing: '0.5px' }}>
                🎨 Thèmes autorisés pour l'aléatoire :
              </span>
              <span className="intro-ribbon-badge">
                {allowedThemes.length} / {availableThemes.length} actifs
              </span>
            </div>

            {allowedThemes.length < availableThemes.length && (
              <button onClick={handleSelectAll} className="intro-select-all-btn" title="Activer tous les thèmes dans le tirage aléatoire">
                ✓ Tout cocher
              </button>
            )}
          </div>

          <div className="intro-themes-strip">
            {availableThemes.map((theme) => {
              const isChecked = allowedThemes.includes(theme.id);
              return (
                <div
                  key={theme.id}
                  onClick={(e) => handleToggleTheme(theme.id, e)}
                  className={`intro-theme-card ${isChecked ? 'active' : 'inactive'}`}
                  title={`${theme.name} : ${isChecked ? 'Coché (Cliquez pour désactiver)' : 'Décoché (Cliquez pour activer)'}`}
                >
                  {/* Top card header with Checkbox & Icon */}
                  <div className="intro-theme-card-top">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by card onClick
                      className="intro-theme-checkbox"
                    />
                    <span style={{ fontSize: '13px' }}>{theme.icon}</span>
                  </div>

                  {/* Theme Vector Miniature Preview */}
                  <div className="intro-theme-preview-box">
                    <ThemeMiniature gameId={gameName} themeId={theme.id} width="100%" height="100%" />
                  </div>

                  {/* Theme Name */}
                  <div className="intro-theme-name" style={{ color: isChecked ? '#F8FAFC' : '#94A3B8' }}>
                    {theme.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="intro-bg-sphere intro-sphere-1" />
      <div className="intro-bg-image" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: `url(${safeBase}assets/bg/${bgImageName})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.25, zIndex: 0, mixBlendMode: 'screen', filter: 'blur(3px)'
      }} />
      <div className="intro-bg-sphere intro-sphere-2" />
      <div className="intro-bg-sphere intro-sphere-3" />
      <div className="intro-vortex-container">
        <div className="intro-vortex-disk" />
        <div className="intro-vortex-green"><div className="intro-orb" /></div>
        <div className="intro-lightning" />
      </div>
      
      <div className="intro-flare" />
      
      <div className={`intro-logo-container ${randomThemeEnabled && hasThemes ? 'with-ribbon' : ''}`}>
        <div className="intro-icon">{icon}</div>
        
        <div style={{ position: 'relative', display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="intro-sweep" />
          {gameName.split(' ').map((word, wIdx) => (
            <div key={wIdx} style={{ display: 'flex', gap: '3px' }}>
              {word.split('').map((char, cIdx) => (
                <span key={`${wIdx}-${cIdx}`} className="letter-v2" style={{
                  display: 'inline-block',
                  fontFamily: '"Orbitron", sans-serif',
                  fontSize: titleFontSize,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  color: 'transparent',
                  background: `linear-gradient(to bottom, #ffffff 0%, ${colors[wIdx % colors.length] || '#3b82f6'} 50%, #222222 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: `drop-shadow(0 0 15px ${colors[(wIdx + 1) % colors.length] || '#10b981'}) drop-shadow(0 20px 20px rgba(0,0,0,0.9))`
                }}>
                  {char}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Unified Bottom Controls: Play Button strictly positioned above Switches */}
      <div className="intro-bottom-controls">
        <button 
          className="intro-btn-play pulse-glow" 
          onClick={() => {
            sound.playPowerup?.();
            onComplete && onComplete(randomThemeEnabled);
          }}
        >
          JOUER
        </button>

        <div className="intro-switches-row">
          <div className="intro-switch-chip" onClick={toggleIntermission} title="Activer ou désactiver les entractes après les victoires">
            <span className="intro-switch-label">Entracte :</span>
            <div className={`retro-switch ${intermissionEnabled ? 'active' : ''}`}>
              <div className="retro-switch-handle" />
            </div>
            <span className={`retro-switch-val ${intermissionEnabled ? 'val-green' : 'val-red'}`}>
              {intermissionEnabled ? 'AVEC' : 'SANS'}
            </span>
          </div>

          {hasThemes && (
            <div className="intro-switch-chip" onClick={toggleRandomTheme} title="Activer ou désactiver le choix aléatoire du thème visuel à chaque partie">
              <span className="intro-switch-label">Thème aléatoire :</span>
              <div className={`retro-switch ${randomThemeEnabled ? 'active-cyan' : ''}`}>
                <div className="retro-switch-handle" />
              </div>
              <span className={`retro-switch-val ${randomThemeEnabled ? 'val-cyan' : 'val-gray'}`}>
                {randomThemeEnabled ? 'OUI' : 'NON'}
              </span>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 15, pointerEvents: 'none' }} />
    </div>
  );
}
