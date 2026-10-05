import React from 'react';
import { Home, AlertCircle, Users, MapPin, UserCheck } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1 shadow-lg"
    >
      <div className="grid grid-cols-5 items-center justify-around">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentView === 'dashboard' ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('emergencies')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentView === 'emergencies' || currentView === 'tracking'
              ? 'text-rose-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Emergency</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('patients')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentView === 'patients' || currentView === 'patient_profile'
              ? 'text-rose-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Patients</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('hospitals')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentView === 'hospitals' ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Map</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            currentView === 'profile' ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </nav>
  );
};
