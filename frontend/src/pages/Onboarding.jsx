import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, saveWeightLog } from '../api';
import { User, Weight, Ruler, Activity, ChevronRight, Loader2 } from 'lucide-react';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male', emoji: '♂️' },
  { label: 'Female', value: 'female', emoji: '♀️' },
  { label: 'Other', value: 'other', emoji: '⚧️' },
];

const Onboarding = () => {
  const { user, updateUserProfile } = useAuth();
  const [step, setStep] = useState(1); // 2-step wizard
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || 'male');
  const [weight, setWeight] = useState(user?.weight || '');
  const [height, setHeight] = useState(user?.height || '');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!name || !age) return;
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      // Save profile (name, age, gender, weight, height)
      const updatedUser = await updateProfile({
        name,
        age: Number(age),
        gender,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
      });
      updateUserProfile(updatedUser);

      // Also store weight as the first WeightLog entry
      // so it shows immediately in Weight Tracking page and Settings
      if (weight && Number(weight) > 0) {
        try {
          await saveWeightLog({ date: today, weight: Number(weight) });
        } catch {}
        // Re-hydrate context with this weight
        updateUserProfile({ ...updatedUser, weight: Number(weight) });
      }

      navigate('/');
    } catch {
      setError('Failed to save profile details');
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-[80vh] flex items-center justify-center z-10 relative px-4">
      <div className="bg-surface/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-lg">

        {/* Progress indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-gradient-to-r from-primary to-accent' : 'bg-white/10'}`} />
          ))}
        </div>

        {step === 1 ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Who are you?</h1>
              <p className="text-zinc-400 text-sm">Basic info to set up your profile.</p>
            </div>

            {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-6 text-sm border border-red-500/20">{error}</div>}

            <form onSubmit={handleStep1} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest block mb-2">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest block mb-2">Age</label>
                <input type="number" min="10" max="120" value={age} onChange={e => setAge(e.target.value)} required placeholder="e.g. 22"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest block mb-2">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {GENDER_OPTIONS.map(g => (
                    <button key={g.value} type="button" onClick={() => setGender(g.value)}
                      className={`p-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-1 ${gender === g.value ? 'border-primary bg-primary/20 text-white' : 'border-white/10 text-zinc-400 hover:border-white/20'}`}>
                      <span className="text-xl">{g.emoji}</span>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full mt-2 bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2">
                Next Step <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Body Metrics</h1>
              <p className="text-zinc-400 text-sm">Used to calculate calories burned during cardio.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest block mb-2 flex items-center gap-2">
                  <Weight className="w-4 h-4" /> Current Weight (kg) <span className="text-zinc-600 normal-case font-normal">(required)</span>
                </label>
                <input type="number" min="20" max="300" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} required placeholder="e.g. 75"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-accent/50 transition-shadow" />
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest block mb-2 flex items-center gap-2">
                  <Ruler className="w-4 h-4" /> Height (cm) <span className="text-zinc-600 normal-case font-normal">(optional)</span>
                </label>
                <input type="number" min="100" max="250" step="0.5" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 175"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-accent/50 transition-shadow" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl border border-white/10 text-zinc-400 font-bold hover:text-white hover:border-white/20 transition-all">
                  Back
                </button>
                <button type="submit" disabled={loading} className="flex-2 flex-[2] bg-gradient-to-r from-accent to-purple-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup 🚀'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Onboarding;
