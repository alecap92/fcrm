import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const publicRoutes = ['/login', '/register', '/forgot-password'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated && !publicRoutes.includes(location.pathname)) {
      navigate('/login', { replace: true });
    } else if (isAuthenticated && publicRoutes.includes(location.pathname)) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return <>{children}</>;
}