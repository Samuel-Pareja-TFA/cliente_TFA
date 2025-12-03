import { apiFetch } from '../client.js';

/**
 * Obtiene el timeline de publicaciones de los usuarios a los que sigue un usuario.
 *
 * @param {number} userId
 * @param {number} [page=0]
 * @param {string} token
 */
export function fetchTimeline(userId, page = 0, token) {
  return apiFetch(`/api/v1/publications/timeline/${userId}?page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Obtiene todas las publicaciones (ruta /all de la app).
 *
 * @param {number} [page=0]
 * @param {string} token
 */
export function fetchAllPublications(page = 0, token) {
  return apiFetch(`/api/v1/publications?page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Obtiene las publicaciones de un usuario concreto.
 *
 * @param {number} userId
 * @param {number} [page=0]
 * @param {string} [token]
 */
export function fetchPublicationsByUser(userId, page = 0, token) {
  return apiFetch(`/api/v1/publications/user/${userId}?page=${page}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined
  });
}

/**
 * Crea una nueva publicación para el usuario autenticado.
 *
 * @param {string} text Contenido de la publicación (máx. 280 caracteres)
 * @param {string} token JWT de acceso del usuario
 * @returns {Promise<{id:number, text:string, createDate:string}>} Publicación creada
 */
export function createPublicationRequest(text, token) {
  return apiFetch('/api/v1/publications', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text })
  });
}

/**
 * Elimina una publicación existente.
 * Elimina una publicación por id.
 *
 * @param {number} publicationId ID de la publicación a borrar
 * @param {string} token JWT de acceso del usuario
 * @returns {Promise<null>} No devuelve cuerpo (204 No Content)
 */
export function deletePublicationRequest(publicationId, token) {
  return apiFetch(`/api/v1/publications/${publicationId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}