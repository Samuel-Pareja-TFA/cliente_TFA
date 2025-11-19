import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Página de registro de usuario.
 *
 * @returns {JSX.Element}
 */
function RegisterPage() {
  const { register, loading, error, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    description: ''
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
      await register(form);
      navigate('/');
    } catch {
      // error ya gestionado en el contexto
    }
  };

  return (
    <div className="page-container auth-page">
      <h1>Registro</h1>
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

        <label htmlFor="email">
          Email
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
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

        <label htmlFor="description">
          Descripción (opcional)
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </label>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p>
        ¿Ya tienes cuenta?{' '}
        <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </div>
  );
}

export default RegisterPage;