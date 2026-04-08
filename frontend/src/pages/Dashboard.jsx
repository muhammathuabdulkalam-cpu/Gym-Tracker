import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { fetchFitnessData, saveFitnessData, fetchFoodLogs, fetchWorkouts, fetchCardioLogs } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Flame, Activity, Scale, UtensilsCrossed, Dumbbell,
  TrendingUp, Calendar, ChevronDown
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

const FILTERS = ['7 Days', '30 Days', '3 Months'];

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6 flex items-start gap-5 hover:border-white/20 transition-colors"
  >
    <div className={`p-3 rounded-2xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-zinc-400 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-extrabold text-white">{value ?? '—'}</p>
      <p className="text-zinc-500 text-xs mt-1">{subtitle}</p>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface/95 backdrop-blur border border-white/10 rounded-xl p-3 shadow-xl text-sm">
      <p className="text-zinc-400 mb-1 font-medium">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState('7 Days');
  const [loading, setLoading] = useState(true);
  const [quickWeight, setQuickWeight] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  const mergeAnalyticsData = (fitnessData, foodLogs, cardioLogs, workouts) => {
    const map = new Map();
    const ensure = (date) => {
      if (!map.has(date)) {
        map.set(date, {
          date,
          fitnessCalories: 0,
          foodCalories: 0,
          cardioCalories: 0,
          fitnessSteps: 0,
          cardioSteps: 0,
          weight: null,
          workoutCount: 0,
        });
      }
      return map.get(date);
    };

    (Array.isArray(fitnessData) ? fitnessData : []).forEach((item) => {
      const row = ensure(item.date);
      row.fitnessCalories += Number(item.calories) || 0;
      row.fitnessSteps += Number(item.steps) || 0;
      if (item.weight !== undefined && item.weight !== null) row.weight = item.weight;
    });

    (Array.isArray(foodLogs) ? foodLogs : []).forEach((log) => {
      const row = ensure(log.date);
      row.foodCalories += Number(log.totalCalories) || 0;
    });

    (Array.isArray(cardioLogs) ? cardioLogs : []).forEach((log) => {
      const row = ensure(log.date);
      row.cardioCalories += Number(log.caloriesBurned) || 0;
      row.cardioSteps += Number(log.steps) || 0;
    });

    (Array.isArray(workouts) ? workouts : []).forEach((workout) => {
      const row = ensure(workout.date);
      row.workoutCount += 1;
      row.workoutVolume = (row.workoutVolume || 0) + (workout.exercises || []).reduce((sum, exercise) => {
        return sum + (exercise.sets || []).reduce((setSum, set) => setSum + ((Number(set.reps) || 0) * (Number(set.weight) || 0)), 0);
      }, 0);
    });

    return Array.from(map.values())
      .map((row) => ({
        ...row,
        calories: (row.foodCalories || row.fitnessCalories || 0) + (row.cardioCalories || 0),
        steps: (row.fitnessSteps || 0) + (row.cardioSteps || 0),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [fitnessData, foodLogs, cardioLogs, workouts] = await Promise.all([
        fetchFitnessData(),
        fetchFoodLogs(),
        fetchCardioLogs(),
        fetchWorkouts(),
      ]);
      setAllData(mergeAnalyticsData(fitnessData, foodLogs, cardioLogs, workouts));
    } catch (err) {
      console.error('Dashboard analytics fetch failed:', err);
      setAllData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const displayData = useMemo(() => {
    if (!allData.length) return [];
    const sorted = [...allData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const mapped = sorted.map((d) => ({
      ...d,
      label: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    }));
    return filtered.length ? filtered : mapped;
  }, [allData, filtered]);

  const handleQuickWeightSave = async () => {
    if (!quickWeight || isNaN(quickWeight)) return;
    setSavingWeight(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await saveFitnessData({ date: today, weight: Number(quickWeight) });
      setQuickWeight('');
      loadData();
    } catch (e) { console.error('Failed to save weight', e); }
    setSavingWeight(false);
  };

  const applyFilter = useCallback((data, f) => {
    const now = new Date();
    const days = f === '7 Days' ? 7 : f === '30 Days' ? 30 : 90;
    const cutoff = new Date(now - days * 864e5);
    return data
      .filter(d => new Date(d.date) >= cutoff)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(d => ({
        ...d,
        label: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      }));
  }, []);

  useEffect(() => {
    setFiltered(applyFilter(allData, filter));
  }, [allData, filter, applyFilter]);

  const latest = displayData.at(-1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }} className="space-y-8 relative z-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Welcome Back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-zinc-400 mt-1">Your complete fitness overview at a glance.</p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-primary text-white' : 'bg-surface/60 text-zinc-400 hover:text-white border border-white/10'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/track', label: 'Log Progress', icon: Activity, color: 'from-primary to-blue-600' },
          { to: '/food', label: 'Food Tracker', icon: UtensilsCrossed, color: 'from-orange-500 to-rose-500' },
          { to: '/workouts', label: 'Workout & Cardio', icon: Dumbbell, color: 'from-accent to-purple-600' },
          { to: '/settings', label: 'My Profile', icon: TrendingUp, color: 'from-teal-500 to-cyan-600' },
        ].map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to}
            className={`bg-gradient-to-br ${color} p-4 rounded-2xl flex items-center gap-3 hover:scale-105 transition-transform shadow-lg`}>
            <Icon className="w-5 h-5 text-white/80" />
            <span className="text-white font-bold text-sm">{label}</span>
          </Link>
        ))}
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-surface/50 rounded-3xl animate-pulse" />)}
        </div>
      ) : latest ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Calories" value={`${latest.calories} kcal`} subtitle="Latest logged day" icon={Flame} color="bg-orange-500/80" delay={0.05} />
          <StatCard title="Steps" value={latest.steps?.toLocaleString() ?? '0'} subtitle="Latest logged day" icon={Activity} color="bg-primary/80" delay={0.1} />
          <StatCard title="Weight" value={`${latest.weight} kg`} subtitle="Most recent entry" icon={Scale} color="bg-accent/80" delay={0.15} />
        </div>
      ) : (
        <div className="p-8 rounded-3xl border border-dashed border-white/10 bg-surface/30 text-center">
          <Activity className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 mb-4">No data yet — start tracking!</p>
          <Link to="/track" className="text-primary font-semibold hover:underline">Log your first entry ✨</Link>
        </div>
      )}

      {/* Charts */}
      {allData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calories Chart */}
          <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Calorie Trend
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="calories" name="Calories" stroke="#f97316" fill="url(#calGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weight Chart */}
          <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-accent" /> Weight Progress
              </h2>
              <div className="flex bg-background border border-white/10 rounded-xl p-1 overflow-hidden">
                <input type="number" step="0.1" value={quickWeight} onChange={e => setQuickWeight(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickWeightSave()} placeholder="Today's kg" className="w-24 px-3 py-1.5 bg-transparent text-white text-sm outline-none placeholder-zinc-600" />
                <button onClick={handleQuickWeightSave} disabled={savingWeight || !quickWeight} className="bg-accent/80 hover:bg-accent disabled:opacity-50 px-3 py-1.5 text-white text-sm font-bold rounded-lg transition-colors">
                  {savingWeight ? '...' : 'Log'}
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="wtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke="#8b5cf6" fill="url(#wtGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Steps Chart */}
          <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Steps — {filter}
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="steps" name="Steps" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
