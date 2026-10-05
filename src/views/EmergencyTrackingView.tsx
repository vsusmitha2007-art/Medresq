import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { EmergencyStatus } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  Ambulance,
  MapPin,
  Shield,
  AlertCircle,
  ChevronRight,
  Check,
} from 'lucide-react';

interface EmergencyTrackingViewProps {
  emergencyId: string;
  onBack: () => void;
  onFindHospitals: (patientId: string) => void;
  onSelectPatient: (patientId: string) => void;
}

export const EmergencyTrackingView: React.FC<EmergencyTrackingViewProps> = ({
  emergencyId,
  onBack,
  onFindHospitals,
  onSelectPatient,
}) => {
  const {
    getEmergencyById,
    hospitals,
    ambulances,
    updateEmergencyStatus,
    assignAmbulanceToEmergency,
  } = useEmergency();
  const { hasPermission, user } = useAuth();

  const emergency = getEmergencyById(emergencyId);
  const [selectedAmbulanceToAssign, setSelectedAmbulanceToAssign] = useState<string>('');

  if (!emergency) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Emergency Incident Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">Identifier: {emergencyId}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const statusPipeline: { key: EmergencyStatus; label: string; desc: string }[] = [
    { key: 'CREATED', label: 'Emergency Created', desc: 'Call logged & dispatch alert generated' },
    { key: 'LOCATION_CONFIRMED', label: 'Location Confirmed', desc: 'HTML5 GPS coordinates verified' },
    { key: 'HOSPITAL_SEARCHING', label: 'Hospital Searching', desc: 'Resource matching engine activated' },
    { key: 'HOSPITAL_SELECTED', label: 'Hospital Selected', desc: 'Destination triage center designated' },
    { key: 'AMBULANCE_ASSIGNED', label: 'Ambulance Assigned', desc: 'EMS squad dispatched with equipment' },
    { key: 'EN_ROUTE', label: 'Ambulance En Route', desc: 'Transport active with continuous vitals' },
    { key: 'ARRIVED', label: 'Patient Arrived', desc: 'Delivered to emergency resuscitation bay' },
    { key: 'COMPLETED', label: 'Triage Closed', desc: 'Handoff to attending trauma team' },
  ];

  const currentStatusIndex = statusPipeline.findIndex((s) => s.key === emergency.status);

  const canUpdate =
    hasPermission('UPDATE_EMERGENCY_STATUS') ||
    user?.role === 'PARAMEDIC' ||
    user?.role === 'DOCTOR' ||
    user?.role === 'ADMIN';

  const handleAdvanceStatus = () => {
    if (currentStatusIndex < statusPipeline.length - 1) {
      const nextStatus = statusPipeline[currentStatusIndex + 1].key;
      updateEmergencyStatus(emergency.id, nextStatus);
    }
  };

  const handleAssignAmbulance = () => {
    if (!selectedAmbulanceToAssign) return;
    assignAmbulanceToEmergency(emergency.id, selectedAmbulanceToAssign);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              {emergency.severity} EMERGENCY
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              {emergency.id}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {emergency.emergencyType}
          </h1>
          <p className="text-xs text-slate-500">
            Patient:{' '}
            <button
              onClick={() => onSelectPatient(emergency.patientId)}
              className="font-bold text-blue-600 hover:underline"
            >
              {emergency.patientName} ({emergency.patientId})
            </button>{' '}
            · Blood: <strong className="font-mono text-slate-700">{emergency.patientBloodGroup}</strong>
          </p>
        </div>

        {/* Status Transition Control Button */}
        {canUpdate && emergency.status !== 'COMPLETED' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAdvanceStatus}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all pulse-emergency"
            >
              <span>Advance Status to {statusPipeline[currentStatusIndex + 1]?.label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Interactive Status Timeline Component (<ol class="timeline">) */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Incident Lifecycle Progression
        </h2>

        {/* Semantic Ordered List Timeline */}
        <ol className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {statusPipeline.map((step, idx) => {
            const isCompleted = idx < currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;

            return (
              <li
                key={step.key}
                className={`relative flex flex-col justify-between p-3 rounded-xl border text-xs transition-all ${
                  isCurrent
                    ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">
                    0{idx + 1}
                  </span>
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[10px]">
                      ○
                    </div>
                  )}
                </div>

                <div>
                  <h3
                    className={`font-bold text-[11px] leading-tight ${
                      isCurrent ? 'text-rose-900' : isCompleted ? 'text-emerald-900' : 'text-slate-600'
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                    {step.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Main Grid: Location Map & Assignment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Map */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                Patient & Dispatch Geo-Vector
              </h2>
              <p className="text-xs text-slate-500">{emergency.location.address}</p>
            </div>
            <button
              onClick={() => onFindHospitals(emergency.patientId)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Recalculate Hospitals →
            </button>
          </div>

          <LeafletMap
            patientLocation={emergency.location}
            hospitals={hospitals}
            ambulances={ambulances}
            selectedHospitalId={emergency.selectedHospitalId}
            heightClass="h-[420px]"
          />
        </div>

        {/* Right Column (5 cols): Destination Hospital & Assigned Ambulance */}
        <div className="lg:col-span-5 space-y-6">
          {/* Destination Hospital Card */}
          <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                Intake Hospital Facility
              </h3>
              <button
                type="button"
                onClick={() => onFindHospitals(emergency.patientId)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Change
              </button>
            </div>

            {emergency.selectedHospitalId ? (
              <div className="space-y-2">
                <h4 className="text-lg font-extrabold text-slate-900">
                  {emergency.selectedHospitalName}
                </h4>
                <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ED Resuscitation Bay Alerted & Reserved</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <p className="font-semibold">No hospital currently assigned.</p>
                <button
                  type="button"
                  onClick={() => onFindHospitals(emergency.patientId)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold"
                >
                  Run Hospital Recommendation Engine
                </button>
              </div>
            )}
          </section>

          {/* Ambulance Dispatch Card */}
          <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Ambulance className="w-4 h-4 text-purple-600" />
                Ambulance Transport Unit
              </h3>
            </div>

            {emergency.assignedAmbulanceId ? (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-1">
                <div className="font-bold text-purple-950 text-sm">
                  Unit {emergency.assignedAmbulanceId} Dispatched
                </div>
                <div className="text-purple-800">Status: En Route to Scene</div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Assign Standby Ambulance:
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedAmbulanceToAssign}
                    onChange={(e) => setSelectedAmbulanceToAssign(e.target.value)}
                    className="flex-1 py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Select Ambulance Unit...</option>
                    {ambulances
                      .filter((a) => a.status === 'AVAILABLE')
                      .map((amb) => (
                        <option key={amb.id} value={amb.id}>
                          {amb.vehicleNumber} ({amb.id}) — {amb.hospitalName}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssignAmbulance}
                    disabled={!selectedAmbulanceToAssign}
                    className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg disabled:opacity-50"
                  >
                    Dispatch
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Audit Timestamp History Log */}
          <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Event Chronology
            </h3>

            <div className="space-y-2 text-xs">
              {emergency.timeline.map((evt, eIdx) => (
                <div
                  key={eIdx}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-800">{evt.label}</div>
                    <div className="text-[11px] text-slate-500">By: {evt.actor}</div>
                    {evt.note && <div className="text-[11px] text-slate-600 italic mt-0.5">{evt.note}</div>}
                  </div>
                  <time className="font-mono text-slate-400 font-bold shrink-0">
                    {evt.timestamp}
                  </time>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
