import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchWeightLogs, saveWeightLog, deleteWeightLog, updateProfile } from '../api';
import { Scale, Trash2, Calendar, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import { confirmAction } from '../utils/toastConfirm';

const WeightTracker = () => {
  const { user, updateUserProfile } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate]           = useState(today);
  const [inputWeight, setInputWeight] = useState('');
  const [weightLogs, setWeightLogs]   = useState([]);
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);

  const loadLogs = async () => {
    try {
      const data = await fetchWeightLogs();
      setWeightLogs(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

  const handleSave = async () => {
    if (!inputWeight || Number(inputWeight) <= 0) {
      toast.error('Enter a valid weight.', { theme: 'dark' }); return;
    }
    setSaving(true);
    try {
      await saveWeightLog({ date, weight: Number(inputWeight) });
      // Sync latest weight to user profile
      const updatedUser = await updateProfile({ weight: Number(inputWeight) });
      updateUserProfile(updatedUser);
      toast.success(`Weight logged: ${inputWeight} kg 💪`, { theme: 'dark' });
      setInputWeight('');
      loadLogs();
    } catch {
      toast.error('Failed to log weight.', { theme: 'dark' });
    }
    setSaving(false);
  };

  const handleDelete = (id) => {
    confirmAction('Remove this weight entry?', async () => {
      await deleteWeightLog(id);
      toast.info('Entry removed.', { theme: 'dark' });
      loadLogs();
    });
  };

  // Chart: last 30 logs sorted ascending
  const chartData = [...weightLogs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map(l => ({
      date: new Date(l.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      weight: l.weight,
    }));

  const latestWeight = weightLogs[0]?.weight ?? user?.weight ?? null;
  const firstInPeriod = chartData[0]?.weight;
  const change = latestWeight && firstInPeriod ? (latestWeight - firstInPeriod).toFixed(1) : null;

  const ChangeIcon = change === null ? null : Number(change) < 0 ? TrendingDown : Number(change) > 0 ? TrendingUp : Minus;
  const changeColor = change === null ? '' : Number(change) < 0 ? 'text-green-400' : Number(change) > 0 ? 'text-red-400' : 'text-zinc-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      className="max-w-3xl mx-auto space-y-6 pb-24 relative z-10"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/20 rounded-2xl">
          <Scale className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Weight Tracking</h1>
          <p className="text-zinc-400 text-sm">Log your daily weight and watch your progress.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Current Weight</p>
          <p className="text-3xl font-black text-primary">
            {latestWeight ? <>{latestWeight}<span className="text-base ml-1 text-zinc-400">kg</span></> : '—'}
          </p>
        </div>
        {change !== null && (
          <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">30-Day Change</p>
            <p className={`text-3xl font-black flex items-center justify-center gap-1 ${changeColor}`}>
              {ChangeIcon && <ChangeIcon className="w-6 h-6" />}
              {Number(change) > 0 ? '+' : ''}{change}<span className="text-base ml-0.5 font-normal text-zinc-400">kg</span>
            </p>
          </div>
        )}
        <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Entries</p>
          <p className="text-3xl font-black text-accent">{weightLogs.length}</p>
        </div>
      </div>

      {/* Log form */}
      <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6 md:p-8 space-y-5">
        <h2 className="text-lg font-bold text-white">Log Weight</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Date
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" /> Weight (kg)
            </label>
            <input type="number" min="20" max="300" step="0.1" value={inputWeight}
              onChange={e => setInputWeight(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder={latestWeight ? `Last: ${latestWeight} kg` : 'e.g. 75'}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm" />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-extrabold rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scale className="w-5 h-5" />} Log Weight
        </button>
      </div>

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Weight Trend — Last 30 Days</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={35} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#181825', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  formatter={v => [`${v} kg`]} />
                <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Date-wise history list */}
      <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6 space-y-3">
        <h2 className="text-lg font-bold text-white">History</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
        ) : weightLogs.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-6">No weight entries yet. Log your first one above!</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            <AnimatePresence>
              {weightLogs.map((l, idx) => {
                const prevWeight = weightLogs[idx + 1]?.weight;
                const diff = prevWeight ? (l.weight - prevWeight).toFixed(1) : null;
                const diffColor = diff === null ? '' : Number(diff) < 0 ? 'text-green-400' : Number(diff) > 0 ? 'text-red-400' : 'text-zinc-400';
                return (
                  <motion.div key={l._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between bg-background/50 border border-white/5 px-4 py-3.5 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {new Date(l.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {diff !== null && (
                        <p className={`text-xs font-bold mt-0.5 ${diffColor}`}>
                          {Number(diff) > 0 ? '+' : ''}{diff} kg vs prev
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-black text-xl">{l.weight}<span className="text-xs text-zinc-400 font-normal ml-0.5">kg</span></span>
                      <button onClick={() => handleDelete(l._id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WeightTracker;
