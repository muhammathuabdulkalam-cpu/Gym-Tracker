import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Scale, UtensilsCrossed, Dumbbell, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { confirmAction } from '../utils/toastConfirm';

const NAV_LINKS = [
  { name: 'Dashboard',       path: '/',          icon: LayoutDashboard },
  { name: 'Weight',          path: '/weight',     icon: Scale },
  { name: 'Food',            path: '/food',       icon: UtensilsCrossed },
  { name: 'Workout',         path: '/workouts',   icon: Dumbbell },
  { name: 'Settings',        path: '/settings',   icon: Settings },
];

// Per-icon hover animations for the desktop nav
const ICON_ANIM = {
  Dashboard:  { hover: { scale: 1.15, rotate: 5,  transition: { duration: 0.2 } } },
  Weight:     { hover: { y: [-2, 2, -2], transition: { repeat: Infinity, duration: 0.6 } } },
  Food:       { hover: { rotate: [-10, 10, -10], transition: { repeat: Infinity, duration: 0.5 } } },
  Workout:    { hover: { y: [-2, 2, -2], rotate: [-15, 15, -15], transition: { repeat: Infinity, duration: 0.4 } } },
  Settings:   { hover: { rotate: 180, transition: { duration: 0.5 } } },
};

const NavBar = () => {
  const location = useLocation();
  const { user, logoutUser } = useAuth();

  return (
    <>
      {/* ── Desktop / Tablet Top Nav ─────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/10 hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold cursor-pointer overflow-hidden border border-white/20 hover:border-white/50 transition-colors shadow-lg">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name[0].toUpperCase() : 'U'
                )}
              </div>
              <span className="font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Tranzio
              </span>
            </Link>

            {/* Links */}
            <div className="flex space-x-1 bg-surface/50 p-1.5 rounded-2xl border border-white/5">
              {NAV_LINKS.map((link) => {
                const isActive = link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path);
                const Icon = link.icon;
                const anim = ICON_ANIM[link.name] || {};
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 group ${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <motion.div variants={anim} whileHover="hover">
                        <Icon className="w-4 h-4" />
                      </motion.div>
                      <span>{link.name}</span>
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-white/10 rounded-xl"
                        transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <button
              onClick={() => confirmAction('Are you certain you want to sign out?', logoutUser, 'Sign Out')}
              className="text-zinc-400 hover:text-red-400 transition-colors text-sm font-semibold border border-transparent hover:border-red-500/20 hover:bg-red-500/10 px-4 py-2 rounded-xl"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Compact Top Bar for Mobile (logo only) ───────────── */}
      <header className="lg:hidden sticky top-0 z-50 backdrop-blur-xl bg-background/90 border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold overflow-hidden border border-white/20 shadow-lg text-sm">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name[0].toUpperCase() : 'U'
              )}
            </div>
            <span className="font-bold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Tranzio</span>
          </Link>
          <button
            onClick={() => confirmAction('Are you certain you want to sign out?', logoutUser, 'Sign Out')}
            className="text-zinc-500 hover:text-red-400 text-xs font-semibold transition-colors px-3 py-1.5 rounded-xl hover:bg-red-500/10"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── WhatsApp-style Mobile Bottom Navigation ───────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl bg-background/90 border-t border-white/10 safe-area-pb">
        <div className="flex items-stretch h-16">
          {NAV_LINKS.map((link) => {
            const isActive = link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors"
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-tab-bg"
                      className="absolute inset-x-2 inset-y-1.5 rounded-2xl bg-white/10"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', bounce: 0.4, duration: 0.3 }}
                  className="relative z-10"
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-zinc-500'}`} />
                </motion.div>
                <span className={`text-[10px] font-bold relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-zinc-600'}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
