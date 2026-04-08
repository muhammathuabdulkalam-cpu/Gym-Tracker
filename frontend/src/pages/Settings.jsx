import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { updateProfile, fetchWeightLogs, saveWeightLog } from '../api';
import { User, Save, Loader2, Settings2, Scale, Calendar, Mail, Ruler, Activity, TrendingUp, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const GENDER_OPTIONS = [
  { label: 'Male',   value: 'male',   emoji: '♂️' },
  { label: 'Female', value: 'female', emoji: '♀️' },
  { label: 'Other',  value: 'other',  emoji: '⚧️' },
];

const Field = ({ label, icon: Icon, ...inputProps }) => (
  <div>
    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" /> {label}
    </label>
    <input {...inputProps} className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm" />
  </div>
);

const Settings = () => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName]           = useState(user?.name || '');
  const [age, setAge]             = useState(user?.age || '');
  const [weight, setWeight]       = useState(user?.weight || '');
  const [height, setHeight]       = useState(user?.height || '');
  const [gender, setGender]       = useState(user?.gender || 'male');
  const [saving, setSaving]       = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [latestWeightLog, setLatestWeightLog] = useState(null);

  // Sync when context user changes (login, profile update)
  useEffect(() => {
    setName(user?.name || '');
    setAge(user?.age || '');
    setWeight(user?.weight || '');
    setHeight(user?.height || '');
    setGender(user?.gender || 'male');
    setProfileImage(user?.profileImage || '');
  }, [user]);

  // Always fetch freshest weight log from DB
  useEffect(() => {
    fetchWeightLogs()
      .then(logs => { if (logs?.length > 0) setLatestWeightLog(logs[0]); })
      .catch(() => {});
  }, []);

  const currentWeight = latestWeightLog?.weight ?? user?.weight ?? null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB).', { theme: 'dark' }); return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        name,
        age: age ? Number(age) : undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        gender,
        profileImage
      });
      updateUserProfile(updated);

      // If weight changed, also create a WeightLog entry for today
      if (weight && Number(weight) > 0) {
        const today = new Date().toISOString().split('T')[0];
        try {
          await saveWeightLog({ date: today, weight: Number(weight) });
          // Refresh the weight log display
          const logs = await fetchWeightLogs();
          if (logs?.length > 0) setLatestWeightLog(logs[0]);
        } catch {}
        // Keep context in sync
        updateUserProfile({ ...updated, weight: Number(weight) });
      }

      toast.success('Profile updated!', { theme: 'dark' });
    } catch {
      toast.error('Failed to update.', { theme: 'dark' });
    }
    setSaving(false);
  };

  // BMI uses whichever weight we have (input or latest log)
  const displayWeight = weight || latestWeightLog?.weight || user?.weight;
  const bmi = displayWeight && height
    ? (Number(displayWeight) / Math.pow(Number(height) / 100, 2)).toFixed(1)
    : null;
  const bmiCategory = bmi
    ? bmi < 18.5 ? { label: 'Underweight', color: 'text-blue-400' }
    : bmi < 25   ? { label: 'Normal',       color: 'text-green-400' }
    : bmi < 30   ? { label: 'Overweight',   color: 'text-yellow-400' }
    : { label: 'Obese', color: 'text-red-400' }
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/20 rounded-2xl">
          <Settings2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Settings</h1>
          <p className="text-zinc-400 text-sm">Manage your profile and body metrics</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6 md:p-8 space-y-5">
        {/* Avatar row */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/10 relative group">
          <label className="cursor-pointer relative rounded-2xl overflow-hidden shadow-lg border border-white/10 group-hover:border-primary/50 transition-colors w-16 h-16 flex-shrink-0">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-extrabold">
                {name ? name[0].toUpperCase() : '?'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Edit</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <div>
            <p className="text-xl font-bold text-white">{name || 'No name set'}</p>
            <p className="text-zinc-400 text-sm flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
          </div>
        </div>

        <h2 className="text-base font-bold text-white">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Full Name" icon={User} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
          <Field label="Age" icon={Calendar} type="number" min="10" max="120" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age" />
        </div>
        <Field label="Email (read-only)" icon={Mail} type="email" value={user?.email || ''} readOnly style={{ opacity: 0.5, cursor: 'not-allowed' }} />

        {/* Gender */}
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Gender</label>
          <div className="flex gap-3">
            {GENDER_OPTIONS.map(g => (
              <button key={g.value} type="button" onClick={() => setGender(g.value)}
                className={`flex-1 p-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-1 ${gender === g.value ? 'border-primary bg-primary/10 text-white' : 'border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}>
                <span className="text-lg">{g.emoji}</span>
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body Metrics Card */}
      <div className="bg-surface/70 backdrop-blur border border-white/10 rounded-3xl p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> Body Metrics
          </h2>
          <Link to="/weight" className="text-xs text-accent font-bold hover:underline flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Log Weight
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* ── Current Weight — Editable, syncs to WeightLog on save ── */}
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" /> Current Weight (kg)
            {latestWeightLog && (
              <span className="ml-auto text-zinc-600 font-normal normal-case text-[11px]">
                Last logged: {new Date(latestWeightLog.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {latestWeightLog.weight} kg
              </span>
            )}
          </label>
          <input
            type="number" min="20" max="300" step="0.1"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder={latestWeightLog ? `Last: ${latestWeightLog.weight} kg` : 'e.g. 75'}
            className="w-full bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
          />
          <p className="text-[11px] text-zinc-600 mt-1.5">Saving will also log this as today's weight entry.</p>
        </div>

        {/* Height — editable here */}
        <Field label="Height (cm)" icon={Ruler} type="number" min="100" max="250" step="0.5" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 175" />

        {/* BMI */}
        {bmi && (
          <div className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl border border-white/5">
            <div className="text-center min-w-[60px]">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">BMI</p>
              <p className={`text-2xl font-black ${bmiCategory?.color}`}>{bmi}</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className={`font-bold text-lg ${bmiCategory?.color}`}>{bmiCategory?.label}</p>
              <p className="text-xs text-zinc-500">Based on {currentWeight} kg / {height} cm</p>
            </div>
          </div>
        )}
      </div>

      {/* Save — weight excluded, only profile data */}
      <button onClick={save} disabled={saving}
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {saving ? 'Saving…' : 'Save Changes'}
      </button>

      <p className="text-center text-xs text-zinc-600">
        Weight is managed in <Link to="/weight" className="text-accent hover:underline font-semibold">Weight Tracking</Link>. Update it there to keep cardio calorie calculations accurate.
      </p>
    </motion.div>
  );
};

export default Settings;
