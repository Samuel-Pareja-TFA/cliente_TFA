import { apiFetch } from '../client.js';

/**
 * Obtiene un usuario por su username usando
 * GET /api/v1/users/by-username/{username}
 *
 * @param {string} username nombre de usuario
 * @returns {Promise<{userId:number,username:string,email:string,description:string,createDate:string,roleName:string}>}
 */
export function fetchUserByUsername(username) {
  return apiFetch(`/api/v1/users/by-username/${encodeURIComponent(username)}`);
}

/**
 * Actualiza el username de un usuario.
 * PATCH /api/v1/users/{userId}/username
 *
 * @param {number} userId ID del usuario a actualizar
 * @param {string} newUsername Nuevo nombre de usuario
 * @param {string} token JWT de acceso del usuario
 * @returns {Promise<{userId:number, username:string, email:string, description?:string, createDate:string}>}
 */
export function updateUsernameRequest(userId, newUsername, token) {
  return apiFetch(`/api/v1/users/${userId}/username`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ username: newUsername })
  });
}

/**
 * Obtiene los datos de un usuario a partir de su username público.
 *
 * Llama a: GET /api/v1/users/by-username/{username}
 *
 * @param {string} username Nombre de usuario (nickname)
 * @returns {Promise<{userId:number, username:string, email:string, description?:string, createDate:string}>}
 */
export function getUserByUsernameRequest(username) {
  // Reutilizamos la función existente para no duplicar lógica
  return fetchUserByUsername(username);
}

/**
 * Obtiene el número total de seguidores (followers) de un usuario.
 *
 * Llama a: GET /api/v1/users/{userId}/followers?page=0&size=1
 *
 * @param {number} userId ID del usuario
 * @param {string} token JWT de acceso del usuario logueado
 * @returns {Promise<number>} Número total de seguidores
 */
export async function getFollowersCountRequest(userId, token) {
  const page = await apiFetch(`/api/v1/users/${userId}/followers?page=0&size=1`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return page.totalElements ?? 0;
}

/**
 * Obtiene el número total de seguidos (following) de un usuario.
 *
 * Llama a: GET /api/v1/users/{userId}/following?page=0&size=1
 *
 * @param {number} userId ID del usuario
 * @param {string} token JWT de acceso del usuario logueado
 * @returns {Promise<number>} Número total de seguidos
 */
export async function getFollowingCountRequest(userId, token) {
  const page = await apiFetch(`/api/v1/users/${userId}/following?page=0&size=1`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return page.totalElements ?? 0;
}

/**
 * Hace que un usuario (follower) siga a otro usuario (followed).
 *
 * Llama a: POST /api/v1/follows/{followerId}/follow/{followedId}
 *
 * @param {number} followerId ID del usuario que sigue (usuario logueado)
 * @param {number} followedId ID del usuario al que se quiere seguir
 * @param {string} token JWT de acceso del usuario logueado
 * @returns {Promise<any>} Respuesta de la API (puede ser un DTO o vacío)
 */
export function followUserRequest(followerId, followedId, token) {
  return apiFetch(`/api/v1/follows/${followerId}/follow/${followedId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Hace que un usuario (follower) deje de seguir a otro usuario (followed).
 *
 * Llama a: DELETE /api/v1/follows/{followerId}/follow/{followedId}
 *
 * @param {number} followerId ID del usuario que deja de seguir (usuario logueado)
 * @param {number} followedId ID del usuario al que se deja de seguir
 * @param {string} token JWT de acceso del usuario logueado
 * @returns {Promise<any>} Respuesta de la API (puede ser un DTO o vacío)
 */
export function unfollowUserRequest(followerId, followedId, token) {
  return apiFetch(`/api/v1/follows/${followerId}/follow/${followedId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}