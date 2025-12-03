import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth.js';


/**
 * Página de registro de usuario.
 *
 * @returns {JSX.Element}
 */
function RegisterPage() {
  const { register: registerUser, loading, error, user } = useAuth();
  const navigate = useNavigate();

  // React Hook Form para gestionar el formulario de registro
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      description: ''
    }
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/');
    } catch {
      // error ya gestionado en el contexto
    }
  };

  return (
    <div className="page-container auth-page">
      <h1>Registro</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <label htmlFor="username">
          Usuario
          <input
            id="username"
            type="text"
            {...register('username', {
              required: 'El usuario es obligatorio',
              minLength: {
                value: 3,
                message: 'El usuario debe tener al menos 3 caracteres'
              }
            })}
          />
        </label>
        {errors.username && (
          <p className="error-message">{errors.username.message}</p>
        )}

        <label htmlFor="email">
          Email
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'El email es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'El email no tiene un formato válido'
              }
            })}
          />
        </label>
        {errors.email && (
          <p className="error-message">{errors.email.message}</p>
        )}

        <label htmlFor="password">
          Contraseña
          <input
            id="password"
            type="password"
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
              }
            })}
          />
        </label>
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}

        <label htmlFor="description">
          Descripción (opcional)
          <textarea
            id="description"
            {...register('description', {
              maxLength: {
                value: 280,
                message: 'La descripción no puede superar los 280 caracteres'
              }
            })}
          />
        </label>
        {errors.description && (
          <p className="error-message">{errors.description.message}</p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading || isSubmitting}>
          {loading || isSubmitting ? 'Registrando...' : 'Registrarse'}
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