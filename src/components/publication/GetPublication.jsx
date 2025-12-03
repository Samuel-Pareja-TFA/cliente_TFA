import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { deletePublicationRequest } from '../../api/commands/publications.js';
import {
  getLikesCountRequest,
  likePublicationRequest,
  unlikePublicationRequest
} from '../../api/commands/likes.js';
import './GetPublication.css';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

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

  // Ref para animación de scroll
  const revealRef = useScrollReveal();

  // Estado local: si el usuario (en esta sesión) tiene like en esta publicación
  // Nota: sin endpoint específico de "hasLiked", asumimos que empieza en false
  const [liked, setLiked] = useState(false);

  // 1) Mutación para borrar publicación (ya existente, sólo renombramos variables)
  const {
    mutateAsync: deleteMutateAsync,
    isPending: isDeleting,
    error: deleteError
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
    await deleteMutateAsync();
  };

  const handleAuthorClick = () => {
    navigate(`/profile/${authorName}`);
  };

  // 2) Número de likes (público)
  const { data: likesCountData } = useQuery({
    queryKey: ['likesCount', id],
    queryFn: () => getLikesCountRequest(id)
  });

  const likesCount = likesCountData ?? 0;

  // 3) Mutaciones para dar / quitar like
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Debes iniciar sesión para dar like');
      }
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para dar like');
      }
      return likePublicationRequest(id, user.userId, token);
    },
    onSuccess: () => {
      setLiked(true);
      queryClient.invalidateQueries({ queryKey: ['likesCount', id] });
    },
    onError: (err) => {
      console.error('Error al dar like:', err);
    }
  });

  const unlikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Debes iniciar sesión para quitar el like');
      }
      const token = await ensureValidAccessToken();
      if (!token) {
        throw new Error('No hay token válido para quitar el like');
      }
      return unlikePublicationRequest(id, user.userId, token);
    },
    onSuccess: () => {
      setLiked(false);
      queryClient.invalidateQueries({ queryKey: ['likesCount', id] });
    },
    onError: (err) => {
      console.error('Error al quitar like:', err);
    }
  });

  const isLikeLoading = likeMutation.isPending || unlikeMutation.isPending;
  const likeError = likeMutation.error || unlikeMutation.error;

  const handleToggleLike = async () => {
    if (!user) {
      // eslint-disable-next-line no-alert
      window.alert('Debes iniciar sesión para dar like a una publicación.');
      return;
    }

    if (liked) {
      await unlikeMutation.mutateAsync();
    } else {
      await likeMutation.mutateAsync();
    }
  };

  return (
    <article
      ref={revealRef}
      className="publication-card scroll-reveal"
    >
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

      <footer className="publication-footer">
        {/* Botón de like: corazón + contador */}
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={isLikeLoading}
          className={
            liked
              ? 'publication-like-button publication-like-button--liked'
              : 'publication-like-button publication-like-button--unliked'
          }
        >
          <span className="publication-like-heart">♥</span>
          <span className="publication-like-count">{likesCount}</span>
        </button>

        {/* Botón de borrar sólo para el dueño */}
        {isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="publication-delete-button"
          >
            {isDeleting ? 'Borrando...' : 'Borrar'}
          </button>
        )}
      </footer>

      {/* Errores */}
      {deleteError && (
        <p className="error-message">
          {deleteError.body?.message ||
            deleteError.message ||
            'Error al borrar la publicación'}
        </p>
      )}

      {likeError && (
        <p className="error-message">
          {likeError.body?.message ||
            likeError.message ||
            'Error al actualizar el like'}
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
