import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { UserRole } from '../types';
import { NotificationDrawer } from './NotificationDrawer';
import {
  Bell,
  QrCode,
  PlusCircle,
  LogOut,
  ChevronDown,
  UserCheck,
  Building2,
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenQRScanner: () => void;
  onOpenNewEmergency: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenQRScanner,
  onOpenNewEmergency,
}) => {
  const { user, logout, loginAsDemo } = useAuth();
  const { notifications, setActiveEmergencyId } = useEmergency();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roles: { role: UserRole; title: string; subtitle: string }[] = [
    { role: 'DOCTOR', title: 'Dr. Sarah Chen, MD', subtitle: 'Emergency Medicine Specialist' },
    { role: 'PARAMEDIC', title: 'Marcus Taylor, EMT-P', subtitle: 'Mobile EMS Squad 4' },
    { role: 'NURSE', title: 'Elena Rodriguez, RN', subtitle: 'Acute Care & Triage' },
    { role: 'HOSPITAL_ADMIN', title: 'David Sterling, MHA', subtitle: 'Metro General Clinical Ops' },
    { role: 'ADMIN', title: 'Rachel Vance, CISO', subtitle: 'System Security & Compliance' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ZONE 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Emergency<span className="text-rose-600">Link</span>
              </span>
            </button>

            {user?.hospitalName && (
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 pl-3 border-l border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]">{user.hospitalName}</span>
              </div>
            )}
          </div>

          {/* ZONE 2: 4-6 Clean Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`hover:text-slate-900 transition-colors pb-1 border-b-2 ${
                currentView === 'dashboard' ? 'border-rose-600 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => onNavigate('emergencies')}
              className={`hover:text-slate-900 transition-colors pb-1 border-b-2 ${
                currentView === 'emergencies' ? 'border-rose-600 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              Emergencies
            </button>

            <button
              onClick={() => onNavigate('patients')}
              className={`hover:text-slate-900 transition-colors pb-1 border-b-2 ${
                currentView === 'patients' || currentView === 'patient_profile'
                  ? 'border-rose-600 text-slate-900 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Patients
            </button>

            <button
              onClick={() => onNavigate('hospitals')}
              className={`hover:text-slate-900 transition-colors pb-1 border-b-2 ${
                currentView === 'hospitals' ? 'border-rose-600 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              Nearby Hospitals
            </button>

            <button
              onClick={() => onNavigate('ambulances')}
              className={`hover:text-slate-900 transition-colors pb-1 border-b-2 ${
                currentView === 'ambulances' ? 'border-rose-600 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              Ambulances
            </button>

            {(user?.role === 'HOSPITAL_ADMIN' || user?.role === 'ADMIN') && (
              <button
                onClick={() => onNavigate('resources')}
                className={`hover:text-slate-900 transition-colors pb-1 border-b-2 ${
                  currentView === 'resources' ? 'border-rose-600 text-slate-900 font-semibold' : 'border-transparent'
                }`}
              >
                Hospital Ops
              </button>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
              <button
                onClick={() => onNavigate('audit_logs')}
                className={`hover:text-slate-900 transition-colors pb-1 border-b-2 ${
                  currentView === 'audit_logs' ? 'border-rose-600 text-slate-900 font-semibold' : 'border-transparent'
                }`}
              >
                Audit Trail
              </button>
            )}
          </nav>

          {/* ZONE 3: Primary Actions & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Scan Patient QR Button */}
            <button
              type="button"
              onClick={onOpenQRScanner}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="HTML5 QR Patient Scanner"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Create Emergency Request Button */}
            <button
              type="button"
              onClick={onOpenNewEmergency}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm rounded-lg transition-colors whitespace-nowrap pulse-emergency"
              title="Create New Emergency"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="font-bold">New Emergency</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="View notifications"
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                  </span>
                )}
              </button>

              <NotificationDrawer
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onSelectEmergency={(id) => {
                  setActiveEmergencyId(id);
                  onNavigate('tracking');
                }}
              />
            </div>

            {/* Role Switcher & User Profile Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {user?.role.slice(0, 3)}
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <div className="font-bold text-slate-900 truncate max-w-[120px]">{user?.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{user?.role}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-2 animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Switch Role for Demo Testing
                    </span>
                    <span className="text-xs text-slate-600">Test different RBAC permission tiers</span>
                  </div>

                  <div className="space-y-1">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => {
                          loginAsDemo(r.role);
                          setRoleSwitcherOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                          user?.role === r.role ? 'bg-blue-50 text-blue-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <UserCheck
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            user?.role === r.role ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold">{r.title}</div>
                          <div className="text-[10px] text-slate-500 truncate">{r.subtitle}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setRoleSwitcherOpen(false);
                        onNavigate('login');
                      }}
                      className="w-full flex items-center gap-2 p-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
