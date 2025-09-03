import Cookies from 'js-cookie'; 
import { create } from 'zustand';
import { AuthState, User } from '@/types/auth';

interface AuthStore extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (token: string, user: User) => {
    // Token কে cookie তে store করুন
    Cookies.set('token', token, { expires: 7 }); // 7 days expiry
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
    
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  initializeAuth: () => {
    const token = Cookies.get('token');
    const userStr = Cookies.get('user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      set({ token, user, isAuthenticated: true });
    }
  },
}));