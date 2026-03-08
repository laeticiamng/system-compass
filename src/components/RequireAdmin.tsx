import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

interface RequireAdminProps {
  children: ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading } = useUserRoles();
  const location = useLocation();
  const { localizedPath } = useLocalizedPath();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={localizedPath('/auth')} replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to={localizedPath('/')} replace />;
  }

  return <>{children}</>;
}
