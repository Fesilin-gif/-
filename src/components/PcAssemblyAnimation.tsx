import React, { useState, useEffect, useRef } from 'react';

const PARTS = [
  { id: 'gpu', img: '/images/animation/pixel_gpu.png', fps: '/images/animation/fps_120.png' },
  { id: 'cpu', img: '/images/animation/pixel_cpu.png', fps: '/images/animation/fps_80.png' },
  { id: 'ram', img: '/images/animation/pixel_ram.png', fps: '/images/animation/fps_60.png' },
  { id: 'motherboard', img: '/images/animation/pixel_motherboard.png', fps: '/images/animation/fps_40.png' },
  { id: 'storage', img: '/images/animation/pixel_storage.png', fps: '/images/animation/fps_40.png' },
  { id: 'psu', img: '/images/animation/pixel_psu.png', fps: '/images/animation/fps_40.png' },
];

const CHAR_IMG_RUN = '/images/animation/pc_builder_run_1.png';
const CHAR_IMG_LOOKUP = '/images/animation/pc_builder_look_up.png';
const CHAR_IMG_INSTALL = '/images/pc_builder_install.png';

const MIN_X = 55; // Restrict to the right side (55% to 95%)
const MAX_X = 95;

type ActivePart = {
  id: number;
  partDef: typeof PARTS[0];
  x: number;
  y: number;
  status: 'falling' | 'done';
};

export const PcAssemblyAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [renderState, setRenderState] = useState({
    charX: 75,
    charState: 'run' as 'run' | 'lookup' | 'install',
    charDirection: 1, 
    parts: [] as ActivePart[],
    fpsBadge: null as string | null,
    showFps: false
  });

  const stateRef = useRef({
    charX: 75,
    targetX: 75,
    charState: 'run' as 'run' | 'lookup' | 'install',
    charDirection: 1,
    parts: [] as ActivePart[],
    installTimer: 0,
    fpsBadge: null as string | null,
    nextPartTimer: 0,
    partIdCounter: 0,
    containerHeight: 500,
  });

  // Animation constants - slowed down
  const PART_SPEED = 1.35; // Slower falling speed
  const CHAR_SPEED = 0.35; // Slower running speed
  const Y_START = -60;
  const Y_LOOKUP_THRESHOLD = 180; 
  const Y_CATCH_THRESHOLD = 20;
  
  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTime;
      const delta = Math.min(dt, 50) / 16.66;
      lastTime = time;

      const st = stateRef.current;

      if (containerRef.current) {
        st.containerHeight = containerRef.current.clientHeight;
      }
      
      const charHeadY = st.containerHeight - 220; 
      
      // Spawn new parts, up to 3 simultaneously
      st.nextPartTimer -= delta;
      if (st.nextPartTimer <= 0 && st.parts.length < 3) {
        st.parts.push({
          id: st.partIdCounter++,
          partDef: PARTS[Math.floor(Math.random() * PARTS.length)],
          x: MIN_X + Math.random() * (MAX_X - MIN_X),
          y: Y_START,
          status: 'falling'
        });
        st.nextPartTimer = 70 + Math.random() * 80; // random spawn delay
      }

      let targetPart: ActivePart | null = null;
      let minDistanceToFloor = Infinity;

      for (let i = 0; i < st.parts.length; i++) {
        const p = st.parts[i];
        if (p.status === 'falling') {
          p.y += PART_SPEED * delta;
          
          const distToFloor = charHeadY - p.y;
          if (distToFloor > -50 && distToFloor < minDistanceToFloor) {
            minDistanceToFloor = distToFloor;
            targetPart = p;
          }
          
          if (p.y > st.containerHeight) {
             p.status = 'done';
          }
        }
      }

      st.parts = st.parts.filter(p => p.status !== 'done');

      if (st.charState === 'install') {
        st.installTimer -= delta;
        if (st.installTimer <= 0) {
          st.charState = 'run';
          st.fpsBadge = null;
        }
      } else {
        if (targetPart) {
          const distToChar = charHeadY - targetPart.y;
          
          // Determine side to stand on
          const offset = 6; 
          st.targetX = targetPart.x > (MIN_X + MAX_X)/2 ? targetPart.x - offset : targetPart.x + offset;
          st.targetX = Math.max(MIN_X, Math.min(MAX_X, st.targetX));

          const dist = st.targetX - st.charX;
          if (Math.abs(dist) > CHAR_SPEED * delta) {
            st.charX += Math.sign(dist) * CHAR_SPEED * delta;
            st.charDirection = Math.sign(dist);
          } else {
            st.charX = st.targetX;
            st.charDirection = targetPart.x > st.charX ? 1 : -1;
          }

          if (distToChar < Y_LOOKUP_THRESHOLD && distToChar > Y_CATCH_THRESHOLD) {
            st.charState = 'lookup';
          } else if (distToChar <= Y_CATCH_THRESHOLD && distToChar > -50) {
            st.charState = 'install';
            st.installTimer = 60; // hold install frame
            targetPart.status = 'done';
            st.fpsBadge = targetPart.partDef.fps;
          } else {
            st.charState = 'run';
          }
        } else {
          st.charState = 'run';
        }
      }

      setRenderState({
        charX: st.charX,
        charState: st.charState,
        charDirection: st.charDirection,
        parts: [...st.parts],
        fpsBadge: st.fpsBadge,
        showFps: st.fpsBadge !== null
      });

      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const getCharImage = () => {
    switch (renderState.charState) {
      case 'lookup': return CHAR_IMG_LOOKUP;
      case 'install': return CHAR_IMG_INSTALL;
      default: return CHAR_IMG_RUN;
    }
  };

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-[1]">
      {renderState.parts.map(p => (
        <div 
          key={p.id}
          className="absolute transform -translate-x-1/2 transition-none"
          style={{ left: `${p.x}%`, top: `${p.y}px` }}
        >
          <img 
            src={p.partDef.img} 
            alt="PC Part" 
            className="w-[50px] lg:w-[65px] object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      ))}

      <div 
        className="absolute bottom-4 lg:bottom-10 transform -translate-x-1/2 transition-none"
        style={{ left: `${renderState.charX}%` }}
      >
        <img 
          src={getCharImage()} 
          alt="PC Builder" 
          className="w-[160px] h-[160px] lg:w-[220px] lg:h-[220px] object-contain object-bottom"
          style={{ 
             imageRendering: 'pixelated',
             transform: renderState.charDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)'
          }}
        />
        
        <div className={`absolute top-[-50px] left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-out ${renderState.showFps ? 'opacity-100 -translate-y-8' : 'opacity-0 translate-y-0'}`}>
           {renderState.fpsBadge && (
             <img src={renderState.fpsBadge} alt="+FPS" className="w-[45px] object-contain" style={{ imageRendering: 'pixelated' }} />
           )}
        </div>
      </div>
    </div>
  );
};
