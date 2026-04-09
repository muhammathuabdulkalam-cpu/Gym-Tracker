import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Scale, UtensilsCrossed, Dumbbell, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { confirmAction } from '../utils/toastConfirm';
import ProfileImage from "../assets/tranzio_logo.png";


const NAV_LINKS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Weight', path: '/weight', icon: Scale },
  { name: 'Food', path: '/food', icon: UtensilsCrossed },
  { name: 'Workout', path: '/workouts', icon: Dumbbell },
  { name: 'Settings', path: '/settings', icon: Settings },
];

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
      {/* Desktop Top Nav - Premium Borderless (Kept as requested) */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a] hidden lg:block shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Logo Only */}
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <img 
                  src={ProfileImage}
                  alt="Tranzio Logo" 
                  style={{ width: '120px' }}
                  className="h-auto object-contain"
                />
              </motion.div>
            </Link>

            {/* Center: Navigation Links */}
            <div className="flex space-x-0.5">
              {NAV_LINKS.map((link) => {
                const isActive = link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-5 py-2.5 rounded-2xl text-sm font-600 transition-all duration-300 flex items-center gap-2 group ${
                      isActive 
                        ? 'text-white' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <motion.div
                      animate={{ y: isActive ? -2 : 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                    </motion.div>
                    <span className="hidden sm:inline">{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="desktop-nav-indicator"
                        className="absolute inset-0 bg-white/8 rounded-2xl -z-10"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right: Profile Section */}
            <div className="flex-shrink-0 relative" ref={profileRef}>
              <motion.button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 hover:border-purple-500/60 hover:from-purple-500/30 hover:to-indigo-500/30 transition-all duration-300 group shadow-lg shadow-purple-500/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-xl shadow-purple-600/40 group-hover:shadow-purple-500/60 transition-all duration-300 ring-2 ring-purple-300/30">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'U'
                  )}
                </div>
                <div className="hidden xl:flex flex-col items-start">
                  <span className="text-sm font-bold text-white truncate max-w-[120px]">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-xs text-purple-300/80 truncate max-w-[120px]">
                    {user?.email || 'user@email.com'}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isProfileOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="hidden xl:block"
                >
                  <ChevronDown className="w-4 h-4 text-purple-300" />
                </motion.div>
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="absolute right-0 top-full mt-4 w-72 bg-gradient-to-b from-slate-950/95 via-purple-950/90 to-slate-950/95 backdrop-blur-3xl rounded-3xl shadow-2xl shadow-purple-900/50 overflow-hidden border border-purple-500/30"
                  >
                    {/* Header Section */}
                    <div className="px-6 py-5 bg-gradient-to-b from-purple-600/25 via-purple-500/15 to-transparent border-b border-purple-500/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-lg shadow-purple-600/40 ring-2 ring-purple-300/30">
                          {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            user?.name ? user.name[0].toUpperCase() : 'U'
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-purple-300/80 truncate mt-1">{user?.email || 'user@email.com'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-3 px-3 space-y-1">
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 text-sm text-zinc-200 hover:text-white bg-gradient-to-r from-purple-500/0 to-indigo-500/0 hover:from-purple-500/20 hover:to-indigo-500/20 rounded-2xl transition-all duration-250 border border-transparent hover:border-purple-500/30 font-medium"
                      >
                        <User className="w-5 h-5 text-purple-400" />
                        <span>Profile Settings</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 text-sm text-zinc-200 hover:text-white bg-gradient-to-r from-purple-500/0 to-indigo-500/0 hover:from-purple-500/20 hover:to-indigo-500/20 rounded-2xl transition-all duration-250 border border-transparent hover:border-purple-500/30 font-medium"
                      >
                        <Settings className="w-5 h-5 text-purple-400" />
                        <span>Preferences</span>
                      </Link>
                    </div>

                    {/* Logout Section */}
                    <div className="py-3 px-3 border-t border-purple-500/20">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3.5 text-sm text-red-300 hover:text-red-200 bg-gradient-to-r from-red-500/0 to-red-500/0 hover:from-red-500/20 hover:to-red-500/15 rounded-2xl transition-all duration-250 border border-transparent hover:border-red-500/30 w-full font-medium"
                      >
                        <LogOut className="w-5 h-5" />
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

      {/* Improved Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#050505] border-b border-white/5">
        <div className="flex items-center justify-between h-16 px-5">
          {/* Logo with Glow Effect */}
          <Link to="/" className="flex items-center flex-1">
            <div className="relative">
              <div className="absolute -inset-2 bg-purple-500/20 blur-xl rounded-full opacity-50" />
              <img 
                src={ProfileImage}
                style={{height:"50px"}}
                alt="Tranzio Logo" 
                className="h-9 w-auto object-contain relative z-10"
              />
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Profile with Ring Effect */}
            <div className="relative" ref={profileRef}>
              <motion.button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative p-0.5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600"
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-9 h-9 rounded-full bg-[#050505] p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        {user?.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>

              {/* Mobile Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-4 w-64 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[60]"
                  >
                    <div className="p-5 border-b border-white/5 bg-gradient-to-b from-purple-500/10 to-transparent">
                      <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{user?.email || 'user@email.com'}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/settings" className="flex items-center gap-3 p-3 text-sm text-zinc-300 hover:bg-white/5 rounded-2xl transition-colors">
                        <User className="w-4 h-4 text-purple-400" />
                        <span>Profile</span>
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-sm text-red-400 hover:bg-red-500/5 rounded-2xl transition-colors">
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
      </header>

      {/* Reverted Mobile Bottom Navigation (Original Style) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl bg-[#0a0a0a] border-t border-white/5 safe-area-pb">
        <div className="flex items-stretch h-16">
          {NAV_LINKS.map((link) => {
            const isActive = link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all duration-300 ${
                  isActive ? 'text-purple-400' : 'text-zinc-500'
                }`}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-bottom-bg"
                      className="absolute inset-x-2 inset-y-1 rounded-xl bg-purple-500/10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', bounce: 0.3, duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  animate={{ y: isActive ? -3 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative z-10"
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span className="text-[9px] font-bold relative z-10 mt-0.5">
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
