
import { useQuery } from '@tanstack/react-query';
import { validateToken } from '@/utils/cookies';

export const useProtectedQuery = (queryKey: any[], queryFn: any, options = {}) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const isValid = await validateToken();
      if (!isValid) {
        throw new Error('Invalid authentication token');
      }
      return queryFn();
    },
    retry: (failureCount, error: any) => {
     
      if (error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
};