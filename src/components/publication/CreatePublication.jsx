import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
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
  const [text, setText] = useState('');
  const { user, ensureValidAccessToken } = useAuth();
  const queryClient = useQueryClient();

  const {
    mutateAsync,
    isPending,
    error
  } = useMutation({
    mutationFn: async (content) => {
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para crear la publicación');
      }
      return createPublicationRequest(content, token);
    },
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['pagination'] });
      if (onCreated) onCreated();
    },
    onError: (err) => {
      console.error('Error al crear publicación:', err);
    }
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    if (!user) return;

    await mutateAsync(text.trim());
  };

  return (
    <div className="create-publication-card">
      <h2>Crear publicación</h2>
      <form onSubmit={handleSubmit} className="create-publication-form">
        <textarea
          maxLength={280}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="¿Qué estás pensando?"
          className="create-publication-textarea"
        />
        <div className="create-publication-footer">
          <span className="char-counter">{text.length}/280</span>
          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className="create-publication-button"
          >
            {isPending ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
        {error && (
          <p className="error-message">
            {error.body?.message || error.message || 'Error al crear la publicación'}
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
