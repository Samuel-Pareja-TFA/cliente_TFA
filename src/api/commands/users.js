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