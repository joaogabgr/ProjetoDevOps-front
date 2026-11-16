import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/** Páginas que exigem login (RF9 R5): sem sessão, vai para o login e volta depois. */
export function RequireAuth() {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
