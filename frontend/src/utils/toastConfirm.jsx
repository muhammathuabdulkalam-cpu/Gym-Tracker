import { toast } from 'react-toastify';

/**
 * A custom confirm modal payload for react-toastify
 */
const ConfirmContent = ({ closeToast, onConfirm, text, confirmText = 'Yes', confirmColor = 'bg-red-500' }) => (
  <div className="flex flex-col text-sm p-1">
    <p className="mb-4 font-semibold text-white leading-relaxed">{text}</p>
    <div className="flex gap-2">
      <button 
        onClick={() => { onConfirm(); closeToast(); }} 
        className={`flex-1 text-white px-3 py-2 rounded-xl transition-all font-bold ${confirmColor} bg-opacity-80 hover:bg-opacity-100 shadow-lg active:scale-95`}
      >
        {confirmText}
      </button>
      <button 
        onClick={closeToast} 
        className="flex-1 bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white px-3 py-2 rounded-xl transition-all font-bold border border-white/5 active:scale-95"
      >
        Cancel
      </button>
    </div>
  </div>
);

export const confirmAction = (text, onConfirm, confirmText = 'Yes', confirmColor = 'bg-red-500') => {
  toast(<ConfirmContent onConfirm={onConfirm} text={text} confirmText={confirmText} confirmColor={confirmColor} />, {
    autoClose: false,
    closeOnClick: false,
    draggable: false,
    pauseOnHover: true,
    progress: undefined,
    theme: "dark",
    className: "border border-white/10 backdrop-blur-2xl bg-surface/90 rounded-2xl shadow-2xl",
  });
};
