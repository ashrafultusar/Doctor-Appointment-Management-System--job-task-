// components/ProtectedRoute.tsx
'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children, requiredRole }: { 
  children: React.ReactNode;
  requiredRole?: 'PATIENT' | 'DOCTOR';
}) {
  const { isAuthenticated, user, initializeAuth } = useAuthStore();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth on component mount
    const initialize = async () => {
      initializeAuth();
      setIsInitialized(true);
      setIsLoading(false);
    };
    initialize();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    // Check if the current URL contains _rsc to prevent redirect loops
    const pathname = window.location.pathname;
    const hasRscParam = window.location.search.includes('_rsc=');
    
    if (!isAuthenticated && !hasRscParam) {
      router.push('/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole && !hasRscParam) {
      // User doesn't have the required role
      if (user?.role === 'PATIENT') {
        router.push('/patient/dashboard');
      } else if (user?.role === 'DOCTOR') {
        router.push('/doctor/dashboard');
      }
    }
  }, [isAuthenticated, user, requiredRole, router, isInitialized, isLoading]);

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}