import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { EDStatus, Hospital } from '../types';
import {
  Building2,
  BedDouble,
  Wind,
  Ambulance,
  HeartPulse,
  UserPlus,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const HospitalResourceView: React.FC = () => {
  const { hospitals, updateHospitalResources } = useEmergency();
  const { user, hasPermission } = useAuth();

  // Allow selecting hospital (defaults to user's assigned hospital or HOSP-01)
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    user?.hospitalId || 'HOSP-01'
  );

  const hospital: Hospital | undefined =
    hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  // Local state for interactive editing
  const [icuAvailable, setIcuAvailable] = useState<number>(hospital?.resources.icuBeds.available || 0);
  const [icuTotal, setIcuTotal] = useState<number>(hospital?.resources.icuBeds.total || 0);
  const [generalAvailable, setGeneralAvailable] = useState<number>(hospital?.resources.generalBeds.available || 0);
  const [generalTotal, setGeneralTotal] = useState<number>(hospital?.resources.generalBeds.total || 0);
  const [ventAvailable, setVentAvailable] = useState<number>(hospital?.resources.ventilators.available || 0);
  const [ventTotal, setVentTotal] = useState<number>(hospital?.resources.ventilators.total || 0);
  const [ambAvailable, setAmbAvailable] = useState<number>(hospital?.resources.ambulances.available || 0);
  const [ambTotal, setAmbTotal] = useState<number>(hospital?.resources.ambulances.total || 0);
  const [bloodBank, setBloodBank] = useState<'AVAILABLE' | 'LIMITED' | 'CRITICAL'>(
    hospital?.resources.bloodBank || 'AVAILABLE'
  );
  const [emergencyDoctors, setEmergencyDoctors] = useState<number>(
    hospital?.resources.emergencyDoctorsCount || 4
  );
  const [edStatus, setEdStatus] = useState<EDStatus>(hospital?.emergencyDeptStatus || 'OPEN');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if selected hospital changes
  const handleSelectHospital = (hospId: string) => {
    setSelectedHospitalId(hospId);
    const target = hospitals.find((h) => h.id === hospId);
    if (target) {
      setIcuAvailable(target.resources.icuBeds.available);
      setIcuTotal(target.resources.icuBeds.total);
      setGeneralAvailable(target.resources.generalBeds.available);
      setGeneralTotal(target.resources.generalBeds.total);
      setVentAvailable(target.resources.ventilators.available);
      setVentTotal(target.resources.ventilators.total);
      setAmbAvailable(target.resources.ambulances.available);
      setAmbTotal(target.resources.ambulances.total);
      setBloodBank(target.resources.bloodBank);
      setEmergencyDoctors(target.resources.emergencyDoctorsCount);
      setEdStatus(target.emergencyDeptStatus);
      setSaveSuccess(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital) return;

    updateHospitalResources(
      hospital.id,
      {
        icuBeds: { total: Number(icuTotal), available: Number(icuAvailable) },
        generalBeds: { total: Number(generalTotal), available: Number(generalAvailable) },
        ventilators: { total: Number(ventTotal), available: Number(ventAvailable) },
        ambulances: { total: Number(ambTotal), available: Number(ambAvailable) },
        bloodBank,
        emergencyDoctorsCount: Number(emergencyDoctors),
      },
      edStatus
    );

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Status computation thresholds
  const getICUStatusBadge = (available: number) => {
    if (available >= 5) return { label: 'AVAILABLE', color: 'bg-emerald-100 text-emerald-800' };
    if (available >= 1) return { label: 'LIMITED', color: 'bg-amber-100 text-amber-800' };
    return { label: 'FULL / UNAVAILABLE', color: 'bg-rose-100 text-rose-800' };
  };

  const icuStatus = getICUStatusBadge(icuAvailable);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Hospital Clinical Operations Console
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Real-Time Hospital Resource Management
          </h1>
          <p className="text-xs text-slate-500">
            Updates synchronize immediately across regional EMS dispatch CAD and recommendation engine.
          </p>
        </div>

        {/* Facility Selector */}
        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 self-start md:self-auto">
          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="text-xs">
            <label htmlFor="hosp-switch-select" className="text-slate-400 block text-[10px] font-semibold uppercase">
              Managing Facility
            </label>
            <select
              id="hosp-switch-select"
              value={selectedHospitalId}
              onChange={(e) => handleSelectHospital(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-3 animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Capacity Updated & Audit Logged:</span> All active ambulance dispatchers and recommendation queries will reflect the revised resource state.
          </div>
        </div>
      )}

      {/* Main Interactive Resource Dashboard Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: ICU Beds */}
          <article className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-rose-600" />
                ICU Beds
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${icuStatus.color}`}>
                {icuStatus.label}
              </span>
            </div>

            <div className="text-2xl font-extrabold font-mono text-slate-900" data-tabular>
              {icuAvailable} / {icuTotal} <span className="text-xs text-slate-500 font-sans font-normal">Available</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="text-slate-500 block text-[11px] mb-1">Available Free</label>
                <input
                  type="number"
                  min="0"
                  max={icuTotal}
                  value={icuAvailable}
                  onChange={(e) => setIcuAvailable(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-500 block text-[11px] mb-1">Total Licensed</label>
                <input
                  type="number"
                  min="1"
                  value={icuTotal}
                  onChange={(e) => setIcuTotal(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-600"
                />
              </div>
            </div>
          </article>

          {/* Card 2: General Beds */}
          <article className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-blue-600" />
                General Inpatient Beds
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                INPATIENT
              </span>
            </div>

            <div className="text-2xl font-extrabold font-mono text-slate-900" data-tabular>
              {generalAvailable} / {generalTotal} <span className="text-xs text-slate-500 font-sans font-normal">Available</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="text-slate-500 block text-[11px] mb-1">Available Free</label>
                <input
                  type="number"
                  min="0"
                  max={generalTotal}
                  value={generalAvailable}
                  onChange={(e) => setGeneralAvailable(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-500 block text-[11px] mb-1">Total Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={generalTotal}
                  onChange={(e) => setGeneralTotal(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-600"
                />
              </div>
            </div>
          </article>

          {/* Card 3: Mechanical Ventilators */}
          <article className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-emerald-600" />
                Mechanical Ventilators
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  ventAvailable > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {ventAvailable > 0 ? 'AVAILABLE' : 'ZERO STANDBY'}
              </span>
            </div>

            <div className="text-2xl font-extrabold font-mono text-slate-900" data-tabular>
              {ventAvailable} / {ventTotal} <span className="text-xs text-slate-500 font-sans font-normal">Standby</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="text-slate-500 block text-[11px] mb-1">Unassigned</label>
                <input
                  type="number"
                  min="0"
                  max={ventTotal}
                  value={ventAvailable}
                  onChange={(e) => setVentAvailable(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-500 block text-[11px] mb-1">Total Fleet</label>
                <input
                  type="number"
                  min="1"
                  value={ventTotal}
                  onChange={(e) => setVentTotal(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-600"
                />
              </div>
            </div>
          </article>

          {/* Card 4: Ambulances */}
          <article className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Ambulance className="w-4 h-4 text-purple-600" />
                Ambulance Fleet
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  ambAvailable > 0 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {ambAvailable > 0 ? `${ambAvailable} READY` : 'ALL ON CALL'}
              </span>
            </div>

            <div className="text-2xl font-extrabold font-mono text-slate-900" data-tabular>
              {ambAvailable} / {ambTotal} <span className="text-xs text-slate-500 font-sans font-normal">Available</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="text-slate-500 block text-[11px] mb-1">Standby Bay</label>
                <input
                  type="number"
                  min="0"
                  max={ambTotal}
                  value={ambAvailable}
                  onChange={(e) => setAmbAvailable(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-500 block text-[11px] mb-1">Total Squad</label>
                <input
                  type="number"
                  min="1"
                  value={ambTotal}
                  onChange={(e) => setAmbTotal(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-600"
                />
              </div>
            </div>
          </article>

          {/* Card 5: Blood Bank Inventory Status */}
          <article className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                Blood Bank Reserves
              </span>
            </div>

            <div className="text-2xl font-extrabold text-slate-900 uppercase">
              {bloodBank}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="text-slate-500 block text-[11px] mb-1">Inventory Status</label>
              <select
                value={bloodBank}
                onChange={(e) => setBloodBank(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="AVAILABLE">AVAILABLE (All types in stock)</option>
                <option value="LIMITED">LIMITED (Restricted O- and Platelets)</option>
                <option value="CRITICAL">CRITICAL (Emergency protocol only)</option>
              </select>
            </div>
          </article>

          {/* Card 6: Emergency Department & Doctors */}
          <article className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-700" />
                Emergency Department Intake
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  edStatus === 'OPEN'
                    ? 'bg-emerald-100 text-emerald-800'
                    : edStatus === 'LIMITED'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {edStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-slate-500 block text-[11px] mb-1">ED Operating Status</label>
                <select
                  value={edStatus}
                  onChange={(e) => setEdStatus(e.target.value as EDStatus)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value="OPEN">OPEN (Normal Intake)</option>
                  <option value="LIMITED">LIMITED (Triage High Acuity)</option>
                  <option value="DIVERTING">DIVERTING (Full Divert)</option>
                  <option value="CLOSED">CLOSED (Facility Lockdown)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 block text-[11px] mb-1">On-Duty Attending MDs</label>
                <input
                  type="number"
                  min="1"
                  value={emergencyDoctors}
                  onChange={(e) => setEmergencyDoctors(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </article>
        </section>

        {/* Save Bar */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Audit Rule:</span> Modifying capacity creates an append-only audit entry stamped with your credentials.
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Publish Resource Updates</span>
          </button>
        </section>
      </form>
    </main>
  );
};
