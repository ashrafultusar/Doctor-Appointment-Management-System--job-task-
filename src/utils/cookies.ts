import { User } from '@/types/auth';
import Cookies from 'js-cookie';

export const getAuthToken = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return Cookies.get('token');
};

export const getAuthUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = Cookies.get('user');
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user cookie:', error);
  
    Cookies.remove('user');
    return null;
  }
};

export const setAuthData = (token: string, user: User): void => {
  if (typeof window === 'undefined') return;
  
  Cookies.set('token', token, { 
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  Cookies.set('user', JSON.stringify(user), { 
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  
  Cookies.remove('token');
  Cookies.remove('user');
};


export const validateToken = async (): Promise<boolean> => {
  const token = getAuthToken();
  if (!token) return false;

  try {
 
    return token.length > 10; 
    return false;
  }
};