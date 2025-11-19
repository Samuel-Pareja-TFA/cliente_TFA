import { apiFetch } from '../client.js';

/**
 * Da like a una publicación.
 *
 * @param {number} publicationId
 * @param {number} userId
 * @param {string} token
 */
export function likePublicationRequest(publicationId, userId, token) {
  return apiFetch(`/api/v1/likes/${publicationId}/user/${userId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Quita el like de una publicación.
 *
 * @param {number} publicationId
 * @param {number} userId
 * @param {string} token
 */
export function unlikePublicationRequest(publicationId, userId, token) {
  return apiFetch(`/api/v1/likes/${publicationId}/user/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Obtiene el número de likes de una publicación.
 *
 * @param {number} publicationId
 */
export function fetchLikesCount(publicationId) {
  return apiFetch(`/api/v1/likes/${publicationId}/count`);
}