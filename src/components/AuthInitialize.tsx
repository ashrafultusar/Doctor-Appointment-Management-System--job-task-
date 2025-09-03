
"use client";

import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

export default function AuthInitializer() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return null; 
}