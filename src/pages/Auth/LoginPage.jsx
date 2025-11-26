import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Página de inicio de sesión.
 *
 * @returns {JSX.Element}
 */
function LoginPage() {
  const { login, loading, error, user } = useAuth();
  const navigate = useNavigate();

  // React Hook Form para gestionar el formulario de login
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    try {
      await login({
        username: data.username,
        password: data.password
      });
      navigate('/');
    } catch {
      // El error ya se gestiona en el contexto (error en rojo)
    }
  };

  return (
    <div className="page-container auth-page">
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <label htmlFor="username">
          Usuario
          <input
            id="username"
            type="text"
            // name lo dejamos por semántica, pero React Hook Form usa el de register
            {...register('username', {
              required: 'El usuario es obligatorio'
            })}
          />
        </label>
        {errors.username && (
          <p className="error-message">{errors.username.message}</p>
        )}

        <label htmlFor="password">
          Contraseña
          <input
            id="password"
            type="password"
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 3,
                message: 'La contraseña debe tener al menos 3 caracteres'
              }
            })}
          />
        </label>
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading || isSubmitting}>
          {loading || isSubmitting ? 'Entrando...' : 'Entrar'}
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