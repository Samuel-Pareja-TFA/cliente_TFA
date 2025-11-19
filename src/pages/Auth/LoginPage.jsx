import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Página de inicio de sesión.
 *
 * @returns {JSX.Element}
 */
function LoginPage() {
  const { login, loading, error, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login({
        username: form.username,
        password: form.password
      });
      navigate('/');
    } catch {
      // El error ya se gestiona en el contexto (error en rojo)
    }
  };

  return (
    <div className="page-container auth-page">
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="username">
          Usuario
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="password">
          Contraseña
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p>
        ¿No tienes cuenta?{' '}
        <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
}

export default LoginPage;