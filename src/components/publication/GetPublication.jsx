import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { deletePublicationRequest } from '../../api/commands/publications.js';
import './GetPublication.css';

/**
 * Muestra una card con una publicación.
 *
 * @param {{
 *  id: number,
 *  authorId: number,
 *  authorName: string,
 *  text: string,
 *  createDate: string
 * }} props Datos de la publicación
 * @returns {JSX.Element}
 */
function GetPublication({ id, authorId, authorName, text, createDate }) {
  const navigate = useNavigate();
  const { user, ensureValidAccessToken } = useAuth();
  const queryClient = useQueryClient();

  const {
    mutateAsync,
    isPending,
    error
  } = useMutation({
    mutationFn: async () => {
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para borrar la publicación');
      }
      return deletePublicationRequest(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagination'] });
    },
    onError: (err) => {
      console.error('Error al borrar publicación:', err);
    }
  });

  const isOwner = user && user.userId === authorId;

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    const confirmDelete = window.confirm('¿Seguro que quieres borrar esta publicación?');
    if (!confirmDelete) return;
    await mutateAsync();
  };

  const handleAuthorClick = () => {
    navigate(`/profile/${authorName}`);
  };

  return (
    <article className="publication-card">
      <header className="publication-header">
        <button
          type="button"
          className="publication-author"
          onClick={handleAuthorClick}
        >
          @{authorName}
        </button>
        <span className="publication-date">
          {new Date(createDate).toLocaleString()}
        </span>
      </header>
      <p className="publication-text">{text}</p>
      {isOwner && (
        <footer className="publication-footer">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="publication-delete-button"
          >
            {isPending ? 'Borrando...' : 'Borrar'}
          </button>
        </footer>
      )}
      {error && (
        <p className="error-message">
          {error.body?.message || error.message || 'Error al borrar la publicación'}
        </p>
      )}
    </article>
  );
}

GetPublication.propTypes = {
  id: PropTypes.number.isRequired,
  authorId: PropTypes.number.isRequired,
  authorName: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  createDate: PropTypes.string.isRequired
};

export default GetPublication;
