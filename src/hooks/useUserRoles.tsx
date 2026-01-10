import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type UserRole = 'admin' | 'moderator' | 'user';

interface UserRoleData {
  id: string;
  userId: string;
  role: UserRole;
  createdAt: string;
}

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  const fetchRoles = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setIsAdmin(false);
      setIsModerator(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        // Table might not exist or access denied - fail gracefully
        console.warn('Could not fetch user roles:', error.message);
        setRoles(['user']);
        setIsAdmin(false);
        setIsModerator(false);
        setIsLoading(false);
        return;
      }

      const userRoles = (data || []).map((r) => r.role as UserRole);
      // Default to 'user' role if no roles found
      const effectiveRoles = userRoles.length > 0 ? userRoles : ['user' as UserRole];
      setRoles(effectiveRoles);
      setIsAdmin(effectiveRoles.includes('admin'));
      setIsModerator(effectiveRoles.includes('moderator') || effectiveRoles.includes('admin'));
    } catch (err) {
      console.error('Error fetching user roles:', err);
      // Fail gracefully with default user role
      setRoles(['user']);
      setIsAdmin(false);
      setIsModerator(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const hasRole = useCallback((role: UserRole): boolean => {
    return roles.includes(role);
  }, [roles]);

  const hasAnyRole = useCallback((requiredRoles: UserRole[]): boolean => {
    return requiredRoles.some((role) => roles.includes(role));
  }, [roles]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    isLoading,
    isAdmin,
    isModerator,
    hasRole,
    hasAnyRole,
    refreshRoles: fetchRoles,
  };
}
