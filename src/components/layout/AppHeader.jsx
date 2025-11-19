import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import './AppHeader.css';

/**
 * Cabecera de la aplicación:
 * - Nombre de la red social (izquierda)
 * - Navegación (centro)
 * - Usuario logueado + logout (derecha)
 */
export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header__left">
        <Link to="/">MiniTwitterTFA</Link>
      </div>

      {user && (
        <nav className="app-header__center">
          <NavLink to="/" end>
            Timeline
          </NavLink>
          <NavLink to="/all">Todos</NavLink>
          <NavLink to="/me">Mi perfil</NavLink>
        </nav>
      )}

      <div className="app-header__right">
        {user ? (
          <>
            <span>@{user.username}</span>
            <button type="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Registro</NavLink>
          </>
        )}
      </div>
    </header>
  );
}