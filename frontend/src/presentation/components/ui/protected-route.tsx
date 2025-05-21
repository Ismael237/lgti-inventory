import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AuthStatus } from '@hooks/use-auth';
import { LoadingSpinner } from './loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectPath = '/login',
  requireAuth = true,
}) => {
  const { status, authenticate } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await authenticate();
      setIsChecking(false);
    };

    if(requireAuth){
      verifyAuth();
    }
  }, [authenticate, requireAuth]);

  if (requireAuth && (isChecking || status === AuthStatus.Unknown)) {
    return <LoadingSpinner text="Vérification de l'authentification..." />;
  }

  const isAuthenticated = status === AuthStatus.Authenticated;

  if (requireAuth && !isAuthenticated) {
    // User is not authenticated but the route requires authentication
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // User is authenticated but the route requires a guest (e.g. login page)
    return <Navigate to="/" replace />;
  }

  // User meets the auth requirements for this route
  return <>{children}</>;
};