import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Scale, UtensilsCrossed, Dumbbell, Settings, LogOut, User, ChevronDown } from 'lucide-react';
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

// Tranzio Logo Icon Component
const TranzioIcon = ({ size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-lg"
  >
    <defs>
      <linearGradient id="tranzioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="50%" stopColor="#A855F7" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
      <linearGradient id="tranzioAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C4B5FD" />
        <stop offset="100%" stopColor="#818CF8" />
      </linearGradient>
    </defs>
    {/* Background Circle */}
    <circle cx="20" cy="20" r="19" fill="url(#tranzioGradient)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    {/* T Letter with modern design */}
    <path
      d="M12 12H28V16H22V28H18V16H12V12Z"
      fill="white"
      opacity="0.95"
    />
    {/* Accent bar */}
    <rect x="12" y="12" width="16" height="2" rx="1" fill="url(#tranzioAccent)" opacity="0.8"/>
    {/* Small decorative element */}
    <circle cx="28" cy="28" r="3" fill="url(#tranzioAccent)" opacity="0.6"/>
  </svg>
);

const NavBar = () => {
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setIsProfileOpen(false);
    confirmAction('Are you certain you want to sign out?', logoutUser, 'Sign Out');
  };

  return (
    <>
      {/* Desktop / Tablet Top Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/10 hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Side: Tranzio Logo + Name */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <TranzioIcon size={40} />
              </motion.div>
              <span className="font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Tranzio
              </span>
            </Link>

            {/* Center: Links */}
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

            {/* Right Side: Profile Dropdown */}
            <div className="flex-shrink-0 relative" ref={profileRef}>
              <motion.button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-surface/50 border border-white/10 hover:border-white/20 transition-all hover:bg-surface/70"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold overflow-hidden border border-white/20 shadow-lg">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'U'
                  )}
                </div>
                <div className="hidden xl:flex flex-col items-start">
                  <span className="text-sm font-semibold text-white truncate max-w-[100px]">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-xs text-zinc-500 truncate max-w-[100px]">
                    {user?.email || 'user@email.com'}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isProfileOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </motion.div>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                      <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-zinc-400 truncate">{user?.email || 'user@email.com'}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile Settings</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Preferences</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-white/10 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Compact Top Bar for Mobile (logo only) */}
      <header className="lg:hidden sticky top-0 z-50 backdrop-blur-xl bg-background/90 border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Tranzio Logo + Name */}
          <Link to="/" className="flex items-center gap-2">
            <TranzioIcon size={32} />
            <span className="font-bold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Tranzio</span>
          </Link>

          {/* Right: Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <motion.button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1 pr-2 rounded-xl bg-surface/50 border border-white/10"
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold overflow-hidden border border-white/20 shadow-lg text-xs">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name[0].toUpperCase() : 'U'
                )}
              </div>
              <motion.div
                animate={{ rotate: isProfileOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </motion.div>
            </motion.button>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                >
                  {/* User Info Header */}
                  <div className="px-3 py-2.5 border-b border-white/10 bg-white/5">
                    <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-zinc-400 truncate">{user?.email || 'user@email.com'}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1.5">
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-white/10 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* WhatsApp-style Mobile Bottom Navigation */}
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
