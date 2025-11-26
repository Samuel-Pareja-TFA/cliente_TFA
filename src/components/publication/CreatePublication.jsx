import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth.js';
import { createPublicationRequest } from '../../api/commands/publications.js';
import './CreatePublication.css';

/**
 * Formulario para crear una nueva publicación.
 *
 * @param {{ onCreated?: () => void }} props Callback opcional al crear correctamente
 * @returns {JSX.Element}
 */
function CreatePublication({ onCreated }) {
  const { user, ensureValidAccessToken } = useAuth();
  const queryClient = useQueryClient();

  // React Hook Form se encarga del estado del formulario y la validación
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      text: ''
    }
  });

  // Valor actual del textarea para el contador de caracteres y el botón
  const textValue = watch('text', '');

  const {
    mutateAsync,
    isPending,
    error
  } = useMutation({
    // content será el texto ya limpio que le pasemos desde onSubmit
    mutationFn: async (content) => {
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para crear la publicación');
      }
      return createPublicationRequest(content, token);
    },
    onSuccess: () => {
      // Limpiar textarea desde React Hook Form
      reset({ text: '' });
      // Invalidar la query de paginación para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['pagination'] });
      if (onCreated) onCreated();
    },
    onError: (err) => {
      console.error('Error al crear publicación:', err);
    }
  });

  const onSubmit = async (data) => {
    // data = { text: '...' } viene validado por React Hook Form
    if (!user) return;
    const cleanText = data.text.trim();
    if (!cleanText) return;
    await mutateAsync(cleanText);
  };

  return (
    <div className="create-publication-card">
      <h2>Crear publicación</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="create-publication-form"
      >
        <textarea
          maxLength={280}
          placeholder="¿Qué estás pensando?"
          className="create-publication-textarea"
          // Conectamos el campo "text" con React Hook Form y añadimos validaciones
          {...register('text', {
            required: 'El texto de la publicación es obligatorio',
            minLength: {
              value: 3,
              message: 'La publicación debe tener al menos 3 caracteres'
            },
            maxLength: {
              value: 280,
              message: 'La publicación no puede superar los 280 caracteres'
            }
          })}
        />

        {/* Errores de validación del formulario (React Hook Form) */}
        {errors.text && (
          <p className="error-message">
            {errors.text.message}
          </p>
        )}

        <div className="create-publication-footer">
          <span className="char-counter">{textValue.length}/280</span>
          <button
            type="submit"
            disabled={
              isPending ||
              isSubmitting ||
              !textValue.trim()
            }
            className="create-publication-button"
          >
            {isPending || isSubmitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>

        {/* Error de la petición HTTP */}
        {error && (
          <p className="error-message">
            {error.body?.message ||
              error.message ||
              'Error al crear la publicación'}
          </p>
        )}
      </form>
    </div>
  );
}

CreatePublication.propTypes = {
  onCreated: PropTypes.func
};

CreatePublication.defaultProps = {
  onCreated: undefined
};

export default CreatePublication;
