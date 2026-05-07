import { useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index.js';

/**
 * Redirect admins to the internal back-office routes.
 */
export function AdminRedirect() {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return;
    }

    const currentPath = location.pathname;
    const isAlreadyInAdminArea = currentPath.startsWith('/admin');
    const isOnAuthPage = currentPath.startsWith('/authentication') || currentPath.startsWith('/auth');
    const isGenericHome = currentPath === '/' || currentPath === '/dashboard';

    if (isAlreadyInAdminArea || isOnAuthPage) {
      return;
    }

    if (isGenericHome) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  return null;
}
