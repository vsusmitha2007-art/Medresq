import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import {
  UserCheck,
  Shield,
  Building2,
  BadgeCheck,
  LogOut,
  Lock,
  CheckCircle2,
} from 'lucide-react';

interface UserProfileViewProps {
  onLogout: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onLogout }) => {
  const { user, loginAsDemo } = useAuth();
  const { auditLogs } = useEmergency();

  if (!user) return null;

  const userLogs = auditLogs.filter((l) => l.userId === user.id);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Profile Card */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md">
            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                {user.role}
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                Badge #{user.badgeNumber}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {user.name}
            </h1>

            <p className="text-xs text-slate-500">
              {user.department} · {user.hospitalName || 'Emergency Response Authority'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 py-2 px-4 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto border border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </section>

      {/* Permissions Matrix Card */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            Role-Based Authorization & Clearance Level
          </h2>
          <span className="text-xs font-mono text-slate-500">RBAC Verified</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Emergency Patient Profile Inspection: <strong>Permitted</strong></span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>HTML5 Camera Stream QR Scanner: <strong>Active</strong></span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hospital Recommendation Ranking: <strong>Enabled</strong></span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Append-Only Security Audit Logging: <strong>Enforced</strong></span>
          </div>
        </div>
      </section>

      {/* One-Click Role Testing Switcher */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Demo Testing: Switch Personnel Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEMO_USERS.map((u) => {
            const isCurrent = u.id === user.id;

            return (
              <button
                key={u.id}
                type="button"
                onClick={() => loginAsDemo(u.role)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {u.role}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-slate-900 mt-1">{u.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{u.department}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* User's recent audit activities */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Your Recent Operational Transactions
        </h2>

        {userLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No activity logged in current session</p>
        ) : (
          <div className="space-y-2 text-xs">
            {userLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold font-mono text-slate-800">{log.action}</span>
                  <div className="text-[11px] text-slate-500">
                    {log.details || log.patientName || 'System execution'}
                  </div>
                </div>
                <time className="font-mono text-slate-400 text-[11px]">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
