import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-surface border border-white/5 p-6 rounded-3xl shadow-xl hover:bg-surfaceHover transition-colors relative overflow-hidden group"
    >
      <div className={`absolute -right-6 -top-6 w-32 h-32 blur-3xl opacity-10 pointer-events-none group-hover:opacity-30 transition-opacity ${colorClass}`}></div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-4 rounded-2xl ${colorClass.replace('text-', 'bg-').split(' ')[0]} bg-opacity-20`}>
          <Icon className={`w-8 h-8 ${colorClass.split(' ')[1] || colorClass}`} />
        </div>
        <div>
          <h3 className="text-zinc-400 font-medium text-sm">{title}</h3>
          <div className="text-3xl font-bold text-white mt-1">{value}</div>
          {subtitle && <p className="text-zinc-500 text-xs mt-1">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
