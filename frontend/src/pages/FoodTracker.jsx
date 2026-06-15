import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFoodLogs, saveFoodLog, deleteFoodLog, fetchCustomFoods, saveCustomFood } from '../api';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Save, Plus, Trash2, Edit3, Calendar, Loader2, Info } from 'lucide-react';
import { FOOD_DATABASE } from '../constants/foodDatabase';
import { toast } from 'react-toastify';
import { confirmAction } from '../utils/toastConfirm';

const MEALS = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '☀️' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'snack', label: 'Snacks', icon: '🍎' }
];

// Scrollable Picker Component
const ScrollPicker = ({ items, value, onChange, label }) => {
  const scrollRef = useRef(null);
  const selectedIndex = items.indexOf(value);
  
  useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0) {
      scrollRef.current.scrollTop = selectedIndex * 50;
    }
  }, [value, items, selectedIndex]);

  const handleScroll = (e) => {
    const index = Math.round(e.target.scrollTop / 50);
    if (items[index] && items[index] !== value) {
      onChange(items[index]);
    }
  };

  const handleItemClick = (item, idx) => {
    onChange(item);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = idx * 50;
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-zinc-400 uppercase tracking-wider">{label}</label>
      <div>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-40 w-full bg-background border border-white/10 rounded-lg overflow-y-scroll scroll-smooth touch-pan-y"
          style={{ 
            scrollSnapType: 'y mandatory', 
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y'
          }}
        >
          <div className="h-14"></div>
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`h-12 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-white/5 ${
                idx === selectedIndex ? 'bg-accent/20' : ''
              }`}
              style={{ scrollSnapAlign: 'center' }}
              onClick={() => handleItemClick(item, idx)}
            >
              {item}
            </div>
          ))}
          <div className="h-14"></div>
        </div>
      </div>
    </div>
  );
};

