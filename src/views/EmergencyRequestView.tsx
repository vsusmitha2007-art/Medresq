import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { EmergencySeverity, PatientLocation } from '../types';
import {
  AlertCircle,
  MapPin,
  Crosshair,
  CheckCircle2,
  ArrowRight,
  Shield,
  Activity,
  User,
} from 'lucide-react';

interface EmergencyRequestViewProps {
  initialPatientId?: string;
  onSuccess: (newEmergencyId: string) => void;
  onCancel: () => void;
}

export const EmergencyRequestView: React.FC<EmergencyRequestViewProps> = ({
  initialPatientId,
  onSuccess,
  onCancel,
}) => {
  const { patients, userLocation, fetchCurrentGeoLocation, createEmergencyRequest } =
    useEmergency();
  const { user } = useAuth();

  const [patientId, setPatientId] = useState<string>(
    initialPatientId || (patients.length > 0 ? patients[0].id : 'P1001')
  );
  const [emergencyType, setEmergencyType] = useState<string>('Acute Severe Respiratory Distress');
  const [severity, setSeverity] = useState<EmergencySeverity>('CRITICAL');
  const [location, setLocation] = useState<PatientLocation>(userLocation);
  const [notes, setNotes] = useState<string>('');
  const [requiredResources, setRequiredResources] = useState<string[]>([
    'ICU',
    'Ventilator',
    'Ambulance',
    'Emergency Department',
  ]);
  const [fetchingGPS, setFetchingGPS] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successEmergencyId, setSuccessEmergencyId] = useState<string | null>(null);

  const selectedPatient = patients.find((p) => p.id === patientId);

  const handleFetchGPS = async () => {
    setFetchingGPS(true);
    try {
      const loc = await fetchCurrentGeoLocation();
      setLocation(loc);
    } finally {
      setFetchingGPS(false);
    }
  };

  const handleToggleResource = (resource: string) => {
    setRequiredResources((prev) =>
      prev.includes(resource) ? prev.filter((r) => r !== resource) : [...prev, resource]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newEmg = await createEmergencyRequest({
        patientId,
        emergencyType,
        severity,
        location,
        requiredResources,
        notes,
      });

      setSuccessEmergencyId(newEmg.id);

      setTimeout(() => {
        onSuccess(newEmg.id);
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <Activity className="w-3.5 h-3.5" />
              CAD Emergency Dispatch Intake
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Create Emergency Request
          </h1>
          <p className="text-xs text-slate-500">
            Initiates live location lock, hospital resource matching, and status tracking timeline.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          Cancel
        </button>
      </section>

      {/* Success Banner */}
      {successEmergencyId && (
        <div
          role="alert"
          className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-4 animate-in fade-in"
        >
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <h3 className="font-extrabold text-base">
              Emergency Request {successEmergencyId} Created Successfully!
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              Location locked. Running resource recommendation engine and loading live emergency tracker...
            </p>
          </div>
        </div>
      )}

      {/* Native HTML5 Form with semantic structure & validation */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
      >
        {/* Patient Selection Field */}
        <div>
          <label
            htmlFor="patient-id-input"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Select Patient Record <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <select
              id="patient-id-input"
              required
              value={patientId}
              onChange={(e) => {
                setPatientId(e.target.value);
                const p = patients.find((pat) => pat.id === e.target.value);
                if (p) setLocation(p.currentLocation);
              }}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) — Blood: {p.bloodGroup} (Allergies:{' '}
                  {p.criticalAlerts.length > 0 ? p.criticalAlerts[0].condition : 'None'})
                </option>
              ))}
            </select>
          </div>

          {selectedPatient && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-800">{selectedPatient.name}</span>
                <span className="text-slate-500">Age: {selectedPatient.age}</span>
              </div>
              <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-mono">
                {selectedPatient.bloodGroup}
              </span>
            </div>
          )}
        </div>

        {/* Emergency Type & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="emergency-type-select"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Emergency Classification <span className="text-rose-600">*</span>
            </label>
            <select
              id="emergency-type-select"
              required
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="Acute Severe Respiratory Distress">Acute Respiratory Failure / Asthma</option>
              <option value="Acute STEMI / Substernal Chest Pain">Acute STEMI / Cardiac Arrest</option>
              <option value="Severe Polytrauma / Motor Vehicle Crash">Severe Polytrauma (MVC)</option>
              <option value="Acute Ischemic Stroke / Neurological Deficit">Acute Stroke / Neuro Deficit</option>
              <option value="Prolonged Status Epilepticus">Prolonged Status Epilepticus</option>
              <option value="Severe Anaphylactic Shock">Severe Anaphylactic Shock</option>
              <option value="Major Hemorrhage / Penetrating Trauma">Major Hemorrhage / Penetrating</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="severity-select"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Severity Level <span className="text-rose-600">*</span>
            </label>
            <select
              id="severity-select"
              required
              value={severity}
              onChange={(e) => setSeverity(e.target.value as EmergencySeverity)}
              className={`w-full py-2.5 px-3 rounded-xl text-sm font-extrabold border focus:outline-none focus:ring-2 ${
                severity === 'CRITICAL'
                  ? 'bg-rose-50 border-rose-300 text-rose-800 focus:ring-rose-500'
                  : severity === 'HIGH'
                  ? 'bg-amber-50 border-amber-300 text-amber-800 focus:ring-amber-500'
                  : 'bg-blue-50 border-blue-300 text-blue-800 focus:ring-blue-500'
              }`}
            >
              <option value="CRITICAL">CRITICAL (Immediate Life Threat)</option>
              <option value="HIGH">HIGH (Urgent Resuscitation)</option>
              <option value="MEDIUM">MEDIUM (Semi-Urgent Stabilization)</option>
              <option value="LOW">LOW (Non-Emergency Transfer)</option>
            </select>
          </div>
        </div>

        {/* Current Location (Readonly with HTML5 Geolocation Trigger) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="patient-location-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Emergency Location (HTML5 Geolocation) <span className="text-rose-600">*</span>
            </label>

            <button
              type="button"
              onClick={handleFetchGPS}
              disabled={fetchingGPS}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Crosshair className={`w-3.5 h-3.5 ${fetchingGPS ? 'animate-spin' : ''}`} />
              <span>{fetchingGPS ? 'Locking GPS...' : 'Refresh HTML5 Geolocation'}</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-600">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              id="patient-location-input"
              type="text"
              readOnly
              value={`${location.address} (Lat: ${location.lat.toFixed(4)}, Lon: ${location.lng.toFixed(4)})`}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Required Emergency Resources Checkbox Group */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Required Clinical Resources (Used for Hospital Matching)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {[
              { id: 'ICU', label: 'Intensive Care Unit (ICU)' },
              { id: 'Ventilator', label: 'Mechanical Ventilator' },
              { id: 'Blood', label: 'Blood Bank / Transfusion' },
              { id: 'Ambulance', label: 'ALS Ambulance Transport' },
              { id: 'Emergency Department', label: 'Resuscitation Bay / ED' },
              { id: 'Operating Room', label: 'Emergency Trauma Surgery' },
            ].map((res) => {
              const checked = requiredResources.includes(res.id);
              return (
                <label
                  key={res.id}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                    checked
                      ? 'bg-rose-50/80 border-rose-300 text-rose-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleResource(res.id)}
                    className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{res.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Dispatch Notes */}
        <div>
          <label
            htmlFor="dispatch-notes"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Triage & Dispatch Notes
          </label>
          <textarea
            id="dispatch-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Clinical observations, vitals (SpO2, BP, pulse), suspected etiology, scene hazards..."
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Discard
          </button>

          <button
            type="submit"
            disabled={submitting || !!successEmergencyId}
            className="flex items-center gap-2 py-3 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            <span>{submitting ? 'Creating Case...' : 'Dispatch Emergency Request'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </main>
  );
};
