/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { QRScannerModal } from './components/QRScannerModal';

// Views
import { LandingView } from './views/LandingView';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { EmergenciesListView } from './views/EmergenciesListView';
import { EmergencyTrackingView } from './views/EmergencyTrackingView';
import { EmergencyRequestView } from './views/EmergencyRequestView';
import { PatientSearchView } from './views/PatientSearchView';
import { PatientProfileView } from './views/PatientProfileView';
import { NearbyHospitalsView } from './views/NearbyHospitalsView';
import { AmbulanceView } from './views/AmbulanceView';
import { HospitalResourceView } from './views/HospitalResourceView';
import { AuditLogsView } from './views/AuditLogsView';
import { UserProfileView } from './views/UserProfileView';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { activeEmergencyId, setActiveEmergencyId } = useEmergency();

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('P1001');
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // If user is not authenticated and wants login/landing
  if (!isAuthenticated && currentView !== 'login') {
    return (
      <>
        <LandingView
          onEnterApp={() => setCurrentView('dashboard')}
          onOpenLogin={() => setCurrentView('login')}
          onScanQR={() => setQrModalOpen(true)}
        />
        <QRScannerModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          onPatientIdentified={(patientId) => {
            setSelectedPatientId(patientId);
            setCurrentView('patient_profile');
          }}
        />
        <Toast />
      </>
    );
  }

  if (currentView === 'login') {
    return (
      <>
        <LoginView
          onSuccess={(_role) => setCurrentView('dashboard')}
          onBackToLanding={() => setCurrentView('landing')}
        />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-16 md:pb-0">
      {/* 3-Zone Top Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenQRScanner={() => setQrModalOpen(true)}
        onOpenNewEmergency={() => setCurrentView('new_emergency')}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'dashboard' && (
          <DashboardView
            onNavigate={(view) => setCurrentView(view)}
            onOpenQRScanner={() => setQrModalOpen(true)}
            onOpenNewEmergency={() => setCurrentView('new_emergency')}
            onSelectEmergency={(id) => {
              setActiveEmergencyId(id);
              setCurrentView('tracking');
            }}
            onSelectPatient={(id) => {
              setSelectedPatientId(id);
              setCurrentView('patient_profile');
            }}
          />
        )}

        {currentView === 'emergencies' && (
          <EmergenciesListView
            onSelectEmergency={(id) => {
              setActiveEmergencyId(id);
              setCurrentView('tracking');
            }}
            onSelectPatient={(id) => {
              setSelectedPatientId(id);
              setCurrentView('patient_profile');
            }}
            onOpenNewEmergency={() => setCurrentView('new_emergency')}
          />
        )}

        {currentView === 'tracking' && activeEmergencyId && (
          <EmergencyTrackingView
            emergencyId={activeEmergencyId}
            onBack={() => setCurrentView('emergencies')}
            onFindHospitals={(patientId) => {
              setSelectedPatientId(patientId);
              setCurrentView('hospitals');
            }}
            onSelectPatient={(patientId) => {
              setSelectedPatientId(patientId);
              setCurrentView('patient_profile');
            }}
          />
        )}

        {currentView === 'new_emergency' && (
          <EmergencyRequestView
            initialPatientId={selectedPatientId}
            onSuccess={(newId) => {
              setActiveEmergencyId(newId);
              setCurrentView('tracking');
            }}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'patients' && (
          <PatientSearchView
            onSelectPatient={(patientId) => {
              setSelectedPatientId(patientId);
              setCurrentView('patient_profile');
            }}
            onOpenQRScanner={() => setQrModalOpen(true)}
          />
        )}

        {currentView === 'patient_profile' && (
          <PatientProfileView
            patientId={selectedPatientId}
            onBack={() => setCurrentView('patients')}
            onFindHospitals={(patientId) => {
              setSelectedPatientId(patientId);
              setCurrentView('hospitals');
            }}
            onCreateEmergency={(patientId) => {
              setSelectedPatientId(patientId);
              setCurrentView('new_emergency');
            }}
          />
        )}

        {currentView === 'hospitals' && (
          <NearbyHospitalsView
            initialPatientId={selectedPatientId}
            onSelectHospitalForIncident={(_hospitalId) => {
              if (activeEmergencyId) {
                setCurrentView('tracking');
              }
            }}
            onNavigateEmergency={(id) => {
              setActiveEmergencyId(id);
              setCurrentView('tracking');
            }}
          />
        )}

        {currentView === 'ambulances' && <AmbulanceView />}

        {currentView === 'resources' && <HospitalResourceView />}

        {currentView === 'audit_logs' && <AuditLogsView />}

        {currentView === 'profile' && (
          <UserProfileView
            onLogout={() => {
              logout();
              setCurrentView('login');
            }}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation (<nav class="fixed bottom-0...">) */}
      <BottomNav currentView={currentView} onNavigate={(view) => setCurrentView(view)} />

      {/* QR Scanner Modal (HTML5 Camera stream & Canvas video rendering) */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onPatientIdentified={(patientId) => {
          setSelectedPatientId(patientId);
          setCurrentView('patient_profile');
        }}
      />

      {/* Non-intrusive Accessibility Toast (<div role="status" aria-live="polite">) */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <EmergencyProvider>
        <MainAppContent />
      </EmergencyProvider>
    </AuthProvider>
  );
}
