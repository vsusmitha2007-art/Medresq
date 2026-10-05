export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'PARAMEDIC' | 'HOSPITAL_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hospitalId?: string;
  hospitalName?: string;
  badgeNumber: string;
  department: string;
}

export interface CriticalAlert {
  id: string;
  condition: string;
  severity: 'CRITICAL' | 'WARNING';
  category: 'ALLERGY' | 'CHRONIC' | 'IMPLANT' | 'WARNING';
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  purpose: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface PatientLocation {
  lat: number;
  lng: number;
  address: string;
  updatedAt: string;
  accuracyMeters?: number;
}

export interface Patient {
  id: string;
  qrToken: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  dob: string;
  photoUrl?: string;
  criticalAlerts: CriticalAlert[];
  medications: Medication[];
  knownConditions: string[];
  emergencyContacts: EmergencyContact[];
  currentLocation: PatientLocation;
  organDonor: boolean;
  notes?: string;
}

export type EDStatus = 'OPEN' | 'LIMITED' | 'DIVERTING' | 'CLOSED';
export type ResourceAvailability = 'AVAILABLE' | 'LIMITED' | 'CRITICAL' | 'FULL';

export interface HospitalResources {
  icuBeds: { total: number; available: number };
  generalBeds: { total: number; available: number };
  ventilators: { total: number; available: number };
  ambulances: { total: number; available: number };
  bloodBank: 'AVAILABLE' | 'LIMITED' | 'CRITICAL';
  emergencyDoctorsCount: number;
  operatingRooms: { total: number; available: number };
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  emergencyPhone: string;
  location: { lat: number; lng: number };
  emergencyDeptStatus: EDStatus;
  resources: HospitalResources;
  specialties: string[];
  traumaLevel: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'COMMUNITY';
  overallStatus: ResourceAvailability;
  distanceKm?: number;
  estimatedDriveMinutes?: number;
}

export type AmbulanceStatus = 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'MAINTENANCE';

export interface Ambulance {
  id: string;
  hospitalId: string;
  hospitalName: string;
  vehicleNumber: string;
  status: AmbulanceStatus;
  equipmentLevel: 'ALS (Advanced Life Support)' | 'BLS (Basic Life Support)';
  currentLocation: { lat: number; lng: number; address: string };
  assignedEmergencyId?: string;
  crew: string[];
  lastMaintenance: string;
}

export type EmergencySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EmergencyStatus =
  | 'CREATED'
  | 'LOCATION_CONFIRMED'
  | 'HOSPITAL_SEARCHING'
  | 'HOSPITAL_SELECTED'
  | 'AMBULANCE_ASSIGNED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'COMPLETED';

export interface EmergencyTimelineEvent {
  status: EmergencyStatus;
  label: string;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface EmergencyRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientBloodGroup: string;
  emergencyType: string;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  location: PatientLocation;
  requiredResources: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  createdByName: string;
  selectedHospitalId?: string;
  selectedHospitalName?: string;
  assignedAmbulanceId?: string;
  timeline: EmergencyTimelineEvent[];
}

export type AuditAction =
  | 'VIEW_PATIENT'
  | 'VIEW_EMERGENCY_PROFILE'
  | 'SCAN_QR'
  | 'UPDATE_PATIENT'
  | 'UPDATE_HOSPITAL_RESOURCE'
  | 'CREATE_EMERGENCY'
  | 'SELECT_HOSPITAL'
  | 'UPDATE_EMERGENCY_STATUS'
  | 'ASSIGN_AMBULANCE'
  | 'ACCESS_DENIED';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  patientId?: string;
  patientName?: string;
  action: AuditAction;
  result: 'SUCCESS' | 'DENIED';
  reason?: string;
  ipAddress: string;
  deviceInfo: string;
  details?: string;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  emergencyId?: string;
  read: boolean;
}
