import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';

/**
 * Route guard shared by every admin page: redirects to the login or PIN
 * screen when the session is missing, and returns `ready` so the page can
 * render nothing until the redirect happens.
 */
export function useAdminGuard(): { ready: boolean; logout: () => void } {
  const navigate = useNavigate();
  const { isAuthenticated, pinVerified, logout } = useAdminStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    } else if (!pinVerified) {
      navigate('/admin/pin');
    }
  }, [isAuthenticated, pinVerified, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return { ready: isAuthenticated && pinVerified, logout: handleLogout };
}
