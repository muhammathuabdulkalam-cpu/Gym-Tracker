/* Next-level neon animated background with particles, aurora, and floating elements */
const AnimatedBackground = () => (
  <>
    <style>{`
      /* ═══════════════ ORB DRIFT ANIMATIONS ═══════════════ */
      @keyframes neon-drift-1 {
        0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
        25%  { transform: translate(80px, -60px) scale(1.15) rotate(5deg); }
        50%  { transform: translate(-40px, 80px) scale(0.9) rotate(-3deg); }
        75%  { transform: translate(60px, 40px) scale(1.1) rotate(2deg); }
        100% { transform: translate(0, 0) scale(1) rotate(0deg); }
      }
      @keyframes neon-drift-2 {
        0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
        33%  { transform: translate(-100px, 70px) scale(1.2) rotate(-5deg); }
        66%  { transform: translate(70px, -80px) scale(0.85) rotate(4deg); }
        100% { transform: translate(0, 0) scale(1) rotate(0deg); }
      }
      @keyframes neon-drift-3 {
        0%   { transform: translate(-50%, -50%) scale(1); }
        50%  { transform: translate(calc(-50% + 60px), calc(-50% + 60px)) scale(1.25); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes neon-drift-4 {
        0%   { transform: translate(0, 0) scale(1); }
        40%  { transform: translate(-60px, -80px) scale(1.1); }
        80%  { transform: translate(80px, 60px) scale(0.95); }
        100% { transform: translate(0, 0) scale(1); }
      }
      @keyframes neon-drift-5 {
        0%   { transform: translate(0, 0) scale(1); }
        35%  { transform: translate(50px, 90px) scale(1.18); }
        70%  { transform: translate(-70px, -50px) scale(0.88); }
        100% { transform: translate(0, 0) scale(1); }
      }

      /* ═══════════════ SCAN LINE ANIMATIONS ═══════════════ */
      @keyframes neon-scan-h {
        0%   { transform: translateY(-100%); opacity: 0; }
        5%   { opacity: 0.08; }
        95%  { opacity: 0.08; }
        100% { transform: translateY(100vh); opacity: 0; }
      }
      @keyframes neon-scan-v {
        0%   { transform: translateX(-100%); opacity: 0; }
        5%   { opacity: 0.05; }
        95%  { opacity: 0.05; }
        100% { transform: translateX(100vw); opacity: 0; }
      }

      /* ═══════════════ AURORA WAVE ANIMATION ═══════════════ */
      @keyframes aurora-wave {
        0%   { transform: translateX(-100%) skewX(-15deg); }
        100% { transform: translateX(200%) skewX(-15deg); }
      }
      @keyframes aurora-pulse {
        0%, 100% { opacity: 0.3; transform: scaleY(1); }
        50%      { opacity: 0.6; transform: scaleY(1.2); }
      }

      /* ═══════════════ PARTICLE ANIMATIONS ═══════════════ */
      @keyframes float-up {
        0%   { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
        10%  { opacity: 1; scale: 1; }
        90%  { opacity: 1; }
        100% { transform: translateY(-20vh) translateX(30px) scale(0.5); opacity: 0; }
      }
      @keyframes float-up-2 {
        0%   { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
        10%  { opacity: 0.8; scale: 1; }
        90%  { opacity: 0.8; }
        100% { transform: translateY(-20vh) translateX(-40px) scale(0.3); opacity: 0; }
      }

      /* ═══════════════ SPARKLE ANIMATIONS ═══════════════ */
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        50%      { opacity: 1; transform: scale(1) rotate(180deg); }
      }
      @keyframes sparkle-pulse {
        0%, 100% { opacity: 0.2; transform: scale(0.8); }
        50%      { opacity: 1; transform: scale(1.2); }
      }

      /* ═══════════════ GLOW PULSE ANIMATION ═══════════════ */
      @keyframes glow-pulse {
        0%, 100% { filter: blur(60px) brightness(1); }
        50%      { filter: blur(80px) brightness(1.3); }
      }
      @keyframes glow-pulse-strong {
        0%, 100% { filter: blur(80px) brightness(1); opacity: 0.6; }
        50%      { filter: blur(100px) brightness(1.5); opacity: 0.9; }
      }

      /* ═══════════════ GEOMETRIC FLOAT ═══════════════ */
      @keyframes geo-float {
        0%   { transform: translateY(0) rotate(0deg); }
        50%  { transform: translateY(-30px) rotate(180deg); }
        100% { transform: translateY(0) rotate(360deg); }
      }
      @keyframes geo-float-reverse {
        0%   { transform: translateY(0) rotate(360deg); }
        50%  { transform: translateY(30px) rotate(180deg); }
        100% { transform: translateY(0) rotate(0deg); }
      }

      /* ═══════════════ MESH ANIMATION ═══════════════ */
      @keyframes mesh-shift {
        0%   { background-position: 0% 0%; }
        50%  { background-position: 100% 100%; }
        100% { background-position: 0% 0%; }
      }

      /* ═══════════════ ANIMATION CLASSES ═══════════════ */
      .neon-orb-1 { animation: neon-drift-1 20s ease-in-out infinite, glow-pulse 8s ease-in-out infinite; }
      .neon-orb-2 { animation: neon-drift-2 24s ease-in-out infinite, glow-pulse 10s ease-in-out infinite 2s; }
      .neon-orb-3 { animation: neon-drift-3 16s ease-in-out infinite, glow-pulse-strong 6s ease-in-out infinite; }
      .neon-orb-4 { animation: neon-drift-4 28s ease-in-out infinite reverse, glow-pulse 12s ease-in-out infinite 1s; }
      .neon-orb-5 { animation: neon-drift-5 22s ease-in-out infinite, glow-pulse 9s ease-in-out infinite 3s; }
      .neon-scan-h { animation: neon-scan-h 8s linear infinite; }
      .neon-scan-h-2 { animation: neon-scan-h 12s linear infinite 4s; }
      .neon-scan-v { animation: neon-scan-v 10s linear infinite 2s; }
      .aurora { animation: aurora-wave 15s linear infinite, aurora-pulse 4s ease-in-out infinite; }
      .aurora-2 { animation: aurora-wave 20s linear infinite 5s, aurora-pulse 5s ease-in-out infinite 2s; }
      .particle-1 { animation: float-up 12s ease-out infinite; }
      .particle-2 { animation: float-up-2 15s ease-out infinite 3s; }
      .particle-3 { animation: float-up 18s ease-out infinite 6s; }
      .particle-4 { animation: float-up-2 14s ease-out infinite 9s; }
      .particle-5 { animation: float-up 16s ease-out infinite 2s; }
      .particle-6 { animation: float-up-2 20s ease-out infinite 8s; }
      .sparkle-1 { animation: sparkle 4s ease-in-out infinite; }
      .sparkle-2 { animation: sparkle 5s ease-in-out infinite 1.5s; }
      .sparkle-3 { animation: sparkle 6s ease-in-out infinite 3s; }
      .sparkle-4 { animation: sparkle-pulse 3s ease-in-out infinite; }
      .sparkle-5 { animation: sparkle-pulse 4s ease-in-out infinite 1s; }
      .geo-1 { animation: geo-float 20s ease-in-out infinite; }
      .geo-2 { animation: geo-float-reverse 25s ease-in-out infinite; }
      .geo-3 { animation: geo-float 18s ease-in-out infinite 5s; }
      .mesh-bg { animation: mesh-shift 30s ease infinite; }
    `}</style>

    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ background: '#030014' }}>

      {/* ═══════════════ MESH GRADIENT BASE ═══════════════ */}
      <div className="mesh-bg absolute inset-0" style={{
        background: `
          radial-gradient(ellipse at 20% 20%, #1e1b4b20 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, #4c1d9520 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, #0f172a 0%, #030014 100%)
        `,
        backgroundSize: '200% 200%',
      }} />

      {/* ═══════════════ NEON ORBS ═══════════════ */}
      
      {/* Electric blue orb - top left */}
      <div className="neon-orb-1 absolute" style={{
        top: '5%', left: '8%',
        width: 750, height: 750,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #3b82f690 0%, #6366f150 35%, #8b5cf620 60%, transparent 75%)',
      }} />

      {/* Violet/magenta orb - bottom right */}
      <div className="neon-orb-2 absolute" style={{
        bottom: '0%', right: '5%',
        width: 700, height: 700,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #a855f790 0%, #ec489970 30%, #f43f5e40 55%, transparent 75%)',
      }} />

      {/* Cyan core orb - center */}
      <div className="neon-orb-3 absolute" style={{
        top: '45%', left: '50%',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #06b6d480 0%, #22d3ee50 30%, #3b82f630 55%, transparent 70%)',
      }} />

      {/* Pink orb - top right */}
      <div className="neon-orb-4 absolute" style={{
        top: '-15%', right: '15%',
        width: 550, height: 550,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f43f5e70 0%, #ec489950 35%, #a855f730 60%, transparent 75%)',
      }} />

      {/* Green/teal orb - bottom left */}
      <div className="neon-orb-5 absolute" style={{
        bottom: '10%', left: '15%',
        width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #10b98160 0%, #06b6d450 35%, #3b82f630 60%, transparent 75%)',
      }} />

      {/* ═══════════════ AURORA WAVES ═══════════════ */}
      <div className="aurora absolute" style={{
        top: '30%', left: '-50%',
        width: '200%', height: '120px',
        background: 'linear-gradient(90deg, transparent, #6366f130, #a855f740, #ec489930, #06b6d430, transparent)',
        filter: 'blur(40px)',
      }} />
      <div className="aurora-2 absolute" style={{
        top: '60%', left: '-50%',
        width: '200%', height: '80px',
        background: 'linear-gradient(90deg, transparent, #06b6d430, #3b82f640, #8b5cf630, transparent)',
        filter: 'blur(50px)',
      }} />

      {/* ═══════════════ SCAN LINES ═══════════════ */}
      <div className="neon-scan-h absolute left-0 right-0 h-[2px]" style={{
        background: 'linear-gradient(90deg, transparent 0%, #6366f1 20%, #a855f7 40%, #ec4899 60%, #06b6d4 80%, transparent 100%)',
        boxShadow: '0 0 30px 6px #6366f160, 0 0 60px 12px #a855f740',
      }} />
      <div className="neon-scan-h-2 absolute left-0 right-0 h-[1px]" style={{
        background: 'linear-gradient(90deg, transparent 0%, #06b6d4 30%, #3b82f6 50%, #8b5cf6 70%, transparent 100%)',
        boxShadow: '0 0 20px 4px #06b6d450',
      }} />
      <div className="neon-scan-v absolute top-0 bottom-0 w-[1px]" style={{
        background: 'linear-gradient(180deg, transparent 0%, #a855f7 30%, #ec4899 50%, #f43f5e 70%, transparent 100%)',
        boxShadow: '0 0 20px 4px #a855f750',
      }} />

      {/* ═══════════════ FLOATING PARTICLES ═══════════════ */}
      {[
        { className: 'particle-1', left: '10%', size: 6, color: '#06b6d4' },
        { className: 'particle-2', left: '25%', size: 4, color: '#a855f7' },
        { className: 'particle-3', left: '40%', size: 8, color: '#3b82f6' },
        { className: 'particle-4', left: '55%', size: 5, color: '#ec4899' },
        { className: 'particle-5', left: '70%', size: 7, color: '#6366f1' },
        { className: 'particle-6', left: '85%', size: 4, color: '#f43f5e' },
        { className: 'particle-1', left: '15%', size: 3, color: '#22d3ee' },
        { className: 'particle-3', left: '60%', size: 5, color: '#8b5cf6' },
        { className: 'particle-5', left: '90%', size: 6, color: '#10b981' },
      ].map((p, i) => (
        <div key={i} className={`${p.className} absolute`} style={{
          left: p.left,
          bottom: 0,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: p.color,
          boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${p.color}80`,
        }} />
      ))}

      {/* ═══════════════ SPARKLES ═══════════════ */}
      {[
        { className: 'sparkle-1', top: '15%', left: '20%', size: 4, color: '#fff' },
        { className: 'sparkle-2', top: '25%', left: '75%', size: 6, color: '#06b6d4' },
        { className: 'sparkle-3', top: '60%', left: '30%', size: 5, color: '#a855f7' },
        { className: 'sparkle-4', top: '70%', left: '80%', size: 4, color: '#fff' },
        { className: 'sparkle-5', top: '40%', left: '90%', size: 3, color: '#ec4899' },
        { className: 'sparkle-1', top: '85%', left: '15%', size: 5, color: '#3b82f6' },
        { className: 'sparkle-2', top: '10%', left: '50%', size: 4, color: '#fff' },
        { className: 'sparkle-4', top: '50%', left: '5%', size: 3, color: '#22d3ee' },
      ].map((s, i) => (
        <div key={i} className={`${s.className} absolute`} style={{
          top: s.top,
          left: s.left,
          width: s.size,
          height: s.size,
          background: s.color,
          boxShadow: `0 0 ${s.size * 4}px ${s.size}px ${s.color}`,
          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        }} />
      ))}

      {/* ═══════════════ FLOATING GEOMETRIC SHAPES ═══════════════ */}
      {/* Hexagon */}
      <div className="geo-1 absolute" style={{
        top: '20%', left: '85%',
        width: 60, height: 60,
        border: '1px solid #6366f140',
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: 'linear-gradient(135deg, #6366f110, transparent)',
      }} />
      {/* Diamond */}
      <div className="geo-2 absolute" style={{
        top: '70%', left: '10%',
        width: 40, height: 40,
        border: '1px solid #a855f740',
        transform: 'rotate(45deg)',
        background: 'linear-gradient(135deg, #a855f710, transparent)',
      }} />
      {/* Triangle */}
      <div className="geo-3 absolute" style={{
        top: '45%', left: '92%',
        width: 0, height: 0,
        borderLeft: '25px solid transparent',
        borderRight: '25px solid transparent',
        borderBottom: '43px solid #06b6d420',
      }} />
      {/* Circle ring */}
      <div className="geo-1 absolute" style={{
        top: '80%', left: '70%',
        width: 80, height: 80,
        borderRadius: '50%',
        border: '1px solid #ec489930',
        background: 'transparent',
      }} />

      {/* ═══════════════ DOT GRID OVERLAY ═══════════════ */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, #ffffff08 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* ═══════════════ VIGNETTE OVERLAY ═══════════════ */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, #03001420 50%, #030014 100%)',
      }} />

      {/* ═══════════════ NOISE TEXTURE ═══════════════ */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

    </div>
  </>
);

export default AnimatedBackground;
