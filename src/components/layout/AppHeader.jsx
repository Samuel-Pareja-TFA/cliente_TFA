import React, { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import './AppHeader.css';
import { gsap } from 'gsap';

/**
 * Cabecera de la aplicación:
 * - Nombre de la red social (izquierda)
 * - Navegación (centro)
 * - Usuario logueado + logout (derecha)
 */
export function AppHeader() {
  const { user, logout } = useAuth();

  // 🔹 Referencia al nombre de la marca
  const brandRef = useRef(null);
  const brandText = "MiniTwitterTFA";

  // 🔹 Animación con GSAP al montar el componente
  useEffect(() => {
    const letters = brandRef.current?.querySelectorAll('.brand-letter');
    if (!letters || letters.length === 0) return;

    gsap.fromTo(
      letters,
      { y: -20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: 'back.out(1.7)'
      }
    );
  }, []);

  // 🔹 Animación al pasar el ratón por encima
  const handleHover = () => {
    const letters = brandRef.current?.querySelectorAll('.brand-letter');
    if (!letters || letters.length === 0) return;

    gsap.fromTo(
      letters,
      { y: -10, opacity: 0.7 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.03,
        ease: 'back.out(2)'
      }
    );
  };

  return (
    <header className="app-header">
      <div className="app-header__left">
        <Link
          to="/"
          ref={brandRef}
          onMouseEnter={handleHover}
          style={{ display: "inline-block" }}
        >
          {brandText.split("").map((letter, index) => (
            <span key={index} className="brand-letter">
              {letter}
            </span>
          ))}
        </Link>
      </div>

      {user && (
        <nav className="app-header__nav">
          <div className="app-header__nav-item">
            <NavLink to="/">Timeline</NavLink>
          </div>
          <div className="app-header__nav-item">
            <NavLink to="/all">Todos</NavLink>
          </div>
          <div className="app-header__nav-item">
            <NavLink to="/me">Mi perfil</NavLink>
          </div>
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