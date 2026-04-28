import { useAuth } from './useAuth';

// Email do administrador principal — qualquer outro usuário é colaborador
const ADMIN_EMAIL = 'admin@agrourb.com.br';

/**
 * Retorna o papel do usuário logado.
 * isAdmin: true  → acesso total
 * isAdmin: false → acesso restrito (Clientes + Orçamentos)
 */
export function useRole() {
  const { currentUser, loading } = useAuth();
  const isAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  return {
    role: isAdmin ? 'admin' : 'colaborador',
    isAdmin,
    isColaborador: !isAdmin,
    loading,
  };
}
