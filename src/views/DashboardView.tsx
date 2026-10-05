import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import {
  AlertCircle,
  Building2,
  BedDouble,
  Ambulance,
  PlusCircle,
  QrCode,
  Search,
  MapPin,
  ChevronRight,
  Shield,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenQRScanner: () => void;
  onOpenNewEmergency: () => void;
  onSelectEmergency: (id: string) => void;
  onSelectPatient: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenQRScanner,
  onOpenNewEmergency,
  onSelectEmergency,
  onSelectPatient,
}) => {
  const { user } = useAuth();
  const {
    emergencies,
    hospitals,
    ambulances,
    userLocation,
    fetchCurrentGeoLocation,
    selectHospitalForEmergency,
  } = useEmergency();

  // Metrics
  const activeEmergencies = emergencies.filter((e) => e.status !== 'COMPLETED');
  const availableHospitals = hospitals.filter((h) => h.emergencyDeptStatus === 'OPEN');
  const totalAvailableICUBeds = hospitals.reduce(
    (acc, h) => acc + h.resources.icuBeds.available,
    0
  );
  const totalAvailableAmbulances = ambulances.filter((a) => a.status === 'AVAILABLE').length;

  const getStatusBadge = (status: string) => {
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
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-rose-600 font-bold';
      case 'HIGH':
        return 'text-amber-600 font-bold';
      default:
        return 'text-blue-600 font-medium';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / User Context Bar */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Shield className="w-3 h-3 text-blue-600" />
              {user?.role} PORTAL
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Badge: {user?.badgeNumber}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500">
            {user?.department} · {user?.hospitalName || 'Regional EMS Network'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenNewEmergency}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all pulse-emergency min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Emergency</span>
          </button>

          <button
            type="button"
            onClick={onOpenQRScanner}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition-colors min-h-[44px]"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Scan Patient QR</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('patients')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition-colors min-h-[44px]"
          >
            <Search className="w-4 h-4 text-slate-600" />
            <span>Search Patient</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('hospitals')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition-colors min-h-[44px]"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Find Hospitals</span>
          </button>
        </div>
      </section>

      {/* Main Metric Cards Grid (Section containing Article cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Emergencies */}
        <article
          onClick={() => onNavigate('emergencies')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-rose-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Emergencies
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono" data-tabular>
              {activeEmergencies.length}
            </span>
            <span className="text-xs text-rose-600 font-medium">Critical Response</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-rose-600">
            <span>View emergency queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </article>

        {/* Metric 2: Available Hospitals */}
        <article
          onClick={() => onNavigate('hospitals')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Hospitals
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono" data-tabular>
              {availableHospitals.length} / {hospitals.length}
            </span>
            <span className="text-xs text-emerald-600 font-medium">ED Open</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-blue-600">
            <span>Browse directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </article>

        {/* Metric 3: ICU Beds */}
        <article
          onClick={() => onNavigate('hospitals')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available ICU Beds
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono" data-tabular>
              {totalAvailableICUBeds}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Regional Ready</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-emerald-600">
            <span>Check capacity</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </article>

        {/* Metric 4: Available Ambulances */}
        <article
          onClick={() => onNavigate('ambulances')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Ambulances
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Ambulance className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono" data-tabular>
              {totalAvailableAmbulances} / {ambulances.length}
            </span>
            <span className="text-xs text-purple-600 font-medium">Standby</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-purple-600">
            <span>Dispatch fleet</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </article>
      </section>

      {/* Live Map & Active Emergency Dispatch Split View */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Embedded Leaflet Map */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                Live Emergency District Map
              </h2>
              <p className="text-xs text-slate-500">
                Patient GPS, Hospital Availability Rings, and Ambulance Units
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('hospitals')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Full Screen Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <LeafletMap
            patientLocation={userLocation}
            hospitals={hospitals}
            ambulances={ambulances}
            onSelectHospital={(id) => {
              if (emergencies.length > 0) {
                selectHospitalForEmergency(emergencies[0].id, id);
              }
            }}
            onViewHospital={(_id) => {
              onNavigate('hospitals');
            }}
            onLocateMe={fetchCurrentGeoLocation}
            heightClass="h-[380px]"
          />
        </div>

        {/* Right: Primary Active Emergency Spotlight Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              <h2 className="text-base font-bold text-slate-900">Priority Incident</h2>
            </div>
            {emergencies.length > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-rose-100 text-rose-800">
                {emergencies[0].id}
              </span>
            )}
          </div>

          {emergencies.length > 0 ? (
            <article className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3
                    onClick={() => onSelectPatient(emergencies[0].patientId)}
                    className="text-lg font-extrabold text-slate-900 hover:text-blue-600 cursor-pointer"
                  >
                    {emergencies[0].patientName}
                  </h3>
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    Blood: {emergencies[0].patientBloodGroup}
                  </span>
                </div>
                <p className="text-xs text-rose-700 font-medium mt-1">
                  {emergencies[0].emergencyType}
                </p>
              </div>

              {/* Status & Location Pill Group */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded font-semibold text-[11px] border ${getStatusBadge(
                      emergencies[0].status
                    )}`}
                  >
                    {emergencies[0].status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Severity:</span>
                  <span className={getSeverityBadge(emergencies[0].severity)}>
                    {emergencies[0].severity}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 shrink-0">Location:</span>
                  <span className="font-semibold text-slate-800 text-right truncate">
                    {emergencies[0].location.address}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-bold text-blue-600">
                    {emergencies[0].selectedHospitalName || 'Searching...'}
                  </span>
                </div>

                {emergencies[0].assignedAmbulanceId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Assigned Unit:</span>
                    <span className="font-bold text-purple-700">
                      {emergencies[0].assignedAmbulanceId}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectEmergency(emergencies[0].id)}
                  className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs text-center shadow-sm transition-colors"
                >
                  Track Emergency Timeline
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPatient(emergencies[0].patientId)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs text-center transition-colors"
                >
                  View Medical Profile
                </button>
              </div>
            </article>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No active emergency requests in queue
            </div>
          )}
        </div>
      </section>

      {/* Recent Emergency Cases Accessible HTML Table Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">Recent Emergency Incidents</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('emergencies')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View all emergencies →
          </button>
        </header>

        {/* Accessible HTML Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-6 py-3">Emergency ID</th>
                <th scope="col" className="px-6 py-3">Patient</th>
                <th scope="col" className="px-6 py-3">Severity & Type</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Location</th>
                <th scope="col" className="px-6 py-3">Reported Time</th>
                <th scope="col" className="px-6 py-3">Hospital Destination</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {emergencies.map((emg) => (
                <tr key={emg.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-900">
                    {emg.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onSelectPatient(emg.patientId)}
                      className="font-bold text-blue-600 hover:underline block text-left"
                    >
                      {emg.patientName}
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: {emg.patientId} · {emg.patientBloodGroup}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`block font-semibold ${getSeverityBadge(emg.severity)}`}>
                      {emg.severity}
                    </span>
                    <span className="text-slate-600 line-clamp-1 max-w-[200px]">
                      {emg.emergencyType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded border ${getStatusBadge(
                        emg.status
                      )}`}
                    >
                      {emg.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 max-w-[180px] truncate">
                    {emg.location.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500">
                    <time dateTime={emg.createdAt}>
                      {new Date(emg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-800 block">
                      {emg.selectedHospitalName || 'Pending Selection'}
                    </span>
                    {emg.assignedAmbulanceId && (
                      <span className="text-[11px] text-purple-700 font-mono">
                        Ambulance: {emg.assignedAmbulanceId}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => onSelectEmergency(emg.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors"
                    >
                      Track
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectPatient(emg.patientId)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors"
                    >
                      Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};
