import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { Ambulance, AmbulanceStatus } from '../types';
import {
  Ambulance as AmbulanceIcon,
  MapPin,
  CheckCircle2,
  Wrench,
  Navigation,
  Clock,
  UserCheck,
  Shield,
} from 'lucide-react';

export const AmbulanceView: React.FC = () => {
  const { ambulances, updateAmbulanceStatus, emergencies } = useEmergency();
  const { hasPermission, user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredAmbulances = ambulances.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const getStatusBadge = (status: AmbulanceStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EN_ROUTE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ARRIVED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MAINTENANCE':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const canManage =
    hasPermission('MANAGE_AMBULANCE') ||
    user?.role === 'PARAMEDIC' ||
    user?.role === 'HOSPITAL_ADMIN' ||
    user?.role === 'ADMIN';

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              <AmbulanceIcon className="w-3.5 h-3.5" />
              Regional EMS Fleet Telematics
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Ambulance Fleet & Dispatch Status
          </h1>
          <p className="text-xs text-slate-500">
            Real-time vehicle telemetry, ALS/BLS crew readiness, and hospital deployment.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="amb-status-filter" className="text-xs font-semibold text-slate-500">
            Filter Status:
          </label>
          <select
            id="amb-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Units ({ambulances.length})</option>
            <option value="AVAILABLE">Available Standby</option>
            <option value="ASSIGNED">Assigned to Incident</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="ARRIVED">Arrived on Scene</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </section>

      {/* Ambulance Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAmbulances.map((amb) => {
          return (
            <article
              key={amb.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                      {amb.id}
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {amb.vehicleNumber}
                    </h2>
                    <p className="text-xs text-slate-500">{amb.hospitalName}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border ${getStatusBadge(
                      amb.status
                    )}`}
                  >
                    {amb.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Equipment Spec:</span>
                    <span className="font-bold text-slate-800">{amb.equipmentLevel}</span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 shrink-0">Current Location:</span>
                    <span className="font-medium text-slate-800 text-right truncate">
                      {amb.currentLocation.address}
                    </span>
                  </div>

                  {amb.assignedEmergencyId && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Assigned Incident:</span>
                      <span className="font-mono font-bold text-rose-600">
                        {amb.assignedEmergencyId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Crew Details */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    On-Duty Crew Squad
                  </span>
                  {amb.crew.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {amb.crew.map((member, mIdx) => (
                        <span
                          key={mIdx}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No crew assigned (Depot Standby)</span>
                  )}
                </div>
              </div>

              {/* Status Update Form Controls (Authorized Personnel) */}
              {canManage && (
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Update Fleet Status
                  </label>
                  <select
                    value={amb.status}
                    onChange={(e) =>
                      updateAmbulanceStatus(amb.id, e.target.value as AmbulanceStatus)
                    }
                    className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="AVAILABLE">AVAILABLE (Bay Standby)</option>
                    <option value="ASSIGNED">ASSIGNED (Dispatch Alerted)</option>
                    <option value="EN_ROUTE">EN_ROUTE (Transit Scene)</option>
                    <option value="ARRIVED">ARRIVED (Scene Contact)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Depot Work)</option>
                  </select>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
};
