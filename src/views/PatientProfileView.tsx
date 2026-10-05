import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { generatePatientQRCodeDataUrl } from '../utils/qrUtils';
import {
  AlertCircle,
  AlertTriangle,
  Phone,
  Pill,
  Heart,
  MapPin,
  QrCode,
  ArrowLeft,
  Building2,
  Share2,
  Calendar,
  UserCheck,
} from 'lucide-react';

interface PatientProfileViewProps {
  patientId: string;
  onBack: () => void;
  onFindHospitals: (patientId: string) => void;
  onCreateEmergency: (patientId: string) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patientId,
  onBack,
  onFindHospitals,
  onCreateEmergency,
}) => {
  const { getPatientById, emergencies } = useEmergency();
  const { hasPermission } = useAuth();

  const patient: Patient | undefined = getPatientById(patientId);

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQRModal, setShowQRModal] = useState(false);

  // Find if patient has an active emergency
  const activeEmergency = emergencies.find(
    (e) => e.patientId === patientId && e.status !== 'COMPLETED'
  );

  useEffect(() => {
    if (patient) {
      generatePatientQRCodeDataUrl(patient.id, patient.qrToken).then(setQrDataUrl);
    }
  }, [patient]);

  if (!patient) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Patient Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">Identifier: {patientId}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Return to Patient Directory
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Show Patient QR Badge</span>
          </button>
        </div>
      </div>

      {/* TOP BANNER: EMERGENCY PATIENT PROFILE */}
      <header
        role="banner"
        className="rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 text-white p-6 sm:p-8 shadow-xl border border-rose-600/40 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-200 text-xs font-extrabold uppercase tracking-widest">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
              Emergency Patient Profile · Clinical Emergency Access
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {patient.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-rose-100 font-medium">
              <span>Patient ID: <span className="font-mono font-bold text-white">{patient.id}</span></span>
              <span>·</span>
              <span>Age: <span className="font-bold text-white">{patient.age}</span></span>
              <span>·</span>
              <span>Gender: <span className="font-bold text-white">{patient.gender}</span></span>
              <span>·</span>
              <span>DOB: <span className="font-mono text-white">{patient.dob}</span></span>
              {patient.organDonor && (
                <>
                  <span>·</span>
                  <span className="bg-rose-900/60 px-2 py-0.5 rounded text-[11px] font-bold text-rose-200">
                    Organ Donor
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Blood Group Heavy Weight Visual Pill */}
          <div className="self-start md:self-center flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-white text-rose-600 shadow-2xl border-4 border-rose-200/50">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Blood Group
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight leading-none mt-1">
              {patient.bloodGroup}
            </span>
          </div>
        </div>
      </header>

      {/* Action Controls Bar */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Last Location: <strong className="text-slate-800">{patient.currentLocation.address}</strong></span>
          <span className="text-slate-400 font-mono text-[11px]">(±{patient.currentLocation.accuracyMeters}m)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onFindHospitals(patient.id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Find Nearby Hospitals</span>
          </button>

          <button
            type="button"
            onClick={() => onCreateEmergency(patient.id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Dispatch Emergency Request</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Emergency Profile: ${patient.name} (${patient.id})`,
                  text: `Blood: ${patient.bloodGroup}. Critical Allergies: ${patient.criticalAlerts.map(a => a.condition).join(', ')}`,
                });
              } else {
                navigator.clipboard.writeText(
                  `EMERGENCY DATA: ${patient.name} (${patient.id}), Blood: ${patient.bloodGroup}, Allergies: ${patient.criticalAlerts.map(a => a.condition).join(', ')}`
                );
                alert('Emergency summary copied to clipboard.');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Request</span>
          </button>
        </div>
      </section>

      {/* Main Grid: Critical Alerts & Active Incident */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Alerts, Medications, Known Conditions */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION: Critical Alerts (Visual severity weights) */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Critical Alerts & High-Risk Flags
              </h2>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Immediate Clinical Notice
              </span>
            </div>

            <ul role="list" className="space-y-3">
              {patient.criticalAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm tracking-tight">
                        {alert.condition}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-200 text-rose-900'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <span className="text-xs opacity-80 mt-0.5 block">
                      Category: {alert.category}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* SECTION: Current Medications */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                Current Medications
              </h2>
              <span className="text-xs text-slate-500">Active Prescriptions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patient.medications.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                >
                  <div className="font-bold text-sm text-slate-900">{med.name}</div>
                  <div className="text-xs text-blue-700 font-semibold">{med.dosage}</div>
                  <div className="text-xs text-slate-500">{med.frequency}</div>
                  <div className="text-[11px] text-slate-400 italic">Purpose: {med.purpose}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION: Known Medical Conditions */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-600" />
                Known Medical Conditions
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {patient.knownConditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {cond}
                </span>
              ))}
            </div>

            {patient.notes && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800 block mb-1">Clinical Notes:</strong>
                {patient.notes}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (4 cols): Emergency Contact & Active Incident */}
        <div className="lg:col-span-4 space-y-6">
          {/* SECTION: Active Emergency Case (if ongoing) */}
          {activeEmergency && (
            <section className="bg-white rounded-2xl p-6 border-2 border-rose-300 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                  Active Emergency Case
                </span>
                <span className="font-mono text-xs font-bold text-slate-700">
                  {activeEmergency.id}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {activeEmergency.emergencyType}
              </h3>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Severity:</span>
                  <strong className="text-rose-600">{activeEmergency.severity}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-blue-700">
                    {activeEmergency.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reported:</span>
                  <time dateTime={activeEmergency.createdAt} className="font-mono">
                    {new Date(activeEmergency.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                <div className="flex justify-between">
                  <span>Intake Hosp:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[140px]">
                    {activeEmergency.selectedHospitalName || 'Searching'}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* SECTION: Emergency Contacts (<a href="tel:..."> clickable) */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-rose-600" />
                Emergency Contacts
              </h2>
            </div>

            <div className="space-y-3">
              {patient.emergencyContacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        {contact.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {contact.relationship}
                      </span>
                    </div>
                    {contact.isPrimary && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        Primary
                      </span>
                    )}
                  </div>

                  {/* Clickable native HTML <a href="tel:..."> */}
                  <a
                    href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {contact.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer (Anti-hallucination non-medical rule) */}
          <div className="p-4 rounded-xl bg-slate-100 text-slate-500 text-[11px] leading-relaxed border border-slate-200">
            <strong>Emergency Clinical Notice:</strong> This profile displays patient-declared baseline medical conditions, recorded allergen alerts, and verified emergency contacts. Attending emergency personnel must perform direct clinical triage assessment.
          </div>
        </div>
      </div>

      {/* QR Code Modal for Verification */}
      {showQRModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Safe Patient Identifier Token
            </h3>
            <p className="text-xs text-slate-500">
              Contains only safe randomized patient token. No raw clinical data is embedded.
            </p>

            {qrDataUrl && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-inner inline-block">
                <img
                  src={qrDataUrl}
                  alt={`QR Token for ${patient.name}`}
                  className="w-48 h-48 mx-auto"
                />
              </div>
            )}

            <div className="text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
              {patient.qrToken}
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800"
            >
              Close Badge View
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
