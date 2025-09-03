

interface User {
  id: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const cookies = {
  authToken: null,
  authUser: null,
};

const getAuthToken = (): string | null => {
  return cookies.authToken;
};

const getAuthUser = (): User | null => {
  return cookies.authUser;
};

const setAuthData = (token: string, user: User) => {
  cookies.authToken = token;
  cookies.authUser = user;
};

const clearAuthData = () => {
  cookies.authToken = null;
  cookies.authUser = null;
};
// --- End of mocking section ---

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthStore extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  initializeAuth: () => void;
}

// The fix is here: remove the <AuthStore> type from create.
// Zustand's `create` function will correctly infer the type from the
// `persist` middleware's return type.
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        setAuthData(token, user);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        clearAuthData();
        set({ token: null, user: null, isAuthenticated: false });
      },

      initializeAuth: () => {
        const token = getAuthToken();
        const user = getAuthUser();
        
        if (token && user) {
          set({ token, user, isAuthenticated: true });
        } else {
          set({ token: null, user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : null)),
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initializeAuth();
        }
      }
    }
  )
);
