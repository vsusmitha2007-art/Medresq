import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  loginAsDemo: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'emergencylink_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading stored auth user', e);
    }
    // Default to doctor demo for immediate rich hackathon evaluation if not logged in
    return DEMO_USERS[0];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, _password?: string): Promise<{ success: boolean; message?: string }> => {
    // Find matching user from DEMO_USERS or create a doctor profile
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setUser(matched);
      return { success: true };
    }
    // Generic fallback for any email: assign doctor role
    const fallbackUser: User = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
      email,
      role: 'DOCTOR',
      hospitalId: 'HOSP-01',
      hospitalName: 'Metro General Trauma & Medical Center',
      badgeNumber: `MD-${Math.floor(1000 + Math.random() * 9000)}`,
      department: 'Emergency Medicine',
    };
    setUser(fallbackUser);
    return { success: true };
  };

  const loginAsDemo = (role: UserRole) => {
    const demo = DEMO_USERS.find((u) => u.role === role);
    if (demo) {
      setUser(demo);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (action: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    switch (action) {
      case 'VIEW_PATIENT':
      case 'VIEW_EMERGENCY_PROFILE':
      case 'SCAN_QR':
        return ['ADMIN', 'DOCTOR', 'PARAMEDIC', 'NURSE'].includes(user.role);

      case 'UPDATE_PATIENT_MEDICAL':
        return ['ADMIN', 'DOCTOR'].includes(user.role);

      case 'CREATE_EMERGENCY':
        return ['ADMIN', 'DOCTOR', 'PARAMEDIC'].includes(user.role);

      case 'UPDATE_EMERGENCY_STATUS':
        return ['ADMIN', 'DOCTOR', 'PARAMEDIC'].includes(user.role);

      case 'SELECT_HOSPITAL':
        return ['ADMIN', 'DOCTOR', 'PARAMEDIC'].includes(user.role);

      case 'UPDATE_HOSPITAL_RESOURCE':
        return ['ADMIN', 'HOSPITAL_ADMIN'].includes(user.role);

      case 'MANAGE_AMBULANCE':
        return ['ADMIN', 'HOSPITAL_ADMIN', 'PARAMEDIC'].includes(user.role);

      case 'VIEW_ALL_AUDIT_LOGS':
        return ['ADMIN'].includes(user.role);

      case 'MANAGE_USERS':
      case 'MANAGE_HOSPITALS':
        return ['ADMIN'].includes(user.role);

      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
