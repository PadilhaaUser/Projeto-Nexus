import { Navigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';

/**
 * Rota protegida exclusiva para administradores.
 * Colaboradores são redirecionados para a página inicial.
 */
export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useRole();

  if (loading) return null; // Ou um spinner de loading se preferir

  return isAdmin ? children : <Navigate to="/" replace />;
}
