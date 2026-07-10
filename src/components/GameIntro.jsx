import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

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

  const toggleIntermission = () => {
    const nextVal = !intermissionEnabled;
    setIntermissionEnabled(nextVal);
    localStorage.setItem('retrovision_intermission_enabled', nextVal ? 'true' : 'false');
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
    gsap.set(".intro-btn-play", { visibility: "visible", scale: 0, opacity: 0 });
    gsap.set(".intro-intermission-container", { visibility: "visible", scale: 0, opacity: 0 });

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
    .to(".intro-btn-play", {
      duration: 0.8,
      scale: 1,
      opacity: 1,
      ease: "back.out(1.5)"
    }, 1.7)
    .to(".intro-intermission-container", {
      duration: 0.8,
      scale: 1,
      opacity: 1,
      ease: "back.out(1.5)"
    }, 1.8)
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
            endY: window.innerHeight + 100, // Fall down off screen
            t: 0,
            speed: 0.005 + Math.random() * 0.01,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)] || '#00FF00',
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2
        };
        
        if (particleType === 'water') {
            p.endY = startY - 400 - Math.random() * 300; // Splash up
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
                  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                  ctx.lineWidth = 1;
                  ctx.strokeRect(-p.size, -p.size/2, p.size*2, p.size);
              }
          } else if (particleType === 'cards') {
              ctx.fillStyle = 'white';
              ctx.fillRect(-p.size, -p.size*1.5, p.size*2, p.size*3);
              ctx.fillStyle = p.color;
              ctx.font = `${p.size}px Arial`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(["♥","♦","♣","♠"][Math.floor(Math.random()*4)], 0, 0);
          } else if (particleType === 'mines') {
              ctx.beginPath();
              for(let i=0; i<5; i++){
                  ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*p.size, -Math.sin((18+i*72)*Math.PI/180)*p.size);
                  ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*p.size/2, -Math.sin((54+i*72)*Math.PI/180)*p.size/2);
              }
              ctx.closePath();
              ctx.fill();
          } else if (particleType === 'water') {
              ctx.beginPath();
              ctx.arc(0, 0, p.size, 0, Math.PI);
              ctx.lineTo(0, -p.size*2);
              ctx.closePath();
              ctx.fill();
          } else { // default, neon, snake, puzzle (circles)
              ctx.beginPath();
              ctx.arc(0, 0, p.size, 0, Math.PI * 2);
              ctx.fill();
              if (particleType === 'neon') {
                  ctx.shadowBlur = 15;
                  ctx.shadowColor = p.color;
              }
          }
          ctx.restore();
      };

      const renderParticles = () => {
        if (!isRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.t += p.speed;
            p.rot += p.rotSpeed;
            const u = 1 - p.t;
            p.x = u * u * p.startX + 2 * u * p.t * p.controlX + p.t * p.t * p.endX;
            p.y = u * u * p.startY + 2 * u * p.t * p.controlY + p.t * p.t * p.endY;
            
            const life = 1 - p.t;

            if (life <= 0 || p.t >= 1) {
                particles.splice(i, 1);
                continue;
            }

            drawParticle(p, Math.max(life, 0));
        }
        animationFrameId = requestAnimationFrame(renderParticles);
      };
      renderParticles();
    };

    return () => {
      tl.kill();
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (spawnInterval) clearInterval(spawnInterval);
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    };
  }, [colors, particleType]);

  const mainColor = colors[0] || '#8A2BE2';
  const secColor = colors[1] || '#4B0082';
  const bgImageName = gameName.toLowerCase().replace(" collection", "").split(' ').join('_') + "_bg.webp";
  
  const longestWord = Math.max(...gameName.split(' ').map(w => w.length));
  const titleFontSize = longestWord > 7 ? 'min(4rem, 10vw)' : 'min(6rem, 15vw)';

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
        
        .intro-logo-container { position: absolute; top: 25%; font-family: '"Orbitron", sans-serif'; display: flex; flex-direction: column; align-items: center; gap: 20px; z-index: 20; opacity: 0; visibility: hidden; text-align: center; }
        .intro-icon { font-size: 6rem; filter: drop-shadow(0 15px 15px rgba(0,0,0,0.6)); margin-bottom: -10px; }
        .intro-btn-play { position: absolute; bottom: 15%; background: linear-gradient(to bottom, ${mainColor}, ${secColor}); border: 2px solid #FFF; border-radius: 50px; padding: 15px 40px; font-size: 2rem; color: white; font-weight: bold; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.5), inset 0 5px 10px rgba(255,255,255,0.4); z-index: 20; opacity: 0; visibility: hidden; text-transform: uppercase; transition: filter 0.2s; font-family: '"Orbitron", sans-serif'; letter-spacing: 2px; }
        .intro-btn-play:hover { filter: brightness(1.2); }
        .intro-intermission-container {
          position: absolute;
          bottom: 6%;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          color: white;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          z-index: 20;
          cursor: pointer;
          user-select: none;
          transition: all 0.3s ease;
          visibility: hidden;
        }
        .intro-intermission-container:hover {
          border-color: ${mainColor};
          box-shadow: 0 0 10px ${mainColor}80;
        }
        .retro-switch {
          position: relative;
          width: 50px;
          height: 24px;
          background: #334155;
          border-radius: 12px;
          transition: background 0.3s;
        }
        .retro-switch.active {
          background: #10b981;
          box-shadow: 0 0 10px #10b98180;
        }
        .retro-switch-handle {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }
        .retro-switch.active .retro-switch-handle {
          transform: translateX(26px);
        }

      `}</style>
      <div className="intro-bg-sphere intro-sphere-1" />
      <div className="intro-bg-image" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: `url(/assets/bg/${bgImageName})`,
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
      
      <div className="intro-logo-container">
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
      <button className="intro-btn-play" onClick={onComplete}>JOUER</button>
      <div className="intro-intermission-container" onClick={toggleIntermission}>
        <span>Entracte :</span>
        <div className={`retro-switch ${intermissionEnabled ? 'active' : ''}`}>
          <div className="retro-switch-handle" />
        </div>
        <span style={{ fontWeight: 'bold', color: intermissionEnabled ? '#10b981' : '#ef4444', minWidth: '45px' }}>
          {intermissionEnabled ? 'AVEC' : 'SANS'}
        </span>
      </div>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 15, pointerEvents: 'none' }} />
    </div>
  );
}
