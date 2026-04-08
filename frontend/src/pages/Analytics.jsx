import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchFitnessData } from '../api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
        <p className="text-zinc-400 text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="font-semibold text-sm flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFitnessData()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-accent/20 rounded-xl border border-accent/20 shadow-lg shadow-accent/20">
          <TrendingUp className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-1">Analytics</h1>
          <p className="text-zinc-400">Visualize your journey over time.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : data.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-surface border border-white/5 p-6 rounded-3xl shadow-xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
            <h3 className="text-lg font-semibold text-white mb-6 relative z-10">Daily Steps History</h3>
            <div className="h-72 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="steps" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Steps" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-surface border border-white/5 p-6 rounded-3xl shadow-xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none"></div>
            <h3 className="text-lg font-semibold text-white mb-6 relative z-10">Calories & Weight Trend</h3>
            <div className="h-72 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} width={40} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area yAxisId="left" type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorCalories)" name="Calories" />
                  <Area yAxisId="right" type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" name="Weight" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      ) : (
        <div className="p-8 rounded-3xl border border-white/10 bg-surface/50 text-center">
          <p className="text-zinc-400">No data available for analytics yet.</p>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics;
