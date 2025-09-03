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