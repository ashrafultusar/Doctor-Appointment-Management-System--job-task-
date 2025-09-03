
import { User } from '@/types/auth';
import Cookies from 'js-cookie';

export const getAuthToken = (): string | undefined => {
  return Cookies.get('token');
};

export const getAuthUser = (): User | null => {
  try {
    const userStr = Cookies.get('user');
    if (userStr && userStr !== 'undefined') {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
};

export const setAuthData = (token: string, user: User): void => {
  Cookies.set('token', token, { expires: 7 });
  Cookies.set('user', JSON.stringify(user), { expires: 7 });
};

export const clearAuthData = (): void => {
  Cookies.remove('token');
  Cookies.remove('user');
};