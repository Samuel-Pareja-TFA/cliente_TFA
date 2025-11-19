import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Hook de conveniencia para acceder al contexto de autenticación.
 *
 * @returns {import('../context/AuthContext.jsx').AuthContextValue} Valores y acciones de autenticación
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return ctx;
}