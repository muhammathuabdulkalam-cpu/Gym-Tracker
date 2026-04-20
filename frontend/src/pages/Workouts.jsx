import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchWorkouts, saveWorkout, updateProfile, fetchCardioLogs, saveCardioLog, deleteCardioLog } from '../api';
import { Dumbbell, Plus, Save, Loader2, Calendar, Trash2, TrendingUp, X, Settings2, Activity, Flame, Timer, Footprints, Play, Square, CheckCircle2, Radio } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import { confirmAction } from '../utils/toastConfirm';

/* ─── Custom Pedometer Hook (DeviceMotionEvent-based) ─────────── */
// Uses accelerometer magnitude to detect steps via peak detection,
// similar to how Google Fit and pedometer apps work.
function usePedometer() {
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [supported, setSupported] = useState(null);

  const listenerRef = useRef(null);
  const timerRef = useRef(null);
  const lastMagRef = useRef(0);
  const stepCooldownRef = useRef(false);
  const THRESHOLD = 1.8; // m/s² diff to count a step

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'DeviceMotionEvent' in window);
  }, []);

  const start = useCallback(async () => {
    // iOS 13+ requires explicit permission
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceMotionEvent.requestPermission();
        if (perm !== 'granted') {
          toast.warn('Motion sensor permission denied. Steps cannot be counted.', { theme: 'dark' });
          return;
        }
      } catch {
        toast.error('Could not request motion permission.', { theme: 'dark' });
        return;
      }
    }

    setSteps(0);
    setElapsedSeconds(0);
    setIsTracking(true);
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    listenerRef.current = (e) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
      const diff = Math.abs(mag - lastMagRef.current);
      lastMagRef.current = mag;
      if (diff > THRESHOLD && !stepCooldownRef.current) {
        setSteps(s => s + 1);
        stepCooldownRef.current = true;
        setTimeout(() => { stepCooldownRef.current = false; }, 350);
      }
    };
    window.addEventListener('devicemotion', listenerRef.current);
  }, []);

  const stop = useCallback(() => {
    if (listenerRef.current) { window.removeEventListener('devicemotion', listenerRef.current); listenerRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsTracking(false);
  }, []);

  useEffect(() => () => {
    if (listenerRef.current) window.removeEventListener('devicemotion', listenerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return { steps, isTracking, elapsedSeconds, supported, start, stop };
}

/* ─── MET values for common cardio activities ─────────────────── */
const CARDIO_ACTIVITIES = [
  { id: 'walking',      label: 'Walking',       icon: '🚶', met: 3.5 },
  { id: 'jogging',      label: 'Jogging',       icon: '🏃', met: 7.0 },
  { id: 'running',      label: 'Running',       icon: '💨', met: 11.0 },
  { id: 'cycling',      label: 'Cycling',       icon: '🚴', met: 7.5 },
  { id: 'swimming',     label: 'Swimming',      icon: '🏊', met: 8.0 },
  { id: 'jump_rope',   label: 'Jump Rope',     icon: '🪢', met: 11.0 },
  { id: 'hiit',         label: 'HIIT',          icon: '🔥', met: 9.5 },
  { id: 'elliptical',   label: 'Elliptical',    icon: '⚙️', met: 5.0 },
  { id: 'stairclimber', label: 'Stair Climber', icon: '🪜', met: 8.0 },
  { id: 'yoga',         label: 'Yoga',          icon: '🧘', met: 2.5 },
];

/**
 * Calorie estimate using MET formula:
 * kcal = MET × weight(kg) × durationHours
 */
const estimateCalories = (activityId, weightKg, durationMin) => {
  const act = CARDIO_ACTIVITIES.find(a => a.id === activityId);
  if (!act || !weightKg || !durationMin) return 0;
  return Math.round(act.met * weightKg * (durationMin / 60));
};

// Steps burned estimate: 1 step ≈ 0.04 kcal per kg at 70 kg; simplified
const estimateStepCalories = (steps, weightKg) => {
  if (!steps || !weightKg) return 0;
  return Math.round(steps * 0.00040 * weightKg);
};

/* ─── EMPTY_SET constant ─────────────────────────────────────── */
const EMPTY_SET = { reps: 10, weight: 0 };

/* ─── History Modal ─────────────────────────────────────────── */
const HistoryModal = ({ exerciseName, allWorkouts, onClose }) => {
  const chartData = allWorkouts.map(w => {
    const ex = w.exercises?.find(e => e.name === exerciseName);
    if (!ex || !ex.sets || ex.sets.length === 0) return null;
    const maxWeight = Math.max(...ex.sets.map(s => Number(s.weight) || 0));
    return {
      date: new Date(w.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      maxWeight,
    };
  }).filter(Boolean).reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#11111a] border border-white/10 rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" /> {exerciseName} History
          </h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {chartData.length < 2 ? (
          <div className="text-center py-12 text-zinc-500">Not enough historical data to generate a chart.</div>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ backgroundColor: '#181825', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="maxWeight" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorWt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </div>
  );
};

/* ─── CARDIO TAB ─────────────────────────────────────────────── */
const CardioTab = ({ userWeight }) => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [activity, setActivity] = useState('walking');
  const [duration, setDuration] = useState('');
  const [steps, setSteps] = useState('');
  const [cardioLogs, setCardioLogs] = useState([]);
  const [saving, setSaving] = useState(false);

  const ped = usePedometer();
  const weight = userWeight || 70;

  const loadLogs = () => fetchCardioLogs().then(data => setCardioLogs(data)).catch(() => {});
  useEffect(() => { loadLogs(); }, []);

  // When tracking stops, auto-fill steps and duration
  const prevTracking = useRef(false);
  useEffect(() => {
    if (prevTracking.current && !ped.isTracking && ped.steps > 0) {
      setSteps(String(ped.steps));
      setDuration(String(Math.max(1, Math.round(ped.elapsedSeconds / 60))));
    }
    prevTracking.current = ped.isTracking;
  }, [ped.isTracking, ped.steps, ped.elapsedSeconds]);

  const estimatedCal = useMemo(() => {
    if (steps && Number(steps) > 0) return estimateStepCalories(Number(steps), weight);
    return estimateCalories(activity, weight, Number(duration));
  }, [activity, duration, steps, weight]);

  const liveCal = useMemo(() => {
    if (ped.isTracking && ped.steps > 0) return estimateStepCalories(ped.steps, weight);
    return 0;
  }, [ped.steps, ped.isTracking, weight]);

  const act = CARDIO_ACTIVITIES.find(a => a.id === activity);

  const handleSave = async () => {
    if (!duration && !steps) {
      toast.error('Enter duration or steps to log cardio.', { theme: 'dark' });
      return;
    }
    setSaving(true);
    try {
      await saveCardioLog({
        date,
        activity: act.label,
        durationMinutes: Number(duration) || 0,
        caloriesBurned: estimatedCal,
        steps: Number(steps) || 0,
      });
      toast.success(`${act.label} logged! 🔥 ${estimatedCal} kcal burned`, { theme: 'dark' });
      setDuration(''); setSteps('');
      loadLogs();
    } catch {
      toast.error('Failed to save cardio session.', { theme: 'dark' });
    }
    setSaving(false);
  };

  const handleDelete = (id, label) => {
    confirmAction(`Delete this ${label} session?`, async () => {
      await deleteCardioLog(id);
      toast.info('Session removed.', { theme: 'dark' });
      loadLogs();
    }, 'Delete', 'bg-red-500');
  };

  const todayLogs = cardioLogs.filter(l => l.date === date);
  const todayCalBurned = todayLogs.reduce((s, l) => s + l.caloriesBurned, 0);

  const chartData = (() => {
    const map = {};
    cardioLogs.forEach(l => { map[l.date] = (map[l.date] || 0) + l.caloriesBurned; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([d, cal]) => ({
      date: new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), cal
    }));
  })();

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {!userWeight && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-yellow-300 text-sm flex items-center gap-3">
          <Flame className="w-5 h-5 flex-shrink-0" />
          <span>For accurate calorie burn, add your <strong>weight</strong> in Settings. Using 70kg as default.</span>
        </div>
      )}

      {/* ── REAL-TIME STEP TRACKER ── */}
      <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl"><Footprints className="w-5 h-5 text-green-400" /></div>
            <h2 className="text-xl font-bold text-white">Step Tracker</h2>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${ped.supported === false ? 'bg-zinc-800 text-zinc-500' : ped.isTracking ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800/60 text-zinc-400'}`}>
            <span className={`w-2 h-2 rounded-full ${ped.isTracking ? 'bg-green-400 animate-pulse' : ped.supported ? 'bg-zinc-500' : 'bg-red-500/50'}`} />
            {ped.isTracking ? 'LIVE' : ped.supported === false ? 'NOT SUPPORTED' : ped.supported ? 'SENSOR READY' : 'CHECKING…'}
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Steps', value: ped.isTracking ? ped.steps.toLocaleString() : '—', color: 'text-white' },
            { label: 'kcal Burned', value: ped.isTracking ? liveCal : '—', color: 'text-orange-400' },
            { label: 'Time', value: ped.isTracking ? fmt(ped.elapsedSeconds) : '—', color: 'text-purple-400' },
          ].map(m => (
            <div key={m.label} className="bg-background/50 border border-white/5 rounded-2xl py-4 flex flex-col items-center gap-1">
              <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Live calorie pulse while tracking */}
        {ped.isTracking && ped.steps > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">🔥 Real-Time Burn</p>
            <p className="text-4xl font-black text-green-400">{liveCal}</p>
            <p className="text-sm text-zinc-400 mt-1">kcal · {ped.steps.toLocaleString()} steps · {weight}kg</p>
          </motion.div>
        )}

        {/* Start / Stop button */}
        {ped.supported === false ? (
          <div className="text-center py-4 text-zinc-500 text-sm">
            <p>Motion sensors not available in this browser.</p>
            <p className="mt-1 text-xs">Open on a mobile device for real-time step tracking, or enter steps manually below.</p>
          </div>
        ) : (
          <button
            onClick={ped.isTracking ? ped.stop : ped.start}
            className={`w-full flex items-center justify-center gap-3 py-4 font-extrabold rounded-2xl shadow-lg transition-all active:scale-95 ${ped.isTracking ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 shadow-red-500/20 text-white' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 shadow-green-500/20 text-white'}`}
          >
            {ped.isTracking ? <><Square className="w-5 h-5" /> Stop & Save Steps</> : <><Play className="w-5 h-5" /> Start Step Tracking</>}
          </button>
        )}

        {/* Captured confirmation */}
        {!ped.isTracking && steps !== '' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-green-400 text-sm font-bold">{Number(steps).toLocaleString()} steps captured — ready to log below ↓</p>
          </motion.div>
        )}
      </div>

      {/* ── MANUAL LOG CARD ── */}
      <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Log Cardio Session</h2>
          <div className="flex bg-surface/80 border border-white/10 rounded-xl p-2.5 items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent text-white outline-none font-medium text-sm" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Select Activity</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {CARDIO_ACTIVITIES.map(a => (
              <button key={a.id} onClick={() => setActivity(a.id)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${activity === a.id ? 'border-orange-500 bg-orange-500/20 text-white shadow-lg' : 'border-white/5 bg-surface/50 text-zinc-400 hover:border-white/20 hover:text-white'}`}>
                <span className="text-2xl">{a.icon}</span>
                <span className="text-[11px] font-bold">{a.label}</span>
                <span className="text-[10px] text-zinc-500">MET {a.met}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5"><Timer className="w-3.5 h-3.5" /> Duration (minutes)</label>
            <input type="number" min="1" max="600" value={duration} onChange={e => { setDuration(e.target.value); if(e.target.value) setSteps(''); }}
              placeholder="e.g. 30"
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500/50 transition-shadow text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5"><Footprints className="w-3.5 h-3.5" /> Steps</label>
            <input type="number" min="0" value={steps} onChange={e => { setSteps(e.target.value); if(e.target.value) setDuration(''); }}
              placeholder="e.g. 8000"
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500/50 transition-shadow text-sm" />
          </div>
        </div>

        {estimatedCal > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-orange-500/20 to-rose-500/10 border border-orange-500/30 rounded-2xl p-5 text-center">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Estimated Calories Burned</p>
            <p className="text-5xl font-black text-orange-400">{estimatedCal}</p>
            <p className="text-sm text-zinc-400 mt-1">kcal · based on {weight}kg body weight</p>
          </motion.div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-90 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Flame className="w-5 h-5" />} Log Cardio
        </button>
      </div>

      {/* Today's Summary */}
      {todayLogs.length > 0 && (
        <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{date === today ? "Today's" : date} Cardio</h3>
            <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-xl">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-black">{todayCalBurned} kcal</span>
            </div>
          </div>
          <div className="space-y-2">
            {todayLogs.map(l => (
              <div key={l._id} className="flex items-center justify-between bg-background/50 border border-white/5 px-4 py-3 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-white">{l.activity}</p>
                  <p className="text-xs text-zinc-500">
                    {l.durationMinutes > 0 && `${l.durationMinutes} min`}
                    {l.steps > 0 && ` · ${l.steps.toLocaleString()} steps`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 font-bold text-sm">{l.caloriesBurned} kcal</span>
                  <button onClick={() => handleDelete(l._id, l.activity)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calories Burned Chart */}
      {chartData.length >= 2 && (
        <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Calories Burned — Last 14 Days</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ backgroundColor: '#181825', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} formatter={v => [`${v} kcal`]} />
                <Area type="monotone" dataKey="cal" stroke="#f97316" strokeWidth={3} fill="url(#calGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── WEIGHT TRACKING TAB ────────────────────────────────────── */
const WeightTab = ({ userWeight, onWeightUpdate }) => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [inputWeight, setInputWeight] = useState('');
  const [weightLogs, setWeightLogs] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadLogs = () => fetchWeightLogs().then(data => setWeightLogs(data)).catch(() => {});
  useEffect(() => { loadLogs(); }, []);

  const handleSave = async () => {
    if (!inputWeight || Number(inputWeight) <= 0) {
      toast.error('Enter a valid weight.', { theme: 'dark' });
      return;
    }
    setSaving(true);
    try {
      await saveWeightLog({ date, weight: Number(inputWeight) });
      // Also update the user profile baseline weight to the latest
      onWeightUpdate(Number(inputWeight));
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

  // Chart data (sorted asc)
  const chartData = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date)).slice(-30).map(l => ({
    date: new Date(l.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    weight: l.weight,
  }));

  const latestWeight = weightLogs[0]?.weight || userWeight;
  const firstWeight = chartData[0]?.weight;
  const change = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null;

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6 md:p-8 space-y-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Scale className="w-5 h-5 text-primary" /> Log Today's Weight</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> Weight (kg)</label>
            <input type="number" min="20" max="300" step="0.1" value={inputWeight} onChange={e => setInputWeight(e.target.value)}
              placeholder={`e.g. ${userWeight || 70}`}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
              onKeyDown={e => e.key === 'Enter' && handleSave()} />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-extrabold rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scale className="w-5 h-5" />} Log Weight
        </button>
      </div>

      {/* Stats row */}
      {latestWeight && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-surface/70 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Current Weight</p>
            <p className="text-3xl font-black text-primary">{latestWeight}<span className="text-base ml-1">kg</span></p>
          </div>
          {change !== null && (
            <div className="bg-surface/70 border border-white/10 rounded-2xl p-5 text-center">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">30-Day Change</p>
              <p className={`text-3xl font-black ${Number(change) < 0 ? 'text-green-400' : Number(change) > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                {Number(change) > 0 ? '+' : ''}{change}<span className="text-base ml-1">kg</span>
              </p>
            </div>
          )}
          <div className="bg-surface/70 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Entries Logged</p>
            <p className="text-3xl font-black text-accent">{weightLogs.length}</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Weight Trend — Last 30 Days</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={35} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#181825', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} formatter={v => [`${v} kg`]} />
                <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History list */}
      {weightLogs.length > 0 && (
        <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6 space-y-3">
          <h3 className="text-base font-bold text-white">History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto hide-scrollbar">
            {weightLogs.map(l => (
              <div key={l._id} className="flex items-center justify-between bg-background/50 border border-white/5 px-4 py-3 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-white">{new Date(l.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-black text-lg">{l.weight} <span className="text-xs text-zinc-400 font-normal">kg</span></span>
                  <button onClick={() => handleDelete(l._id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── MAIN WORKOUTS COMPONENT ────────────────────────────────── */
const TABS = ['Strength', 'Cardio'];

const Workouts = () => {
  const { user, updateUserProfile } = useAuth();
  const splitsOrigin = user?.splitConfig || [];

  const [activeTab, setActiveTab] = useState('Strength');

  // Strength state
  const [workouts, setWorkouts]         = useState([]);
  const [currentDate, setCurrentDate]   = useState(new Date().toISOString().split('T')[0]);
  const [selectedSplit, setSelectedSplit] = useState(splitsOrigin[0] || '');
  const [exercises, setExercises]       = useState([]);
  const [saving, setSaving]             = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [historyExercise, setHistoryExercise] = useState(null);
  const [isEditingSplits, setIsEditingSplits] = useState(false);
  const [newSplitName, setNewSplitName] = useState('');
  const [savingSplits, setSavingSplits] = useState(false);

  useEffect(() => {
    if (!selectedSplit && splitsOrigin.length > 0) setSelectedSplit(splitsOrigin[0]);
  }, [splitsOrigin, selectedSplit]);

  const loadData = () => { fetchWorkouts().then(res => setWorkouts(res)); };
  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!selectedSplit) return;
    const found = workouts.find(w => w.date === currentDate && w.splitDayName === selectedSplit);
    if (found && found.exercises?.length > 0) {
      setExercises(found.exercises);
    } else {
      const historic = workouts.find(w => w.splitDayName === selectedSplit && w.exercises?.length > 0);
      if (historic) {
        setExercises(historic.exercises.map(ex => ({ name: ex.name, sets: [{ ...EMPTY_SET }] })));
      } else {
        setExercises([]);
      }
    }
  }, [currentDate, selectedSplit, workouts]);

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) return;
    setExercises([...exercises, { name: newExerciseName.trim(), sets: [{ ...EMPTY_SET }] }]);
    setNewExerciseName('');
  };
  const handleRemoveExercise = (idx) => {
    confirmAction(`Remove ${exercises[idx].name} from today's routine?`, () => {
      setExercises(exercises.filter((_, i) => i !== idx));
    });
  };
  const handleAddSet = (exIdx) => {
    const updated = [...exercises];
    const lastSet = updated[exIdx].sets[updated[exIdx].sets.length - 1];
    updated[exIdx].sets.push(lastSet ? { ...lastSet } : { ...EMPTY_SET });
    setExercises(updated);
  };
  const handleRemoveSet = (exIdx, setIdx) => {
    const updated = [...exercises];
    updated[exIdx].sets = updated[exIdx].sets.filter((_, i) => i !== setIdx);
    setExercises(updated);
  };
  const handleSetChange = (exIdx, setIdx, field, value) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = value;
    setExercises(updated);
  };

  const handleSaveWorkout = async () => {
    if (!selectedSplit) return;
    const validExercises = exercises
      .filter(ex => ex.name.trim() !== '' && ex.sets.length > 0)
      .map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({
          reps: Number(s.reps) || 0,
          weight: Number(s.weight) || 0,
        }))
      }));
    setSaving(true);
    try {
      await saveWorkout({ date: currentDate, splitDayName: selectedSplit, exercises: validExercises });
      toast.success('Routine safely logged! 💪', { theme: 'dark' });
      loadData();
    } catch {
      toast.error('Failed to save workout.', { theme: 'dark' });
    }
    setSaving(false);
  };

  const handleAddSplit = async () => {
    if (!newSplitName.trim()) return;
    const updatedSplits = [...splitsOrigin, newSplitName.trim()];
    setSavingSplits(true);
    try {
      const updatedUser = await updateProfile({ splitConfig: updatedSplits });
      updateUserProfile(updatedUser);
      setNewSplitName(''); setSelectedSplit(newSplitName.trim());
      toast.success('Split added!', { theme: 'dark' });
    } catch { toast.error('Failed to add split.', { theme: 'dark' }); }
    setSavingSplits(false);
  };

  const handleRemoveSplit = (target) => {
    confirmAction(`Delete the "${target}" split day permanently?`, async () => {
      const updatedSplits = splitsOrigin.filter(s => s !== target);
      setSavingSplits(true);
      try {
        const updatedUser = await updateProfile({ splitConfig: updatedSplits });
        updateUserProfile(updatedUser);
        if (selectedSplit === target) setSelectedSplit(updatedSplits[0] || '');
        toast.info('Split removed.', { theme: 'dark' });
      } catch { toast.error('Failed to remove split.', { theme: 'dark' }); }
      setSavingSplits(false);
    });
  };

  // Weight update handler (from WeightTab)
  const tabIcons = { Strength: <Dumbbell className="w-4 h-4" />, Cardio: <Activity className="w-4 h-4" /> };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }} className="max-w-4xl mx-auto z-10 relative space-y-6 pb-20">

      {historyExercise && (
        <HistoryModal exerciseName={historyExercise} allWorkouts={workouts} onClose={() => setHistoryExercise(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/20 rounded-2xl">
            <Dumbbell className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Workout & Cardio</h1>
            <p className="text-zinc-400 text-sm">Strength · Cardio Tracking</p>
          </div>
        </div>
        {activeTab === 'Strength' && (
          <div className="flex bg-surface/80 border border-white/10 rounded-xl p-3 items-center gap-3">
            <Calendar className="w-5 h-5 text-zinc-400" />
            <input type="date" value={currentDate} onChange={e => setCurrentDate(e.target.value)} className="bg-transparent text-white outline-none font-medium text-sm" />
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 bg-surface/50 p-1.5 rounded-2xl border border-white/5 w-full">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow-inner' : 'text-zinc-400 hover:text-white'}`}>
            {tabIcons[tab]} {tab}
          </button>
        ))}
      </div>

      {/* ─── STRENGTH TAB ─── */}
      {activeTab === 'Strength' && (
        <div className="space-y-4">
          {/* Split Tabs & Manager */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            {splitsOrigin.length > 0 ? (
              <div className="flex overflow-x-auto gap-2 hide-scrollbar flex-1 pb-2 sm:pb-0">
                {splitsOrigin.map(split => (
                  <button key={split} onClick={() => { setSelectedSplit(split); setIsEditingSplits(false); }}
                    className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${selectedSplit === split && !isEditingSplits ? 'bg-accent text-white shadow-lg' : 'bg-surface/50 border border-white/5 text-zinc-400 hover:text-white hover:bg-surface'}`}>
                    {split}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm flex-1">No splits configured yet.</p>
            )}

            <button onClick={() => setIsEditingSplits(!isEditingSplits)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${isEditingSplits ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white border border-white/5 bg-background/50'}`}>
              <Settings2 className="w-4 h-4" /> Manage Splits
            </button>
          </div>

          {/* Manage Splits panel */}
          {isEditingSplits && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-surface/70 backdrop-blur border border-white/10 p-6 rounded-3xl shadow-xl">
              <h2 className="text-xl font-bold text-white mb-1">Workout Split Configuration</h2>
              <p className="text-sm text-zinc-400 mb-6">Add or remove your routine days globally.</p>
              <div className="space-y-3 mb-6">
                {splitsOrigin.map(day => (
                  <div key={day} className="flex justify-between items-center bg-background/50 border border-white/5 p-4 rounded-xl">
                    <span className="font-bold text-white">{day}</span>
                    <button onClick={() => handleRemoveSplit(day)} disabled={savingSplits} className="text-zinc-500 hover:text-red-400 p-2 rounded-md hover:bg-red-500/10 transition-colors disabled:opacity-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <input type="text" value={newSplitName} onChange={e => setNewSplitName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSplit()} placeholder="e.g. Legs, Upper, Full Body..."
                  className="flex-1 bg-background border border-white/10 p-3.5 rounded-xl text-sm text-white font-medium outline-none focus:ring-1 focus:ring-accent/50" />
                <button onClick={handleAddSplit} disabled={savingSplits || !newSplitName.trim()} className="bg-accent px-6 rounded-xl font-bold text-white transition-opacity disabled:opacity-50 flex items-center justify-center">
                  {savingSplits ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Exercise Builder */}
          {!isEditingSplits && (
            splitsOrigin.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto mt-12 text-center p-8 bg-surface/80 border border-white/10 rounded-3xl">
                <Dumbbell className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Split Defined</h2>
                <p className="text-zinc-400 mb-6">Create your workout days (e.g., Push, Pull, Legs) to get started.</p>
                <button onClick={() => setIsEditingSplits(true)} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90">Configure Splits</button>
              </motion.div>
            ) : (
              <div className="bg-surface/70 backdrop-blur border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl min-h-[400px]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">{selectedSplit} Routine</h2>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{new Date(currentDate).toLocaleDateString()}</span>
                </div>

                <div className="space-y-6 mb-8">
                  <AnimatePresence>
                    {exercises.map((ex, exIdx) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} key={exIdx}
                        className="bg-background/40 border border-white/5 rounded-2xl overflow-hidden shadow-inner">
                        <div className="bg-white/5 px-5 py-4 flex items-center justify-between border-b border-white/5">
                          <h3 className="font-extrabold text-white text-lg tracking-tight">{ex.name}</h3>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setHistoryExercise(ex.name)} className="flex items-center gap-1.5 text-xs font-bold bg-accent/20 text-accent hover:bg-accent hover:text-white transition-colors px-3 py-1.5 rounded-lg">
                              <TrendingUp className="w-3.5 h-3.5" /> History
                            </button>
                            <button onClick={() => handleRemoveExercise(exIdx)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 pb-1">
                            <span className="col-span-2 text-center">Set</span>
                            <span className="col-span-4 text-center">Reps</span>
                            <span className="col-span-4 text-center">Weight (kg)</span>
                            <span className="col-span-2"></span>
                          </div>
                          <AnimatePresence>
                            {ex.sets.map((set, setIdx) => (
                              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} key={setIdx}
                                className="grid grid-cols-12 gap-4 items-center bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                                <div className="col-span-2 text-center text-zinc-400 font-bold text-sm bg-black/20 py-2 rounded-lg">{setIdx + 1}</div>
                                <div className="col-span-4">
                                  <input type="number" min="0" value={set.reps} onChange={e => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                                    className="w-full bg-background border border-white/10 px-4 py-2.5 rounded-xl text-center text-white font-bold outline-none focus:ring-1 focus:ring-primary/50" />
                                </div>
                                <div className="col-span-4">
                                  <input type="number" min="0" step="0.5" value={set.weight} onChange={e => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                                    className="w-full bg-background border border-white/10 px-4 py-2.5 rounded-xl text-center text-white font-bold outline-none focus:ring-1 focus:ring-accent/50" />
                                </div>
                                <div className="col-span-2 flex justify-center">
                                  <button onClick={() => handleRemoveSet(exIdx, setIdx)} className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          <button onClick={() => handleAddSet(exIdx)} className="w-full py-3 mt-2 border border-dashed border-white/10 rounded-xl text-zinc-400 text-sm font-bold hover:bg-white/5 hover:text-white transition-colors flex justify-center items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Set
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {exercises.length === 0 && (
                    <div className="text-center py-10">
                      <Dumbbell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-500 font-medium">Your routine is empty today.</p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/10 items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Add Movement to {selectedSplit}</label>
                    <div className="flex gap-2">
                      <input type="text" value={newExerciseName} onChange={e => setNewExerciseName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddExercise()} placeholder="e.g. Incline Bench Press"
                        className="flex-1 bg-background/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none focus:ring-1 focus:ring-accent/50" />
                      <button onClick={handleAddExercise} className="bg-surface hover:bg-white/10 border border-white/10 px-5 rounded-xl text-white font-bold transition-all flex items-center justify-center shadow-lg active:scale-95">
                        Add
                      </button>
                    </div>
                  </div>
                  <button onClick={handleSaveWorkout} disabled={saving} className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-purple-600 hover:opacity-90 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50 h-full max-h-[46px]">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Entire Routine
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ─── CARDIO TAB ─── */}
      {activeTab === 'Cardio' && <CardioTab userWeight={user?.weight} />}

    </motion.div>
  );
};

export default Workouts;
