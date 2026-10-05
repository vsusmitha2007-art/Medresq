import React, { useState, useMemo } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  QrCode,
  AlertTriangle,
  Phone,
  Shield,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface PatientSearchViewProps {
  onSelectPatient: (patientId: string) => void;
  onOpenQRScanner: () => void;
}

export const PatientSearchView: React.FC<PatientSearchViewProps> = ({
  onSelectPatient,
  onOpenQRScanner,
}) => {
  const { patients, logAuditAction } = useEmergency();
  const { hasPermission } = useAuth();

  const [query, setQuery] = useState('');
  const [bloodFilter, setBloodFilter] = useState('ALL');

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = query.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.bloodGroup.toLowerCase().includes(q);

      const matchBlood = bloodFilter === 'ALL' || p.bloodGroup === bloodFilter;

      return matchQuery && matchBlood;
    });
  }, [patients, query, bloodFilter]);

  const handleOpenPatient = (patientId: string, patientName: string) => {
    // Check permission
    const canView = hasPermission('VIEW_PATIENT') || hasPermission('VIEW_EMERGENCY_PROFILE');
    if (!canView) {
      logAuditAction(
        'ACCESS_DENIED',
        'DENIED',
        patientId,
        patientName,
        'Unauthorized role attempt to inspect patient emergency record'
      );
      alert('Access Denied: Your current role is not authorized to inspect clinical patient records.');
      return;
    }

    // Log successful view
    logAuditAction(
      'VIEW_PATIENT',
      'SUCCESS',
      patientId,
      patientName,
      undefined,
      'Accessed emergency profile from patient search directory'
    );

    onSelectPatient(patientId);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <Shield className="w-3 h-3" />
              Gated Emergency Directory
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Emergency Patient Search
          </h1>
          <p className="text-xs text-slate-500">
            Minimal clinical exposure prior to authorized emergency profile verification.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenQRScanner}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan Patient QR Badge</span>
        </button>
      </section>

      {/* Search Input & Blood Group Filters Form */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Patient ID (e.g. P1001), Name (e.g. Eleanor Vance)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="ALL">All Blood Types</option>
              <option value="O-">O Negative (Universal Donor)</option>
              <option value="O+">O Positive</option>
              <option value="A+">A Positive</option>
              <option value="B+">B Positive</option>
              <option value="AB+">AB Positive</option>
            </select>
          </div>
        </form>

        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Found {filteredPatients.length} registered patient profiles</span>
          <span className="font-mono text-[11px]">Audit Logging: ACTIVE</span>
        </div>
      </section>

      {/* Patient Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map((patient) => {
          const primaryContact =
            patient.emergencyContacts.find((c) => c.isPrimary) || patient.emergencyContacts[0];

          return (
            <article
              key={patient.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase block">
                      Patient ID: {patient.id}
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {patient.name}
                    </h2>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold font-mono bg-rose-50 text-rose-700 border border-rose-200">
                    {patient.bloodGroup}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{patient.age} years old</span>
                  <span>·</span>
                  <span>{patient.gender}</span>
                  <span>·</span>
                  <span className="font-mono">DOB: {patient.dob}</span>
                </div>

                {/* Critical Allergies Snippet (Sanitized High-Risk only) */}
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                  <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    Critical Allergies & Warnings
                  </div>
                  <div className="text-xs font-semibold text-rose-950">
                    {patient.criticalAlerts.length > 0
                      ? patient.criticalAlerts[0].condition
                      : 'No critical alerts on record'}
                    {patient.criticalAlerts.length > 1 && (
                      <span className="text-[11px] text-rose-700 font-normal ml-1">
                        (+{patient.criticalAlerts.length - 1} more)
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Emergency Contact */}
                {primaryContact && (
                  <div className="text-xs text-slate-600 flex items-center gap-2 py-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {primaryContact.name} ({primaryContact.relationship}):{' '}
                      <span className="font-semibold">{primaryContact.phone}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenPatient(patient.id, patient.name)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  <span>Open Emergency Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
};
