import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { ShieldCheck, ArrowRight, Lock, Mail, HeartPulse } from 'lucide-react';

interface LoginViewProps {
  onSuccess: (role: UserRole) => void;
  onBackToLanding: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess, onBackToLanding }) => {
  const { login, loginAsDemo } = useAuth();

  const [email, setEmail] = useState('doctor@emergencylink.health');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        const found = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
        onSuccess(found ? found.role : 'DOCTOR');
      } else {
        setError(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (role: UserRole) => {
    loginAsDemo(role);
    onSuccess(role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          type="button"
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 group mb-4"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md">
            <HeartPulse className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Emergency<span className="text-rose-600">Link</span>
          </span>
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Emergency Portal Authentication
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Authorized personnel only. All access attempts are recorded to security logs.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200">
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
            >
              {error}
            </div>
          )}

          {/* Native HTML5 Form with Autocomplete & ARIA */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="user-email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Email / User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="user-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@emergencylink.health"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="user-password"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Demo mode: Click any of the one-click demo role buttons below.');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="user-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600">
                  Remember my workstation
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Instant Demo Access by Role
              </span>
              <span className="text-[11px] text-slate-500">
                Click any role to test its specific RBAC permissions
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSelect('DOCTOR')}
                className="p-2.5 text-left rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                  Login as Doctor
                </div>
                <div className="text-[10px] text-slate-500">Dr. Sarah Chen, MD</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('PARAMEDIC')}
                className="p-2.5 text-left rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition-colors group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700">
                  Login as Paramedic
                </div>
                <div className="text-[10px] text-slate-500">Marcus Taylor, EMT-P</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('NURSE')}
                className="p-2.5 text-left rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-colors group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                  Login as Nurse
                </div>
                <div className="text-[10px] text-slate-500">Elena Rodriguez, RN</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('HOSPITAL_ADMIN')}
                className="p-2.5 text-left rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-colors group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                  Login as Hosp Admin
                </div>
                <div className="text-[10px] text-slate-500">David Sterling, MHA</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('ADMIN')}
                className="col-span-2 p-2.5 text-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                <div className="text-xs font-bold flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Login as System Admin (Full Compliance Audit)
                </div>
                <div className="text-[10px] text-slate-300">Rachel Vance, CISO</div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBackToLanding}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            ← Return to EmergencyLink Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
