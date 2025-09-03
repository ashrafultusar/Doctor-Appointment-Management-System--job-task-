
import { DoctorRegisterData, LoginData, PatientRegisterData } from '@/types/auth';
import axios from 'axios';
import { getAuthToken, clearAuthData } from '@/utils/cookies';

const API_BASE_URL = 'https://appointment-manager-node.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, 
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
 
      clearAuthData();
      
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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

// Get specializations with retry logic
export const getSpecializations = async (): Promise<string[]> => {
  const maxRetries = 3;
  let retries = 0;
  
  const fetchWithRetry = async (): Promise<string[]> => {
    try {
      const response = await api.get('/specializations');
      return response.data?.data || [];
    } catch (error: any) {
      console.error(`Error fetching specializations (attempt ${retries + 1}/${maxRetries}):`, error);
      
      if (retries < maxRetries - 1) {
        retries++;
        const delay = Math.pow(2, retries) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry();
      }
      
      return [];
    }
  };
  
  return fetchWithRetry();
};

// Doctor interface
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

// Get doctors with pagination and filters with retry logic
export const getDoctors = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
}): Promise<DoctorsResponse> => {
  const maxRetries = 3;
  let retries = 0;
  
  const fetchWithRetry = async (): Promise<DoctorsResponse> => {
    try {
      const response = await api.get('/doctors', { params });
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching doctors (attempt ${retries + 1}/${maxRetries}):`, error);
      
      if (retries < maxRetries - 1) {
        retries++;
        const delay = Math.pow(2, retries) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry();
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
    }
  };
  
  return fetchWithRetry();
};

// Create appointment with retry logic
export const createAppointment = async (appointmentData: {
  doctorId: string;
  date: string;
}) => {
  const maxRetries = 3;
  let retries = 0;
  
  const fetchWithRetry = async () => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error: any) {
      console.error(`Error creating appointment (attempt ${retries + 1}/${maxRetries}):`, error);
      
      if (retries < maxRetries - 1) {
        retries++;
        const delay = Math.pow(2, retries) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry();
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create appointment');
    }
  };
  
  return fetchWithRetry();
};

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

// Get patient appointments with retry logic
export const getPatientAppointments = async (params: {
  status?: string;
  page?: number;
}): Promise<AppointmentsResponse> => {
  const maxRetries = 3;
  let retries = 0;
  
  const fetchWithRetry = async (): Promise<AppointmentsResponse> => {
    try {
      const response = await api.get('/appointments/patient', { params });
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching patient appointments (attempt ${retries + 1}/${maxRetries}):`, error);
      
      if (retries < maxRetries - 1) {
        retries++;
        const delay = Math.pow(2, retries) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry();
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  };
  
  return fetchWithRetry();
};

export const updateAppointmentStatus = async (updateData: {
  status: 'COMPLETED' | 'CANCELLED';
  appointment_id: string;
}) => {
  const maxRetries = 3;
  let retries = 0;
  
  const fetchWithRetry = async () => {
    try {
      const response = await api.patch('/appointments/update-status', updateData);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating appointment status (attempt ${retries + 1}/${maxRetries}):`, error);
      
      if (retries < maxRetries - 1) {
        retries++;
        const delay = Math.pow(2, retries) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry();
      }
      
      throw new Error(error.response?.data?.message || 'Failed to update appointment status');
    }
  };
  
  return fetchWithRetry();
};

// Doctor appointment interfaces
export interface DoctorAppointment {
  id: string;
  patient: {
    name: string;
    email: string;
    photo_url?: string;
  };
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface DoctorAppointmentsResponse {
  appointments: DoctorAppointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getDoctorAppointments = async (params: {
  status?: string;
  date?: string;
  page?: number;
}): Promise<DoctorAppointmentsResponse> => {
  const maxRetries = 3;
  let retries = 0;
  
  const fetchWithRetry = async (): Promise<DoctorAppointmentsResponse> => {
    try {
      const response = await api.get('/appointments/doctor', { params });
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching doctor appointments (attempt ${retries + 1}/${maxRetries}):`, error);
      
      if (retries < maxRetries - 1) {
        retries++;
        const delay = Math.pow(2, retries) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry();
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  };
  
  return fetchWithRetry();
};