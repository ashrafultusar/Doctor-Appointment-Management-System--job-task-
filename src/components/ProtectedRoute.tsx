
'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requiredRole }: { 
  children: React.ReactNode;
  requiredRole?: 'PATIENT' | 'DOCTOR';
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      // User doesn't have the required role
      if (user?.role === 'PATIENT') {
        router.push('/patient/dashboard');
      } else {
        router.push('/doctor/dashboard');
      }
    }
  }, [isAuthenticated, user, requiredRole, router]);

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}