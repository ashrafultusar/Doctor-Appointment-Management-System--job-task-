// lib/api.ts
import { DoctorRegisterData, LoginData, PatientRegisterData } from '@/types/auth';
import axios from 'axios';

const API_BASE_URL = 'https://appointment-manager-node.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Login API call
export const loginUser = async (loginData: LoginData) => {
  const response = await api.post('/auth/login', loginData);
  return response.data;
};

// Patient Registration
export const registerPatient = async (userData: PatientRegisterData) => {
  const response = await api.post('/auth/register/patient', userData);
  return response.data;
};
 
// Doctor Registration
export const registerDoctor = async (userData: DoctorRegisterData) => {
  const response = await api.post('/auth/register/doctor', userData);
  return response.data;
};

// lib/api.ts
export const getSpecializations = async (): Promise<string[]> => {
  try {
    const response = await api.get('/specializations');
    
    // API response structure অনুযায়ী data property থেকে array নিন
    return response.data?.data || [];
  } catch (error: any) {
    console.error('Error fetching specializations:', error);
    return [];
  }
};



// lib/api.ts - Add these functions
export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  photo_url?: string;
}

export interface DoctorsResponse {
  doctors: Doctor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


export const getDoctors = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
}): Promise<DoctorsResponse> => {
  try {
    const response = await api.get('/doctors', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
  }
};

// Create appointment
export const createAppointment = async (appointmentData: {
  doctorId: string;
  date: string;
}) => {
  try {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create appointment');
  }
};


// lib/api.ts - Add these functions
export interface Appointment {
  id: string;
  doctor: {
    name: string;
    specialization: string;
    photo_url?: string;
  };
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface AppointmentsResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get patient appointments
export const getPatientAppointments = async (params: {
  status?: string;
  page?: number;
}): Promise<AppointmentsResponse> => {
  try {
    const response = await api.get('/appointments/patient', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
  }
};

// Update appointment status
export const updateAppointmentStatus = async (updateData: {
  status: 'COMPLETED' | 'CANCELLED';
  appointment_id: string;
}) => {
  try {
    const response = await api.patch('/appointments/update-status', updateData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update appointment status');
  }
};