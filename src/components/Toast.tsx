import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { activeToast, dismissToast } = useEmergency();

  if (!activeToast) return null;

  const icons = {
    CRITICAL: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    WARNING: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    SUCCESS: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    INFO: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
  };

  const borders = {
    CRITICAL: 'border-rose-300 bg-rose-50 text-rose-950',
    WARNING: 'border-amber-300 bg-amber-50 text-amber-950',
    SUCCESS: 'border-emerald-300 bg-emerald-50 text-emerald-950',
    INFO: 'border-blue-300 bg-blue-50 text-blue-950',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] max-w-md w-full animate-in slide-in-from-bottom-5 duration-300"
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-sm ${
          borders[activeToast.type]
        }`}
      >
        {icons[activeToast.type]}
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-bold text-xs uppercase tracking-wider">{activeToast.title}</h4>
          <p className="text-xs mt-0.5 leading-relaxed opacity-90">{activeToast.message}</p>
        </div>
        <button
          onClick={dismissToast}
          aria-label="Dismiss notification"
          className="p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
