
export type UserRole = 'PATIENT' | 'DOCTOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photo_url?: string;
  specialization?: string; 
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  role: UserRole;
}

export interface PatientRegisterData {
  name: string;
  email: string;
  password: string;
  photo_url?: string;
}

export interface DoctorRegisterData {
  name: string;
  email: string;
  password: string;
  specialization: string;
  photo_url?: string;
}