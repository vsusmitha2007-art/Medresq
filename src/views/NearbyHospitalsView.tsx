import React, { useState, useMemo } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { rankHospitalsForEmergency } from '../utils/emergencyEngine';
import { LeafletMap } from '../components/LeafletMap';
import {
  Building2,
  MapPin,
  BedDouble,
  Wind,
  Ambulance as AmbulanceIcon,
  HeartPulse,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Shield,
  Phone,
} from 'lucide-react';

interface NearbyHospitalsViewProps {
  initialPatientId?: string;
  onSelectHospitalForIncident?: (hospitalId: string) => void;
  onNavigateEmergency: (emergencyId: string) => void;
}

export const NearbyHospitalsView: React.FC<NearbyHospitalsViewProps> = ({
  initialPatientId,
  onSelectHospitalForIncident,
}) => {
  const {
    hospitals,
    patients,
    userLocation,
    emergencies,
    activeEmergencyId,
    fetchCurrentGeoLocation,
    selectHospitalForEmergency,
  } = useEmergency();
  const { hasPermission } = useAuth();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatientId || (patients.length > 0 ? patients[0].id : '')
  );

  // Filters
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(25);
  const [requireICU, setRequireICU] = useState<boolean>(true);
  const [requireVentilator, setRequireVentilator] = useState<boolean>(false);
  const [requireBloodBank, setRequireBloodBank] = useState<boolean>(false);
  const [requireAmbulance, setRequireAmbulance] = useState<boolean>(false);
  const [edStatusFilter, setEdStatusFilter] = useState<string>('ALL');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  // Active patient location
  const currentPatient = patients.find((p) => p.id === selectedPatientId);
  const effectiveLocation = currentPatient?.currentLocation || userLocation;

  // Build required resources list for recommendation engine
  const requiredResources = useMemo(() => {
    const list: string[] = [];
    if (requireICU) list.push('ICU');
    if (requireVentilator) list.push('Ventilator');
    if (requireBloodBank) list.push('Blood');
    if (requireAmbulance) list.push('Ambulance');
    return list;
  }, [requireICU, requireVentilator, requireBloodBank, requireAmbulance]);

  // Execute transparent rule-based recommendation engine
  const rankedHospitals = useMemo(() => {
    const scored = rankHospitalsForEmergency(hospitals, effectiveLocation, requiredResources);

    return scored.filter((rec) => {
      // Distance filter
      if (rec.distanceKm > maxDistanceKm) return false;

      // ED filter
      if (edStatusFilter !== 'ALL' && rec.hospital.emergencyDeptStatus !== edStatusFilter) {
        return false;
      }

      // Strict resource filter toggles
      if (requireICU && rec.hospital.resources.icuBeds.available === 0) return false;
      if (requireVentilator && rec.hospital.resources.ventilators.available === 0) return false;
      if (requireBloodBank && rec.hospital.resources.bloodBank === 'CRITICAL') return false;
      if (requireAmbulance && rec.hospital.resources.ambulances.available === 0) return false;

      return true;
    });
  }, [
    hospitals,
    effectiveLocation,
    requiredResources,
    maxDistanceKm,
    edStatusFilter,
    requireICU,
    requireVentilator,
    requireBloodBank,
    requireAmbulance,
  ]);

  const handleSelectHospital = (hospitalId: string) => {
    setSelectedHospitalId(hospitalId);
    if (activeEmergencyId) {
      selectHospitalForEmergency(activeEmergencyId, hospitalId);
    }
    if (onSelectHospitalForIncident) {
      onSelectHospitalForIncident(hospitalId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
      case 'OPEN':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'LIMITED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DIVERTING':
      case 'FULL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              Rule-Based Resource Matching Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Find Nearby Emergency Hospitals
          </h1>
          <p className="text-xs text-slate-500">
            Ranks hospitals by distance, emergency department status, and real-time resource availability.
          </p>
        </div>

        {/* Patient Location Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 p-2 rounded-xl border border-slate-200">
          <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
          <div className="text-xs">
            <label htmlFor="patient-select" className="text-slate-400 block text-[10px] font-semibold uppercase">
              Location Anchor
            </label>
            <select
              id="patient-select"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Filter Bar Controls Form */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-slate-500" />
            Resource Filters & Matching Criteria
          </div>
          <span className="text-xs text-slate-500">
            {rankedHospitals.length} of {hospitals.length} facilities matching
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Distance Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Max Distance Radius:</span>
              <span className="font-mono font-bold text-slate-900">{maxDistanceKm} km</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="1"
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          {/* ED Status Filter */}
          <div className="space-y-1">
            <label className="text-xs text-slate-600 font-medium block">
              Emergency Dept Status:
            </label>
            <select
              value={edStatusFilter}
              onChange={(e) => setEdStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="ALL">Any Operating Status</option>
              <option value="OPEN">Open (Normal Intake)</option>
              <option value="LIMITED">Limited Intake</option>
              <option value="DIVERTING">Diverting</option>
            </select>
          </div>

          {/* Resource Checkboxes */}
          <div className="lg:col-span-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={requireICU}
                onChange={(e) => setRequireICU(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span>Require Available ICU</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={requireVentilator}
                onChange={(e) => setRequireVentilator(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span>Require Ventilator</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={requireBloodBank}
                onChange={(e) => setRequireBloodBank(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span>Blood Bank Stocked</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={requireAmbulance}
                onChange={(e) => setRequireAmbulance(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span>Standby Ambulance</span>
            </label>
          </div>
        </div>
      </section>

      {/* Main Grid: Interactive Map + Recommendation List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Leaflet Map */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 lg:sticky lg:top-20">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              Transit & Proximity Map
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Anchor: {effectiveLocation.lat.toFixed(4)}, {effectiveLocation.lng.toFixed(4)}
            </span>
          </div>

          <LeafletMap
            patientLocation={effectiveLocation}
            hospitals={rankedHospitals.map((r) => r.hospital)}
            selectedHospitalId={selectedHospitalId || undefined}
            onSelectHospital={handleSelectHospital}
            onLocateMe={fetchCurrentGeoLocation}
            heightClass="h-[440px]"
          />

          <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200 leading-relaxed">
            <strong>Transparent Scoring Engine:</strong> Rank is computed based on physical distance, Emergency Department open status, and real-time available resource counts. Not an automated medical diagnosis.
          </div>
        </div>

        {/* Right Column: Ranked Hospital Cards (<article>) */}
        <div className="lg:col-span-7 space-y-4">
          {rankedHospitals.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                No Hospitals Match Selected Criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No medical facility in the {maxDistanceKm} km radius satisfies all required resource filters. Consider expanding the distance slider or relaxing resource requirements.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMaxDistanceKm(35);
                  setRequireVentilator(false);
                  setRequireBloodBank(false);
                  setRequireAmbulance(false);
                }}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Reset Relaxed Filters
              </button>
            </div>
          ) : (
            rankedHospitals.map((rec, index) => {
              const hosp = rec.hospital;
              const isSelected = hosp.id === selectedHospitalId;
              const isTopRecommendation = index === 0;

              return (
                <article
                  key={hosp.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all relative ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : isTopRecommendation
                      ? 'border-emerald-300 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Recommendation Badge */}
                  {isTopRecommendation && (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Top Resource Match Recommendation</span>
                    </div>
                  )}

                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400 font-bold">
                          {hosp.id}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-semibold">
                          {hosp.traumaLevel.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                        {hosp.name}
                      </h3>
                      <p className="text-xs text-slate-500">{hosp.address}, {hosp.city}</p>
                    </div>

                    {/* Proximity & Travel Time Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-right shrink-0">
                      <div className="text-lg font-extrabold font-mono text-slate-900" data-tabular>
                        {rec.distanceKm} km
                      </div>
                      <div className="text-xs font-semibold text-rose-600 font-mono" data-tabular>
                        ~{rec.driveMinutes} mins drive
                      </div>
                    </div>
                  </div>

                  {/* Resource Availability Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        ICU Beds
                      </span>
                      <span
                        className={`font-bold font-mono text-sm ${
                          hosp.resources.icuBeds.available > 0
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {hosp.resources.icuBeds.available} / {hosp.resources.icuBeds.total}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Ventilators
                      </span>
                      <span
                        className={`font-bold font-mono text-sm ${
                          hosp.resources.ventilators.available > 0
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {hosp.resources.ventilators.available} / {hosp.resources.ventilators.total}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Ambulances
                      </span>
                      <span className="font-bold font-mono text-sm text-slate-800">
                        {hosp.resources.ambulances.available} / {hosp.resources.ambulances.total}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Blood Bank
                      </span>
                      <span
                        className={`font-bold text-xs uppercase ${
                          hosp.resources.bloodBank === 'AVAILABLE'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {hosp.resources.bloodBank}
                      </span>
                    </div>
                  </div>

                  {/* Ranking Justification Box */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Recommendation Rationale:
                    </div>
                    <ul className="space-y-1 text-slate-600 text-xs list-disc list-inside">
                      {rec.reasons.map((reason, rIdx) => (
                        <li key={rIdx}>{reason}</li>
                      ))}
                    </ul>

                    {rec.missingResources.length > 0 && (
                      <div className="mt-2 text-rose-700 font-medium text-xs flex items-center gap-1.5 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Caveats: {rec.missingResources.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 gap-3">
                    <a
                      href={`tel:${hosp.emergencyPhone.replace(/[^0-9+]/g, '')}`}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{hosp.emergencyPhone}</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectHospital(hosp.id)}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                      >
                        {isSelected ? 'Hospital Designated ✓' : 'Select as Destination'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
};
