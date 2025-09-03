
"use client";

import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthInitializer() {
  const { initializeAuth, isAuthenticated, user } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize auth on component mount
    const initialize = async () => {
      initializeAuth();
      setIsInitialized(true);
    };
    initialize();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isInitialized) return;

    // Handle redirects based on authentication state
    if (isAuthenticated) {
      // If user is already logged in and tries to access login/register pages
      if (pathname === '/login' || pathname === '/register') {
        if (user?.role === 'PATIENT') {
          router.push('/patient/dashboard');
        } else if (user?.role === 'DOCTOR') {
          router.push('/doctor/dashboard');
        }
      }
    } else {
      // If user is not authenticated and tries to access protected pages
      // Add a check to prevent redirect loops with RSC requests
      if ((pathname.startsWith('/patient/') || pathname.startsWith('/doctor/')) && 
          !pathname.includes('_rsc=')) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, user, pathname, router, isInitialized]);

  return null; 
}