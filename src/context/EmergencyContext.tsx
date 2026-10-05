import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Patient,
  Hospital,
  Ambulance,
  EmergencyRequest,
  AuditLog,
  NotificationItem,
  EmergencyStatus,
  PatientLocation,
  HospitalResources,
  EDStatus,
  AmbulanceStatus,
  AuditAction,
} from '../types';
import {
  DEMO_PATIENTS,
  DEMO_HOSPITALS,
  DEMO_AMBULANCES,
  DEMO_EMERGENCIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import { useAuth } from './AuthContext';

interface ToastData {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
}

interface EmergencyContextType {
  patients: Patient[];
  hospitals: Hospital[];
  ambulances: Ambulance[];
  emergencies: EmergencyRequest[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  userLocation: PatientLocation;
  locationPermissionDenied: boolean;
  activeEmergencyId: string | null;
  activeToast: ToastData | null;
  setActiveEmergencyId: (id: string | null) => void;
  fetchCurrentGeoLocation: () => Promise<PatientLocation>;
  setUserLocationManually: (coords: { lat: number; lng: number; address: string }) => void;
  getPatientById: (id: string) => Patient | undefined;
  getPatientByToken: (token: string) => Patient | undefined;
  getHospitalById: (id: string) => Hospital | undefined;
  getEmergencyById: (id: string) => EmergencyRequest | undefined;
  createEmergencyRequest: (data: {
    patientId: string;
    emergencyType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    location: PatientLocation;
    requiredResources: string[];
    notes: string;
  }) => Promise<EmergencyRequest>;
  updateEmergencyStatus: (
    emergencyId: string,
    newStatus: EmergencyStatus,
    note?: string
  ) => void;
  selectHospitalForEmergency: (emergencyId: string, hospitalId: string) => void;
  assignAmbulanceToEmergency: (emergencyId: string, ambulanceId: string) => void;
  updateHospitalResources: (
    hospitalId: string,
    newResources: Partial<HospitalResources>,
    edStatus?: EDStatus
  ) => void;
  updateAmbulanceStatus: (ambulanceId: string, status: AmbulanceStatus) => void;
  updatePatientMedical: (
    patientId: string,
    allergies: string[],
    notes: string
  ) => void;
  logAuditAction: (
    action: AuditAction,
    result: 'SUCCESS' | 'DENIED',
    patientId?: string,
    patientName?: string,
    reason?: string,
    details?: string
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  showToast: (title: string, message: string, type?: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS') => void;
  dismissToast: () => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

const DEFAULT_SEATTLE_LOCATION: PatientLocation = {
  lat: 47.6101,
  lng: -122.3364,
  address: 'Pine St & 4th Ave, Seattle, WA',
  updatedAt: new Date().toISOString(),
  accuracyMeters: 10,
};

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const stored = localStorage.getItem('el_patients');
      return stored ? JSON.parse(stored) : DEMO_PATIENTS;
    } catch {
      return DEMO_PATIENTS;
    }
  });

  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    try {
      const stored = localStorage.getItem('el_hospitals');
      return stored ? JSON.parse(stored) : DEMO_HOSPITALS;
    } catch {
      return DEMO_HOSPITALS;
    }
  });

  const [ambulances, setAmbulances] = useState<Ambulance[]>(() => {
    try {
      const stored = localStorage.getItem('el_ambulances');
      return stored ? JSON.parse(stored) : DEMO_AMBULANCES;
    } catch {
      return DEMO_AMBULANCES;
    }
  });

  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>(() => {
    try {
      const stored = localStorage.getItem('el_emergencies');
      return stored ? JSON.parse(stored) : DEMO_EMERGENCIES;
    } catch {
      return DEMO_EMERGENCIES;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const stored = localStorage.getItem('el_audit_logs');
      return stored ? JSON.parse(stored) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem('el_notifications');
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [userLocation, setUserLocation] = useState<PatientLocation>(DEFAULT_SEATTLE_LOCATION);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState<boolean>(false);
  const [activeEmergencyId, setActiveEmergencyId] = useState<string | null>('EMG-2026-00125');
  const [activeToast, setActiveToast] = useState<ToastData | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('el_patients', JSON.stringify(patients));
    } catch (e) {
      console.warn('Storage quota', e);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem('el_hospitals', JSON.stringify(hospitals));
    } catch (e) {
      console.warn('Storage quota', e);
    }
  }, [hospitals]);

  useEffect(() => {
    try {
      localStorage.setItem('el_ambulances', JSON.stringify(ambulances));
    } catch (e) {
      console.warn('Storage quota', e);
    }
  }, [ambulances]);

  useEffect(() => {
    try {
      localStorage.setItem('el_emergencies', JSON.stringify(emergencies));
    } catch (e) {
      console.warn('Storage quota', e);
    }
  }, [emergencies]);

  useEffect(() => {
    try {
      localStorage.setItem('el_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('Storage quota', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('el_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Storage quota', e);
    }
  }, [notifications]);

  const showToast = useCallback(
    (title: string, message: string, type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS' = 'INFO') => {
      setActiveToast({
        id: `toast-${Date.now()}`,
        title,
        message,
        type,
      });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Log Audit Action
  const logAuditAction = useCallback(
    (
      action: AuditAction,
      result: 'SUCCESS' | 'DENIED',
      patientId?: string,
      patientName?: string,
      reason?: string,
      details?: string
    ) => {
      const newLog: AuditLog = {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        userId: user ? user.id : 'USR-ANON',
        userName: user ? user.name : 'Unauthenticated Client',
        userRole: user ? user.role : 'PARAMEDIC',
        patientId,
        patientName,
        action,
        result,
        reason,
        ipAddress: '198.51.100.42',
        deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile HTML5 WebClient' : 'Desktop Clinical WebStation',
        details,
      };

      setAuditLogs((prev) => [newLog, ...prev]);

      if (result === 'DENIED') {
        // Create security notification
        const secNotif: NotificationItem = {
          id: `NOTIF-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Access Violation Blocked',
          message: `Blocked ${action} by ${user?.name || 'Unknown'} - ${reason || 'Permission denied'}`,
          type: 'WARNING',
          read: false,
        };
        setNotifications((prev) => [secNotif, ...prev]);
        showToast('Access Violation Blocked', reason || 'Unauthorized access attempt', 'WARNING');
      }
    },
    [user, showToast]
  );

  // HTML5 Geolocation API
  const fetchCurrentGeoLocation = useCallback((): Promise<PatientLocation> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationPermissionDenied(true);
        resolve(userLocation);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: PatientLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: `Lat ${pos.coords.latitude.toFixed(4)}, Lon ${pos.coords.longitude.toFixed(4)}`,
            updatedAt: new Date().toISOString(),
            accuracyMeters: Math.round(pos.coords.accuracy),
          };
          setUserLocation(loc);
          setLocationPermissionDenied(false);
          showToast('Location Updated', `HTML5 GPS coordinates locked (${loc.accuracyMeters}m accuracy)`, 'SUCCESS');
          resolve(loc);
        },
        (err) => {
          console.warn('HTML5 Geolocation declined/unavailable:', err.message);
          setLocationPermissionDenied(true);
          showToast('Geolocation Fallback', 'Using emergency district default coordinates. Manual override enabled.', 'INFO');
          resolve(userLocation);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  }, [userLocation, showToast]);

  const setUserLocationManually = useCallback((coords: { lat: number; lng: number; address: string }) => {
    setUserLocation({
      lat: coords.lat,
      lng: coords.lng,
      address: coords.address,
      updatedAt: new Date().toISOString(),
      accuracyMeters: 5,
    });
    setLocationPermissionDenied(false);
  }, []);

  const getPatientById = useCallback((id: string) => patients.find((p) => p.id === id), [patients]);
  const getPatientByToken = useCallback(
    (token: string) => patients.find((p) => p.qrToken === token || p.id === token),
    [patients]
  );
  const getHospitalById = useCallback((id: string) => hospitals.find((h) => h.id === id), [hospitals]);
  const getEmergencyById = useCallback((id: string) => emergencies.find((e) => e.id === id), [emergencies]);

  // Create Emergency Request
  const createEmergencyRequest = async (data: {
    patientId: string;
    emergencyType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    location: PatientLocation;
    requiredResources: string[];
    notes: string;
  }): Promise<EmergencyRequest> => {
    const patient = patients.find((p) => p.id === data.patientId);
    const newId = `EMG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newEmergency: EmergencyRequest = {
      id: newId,
      patientId: data.patientId,
      patientName: patient ? patient.name : 'Unknown Patient',
      patientBloodGroup: patient ? patient.bloodGroup : 'Unknown',
      emergencyType: data.emergencyType,
      severity: data.severity,
      status: 'CREATED',
      location: data.location,
      requiredResources: data.requiredResources,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: user?.id || 'USR-ANON',
      createdByName: user?.name || 'Emergency Dispatcher',
      timeline: [
        {
          status: 'CREATED',
          label: 'Emergency Request Created',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actor: user?.name || 'Emergency Dispatch',
          note: data.notes || undefined,
        },
        {
          status: 'LOCATION_CONFIRMED',
          label: 'Patient Location Locked',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actor: 'HTML5 Geolocation Subsystem',
          note: data.location.address,
        },
      ],
    };

    setEmergencies((prev) => [newEmergency, ...prev]);
    setActiveEmergencyId(newId);

    logAuditAction(
      'CREATE_EMERGENCY',
      'SUCCESS',
      data.patientId,
      patient?.name,
      undefined,
      `Created ${newId} (${data.severity}): ${data.emergencyType}`
    );

    // Notify
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `Emergency Created (${data.severity})`,
      message: `${newId} initiated for ${patient?.name || 'Patient'} at ${data.location.address}`,
      type: data.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      emergencyId: newId,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast('Emergency Request Created', `${newId} registered with active hospital matching.`, 'CRITICAL');

    return newEmergency;
  };

  // Update Status
  const updateEmergencyStatus = useCallback(
    (emergencyId: string, newStatus: EmergencyStatus, note?: string) => {
      setEmergencies((prev) =>
        prev.map((emg) => {
          if (emg.id !== emergencyId) return emg;

          const statusLabels: Record<EmergencyStatus, string> = {
            CREATED: 'Emergency Call Created',
            LOCATION_CONFIRMED: 'Location Confirmed',
            HOSPITAL_SEARCHING: 'Resource Search In Progress',
            HOSPITAL_SELECTED: `Selected ${emg.selectedHospitalName || 'Hospital'}`,
            AMBULANCE_ASSIGNED: `Ambulance Dispatched`,
            EN_ROUTE: 'Ambulance En Route',
            ARRIVED: 'Patient Arrived at Hospital ED',
            COMPLETED: 'Emergency Closed & Handed Off',
          };

          const newTimelineEvent = {
            status: newStatus,
            label: statusLabels[newStatus] || newStatus,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actor: user?.name || 'Emergency Responder',
            note,
          };

          return {
            ...emg,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            timeline: [...emg.timeline, newTimelineEvent],
          };
        })
      );

      logAuditAction(
        'UPDATE_EMERGENCY_STATUS',
        'SUCCESS',
        undefined,
        undefined,
        undefined,
        `Emergency ${emergencyId} status transitioned to ${newStatus}`
      );

      showToast('Status Updated', `Emergency ${emergencyId} marked as ${newStatus.replace('_', ' ')}`, 'INFO');
    },
    [user, logAuditAction, showToast]
  );

  // Select Hospital
  const selectHospitalForEmergency = useCallback(
    (emergencyId: string, hospitalId: string) => {
      const hosp = hospitals.find((h) => h.id === hospitalId);
      if (!hosp) return;

      setEmergencies((prev) =>
        prev.map((emg) => {
          if (emg.id !== emergencyId) return emg;
          return {
            ...emg,
            selectedHospitalId: hosp.id,
            selectedHospitalName: hosp.name,
            status: emg.status === 'CREATED' || emg.status === 'LOCATION_CONFIRMED' || emg.status === 'HOSPITAL_SEARCHING' ? 'HOSPITAL_SELECTED' : emg.status,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...emg.timeline,
              {
                status: 'HOSPITAL_SELECTED',
                label: `Hospital Selected: ${hosp.name}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                actor: user?.name || 'Emergency Coordinator',
                note: `Distance: ${hosp.distanceKm ?? 'nearby'} km | Trauma Level: ${hosp.traumaLevel}`,
              },
            ],
          };
        })
      );

      logAuditAction(
        'SELECT_HOSPITAL',
        'SUCCESS',
        undefined,
        undefined,
        undefined,
        `Assigned hospital ${hosp.name} (${hosp.id}) to ${emergencyId}`
      );

      const notif: NotificationItem = {
        id: `NOTIF-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: 'Hospital Destination Selected',
        message: `${hosp.name} designated for Emergency ${emergencyId}`,
        type: 'SUCCESS',
        emergencyId,
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);

      showToast('Hospital Selected', `${hosp.name} designated as intake center.`, 'SUCCESS');
    },
    [hospitals, user, logAuditAction, showToast]
  );

  // Assign Ambulance
  const assignAmbulanceToEmergency = useCallback(
    (emergencyId: string, ambulanceId: string) => {
      const amb = ambulances.find((a) => a.id === ambulanceId);
      if (!amb) return;

      setAmbulances((prev) =>
        prev.map((a) => (a.id === ambulanceId ? { ...a, status: 'ASSIGNED', assignedEmergencyId: emergencyId } : a))
      );

      setEmergencies((prev) =>
        prev.map((emg) => {
          if (emg.id !== emergencyId) return emg;
          return {
            ...emg,
            assignedAmbulanceId: amb.id,
            status: 'AMBULANCE_ASSIGNED',
            updatedAt: new Date().toISOString(),
            timeline: [
              ...emg.timeline,
              {
                status: 'AMBULANCE_ASSIGNED',
                label: `Assigned Ambulance ${amb.vehicleNumber} (${amb.id})`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                actor: user?.name || 'EMS Dispatch',
                note: `Unit equipment: ${amb.equipmentLevel}`,
              },
            ],
          };
        })
      );

      logAuditAction(
        'ASSIGN_AMBULANCE',
        'SUCCESS',
        undefined,
        undefined,
        undefined,
        `Dispatched ambulance ${amb.vehicleNumber} to ${emergencyId}`
      );

      showToast('Ambulance Dispatched', `${amb.vehicleNumber} (${amb.id}) assigned to ${emergencyId}`, 'INFO');
    },
    [ambulances, user, logAuditAction, showToast]
  );

  // Update Hospital Resources
  const updateHospitalResources = useCallback(
    (hospitalId: string, newResources: Partial<HospitalResources>, edStatus?: EDStatus) => {
      setHospitals((prev) =>
        prev.map((hosp) => {
          if (hosp.id !== hospitalId) return hosp;

          const updatedResources: HospitalResources = {
            ...hosp.resources,
            ...newResources,
          };

          // Recompute overall status
          let overall = hosp.overallStatus;
          if (edStatus === 'DIVERTING' || edStatus === 'CLOSED') {
            overall = 'FULL';
          } else if (updatedResources.icuBeds.available === 0) {
            overall = 'LIMITED';
          } else if (updatedResources.icuBeds.available >= 5) {
            overall = 'AVAILABLE';
          } else {
            overall = 'LIMITED';
          }

          return {
            ...hosp,
            resources: updatedResources,
            emergencyDeptStatus: edStatus || hosp.emergencyDeptStatus,
            overallStatus: overall,
          };
        })
      );

      logAuditAction(
        'UPDATE_HOSPITAL_RESOURCE',
        'SUCCESS',
        undefined,
        undefined,
        undefined,
        `Updated hospital resources for ${hospitalId} by ${user?.name}`
      );

      showToast('Resources Updated', `Capacity counts refreshed and recorded in audit log.`, 'SUCCESS');
    },
    [user, logAuditAction, showToast]
  );

  // Update Ambulance Status
  const updateAmbulanceStatus = useCallback(
    (ambulanceId: string, status: AmbulanceStatus) => {
      setAmbulances((prev) =>
        prev.map((amb) => (amb.id === ambulanceId ? { ...amb, status } : amb))
      );

      showToast('Ambulance Status Updated', `Unit ${ambulanceId} status changed to ${status}.`, 'INFO');
    },
    [showToast]
  );

  // Update Patient Medical Information
  const updatePatientMedical = useCallback(
    (patientId: string, _allergies: string[], notes: string) => {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id !== patientId) return p;
          return {
            ...p,
            notes,
          };
        })
      );

      logAuditAction(
        'UPDATE_PATIENT',
        'SUCCESS',
        patientId,
        patients.find((p) => p.id === patientId)?.name,
        undefined,
        `Updated clinical notes for patient ${patientId}`
      );

      showToast('Patient Record Updated', `Clinical notes persisted securely.`, 'SUCCESS');
    },
    [patients, logAuditAction, showToast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <EmergencyContext.Provider
      value={{
        patients,
        hospitals,
        ambulances,
        emergencies,
        auditLogs,
        notifications,
        userLocation,
        locationPermissionDenied,
        activeEmergencyId,
        activeToast,
        setActiveEmergencyId,
        fetchCurrentGeoLocation,
        setUserLocationManually,
        getPatientById,
        getPatientByToken,
        getHospitalById,
        getEmergencyById,
        createEmergencyRequest,
        updateEmergencyStatus,
        selectHospitalForEmergency,
        assignAmbulanceToEmergency,
        updateHospitalResources,
        updateAmbulanceStatus,
        updatePatientMedical,
        logAuditAction,
        markNotificationRead,
        markAllNotificationsRead,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = (): EmergencyContextType => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
