'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientRegisterSchema, doctorRegisterSchema } from '@/lib/validations';
import { registerPatient, registerDoctor, getSpecializations } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { data: specializations = [] } = useQuery({
    queryKey: ['specializations'],
    queryFn: getSpecializations,
    enabled: activeTab === 'doctor',
  });



  // Patient Form
  const patientForm = useForm({
    resolver: zodResolver(patientRegisterSchema),
  });

  // Doctor Form
  const doctorForm = useForm({
    resolver: zodResolver(doctorRegisterSchema),
  });

  const onPatientSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await registerPatient(data);
      login(response.token, response.user);
      toast.success('Registration successful! Redirecting to dashboard...');
      
      // Increased delay to ensure state is updated
      setTimeout(() => {
        router.push('/patient/dashboard');
      }, 300);
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDoctorSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await registerDoctor(data);
      login(response.token, response.user);
      toast.success('Registration successful! Redirecting to dashboard...');
      
   
      setTimeout(() => {
        router.push('/doctor/dashboard');
      }, 300);
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Create Your Account</h2>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'patient' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('patient')}
          >
            Patient
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'doctor' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('doctor')}
          >
            Doctor
          </button>
        </div>

        {/* Patient Registration Form */}
        {activeTab === 'patient' && (
          <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-6 mt-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...patientForm.register('name')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {patientForm.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">{patientForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...patientForm.register('email')}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {patientForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">{patientForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...patientForm.register('password')}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {patientForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">{patientForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="photo_url" className="block text-sm font-medium text-gray-700">
                Photo URL (Optional)
              </label>
              <input
                {...patientForm.register('photo_url')}
                type="url"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {patientForm.formState.errors.photo_url && (
                <p className="mt-1 text-sm text-red-600">{patientForm.formState.errors.photo_url.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Register as Patient'}
            </button>
          </form>
        )}

        {/* Doctor Registration Form */}
        {activeTab === 'doctor' && (
          <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="space-y-6 mt-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...doctorForm.register('name')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {doctorForm.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">{doctorForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...doctorForm.register('email')}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {doctorForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">{doctorForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...doctorForm.register('password')}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {doctorForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">{doctorForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Specialization
              </label>
              <select
                {...doctorForm.register('specialization')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Specialization</option>
                {specializations?.map((spec: string) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
              {doctorForm.formState.errors.specialization && (
                <p className="mt-1 text-sm text-red-600">{doctorForm.formState.errors.specialization.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="photo_url" className="block text-sm font-medium text-gray-700">
                Photo URL (Optional)
              </label>
              <input
                {...doctorForm.register('photo_url')}
                type="url"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {doctorForm.formState.errors.photo_url && (
                <p className="mt-1 text-sm text-red-600">{doctorForm.formState.errors.photo_url.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Register as Doctor'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}