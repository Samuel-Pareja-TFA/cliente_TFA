// src/api/commands/likes.js
import { apiFetch } from '../client.js';

/**
 * Obtiene el número de likes de una publicación.
 *
 * Llama a: GET /api/v1/likes/{publicationId}/count
 *
 * @param {number} publicationId ID de la publicación
 * @returns {Promise<number>} número total de likes
 */
export async function getLikesCountRequest(publicationId) {
  const data = await apiFetch(`/api/v1/likes/${publicationId}/count`);

  if (typeof data === 'number') {
    return data;
  }
  if (typeof data === 'string' && !Number.isNaN(Number(data))) {
    return Number(data);
  }
  if (data && typeof data.count === 'number') {
    return data.count;
  }
  return 0;
}

/**
 * Da like a una publicación para un usuario concreto.
 *
 * Llama a: POST /api/v1/likes/{publicationId}/user/{userId}
 *
 * @param {number} publicationId ID de la publicación
 * @param {number} userId ID del usuario que da like
 * @param {string} token JWT de acceso
 * @returns {Promise<any>}
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
 * Quita el like de una publicación para un usuario concreto.
 *
 * Llama a: DELETE /api/v1/likes/{publicationId}/user/{userId}
 *
 * @param {number} publicationId ID de la publicación
 * @param {number} userId ID del usuario
 * @param {string} token JWT de acceso
 * @returns {Promise<any>}
 */
export function unlikePublicationRequest(publicationId, userId, token) {
  return apiFetch(`/api/v1/likes/${publicationId}/user/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
