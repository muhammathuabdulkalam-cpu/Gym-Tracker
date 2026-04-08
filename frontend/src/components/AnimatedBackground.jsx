/* Neon animated background — pure CSS, no canvas, 60fps */
const AnimatedBackground = () => (
  <>
    <style>{`
      @keyframes neon-drift-1 {
        0%   { transform: translate(0, 0) scale(1); }
        33%  { transform: translate(60px, -40px) scale(1.08); }
        66%  { transform: translate(-30px, 60px) scale(0.95); }
        100% { transform: translate(0, 0) scale(1); }
      }
      @keyframes neon-drift-2 {
        0%   { transform: translate(0, 0) scale(1); }
        33%  { transform: translate(-80px, 50px) scale(1.12); }
        66%  { transform: translate(50px, -60px) scale(0.92); }
        100% { transform: translate(0, 0) scale(1); }
      }
      @keyframes neon-drift-3 {
        0%   { transform: translate(0, 0) scale(1); }
        50%  { transform: translate(40px, 40px) scale(1.15); }
        100% { transform: translate(0, 0) scale(1); }
      }
      @keyframes neon-scan {
        0%   { transform: translateY(-100%); opacity: 0; }
        10%  { opacity: 0.06; }
        90%  { opacity: 0.06; }
        100% { transform: translateY(100vh); opacity: 0; }
      }
      @keyframes neon-flicker {
        0%, 100% { opacity: 1; }
        92%       { opacity: 1; }
        93%       { opacity: 0.4; }
        94%       { opacity: 1; }
        96%       { opacity: 0.6; }
        97%       { opacity: 1; }
      }
      .neon-orb-1 { animation: neon-drift-1 18s ease-in-out infinite; }
      .neon-orb-2 { animation: neon-drift-2 22s ease-in-out infinite; }
      .neon-orb-3 { animation: neon-drift-3 14s ease-in-out infinite; }
      .neon-orb-4 { animation: neon-drift-1 26s ease-in-out infinite reverse; }
      .neon-scan  { animation: neon-scan 8s linear infinite; }
      .neon-flicker { animation: neon-flicker 6s step-end infinite; }
    `}</style>

    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ background: '#04040f' }}>

      {/* ── Neon orb: electric blue ── */}
      <div className="neon-orb-1 absolute" style={{
        top: '5%', left: '10%',
        width: 700, height: 700,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #3b82f680 0%, #6366f140 40%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      {/* ── Neon orb: violet/magenta ── */}
      <div className="neon-orb-2 absolute" style={{
        bottom: '5%', right: '8%',
        width: 650, height: 650,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #a855f780 0%, #ec489960 40%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      {/* ── Neon orb: cyan ── */}
      <div className="neon-orb-3 absolute" style={{
        top: '40%', left: '50%',
        width: 500, height: 500,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #06b6d460 0%, #3b82f630 50%, transparent 70%)',
        filter: 'blur(80px)',
      }} />

      {/* ── Neon orb: pink top-right ── */}
      <div className="neon-orb-4 absolute" style={{
        top: '-10%', right: '20%',
        width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f43f5e50 0%, #a855f730 50%, transparent 70%)',
        filter: 'blur(80px)',
      }} />

      {/* ── Neon horizontal scan line ── */}
      <div className="neon-scan absolute left-0 right-0 h-[2px]" style={{
        background: 'linear-gradient(90deg, transparent 0%, #6366f1 30%, #a855f7 50%, #06b6d4 70%, transparent 100%)',
        boxShadow: '0 0 20px 4px #6366f180',
      }} />

      {/* ── Fine dot grid overlay ── */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, #ffffff0a 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
    </div>
  </>
);

export default AnimatedBackground;
