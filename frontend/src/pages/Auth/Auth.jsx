import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { login, register } from '../../api';
import { Eye, EyeOff, Loader2, Zap, TrendingUp, Dumbbell, BarChart2, Shield } from 'lucide-react';

/* ─── Illustration Panel Content ─────────────────────────────── */
const loginIllustration = {
  title: 'Track Every Rep.',
  subtitle: 'Your progress, your splits, your macros — all in one place.',
  gradient: 'from-primary via-blue-500 to-cyan-400',
  icon: <Dumbbell className="w-20 h-20 text-white/20" />,
  stats: [
    { label: 'Workouts Logged', value: '10k+', icon: <Dumbbell className="w-4 h-4" /> },
    { label: 'Calories Tracked', value: '2M+', icon: <Zap className="w-4 h-4" /> },
    { label: 'PRs Broken', value: '50k+', icon: <TrendingUp className="w-4 h-4" /> },
  ],
};

const signupIllustration = {
  title: 'Your Journey Starts Here.',
  subtitle: 'Build your custom split, log weights, and crush your goals daily.',
  gradient: 'from-accent via-purple-500 to-pink-400',
  icon: <BarChart2 className="w-20 h-20 text-white/20" />,
  stats: [
    { label: 'Custom Splits', value: '∞', icon: <Shield className="w-4 h-4" /> },
    { label: 'Analytics', value: 'Live', icon: <BarChart2 className="w-4 h-4" /> },
    { label: 'Data Secure', value: '100%', icon: <Shield className="w-4 h-4" /> },
  ],
};

/* ─── Animated Illustration Panel ────────────────────────────── */
const IllustrationPanel = ({ isLogin }) => {
  const data = isLogin ? loginIllustration : signupIllustration;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isLogin ? 'login-ill' : 'signup-ill'}
        initial={{ opacity: 0, x: isLogin ? -60 : 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isLogin ? 60 : -60 }}
        transition={{ duration: 0.55, type: 'spring', bounce: 0.2 }}
        className={`relative flex flex-col items-center justify-center h-full p-10 rounded-2xl overflow-hidden bg-gradient-to-br ${data.gradient}`}
      >
        {/* Subtle grid mesh overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        {/* Floating blobs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"
        />

        {/* Big icon */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 mb-6"
        >
          {data.icon}
        </motion.div>

        {/* Headline */}
        <h2 className="relative z-10 text-3xl font-extrabold text-white text-center mb-3 drop-shadow-lg leading-tight">
          {data.title}
        </h2>
        <p className="relative z-10 text-white/70 text-center text-sm mb-10 max-w-xs leading-relaxed">
          {data.subtitle}
        </p>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-3 w-full max-w-xs">
          {data.stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center bg-white/10 rounded-2xl p-3 backdrop-blur-md border border-white/10">
              <span className="text-white/60 mb-1">{s.icon}</span>
              <span className="text-white font-bold text-lg leading-tight">{s.value}</span>
              <span className="text-white/50 text-[10px] text-center leading-tight mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─── Form Panel ─────────────────────────────────────────────── */
const FormPanel = ({ isLogin, email, setEmail, password, setPassword, showPassword, setShowPassword, loading, error, handleSubmit }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={isLogin ? 'login-form' : 'signup-form'}
      initial={{ opacity: 0, x: isLogin ? 60 : -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isLogin ? -60 : 60 }}
      transition={{ duration: 0.55, type: 'spring', bounce: 0.2 }}
      className="flex flex-col justify-center h-full px-2"
    >
      <h1 className="text-3xl font-extrabold text-white mb-2">
        {isLogin ? 'Welcome Back 👋' : 'Create Account 🚀'}
      </h1>
      <p className="text-zinc-400 mb-8 text-sm font-medium">
        {isLogin ? 'Sign in to continue your fitness journey.' : 'Join thousands of athletes tracking their best selves.'}
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 text-red-400 p-3 rounded-xl mb-5 text-sm border border-red-500/20 font-semibold"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Email Address</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            placeholder="you@email.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-zinc-600"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow pr-12 placeholder-zinc-600"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1 rounded-md">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit" disabled={loading}
          className={`w-full mt-2 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 ${isLogin
            ? 'bg-gradient-to-r from-primary to-blue-600 hover:shadow-primary/30 hover:shadow-xl'
            : 'bg-gradient-to-r from-accent to-purple-600 hover:shadow-accent/30 hover:shadow-xl'
          }`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
        </motion.button>
      </form>
    </motion.div>
  </AnimatePresence>
);

/* ─── Main Auth Component ────────────────────────────────────── */
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userData = isLogin
        ? await login({ email, password })
        : await register({ email, password });
      loginUser(userData);
    } catch (err) {
      setError(err.response?.data?.message || `${isLogin ? 'Login' : 'Registration'} failed`);
    }
    setLoading(false);
  };

  const switchMode = (toLogin) => {
    if (toLogin === isLogin) return;
    setIsLogin(toLogin);
    setError(null);
    setEmail('');
    setPassword('');
  };

  const formProps = { isLogin, email, setEmail, password, setPassword, showPassword, setShowPassword, loading, error, handleSubmit };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }} className="min-h-screen flex items-center justify-center px-4 py-8 relative z-10">
      <div className="w-full max-w-5xl">

        {/* ── Tab Switcher ── */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-xl">
            {[{ label: 'Sign In', val: true }, { label: 'Sign Up', val: false }].map(({ label, val }) => (
              <button
                key={label}
                onClick={() => switchMode(val)}
                className={`relative px-8 py-2.5 rounded-xl text-sm font-bold transition-colors ${isLogin === val ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                {isLogin === val && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className={`absolute inset-0 rounded-xl ${val ? 'bg-gradient-to-r from-primary to-blue-600' : 'bg-gradient-to-r from-accent to-purple-600'}`}
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Two-Panel Card ── */}
        <div className="bg-surface/70 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden min-h-[520px]">
          <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-[520px]">

            {/* Sign In: form left | illustration right */}
            {/* Sign Up: illustration left | form right */}

            {/* LEFT SLOT */}
            <div className="p-10 flex flex-col justify-center">
              {isLogin ? (
                <FormPanel {...formProps} />
              ) : (
                <IllustrationPanel isLogin={isLogin} />
              )}
            </div>

            {/* RIGHT SLOT */}
            <div className="p-10 flex flex-col justify-center bg-white/[0.02] border-l border-white/5">
              {isLogin ? (
                <IllustrationPanel isLogin={isLogin} />
              ) : (
                <FormPanel {...formProps} />
              )}
            </div>

          </div>
        </div>

        {/* ── Switch hint below card ── */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => switchMode(!isLogin)} className={`font-bold hover:underline ${isLogin ? 'text-primary' : 'text-accent'}`}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

      </div>
    </motion.div>
  );
};

export default Auth;
