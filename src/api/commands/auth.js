import { apiFetch } from '../client.js';

/**
 * Respuesta de autenticación devuelta por el backend
 * 
 * @typedef {Object} AuthResponseDTO
 * @property {string} token_type Tipo de token, normalmente "Bearer"
 * @property {string} access_token JWT de acceso de corta duración
 * @property {number} expires_in Segundos hasta que expira el access token
 * @property {string} refresh_token JWT de refresco de larga duración
 * @property {string} [scope] Alcance del token (si aplica)
 */

/**
 * Realiza una petición de login contra la API.
 * Lanza la petición de login contra /api/v1/auth/login.
 *
 * @param {{username:string,password:string}} credentials
 * @returns {Promise<AuthResponseDTO>}
 */
export function loginRequest(credentials) {
  return apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

/**
 * Registra un nuevo usuario en la API.
 * Lanza la petición de registro contra /api/v1/auth/register.
 *
 * El backend espera:
 * - username (string)
 * - password (string)
 * - email (string)
 * - description (string opcional)
 *
 * @param {{username:string,password:string,email:string,description?:string}} data
 * @returns {Promise<AuthResponseDTO>}
 */
export function registerRequest(data) {
  return apiFetch('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Obtiene los datos del usuario autenticado usando el access token.
 * Solicita un nuevo access token a partir de un refresh token.
 *
 * Endpoint backend:
 *   POST /api/v1/auth/refresh
 *
 * @param {string} refreshToken Refresh token previamente emitido
 * @returns {Promise<AuthResponseDTO>}
 */
export function refreshRequest(refreshToken) {
  return apiFetch('/api/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });
}

/**
 * Obtiene la información del usuario autenticado (/api/v1/auth/me).
 *
 * @param {string} accessToken JWT de acceso
 * @returns {Promise<{
 *   userId:number,
 *   username:string,
 *   email:string,
 *   description:string,
 *   createDate:string
 * }>}
 */
export function fetchMe(accessToken) {
  return apiFetch('/api/v1/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}