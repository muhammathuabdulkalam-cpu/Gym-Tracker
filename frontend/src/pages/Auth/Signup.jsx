import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register, googleLogin } from '../../api';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await register({ email, password });
      loginUser(userData);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };
  
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const userData = await googleLogin({ credential: credentialResponse.credential });
      loginUser(userData);
    } catch (err) {
      setError('Google Login failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-[80vh] flex items-center justify-center z-10 relative">
      <div className="bg-surface/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Create Account</h1>
        <p className="text-zinc-400 text-center mb-8">Start your fitness journey today.</p>

        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-xl mb-6 text-sm border border-red-500/20">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
          </div>
          <button type="submit" className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all">Sign Up</button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="relative w-full flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-500 text-sm">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Sign Up Failed')} theme="filled_black" shape="pill" />
        </div>

        <p className="mt-8 text-center text-sm text-zinc-400">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Signup;
