import { apiFetch } from '../client.js';

/**
 * Obtiene los comentarios de una publicación.
 *
 * @param {number} publicationId
 */
export function fetchCommentsByPublication(publicationId) {
  return apiFetch(`/api/v1/comments/publication/${publicationId}`);
}

/**
 * Crea un comentario en una publicación.
 *
 * @param {number} publicationId
 * @param {number} userId
 * @param {string} text
 * @param {string} token
 */
export function createCommentRequest(publicationId, userId, text, token) {
  return apiFetch(
    `/api/v1/comments/publication/${publicationId}/user/${userId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    }
  );
}

/**
 * Elimina un comentario.
 *
 * @param {number} commentId
 * @param {number} userId
 * @param {string} token
 */
export function deleteCommentRequest(commentId, userId, token) {
  return apiFetch(`/api/v1/comments/${commentId}/user/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}