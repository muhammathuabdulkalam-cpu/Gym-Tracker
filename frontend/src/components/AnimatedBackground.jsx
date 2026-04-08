/* Ultra Premium Animated Background - Next Level */
const AnimatedBackground = () => (
  <>
    <style>{`
      /* ═══════════════ MORPHING BLOB ANIMATIONS ═══════════════ */
      @keyframes morph-1 {
        0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg) scale(1); }
        25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: rotate(90deg) scale(1.05); }
        50% { border-radius: 50% 60% 30% 60% / 30% 70% 70% 40%; transform: rotate(180deg) scale(0.95); }
        75% { border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%; transform: rotate(270deg) scale(1.02); }
      }
      @keyframes morph-2 {
        0%, 100% { border-radius: 40% 60% 60% 40% / 70% 30% 70% 30%; transform: rotate(0deg) scale(1); }
        33% { border-radius: 70% 30% 50% 50% / 30% 70% 40% 60%; transform: rotate(120deg) scale(1.08); }
        66% { border-radius: 30% 70% 40% 60% / 60% 40% 60% 40%; transform: rotate(240deg) scale(0.92); }
      }
      @keyframes morph-3 {
        0%, 100% { border-radius: 50% 50% 40% 60% / 40% 60% 50% 50%; transform: rotate(0deg); }
        50% { border-radius: 40% 60% 50% 50% / 60% 40% 50% 50%; transform: rotate(180deg); }
      }

      /* ═══════════════ COMET/SHOOTING STAR ANIMATIONS ═══════════════ */
      @keyframes comet-1 {
        0% { transform: translateX(-100px) translateY(-100px) rotate(45deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateX(calc(100vw + 100px)) translateY(calc(100vh + 100px)) rotate(45deg); opacity: 0; }
      }
      @keyframes comet-2 {
        0% { transform: translateX(calc(100vw + 100px)) translateY(-100px) rotate(-45deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateX(-100px) translateY(calc(100vh + 100px)) rotate(-45deg); opacity: 0; }
      }
      @keyframes comet-3 {
        0% { transform: translateX(-50px) translateY(50vh) rotate(15deg); opacity: 0; }
        5% { opacity: 1; }
        95% { opacity: 1; }
        100% { transform: translateX(calc(100vw + 50px)) translateY(30vh) rotate(15deg); opacity: 0; }
      }

      /* ═══════════════ PULSING RING ANIMATIONS ═══════════════ */
      @keyframes ring-pulse {
        0% { transform: scale(0.8); opacity: 0.8; }
        50% { transform: scale(1.2); opacity: 0.3; }
        100% { transform: scale(0.8); opacity: 0.8; }
      }
      @keyframes ring-expand {
        0% { transform: scale(0); opacity: 0.6; }
        100% { transform: scale(3); opacity: 0; }
      }
      @keyframes ring-rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* ═══════════════ NEBULA CLOUD ANIMATIONS ═══════════════ */
      @keyframes nebula-drift {
        0%, 100% { transform: translate(0, 0) scale(1); filter: blur(80px) brightness(1); }
        25% { transform: translate(50px, -30px) scale(1.1); filter: blur(90px) brightness(1.2); }
        50% { transform: translate(-30px, 50px) scale(0.95); filter: blur(70px) brightness(0.9); }
        75% { transform: translate(40px, 30px) scale(1.05); filter: blur(85px) brightness(1.1); }
      }
      @keyframes nebula-breathe {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.15); }
      }

      /* ═══════════════ LIGHTNING/ELECTRIC PULSE ═══════════════ */
      @keyframes electric-pulse {
        0%, 100% { opacity: 0; }
        2% { opacity: 0.8; }
        4% { opacity: 0; }
        6% { opacity: 0.6; }
        8% { opacity: 0; }
        50% { opacity: 0; }
      }

      /* ═══════════════ WAVE ANIMATIONS ═══════════════ */
      @keyframes wave-flow {
        0% { transform: translateX(-100%) skewX(-5deg); }
        100% { transform: translateX(200%) skewX(-5deg); }
      }
      @keyframes wave-vertical {
        0% { transform: translateY(-100%) skewY(-5deg); }
        100% { transform: translateY(200%) skewY(-5deg); }
      }

      /* ═══════════════ FLOATING ORB DANCE ═══════════════ */
      @keyframes orb-dance-1 {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        20% { transform: translate(100px, -50px) rotate(72deg); }
        40% { transform: translate(-50px, 80px) rotate(144deg); }
        60% { transform: translate(80px, 60px) rotate(216deg); }
        80% { transform: translate(-80px, -40px) rotate(288deg); }
      }
      @keyframes orb-dance-2 {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(-80px, 60px) rotate(90deg); }
        50% { transform: translate(60px, -80px) rotate(180deg); }
        75% { transform: translate(-60px, -60px) rotate(270deg); }
      }

      /* ═══════════════ STARDUST PARTICLES ═══════════════ */
      @keyframes stardust {
        0% { transform: translateY(100vh) translateX(0) rotate(0deg) scale(0); opacity: 0; }
        10% { opacity: 1; transform: translateY(90vh) translateX(10px) rotate(36deg) scale(1); }
        90% { opacity: 0.8; }
        100% { transform: translateY(-10vh) translateX(-20px) rotate(360deg) scale(0.3); opacity: 0; }
      }
      @keyframes stardust-reverse {
        0% { transform: translateY(-10vh) translateX(0) rotate(0deg) scale(0); opacity: 0; }
        10% { opacity: 1; transform: translateY(0vh) translateX(-10px) rotate(36deg) scale(1); }
        90% { opacity: 0.8; }
        100% { transform: translateY(110vh) translateX(20px) rotate(360deg) scale(0.3); opacity: 0; }
      }

      /* ═══════════════ GRID PULSE ═══════════════ */
      @keyframes grid-pulse {
        0%, 100% { opacity: 0.03; }
        50% { opacity: 0.08; }
      }

      /* ═══════════════ GLOW ANIMATIONS ═══════════════ */
      @keyframes glow-breathe {
        0%, 100% { filter: blur(60px) brightness(1); box-shadow: 0 0 60px 30px currentColor; }
        50% { filter: blur(80px) brightness(1.4); box-shadow: 0 0 100px 50px currentColor; }
      }
      @keyframes spotlight {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
        50% { transform: scale(1.3) rotate(180deg); opacity: 0.5; }
      }

      /* ═══════════════ HEXAGON GRID ANIMATION ═══════════════ */
      @keyframes hex-fade {
        0%, 100% { opacity: 0.02; }
        50% { opacity: 0.06; }
      }

      /* ═══════════════ ANIMATION CLASSES ═══════════════ */
      .morph-blob-1 { animation: morph-1 25s ease-in-out infinite, nebula-drift 30s ease-in-out infinite; }
      .morph-blob-2 { animation: morph-2 30s ease-in-out infinite, nebula-drift 35s ease-in-out infinite 5s; }
      .morph-blob-3 { animation: morph-3 20s ease-in-out infinite, nebula-breathe 15s ease-in-out infinite; }
      .morph-blob-4 { animation: morph-1 35s ease-in-out infinite reverse, nebula-breathe 20s ease-in-out infinite 3s; }
      .morph-blob-5 { animation: morph-2 28s ease-in-out infinite, nebula-drift 25s ease-in-out infinite reverse; }
      
      .comet-1 { animation: comet-1 8s linear infinite; }
      .comet-2 { animation: comet-2 12s linear infinite 4s; }
      .comet-3 { animation: comet-3 10s linear infinite 7s; }
      
      .ring-1 { animation: ring-pulse 8s ease-in-out infinite, ring-rotate 30s linear infinite; }
      .ring-2 { animation: ring-pulse 10s ease-in-out infinite 2s, ring-rotate 40s linear infinite reverse; }
      .ring-expand-1 { animation: ring-expand 4s ease-out infinite; }
      .ring-expand-2 { animation: ring-expand 4s ease-out infinite 2s; }
      
      .electric { animation: electric-pulse 8s ease-in-out infinite; }
      .electric-2 { animation: electric-pulse 10s ease-in-out infinite 3s; }
      
      .wave-1 { animation: wave-flow 12s linear infinite; }
      .wave-2 { animation: wave-flow 18s linear infinite 6s; }
      .wave-v { animation: wave-vertical 15s linear infinite 3s; }
      
      .orb-1 { animation: orb-dance-1 40s ease-in-out infinite, glow-breathe 8s ease-in-out infinite; }
      .orb-2 { animation: orb-dance-2 35s ease-in-out infinite, glow-breathe 10s ease-in-out infinite 2s; }
      .orb-3 { animation: orb-dance-1 45s ease-in-out infinite reverse, glow-breathe 12s ease-in-out infinite 4s; }
      
      .spotlight { animation: spotlight 20s ease-in-out infinite; }
      .grid-animated { animation: grid-pulse 8s ease-in-out infinite; }
      .hex-grid { animation: hex-fade 10s ease-in-out infinite; }
    `}</style>

    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ background: '#030014' }}>

      {/* ═══════════════ DEEP SPACE BASE ═══════════════ */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 150% 100% at 50% 0%, #0f0a1e 0%, transparent 50%),
          radial-gradient(ellipse 100% 150% at 100% 100%, #1a0a2e 0%, transparent 50%),
          radial-gradient(ellipse 100% 150% at 0% 100%, #0a1628 0%, transparent 50%),
          linear-gradient(180deg, #030014 0%, #050520 50%, #030014 100%)
        `,
      }} />

      {/* ═══════════════ MORPHING NEBULA BLOBS ═══════════════ */}
      
      {/* Primary Cyan-Blue Nebula */}
      <div className="morph-blob-1 absolute" style={{
        top: '-10%', left: '-5%',
        width: '60vw', height: '60vw',
        maxWidth: 900, maxHeight: 900,
        background: 'radial-gradient(ellipse at center, #06b6d480 0%, #3b82f650 25%, #6366f130 50%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      {/* Secondary Violet-Magenta Nebula */}
      <div className="morph-blob-2 absolute" style={{
        bottom: '-15%', right: '-10%',
        width: '70vw', height: '70vw',
        maxWidth: 1000, maxHeight: 1000,
        background: 'radial-gradient(ellipse at center, #a855f780 0%, #ec489960 25%, #f43f5e40 50%, transparent 70%)',
        filter: 'blur(70px)',
      }} />

      {/* Tertiary Teal-Emerald Nebula */}
      <div className="morph-blob-3 absolute" style={{
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50vw', height: '50vw',
        maxWidth: 700, maxHeight: 700,
        background: 'radial-gradient(ellipse at center, #10b98160 0%, #06b6d450 30%, #3b82f630 55%, transparent 70%)',
        filter: 'blur(50px)',
      }} />

      {/* Rose-Pink Accent Nebula */}
      <div className="morph-blob-4 absolute" style={{
        top: '10%', right: '20%',
        width: '40vw', height: '40vw',
        maxWidth: 600, maxHeight: 600,
        background: 'radial-gradient(ellipse at center, #f43f5e60 0%, #ec489950 30%, #a855f730 55%, transparent 70%)',
        filter: 'blur(55px)',
      }} />

      {/* Deep Blue Accent Nebula */}
      <div className="morph-blob-5 absolute" style={{
        bottom: '20%', left: '10%',
        width: '35vw', height: '35vw',
        maxWidth: 500, maxHeight: 500,
        background: 'radial-gradient(ellipse at center, #3b82f670 0%, #6366f150 30%, #8b5cf630 55%, transparent 70%)',
        filter: 'blur(45px)',
      }} />

      {/* ═══════════════ ANIMATED SPOTLIGHT ═══════════════ */}
      <div className="spotlight absolute" style={{
        top: '30%', left: '40%',
        width: 400, height: 400,
        background: 'conic-gradient(from 0deg, transparent, #6366f120, transparent, #a855f720, transparent, #06b6d420, transparent)',
        borderRadius: '50%',
        filter: 'blur(30px)',
      }} />

      {/* ═══════════════ PULSING RINGS ═══════════════ */}
      <div className="ring-1 absolute" style={{
        top: '25%', left: '60%',
        width: 300, height: 300,
        borderRadius: '50%',
        border: '1px solid #6366f140',
        boxShadow: 'inset 0 0 50px #6366f120, 0 0 50px #6366f120',
      }} />
      <div className="ring-2 absolute" style={{
        top: '55%', left: '25%',
        width: 250, height: 250,
        borderRadius: '50%',
        border: '1px solid #a855f740',
        boxShadow: 'inset 0 0 40px #a855f720, 0 0 40px #a855f720',
      }} />

      {/* Expanding Rings */}
      <div className="ring-expand-1 absolute" style={{
        top: '40%', left: '50%',
        width: 100, height: 100,
        marginLeft: -50, marginTop: -50,
        borderRadius: '50%',
        border: '2px solid #06b6d460',
      }} />
      <div className="ring-expand-2 absolute" style={{
        top: '40%', left: '50%',
        width: 100, height: 100,
        marginLeft: -50, marginTop: -50,
        borderRadius: '50%',
        border: '2px solid #a855f760',
      }} />

      {/* ═══════════════ SHOOTING STARS / COMETS ═══════════════ */}
      <div className="comet-1 absolute" style={{
        top: 0, left: 0,
        width: 150, height: 2,
        background: 'linear-gradient(90deg, transparent, #fff, #06b6d4, transparent)',
        boxShadow: '0 0 10px #06b6d4, 0 0 20px #06b6d480, 0 0 40px #06b6d440',
        borderRadius: '50%',
      }} />
      <div className="comet-2 absolute" style={{
        top: '20%', right: 0,
        width: 120, height: 2,
        background: 'linear-gradient(90deg, transparent, #a855f7, #fff, transparent)',
        boxShadow: '0 0 10px #a855f7, 0 0 20px #a855f780, 0 0 40px #a855f740',
        borderRadius: '50%',
      }} />
      <div className="comet-3 absolute" style={{
        top: '60%', left: 0,
        width: 100, height: 1,
        background: 'linear-gradient(90deg, transparent, #ec4899, #fff, transparent)',
        boxShadow: '0 0 8px #ec4899, 0 0 16px #ec489980',
        borderRadius: '50%',
      }} />

      {/* ═══════════════ ENERGY WAVES ═══════════════ */}
      <div className="wave-1 absolute" style={{
        top: '35%', left: '-100%',
        width: '100%', height: 100,
        background: 'linear-gradient(90deg, transparent, #6366f120, #a855f730, #ec489920, transparent)',
        filter: 'blur(30px)',
      }} />
      <div className="wave-2 absolute" style={{
        top: '65%', left: '-100%',
        width: '100%', height: 60,
        background: 'linear-gradient(90deg, transparent, #06b6d420, #3b82f630, #6366f120, transparent)',
        filter: 'blur(25px)',
      }} />
      <div className="wave-v absolute" style={{
        top: '-100%', left: '75%',
        width: 80, height: '100%',
        background: 'linear-gradient(180deg, transparent, #a855f720, #f43f5e30, transparent)',
        filter: 'blur(25px)',
      }} />

      {/* ═══════════════ ELECTRIC FLASH OVERLAYS ═══════════════ */}
      <div className="electric absolute inset-0" style={{
        background: 'linear-gradient(135deg, transparent 40%, #6366f115 50%, transparent 60%)',
      }} />
      <div className="electric-2 absolute inset-0" style={{
        background: 'linear-gradient(225deg, transparent 40%, #06b6d410 50%, transparent 60%)',
      }} />

      {/* ═══════════════ STARDUST PARTICLES ═══════════════ */}
      {[
        { left: '5%', delay: '0s', duration: '15s', size: 4, color: '#06b6d4' },
        { left: '15%', delay: '2s', duration: '18s', size: 3, color: '#a855f7' },
        { left: '25%', delay: '4s', duration: '20s', size: 5, color: '#3b82f6' },
        { left: '35%', delay: '1s', duration: '16s', size: 3, color: '#ec4899' },
        { left: '45%', delay: '6s', duration: '22s', size: 4, color: '#6366f1' },
        { left: '55%', delay: '3s', duration: '17s', size: 6, color: '#f43f5e' },
        { left: '65%', delay: '5s', duration: '19s', size: 3, color: '#22d3ee' },
        { left: '75%', delay: '7s', duration: '21s', size: 4, color: '#8b5cf6' },
        { left: '85%', delay: '2s', duration: '14s', size: 5, color: '#10b981' },
        { left: '95%', delay: '8s', duration: '23s', size: 3, color: '#fbbf24' },
        { left: '10%', delay: '9s', duration: '16s', size: 4, color: '#fff', reverse: true },
        { left: '30%', delay: '11s', duration: '18s', size: 3, color: '#06b6d4', reverse: true },
        { left: '50%', delay: '13s', duration: '20s', size: 5, color: '#a855f7', reverse: true },
        { left: '70%', delay: '10s', duration: '15s', size: 4, color: '#ec4899', reverse: true },
        { left: '90%', delay: '12s', duration: '17s', size: 3, color: '#3b82f6', reverse: true },
      ].map((p, i) => (
        <div key={`star-${i}`} className="absolute" style={{
          left: p.left,
          bottom: p.reverse ? 'auto' : 0,
          top: p.reverse ? 0 : 'auto',
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: p.color,
          boxShadow: `0 0 ${p.size * 4}px ${p.size}px ${p.color}80, 0 0 ${p.size * 8}px ${p.size * 2}px ${p.color}40`,
          animation: `${p.reverse ? 'stardust-reverse' : 'stardust'} ${p.duration} ease-out infinite`,
          animationDelay: p.delay,
        }} />
      ))}

      {/* ═══════════════ GLOWING ORBS ═══════════════ */}
      <div className="orb-1 absolute" style={{
        top: '20%', left: '15%',
        width: 20, height: 20,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #fff 0%, #06b6d4 50%, transparent 70%)',
        boxShadow: '0 0 30px 15px #06b6d480, 0 0 60px 30px #06b6d440',
      }} />
      <div className="orb-2 absolute" style={{
        top: '70%', right: '20%',
        width: 16, height: 16,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #fff 0%, #a855f7 50%, transparent 70%)',
        boxShadow: '0 0 25px 12px #a855f780, 0 0 50px 25px #a855f740',
      }} />
      <div className="orb-3 absolute" style={{
        top: '45%', left: '80%',
        width: 14, height: 14,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #fff 0%, #ec4899 50%, transparent 70%)',
        boxShadow: '0 0 20px 10px #ec489980, 0 0 40px 20px #ec489940',
      }} />

      {/* ═══════════════ HEXAGON GRID PATTERN ═══════════════ */}
      <svg className="hex-grid absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
        <defs>
          <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <polygon points="25,0 50,14.4 50,43.4 25,57.8 0,43.4 0,14.4" fill="none" stroke="#6366f1" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>

      {/* ═══════════════ ANIMATED DOT GRID ═══════════════ */}
      <div className="grid-animated absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, #ffffff10 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* ═══════════════ CENTRAL GLOW ═══════════════ */}
      <div className="absolute" style={{
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, #6366f115 0%, #a855f710 30%, transparent 60%)',
        filter: 'blur(60px)',
        animation: 'nebula-breathe 10s ease-in-out infinite',
      }} />

      {/* ═══════════════ VIGNETTE OVERLAY ═══════════════ */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 80% at center, transparent 0%, #03001450 60%, #030014 100%)',
      }} />

      {/* ═══════════════ FILM GRAIN / NOISE ═══════════════ */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

    </div>
  </>
);

export default AnimatedBackground;
