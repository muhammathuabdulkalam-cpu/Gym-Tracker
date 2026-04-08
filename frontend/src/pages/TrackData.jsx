import { useState } from 'react';
import { motion } from 'framer-motion';
import { saveFitnessData } from '../api';
import { Activity, Flame, Scale, CalendarDays, Loader2 } from 'lucide-react';

const TrackData = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    calories: '',
    steps: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      // Cast values robustly to numbers circumventing Mongoose CastErrors
      await saveFitnessData({
        date: formData.date,
        calories: formData.calories === '' ? 0 : Number(formData.calories),
        steps: formData.steps === '' ? 0 : Number(formData.steps)
      });
      setStatus({ type: 'success', message: 'Data saved successfully! 🎉' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to save data. Please try again.' });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }} className="max-w-2xl mx-auto relative z-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Log Your Progress</h1>
        <p className="text-zinc-400">Consistency is key. Track your daily metrics below.</p>
      </div>

      <div className="bg-surface/80 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

        {status.message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${status.type === 'success' ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
          >
            {status.message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Date
            </label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Calories (kcal)
              </label>
              <input type="number" name="calories" placeholder="2000" value={formData.calories} onChange={handleChange} min="0" step="1" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500/50 transition-shadow" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                <Activity className="w-4 h-4 text-primary" />
                Daily Steps
              </label>
              <input type="number" name="steps" placeholder="10000" value={formData.steps} onChange={handleChange} min="0" step="1" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Progress'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default TrackData;
