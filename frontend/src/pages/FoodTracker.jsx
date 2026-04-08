import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFoodLogs, saveFoodLog, deleteFoodLog } from '../api';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Save, Plus, Trash2, Calendar, Loader2, Info } from 'lucide-react';
import { FOOD_DATABASE } from '../constants/foodDatabase';
import { toast } from 'react-toastify';
import { confirmAction } from '../utils/toastConfirm';

const MEALS = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '☀️' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'snack', label: 'Snacks', icon: '🍎' }
];

const SmartFoodAdder = ({ onAdd }) => {
  const [term, setTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [customMode, setCustomMode] = useState(false);
  
  // Custom states
  const [cName, setCName] = useState('');
  const [cCal, setCCal] = useState('');
  const [cP, setCP] = useState('');
  const [cC, setCC] = useState('');

  const matches = term.length > 1 
    ? FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(term.toLowerCase())).slice(0, 5) 
    : [];

  const handleSelect = (f) => {
    setSelectedFood(f);
    setTerm('');
    const firstUnit = Object.keys(f.units)[0];
    setUnit(firstUnit);
    setQuantity(firstUnit === 'Grams' ? 100 : 1);
  };

  const handleAddSmart = () => {
    if (!selectedFood || !unit || quantity <= 0) return;
    const factor = (quantity * selectedFood.units[unit]) / 100;
    
    // Add exact unit name in the title for reference
    const displayName = `${quantity} ${unit} ${selectedFood.name}`;
    
    onAdd({
      name: displayName,
      calories: Math.round(selectedFood.cal * factor),
      protein: Number((selectedFood.p * factor).toFixed(1)),
      carbs: Number((selectedFood.c * factor).toFixed(1))
    });
    setSelectedFood(null); setTerm(''); setQuantity(1);
  };

  const handleAddCustom = () => {
    if (!cName) return;
    onAdd({ 
      name: cName, 
      calories: Number(cCal)||0, 
      protein: Number(cP)||0, 
      carbs: Number(cC)||0 
    });
    setCustomMode(false); setCName(''); setCCal(''); setCP(''); setCC('');
  };

  if (customMode) {
    return (
      <div className="bg-surface p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-zinc-300">Custom Log</span>
          <button onClick={() => setCustomMode(false)} className="text-xs text-primary hover:underline">Back to Search</button>
        </div>
        <input type="text" placeholder="Food Name" value={cName} onChange={e => setCName(e.target.value)} className="w-full bg-background border border-white/10 p-3 rounded-xl text-white text-sm outline-none" />
        <div className="grid grid-cols-3 gap-2">
          <input type="number" placeholder="Kcal" value={cCal} onChange={e => setCCal(e.target.value)} className="w-full bg-background border border-white/10 p-3 rounded-xl text-white text-sm outline-none" />
          <input type="number" placeholder="Protein (g)" value={cP} onChange={e => setCP(e.target.value)} className="w-full bg-background border border-white/10 p-3 rounded-xl text-white text-sm outline-none" />
          <input type="number" placeholder="Carbs (g)" value={cC} onChange={e => setCC(e.target.value)} className="w-full bg-background border border-white/10 p-3 rounded-xl text-white text-sm outline-none" />
        </div>
        <button onClick={handleAddCustom} className="w-full py-3 bg-accent text-white font-bold rounded-xl mt-2">Add to Meal</button>
      </div>
    );
  }

  if (selectedFood) {
    const factor = (quantity * selectedFood.units[unit]) / 100;
    const currentCal = Math.round(selectedFood.cal * factor);
    const currentP = (selectedFood.p * factor).toFixed(1);
    const currentC = (selectedFood.c * factor).toFixed(1);

    return (
      <div className="bg-surface/50 p-4 rounded-2xl border border-accent/30 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-white font-bold text-lg">{selectedFood.name}</h4>
            <span className="text-xs text-zinc-400">Base: {selectedFood.cal}kcal / 100g</span>
          </div>
          <button onClick={() => setSelectedFood(null)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
        </div>
        
        <div className="flex gap-2">
          <input type="number" min="0.1" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-24 bg-background border border-white/10 p-3 rounded-xl text-white text-sm outline-none text-center" />
          <select value={unit} onChange={e => { setUnit(e.target.value); setQuantity(e.target.value === 'Grams' ? 100 : 1); }} className="flex-1 bg-background border border-white/10 p-3 rounded-xl text-white text-sm outline-none">
            {Object.keys(selectedFood.units).map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="bg-background flex justify-around p-3 rounded-xl text-center border border-white/5">
          <div><p className="text-[10px] text-zinc-500 font-bold uppercase">Calories</p><p className="text-orange-400 font-bold">{currentCal}</p></div>
          <div><p className="text-[10px] text-zinc-500 font-bold uppercase">Protein</p><p className="text-primary font-bold">{currentP}g</p></div>
          <div><p className="text-[10px] text-zinc-500 font-bold uppercase">Carbs</p><p className="text-emerald-400 font-bold">{currentC}g</p></div>
        </div>

        <button onClick={handleAddSmart} className="w-full py-3 bg-accent text-white font-bold rounded-xl mt-2 transition-transform active:scale-95">Add to Meal</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input type="text" placeholder="Search food (e.g. Rice, Chicken, Dal)..." value={term} onChange={e => setTerm(e.target.value)}
        className="w-full bg-surface border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-1 focus:ring-accent/50 placeholder-zinc-500" />
      
      {matches.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-[#181825] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-20">
          {matches.map((f, i) => (
            <button key={i} onClick={() => handleSelect(f)} className="w-full text-left px-5 py-3 hover:bg-white/5 text-sm text-zinc-200 font-medium border-b border-white/5 last:border-0 transition-colors flex justify-between items-center">
              <span>{f.name}</span>
              <span className="text-xs text-zinc-500">{f.cal} kcal/100g</span>
            </button>
          ))}
        </div>
      )}

      {term && matches.length === 0 && (
         <div className="absolute top-full mt-2 w-full bg-[#181825] border border-white/10 rounded-2xl p-4 shadow-2xl z-20 text-center">
           <p className="text-zinc-400 text-sm mb-3">No matching foods found in database.</p>
           <button onClick={() => setCustomMode(true)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-primary text-xs font-bold transition-colors">Log Custom Food Manually</button>
         </div>
      )}
      
      {!term && (
        <button onClick={() => setCustomMode(true)} className="w-full mt-3 py-3 border border-dashed border-white/10 rounded-xl text-zinc-500 text-xs font-bold hover:text-white transition-colors">
          Or log a custom food manually
        </button>
      )}
    </div>
  );
};


const MealSection = ({ meal, date, onRefresh, allLogs }) => {
  const log = allLogs.find(l => l.date === date && l.mealType === meal.id);
  
  const [foods, setFoods] = useState(log?.foods || []);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    const freshFoods = log?.foods || [];
    setFoods(freshFoods);
    if (freshFoods.length === 0) setExpanded(true);
    else setExpanded(false);
  }, [log?.foods, date]);

  const handleSmartAdd = (foodObj) => {
    setFoods([...foods, foodObj]);
  };

  const handleRemove = (i) => {
    const updated = [...foods];
    updated.splice(i, 1);
    setFoods(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    if (foods.length === 0 && log) {
      confirmAction(`Clear all logs for ${meal.label}?`, async () => {
        await deleteFoodLog(log._id);
        await onRefresh();
        setExpanded(false);
      }, 'Clear Logs', 'bg-red-500');
    } else if (foods.length > 0) {
      await saveFoodLog({ date, mealType: meal.id, foods });
      toast.success(`${meal.label} saved successfully!`, { theme: 'dark' });
      await onRefresh();
      setExpanded(false);
    }
    setSaving(false);
  };

  const handleDelete = () => {
    if (!log) return;
    confirmAction(`Delete the ${meal.label} record entirely?`, async () => {
      await deleteFoodLog(log._id);
      setFoods([]);
      await onRefresh();
      toast.info(`${meal.label} record cleared.`, { theme: 'dark' });
    }, 'Delete Record', 'bg-red-500');
  };

  const totalCal = foods.reduce((s, f) => s + (Number(f.calories) || 0), 0);
  const totalP = foods.reduce((s, f) => s + (Number(f.protein) || 0), 0);
  const totalC = foods.reduce((s, f) => s + (Number(f.carbs) || 0), 0);

  return (
    <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl overflow-hidden shadow-xl">
      {/* Header Summary */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-2xl text-xl shadow-inner">{meal.icon}</div>
          <div>
            <h2 className="text-xl font-extrabold text-white">{meal.label}</h2>
            {foods.length > 0 ? (
              <p className="text-sm font-medium text-orange-400 mt-0.5">{totalCal} kcal logged from {foods.length} items</p>
            ) : (
              <p className="text-sm font-medium text-zinc-500 mt-0.5">Nothing logged yet</p>
            )}
          </div>
        </div>
        
        {foods.length > 0 && !expanded && (
          <div className="flex gap-4 text-xs font-bold text-center">
            <div><span className="block text-primary">{totalP.toFixed(1)}g</span><span className="text-zinc-500 uppercase text-[9px] tracking-wider">Protein</span></div>
            <div><span className="block text-emerald-400">{totalC.toFixed(1)}g</span><span className="text-zinc-500 uppercase text-[9px] tracking-wider">Carbs</span></div>
          </div>
        )}
      </div>

      {/* Expanded Builder UI */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 px-6 pb-6 pt-4 space-y-6">
            
            {/* Logged Item List */}
            {foods.length > 0 && (
              <div className="space-y-2">
                {foods.map((f, i) => (
                  <div key={i} className="flex justify-between items-center bg-background/50 border border-white/5 pl-4 pr-2 py-2 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-zinc-200">{f.name}</p>
                      <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-0.5">
                        <span className="text-orange-400">{f.calories} kcal</span>
                        <span className="mx-2">•</span> 
                        <span className="text-primary">{f.protein}g P</span>
                        <span className="mx-2">•</span> 
                        <span className="text-emerald-400">{f.carbs}g C</span>
                      </p>
                    </div>
                    <button onClick={() => handleRemove(i)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Smart Adder */}
            <div className="bg-background/80 p-4 rounded-2xl border border-white/[0.03]">
              <SmartFoodAdder onAdd={handleSmartAdd} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 flex justify-center items-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-90 text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save {meal.label}
              </button>
              {log && (
                <button onClick={handleDelete} className="py-3.5 px-6 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-red-400 font-bold rounded-xl transition-all">Clear</button>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FoodTracker = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const data = await fetchFoodLogs(date);
      setLogs(data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, [date]);

  const totalDayCal = logs.reduce((sum, log) => sum + log.foods.reduce((s, f) => s + (Number(f.calories)||0), 0), 0);
  const totalDayPro = logs.reduce((sum, log) => sum + log.foods.reduce((s, f) => s + (Number(f.protein)||0), 0), 0);
  const totalDayCar = logs.reduce((sum, log) => sum + log.foods.reduce((s, f) => s + (Number(f.carbs)||0), 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }} className="max-w-3xl mx-auto space-y-6 pb-20 relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 rounded-2xl">
            <UtensilsCrossed className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Food Tracker</h1>
            <p className="text-zinc-400 text-sm mt-1">Smart auto-tracking for meals.</p>
          </div>
        </div>

        <div className="flex bg-surface/80 border border-white/10 rounded-xl p-3 items-center gap-3">
          <Calendar className="w-5 h-5 text-zinc-400" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-white outline-none font-medium text-sm appearance-none" />
        </div>
      </div>

      {/* Global Macros Status */}
      <div className="bg-surface/50 border border-white/10 rounded-3xl p-6 flex flex-wrap justify-around items-center text-center shadow-lg backdrop-blur">
        <div><h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Total Calories</h3><p className="text-4xl font-black text-orange-500">{totalDayCal}</p></div>
        <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
        <div><h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Total Protein</h3><p className="text-2xl font-black text-primary">{totalDayPro.toFixed(1)}g</p></div>
        <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
        <div><h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Total Carbs</h3><p className="text-2xl font-black text-emerald-400">{totalDayCar.toFixed(1)}g</p></div>
      </div>

      {/* Meals loop */}
      <div className="space-y-5">
        {MEALS.map(meal => (
          <MealSection key={meal.id} meal={meal} date={date} onRefresh={loadLogs} allLogs={logs} />
        ))}
      </div>
      
    </motion.div>
  );
};

export default FoodTracker;