const SmartFoodAdder = ({ onAdd }) => {
  const [term, setTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [customFoods, setCustomFoods] = useState([]);
  const [loadingCustoms, setLoadingCustoms] = useState(true);
  
  // Custom states
  const [cName, setCName] = useState('');
  const [cCal, setCCal] = useState('');
  const [cP, setCP] = useState('');
  const [cC, setCC] = useState('');
  const [cUnit, setCUnit] = useState('Grams');
  const [cUnitValue, setCUnitValue] = useState(100);

  const normalizeFood = (food) => {
    const unitValue = Number(food.unitValue) || 100;
    let defaultUnit = String(food.defaultUnit || 'Grams').trim();
    if (['gram', 'grams'].includes(defaultUnit.toLowerCase())) defaultUnit = 'Grams';

    const normalizedUnits = food.units
      ? { ...food.units }
      : (defaultUnit === 'Grams'
        ? { Grams: 1 }
        : { [defaultUnit]: unitValue, Grams: 1 });

    return {
      ...food,
      name: food.name || 'Custom Food',
      cal: Number(food.calories ?? food.cal ?? 0),
      p: Number(food.protein ?? food.p ?? 0),
      c: Number(food.carbs ?? food.c ?? 0),
      defaultUnit,
      unitValue,
      base: defaultUnit === 'Grams' ? `${unitValue}g` : `1 ${defaultUnit}`,
      units: normalizedUnits
    };
  };

  useEffect(() => {
    const loadCustomFoods = async () => {
      setLoadingCustoms(true);
      try {
        const backendFoods = await fetchCustomFoods();
        setCustomFoods(backendFoods.map(normalizeFood));
      } catch (err) {
        console.error('Custom foods load failed:', err);
        setCustomFoods([]);
      }
      setLoadingCustoms(false);
    };
    loadCustomFoods();
  }, []);

  const allFoods = [...customFoods, ...FOOD_DATABASE.map(normalizeFood)];
  const matches = term.length > 1
    ? (() => {
        const customMatches = customFoods.filter(f => f?.name?.toLowerCase().includes(term.toLowerCase()));
        const dbMatches = FOOD_DATABASE.map(normalizeFood).filter(f => f?.name?.toLowerCase().includes(term.toLowerCase()));
        return [...customMatches, ...dbMatches].slice(0, 8);
      })()
    : [];

  const handleSelect = (f) => {
    const normalized = normalizeFood(f);
    const units = normalized.units || { Grams: 1 };
    const baseLabel = normalized.base || (normalized.defaultUnit === 'Grams' ? `${normalized.unitValue || 100}g` : `1 ${normalized.defaultUnit}`);
    setSelectedFood({ ...normalized, units, base: baseLabel });
    setTerm('');
    const firstUnit = Object.keys(units)[0];
    setUnit(firstUnit);
    setQuantity(firstUnit === 'Grams' ? 100 : 1);
    setCustomMode(false);
  };

  const handleAddSmart = () => {
    if (!selectedFood || !unit || quantity <= 0) return;
    const grams = quantity * (selectedFood.units[unit] ?? 0);
    const factor = grams / 100;
    const caloriesBase = selectedFood.cal ?? selectedFood.calories ?? 0;
    const proteinBase = selectedFood.p ?? selectedFood.protein ?? 0;
    const carbsBase = selectedFood.c ?? selectedFood.carbs ?? 0;
    const displayName = `${quantity} ${unit}`;
    onAdd({
      name: displayName,
      calories: Math.round(caloriesBase * factor),
      protein: Number((proteinBase * factor).toFixed(1)),
      carbs: Number((carbsBase * factor).toFixed(1)),
      quantity,
      unit,
      base: selectedFood.base
    });
    setSelectedFood(null);
    setTerm('');
    setQuantity(1);
    setUnit('');
  };

  const handleAddCustom = async () => {
    if (!cName || !cCal || !cUnit || !cUnitValue) return;

    const normalizedUnit = ['gram', 'grams'].includes(cUnit.trim().toLowerCase()) ? 'Grams' : cUnit.trim();
    const unitAmount = Number(cUnitValue) || 1;
    const per100gFactor = 100 / unitAmount;
    const newFood = {
      name: cName.trim(),
      calories: Number(cCal) * per100gFactor,
      protein: Number(cP) * per100gFactor,
      carbs: Number(cC) * per100gFactor,
      defaultUnit: normalizedUnit || 'Grams',
      unitValue: unitAmount
    };

    try {
      const saved = await saveCustomFood(newFood);
      const customItem = normalizeFood({
        ...saved,
        name: saved.name || cName.trim() || 'Custom Food',
        calories: saved.calories,
        protein: saved.protein,
        carbs: saved.carbs,
        defaultUnit: normalizedUnit,
        unitValue: unitAmount
      });
      const updatedCustoms = [customItem, ...customFoods.filter((food) => food?.name?.toLowerCase() !== customItem?.name?.toLowerCase())];
      setCustomFoods(updatedCustoms);
      const factor = customItem.unitValue / 100;
      const customDisplayName = `${unitAmount} ${normalizedUnit} ${cName.trim()}`;
      const mealFood = {
        name: customDisplayName,
        calories: Math.round(customItem.cal * factor),
        protein: Number((customItem.p * factor).toFixed(1)),
        carbs: Number((customItem.c * factor).toFixed(1)),
        quantity: 1,
        unit: normalizedUnit,
        base: customItem.base
      };
      onAdd(mealFood);
      setSelectedFood(null);
      setTerm('');
      setQuantity(1);
      setUnit('');
      setCustomMode(false);
      setCName(''); setCCal(''); setCP(''); setCC(''); setCUnit('Grams'); setCUnitValue(100);
    } catch (err) {
      toast.error('Could not save custom food. Try again.', { theme: 'dark' });
    }
  };

  if (customMode) {
    const commonUnits = ['Grams', 'ml', 'Cup', 'Bowl', 'Piece', 'Slice', 'Scoop', 'Tbsp', 'Tsp', 'Oz', 'Lb'];
    const unitValues = [1, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600, 700, 750, 800, 900, 1000];
    
    const currentCal = cCal ? Number(cCal) : 0;
    const currentP = cP ? Number(cP) : 0;
    const currentC = cC ? Number(cC) : 0;
    const autoName = cName.trim() ? `${cUnitValue} ${cUnit} ${cName}` : `${cUnitValue} ${cUnit} Custom Food`;

    return (
      <div className="bg-surface/50 p-4 rounded-2xl border border-accent/30 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-zinc-300">Custom Food</span>
          <button onClick={() => setCustomMode(false)} className="text-xs text-primary hover:underline">Back to Search</button>
        </div>
        
        <input type="text" placeholder="Food Name" value={cName} onChange={e => setCName(e.target.value)} className="w-full bg-background border border-white/10 p-3 rounded-xl text-white text-sm outline-none" />

        <div className="grid grid-cols-2 gap-4">
          <ScrollPicker 
            items={unitValues} 
            value={cUnitValue} 
            onChange={setCUnitValue} 
            label="Unit Value" 
          />
          <ScrollPicker 
            items={commonUnits} 
            value={cUnit} 
            onChange={setCUnit} 
            label="Unit Name" 
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Full Name (Auto-filled)</label>
          <div className="w-full bg-surface/80 border border-white/10 p-3 rounded-xl text-white text-sm">
            {autoName}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-wider">Calories</label>
            <input value={cCal} type="number" onChange={e => setCCal(e.target.value)} className="w-full bg-surface/80 border border-white/10 p-3 rounded-xl text-white text-sm outline-none" placeholder="e.g. 58" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-wider">Protein</label>
            <input value={cP} type="number" onChange={e => setCP(e.target.value)} className="w-full bg-surface/80 border border-white/10 p-3 rounded-xl text-white text-sm outline-none" placeholder="e.g. 2.5" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-wider">Carbs</label>
            <input value={cC} type="number" onChange={e => setCC(e.target.value)} className="w-full bg-surface/80 border border-white/10 p-3 rounded-xl text-white text-sm outline-none" placeholder="e.g. 12" />
          </div>
        </div>

        <div className="bg-background flex justify-around p-3 rounded-xl text-center border border-white/5">
          <div><p className="text-[10px] text-zinc-500 font-bold uppercase">Calories</p><p className="text-orange-400 font-bold">{currentCal}</p></div>
          <div><p className="text-[10px] text-zinc-500 font-bold uppercase">Protein</p><p className="text-primary font-bold">{currentP}g</p></div>
          <div><p className="text-[10px] text-zinc-500 font-bold uppercase">Carbs</p><p className="text-emerald-400 font-bold">{currentC}g</p></div>
        </div>

        <div className="text-[10px] text-zinc-500 space-y-1">
          <p>✓ Unit Value: Scroll to set the amount for one unit (e.g. 100 for 100 grams).</p>
          <p>✓ Unit Name: Scroll to select the unit type.</p>
          <p>✓ Full Name auto-updates with your selections.</p>
          <p>✓ Calories, Protein, Carbs are per unit value above.</p>
        </div>

        <button onClick={handleAddCustom} className="w-full py-3 bg-accent text-white font-bold rounded-xl mt-2 transition-transform active:scale-95">Save and Add to Meal</button>
      </div>
    );
  }

  if (selectedFood) {
    const grams = quantity * (selectedFood.units[unit] ?? 0);
    const factor = grams / 100;
    const foodName = selectedFood.name || selectedFood?.label || 'Custom Food';
    const baseCalories = selectedFood.cal ?? selectedFood.calories ?? 0;
    const baseProtein = selectedFood.p ?? selectedFood.protein ?? 0;
    const baseCarbs = selectedFood.c ?? selectedFood.carbs ?? 0;
    const currentCal = Math.round(baseCalories * factor);
    const currentP = (baseProtein * factor).toFixed(1);
    const currentC = (baseCarbs * factor).toFixed(1);
    const baseLabel = selectedFood.base || `${selectedFood.unitValue || 100} ${selectedFood.defaultUnit || 'Grams'}`;

    return (
      <div className="bg-surface/50 p-4 rounded-2xl border border-accent/30 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-white font-bold text-lg">{foodName}</h4>
            <span className="text-xs text-zinc-400">Base: {baseCalories}kcal / {baseLabel}</span>
          </div>
          <button onClick={() => setSelectedFood(null)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ScrollPicker 
            items={Array.from({ length: 2000 }, (_, i) => i + 1)} 
            value={quantity} 
            onChange={setQuantity} 
            label="Quantity" 
          />
          <ScrollPicker 
            items={Object.keys(selectedFood.units)} 
            value={unit} 
            onChange={setUnit} 
            label="Unit" 
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Full Name (Auto-filled)</label>
          <div className="w-full bg-surface/80 border border-white/10 p-3 rounded-xl text-white text-sm">
            {quantity} {unit}
          </div>
        </div>

        <div className="bg-background flex justify-around p-3 rounded-xl text-center border border-white/5">
          <div><p className="text-[10px] text-zinc-500 font-bold uppercase">Calories</p><p className="text-orange-400 font-bold">{currentCal}</p></div>
          <div><p className="text-[10px] text-zinc-500 font-bold uppercase">Protein</p><p className="text-primary font-bold">{currentP}g</p></div>
          <div><p className="text-[10px] text-zinc-500 font-bold uppercase">Carbs</p><p className="text-emerald-400 font-bold">{currentC}g</p></div>
        </div>

        <div className="text-[10px] text-zinc-500 space-y-1">
          <p>✓ Scroll Quantity and Unit pickers to select values.</p>
          <p>✓ Full Name auto-updates with your selections.</p>
          <p>✓ Calories, Protein, Carbs calculated automatically.</p>
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
              <span className="text-xs text-zinc-500">
                {f.defaultUnit === 'Grams' && f.unitValue === 100 ? `${f.cal} kcal/100g` : `${f.cal} kcal/${f.base}`}
              </span>
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
  
  const [customFoods, setCustomFoods] = useState([]);
  const [allAvailableFoods, setAllAvailableFoods] = useState([]);
  
  // Load custom foods on mount
  useEffect(() => {
    const loadCustomFoods = async () => {
      try {
        const backendFoods = await fetchCustomFoods();
        setCustomFoods(backendFoods);
      } catch (err) {
        console.error('Custom foods load failed:', err);
        setCustomFoods([]);
      }
    };
    loadCustomFoods();
  }, []);

  // Normalize food helper
  const normalizeFood = (food) => {
    const unitValue = Number(food.unitValue) || 100;
    let defaultUnit = String(food.defaultUnit || 'Grams').trim();
    if (['gram', 'grams'].includes(defaultUnit.toLowerCase())) defaultUnit = 'Grams';

    const normalizedUnits = food.units
      ? { ...food.units }
      : (defaultUnit === 'Grams'
        ? { Grams: 1 }
        : { [defaultUnit]: unitValue, Grams: 1 });

    return {
      ...food,
      name: food.name || 'Custom Food',
      cal: Number(food.calories ?? food.cal ?? 0),
      p: Number(food.protein ?? food.p ?? 0),
      c: Number(food.carbs ?? food.c ?? 0),
      defaultUnit,
      unitValue,
      base: defaultUnit === 'Grams' ? `${unitValue}g` : `1 ${defaultUnit}`,
      units: normalizedUnits
    };
  };

  useEffect(() => {
    const allFoods = [...customFoods, ...FOOD_DATABASE.map(normalizeFood)];
    setAllAvailableFoods(allFoods);
  }, [customFoods]);
  
  // Find food by unit name
  const findFoodByUnit = (unitName) => {
    const cleanUnit = unitName?.trim().toLowerCase() || '';
    return allAvailableFoods.find(f => f.name?.toLowerCase() === cleanUnit);
  };
  
  // Parse name to extract quantity and unit
  const parseNameForEdit = (name) => {
    const match = name?.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
    if (match) {
      return {
        quantity: Number(match[1]),
        unit: match[2].trim()
      };
    }
    return {
      quantity: 1,
      unit: name || ''
    };
  };
  
  const [foods, setFoods] = useState(log?.foods || []);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', quantity: '', unit: '', calories: '', protein: '', carbs: '', original: { quantity: 1, calories: 0, protein: 0, carbs: 0 }, perUnit: { calories: 0, protein: 0, carbs: 0 }, availableUnits: [] });
  
  useEffect(() => {
    const freshFoods = log?.foods || [];
    setFoods(freshFoods);
    setEditingIndex(null);
    setEditValues({ name: '', quantity: '', unit: '', calories: '', protein: '', carbs: '', original: { quantity: 1, calories: 0, protein: 0, carbs: 0 }, perUnit: { calories: 0, protein: 0, carbs: 0 }, availableUnits: [] });
    if (freshFoods.length === 0) {
      setExpanded(true);
    }
  }, [log?.foods, date]);

  const persistFoods = async (updatedFoods, message = null) => {
    setFoods(updatedFoods);
    setSaving(true);
    try {
      if (updatedFoods.length === 0) {
        if (log && log._id) {
          await deleteFoodLog(log._id);
          setEditingIndex(null);
          setExpanded(false);
          await onRefresh();
          if (message) toast.info(message, { theme: 'dark' });
        }
      } else {
        await saveFoodLog({ date, mealType: meal.id, foods: updatedFoods });
        await onRefresh();
        if (message) toast.success(message, { theme: 'dark' });
      }
    } catch (err) {
      console.error('Meal persistence failed:', err);
      toast.error(`Could not save ${meal.label}.`, { theme: 'dark' });
    }
    setSaving(false);
  };

  const handleSmartAdd = async (foodObj) => {
    const updated = [...foods, foodObj];
    setEditingIndex(null);
    await persistFoods(updated, `${meal.label} updated.`);
  };

  const handleRemove = async (i) => {
    const foodItem = foods[i];
    confirmAction(`Remove "${foodItem.name}" from ${meal.label}?`, async () => {
      const updated = [...foods];
      updated.splice(i, 1);
      await persistFoods(updated, updated.length === 0 ? `${meal.label} cleared.` : `${meal.label} updated.`);
    }, 'Remove Item', 'bg-red-500');
  };

  const handleDelete = () => {
    if (!log) return;
    confirmAction(`Delete the ${meal.label} record entirely?`, async () => {
      await persistFoods([], `${meal.label} record cleared.`);
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
                  <div key={i} className="bg-background/50 border border-white/5 rounded-xl overflow-hidden">
                    {editingIndex === i ? (
                      <div className="p-4 grid gap-3">
                        <div className="grid grid-cols-2 gap-4">
                          <ScrollPicker 
                            items={Array.from({ length: 2000 }, (_, i) => i + 1)} 
                            value={Number(editValues.quantity) || 1} 
                            onChange={(newQty) => {
                              const perUnitCal = editValues.perUnit?.calories || 0;
                              const perUnitPr = editValues.perUnit?.protein || 0;
                              const perUnitCb = editValues.perUnit?.carbs || 0;
                              const unitVal = editValues.unit || '';
                              const autoName = `${newQty} ${unitVal}`;
                              setEditValues({
                                ...editValues,
                                quantity: String(newQty),
                                name: autoName,
                                calories: String(Math.round(perUnitCal * newQty)),
                                protein: String((perUnitPr * newQty).toFixed(1)),
                                carbs: String((perUnitCb * newQty).toFixed(1)),
                              });
                            }} 
                            label="Quantity" 
                          />
                          <ScrollPicker 
                            items={editValues.availableUnits && editValues.availableUnits.length > 0 ? editValues.availableUnits : [editValues.unit || 'Grams']} 
                            value={editValues.unit} 
                            onChange={(newUnit) => {
                              const qty = Number(editValues.quantity) || 1;
                              const autoName = qty > 0 && newUnit ? `${qty} ${newUnit}` : editValues.name;
                              setEditValues({
                                ...editValues,
                                unit: newUnit,
                                name: autoName,
                              });
                            }} 
                            label="Unit" 
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 uppercase tracking-wider">Full Name (Auto-filled)</label>
                          <input value={editValues.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} className="w-full bg-surface/80 border border-white/10 p-3 rounded-xl text-white text-sm outline-none" placeholder="Auto-updates with Quantity + Unit" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-zinc-400 uppercase tracking-wider">Calories</label>
                            <input value={editValues.calories} type="number" onChange={(e) => setEditValues({ ...editValues, calories: e.target.value })} className="w-full bg-surface/80 border border-white/10 p-3 rounded-xl text-white text-sm outline-none" placeholder="e.g. 58" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 uppercase tracking-wider">Protein</label>
                            <input value={editValues.protein} type="number" onChange={(e) => setEditValues({ ...editValues, protein: e.target.value })} className="w-full bg-surface/80 border border-white/10 p-3 rounded-xl text-white text-sm outline-none" placeholder="e.g. 2.5" />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 uppercase tracking-wider">Carbs</label>
                            <input value={editValues.carbs} type="number" onChange={(e) => setEditValues({ ...editValues, carbs: e.target.value })} className="w-full bg-surface/80 border border-white/10 p-3 rounded-xl text-white text-sm outline-none" placeholder="e.g. 12" />
                          </div>
                        </div>
                        <div className="text-[10px] text-zinc-500 space-y-1">
                          <p>✓ Quantity: Scroll wheel up to increase, down to decrease (default: 1).</p>
                          <p>✓ Unit: Type or select the unit name.</p>
                          <p>✓ Calories, Protein, Carbs auto-calculate from database per-unit values.</p>
                          <p>Example: Scroll to 5 Idli = 5 × per-unit-calorie.</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={async () => {
                            const updated = [...foods];
                            const quantityVal = Number(editValues.quantity) || Number(updated[i].quantity) || 1;
                            const unitVal = (editValues.unit || updated[i].unit || updated[i].name || '').trim();
                            const cleanUnit = unitVal.replace(/^\s*\d+(?:\.\d+)?\s*/, '').trim();
                            const nameVal = editValues.name?.trim()
                              ? editValues.name.trim()
                              : `${quantityVal} ${cleanUnit}`.trim();
                            updated[i] = {
                              ...updated[i],
                              name: nameVal,
                              quantity: quantityVal,
                              unit: cleanUnit || updated[i].unit,
                              calories: Number(editValues.calories) || Number(updated[i].calories) || 0,
                              protein: Number(editValues.protein) || Number(updated[i].protein) || 0,
                              carbs: Number(editValues.carbs) || Number(updated[i].carbs) || 0,
                            };
                            setEditingIndex(null);
                            await persistFoods(updated, `${meal.label} updated.`);
                          }} className="flex-1 bg-primary/80 text-white rounded-xl py-2 font-semibold">Save Item</button>
                          <button onClick={() => setEditingIndex(null)} className="flex-1 bg-white/10 text-white rounded-xl py-2 font-semibold">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pl-4 pr-2 py-2 rounded-xl">
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
                        <div className="flex items-center gap-1">
                          <button onClick={() => {
                            const { quantity: parsedQty, unit: parsedUnit } = parseNameForEdit(f.name);
                            const foundFood = findFoodByUnit(parsedUnit);
                            const cal = Number(f.calories) || 0;
                            const prot = Number(f.protein) || 0;
                            const crb = Number(f.carbs) || 0;
                            
                            let perUnitCal = 0, perUnitPro = 0, perUnitCarb = 0;
                            let availableUnits = [];
                            
                            if (foundFood) {
                              // Use database per-unit values
                              perUnitCal = foundFood.cal || 0;
                              perUnitPro = foundFood.p || 0;
                              perUnitCarb = foundFood.c || 0;
                              availableUnits = foundFood.units ? Object.keys(foundFood.units) : [parsedUnit];
                            } else {
                              // Fallback: calculate from current stored values
                              perUnitCal = parsedQty > 0 ? cal / parsedQty : 0;
                              perUnitPro = parsedQty > 0 ? prot / parsedQty : 0;
                              perUnitCarb = parsedQty > 0 ? crb / parsedQty : 0;
                              availableUnits = [parsedUnit];
                            }
                            
                            setEditingIndex(i);
                            setEditValues({
                              name: f.name,
                              quantity: String(parsedQty),
                              unit: parsedUnit,
                              calories: String(Math.round(perUnitCal * parsedQty)),
                              protein: String((perUnitPro * parsedQty).toFixed(1)),
                              carbs: String((perUnitCarb * parsedQty).toFixed(1)),
                              original: {
                                quantity: parsedQty,
                                calories: Math.round(perUnitCal * parsedQty),
                                protein: perUnitPro * parsedQty,
                                carbs: perUnitCarb * parsedQty,
                              },
                              perUnit: {
                                calories: perUnitCal,
                                protein: perUnitPro,
                                carbs: perUnitCarb,
                              },
                              availableUnits: availableUnits
                            });
                          }} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleRemove(i)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }} className="max-w-3xl mx-auto space-y-6 pb-20 relative z-10 mobile-scroll-fix">
      
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
