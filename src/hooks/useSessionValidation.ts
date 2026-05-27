import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { validateSession } from '@/services/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  full_name?: string;
}

export const useSessionValidation = (user: User | null, intervalMs: number = 30000) => {
  const navigate = useNavigate();

  const checkSession = useCallback(async () => {
    if (!user) return;

    try {
      const result = await validateSession(user.id);
      
      if (!result.valid) {
        // Session is invalid (user is banned)
        toast.error(result.error || 'Your session has expired. Please log in again.');
        
        // Clear user data and redirect to login
        localStorage.removeItem('user');
        navigate('/');
      }
    } catch (error) {
      console.error('Session validation error:', error);
      // Don't log out on network errors, just log the error
    }
  }, [user, navigate]);

  // Check session on mount and then periodically
  useEffect(() => {
    if (!user) return;

    // Initial check
    checkSession();

    // Set up periodic checks
    const interval = setInterval(checkSession, intervalMs);

    return () => clearInterval(interval);
  }, [checkSession, intervalMs, user]);

  // Return manual check function for immediate validation
  return { checkSession };
};