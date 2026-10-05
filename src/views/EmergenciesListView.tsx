import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { EmergencySeverity, EmergencyStatus } from '../types';
import {
  AlertCircle,
  PlusCircle,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Activity,
} from 'lucide-react';

interface EmergenciesListViewProps {
  onSelectEmergency: (id: string) => void;
  onSelectPatient: (patientId: string) => void;
  onOpenNewEmergency: () => void;
}

export const EmergenciesListView: React.FC<EmergenciesListViewProps> = ({
  onSelectEmergency,
  onSelectPatient,
  onOpenNewEmergency,
}) => {
  const { emergencies } = useEmergency();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = emergencies.filter((emg) => {
    const matchSev = severityFilter === 'ALL' || emg.severity === severityFilter;
    const matchStat = statusFilter === 'ALL' || emg.status === statusFilter;
    return matchSev && matchStat;
  });

  const getStatusBadge = (status: EmergencyStatus) => {
    switch (status) {
      case 'CREATED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'LOCATION_CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HOSPITAL_SEARCHING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'HOSPITAL_SELECTED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'AMBULANCE_ASSIGNED':
      case 'EN_ROUTE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ARRIVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              <Activity className="w-3.5 h-3.5" />
              CAD Emergency Incident Management
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Emergency Cases & Dispatch Queue
          </h1>
          <p className="text-xs text-slate-500">
            Active and archived emergency response cases with live tracking timelines.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewEmergency}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all pulse-emergency self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Emergency</span>
        </button>
      </section>

      {/* Filter Bar */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Severity:</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="CREATED">Created</option>
              <option value="LOCATION_CONFIRMED">Location Confirmed</option>
              <option value="HOSPITAL_SELECTED">Hospital Selected</option>
              <option value="EN_ROUTE">En Route</option>
              <option value="ARRIVED">Arrived</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Total Incidents: {filtered.length}
        </span>
      </section>

      {/* Cases List */}
      <section className="space-y-4">
        {filtered.map((emg) => (
          <article
            key={emg.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-xs text-slate-400">
                  {emg.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadge(
                    emg.status
                  )}`}
                >
                  {emg.status.replace('_', ' ')}
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    emg.severity === 'CRITICAL'
                      ? 'text-rose-600'
                      : emg.severity === 'HIGH'
                      ? 'text-amber-600'
                      : 'text-blue-600'
                  }`}
                >
                  {emg.severity}
                </span>
              </div>

              <h2 className="text-base font-extrabold text-slate-900 truncate">
                {emg.emergencyType}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>
                  Patient:{' '}
                  <button
                    onClick={() => onSelectPatient(emg.patientId)}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    {emg.patientName} ({emg.patientId})
                  </button>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {emg.location.address}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(emg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {emg.selectedHospitalName && (
                <div className="text-xs text-slate-700">
                  Destination Hospital:{' '}
                  <strong className="text-blue-600">{emg.selectedHospitalName}</strong>
                  {emg.assignedAmbulanceId && (
                    <span className="text-purple-700 font-mono ml-2">
                      (Unit: {emg.assignedAmbulanceId})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onSelectEmergency(emg.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <span>Track Incident</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};
